
/**
 * Processes an image file to ensure it's suitable for storage and API usage.
 * - Resizes large images to a max dimension (default 800px) to save space.
 * - Compresses to JPEG with reduced quality.
 * - Returns a base64 string.
 *
 * @param file The image file to process
 * @param maxDimension Maximum width or height in pixels
 * @param quality JPEG quality (0.0 to 1.0)
 * @returns Promise resolving to base64 string
 */
export const processImage = (
  file: File,
  maxDimension: number = 800,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Formato de arquivo inválido. Apenas imagens são permitidas.'));
      return;
    }

    // Fail fast for incredibly large files (e.g., > 20MB) that might crash the browser
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('A imagem é muito grande. Por favor, escolha uma imagem menor que 20MB.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Não foi possível processar a imagem.'));
            return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar a imagem.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo.'));
    };
  });
};
