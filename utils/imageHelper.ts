import { MAX_IMAGE_WIDTH, IMAGE_QUALITY } from '../constants';

export const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize logic to maintain aspect ratio but limit max width
        if (width > MAX_IMAGE_WIDTH) {
          height = Math.round((height * MAX_IMAGE_WIDTH) / width);
          width = MAX_IMAGE_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as JPEG with reduced quality to hit target file size (approx < 1MB)
        // Using image/jpeg ensures 96dpi is irrelevant for web display but file size is managed
        const base64 = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
        // Remove the prefix "data:image/jpeg;base64," for Google Apps Script
        resolve(base64.split(',')[1]); 
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
