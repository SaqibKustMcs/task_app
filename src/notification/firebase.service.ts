import { Injectable, OnModuleInit } from '@nestjs/common';

export interface FcmPayload {
  title: string;
  body?: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private messaging: import('firebase-admin').messaging.Messaging | null = null;
  private initialized = false;

  async onModuleInit() {
    await this.init();
  }

  private async init(): Promise<void> {
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!path) return;
    try {
      const admin = await import('firebase-admin');
      if (admin.apps.length === 0) {
        const fs = await import('fs');
        const json = fs.readFileSync(path, 'utf8');
        const serviceAccount = JSON.parse(json);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      }
      this.messaging = admin.messaging();
      this.initialized = true;
    } catch (_) {
      // FCM optional: in-app notifications still work
    }
  }

  /** Send FCM to a single token. No-op if Firebase not initialized. */
  async sendToToken(token: string, payload: FcmPayload): Promise<boolean> {
    if (!this.initialized || !this.messaging) return false;
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

  /** Send same message to multiple tokens (e.g. user's devices). */
  async sendToTokens(tokens: string[], payload: FcmPayload): Promise<void> {
    if (!this.initialized || !this.messaging || tokens.length === 0) return;
    const validTokens = tokens.filter((t) => t && t.trim().length > 0);
    if (validTokens.length === 0) return;
    try {
      await this.messaging.sendEachForMulticast({
        tokens: validTokens,
        notification: { title: payload.title, body: payload.body ?? '' },
        data: payload.data ?? {},
      });
    } catch (_) {}
  }
}
