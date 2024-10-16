const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // To avoid CORS issues
      image.src = url;
    });
  
  export const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
  
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File object from the blob
          const file = new File([blob], `cropped_${Date.now()}.jpeg`, { type: 'image/jpeg' });
          resolve(file); // Resolve with the File object
        } else {
          console.error("Blob conversion failed.");
          resolve(null);
        }
      }, "image/jpeg");
    });
  };
  
  export default getCroppedImg;
  