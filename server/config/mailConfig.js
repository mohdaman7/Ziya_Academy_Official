const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Only for testing/development - remove in production
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('Mail transporter error:', error);
  } else {
    console.log('Mail transporter is ready');
  }
});

module.exports = transporter;