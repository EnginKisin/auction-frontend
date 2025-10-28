export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};


export const truncateDescription = (description, maxLength = 50) => {
  return truncateText(description, maxLength);
};


export const truncateProductName = (name, maxLength = 30) => {
  return truncateText(name, maxLength);
};
