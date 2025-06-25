document.addEventListener('DOMContentLoaded', function () {
  // Form Animation
  const animateForm = () => {
    const form = document.querySelector('.enquiry-form-card');
    if (form) {
      form.style.opacity = '0';
      form.style.transform = 'translateY(50px)';

      setTimeout(() => {
        form.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        form.style.opacity = '1';
        form.style.transform = 'translateY(0)';
      }, 300);
    }
  };

  //Mobile Navigation 
  const setupMobileNav = () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });
    }
  };

  // Form Handling 
  const initializeEnquiryForm = () => {
    // Toggle Sub Options Function
    const toggleSubOptions = (category) => {
      const subFields = ['school-options', 'internship-options', 'it-options'];
      subFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) element.style.display = 'none';
      });

      if (category) {
        const elementId = `${category.replace('_', '-')}-options`;
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'block';
      }
    };

    
    const showError = (fieldId, message) => {
      const errorElement = document.getElementById(`${fieldId}-error`);
      const inputElement = document.getElementById(fieldId);

      if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
      }
    };

  
    const clearError = (fieldId) => {
      const errorElement = document.getElementById(`${fieldId}-error`);
      const inputElement = document.getElementById(fieldId);

      if (errorElement && inputElement) {
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
      }
    };

    // Validate form fields
    const validateForm = () => {
      let isValid = true;

      
      document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
      });
      document.querySelectorAll('.enquiry-form-input, .enquiry-form-select').forEach(el => {
        el.classList.remove('error');
      });

      const requiredFields = ['name', 'email', 'phone', 'category'];
      requiredFields.forEach(field => {
        const value = document.getElementById(field).value.trim();
        if (!value) {
          showError(field, 'This field is required');
          isValid = false;
        }
      });

      const email = document.getElementById('email').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
      }

      const phone = document.getElementById('phone').value.trim();
      const phoneRegex = /^[0-9]{10}$/;
      if (phone && !phoneRegex.test(phone)) {
        showError('phone', 'Phone number must be 10 digits');
        isValid = false;
      }

      const category = document.getElementById('category').value;
      if (category === 'school') {
        const schoolClass = document.getElementById('school_class').value;
        if (!schoolClass) {
          showError('school_class', 'Please select your class/grade');
          isValid = false;
        }
      } else if (category === 'internship') {
        const internship = document.getElementById('internship').value;
        if (!internship) {
          showError('internship', 'Please select an internship program');
          isValid = false;
        }

        const termsAccepted = document.getElementById('termsCheckbox').checked;
        if (!termsAccepted) {
          showError('termsAccepted', 'You must accept the terms and conditions');
          isValid = false;
        }
      } else if (category === 'it_services') {
        const itService = document.getElementById('it_service').value;
        if (!itService) {
          showError('it_service', 'Please select an IT service');
          isValid = false;
        }
      }

      return isValid;
    };


    const getFormData = () => {
      const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        category: document.getElementById('category').value,
        message: document.getElementById('message').value.trim()
      };

      // Add category-specific fields
      if (formData.category === 'school') {
        formData.school_class = document.getElementById('school_class').value;
      } else if (formData.category === 'internship') {
        formData.internship = document.getElementById('internship').value;
        formData.termsAccepted = document.getElementById('termsCheckbox').checked;
      } else if (formData.category === 'it_services') {
        formData.it_service = document.getElementById('it_service').value;
      }

      return formData;
    };

    // Reset form
    const resetForm = () => {
      document.getElementById('enquiryForm').reset();
      toggleSubOptions('');
      document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
      });
      document.querySelectorAll('.enquiry-form-input, .enquiry-form-select').forEach(el => {
        el.classList.remove('error');
      });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const submitBtn = document.querySelector('.enquiry-submit-btn');
      const originalBtnText = submitBtn.innerHTML;

      try {
       
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        const formData = getFormData();

        // Send data to backend
        const response = await axios.post(
          'http://localhost:5000/api/mail/send-enquiry',
          formData
        );

        if (response.data.success) {
          Toastify({
            text: "Thank you! Your enquiry has been sent successfully.",
            duration: 3000,
            backgroundColor: "#8dc63f",
            position: "center",
            className: "toast-success"
          }).showToast();

          resetForm();
        }
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error.response?.data?.message ||
          "Failed to submit form. Please try again.";

        Toastify({
          text: errorMessage,
          duration: 3000,
          backgroundColor: "#e74c3c",
          position: "center",
          className: "toast-error"
        }).showToast();
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalBtnText;
      }
    };

 
    const enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
      enquiryForm.addEventListener('submit', handleSubmit);

      const categorySelect = document.getElementById('category');
      if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
          toggleSubOptions(e.target.value);
          clearError('category');
        });
      }

      // Handle terms checkbox change
      const termsCheckbox = document.getElementById('termsCheckbox');
      if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
          clearError('termsAccepted');
        });
      }

      // Handle input blur for validation
      const validateOnBlur = (e) => {
        const field = e.target;
        const fieldId = field.id;
        const value = field.value.trim();

        clearError(fieldId);

        // Validate field
        if (field.required && !value) {
          showError(fieldId, 'This field is required');
        } else if (fieldId === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          showError(fieldId, 'Please enter a valid email address');
        } else if (fieldId === 'phone' && value && !/^[0-9]{10}$/.test(value)) {
          showError(fieldId, 'Phone number must be 10 digits');
        }
      };

      document.querySelectorAll('#name, #email, #phone, #category').forEach(field => {
        field.addEventListener('blur', validateOnBlur);
      });

      document.querySelectorAll('#school_class, #internship, #it_service').forEach(field => {
        field.addEventListener('blur', validateOnBlur);
      });

   
      if (categorySelect.value) {
        toggleSubOptions(categorySelect.value);
      }
    }
  };

 // Initialize All Functions 
  animateForm();
  initializeEnquiryForm();
  setupMobileNav();

// Additional Styles for Toast Notifications
  const style = document.createElement('style');
  style.textContent = `
    .toast-success {
      font-family: 'Poppins', sans-serif;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(141, 198, 63, 0.3);
    }
    .toast-error {
      font-family: 'Poppins', sans-serif;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
    }
  `;
  document.head.appendChild(style);
});