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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let FirebaseService = class FirebaseService {
    messaging = null;
    initialized = false;
    async onModuleInit() {
        await this.init();
    }
    resolveCredentialsPath(envPath) {
        if (path.isAbsolute(envPath))
            return envPath;
        return path.resolve(process.cwd(), envPath);
    }
    async init() {
        try {
            const admin = await Promise.resolve().then(() => __importStar(require('firebase-admin')));
            if (admin.apps.length === 0) {
                const jsonFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
                const base64FromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
                let serviceAccount = null;
                if (jsonFromEnv) {
                    serviceAccount = JSON.parse(jsonFromEnv);
                }
                else if (base64FromEnv) {
                    const decoded = Buffer.from(base64FromEnv, 'base64').toString('utf8');
                    serviceAccount = JSON.parse(decoded);
                }
                else {
                    const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
                    if (!envPath) {
                        console.warn('[FCM] No credentials configured (set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS)');
                        return;
                    }
                    const absPath = this.resolveCredentialsPath(envPath);
                    if (!fs.existsSync(absPath)) {
                        console.warn(`[FCM] Credentials file not found: ${absPath}`);
                        return;
                    }
                    const json = fs.readFileSync(absPath, 'utf8');
                    serviceAccount = JSON.parse(json);
                }
                admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            }
            this.messaging = admin.messaging();
            this.initialized = true;
            console.log('[FCM] Initialized successfully');
        }
        catch (e) {
            console.warn('[FCM] Init failed:', e);
        }
    }
    async sendToToken(token, payload) {
        if (!this.initialized || !this.messaging) {
            console.warn('[FCM] Not initialized, skipping sendToToken');
            return false;
        }
        try {
            await this.messaging.send({
                token,
                notification: { title: payload.title, body: payload.body ?? '' },
                data: payload.data ?? {},
            });
            return true;
        }
        catch (_) {
            return false;
        }
    }
    async sendToTokens(tokens, payload) {
        const result = { successCount: 0, failureCount: 0, failedTokenIndices: [] };
        if (!this.initialized || !this.messaging) {
            console.warn('[FCM] Not initialized, skipping sendToTokens');
            return result;
        }
        if (tokens.length === 0)
            return result;
        const validTokens = tokens.filter((t) => t && typeof t === 'string' && t.trim().length > 0);
        if (validTokens.length === 0)
            return result;
        try {
            const batch = await this.messaging.sendEachForMulticast({
                tokens: validTokens,
                notification: { title: payload.title, body: payload.body ?? '' },
                data: payload.data ?? {},
            });
            result.successCount = batch.successCount;
            result.failureCount = batch.failureCount;
            batch.responses.forEach((resp, idx) => {
                if (!resp.success)
                    result.failedTokenIndices.push(idx);
            });
        }
        catch (e) {
            console.warn('[FCM] sendToTokens error:', e);
        }
        return result;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map