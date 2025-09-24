class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.fields = {
            username: document.getElementById('username'),
            password: document.getElementById('password')
        };
        this.errors = {
            username: document.getElementById('usernameError'),
            password: document.getElementById('passwordError')
        };
        this.alerts = {
            error: document.getElementById('errorAlert'),
            success: document.getElementById('successAlert')
        };
        this.submitBtn = document.querySelector('.login-btn');
        this.passwordToggle = document.getElementById('togglePassword');
        this.eyeIcon = document.getElementById('eyeIcon');
        this.rememberCheckbox = document.getElementById('remember');
        
        this.maxAttempts = 3;
        this.attemptCount = parseInt(sessionStorage.getItem('loginAttempts') || '0');
        this.lockoutTime = 15 * 60 * 1000; // 15 minutes
        
        this.init();
    }

    init() {
        // Check if user is locked out
        this.checkLockout();
        
        // Load saved username if "remember me" was checked
        this.loadSavedCredentials();
        
        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            field.addEventListener('blur', () => this.validateField(fieldName));
            field.addEventListener('input', () => this.clearError(fieldName));
        });

        // Password toggle functionality
        this.passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Social login buttons
        document.querySelector('.google-btn').addEventListener('click', () => this.handleSocialLogin('google'));
        document.querySelector('.facebook-btn').addEventListener('click', () => this.handleSocialLogin('facebook'));

        // Alert close buttons
        document.getElementById('closeError').addEventListener('click', () => this.hideAlert('error'));
        document.getElementById('closeSuccess').addEventListener('click', () => this.hideAlert('success'));

        // Enter key handling
        Object.values(this.fields).forEach(field => {
            field.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.form.dispatchEvent(new Event('submit'));
                }
            });
        });

        // Auto-hide alerts after 5 seconds
        this.autoHideAlerts();
    }

    checkLockout() {
        const lockoutUntil = sessionStorage.getItem('lockoutUntil');
        if (lockoutUntil && new Date().getTime() < parseInt(lockoutUntil)) {
            const remainingTime = Math.ceil((parseInt(lockoutUntil) - new Date().getTime()) / 60000);
            this.showAlert('error', `Too many failed attempts. Please try again in ${remainingTime} minutes.`);
            this.disableForm();
            
            // Set timeout to re-enable form
            setTimeout(() => {
                this.enableForm();
                this.resetAttempts();
                this.hideAlert('error');
            }, parseInt(lockoutUntil) - new Date().getTime());
        }
    }

    loadSavedCredentials() {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            this.fields.username.value = savedUsername;
            this.rememberCheckbox.checked = true;
        }
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'username':
                if (!value) {
                    errorMessage = 'Username or email is required';
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = 'Username must be at least 3 characters';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = 'Password is required';
                    isValid = false;
                } else if (value.length < 6) {
                    errorMessage = 'Password must be at least 6 characters';
                    isValid = false;
                }
                break;
        }

        this.setFieldState(fieldName, isValid, errorMessage);
        return isValid;
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

    togglePasswordVisibility() {
        const passwordField = this.fields.password;
        const isPassword = passwordField.type === 'password';
        
        passwordField.type = isPassword ? 'text' : 'password';
        this.eyeIcon.textContent = isPassword ? '🙈' : '👁';
        
        // Maintain cursor position
        const cursorPosition = passwordField.selectionStart;
        passwordField.focus();
        passwordField.setSelectionRange(cursorPosition, cursorPosition);
    }

    validateForm() {
        let isFormValid = true;

        Object.keys(this.fields).forEach(fieldName => {
            const isFieldValid = this.validateField(fieldName);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });

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

    disableForm() {
        Object.values(this.fields).forEach(field => {
            field.disabled = true;
        });
        this.submitBtn.disabled = true;
        this.passwordToggle.disabled = true;
    }

    enableForm() {
        Object.values(this.fields).forEach(field => {
            field.disabled = false;
        });
        this.submitBtn.disabled = false;
        this.passwordToggle.disabled = false;
    }

    showAlert(type, message) {
        const alert = this.alerts[type];
        const messageElement = type === 'error' ? 
            document.getElementById('errorMessage') : 
            document.getElementById('successMessage');
        
        messageElement.textContent = message;
        alert.classList.add('show');

        // Hide other alerts
        Object.keys(this.alerts).forEach(alertType => {
            if (alertType !== type) {
                this.alerts[alertType].classList.remove('show');
            }
        });
    }

    hideAlert(type) {
        this.alerts[type].classList.remove('show');
    }

    autoHideAlerts() {
        Object.keys(this.alerts).forEach(type => {
            const alert = this.alerts[type];
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        mutation.attributeName === 'class' && 
                        alert.classList.contains('show')) {
                        setTimeout(() => {
                            alert.classList.remove('show');
                        }, 5000);
                    }
                });
            });
            
            observer.observe(alert, { attributes: true });
        });
    }

    handleRememberMe() {
        if (this.rememberCheckbox.checked) {
            localStorage.setItem('rememberedUsername', this.fields.username.value);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
    }

    incrementAttempts() {
        this.attemptCount++;
        sessionStorage.setItem('loginAttempts', this.attemptCount.toString());
        
        if (this.attemptCount >= this.maxAttempts) {
            const lockoutUntil = new Date().getTime() + this.lockoutTime;
            sessionStorage.setItem('lockoutUntil', lockoutUntil.toString());
            this.showAlert('error', 'Too many failed attempts. Account temporarily locked for 15 minutes.');
            this.disableForm();
            
            setTimeout(() => {
                this.enableForm();
                this.resetAttempts();
                this.hideAlert('error');
            }, this.lockoutTime);
        }
    }

    resetAttempts() {
        this.attemptCount = 0;
        sessionStorage.removeItem('loginAttempts');
        sessionStorage.removeItem('lockoutUntil');
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Check if form is disabled due to lockout
        if (this.submitBtn.disabled) {
            return;
        }

        // Validate the form
        const isValid = this.validateForm();
        if (!isValid) {
            const firstErrorField = this.form.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
            return;
        }

        // Show loading state
        this.showLoadingState();

        try {
            // Attempt login
            const result = await this.submitLogin();
            
            if (result.success) {
                this.resetAttempts();
                this.handleRememberMe();
                this.showAlert('success', result.message || 'Login successful! Redirecting...');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = result.redirect || 'dashboard.html';
                }, 2000);
            } else {
                this.incrementAttempts();
                const remainingAttempts = this.maxAttempts - this.attemptCount;
                let errorMessage = result.message || 'Invalid username or password';
                
                if (remainingAttempts > 0 && this.attemptCount > 0) {
                    errorMessage += ` (${remainingAttempts} attempts remaining)`;
                }
                
                this.showAlert('error', errorMessage);
                
                // Clear password field on failed attempt
                this.fields.password.value = '';
                this.fields.password.focus();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('error', 'An error occurred. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    async submitLogin() {
        // Get form data
        const formData = new FormData(this.form);
        
        try {
            const response = await fetch('login.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                // Handle non-JSON response (e.g., redirect from server)
                const text = await response.text();
                return { success: true, message: 'Login successful', redirect: 'dashboard.html' };
            }
        } catch (error) {
            console.error('Network error:', error);
            throw new Error('Network error occurred');
        }
    }

    async handleSocialLogin(provider) {
        this.showAlert('success', `Redirecting to ${provider} login...`);
        
        // Simulate social login
        setTimeout(() => {
            // In a real application, you would redirect to the OAuth provider
            switch (provider) {
                case 'google':
                    // window.location.href = '/auth/google';
                    this.showAlert('error', 'Google login is not implemented yet');
                    break;
                case 'facebook':
                    // window.location.href = '/auth/facebook';
                    this.showAlert('error', 'Facebook login is not implemented yet');
                    break;
            }
        }, 1000);
    }

    // Utility method to get form data
    getFormData() {
        return {
            username: this.fields.username.value.trim(),
            password: this.fields.password.value,
            remember: this.rememberCheckbox.checked
        };
    }

    // Method to handle successful login (can be called externally)
    handleSuccessfulLogin(userData) {
        this.resetAttempts();
        this.handleRememberMe();
        
        // Store user data if needed
        if (userData.user) {
            sessionStorage.setItem('user', JSON.stringify(userData.user));
        }
        
        this.showAlert('success', 'Welcome back! Redirecting...');
        
        setTimeout(() => {
            window.location.href = userData.redirect || 'dashboard.html';
        }, 1500);
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});

// Utility functions
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

// Handle browser back/forward navigation
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was loaded from cache, reset form state
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
        }
    }
});