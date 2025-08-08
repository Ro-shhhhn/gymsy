import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS, // Your app password
      },
      // Enhanced security options
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"GYMSY" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        // Add security headers
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  generateOtpEmail(name: string, otp: string): string {
    const currentYear = new Date().getFullYear();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GYMSY - Email Verification</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; }
              .content { padding: 20px !important; }
              .otp-box { padding: 20px !important; }
              .otp-code { font-size: 28px !important; letter-spacing: 4px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f9ff; line-height: 1.6;">
          <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">GYMSY</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Your Fitness Journey Starts Here</p>
            </div>

            <!-- Content -->
            <div class="content" style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Welcome to GYMSY, ${name}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for joining GYMSY! To complete your registration and secure your account, please verify your email address using the verification code below.
              </p>

              <!-- OTP Box -->
              <div class="otp-box" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #06b6d4; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #0891b2; font-size: 16px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <div style="background: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 12px rgba(6,182,212,0.2); border: 1px solid #e2e8f0;">
                  <span class="otp-code" style="font-size: 36px; font-weight: bold; color: #0891b2; letter-spacing: 8px; font-family: 'Courier New', monospace; display: block;">${otp}</span>
                </div>
                <div style="margin-top: 20px;">
                  <p style="color: #dc2626; font-size: 14px; margin: 0; font-weight: 600;">⏰ This code expires in 3 minutes</p>
                  <p style="color: #059669; font-size: 12px; margin: 5px 0 0 0;">Enter this code quickly to verify your account</p>
                </div>
              </div>

              <!-- Security Notice -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">🔒 Security Tips:</h3>
                <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.5;">
                  <li>Never share this verification code with anyone</li>
                  <li>GYMSY will never ask for your code via phone or email</li>
                  <li>This code expires in 3 minutes for your security</li>
                  <li>If you didn't request this verification, please ignore this email</li>
                </ul>
              </div>

              <!-- Urgency Notice -->
              <div style="background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%); border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">⚡ Quick Action Required</h3>
                <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.5;">
                  This verification code will expire in <strong>3 minutes</strong> to keep your account secure. 
                  Please verify your email immediately to complete your registration.
                </p>
              </div>

              <!-- Help Section -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Need Help?</h3>
                <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">
                  If you're having trouble with verification or didn't receive this email, 
                  you can request a new code from the verification page. If problems persist, 
                  please contact our support team.
                </p>
              </div>

              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Thank you for choosing GYMSY. We're excited to help you on your fitness journey!
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 30px; text-align: center;">
              <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                  This email was sent from GYMSY. If you didn't request this verification, please ignore this email.
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  For security reasons, this verification code will expire in 3 minutes.
                </p>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  © ${currentYear} GYMSY. All rights reserved.
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 5px 0 0 0;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendOtpEmail(email: string, name: string, otp: string): Promise<boolean> {
    const html = this.generateOtpEmail(name, otp);
    return await this.sendEmail({
      to: email,
      subject: '🔐 GYMSY - Verify Your Email (Expires in 3 minutes)',
      html,
    });
  }

  // Generate email for OTP resend
  generateResendOtpEmail(name: string, otp: string): string {
    const currentYear = new Date().getFullYear();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GYMSY - New Verification Code</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; }
              .content { padding: 20px !important; }
              .otp-box { padding: 20px !important; }
              .otp-code { font-size: 28px !important; letter-spacing: 4px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f9ff; line-height: 1.6;">
          <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">GYMSY</h1>
              <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">New Verification Code</p>
            </div>

            <!-- Content -->
            <div class="content" style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Hi ${name}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You requested a new verification code. Here's your fresh code to complete your email verification:
              </p>

              <!-- OTP Box -->
              <div class="otp-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #047857; font-size: 16px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your New Verification Code</p>
                <div style="background: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.2); border: 1px solid #e2e8f0;">
                  <span class="otp-code" style="font-size: 36px; font-weight: bold; color: #047857; letter-spacing: 8px; font-family: 'Courier New', monospace; display: block;">${otp}</span>
                </div>
                <div style="margin-top: 20px;">
                  <p style="color: #dc2626; font-size: 14px; margin: 0; font-weight: 600;">⏰ This code expires in 3 minutes</p>
                  <p style="color: #047857; font-size: 12px; margin: 5px 0 0 0;">Please use this code immediately</p>
                </div>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">🔒 Important:</h3>
                <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.5;">
                  <li>This is a new code - any previous codes are now invalid</li>
                  <li>You have 3 minutes to use this code</li>
                  <li>Never share this code with anyone</li>
                </ul>
              </div>

              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Almost there! Once verified, you'll have full access to your GYMSY account.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                This is your new verification code. Previous codes are no longer valid.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${currentYear} GYMSY. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendResendOtpEmail(email: string, name: string, otp: string): Promise<boolean> {
    const html = this.generateResendOtpEmail(name, otp);
    return await this.sendEmail({
      to: email,
      subject: '🔄 GYMSY - New Verification Code (Expires in 3 minutes)',
      html,
    });
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  // Send welcome email after successful verification
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const currentYear = new Date().getFullYear();
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GYMSY!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f9ff;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">🎉 Welcome to GYMSY!</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your fitness journey starts now</p>
            </div>
            
            <div style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${name}! 🏋️‍♂️</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Congratulations! Your email has been verified successfully. You're now part of the GYMSY community and ready to start your fitness transformation.
              </p>
              
              <div style="background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
                <h3 style="color: #7c3aed; margin: 0 0 15px 0;">What's Next?</h3>
                <ul style="color: #5b21b6; text-align: left; font-size: 14px; line-height: 1.8;">
                  <li>Complete your profile setup</li>
                  <li>Set your fitness goals</li>
                  <li>Explore workout plans</li>
                  <li>Track your progress</li>
                </ul>
              </div>
              
              <p style="color: #4b5563; font-size: 14px; margin: 30px 0 0 0;">
                We're excited to be part of your fitness journey. Let's achieve your goals together!
              </p>
            </div>
            
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 30px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${currentYear} GYMSY. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: '🎉 Welcome to GYMSY - Let\'s Start Your Fitness Journey!',
      html,
    });
  }
}

export const emailService = new EmailService();