require('dotenv').config({ path: './.env' });
const nodemailer = require('nodemailer');

async function testMail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SAD-ALERTE" <noreply@sadalerte.bf>',
      to: 'admin@sad.local',
      subject: 'Test Email SAD-ALERTE',
      text: 'This is a test email.',
    });
    console.log('Email sent successfully. MessageId:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testMail();
