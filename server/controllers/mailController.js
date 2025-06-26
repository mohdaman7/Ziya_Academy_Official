const transporter = require('../config/mailConfig');

exports.sendEnquiry = async (req, res) => {
  try {
    const { name, email, phone, category, message, ...otherFields } = req.body;

    // Validation
    if (!name || !email || !phone || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits'
      });
    }

    let additionalInfo = '';
    switch (category) {
      case 'school':
        if (!otherFields.school_class) {
          return res.status(400).json({
            success: false,
            message: 'Please select your class/grade'
          });
        }
        additionalInfo = `Class: ${otherFields.school_class}`;
        break;

      case 'internship':
        if (!otherFields.internship) {
          return res.status(400).json({
            success: false,
            message: 'Please select an internship program'
          });
        }
        if (!otherFields.termsAccepted) {
          return res.status(400).json({
            success: false,
            message: 'You must accept the terms and conditions'
          });
        }
        additionalInfo = `Internship Program: ${otherFields.internship}`;
        break;

      case 'it_services':
        if (!otherFields.it_service) {
          return res.status(400).json({
            success: false,
            message: 'Please select an IT service'
          });
        }
        additionalInfo = `IT Service: ${otherFields.it_service}`;
        break;
    }

    // Email to admin
    const adminMailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Enquiry System'}" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVING_EMAIL,
      subject: `New Enquiry: ${getCategoryName(category)}`,
      html: `
        <h2>New Enquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Interest:</strong> ${getCategoryName(category)}</p>
        ${additionalInfo ? `<p><strong>Additional Info:</strong> ${additionalInfo}</p>` : ''}
        <p><strong>Message:</strong> ${message || 'No message provided'}</p>
        <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
      `,
    };

    // Email to user
    const userMailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Customer Support'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for your enquiry - ${process.env.COMPANY_NAME || 'Our Service'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Dear ${name},</h2>
          <p>Thank you for contacting us about ${getCategoryName(category)}. We've received your enquiry and our team will respond within 24-48 hours.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Enquiry Details:</h3>
            <p><strong>Reference:</strong> ENQ-${Date.now().toString().slice(-6)}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            ${additionalInfo ? `<p><strong>Details:</strong> ${additionalInfo}</p>` : ''}
          </div>
          
          <p>For urgent matters, please contact us at:</p>
          <p>📞 ${process.env.COMPANY_PHONE || 'Not specified'}</p>
          <p>✉️ ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}</p>
          
          <p style="margin-top: 30px;">Best regards,<br>
          <strong>The ${process.env.COMPANY_NAME || 'Customer Support'} Team</strong></p>
          
          <div style="margin-top: 40px; font-size: 12px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 10px;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `,
    };

    // Send emails with delay between them
    console.log('Sending admin email...');
    await transporter.sendMail(adminMailOptions);
    console.log('Admin email sent successfully');
    
    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Sending user confirmation...');
    await transporter.sendMail(userMailOptions);
    console.log('User confirmation sent successfully');

    res.status(200).json({
      success: true,
      message: 'Enquiry submitted successfully! Please check your email for confirmation.'
    });

  } catch (error) {
    console.error('Full error details:', error);
    
    // Check if it's an email sending error
    if (error.code === 'EAUTH' || error.code === 'EENVELOPE') {
      return res.status(500).json({
        success: false,
        message: 'Email service configuration error. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};

function getCategoryName(category) {
  const categories = {
    school: 'School Education',
    nios: 'NIOS Program',
    ignou: 'IGNOU Program',
    internship: 'Internship Program',
    it_services: 'IT Services'
  };
  return categories[category] || category;
}