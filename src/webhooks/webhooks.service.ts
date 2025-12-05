import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mailing } from '../mailing/entities/mailing.entity';

interface SnsSubscriptionConfirmation {
  Type: string;
  MessageId: string;
  Token: string;
  TopicArn: string;
  Message: string;
  SubscribeURL: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
}

interface BouncedRecipient {
  emailAddress: string;
  action?: string;
  status?: string;
  diagnosticCode?: string;
}

// Ajustamos la interfaz para aceptar 'notificationType' O 'eventType'
interface BounceMessage {
  notificationType?: string;
  eventType?: string;
  bounce: {
    bounceType: string;
    bounceSubType: string;
    bouncedRecipients: BouncedRecipient[];
    timestamp: string;
    feedbackId: string;
  };
  mail: {
    timestamp: string;
    source: string;
    messageId: string;
    destination: string[];
  };
}

interface ComplaintRecipient {
  emailAddress: string;
}

// Ajustamos la interfaz para aceptar 'notificationType' O 'eventType'
interface ComplaintMessage {
  notificationType?: string;
  eventType?: string;
  complaint: {
    complainedRecipients: ComplaintRecipient[];
    timestamp: string;
    feedbackId: string;
    complaintFeedbackType?: string;
  };
  mail: {
    timestamp: string;
    source: string;
    messageId: string;
    destination: string[];
  };
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Mailing)
    private readonly mailingRepository: Repository<Mailing>,
  ) {}

  /**
   * Maneja la confirmación de suscripción de AWS SNS
   * AWS envía esto para verificar que la URL es válida
   */
  async handleSubscriptionConfirmation(
    payload: SnsSubscriptionConfirmation,
  ): Promise<{ status: string }> {
    this.logger.log('Processing SubscriptionConfirmation...');
    
    // Verificación de seguridad por si payload llega vacío o undefined
    if (!payload || !payload.SubscribeURL) {
       this.logger.error('Payload inválido para SubscriptionConfirmation');
       return { status: 'error: invalid payload' };
    }

    this.logger.log(`Topic ARN: ${payload.TopicArn}`);
    this.logger.log(`Subscribe URL: ${payload.SubscribeURL}`);

    try {
      // Hacer GET a la SubscribeURL para confirmar la suscripción
      const response = await fetch(payload.SubscribeURL);

      if (response.ok) {
        this.logger.log('✅ SNS Subscription confirmed successfully!');
        return { status: 'subscription confirmed' };
      } else {
        this.logger.error(`Failed to confirm subscription: ${response.status}`);
        return { status: 'subscription confirmation failed' };
      }
    } catch (error) {
      this.logger.error(`Error confirming subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Maneja las notificaciones de AWS SNS (bounces, complaints, etc.)
   */
  async handleNotification(payload: any): Promise<{ status: string; processed: number }> {
    this.logger.log('Processing Notification...');

    // 1. Validación inicial de payload vacío
    if (!payload || (Object.keys(payload).length === 0 && payload.constructor === Object)) {
      this.logger.error('🛑 Payload vacío recibido. Verifica express.json en main.ts');
      return { status: 'error: empty payload', processed: 0 };
    }

    let message = payload;

    // 2. Detección de mensaje envuelto (SNS Wrapping)
    // Si tiene la propiedad 'Message' como string, es un mensaje de SNS envolviendo el de SES
    if (payload.Message && typeof payload.Message === 'string') {
      try {
        message = JSON.parse(payload.Message);
      } catch (e) {
        this.logger.error('Error parsing SNS Message body string', e);
        // Si falla el parse, intentamos usar el payload original por si acaso
      }
    }
    
    // 3. Normalización del tipo de evento
    // SES envía 'notificationType' (formato viejo/estándar) O 'eventType' (formato nuevo/raw)
    const type = message.notificationType || message.eventType;
    
    this.logger.log(`Notification type detected: ${type}`);

    if (!type) {
         this.logger.error(`Formato desconocido. Keys recibidas: ${Object.keys(message).join(', ')}`);
         return { status: 'unknown format', processed: 0 };
    }

    let processedCount = 0;

    switch (type) {
      case 'Bounce':
        processedCount = await this.handleBounce(message as BounceMessage);
        break;

      case 'Complaint':
        processedCount = await this.handleComplaint(message as ComplaintMessage);
        break;

      case 'Delivery':
      case 'Send': 
        this.logger.log('Delivery/Send notification received - no action needed');
        break;

      default:
        this.logger.warn(`Unhandled notification type: ${type}`);
    }

    return { status: 'processed', processed: processedCount };
  }

  /**
   * Procesa los rebotes de correo (bounces)
   * Bloquea los emails que rebotan
   */
  private async handleBounce(message: BounceMessage): Promise<number> {
    // Verificación defensiva
    if (!message.bounce || !message.bounce.bouncedRecipients) {
      this.logger.error('Invalid Bounce message structure');
      return 0;
    }

    const { bounce } = message;
    this.logger.log(`Bounce type: ${bounce.bounceType} - ${bounce.bounceSubType}`);

    const emails = bounce.bouncedRecipients.map((r) => r.emailAddress);
    this.logger.log(`Bounced emails found: ${emails.join(', ')}`);

    let updatedCount = 0;

    for (const email of emails) {
      // IMPORTANTE: Limpiar el email (trim + lowerCase) para asegurar match en DB
      const cleanEmail = email.trim().toLowerCase();

      const result = await this.mailingRepository.update(
        { email: cleanEmail },
        { is_lock: true },
      );

      if (result.affected && result.affected > 0) {
        this.logger.log(`🔒 Locked email: ${cleanEmail}`);
        updatedCount++;
      } else {
        this.logger.warn(`Email NOT found in database: '${cleanEmail}'`);
      }
    }

    return updatedCount;
  }

  /**
   * Procesa las quejas de spam (complaints)
   * Bloquea los emails que reportan spam
   */
  private async handleComplaint(message: ComplaintMessage): Promise<number> {
     // Verificación defensiva
     if (!message.complaint || !message.complaint.complainedRecipients) {
      this.logger.error('Invalid Complaint message structure');
      return 0;
    }

    const { complaint } = message;
    this.logger.log(`Complaint type: ${complaint.complaintFeedbackType || 'unknown'}`);

    const emails = complaint.complainedRecipients.map((r) => r.emailAddress);
    this.logger.log(`Complained emails found: ${emails.join(', ')}`);

    let updatedCount = 0;

    for (const email of emails) {
      // IMPORTANTE: Limpiar el email (trim + lowerCase) para asegurar match en DB
      const cleanEmail = email.trim().toLowerCase();

      const result = await this.mailingRepository.update(
        { email: cleanEmail },
        { is_lock: true },
      );

      if (result.affected && result.affected > 0) {
        this.logger.log(`🔒 Locked email (spam complaint): ${cleanEmail}`);
        updatedCount++;
      } else {
        this.logger.warn(`Email NOT found in database: '${cleanEmail}'`);
      }
    }

    return updatedCount;
  }
}