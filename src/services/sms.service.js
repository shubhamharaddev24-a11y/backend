const twilio = require('twilio');
const ApiError = require('../utils/ApiError');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS
exports.sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new ApiError(500, 'Failed to send SMS');
  }
};

// Send WhatsApp message (if using Twilio WhatsApp)
exports.sendWhatsApp = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
    });

    console.log('WhatsApp message sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw new ApiError(500, 'Failed to send WhatsApp message');
  }
};

// Format phone number for international format
exports.formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming India)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  // Add + if not present
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
};
