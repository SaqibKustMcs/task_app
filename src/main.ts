import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as os from 'os';
import { AppModule } from './app.module';

function getLocalNetworkUrl(port: number): string {
  const envIp = process.env.NETWORK_IP?.trim();
  if (envIp) return `http://${envIp}:${port}`;
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) return `http://${iface.address}:${port}`;
    }
  }
  return `http://localhost:${port}`;
}

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
  const port = Number(process.env.PORT) || 3101;
  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);
  const baseUrl = getLocalNetworkUrl(port);
  console.log(`Swagger UI: ${baseUrl}/swagger`);
}

bootstrap();