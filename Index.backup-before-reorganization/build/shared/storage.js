// ============================================================
// GLRS LIGHTHOUSE - STORAGE SERVICE
// ============================================================
// Firebase Storage operations and image processing
// Part of modular architecture - handles file uploads
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.services = window.GLRSApp.services || {};

// Get storage reference from config.js (already initialized)
// Note: storage is accessed via window.GLRSApp.storage throughout this file to avoid global const conflicts
if (!window.GLRSApp.storage && !window.storage) {
  console.warn('⚠️ Firebase Storage not initialized');
}

// ============================================================
// IMAGE PROCESSING & UPLOAD
// ============================================================

window.GLRSApp.services.storage = {
  // Upload chat image with compression (returns data URL)
  uploadChatImage: async (file, chatType, roomId) => {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      // First compress the image
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set max dimensions
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = maxWidth / width * height;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = maxHeight / height * width;
              height = maxHeight;
            }
          }

          // Set canvas size and draw compressed image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to data URL directly
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

          // Check size
          if (dataUrl.length > 900000) {
            // ~900KB limit for safety
            alert('Image too large. Please choose a smaller image.');
            reject(new Error('Image too large after compression'));
            return;
          }

          // Return the data URL directly - no Firestore save needed here
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  // Generic file upload with progress tracking to Firebase Storage
  uploadFile: async (file, path, onProgress) => {
    if (!window.GLRSApp.storage && !window.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    const storageRef = window.GLRSApp.storage.ref(path);
    const uploadTask = storageRef.put(file);
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', snapshot => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        if (onProgress) onProgress(progress);
      }, error => reject(error), async () => {
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        resolve(downloadURL);
      });
    });
  },
  // Upload data URL to Firebase Storage (alternative method)
  uploadDataURL: async (dataURL, path) => {
    if (!window.GLRSApp.storage && !window.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    const storageRef = window.GLRSApp.storage.ref(path);
    await storageRef.putString(dataURL, 'data_url');
    return await storageRef.getDownloadURL();
  },
  // Delete file from Firebase Storage
  deleteFile: async path => {
    if (!window.GLRSApp.storage && !window.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    const storageRef = window.GLRSApp.storage.ref(path);
    await storageRef.delete();
    return true;
  },
  // Get download URL for a file
  getDownloadURL: async path => {
    if (!window.GLRSApp.storage && !window.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    const storageRef = window.GLRSApp.storage.ref(path);
    return await storageRef.getDownloadURL();
  },
  // Compress image without uploading (utility function)
  compressImage: async (file, maxWidth = 800, maxHeight = 800, quality = 0.6) => {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = maxWidth / width * height;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = maxHeight / height * width;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================

// Expose service methods at root level for backward compatibility
window.uploadChatImage = window.GLRSApp.services.storage.uploadChatImage;
window.uploadFile = window.GLRSApp.services.storage.uploadFile;
window.compressImage = window.GLRSApp.services.storage.compressImage;
console.log('✅ storage.js loaded - Storage service available');