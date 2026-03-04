import { Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

export interface FcmPayload {
  title: string;
  body?: string;
  data?: Record<string, string>;
}

export interface SendToTokensResult {
  successCount: number;
  failureCount: number;
  failedTokenIndices: number[];
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private messaging: import('firebase-admin').messaging.Messaging | null = null;
  private initialized = false;

  async onModuleInit() {
    await this.init();
  }

  private resolveCredentialsPath(envPath: string): string {
    if (path.isAbsolute(envPath)) return envPath;
    return path.resolve(process.cwd(), envPath);
  }

  private async init(): Promise<void> {
    try {
      const admin = await import('firebase-admin');
      if (admin.apps.length === 0) {
        // Prefer env var JSON for hosted environments (Render, etc.)
        const jsonFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
        const base64FromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();

        let serviceAccount: any = null;
        if (jsonFromEnv) {
          serviceAccount = JSON.parse(jsonFromEnv);
        } else if (base64FromEnv) {
          const decoded = Buffer.from(base64FromEnv, 'base64').toString('utf8');
          serviceAccount = JSON.parse(decoded);
        } else {
          // Fallback to GOOGLE_APPLICATION_CREDENTIALS file path (local/dev)
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
    } catch (e) {
      console.warn('[FCM] Init failed:', e);
    }
  }

  /** Send FCM to a single token. No-op if Firebase not initialized. */
  async sendToToken(token: string, payload: FcmPayload): Promise<boolean> {
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
    } catch (_) {
      return false;
    }
  }

  /** Send same message to multiple tokens. Returns success/failure counts and indices of failed tokens. */
  async sendToTokens(
    tokens: string[],
    payload: FcmPayload,
  ): Promise<SendToTokensResult> {
    const result: SendToTokensResult = { successCount: 0, failureCount: 0, failedTokenIndices: [] };
    if (!this.initialized || !this.messaging) {
      console.warn('[FCM] Not initialized, skipping sendToTokens');
      return result;
    }
    if (tokens.length === 0) return result;
    const validTokens = tokens.filter((t) => t && typeof t === 'string' && t.trim().length > 0);
    if (validTokens.length === 0) return result;
    try {
      const batch = await this.messaging.sendEachForMulticast({
        tokens: validTokens,
        notification: { title: payload.title, body: payload.body ?? '' },
        data: payload.data ?? {},
      });
      result.successCount = batch.successCount;
      result.failureCount = batch.failureCount;
      batch.responses.forEach((resp, idx) => {
        if (!resp.success) result.failedTokenIndices.push(idx);
      });
    } catch (e) {
      console.warn('[FCM] sendToTokens error:', e);
    }
    return result;
  }
}
