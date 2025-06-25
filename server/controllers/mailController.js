const transporter = require('../config/mailConfig');

exports.sendEnquiry = async (req, res) => {
  try {
    const { name, email, phone, category, message, ...otherFields } = req.body;

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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVING_EMAIL,
      subject: `New Enquiry from ${name}`,
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

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Enquiry sent successfully! We will contact you soon.' 
    });
  } catch (error) {
    console.error('Error sending enquiry:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while processing your enquiry. Please try again later.' 
    });
  }
};

function getCategoryName(category) {
  const categories = {
    school: 'School Education (LKG to +2)',
    nios: 'NIOS (National Institute of Open Schooling)',
    ignou: 'IGNOU (Distance Learning)',
    internship: 'Professional Internship Program',
    it_services: 'IT Services & Solutions'
  };
  return categories[category] || category;
}