"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,
        forbidNonWhitelisted: false,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Task APP')
        .setDescription('Task App Devbay APIs')
        .setVersion('1.0')
        .addTag('Post')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' }, 'access-token')
        .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'x-user-id')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('swagger', app, document);
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-user-id'],
    });
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';
    await app.listen(port, host);
    console.log(`\nPost API running at http://localhost:${port}`);
    console.log(`           (LAN) at http://192.168.102.138:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/swagger\n`);
    console.log('\nMongo URI> changes: ', process.env.MONGO_URI || '');
}
bootstrap();
//# sourceMappingURL=main.js.map