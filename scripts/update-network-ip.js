#!/usr/bin/env node

/**
 * 🌐 Network IP Update Script
 * 
 * Usage:
 *   node scripts/update-network-ip.js 192.168.1.100
 * 
 * This script updates:
 * 1. Backend .env file
 * 2. Frontend api_constants.dart
 */

const fs = require('fs');
const path = require('path');

// Get new IP from command line argument
const newIp = process.argv[2];

if (!newIp) {
  console.error('❌ Error: Please provide an IP address');
  console.log('\n📖 Usage:');
  console.log('   node scripts/update-network-ip.js 192.168.1.100\n');
  process.exit(1);
}

// Validate IP format
const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
if (!ipRegex.test(newIp)) {
  console.error('❌ Error: Invalid IP address format');
  console.log('   Expected format: xxx.xxx.xxx.xxx');
  process.exit(1);
}

console.log('\n🔄 Updating network IP to:', newIp);
console.log('=====================================\n');

// 1. Update Backend .env file
const envPath = path.join(__dirname, '..', '.env');
try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update all IP references
  envContent = envContent.replace(
    /NETWORK_IP=.*/g,
    `NETWORK_IP=${newIp}`
  );
  envContent = envContent.replace(
    /WEBSOCKET_NETWORK_IP=.*/g,
    `WEBSOCKET_NETWORK_IP=${newIp}`
  );
  envContent = envContent.replace(
    /CORS_ORIGIN=http:\/\/[^:]+:(\d+)/g,
    `CORS_ORIGIN=http://${newIp}:$1`
  );
  envContent = envContent.replace(
    /API_BASE_URL=http:\/\/[^:\s]+/g,
    `API_BASE_URL=http://${newIp}`
  );
  envContent = envContent.replace(
    /URL=http:\/\/[^:]+:(\d+)\//g,
    `URL=http://${newIp}:$1/`
  );
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Backend .env updated');
} catch (error) {
  console.error('❌ Error updating .env:', error.message);
}

// 2. Update Frontend api_constants.dart
const apiConstantsPath = path.join(
  __dirname,
  '..',
  '..',
  'cloth_shop_flutter',
  'lib',
  'Constants',
  'api_constants.dart'
);

try {
  let dartContent = fs.readFileSync(apiConstantsPath, 'utf8');
  
  // Update baseUrl
  dartContent = dartContent.replace(
    /static const String baseUrl = 'http:\/\/[^']+'/g,
    `static const String baseUrl = 'http://${newIp}:3101'`
  );
  
  // Update wsUrl
  dartContent = dartContent.replace(
    /static const String wsUrl = 'ws:\/\/[^']+'/g,
    `static const String wsUrl = 'ws://${newIp}:3101'`
  );
  
  fs.writeFileSync(apiConstantsPath, dartContent, 'utf8');
  console.log('✅ Frontend api_constants.dart updated');
} catch (error) {
  console.error('❌ Error updating api_constants.dart:', error.message);
}

console.log('\n=====================================');
console.log('✅ Network IP update complete!\n');
console.log('📍 New URLs:');
console.log(`   REST API:   http://${newIp}:3101`);
console.log(`   WebSocket:  ws://${newIp}:3101`);
console.log(`   Swagger:    http://${newIp}:3101/swagger\n`);
console.log('🔄 Next steps:');
console.log('   1. Restart backend: npm run start:dev');
console.log('   2. Hot reload Flutter app\n');
