const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, text }) {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER,
    subject,
    text,
    html: `<p>${text}</p>`,
  };

  return sgMail.send(msg);
}

module.exports = { sendEmail };
