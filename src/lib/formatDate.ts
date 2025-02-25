const formatDate = (dateString: Date | string | null) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // Ensure we're working with a stable date format
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  // Return in MM/DD/YYYY format
  return `${month}/${day}/${year}`;
};

export default formatDate