import React, {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {
    Box, Button, Typography, Alert, Chip, Paper,
    IconButton, Card, CardMedia, CardContent, CardActions, Grid2
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    VideoFile as VideoFileIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import {useDropzone} from 'react-dropzone';
import {
    createPreviewUrl, formatFileSize, getFileName, getFileSize, getFileType,
    isValidFileSize, isValidFileType
} from "@/utils/fileUploadManage.js";
import {FileUploading} from "@/Components/FileUploading.jsx";

export default function RpUploadFileBeforeForm({data, setData, form1Saved}) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState('');
    const initializedRef = useRef(false);

    // Initialize files from data (only once)
    useEffect(() => {
        if (data.file_befores && Array.isArray(data.file_befores) && !initializedRef.current) {
            setFiles(data.file_befores);
            initializedRef.current = true;
        }
    }, [data.file_befores]);

    // Update parent data when files change (with memoized comparison)
    const filesString = useMemo(() => JSON.stringify(files), [files]);
    const dataFilesString = useMemo(() => JSON.stringify(data.file_befores || []), [data.file_befores]);

    useEffect(() => {
        if (initializedRef.current && filesString !== dataFilesString) {
            setData('file_befores', files);
        }
    }, [filesString, dataFilesString, setData, files]);

    // จัดการการเลือกไฟล์
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        setErrors([]);
        const newErrors = [];

        // ตรวจสอบไฟล์ที่ถูกปฏิเสธ
        rejectedFiles.forEach(({file, errors: fileErrors}) => {
            fileErrors.forEach(error => {
                if (error.code === 'file-too-large') {
                    newErrors.push(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (เกิน 5MB)`);
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
                newErrors.push(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`);
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
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type
        }));

        setFiles(prev => [...prev, ...filesWithPreview]);

        if (validFiles.length > 0) {
            setSuccess(`เพิ่มไฟล์สำเร็จ ${validFiles.length} ไฟล์`);
            setTimeout(() => setSuccess(''), 3000);
        }
    }, []);

    // ลบไฟล์
    const removeFile = (fileId) => {
        setFiles(prev => {
            const updated = prev.filter(f => f.id !== fileId);
            // ลบ preview URL เพื่อป้องกัน memory leak (เฉพาะไฟล์ใหม่)
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove && fileToRemove.file instanceof File) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return updated;
        });
    };

    // ล้างไฟล์ทั้งหมด
    const clearAllFiles = () => {
        // ลบ preview URL เฉพาะไฟล์ใหม่
        files.forEach(f => {
            if (f.file instanceof File) {
                URL.revokeObjectURL(f.preview);
            }
        });
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
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: true
    });

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            files.forEach(f => {
                if (f.file instanceof File) {
                    URL.revokeObjectURL(f.preview);
                }
            });
        };
    }, []);

    return (
        <Box>
            {/* File List */}
            {files.length > 0 && (
                <Box sx={{mb: 3}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        {/*<Typography variant="h6">*/}
                        {/*    ไฟล์ที่เลือก ({files.length} ไฟล์)*/}
                        {/*</Typography>*/}
                        <Typography variant="h6">
                            ควรอัปโหลดอย่างน้อย 1 ไฟล์
                        </Typography>
                        {/*<Typography variant='body1'>ควรอัปโหลดอย่างน้อย 1 ไฟล์</Typography>*/}
                        <Button
                            // disabled={form1Saved}
                            onClick={clearAllFiles}
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon/>}
                        >
                            ลบทั้งหมด
                        </Button>
                    </Box>

                    <Grid2 container spacing={2}>
                        {files.map((fileObj) => {
                            const fileName = getFileName(fileObj);
                            const fileSize = getFileSize(fileObj);
                            const fileType = getFileType(fileObj);
                            const isImage = fileType.startsWith('image/');
                            const preview = fileObj.full_file_path || fileObj.preview;

                            return (
                                <Grid2 size={{xs: 12, sm: 6, md: 3}} key={fileObj.id}>
                                    <Card>
                                        {isImage ? (
                                            <CardMedia
                                                component="img"
                                                height={200}
                                                image={preview}
                                                alt={fileName}
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
                                                title={fileName}
                                            >
                                                {fileName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {fileSize > 0 ? formatFileSize(fileSize) : 'Unknown size'}
                                            </Typography>
                                            <Box sx={{mt: 1}}>
                                                <Chip
                                                    icon={isImage ? <ImageIcon/> : <VideoFileIcon/>}
                                                    label={isImage ? 'รูปภาพ' : 'วิดีโอ'}
                                                    size="small"
                                                    color={isImage ? 'primary' : 'secondary'}
                                                />
                                            </Box>
                                        </CardContent>

                                        <CardActions sx={{pt: 0}}>
                                            <IconButton
                                                // disabled={form1Saved}
                                                onClick={() => removeFile(fileObj.id)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid2>
                            );
                        })}
                    </Grid2>
                </Box>
            )}

            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                    }
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
                <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'วางไฟล์ที่นี่...' : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์'}
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
                <Alert severity="error" sx={{mt: 2}}>
                    <ul style={{margin: 0, paddingLeft: 20}}>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Alert>
            )}

            {/* Success Message */}
            {success && (
                <Alert severity="success" sx={{mt: 2}}>
                    {success}
                </Alert>
            )}

            {/* Upload Progress */}
            {uploading && <FileUploading uploadProgress={uploadProgress}/>}
        </Box>
    );
}
