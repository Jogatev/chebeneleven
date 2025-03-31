import nodemailer from 'nodemailer';
import { Application, JobListing } from '@shared/schema';
import { log } from './vite';

// In a production environment, configure with actual SMTP credentials
// For testing, we'll use nodemailer's built-in test account
const createTransporter = async () => {
  // For development/testing, use a test account
  // In production, replace with actual SMTP credentials
  try {
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return { transporter, testAccount };
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    log('Failed to create email transporter', 'email-service');
    return null;
  }
};

export async function sendApplicationConfirmation(
  application: Application, 
  job: JobListing,
  referenceId: string
) {
  const transporterData = await createTransporter();
  if (!transporterData) return null;
  
  const { transporter, testAccount } = transporterData;
  
  try {
    const info = await transporter.sendMail({
      from: '"7-Eleven Careers" <careers@7eleven.ph>',
      to: application.email,
      subject: `Application Confirmation: ${job.title} [Ref# ${referenceId}]`,
      html: `
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
            
            <p>Our hiring team will review your application and will contact you if your qualifications match our requirements.</p>
            <p>You can check the status of your application by logging into your account.</p>
            
            <p>If you have any questions, please contact our recruitment team.</p>
            
            <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    log(`Application confirmation email sent: ${info.messageId}`, 'email-service');
    
    // For test accounts, provide a link to preview the email
    if (testAccount) {
      log(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`, 'email-service');
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) 
      };
    }
    
    return { success: true, messageId: info.messageId };
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
  const transporterData = await createTransporter();
  if (!transporterData) return null;
  
  const { transporter, testAccount } = transporterData;
  
  // Format the status for display
  const formattedStatus = newStatus
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Determine message based on status
  let statusMessage = '';
  let actionRequired = '';
  
  switch(newStatus) {
    case 'under_review':
      statusMessage = 'Your application is currently under review by our recruitment team.';
      actionRequired = 'We will contact you soon with updates on your application.';
      break;
    case 'interviewed':
      statusMessage = 'Thank you for completing your interview with us.';
      actionRequired = 'Our team is evaluating your interview performance and will be in touch soon.';
      break;
    case 'accepted':
      statusMessage = 'Congratulations! We are pleased to offer you the position.';
      actionRequired = 'Please respond to our offer within the next 3 business days. A 7-Eleven representative will contact you with next steps.';
      break;
    case 'rejected':
      statusMessage = 'After careful consideration, we have decided to pursue other candidates for this position.';
      actionRequired = 'We appreciate your interest in 7-Eleven and encourage you to apply for future openings.';
      break;
    default:
      statusMessage = `Your application status has been updated to "${formattedStatus}".`;
      actionRequired = 'Please log in to your account for more details.';
  }
  
  try {
    const info = await transporter.sendMail({
      from: '"7-Eleven Careers" <careers@7eleven.ph>',
      to: application.email,
      subject: `Application Status Update: ${job.title} [Ref# ${referenceId}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #00703c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">7-Eleven Philippines</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Application Status Update</h2>
            <p>Dear ${application.firstName} ${application.lastName},</p>
            
            <p>${statusMessage}</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #00703c;">
              <p><strong>Your application reference number:</strong> ${referenceId}</p>
              <p><strong>Position:</strong> ${job.title}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>New status:</strong> <span style="color: #00703c; font-weight: bold;">${formattedStatus}</span></p>
            </div>
            
            <p>${actionRequired}</p>
            
            <p>If you have any questions, please contact our recruitment team.</p>
            
            <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    log(`Application status update email sent: ${info.messageId}`, 'email-service');
    
    // For test accounts, provide a link to preview the email
    if (testAccount) {
      log(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`, 'email-service');
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) 
      };
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    log('Failed to send status update email', 'email-service');
    return { success: false, error };
  }
}