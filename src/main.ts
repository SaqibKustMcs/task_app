import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Fail fast on Render/Railway if MONGO_URI is not set (avoids cryptic exit 134)
  if (!process.env.MONGO_URI?.trim()) {
    console.error('FATAL: MONGO_URI environment variable is not set.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Task APP')
    .setDescription('Task App Devbay APIs')
    .setVersion('1.0')
    .addTag('Post')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
      'access-token',
    )
    .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'x-user-id')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // CORS setup
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-user-id'],
  });

  // Render/Railway: use PORT from env and bind to 0.0.0.0
  const port = process.env.PORT || 3101;
  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);
  console.log(`Swagger UI: /swagger`);
}

bootstrap();