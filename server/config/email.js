const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  // Auto-strip spaces from Gmail App Password if present
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

  // If using Gmail SMTP or Gmail username, use nodemailer service wrapper for perfect compatibility
  if (process.env.SMTP_HOST === 'smtp.gmail.com' || (user && (user.includes('gmail') || user.endsWith('@bbdu.ac.in')))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user,
      pass,
    },
  });
};

module.exports = createTransporter;
