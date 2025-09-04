import CryptoJS from 'crypto-js';

class SpamProtection {
  constructor() {
    this.STORAGE_PREFIX = 'spam_protection_';
    this.MAX_LOGIN_ATTEMPTS = 5;
    this.MAX_REGISTRATION_ATTEMPTS = 3;
    this.BLOCK_DURATION = 900; // 15 minutes in seconds
    this.REGISTRATION_BLOCK_DURATION = 1800; // 30 minutes in seconds
  }

  // Generate device fingerprint for web
  async getDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint(),
      fonts: this.getFontFingerprint(),
    };

    return CryptoJS.SHA256(JSON.stringify(fingerprint)).toString();
  }

  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'no-webgl';

      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      
      return `${vendor}~${renderer}`;
    } catch (e) {
      return 'webgl-error';
    }
  }

  getFontFingerprint() {
    const fonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact'
    ];

    const available = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    for (const font of fonts) {
      context.font = `${testSize} ${font}`;
      const width = context.measureText(testString).width;
      available.push(`${font}:${width}`);
    }

    return available.join(',');
  }

  // Store attempt data
  async storeAttempt(key, data) {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store attempt data:', error);
    }
  }

  // Get attempt data
  async getAttemptData(key) {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get attempt data:', error);
      return null;
    }
  }

  // Check login attempts
  async checkLoginAttempts(deviceFingerprint) {
    const key = `login_${deviceFingerprint}`;
    const data = await this.getAttemptData(key);

    if (!data) {
      return { attempts: 0, isBlocked: false, remainingTime: 0 };
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - data.lastAttempt;
    const timeSinceBlock = now - (data.blockTime || 0);

    // Check if block period has expired
    if (data.isBlocked && timeSinceBlock > this.BLOCK_DURATION * 1000) {
      await this.resetLoginAttempts(deviceFingerprint);
      return { attempts: 0, isBlocked: false, remainingTime: 0 };
    }

    // Reset attempts if more than 1 hour has passed
    if (timeSinceLastAttempt > 3600000) { // 1 hour
      await this.resetLoginAttempts(deviceFingerprint);
      return { attempts: 0, isBlocked: false, remainingTime: 0 };
    }

    const remainingTime = data.isBlocked 
      ? Math.max(0, this.BLOCK_DURATION - Math.floor(timeSinceBlock / 1000))
      : 0;

    return {
      attempts: data.attempts || 0,
      isBlocked: data.isBlocked || false,
      remainingTime,
    };
  }

  // Validate login attempt
  async validateLoginAttempt(deviceFingerprint) {
    const status = await this.checkLoginAttempts(deviceFingerprint);
    
    if (status.isBlocked) {
      return { allowed: false, blockTime: status.remainingTime };
    }

    // Increment attempts
    const key = `login_${deviceFingerprint}`;
    const data = await this.getAttemptData(key) || { attempts: 0 };
    
    data.attempts += 1;
    data.lastAttempt = Date.now();

    // Block if too many attempts
    if (data.attempts >= this.MAX_LOGIN_ATTEMPTS) {
      data.isBlocked = true;
      data.blockTime = Date.now();
    }

    await this.storeAttempt(key, data);

    return { 
      allowed: !data.isBlocked, 
      blockTime: data.isBlocked ? this.BLOCK_DURATION : 0 
    };
  }

  // Check registration attempts
  async checkRegistrationAttempts(deviceFingerprint) {
    const key = `register_${deviceFingerprint}`;
    const data = await this.getAttemptData(key);

    if (!data) {
      return { attempts: 0, isBlocked: false, remainingTime: 0 };
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - data.lastAttempt;
    const timeSinceBlock = now - (data.blockTime || 0);

    // Check if block period has expired
    if (data.isBlocked && timeSinceBlock > this.REGISTRATION_BLOCK_DURATION * 1000) {
      await this.resetRegistrationAttempts(deviceFingerprint);
      return { attempts: 0, isBlocked: false, remainingTime: 0 };
    }

    // Reset attempts if more than 24 hours has passed
    if (timeSinceLastAttempt > 86400000) { // 24 hours
      await this.resetRegistrationAttempts(deviceFingerprint);
      return { attempts: 0, isBlocked: false, remainingTime: 0 };
    }

    const remainingTime = data.isBlocked 
      ? Math.max(0, this.REGISTRATION_BLOCK_DURATION - Math.floor(timeSinceBlock / 1000))
      : 0;

    return {
      attempts: data.attempts || 0,
      isBlocked: data.isBlocked || false,
      remainingTime,
    };
  }

  // Validate registration attempt
  async validateRegistrationAttempt(deviceFingerprint) {
    const status = await this.checkRegistrationAttempts(deviceFingerprint);
    
    if (status.isBlocked) {
      return { allowed: false, blockTime: status.remainingTime };
    }

    // Increment attempts
    const key = `register_${deviceFingerprint}`;
    const data = await this.getAttemptData(key) || { attempts: 0 };
    
    data.attempts += 1;
    data.lastAttempt = Date.now();

    // Block if too many attempts
    if (data.attempts >= this.MAX_REGISTRATION_ATTEMPTS) {
      data.isBlocked = true;
      data.blockTime = Date.now();
    }

    await this.storeAttempt(key, data);

    return { 
      allowed: !data.isBlocked, 
      blockTime: data.isBlocked ? this.REGISTRATION_BLOCK_DURATION : 0 
    };
  }

  // Reset login attempts
  async resetLoginAttempts(deviceFingerprint) {
    const key = `login_${deviceFingerprint}`;
    localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
  }

  // Reset registration attempts
  async resetRegistrationAttempts(deviceFingerprint) {
    const key = `register_${deviceFingerprint}`;
    localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
  }

  // Block device
  async blockDevice(deviceFingerprint, duration) {
    const loginKey = `login_${deviceFingerprint}`;
    const registerKey = `register_${deviceFingerprint}`;
    
    const blockData = {
      isBlocked: true,
      blockTime: Date.now(),
      attempts: this.MAX_LOGIN_ATTEMPTS,
    };

    await this.storeAttempt(loginKey, blockData);
    await this.storeAttempt(registerKey, blockData);
  }

  // Rate limiting for API calls
  async checkRateLimit(action, deviceFingerprint, limit = 10, window = 60000) {
    const key = `rate_${action}_${deviceFingerprint}`;
    const data = await this.getAttemptData(key) || { requests: [], lastReset: Date.now() };
    
    const now = Date.now();
    const windowStart = now - window;
    
    // Remove old requests outside the time window
    data.requests = data.requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (data.requests.length >= limit) {
      return { allowed: false, resetTime: data.requests[0] + window };
    }
    
    // Add current request
    data.requests.push(now);
    await this.storeAttempt(key, data);
    
    return { allowed: true };
  }

  // Check for suspicious patterns
  async detectSuspiciousActivity(deviceFingerprint, userAgent, ipAddress) {
    const patterns = {
      // Check for bot user agents
      isBot: /bot|crawler|spider|scraper/i.test(userAgent),
      
      // Check for suspicious IP patterns (you'd implement IP checking here)
      suspiciousIP: false, // Implement IP reputation checking
      
      // Check for rapid requests
      rapidRequests: await this.checkRapidRequests(deviceFingerprint),
      
      // Check for multiple accounts from same device
      multipleAccounts: await this.checkMultipleAccounts(deviceFingerprint),
    };

    return {
      isSuspicious: Object.values(patterns).some(Boolean),
      patterns,
    };
  }

  async checkRapidRequests(deviceFingerprint) {
    const rateLimit = await this.checkRateLimit('general', deviceFingerprint, 50, 60000);
    return !rateLimit.allowed;
  }

  async checkMultipleAccounts(deviceFingerprint) {
    // This would check against your backend for multiple accounts
    // from the same device fingerprint
    return false; // Implement based on your backend logic
  }

  // Honeypot field validation (add hidden fields to forms)
  validateHoneypot(honeypotValue) {
    // If honeypot field has value, it's likely a bot
    return honeypotValue === '' || honeypotValue === undefined;
  }

  // Clean up old spam protection data
  async cleanupOldData() {
    try {
      const keys = Object.keys(localStorage);
      const spamKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
      const cutoff = Date.now() - 86400000; // 24 hours

      for (const key of spamKeys) {
        const data = await this.getAttemptData(key.replace(this.STORAGE_PREFIX, ''));
        if (data && data.lastAttempt < cutoff) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

export const spamProtection = new SpamProtection();