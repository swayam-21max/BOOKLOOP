const emailService = require('./backend/services/emailService');
require('dotenv').config({ path: './backend/.env' });

async function testEmail() {
  console.log('Testing email service...');
  try {
    const info = await emailService.sendOTP('swmktria@gmail.com', '123456');
    console.log('Test successful, info:', info);
  } catch (error) {
    console.error('Test failed, error:', error);
  }
}

testEmail();
