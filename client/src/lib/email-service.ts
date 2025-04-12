// Brevo Mail Service
import nodemailer from 'nodemailer';
import axios from 'axios';

// SMTP Configuration for Brevo
const smtpTransport = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: '8a3c5a001@smtp-brevo.com',
    pass: '73kHjzqSK8YL6Fas'
  }
});

// API Configuration for Brevo
const BREVO_API_KEY = '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';
const BREVO_API_URL = 'https://api.brevo.com/v3';
const SENDER_EMAIL = 'careers@cheebeeneeleebeen.online';
const SENDER_NAME = '7-Eleven Philippines Recruitment';

// Logging functions
function logEmailAttempt(to, subject) {
  console.log(`📧 Sending email: "${subject}" to ${to}`);
}

function logEmailSuccess(to, messageId) {
  console.log(`✅ Email sent to ${to} | Message ID: ${messageId}`);
}

function logEmailError(to, error) {
  console.error(`❌ Email failed to ${to}:`, error);
}

// Choose which method to use - SMTP or API
// Set to 'smtp' or 'api'
const EMAIL_METHOD = 'smtp';

/**
 * Send email using Brevo SMTP
 */
async function sendEmailSMTP(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to,
      subject,
      html: htmlContent
    };

    const info = await smtpTransport.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('SMTP sending error:', error);
    throw error;
  }
}

/**
 * Send email using Brevo API
 */
async function sendEmailAPI(to, subject, htmlContent) {
  try {
    const response = await axios.post(
      `${BREVO_API_URL}/smtp/email`,
      {
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL
        },
        to: [{ email: to }],
        subject,
        htmlContent
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, messageId: response.data?.messageId || 'sent' };
  } catch (error) {
    console.error('API sending error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}

/**
 * Send an email using the configured method (SMTP or API)
 */
async function sendEmail(to, subject, htmlContent) {
  if (EMAIL_METHOD === 'smtp') {
    return sendEmailSMTP(to, subject, htmlContent);
  } else {
    return sendEmailAPI(to, subject, htmlContent);
  }
}

/**
 * Send application confirmation email
 */
export async function sendApplicationConfirmation(application, job, referenceId) {
  try {
    const applicantName = `${application.firstName} ${application.lastName}`;
    const subject = `Your Application for ${job.title} at 7-Eleven has been received`;

    logEmailAttempt(application.email, subject);

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold;">
            <span style="color: #008c48;">7-ELEVEN</span>
            <span style="color: #ff7a00;">PHILIPPINES</span>
          </div>
        </div>
        <h2 style="text-align: center;">Application Confirmation</h2>
        <p>Dear ${applicantName},</p>
        <p>Thank you for applying to the <strong>${job.title}</strong> position at 7-Eleven ${job.location}. We have received your application and our team will review it shortly.</p>
        <div style="background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;">
          <p><strong>Reference ID:</strong> ${referenceId}</p>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Date Applied:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>What happens next?</p>
        <ol>
          <li>Application review by our team</li>
          <li>Possible interview invitation if you meet qualifications</li>
          <li>Status updates via email</li>
        </ol>
        <p>Please keep your reference ID safe.</p>
        <p>For inquiries, contact our HR team.</p>
        <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>
        <div style="text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
          <p>This is an automated message. Do not reply.</p>
        </div>
      </div>
    `;

    const result = await sendEmail(application.email, subject, htmlBody);

    if (result.success) {
      logEmailSuccess(application.email, result.messageId);
      return { success: true, messageId: result.messageId || 'unknown' };
    } else {
      throw new Error(`Email sending failed: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Error in sendApplicationConfirmation:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send status update email
 */
export async function sendStatusUpdateEmail(application, job, status, referenceId) {
  try {
    const applicantName = `${application.firstName} ${application.lastName}`;
    const statusMap = {
      submitted: "Submitted",
      under_review: "Under Review",
      interview: "Selected for Interview",
      interviewed: "Interviewed",
      accepted: "Accepted",
      rejected: "Not Selected"
    };
    const statusText = statusMap[status] || status;
    const subject = `Your 7-Eleven Job Application Status: ${statusText}`;

    logEmailAttempt(application.email, subject);

    const statusMessage = {
      under_review: "Your application is currently under review by our hiring team.",
      interview: "Congratulations! Your application has been selected for an interview.",
      interviewed: "Thank you for attending the interview. We're evaluating all candidates.",
      accepted: "Congratulations! Your application has been accepted.",
      rejected: "Thank you for applying. We've decided to proceed with other candidates."
    }[status] || `Your application status is now: ${statusText}`;

    const nextSteps = {
      under_review: "We'll contact you if you're shortlisted.",
      interview: "Our HR team will schedule your interview.",
      interviewed: "Please wait for our decision.",
      accepted: "We'll follow up shortly with the next steps.",
      rejected: "We encourage you to apply for future openings."
    }[status] || "Check your email for further updates.";

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold;">
            <span style="color: #008c48;">7-ELEVEN</span>
            <span style="color: #ff7a00;">PHILIPPINES</span>
          </div>
        </div>
        <h2 style="text-align: center;">Application Status Update</h2>
        <p>Dear ${applicantName},</p>
        <p>${statusMessage}</p>
        <div style="background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;">
          <p><strong>Reference ID:</strong> ${referenceId}</p>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Status:</strong> ${statusText}</p>
        </div>
        <p>${nextSteps}</p>
        <p>For inquiries, contact our HR team with your Reference ID.</p>
        <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>
        <div style="text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
          <p>This is an automated message. Do not reply.</p>
        </div>
      </div>
    `;

    const result = await sendEmail(application.email, subject, htmlBody);

    if (result.success) {
      logEmailSuccess(application.email, result.messageId);
      return { success: true, messageId: result.messageId || 'unknown' };
    } else {
      throw new Error(`Email sending failed: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Error in sendStatusUpdateEmail:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(to) {
  try {
    const subject = 'Test Email from 7-Eleven Application System';
    logEmailAttempt(to, subject);

    const html = `
      <p>This is a test email from the 7-Eleven application system.</p>
      <p>If you received this, your email setup is working correctly!</p>
    `;

    const result = await sendEmail(to, subject, html);

    if (result.success) {
      logEmailSuccess(to, result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(`Email sending failed: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Error in sendTestEmail:", error);
    return { success: false, error: error.message };
  }
}