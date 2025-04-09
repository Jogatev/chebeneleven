
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_Hywa1czp_PV64Ygb6F5o43CmUjSoMnmxc');

const SENDER_EMAIL = 'onboarding@resend.dev'; 

export async function sendApplicationConfirmation(application, job, referenceId) {
  try {
    const applicantName = `${application.firstName} ${application.lastName}`;
    
    const subject = `Your Application for ${job.title} at 7-Eleven has been received`;
    
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold;">
            <span style="color: #008c48;">7-ELEVEN</span>
            <span style="color: #ff7a00; margin-left: 5px;">PHILIPPINES</span>
          </div>
        </div>
        
        <h2 style="color: #333; text-align: center;">Application Confirmation</h2>
        
        <p>Dear ${applicantName},</p>
        
        <p>Thank you for applying to the <strong>${job.title}</strong> position at 7-Eleven ${job.location}. We have received your application and our team will review it shortly.</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Application Reference ID:</strong> ${referenceId}</p>
          <p style="margin: 10px 0 0;"><strong>Position:</strong> ${job.title}</p>
          <p style="margin: 10px 0 0;"><strong>Location:</strong> ${job.location}</p>
          <p style="margin: 10px 0 0;"><strong>Date Applied:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>What happens next?</p>
        <ol>
          <li>Our hiring team will review your application</li>
          <li>If your qualifications match our requirements, we'll contact you for an interview</li>
          <li>You will receive updates on your application status via email</li>
        </ol>
        
        <p>Please save your application reference ID for future correspondence.</p>
        
        <p>If you have any questions about your application, please contact our HR department.</p>
        
        <p>Best regards,<br>
        7-Eleven Philippines Recruitment Team</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: application.email,
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
    
    console.log("Email sent successfully, ID:", data?.id);
    
    return {
      success: true,
      messageId: data?.id || 'unknown',
    };
  } catch (error) {
    console.error("Error sending application confirmation email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

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
    
    let statusMessage = "";
    let nextSteps = "";
    
    if (status === "under_review") {
      statusMessage = "Your application is currently under review by our hiring team.";
      nextSteps = "If your qualifications match our requirements, we will contact you for an interview.";
    } else if (status === "interview") {
      statusMessage = "Congratulations! Your application has been selected for an interview.";
      nextSteps = "Our HR team will contact you shortly to schedule an interview.";
    } else if (status === "interviewed") {
      statusMessage = "Thank you for attending the interview for this position.";
      nextSteps = "Our team is currently evaluating all candidates and we will inform you of our decision soon.";
    } else if (status === "accepted") {
      statusMessage = "Congratulations! We are pleased to inform you that your application has been accepted.";
      nextSteps = "Our HR team will contact you shortly with more details about the next steps.";
    } else if (status === "rejected") {
      statusMessage = "Thank you for your interest in the position. After careful consideration, we have decided to proceed with other candidates whose qualifications more closely match our current needs.";
      nextSteps = "We encourage you to apply for future positions that match your skills and experience.";
    } else {
      statusMessage = `Your application status has been updated to: ${statusText}`;
      nextSteps = "Please continue to monitor your email for further updates.";
    }
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold;">
            <span style="color: #008c48;">7-ELEVEN</span>
            <span style="color: #ff7a00; margin-left: 5px;">PHILIPPINES</span>
          </div>
        </div>
        
        <h2 style="color: #333; text-align: center;">Application Status Update</h2>
        
        <p>Dear ${applicantName},</p>
        
        <p>${statusMessage}</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Application Reference ID:</strong> ${referenceId}</p>
          <p style="margin: 10px 0 0;"><strong>Position:</strong> ${job.title}</p>
          <p style="margin: 10px 0 0;"><strong>Location:</strong> ${job.location}</p>
          <p style="margin: 10px 0 0;"><strong>Current Status:</strong> ${statusText}</p>
        </div>
        
        <p>${nextSteps}</p>
        
        <p>If you have any questions, please contact our HR department and reference your Application ID.</p>
        
        <p>Best regards,<br>
        7-Eleven Philippines Recruitment Team</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: application.email,
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
    
    console.log("Status update email sent successfully, ID:", data?.id);
    
    return {
      success: true,
      messageId: data?.id || 'unknown',
    };
  } catch (error) {
    console.error("Error sending status update email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function sendTestEmail(to) {
  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: to,
      subject: 'Test Email from 7-Eleven Application System',
      html: '<p>This is a test email from the 7-Eleven application system.</p><p>If you received this, email sending is working correctly!</p>',
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, messageId: data?.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}