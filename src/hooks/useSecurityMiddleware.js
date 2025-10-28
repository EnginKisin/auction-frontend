import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { escapeHtml, sanitizeUrl, validateFileUpload as validateFileUploadUtil } from '../lib/securityUtils';


export const useSecurityMiddleware = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();


  const secureNavigate = useCallback((path, options = {}) => {
    const sanitizedPath = sanitizeUrl(path);
    if (sanitizedPath) {
      navigate(sanitizedPath, options);
    } else {
      console.warn('Güvensiz URL:', path);
      navigate('/error?reason=invalid-url');
    }
  }, [navigate]);

  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/products', '/auctions/my'];
    const isProtectedRoute = protectedRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    if (isProtectedRoute && !isAuthenticated) {
      navigate('/login?reason=unauthorized');
      return;
    }

    const adminRoutes = ['/admin'];
    const isAdminRoute = adminRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    if (isAdminRoute && (!isAuthenticated || !user?.isAdmin)) {
      navigate('/dashboard?reason=insufficient-permissions');
      return;
    }

  }, [location.pathname, isAuthenticated, user, navigate]);

  const sanitizeInput = useCallback((input, type = 'text') => {
    if (!input) return input;

    switch (type) {
      case 'html':
        return escapeHtml(input);
      case 'url':
        return sanitizeUrl(input);
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) ? input : '';
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(input) ? input : '';
      default:
        return input;
    }
  }, []);

  const sanitizeFormData = useCallback((formData, schema = {}) => {
    const sanitized = {};
    
    Object.keys(formData).forEach(key => {
      const fieldSchema = schema[key] || {};
      const value = formData[key];
      
      if (value !== null && value !== undefined) {
        sanitized[key] = sanitizeInput(value, fieldSchema.type || 'text');
      }
    });
    
    return sanitized;
  }, [sanitizeInput]);

  const safeSetInnerHTML = useCallback((element, content) => {
    if (element && content) {
      element.textContent = content;
    }
  }, []);

  const validateAndSanitizeUrl = useCallback((url) => {
    if (!url) return null;
    
    try {
      const sanitized = sanitizeUrl(url);
      if (sanitized) {
        return sanitized;
      }
    } catch (error) {
      console.warn('URL validation failed:', error);
    }
    
    return null;
  }, []);

  const validateFileUpload = useCallback((file, options = {}) => {
    return validateFileUploadUtil(file, options);
  }, []);

  return {
    secureNavigate,
    sanitizeInput,
    sanitizeFormData,
    safeSetInnerHTML,
    validateAndSanitizeUrl,
    validateFileUpload,
  };
};
