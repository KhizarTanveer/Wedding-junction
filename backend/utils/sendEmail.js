const nodemailer = require("nodemailer");

/**
 * Send email using SMTP configuration from environment variables
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
const sendEmail = async ({ to, subject, text, html }) => {
  // Check if email is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email service not configured. Skipping email send.");
    console.log("To enable emails, set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env");
    return false;
  }

  try {
    // Create transporter with SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Wedding Junction" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetLink - Password reset link
 * @returns {Promise<boolean>}
 */
const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = "Password Reset Request - Wedding Junction";

  const text = `
You requested a password reset for your Wedding Junction account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

- Wedding Junction Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fef3e2 0%, #fff 100%); border-radius: 16px; padding: 40px; text-align: center;">
    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #fcd34d, #f59e0b); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-family: Georgia, serif; font-size: 28px; color: #1e293b; font-weight: bold;">W</span>
    </div>
    <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 10px;">Password Reset</h1>
    <p style="color: #64748b; font-size: 14px; margin-bottom: 30px;">Wedding Junction</p>
  </div>

  <div style="padding: 30px 20px;">
    <p style="color: #475569; margin-bottom: 20px;">
      You requested a password reset for your Wedding Junction account. Click the button below to create a new password:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #c2410c); color: white; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-weight: 500; font-size: 16px;">
        Reset Password
      </a>
    </div>

    <p style="color: #64748b; font-size: 13px; margin-top: 30px;">
      This link will expire in <strong>1 hour</strong>.
    </p>

    <p style="color: #64748b; font-size: 13px;">
      If you didn't request this password reset, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetLink}" style="color: #ea580c; word-break: break-all;">${resetLink}</a>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Wedding Junction. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send vendor approval email
 * @param {string} email - Vendor email
 * @param {string} vendorName - Vendor business name
 * @returns {Promise<boolean>}
 */
const sendVendorApprovalEmail = async (email, vendorName) => {
  const subject = "Congratulations! Your Vendor Application is Approved - Wedding Junction";

  const text = `
Congratulations ${vendorName}!

Your vendor application on Wedding Junction has been approved.

You can now:
- Access your vendor dashboard
- List your services
- Accept bookings from couples
- Chat with potential clients

Log in to your account to get started and complete your profile.

Welcome to the Wedding Junction family!

- Wedding Junction Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ecfdf5 0%, #fff 100%); border-radius: 16px; padding: 40px; text-align: center;">
    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 28px;">✓</span>
    </div>
    <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 10px;">Application Approved!</h1>
    <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">Wedding Junction</p>
  </div>

  <div style="padding: 30px 20px;">
    <p style="color: #475569; font-size: 18px; margin-bottom: 20px;">
      Congratulations <strong>${vendorName}</strong>!
    </p>

    <p style="color: #475569; margin-bottom: 20px;">
      Your vendor application on Wedding Junction has been approved. You're now part of our trusted vendor network!
    </p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #1e293b; font-size: 16px; margin-top: 0;">What you can do now:</h3>
      <ul style="color: #475569; padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 8px;">Access your vendor dashboard</li>
        <li style="margin-bottom: 8px;">List your services and packages</li>
        <li style="margin-bottom: 8px;">Accept bookings from couples</li>
        <li style="margin-bottom: 8px;">Chat with potential clients</li>
        <li>Grow your wedding business</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #c2410c); color: white; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-weight: 500; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>

    <p style="color: #64748b; font-size: 14px; text-align: center;">
      Welcome to the Wedding Junction family!
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Wedding Junction. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send booking confirmation email
 * @param {string} email - User email
 * @param {Object} bookingDetails - Booking details
 * @param {string} bookingDetails.bookingId - Booking ID
 * @param {string} bookingDetails.vendorName - Vendor name
 * @param {string} bookingDetails.service - Service name
 * @param {number} bookingDetails.price - Booking price
 * @param {string} bookingDetails.eventDate - Event date
 * @returns {Promise<boolean>}
 */
const sendBookingConfirmationEmail = async (email, bookingDetails) => {
  const { bookingId, vendorName, service, price, eventDate } = bookingDetails;
  const subject = "Booking Confirmed! - Wedding Junction";

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "To be confirmed";

  const formattedPrice = price
    ? `Rs. ${Number(price).toLocaleString("en-IN")}`
    : "To be discussed";

  const text = `
Your booking is confirmed!

Booking Details:
- Booking ID: ${bookingId}
- Vendor: ${vendorName}
- Service: ${service}
- Event Date: ${formattedDate}
- Price: ${formattedPrice}

The vendor has been notified and will contact you soon to discuss the details.

You can view your booking details and chat with the vendor from your dashboard.

- Wedding Junction Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fef3e2 0%, #fff 100%); border-radius: 16px; padding: 40px; text-align: center;">
    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #fcd34d, #f59e0b); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-family: Georgia, serif; font-size: 28px; color: #1e293b; font-weight: bold;">W</span>
    </div>
    <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 10px;">Booking Confirmed!</h1>
    <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">Wedding Junction</p>
  </div>

  <div style="padding: 30px 20px;">
    <p style="color: #475569; margin-bottom: 25px;">
      Great news! Your booking has been confirmed. Here are the details:
    </p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Booking ID</td>
          <td style="padding: 10px 0; color: #1e293b; font-weight: 500; text-align: right;">${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Vendor</td>
          <td style="padding: 10px 0; color: #1e293b; font-weight: 500; text-align: right; border-top: 1px solid #e2e8f0;">${vendorName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Service</td>
          <td style="padding: 10px 0; color: #1e293b; font-weight: 500; text-align: right; border-top: 1px solid #e2e8f0;">${service}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Event Date</td>
          <td style="padding: 10px 0; color: #1e293b; font-weight: 500; text-align: right; border-top: 1px solid #e2e8f0;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Price</td>
          <td style="padding: 10px 0; color: #ea580c; font-weight: 600; text-align: right; border-top: 1px solid #e2e8f0;">${formattedPrice}</td>
        </tr>
      </table>
    </div>

    <p style="color: #475569; margin-bottom: 20px;">
      The vendor has been notified and will contact you soon to discuss the details of your event.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/bookings" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #c2410c); color: white; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-weight: 500; font-size: 16px;">
        View Booking
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

    <p style="color: #94a3b8; font-size: 13px; text-align: center;">
      Need help? Contact us at support@weddingjunction.com
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Wedding Junction. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendVendorApprovalEmail,
  sendBookingConfirmationEmail,
};
