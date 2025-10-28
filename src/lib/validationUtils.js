export const validateProductName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Ürün adı zorunludur' };
  }
  
  if (name.trim().length < 3) {
    return { isValid: false, message: 'Ürün adı en az 3 karakter olmalıdır' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, message: 'Ürün adı en fazla 100 karakter olabilir' };
  }
  
  return { isValid: true, message: '' };
};


export const validateProductDescription = (description) => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, message: 'Ürün açıklaması zorunludur' };
  }
  
  if (description.trim().length < 10) {
    return { isValid: false, message: 'Ürün açıklaması en az 10 karakter olmalıdır' };
  }
  
  if (description.length > 2000) {
    return { isValid: false, message: 'Ürün açıklaması en fazla 2000 karakter olabilir' };
  }
  
  return { isValid: true, message: '' };
};


export const validateProductPrice = (price) => {
  if (!price || price === '') {
    return { isValid: false, message: 'Ürün fiyatı zorunludur' };
  }
  
  const priceNum = Number(price);
  
  if (isNaN(priceNum)) {
    return { isValid: false, message: 'Geçerli bir fiyat giriniz' };
  }
  
  if (priceNum <= 0) {
    return { isValid: false, message: 'Fiyat 0\'dan büyük olmalıdır' };
  }
  
  if (priceNum > 999999.99) {
    return { isValid: false, message: 'Fiyat 999.999,99 TL\'den fazla olamaz' };
  }
  
  return { isValid: true, message: '' };
};


export const validateProduct = (product) => {
  const errors = {};
  
  const nameValidation = validateProductName(product.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  
  const descriptionValidation = validateProductDescription(product.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.message;
  }
  
  const priceValidation = validateProductPrice(product.price);
  if (!priceValidation.isValid) {
    errors.price = priceValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};


export const getCharacterCount = (text, maxLength) => {
  const current = text ? text.length : 0;
  const remaining = maxLength - current;
  
  return {
    current,
    max: maxLength,
    remaining
  };
};
