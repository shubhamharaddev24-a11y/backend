const nodemailer = require('nodemailer');
const ApiResponse = require('../utils/ApiResponse');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email helper
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Shubham Media & Digital Services" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send lead notification to admin
exports.sendLeadNotification = async (lead) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Lead Received</h1>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Lead Details</h2>
        
        <div style="margin-bottom: 15px;">
          <strong>Name:</strong> ${lead.name}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Email:</strong> ${lead.email}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Phone:</strong> ${lead.phone}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Subject:</strong> ${lead.subject}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Message:</strong><br>
          <div style="background: #fff; padding: 10px; border-left: 4px solid #667eea; margin-top: 5px;">
            ${lead.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Received:</strong> ${new Date(lead.createdAt).toLocaleString()}
        </div>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Shubham Media & Digital Services</p>
        <p style="margin: 5px 0 0 0; font-size: 12px;">Creative Media, Web Dev & Marketing Agency</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: process.env.EMAIL_USER, // Send to admin email
    subject: `New Lead: ${lead.subject} from ${lead.name}`,
    html,
    text: `New lead received from ${lead.name} (${lead.email}): ${lead.message}`
  });
};

// Send booking confirmation to customer
exports.sendBookingConfirmation = async (booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Confirmation</h1>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Thank you for your booking!</h2>
        <p>Dear ${booking.customerName},</p>
        <p>We have received your booking request. Here are the details:</p>
        
        <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #667eea; margin-top: 0;">Booking Details</h3>
          
          <div style="margin-bottom: 10px;">
            <strong>Service:</strong> ${booking.service.name}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>Event Type:</strong> ${booking.eventType}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>Location:</strong> ${booking.eventLocation}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>Duration:</strong> ${booking.eventDuration}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>Total Price:</strong> ₹${booking.totalPrice?.toLocaleString() || 'To be confirmed'}
          </div>
        </div>
        
        <p><strong>Status:</strong> <span style="color: #f39c12;">${booking.status}</span></p>
        <p>We will contact you within 24 hours to confirm your booking and discuss the details.</p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Shubham Media & Digital Services</p>
        <p style="margin: 5px 0 0 0; font-size: 12px;">Creative Media, Web Dev & Marketing Agency</p>
        <p style="margin: 10px 0 0 0; font-size: 12px;">
          Phone: +91 92714 56749 | Email: info@smediadigitalservices.com
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: booking.customerEmail,
    subject: 'Booking Confirmation - Shubham Media & Digital Services',
    html,
    text: `Thank you for your booking! We will contact you soon to confirm the details.`
  });
};

// Send booking status update
exports.sendBookingStatusUpdate = async (booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Status Update</h1>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Your booking status has been updated</h2>
        <p>Dear ${booking.customerName},</p>
        
        <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <div style="margin-bottom: 10px;">
            <strong>Booking ID:</strong> ${booking._id}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>Service:</strong> ${booking.service.name}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>Event Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>New Status:</strong> <span style="color: #667eea; font-weight: bold;">${booking.status.toUpperCase()}</span>
          </div>
        </div>
        
        <p>We will contact you soon with more information about your booking.</p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">Shubham Media & Digital Services</p>
        <p style="margin: 5px 0 0 0; font-size: 12px;">Creative Media, Web Dev & Marketing Agency</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: booking.customerEmail,
    subject: `Booking Status Update - ${booking.status.toUpperCase()}`,
    html,
    text: `Your booking status has been updated to: ${booking.status.toUpperCase()}`
  });
};
