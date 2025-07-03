import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Button, Container, Grid2,
    Stack, TextField, Typography, Paper, Alert, Box
} from "@mui/material";
import {Search, CheckCircle, AppRegistration, CloudUpload} from "@mui/icons-material";
import {useRef, useState} from "react";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";
import ProductDetail from "@/Components/ProductDetail.jsx";

export default function WrForm() {
    const search = useRef(null);
    const fileInputRef = useRef(null); // เพิ่ม ref สำหรับ file input
    const [loading, setLoading] = useState(false);
    const [registering, setRegistering] = useState(false);

    const [product, setProduct] = useState(null);
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

    // Form states
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // เปลี่ยนจาก '' เป็น null
    const [filePreview, setFilePreview] = useState(null); // เพิ่ม state สำหรับ preview รูป

    const handleSearch = async (e) => {
        e.preventDefault();
        setProduct(null);
        try {
            setLoading(true);
            const {data, status} = await axios.post(route('warranty.search', {
                serial_id: search.current.value
            }));

            console.log(data, status);
            setProduct(data.getRealProduct);

            // Check if already registered
            if (data.expire_date && data.expire_date.trim() !== '') {
                setIsAlreadyRegistered(true);
            } else {
                setIsAlreadyRegistered(false);
            }

        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                message: error.response?.data.message || error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();

        // ตรวจสอบว่าได้เลือกไฟล์แล้วหรือไม่
        if (!selectedFile) {
            AlertDialog({
                title: 'แจ้งเตือน',
                message: 'กรุณาเลือกไฟล์หลักฐานการซื้อสินค้า'
            });
            return;
        }

        // ตรวจสอบว่าได้เลือกวันที่แล้วหรือไม่
        if (!selectedDay) {
            AlertDialog({
                title: 'แจ้งเตือน',
                message: 'กรุณาเลือกวันที่ซื้อสินค้า'
            });
            return;
        }

        try {
            setRegistering(true);
            AlertDialogQuestion({
                text: 'กด ตกลง เพื่อยืนยัน',
                onPassed: async (confirm) => {
                    if (confirm) {
                        try {
                            // สร้าง FormData สำหรับส่งไฟล์
                            const formData = new FormData();
                            formData.append('date_warranty', selectedDay);
                            formData.append('serial_id', search.current.value);
                            formData.append('pid', product.pid);
                            formData.append('p_name', product.pname);
                            formData.append('warrantyperiod', product.warrantyperiod);
                            formData.append('evidence_file', selectedFile); // เปลี่ยนจาก selectedFile เป็น evidence_file

                            const {data, status} = await axios.post(route('warranty.store'), formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });

                            console.log(data)
                            AlertDialog({
                                icon: 'success',
                                text: data.message
                            })
                            setIsAlreadyRegistered(true)

                        } catch (error) {
                            AlertDialog({
                                title: 'เกิดข้อผิดพลาด',
                                text: error.response?.data?.message || error.message || 'error'
                            });
                        }
                    }
                }
            })
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                message: error.response?.data.message || error.message
            });
        } finally {
            setRegistering(false);
        }
    };

    const handleFileOnChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // ตรวจสอบประเภทไฟล์ (รับเฉพาะรูปภาพ)
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                AlertDialog({
                    title: 'ไฟล์ไม่ถูกต้อง',
                    message: 'กรุณาเลือกไฟล์รูปภาพ (JPG, JPEG, PNG, GIF) เท่านั้น'
                });
                // รีเซ็ต input
                e.target.value = '';
                setSelectedFile(null);
                setFilePreview(null);
                return;
            }

            // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                AlertDialog({
                    title: 'ไฟล์ใหญ่เกินไป',
                    message: 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB'
                });
                // รีเซ็ต input
                e.target.value = '';
                setSelectedFile(null);
                setFilePreview(null);
                return;
            }

            setSelectedFile(file);

            // สร้าง preview รูป
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // ฟังก์ชันสำหรับลบไฟล์ที่เลือก
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title='ลงทะเบียนรับประกัน'/>
            <Container sx={{mt: 2}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <form onSubmit={handleSearch}>
                            <Stack direction='row' spacing={2}>
                                <TextField
                                    disabled={loading}
                                    inputRef={search}
                                    fullWidth
                                    size='small'
                                    placeholder='ค้นหา Serial Number'
                                    required
                                />
                                <Button
                                    loading={loading}
                                    type='submit'
                                    startIcon={<Search/>}
                                    variant='contained'
                                    disabled={loading}
                                >
                                    ค้นหา
                                </Button>
                            </Stack>
                        </form>
                    </Grid2>

                    {product && (
                        <Grid2 size={12}>
                            <ProductDetail {...product} serial={search.current.value}/>
                        </Grid2>
                    )}

                    {product && isAlreadyRegistered && (
                        <Grid2 size={12}>
                            <Alert
                                severity="success"
                                icon={<CheckCircle/>}
                                sx={{fontSize: '1.1rem', py: 2}}
                            >
                                <Typography variant="h6" component="div">
                                    คุณได้ลงทะเบียนเรียบร้อยแล้ว
                                </Typography>
                                <Typography variant="body2">
                                    สินค้าชิ้นนี้ได้รับการลงทะเบียนรับประกันแล้ว
                                </Typography>
                            </Alert>
                        </Grid2>
                    )}

                    {product && !isAlreadyRegistered && (
                        <>
                            <Grid2 size={12}>
                                <Paper elevation={2} sx={{p: 3}}>
                                    <Typography variant="h6" gutterBottom>
                                        ลงทะเบียนรับประกัน
                                    </Typography>

                                    <form onSubmit={handleRegister}>
                                        <Stack spacing={3}>
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    วันที่ซื้อสินค้า {selectedDay || ''}
                                                </Typography>
                                                <TextField
                                                    size='small'
                                                    type='date'
                                                    value={selectedDay}
                                                    onChange={(e) => setSelectedDay(e.target.value)}
                                                    required
                                                    sx={{ mb: 2 }}
                                                />
                                            </Box>

                                            {/* ส่วนอัปโหลดไฟล์ */}
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    อัปโหลดหลักฐานการซื้อสินค้า *
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    รองรับไฟล์: JPG, JPEG, PNG, GIF (ขนาดไม่เกิน 5MB)
                                                </Typography>

                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileOnChange}
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    id="evidence-file-input"
                                                />

                                                <label htmlFor="evidence-file-input">
                                                    <Button
                                                        variant="outlined"
                                                        component="span"
                                                        startIcon={<CloudUpload />}
                                                        sx={{ mb: 2 }}
                                                    >
                                                        เลือกไฟล์รูปภาพ
                                                    </Button>
                                                </label>

                                                {/* แสดงชื่อไฟล์ที่เลือก */}
                                                {selectedFile && (
                                                    <Box sx={{ mt: 1, mb: 2 }}>
                                                        <Typography variant="body2" color="primary">
                                                            ไฟล์ที่เลือก: {selectedFile.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ขนาด: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </Typography>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={handleRemoveFile}
                                                            sx={{ ml: 2 }}
                                                        >
                                                            ลบไฟล์
                                                        </Button>
                                                    </Box>
                                                )}

                                                {/* แสดง preview รูป */}
                                                {filePreview && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="body2" gutterBottom>
                                                            ตัวอย่างรูป:
                                                        </Typography>
                                                        <img
                                                            src={filePreview}
                                                            alt="Preview"
                                                            style={{
                                                                maxWidth: '300px',
                                                                maxHeight: '200px',
                                                                objectFit: 'contain',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box>
                                                <Button
                                                    startIcon={<AppRegistration/>}
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={registering || !selectedDay || !selectedFile}
                                                    size="large"
                                                >
                                                    {registering ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </form>
                                </Paper>
                            </Grid2>
                        </>
                    )}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}
