# 🌐 Network Configuration Guide

## Quick Setup - Change IP in ONE Place

### 1️⃣ Backend Configuration

**File: `.env`**

Change this **ONE** variable:

```env
NETWORK_IP=192.168.18.32  # ⚠️ CHANGE THIS TO YOUR MACHINE'S IP
```

All these variables will automatically update when you change `NETWORK_IP`:

```env
# Server Configuration
PORT=3101
HOST=0.0.0.0
NETWORK_IP=192.168.18.32  # 👈 CHANGE HERE

# WebSocket Configuration
WEBSOCKET_PORT=3101
WEBSOCKET_HOST=0.0.0.0
WEBSOCKET_NETWORK_IP=192.168.18.32  # 👈 Keep same as NETWORK_IP

# CORS Configuration
CORS_ORIGIN=http://192.168.18.32:3101,http://localhost:3101

# API Base URL
API_BASE_URL=http://192.168.18.32  # 👈 Keep same as NETWORK_IP

# Media Upload URL
URL=http://192.168.18.32:3101/  # 👈 Keep same as NETWORK_IP
```

### 2️⃣ Frontend Configuration

**File: `cloth_shop_flutter/lib/Constants/api_constants.dart`**

Update to match your `.env` NETWORK_IP:

```dart
class ApiConstants {
  static const String baseUrl = 'http://192.168.18.32:3101';  // 👈 Match NETWORK_IP
  static const String wsUrl = 'ws://192.168.18.32:3101';      // 👈 Match NETWORK_IP
}
```

---

## 🔍 How to Find Your Machine's IP Address

### macOS
1. Open **System Settings** > **Network**
2. Click on your **Wi-Fi** or **Ethernet** connection
3. Click **Details**
4. Look for **IP Address** (e.g., `192.168.1.100`)

**Terminal Command:**
```bash
ipconfig getifaddr en0  # For Wi-Fi
# or
ipconfig getifaddr en1  # For Ethernet
```

### Windows
1. Open **Command Prompt**
2. Run: `ipconfig`
3. Look for **IPv4 Address** under your active network adapter

### Linux
```bash
ip addr show
# or
ifconfig
```

---

## 🚀 How It Works Now

### Before (Multiple Places to Change ❌)
```
main.ts:        http://172.29.90.95:3101  ❌
.env:           http://192.168.1.50:3101  ❌
frontend:       http://10.0.0.100:3101    ❌
```

### After (One Place to Change ✅)
```
.env:           NETWORK_IP=192.168.18.32  ✅
frontend:       baseUrl = http://192.168.18.32:3101  ✅
```

---

## 📝 Complete Setup Checklist

1. ✅ Find your machine's IP address
2. ✅ Update `.env` → `NETWORK_IP=YOUR_IP`
3. ✅ Update `api_constants.dart` → `baseUrl = 'http://YOUR_IP:3101'`
4. ✅ Restart backend: `npm run start:dev`
5. ✅ Hot reload Flutter app

---

## 🎯 Current Configuration

**Backend (.env):**
```
NETWORK_IP=192.168.18.32
PORT=3101
```

**Frontend (api_constants.dart):**
```dart
baseUrl = 'http://192.168.18.32:3101'
wsUrl = 'ws://192.168.18.32:3101'
```

**Your API URLs:**
- 📍 REST API: `http://192.168.18.32:3101`
- 🔌 WebSocket: `ws://192.168.18.32:3101`
- 📚 Swagger: `http://192.168.18.32:3101/swagger`

---

## 🐛 Troubleshooting

### Can't connect from phone/emulator?

1. **Check firewall:** Make sure port 3101 is allowed
2. **Same network:** Ensure phone/emulator is on same Wi-Fi
3. **Restart backend:** After changing `.env`, restart: `npm run start:dev`
4. **Check IP:** Run `npm run start:dev` and verify the Network URL shown

### Still not working?

```bash
# Test if server is accessible
curl http://YOUR_IP:3101

# Check if port is listening
lsof -i :3101
```

---

## 💡 Tips

- Use **localhost** for local testing
- Use **NETWORK_IP** for testing on physical devices
- Update **both backend and frontend** when changing network
- Keep `.env.example` as backup reference
