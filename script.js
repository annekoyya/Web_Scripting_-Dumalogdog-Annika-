class RegistrationForm {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.fields = {
            fullname: document.getElementById('fullname'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            confirm_password: document.getElementById('confirm_password'),
            gender: document.querySelector('input[name="gender"]'),
            country: document.getElementById('country'),
            terms: document.getElementById('terms')
        };
        this.errors = {
            fullname: document.getElementById('fullnameError'),
            email: document.getElementById('emailError'),
            password: document.getElementById('passwordError'),
            confirm_password: document.getElementById('confirmPasswordError'),
            country: document.getElementById('countryError'),
            terms: document.getElementById('termsError')
        };
        this.submitBtn = document.querySelector('.submit-btn');
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
        
        this.init();
    }

    init() {
        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field && fieldName !== 'gender') {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => {
                    this.clearError(fieldName);
                    if (fieldName === 'password') {
                        this.updatePasswordStrength();
                    }
                    if (fieldName === 'confirm_password') {
                        this.validatePasswordMatch();
                    }
                });
            }
        });

        // Gender validation
        document.querySelectorAll('input[name="gender"]').forEach(radio => {
            radio.addEventListener('change', () => this.validateGender());
        });

        // Terms validation
        this.fields.terms.addEventListener('change', () => this.validateTerms());

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Password strength on input
        this.fields.password.addEventListener('input', () => this.updatePasswordStrength());
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'fullname':
                if (!value) {
                    errorMessage = 'Full name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Full name must be at least 2 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    errorMessage = 'Full name should only contain letters and spaces';
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!this.isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;

            case 'password':
                const strength = this.getPasswordStrength(value);
                if (!value) {
                    errorMessage = 'Password is required';
                    isValid = false;
                } else if (value.length < 8) {
                    errorMessage = 'Password must be at least 8 characters';
                    isValid = false;
                } else if (strength.score < 2) {
                    errorMessage = 'Password is too weak. Include uppercase, lowercase, numbers, and special characters';
                    isValid = false;
                }
                break;

            case 'confirm_password':
                if (!value) {
                    errorMessage = 'Please confirm your password';
                    isValid = false;
                } else if (value !== this.fields.password.value) {
                    errorMessage = 'Passwords do not match';
                    isValid = false;
                }
                break;

            case 'country':
                if (!value) {
                    errorMessage = 'Please select your country';
                    isValid = false;
                }
                break;

            case 'terms':
                if (!field.checked) {
                    errorMessage = 'You must agree to the terms and conditions';
                    isValid = false;
                }
                break;
        }

        this.setFieldState(fieldName, isValid, errorMessage);
        return isValid;
    }

    validateGender() {
        const selectedGender = document.querySelector('input[name="gender"]:checked');
        const isValid = selectedGender !== null;
        
        if (!isValid) {
            // You can add gender error display here if needed
            return false;
        }
        return true;
    }

    validateTerms() {
        return this.validateField('terms');
    }

    validatePasswordMatch() {
        const password = this.fields.password.value;
        const confirmPassword = this.fields.confirm_password.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.setFieldState('confirm_password', false, 'Passwords do not match');
        } else if (confirmPassword && password === confirmPassword) {
            this.setFieldState('confirm_password', true, '');
        }
    }

    setFieldState(fieldName, isValid, errorMessage) {
        const field = this.fields[fieldName];
        const errorElement = this.errors[fieldName];

        if (field) {
            field.classList.toggle('error', !isValid);
            field.classList.toggle('success', isValid && field.value.trim());
        }

        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }

    clearError(fieldName) {
        const field = this.fields[fieldName];
        const errorElement = this.errors[fieldName];

        if (field) {
            field.classList.remove('error');
        }
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getPasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        let strength = 'weak';
        if (score >= 4) strength = 'strong';
        else if (score >= 3) strength = 'medium';

        return { score, strength, checks };
    }

    updatePasswordStrength() {
        const password = this.fields.password.value;
        const { strength } = this.getPasswordStrength(password);

        this.strengthFill.className = 'strength-fill';
        this.strengthText.textContent = 'Password strength';

        if (password.length > 0) {
            this.strengthFill.classList.add(strength);
            this.strengthText.textContent = `Password strength: ${strength.charAt(0).toUpperCase() + strength.slice(1)}`;
        }
    }

    validateForm() {
        let isFormValid = true;

        // Validate all fields
        Object.keys(this.fields).forEach(fieldName => {
            if (fieldName !== 'gender') {
                const isFieldValid = this.validateField(fieldName);
                if (!isFieldValid) {
                    isFormValid = false;
                }
            }
        });

        // Validate gender separately
        const isGenderValid = this.validateGender();
        if (!isGenderValid) {
            isFormValid = false;
        }

        return isFormValid;
    }

    showLoadingState() {
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
    }

    hideLoadingState() {
        this.submitBtn.classList.remove('loading');
        this.submitBtn.disabled = false;
    }

    showSuccessMessage() {
        // Create success message if it doesn't exist
        let successMessage = document.querySelector('.success-message');
        if (!successMessage) {
            successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Registration successful! Welcome to our community.';
            this.form.parentNode.insertBefore(successMessage, this.form);
        }
        
        successMessage.classList.add('show');
        
        // Hide the form
        this.form.style.display = 'none';
        
        // Scroll to top
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate the entire form
        const isValid = this.validateForm();

        if (!isValid) {
            // Focus on the first error field
            const firstErrorField = this.form.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.focus();
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Show loading state
        this.showLoadingState();

        try {
            // Simulate API call - replace with actual form submission
            await this.submitForm();
            
            // Show success message
            this.showSuccessMessage();
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    async submitForm() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Get hobbies array
        const hobbies = Array.from(document.querySelectorAll('input[name="hobbies[]"]:checked'))
            .map(checkbox => checkbox.value);
        
        data.hobbies = hobbies;

        console.log('Form Data:', data);

        // In a real application, you would send this data to your server
        // Example:
        // const response = await fetch('register.php', {
        //     method: 'POST',
        //     body: formData
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }
        // 
        // return await response.json();

        return { success: true, message: 'Registration successful!' };
    }

    // Utility method to get all form data
    getFormData() {
        const data = {};
        const formData = new FormData(this.form);
        
        for (let [key, value] of formData.entries()) {
            if (key === 'hobbies[]') {
                if (!data.hobbies) data.hobbies = [];
                data.hobbies.push(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationForm();
});

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}