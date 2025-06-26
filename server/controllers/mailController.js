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
        <div style="max-width:600px; margin:auto; font-family:'Poppins', Arial, sans-serif; border:1px solid #e0e0e0; border-radius:8px; padding:30px; background-color:#ffffff; color:#333333; font-size:16px; line-height:1.6;">

  <div style="text-align:center; border-bottom:1px solid #ddd; padding-bottom:20px; margin-bottom:25px;">
    <h2 style="font-size:26px; color:#00aeef; margin:0; font-weight:600;">ZiyaAcademy</h2>
    <div style="margin-top:5px;">
      <span style="color:#8dc63f; font-size:14px; font-weight:700;">KEY-TO SUCCESS</span>
    </div>
  </div>

  
  <p>Hi <strong>${name}</strong>,</p>

  <p>Thank you for reaching out to <strong>Ziya Academy</strong>. We’ve received your enquiry and our team will get back to you shortly.</p>

  <p>We appreciate your interest and look forward to assisting you.</p>

  <p>We're excited to connect with you and help with whatever you need. In the meantime, feel free to explore more about us on our website or follow us on social media.</p>

  
  <p style="margin-top:30px;">
    <strong>Warm regards,</strong><br>
    Team Ziya Academy
  </p>

  
  <div style="margin-top:20px;">
    <p style="font-weight:500; margin-bottom:10px;">🔗 Connect with us:</p>
    <ul style="list-style:none; padding:0; margin:0;">
      <li style="margin-bottom:8px;">
        🌐 <a href="https://ziyaacademy.com" style="color:#0a66c2; text-decoration:none;">ziyaacademy.com</a>
      </li>
      <li style="margin-bottom:8px;">
        📘 <a href="https://www.facebook.com/profile.php?id=61571052597141" style="color:#0a66c2; text-decoration:none;">facebook.com/ziyaacademy</a>
      </li>
      <li>
        📸 <a href="https://www.instagram.com/ziya_academy_?igsh=MWN2b201bWxubWtmaA==" style="color:#0a66c2; text-decoration:none;">instagram.com/ziyaacademy</a>
      </li>
    </ul>
  </div>

 
  <div style="text-align:center; border-top:1px solid #e0e0e0; margin-top:40px; padding-top:15px; font-size:13px; color:#999;">
    © ${new Date().getFullYear()} Ziya Academy. All rights reserved.
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