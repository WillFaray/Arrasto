/**
 * Removes white or near-white background from an image Blob,
 * converting white pixels to transparent alpha = 0.
 */
export async function removeWhiteBackground(
  blob: Blob,
  tolerance = 238
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(blob);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If near white, turn transparent
          if (r >= tolerance && g >= tolerance && b >= tolerance) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        canvas.toBlob((newBlob) => {
          URL.revokeObjectURL(url);
          if (newBlob) {
            resolve(newBlob);
          } else {
            resolve(blob);
          }
        }, 'image/png');
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    img.src = url;
  });
}
