export const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};


export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
};

export const isSafeFileExtension = (filename, allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
  if (!filename || typeof filename !== 'string') return false;
  
  const extension = filename.toLowerCase().split('.').pop();
  return allowedExtensions.includes(extension);
};


export const isSafeFileSize = (fileSize, maxSizeMB = 5) => {
  if (!fileSize || typeof fileSize !== 'number') return false;
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};


export const validateFileUpload = (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  if (!file) {
    return { isValid: false, message: 'Dosya seçilmedi' };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return { isValid: false, message: 'Desteklenmeyen dosya türü' };
  }

  if (!isSafeFileExtension(file.name, allowedExtensions)) {
    return { isValid: false, message: 'Desteklenmeyen dosya uzantısı' };
  }

  if (!isSafeFileSize(file.size, maxSizeMB)) {
    return { isValid: false, message: `Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz` };
  }

  return { isValid: true, message: '' };
};


export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

