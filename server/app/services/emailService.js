const sgMail = require("@sendgrid/mail");
const { getAllEmailUsers } = require("../services/userService");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate professional HTML email template
function generateEmailHTML(text, subject) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #e7edf3;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #53a5cb 0%, #3d7ca1 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .header .logo {
                font-size: 24px;
                margin-bottom: 10px;
                display: inline-block;
                font-weight: 600;
            }
            .content {
                padding: 40px 30px;
                color: #09173b;
            }
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            .footer {
                background-color: #e7edf3;
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #53a5cb;
                color: #09173b;
                font-size: 14px;
            }
            .footer a {
                color: #53a5cb;
                text-decoration: none;
            }
            .footer a:hover {
                color: #b0d5e6;
            }
            .divider {
                height: 2px;
                background: linear-gradient(90deg, #53a5cb, #09173b);
                margin: 20px 0;
                border: none;
            }
            .cta-button {
                display: inline-block;
                background-color: #53a5cb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                transition: background-color 0.3s ease;
            }
            .cta-button:hover {
                background-color: #b0d5e6;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    margin: 0;
                    border-radius: 0;
                }
                .content {
                    padding: 20px;
                }
                .header {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">GLOW - Temp Tracker</div>
                <h1>${subject}</h1>
            </div>
            <div class="content">
                <div class="message">${text}</div>
                <hr class="divider">
                <p style="color: #09173b; font-size: 14px; margin-bottom: 0;">
                    Thank you for being part of the TempTracker community!
                </p>
            </div>
            <div class="footer">
                <p>
                    This email was sent from <strong>TempTracker</strong><br>
                    <a href="#">Visit our website</a>
                </p>
                <p style="margin-top: 15px; font-size: 12px; color: #3d4552;">
                    © 2025 TempTracker. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

async function sendEmail({ to, subject, text }) {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER,
    subject,
    text,
    html: generateEmailHTML(text, subject),
  };

  return sgMail.send(msg);
}

async function sendUsersEmail({ subject, text }) {
  try {
    const users = await getAllEmailUsers();

    const results = await Promise.allSettled(
      users.map((user) =>
        sendEmail({
          to: user.email,
          subject,
          text,
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    return {
      sent,
      failed,
    };
  } catch (e) {
    console.error("Notify-all error:", e);
    throw new Error("Failed to send emails to all users");
  }
}

module.exports = { sendUsersEmail };
