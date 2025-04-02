import * as SibApiV3Sdk from '@getbrevo/brevo';
import { Application, JobListing } from '@shared/schema';
import { log } from './vite';

// Configure API client
const emailInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const smsInstance = new SibApiV3Sdk.TransactionalSMSApi();
const apiKey = "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";

emailInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
smsInstance.setApiKey(SibApiV3Sdk.TransactionalSMSApiApiKeys.apiKey, apiKey);

async function sendSMS(phone: string, message: string) {
  try {
    // Format phone number (remove non-digits and ensure +63 prefix)
    const formattedPhone = '+63' + phone.replace(/\D/g, '');
    
    // Use TextBelt API (1 free SMS per day)
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
        key: 'textbelt_test', // Free test key (1 SMS/day)
      }),
    });

    const data = await response.json();
    return { 
      success: data.success,
      messageId: data.textId,
      error: data.error
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return { success: false, error };
  }
}

export async function sendApplicationConfirmation(
  application: Application, 
  job: JobListing,
  referenceId: string
) {
  try {
    // Send SMS first
    if (application.phone) {
      const smsMessage = `Thank you for applying to ${job.title} at 7-Eleven ${job.location}. Your reference number is ${referenceId}. We will contact you soon.`;
      await sendSMS(application.phone, smsMessage);
    }

    // Send email as backup
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `Application Confirmation: ${job.title} [Ref# ${referenceId}]`;
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #00703c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">7-Eleven Philippines</h1>
          </div>

          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Thank you for your application</h2>
            <p>Dear ${application.firstName} ${application.lastName},</p>
            <p>We have received your application for the <strong>${job.title}</strong> position at our ${job.location} store.</p>

            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #00703c;">
              <p><strong>Your application reference number:</strong> ${referenceId}</p>
              <p><strong>Position:</strong> ${job.title}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>Date applied:</strong> ${new Date(application.submittedAt).toLocaleDateString('en-PH')}</p>
            </div>

            <p>To cancel your application, please click the link below:</p>
            <a href="https://7eleven.ph/careers/cancel/${referenceId}" style="color: #d32f2f;">Cancel Application</a>

            <p>If you have any questions, please contact our recruitment team.</p>

            <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>
          </div>
        </div>
      `;
    sendSmtpEmail.sender = { name: '7-Eleven Careers', email: '893af0001@smtp-brevo.com' };
    sendSmtpEmail.to = [{ email: application.email }];
    sendSmtpEmail.headers = {
      'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
    };

    const result = await emailInstance.sendTransacEmail(sendSmtpEmail); //Corrected apiInstance to emailInstance
    log(`Application confirmation email sent: ${result.messageId}`, 'email-service');
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send application confirmation email:', error);
    log('Failed to send application confirmation email', 'email-service');
    return { success: false, error };
  }
}

export async function sendStatusUpdateEmail(
  application: Application, 
  job: JobListing,
  referenceId: string,
  newStatus: string
) {
  try {
    const formattedStatus = newStatus
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `Application Status Update: ${job.title} [Ref# ${referenceId}]`;
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #00703c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">7-Eleven Philippines</h1>
          </div>

          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Application Status Update</h2>
            <p>Dear ${application.firstName} ${application.lastName},</p>

            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #00703c;">
              <p><strong>Your application reference number:</strong> ${referenceId}</p>
              <p><strong>Position:</strong> ${job.title}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>New status:</strong> <span style="color: #00703c; font-weight: bold;">${formattedStatus}</span></p>
            </div>

            <p>Status Update: ${getStatusMessage(newStatus)}</p>
            <p>${getActionRequired(newStatus)}</p>

            <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>
          </div>
        </div>
      `;
    sendSmtpEmail.sender = { name: '7-Eleven Careers', email: '893af0001@smtp-brevo.com' };
    sendSmtpEmail.to = [{ email: application.email }];
    sendSmtpEmail.headers = {
      'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
    };

    const result = await emailInstance.sendTransacEmail(sendSmtpEmail); //Corrected apiInstance to emailInstance
    log(`Status update email sent: ${result.messageId}`, 'email-service');
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    log('Failed to send status update email', 'email-service');
    return { success: false, error };
  }
}

export async function sendFranchiseeNotification(
  application: Application,
  job: JobListing,
  referenceId: string,
  franchiseeEmail: string
) {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `New Job Application: ${job.title}`;
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #00703c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">7-Eleven Philippines</h1>
          </div>

          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>New Job Application Received</h2>
            <p>A new application has been submitted for your job listing.</p>

            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #00703c;">
              <p><strong>Application reference number:</strong> ${referenceId}</p>
              <p><strong>Position:</strong> ${job.title}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>Applicant:</strong> ${application.firstName} ${application.lastName}</p>
              <p><strong>Email:</strong> ${application.email}</p>
              <p><strong>Date applied:</strong> ${new Date(application.submittedAt).toLocaleDateString('en-PH')}</p>
            </div>

            <p>Please review the application and update the status as needed.</p>

            <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>
          </div>
        </div>
      `;
    sendSmtpEmail.sender = { name: '7-Eleven Careers', email: '893af0001@smtp-brevo.com' };
    sendSmtpEmail.to = [{ email: franchiseeEmail }];
    sendSmtpEmail.headers = {
      'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
    };

    const result = await emailInstance.sendTransacEmail(sendSmtpEmail); //Corrected apiInstance to emailInstance
    log(`Franchisee notification email sent: ${result.messageId}`, 'email-service');
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send franchisee notification email:', error);
    log('Failed to send franchisee notification email', 'email-service');
    return { success: false, error };
  }
}

function getStatusMessage(status: string): string {
  switch(status) {
    case 'under_review':
      return 'Your application is currently under review by our recruitment team.';
    case 'interviewed':
      return 'Thank you for completing your interview with us.';
    case 'accepted':
      return 'Congratulations! We are pleased to offer you the position.';
    case 'rejected':
      return 'After careful consideration, we have decided to pursue other candidates for this position.';
    default:
      return `Your application status has been updated to "${status}".`;
  }
}

function getActionRequired(status: string): string {
  switch(status) {
    case 'under_review':
      return 'We will contact you soon with updates on your application.';
    case 'interviewed':
      return 'Our team is evaluating your interview performance and will be in touch soon.';
    case 'accepted':
      return 'Please respond to our offer within the next 3 business days. A 7-Eleven representative will contact you with next steps.';
    case 'rejected':
      return 'We appreciate your interest in 7-Eleven and encourage you to apply for future openings.';
    default:
      return 'Please log in to your account for more details.';
  }
}