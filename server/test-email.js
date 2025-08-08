// Create this file at: C:\gymsy\server\test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Test the connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    const info = await transporter.sendMail({
      from: `"GYMSY Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'GYMSY Email Test',
      html: `
        <h1>🎉 Email Setup Successful!</h1>
        <p>Your GYMSY email configuration is working perfectly!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(error.message);
    
    // Common error solutions
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Solution: Check your email and app password');
      console.log('- Make sure SMTP_USER is your full Gmail address');
      console.log('- Make sure SMTP_PASS is the 16-character app password');
    }
    
    if (error.message.includes('Less secure')) {
      console.log('\n🔧 Solution: You need to use an App Password');
      console.log('- Enable 2-factor authentication on Gmail');
      console.log('- Generate an App Password in Gmail settings');
    }
  }
}

testEmail();