/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Removes the green screen background from an image.
 * Assumes the AI generated a specific green background (#00FF00).
 */
export const removeGreenScreen = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Iterate through every pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Improved Green Screen Logic:
        // Instead of a multiplicative ratio which fails on lighter greens,
        // we use a difference threshold.
        // Pure green (0,255,0): g-r=255, g-b=255.
        // Light green (150,255,150): g-r=105, g-b=105.
        // We also check if Green is > 90 to avoid removing dark areas that aren't background.
        
        const threshold = 45;

        if (g > 90 && (g - r) > threshold && (g - b) > threshold) {
          // Set alpha to 0 (transparent)
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (err) => reject(err);
  });
};