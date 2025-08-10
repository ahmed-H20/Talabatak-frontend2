// utils/cloudinaryUpload.js
// Frontend utility to upload images directly to Cloudinary

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/dummmxfp3/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = 'your_unsigned_preset'; // You'll need to create this

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - Promise that resolves to the image URL
 */
export const uploadImageToCloudinary = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', options.uploadPreset || CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', options.folder || 'products');
    
    // Optional transformations
    if (options.width && options.height) {
      formData.append('transformation', `w_${options.width},h_${options.height},c_fill`);
    }
    
    // Quality optimization
    formData.append('quality', options.quality || 'auto');
    formData.append('format', options.format || 'auto');

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {FileList|Array} files - Array of image files
 * @param {Object} options - Upload options
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Array<string>>} - Promise that resolves to array of image URLs
 */
export const uploadMultipleImagesToCloudinary = async (files, options = {}, onProgress = null) => {
  try {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(async (file, index) => {
      try {
        const url = await uploadImageToCloudinary(file, options);
        
        // Call progress callback if provided
        if (onProgress) {
          onProgress({
            completed: index + 1,
            total: fileArray.length,
            percentage: Math.round(((index + 1) / fileArray.length) * 100),
            currentFile: file.name,
            url: url
          });
        }
        
        return url;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        throw error;
      }
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Create a product with images
 * @param {Object} productData - Product data
 * @param {FileList|Array} imageFiles - Image files to upload
 * @param {File} coverImageFile - Cover image file (optional)
 * @param {Object} options - Upload and API options
 * @returns {Promise<Object>} - Promise that resolves to the created product
 */
export const createProductWithImages = async (productData, imageFiles = [], coverImageFile = null, options = {}) => {
  try {
    let imageUrls = [];
    let coverImageUrl = null;

    // Upload progress tracking
    const onUploadProgress = options.onUploadProgress || (() => {});

    // Upload cover image if provided
    if (coverImageFile) {
      onUploadProgress({ stage: 'uploading_cover', message: 'Uploading cover image...' });
      coverImageUrl = await uploadImageToCloudinary(coverImageFile, {
        folder: 'products/covers',
        width: 1200,
        height: 1600,
        ...options.uploadOptions
      });
    }

    // Upload multiple images if provided
    if (imageFiles && imageFiles.length > 0) {
      onUploadProgress({ stage: 'uploading_images', message: 'Uploading product images...' });
      
      imageUrls = await uploadMultipleImagesToCloudinary(
        imageFiles,
        {
          folder: 'products',
          width: 800,
          height: 800,
          ...options.uploadOptions
        },
        (progress) => {
          onUploadProgress({
            stage: 'uploading_images',
            message: `Uploading ${progress.currentFile}...`,
            progress: progress.percentage
          });
        }
      );
    }

    // Prepare product data with image URLs
    const productPayload = {
      ...productData,
      images: imageUrls,
      ...(coverImageUrl && { imageCover: coverImageUrl })
    };

    onUploadProgress({ stage: 'creating_product', message: 'Creating product...' });

    // Send to your API
    const response = await fetch(options.apiUrl || '/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.token || localStorage.getItem('token')}`
      },
      body: JSON.stringify(productPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }

    const result = await response.json();
    onUploadProgress({ stage: 'completed', message: 'Product created successfully!' });
    
    return result;
  } catch (error) {
    console.error('Error creating product with images:', error);
    throw error;
  }
};

/**
 * Validate image files before upload
 * @param {FileList|Array} files - Files to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateImageFiles = (files, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    maxCount = 10,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = options;

  const fileArray = Array.from(files);
  const errors = [];
  const validFiles = [];

  // Check file count
  if (fileArray.length > maxCount) {
    errors.push(`Too many files. Maximum ${maxCount} files allowed.`);
    return { valid: false, errors, validFiles: [] };
  }

  fileArray.forEach((file, index) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File ${index + 1}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File ${index + 1}: File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
      return;
    }

    validFiles.push(file);
  });

  return {
    valid: errors.length === 0,
    errors,
    validFiles
  };
};

/**
 * Compress image before upload (optional utility)
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Promise that resolves to compressed file
 */
export const compressImage = async (file, options = {}) => {
  return new Promise((resolve) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      type = file.type
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Usage example with React hooks
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState(null);

  const uploadImages = async (files, options = {}) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const validation = validateImageFiles(files);
      if (!validation.valid) {
        throw new Error(validation.errors.join('\n'));
      }

      const urls = await uploadMultipleImagesToCloudinary(
        validation.validFiles,
        options,
        (progressInfo) => {
          setProgress(progressInfo.percentage);
        }
      );

      setUploadedUrls(urls);
      return urls;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setUploadedUrls([]);
    setError(null);
  };

  return {
    uploading,
    progress,
    uploadedUrls,
    error,
    uploadImages,
    reset
  };
};