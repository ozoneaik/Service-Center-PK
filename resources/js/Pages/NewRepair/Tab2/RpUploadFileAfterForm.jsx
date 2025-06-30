import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDropzone} from "react-dropzone";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Grid2,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography
} from "@mui/material";
import {
    CloudUpload as CloudUploadIcon, Delete as DeleteIcon,
    Image as ImageIcon, Save, VideoFile as VideoFileIcon
} from "@mui/icons-material";
import {useForm} from "@inertiajs/react";
import {
    createPreviewUrl, formatFileSize, getFileName,
    getFileSize, getFileType, isValidFileSize, isValidFileType,
} from "@/utils/fileUploadManage.js";
import {FileUploading} from "@/Components/FileUploading.jsx";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

export default function RpUploadFileAfterForm({productDetail, JOB, setStepForm}) {
    const {data, setData} = useForm({});
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState('');
    const initializedRef = useRef(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            const {data, status} = await axios.get(route('repair.after.file-upload.index', {
                job_id: JOB.job_id,
                serial_id: JOB.serial_id
            }));
            console.log(data, status)
            setData('file_afters', data.file_afters)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (data.file_afters && Array.isArray(data.file_afters) && !initializedRef.current) {
            setFiles(data.file_afters);
            initializedRef.current = true;
        }
    }, [data.file_afters]);

    // Update parent data when files change (with memoized comparison)
    const filesString = useMemo(() => JSON.stringify(files), [files]);
    const dataFilesString = useMemo(() => JSON.stringify(data.file_afters || []), [data.file_afters]);

    useEffect(() => {
        if (initializedRef.current && filesString !== dataFilesString) {
            setData('file_afters', files);
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
            type: file.type,
            menu_id: 2
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

    const handleSave = () => {
        AlertDialogQuestion({
            title: 'สภาพสินค้าหลังซ่อม',
            text: 'กด ตกลง เพื่อ บันทึกรูปภาพหรือวิดีโอ สภาพสินค้าหลังซ่อม',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        setUploading(true);
                        setUploadProgress(0);

                        const formData = new FormData();

                        // แก้ไข: ส่งข้อมูลไฟล์ในรูปแบบที่ Controller คาดหวัง
                        const fileUploads = files.map((fileItem, index) => {
                            if (fileItem.file instanceof File) {
                                // ไฟล์ใหม่ที่ต้องอัปโหลด
                                formData.append(`file_uploads[${index}][file]`, fileItem.file);
                                return {
                                    id: fileItem.id,
                                    name: fileItem.name,
                                    size: fileItem.size,
                                    type: fileItem.type,
                                    menu_id : fileItem.menu_id
                                };
                            } else {
                                // ไฟล์เดิมที่มีอยู่แล้ว
                                return {
                                    id: fileItem.id,
                                    name: fileItem.name || getFileName(fileItem),
                                    size: fileItem.size || getFileSize(fileItem),
                                    type: fileItem.type || getFileType(fileItem),
                                    menu_id : fileItem.menu_id
                                };
                            }
                        });

                        // เพิ่มข้อมูล metadata
                        formData.append('file_uploads', JSON.stringify(fileUploads));
                        formData.append('serial_id', JOB.serial_id);
                        formData.append('job_id', JOB.job_id);

                        const {data, status} = await axios.post(route('repair.after.file-upload.store'),
                            formData,
                            {
                                headers: {'Content-Type': 'multipart/form-data',},
                                onUploadProgress: (progressEvent) => {
                                    const percentCompleted = Math.round(
                                        (progressEvent.loaded * 100) / progressEvent.total
                                    );
                                    setUploadProgress(percentCompleted);
                                },
                            }
                        );

                        AlertDialog({
                            icon: 'success',
                            text: data.message,
                            onPassed: () => setStepForm(4)
                        });

                    } catch (error) {
                        AlertDialog({
                            text: error.response?.data?.message || error.message
                        });
                        console.error('Upload error:', error);
                    } finally {
                        setUploading(false);
                        setUploadProgress(0);
                    }
                } else {
                    console.log('ไม่ได้กด confirm');
                }
            }
        });
    }

    const handleChangeMenu = (file_id, menu_id) => {
        const updateFile  = files.find(file => file.id === file_id)
        updateFile.menu_id = menu_id
        setFiles(prev => {
            const updated = prev.map(f => {
                if (f.id === file_id) {
                    return updateFile
                }
                return f
            })
            return updated;
        })
    }

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
                                                component="img" height={200}
                                                image={preview} alt={fileName}
                                                sx={{objectFit: 'cover'}}
                                            />
                                        ) : (
                                            <Box sx={videoContentStyle}>
                                                <VideoFileIcon sx={{fontSize: 64, color: 'grey.500'}}/>
                                            </Box>
                                        )}

                                        <CardContent sx={{pb: 1}}>
                                            <Typography variant="body2" noWrap title={fileName}>
                                                {fileName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {fileSize > 0 ? formatFileSize(fileSize) : 'Unknown size'}
                                            </Typography>
                                            <Box sx={{my: 1}}>
                                                <Chip
                                                    icon={isImage ? <ImageIcon/> : <VideoFileIcon/>}
                                                    label={isImage ? 'รูปภาพ' : 'วิดีโอ'}
                                                    size="small"
                                                    color={isImage ? 'primary' : 'secondary'}
                                                />
                                            </Box>
                                            <Select
                                                fullWidth size='small' variant='outlined'
                                                value={fileObj.menu_id}
                                                onChange={(e) => handleChangeMenu(fileObj.id, e.target.value)}
                                            >
                                                <MenuItem value={2}>สภาพสินค้าหลังซ่อม</MenuItem>
                                                <MenuItem value={3}>ภาพอะไหล่ที่เสียส่งเคลม</MenuItem>
                                                <MenuItem value={4}>ภาพอะไหล่ที่เปลี่ยน</MenuItem>
                                                <MenuItem value={5}>ภาพอะไหล่เสี่ยอื่นๆ</MenuItem>
                                            </Select>
                                        </CardContent>

                                        <CardActions sx={{pt: 0}}>
                                            <Button
                                                fullWidth
                                                startIcon={<DeleteIcon/>}
                                                variant='contained'
                                                onClick={() => removeFile(fileObj.id)}
                                                color="error"
                                                size="small"
                                            >
                                                ลบ
                                            </Button>
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
                <CloudUploadIcon sx={{fontSize: 48, color: 'primary.main', mb: 2}}/>
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

            <Box
                position="fixed"
                bottom={0}
                left={0}
                width="100%"
                zIndex={1000}
                bgcolor="white"
                boxShadow={3}
                p={1}
            >
                <Stack direction='row' justifyContent='end'>
                    <Button
                        onClick={handleSave}
                        startIcon={<Save/>}
                        variant='contained'
                        disabled={uploading || files.length === 0 || JOB.status !== 'pending'}
                    >
                        {uploading ? 'กำลังบันทึก...' : JOB.status === 'pending' ? 'บันทึก' : 'ปิดงานซ่อมแล้ว'}
                    </Button>
                </Stack>

            </Box>

        </Box>
    );
}

const videoContentStyle = {
    height: 200, display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'grey.100'
}
