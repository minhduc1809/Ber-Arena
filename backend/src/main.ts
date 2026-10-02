import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse Cookie để đọc Refresh Token trong HttpOnly Cookie
  app.use(cookieParser());

  // Global Validation Pipe cho DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Cho phép CORS với credentials để gửi nhận Cookie từ Frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Cấu hình Swagger OpenAPI UI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ber-Arena API')
    .setDescription('Tài liệu API nền tảng Game Chiến thuật Realtime & Sàn Đấu giá Concurrency Ber-Arena')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Ber-Arena Backend đang chạy tại: http://localhost:${port}`);
}
bootstrap();

