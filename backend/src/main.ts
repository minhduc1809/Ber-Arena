import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
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
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Ber-Arena Backend đang chạy tại: http://localhost:${port}`);
  console.log(`📖 Swagger API Docs tại: http://localhost:${port}/api`);
}
bootstrap();

