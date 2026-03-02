import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

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

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-user-id'],
  });

  const port = process.env.PORT || 3101;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  console.log(`\nPost API running at http://localhost:${port}`);
  console.log(`           (LAN) at http://192.168.102.138:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/swagger\n`);
  console.log(
  '\nMongo URI> changes: ', 
  process.env.MONGO_URI || '',
);
}
bootstrap();
