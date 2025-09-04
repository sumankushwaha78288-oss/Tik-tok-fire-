class Validation {
  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Username validation
  isValidUsername(username) {
    // 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  // Phone validation (Indian format)
  isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  // Strong password validation
  isStrongPassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  // Get password strength percentage
  getPasswordStrength(password) {
    if (!password) return 0;
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
      longLength: password.length >= 12,
    };

    // Calculate score
    Object.values(checks).forEach(check => {
      if (check) score += 1;
    });

    // Additional points for very long passwords
    if (password.length >= 16) score += 1;
    if (password.length >= 20) score += 1;

    return Math.min(100, (score / 8) * 100);
  }

  // Validate full name
  isValidFullName(name) {
    return name.trim().length >= 2 && name.trim().length <= 50;
  }

  // Check for common passwords
  isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'dragon', 'master', 'hello', 'login', 'admin123'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  // Validate age (for registration)
  isValidAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 13; // Minimum age for social media
  }

  // Sanitize input to prevent XSS
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Check for SQL injection patterns
  containsSQLInjection(input) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|#|\/\*|\*\/)/,
      /(\b(OR|AND)\b.*=.*)/i,
      /(CONCAT|CHAR|ASCII|SUBSTRING|LENGTH)/i,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Validate file upload
  isValidImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return {
      isValid: allowedTypes.includes(file.type) && file.size <= maxSize,
      error: !allowedTypes.includes(file.type) 
        ? 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
        : file.size > maxSize 
        ? 'File size too large. Maximum 10MB allowed.'
        : null
    };
  }

  // Validate video file
  isValidVideoFile(file) {
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    return {
      isValid: allowedTypes.includes(file.type) && file.size <= maxSize,
      error: !allowedTypes.includes(file.type) 
        ? 'Invalid file type. Only MP4, MPEG, MOV, and WebM are allowed.'
        : file.size > maxSize 
        ? 'File size too large. Maximum 100MB allowed.'
        : null
    };
  }

  // Check for profanity (basic implementation)
  containsProfanity(text) {
    const profanityList = [
      // Add your profanity words here
      'spam', 'scam', 'fake', 'bot'
    ];
    
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
  }

  // Validate URL
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Check for spam patterns in text
  isSpamText(text) {
    const spamPatterns = [
      /(.)\1{4,}/, // Repeated characters
      /[A-Z]{5,}/, // Too many capitals
      /\b(click here|buy now|limited time|act now|free money)\b/i,
      /(http|www\.)/g, // Multiple URLs
      /\b\d{4,}\b/, // Long numbers (might be phone/card numbers)
    ];

    let spamScore = 0;
    spamPatterns.forEach(pattern => {
      if (pattern.test(text)) spamScore += 1;
    });

    // Check URL count
    const urlCount = (text.match(/(http|www\.)/g) || []).length;
    if (urlCount > 2) spamScore += 2;

    return spamScore >= 3;
  }

  // Validate bet amount for games
  isValidBetAmount(amount, minBet = 10, maxBet = 10000) {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount >= minBet && numAmount <= maxBet;
  }

  // Validate stake amount
  isValidStakeAmount(amount, userBalance) {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= userBalance;
  }

  // Check for disposable email
  isDisposableEmail(email) {
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
      'temp-mail.org',
      // Add more disposable email domains
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  }

  // Validate Indian PAN number
  isValidPAN(pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }

  // Validate Indian Aadhaar number
  isValidAadhaar(aadhaar) {
    const aadhaarRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
    return aadhaarRegex.test(aadhaar);
  }

  // Validate UPI ID
  isValidUPI(upi) {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(upi);
  }

  // Rate limiting validation
  checkRateLimit(key, maxRequests = 10, timeWindow = 60000) {
    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem(`rate_${key}`) || '[]');
    
    // Filter requests within time window
    const recentRequests = requests.filter(timestamp => now - timestamp < timeWindow);
    
    if (recentRequests.length >= maxRequests) {
      return { allowed: false, resetTime: recentRequests[0] + timeWindow };
    }
    
    // Add current request
    recentRequests.push(now);
    localStorage.setItem(`rate_${key}`, JSON.stringify(recentRequests));
    
    return { allowed: true };
  }

  // Validate form data comprehensively
  validateRegistrationForm(formData) {
    const errors = {};

    // Full Name
    if (!this.isValidFullName(formData.fullName)) {
      errors.fullName = 'Full name must be 2-50 characters';
    }

    // Username
    if (!this.isValidUsername(formData.username)) {
      errors.username = 'Username must be 3-20 characters, alphanumeric and underscores only';
    }

    // Email
    if (!this.isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (this.isDisposableEmail(formData.email)) {
      errors.email = 'Disposable email addresses are not allowed';
    }

    // Phone
    if (!this.isValidPhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    // Password
    if (!this.isStrongPassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
    } else if (this.isCommonPassword(formData.password)) {
      errors.password = 'Please choose a more secure password';
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Check for spam in text fields
    if (this.isSpamText(formData.fullName) || this.isSpamText(formData.username)) {
      errors.spam = 'Suspicious content detected. Please use appropriate information.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate login form
  validateLoginForm(formData) {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username or email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    // Check for SQL injection
    if (this.containsSQLInjection(formData.username) || this.containsSQLInjection(formData.password)) {
      errors.security = 'Invalid characters detected';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export const validation = new Validation();