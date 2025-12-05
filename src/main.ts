import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express'; // <--- 1. IMPORTANTE: Importar express

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. AGREGAR ESTA LÍNEA OBLIGATORIAMENTE
  // Esto permite que NestJS lea el body cuando AWS lo manda como text/plain
  app.use(express.json({ type: ['application/json', 'text/plain'] }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Mailing API running on port ${port}`);
}

bootstrap();