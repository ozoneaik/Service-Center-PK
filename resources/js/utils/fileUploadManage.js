// ตรวจสอบประเภทไฟล์
export const isValidFileType = (file) => {
    const validTypes = [
        // รูปภาพ
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'image/webp', 'image/bmp', 'image/svg+xml',
        // วิดีโอ
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'video/flv', 'video/webm', 'video/mkv'
    ];
    return validTypes.includes(file.type);
};

// ตรวจสอบขนาดไฟล์ (5MB = 5 * 1024 * 1024 bytes)
export const isValidFileSize = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB (แก้ไขจาก comment ที่บอก 10MB)
    return file.size <= maxSize;
};

// แปลงขนาดไฟล์เป็น readable format
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// สร้าง preview URL สำหรับไฟล์
export const createPreviewUrl = (file) => {
    if (file instanceof File) {
        return URL.createObjectURL(file);
    }
    // สำหรับไฟล์ที่มาจาก server (มี full_file_path)
    return file.full_file_path || file.file_path;
};

// ดึงชื่อไฟล์
export const getFileName = (fileObj) => {
    if (fileObj.file instanceof File) {
        return fileObj.file.name;
    }
    // สำหรับไฟล์ที่มาจาก server
    return fileObj.name || fileObj.file_path?.split('/').pop() || 'Unknown file';
};

// ดึงขนาดไฟล์
export const getFileSize = (fileObj) => {
    if (fileObj.file instanceof File) {
        return fileObj.file.size;
    }
    // สำหรับไฟล์ที่มาจาก server อาจไม่มี size
    return fileObj.size || 0;
};

// ดึงประเภทไฟล์
export const getFileType = (fileObj) => {
    if (fileObj.file instanceof File) {
        return fileObj.file.type;
    }
    // สำหรับไฟล์ที่มาจาก server ต้องเดาจาก extension
    const fileName = getFileName(fileObj);
    const extension = fileName.split('.').pop()?.toLowerCase();

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];

    if (imageExtensions.includes(extension)) {
        return 'image/' + extension;
    } else if (videoExtensions.includes(extension)) {
        return 'video/' + extension;
    }
    return 'unknown';
};
