import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('aws-sns')
  @HttpCode(HttpStatus.OK)
  async handleAwsSns(
    @Body() body: any,
    @Headers('x-amz-sns-message-type') messageType: string,
  ) {
    this.logger.log(`Received SNS message type: ${messageType}`);

    // Si el body viene como string, parsearlo
    const payload = typeof body === 'string' ? JSON.parse(body) : body;

    switch (messageType) {
      case 'SubscriptionConfirmation':
        return this.webhooksService.handleSubscriptionConfirmation(payload);

      case 'Notification':
        return this.webhooksService.handleNotification(payload);

      case 'UnsubscribeConfirmation':
        this.logger.log('Unsubscribe confirmation received');
        return { status: 'ok' };

      default:
        this.logger.warn(`Unknown message type: ${messageType}`);
        return { status: 'unknown message type' };
    }
  }
}
