import React, {useState, useCallback} from 'react';
import {
    Box, Button, Typography, Alert, LinearProgress, Chip, Paper,
    IconButton, Card, CardMedia, CardContent, CardActions, Grid2
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    VideoFile as VideoFileIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import {useDropzone} from 'react-dropzone';

export default function RpUploadFileBeforeForm() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState('');

    // ตรวจสอบประเภทไฟล์
    const isValidFileType = (file) => {
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
    const isValidFileSize = (file) => {
        const maxSize = 5 * 1024 * 1024; // 10MB
        return file.size <= maxSize;
    };

    // แปลงขนาดไฟล์เป็น readable format
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // สร้าง preview URL สำหรับไฟล์
    const createPreviewUrl = (file) => {
        return URL.createObjectURL(file);
    };

    // จัดการการเลือกไฟล์
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        setErrors([]);
        const newErrors = [];

        // ตรวจสอบไฟล์ที่ถูกปฏิเสธ
        rejectedFiles.forEach(({file, errors: fileErrors}) => {
            fileErrors.forEach(error => {
                if (error.code === 'file-too-large') {
                    newErrors.push(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (เกิน 10MB)`);
                } else if (error.code === 'file-invalid-type') {
                    newErrors.push(`ไฟล์ ${file.name} ไม่ใช่ประเภทที่รองรับ`);
                }
            });
        });

        // เพิ่มไฟล์ที่ผ่านการตรวจสอบ
        const validFiles = acceptedFiles.filter(file => {
            if (!isValidFileType(file)) {
                newErrors.push(`ไฟล์ ${file.name} ไม่ใช่รูปภาพหรือวิดีโอ`);
                return false;
            }
            if (!isValidFileSize(file)) {
                newErrors.push(`ไฟล์ ${file.name} มีขนาดเกิน 10MB`);
                return false;
            }
            return true;
        });

        if (newErrors.length > 0) {
            setErrors(newErrors);
        }

        // เพิ่มไฟล์ใหม่เข้าไปใน state
        const filesWithPreview = validFiles.map(file => ({
            file,
            preview: createPreviewUrl(file),
            id: Math.random().toString(36).substr(2, 9)
        }));

        setFiles(prev => [...prev, ...filesWithPreview]);
    }, []);

    // ลบไฟล์
    const removeFile = (fileId) => {
        setFiles(prev => {
            const updated = prev.filter(f => f.id !== fileId);
            // ลบ preview URL เพื่อป้องกัน memory leak
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return updated;
        });
    };

    // ล้างไฟล์ทั้งหมด
    const clearAllFiles = () => {
        files.forEach(f => URL.revokeObjectURL(f.preview));
        setFiles([]);
        setErrors([]);
        setSuccess('');
    };

    // กำหนดค่า dropzone
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.svg'],
            'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true
    });


    return (
        <Box>


            {/* File List */}
            {files.length > 0 && (
                <Box sx={{mb: 3}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6">
                            ไฟล์ที่เลือก ({files.length} ไฟล์)
                        </Typography>
                        <Button
                            onClick={clearAllFiles}
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon/>}
                        >
                            ลบทั้งหมด
                        </Button>
                    </Box>

                    <Grid2 container spacing={2}>
                        {files.map((fileObj) => (
                            <Grid2 size={{xs: 12, sm: 6, md: 3}} key={fileObj.id}>
                                <Card>
                                    {fileObj.file.type.startsWith('image/') ? (
                                        <CardMedia
                                            component="img"
                                            height={200}
                                            image={fileObj.preview}
                                            alt={fileObj.file.name}
                                            sx={{objectFit: 'cover'}}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                height: 200,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'grey.100'
                                            }}
                                        >
                                            <VideoFileIcon sx={{fontSize: 64, color: 'grey.500'}}/>
                                        </Box>
                                    )}

                                    <CardContent sx={{pb: 1}}>
                                        <Typography
                                            variant="body2"
                                            noWrap
                                            title={fileObj.file.name}
                                        >
                                            {fileObj.file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatFileSize(fileObj.file.size)}
                                        </Typography>
                                        <Box sx={{mt: 1}}>
                                            <Chip
                                                icon={fileObj.file.type.startsWith('image/') ? <ImageIcon/> :
                                                    <VideoFileIcon/>}
                                                label={fileObj.file.type.startsWith('image/') ? 'รูปภาพ' : 'วิดีโอ'}
                                                size="small"
                                                color={fileObj.file.type.startsWith('image/') ? 'primary' : 'secondary'}
                                            />
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{pt: 0}}>
                                        <IconButton
                                            onClick={() => removeFile(fileObj.id)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid2>
                        ))}
                    </Grid2>
                </Box>
            )}


            <Paper
                {...getRootProps()}
                sx={{
                    p: 1, textAlign: 'center', cursor: 'pointer', border: '2px dashed',
                    // borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    // bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                }}
                elevation={0}
            >
                <input {...getInputProps()} />
                <CloudUploadIcon
                    sx={{
                        fontSize: 48,
                        color: 'primary.main',
                        mb: 2
                    }}
                />
                {/*<Typography variant="h6" gutterBottom>*/}
                {/*    {isDragActive ? 'วางไฟล์ที่นี่...' : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์'}*/}
                {/*</Typography>*/}
                <Typography variant="h6" gutterBottom>
                    คลิกเพื่อเลือกไฟล์
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    รองรับไฟล์รูปภาพและวิดีโอ ขนาดไม่เกิน 5MB ต่อไฟล์
                </Typography>
                <Box sx={{mt: 2}}>
                    <Chip label="รูปภาพ: JPG, PNG, GIF, WebP, BMP, SVG" size="small" sx={{mr: 1, mb: 1}}/>
                    <Chip label="วิดีโอ: MP4, AVI, MOV, WMV, FLV, WebM, MKV" size="small" sx={{mb: 1}}/>
                </Box>
            </Paper>

            {/* Error Messages */}
            {errors.length > 0 && (
                <Alert severity="error" sx={{mb: 2}}>
                    <ul style={{margin: 0, paddingLeft: 20}}>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Alert>
            )}

            {/* Success Message */}
            {success && (
                <Alert severity="success" sx={{mb: 2}}>
                    {success}
                </Alert>
            )}

            {/* Upload Progress */}
            {uploading && (
                <Box sx={{mb: 2}}>
                    <Typography variant="body2" gutterBottom>
                        กำลังอัปโหลด... {uploadProgress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress}/>
                </Box>
            )}
        </Box>
    );
}
