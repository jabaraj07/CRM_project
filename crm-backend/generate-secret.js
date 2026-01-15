// Quick script to generate a secure JWT_SECRET
// Run: node generate-secret.js

const crypto = require('crypto');

// Generate a random 64-byte (512-bit) secret
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n✅ Your secure JWT_SECRET:');
console.log('='.repeat(60));
console.log(secret);
console.log('='.repeat(60));
console.log('\n📝 Add this to your .env file:');
console.log(`JWT_SECRET=${secret}\n`);

