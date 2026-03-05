"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const os = __importStar(require("os"));
const app_module_1 = require("./app.module");
function getLocalNetworkUrl(port) {
    const envIp = process.env.NETWORK_IP?.trim();
    if (envIp)
        return `http://${envIp}:${port}`;
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal)
                return `http://${iface.address}:${port}`;
        }
    }
    return `http://localhost:${port}`;
}
async function bootstrap() {
    if (!process.env.MONGO_URI?.trim()) {
        console.error('FATAL: MONGO_URI environment variable is not set.');
        process.exit(1);
    }
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
    const port = Number(process.env.PORT) || 3101;
    await app.listen(port, '0.0.0.0');
    console.log(`Server running on port ${port}`);
    const baseUrl = getLocalNetworkUrl(port);
    console.log(`Swagger UI: ${baseUrl}/swagger`);
}
bootstrap();
//# sourceMappingURL=main.js.map