import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head } from "@inertiajs/react";
import {
    Button, Container, Grid2,
    Stack, TextField, Typography, Paper, Alert, Box,
    Dialog, DialogContent, IconButton
} from "@mui/material";
import { Search, CheckCircle, AppRegistration, CloudUpload, Close as CloseIcon, AccessTime } from "@mui/icons-material";
import { useRef, useState } from "react";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import ProductDetail from "@/Components/ProductDetail.jsx";

export default function WrForm() {
    const search = useRef(null);
    const fileInputRef = useRef(null); // เพิ่ม ref สำหรับ file input
    const [loading, setLoading] = useState(false);
    const [registering, setRegistering] = useState(false);

    const [product, setProduct] = useState(null);
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
    const [isPendingApproval, setIsPendingApproval] = useState(false);

    // Form states
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // เปลี่ยนจาก '' เป็น null
    const [filePreview, setFilePreview] = useState(null); // เพิ่ม state สำหรับ preview รูป

    // state ใหม่
    const [custTel, setCustTel] = useState('');
    const [previewAccImage, setPreviewAccImage] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setProduct(null);
        setIsAlreadyRegistered(false);
        setIsPendingApproval(false);
        setSelectedDay('');
        setSelectedFile(null);
        setFilePreview(null);
        setCustTel('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        try {
            setLoading(true);
            const { data, status } = await axios.post(route('warranty.search', {
                serial_id: search.current.value
            }));

            console.log(data, status);
            setProduct(data.getRealProduct);
            const expire_date = data.expire_date;
            setProduct((prevProduct) => ({
                ...prevProduct,
                expire_date
            }))

            // Check if already registered
            // if (data.expire_date && data.expire_date.trim() !== '') {
            //     setIsAlreadyRegistered(true);
            // } else {
            //     setIsAlreadyRegistered(false);
            // }

            // ตรวจสอบสถานะการลงทะเบียน
            if (data.expire_date && data.expire_date.trim() !== '') {
                // มีวันหมดประกัน = ลงทะเบียนเรียบร้อย
                setIsAlreadyRegistered(true);
                setIsPendingApproval(false);
            } else if (data.warrantyAt && data.warrantyAt.trim() !== '') {
                // มีวันซื้อ (warrantyAt) แต่ไม่มีวันหมดประกัน = รออนุมัติ
                setIsAlreadyRegistered(false);
                setIsPendingApproval(true);
            } else {
                // ไม่มีทั้งคู่ = ยังไม่ได้ลงทะเบียน
                setIsAlreadyRegistered(false);
                setIsPendingApproval(false);
            }

        } catch (error) {
            const serverMessage = error.response?.data?.message;
            const errorMessage = serverMessage || error.message || "เกิดข้อผิดพลาด";

            console.log("Message to show:", errorMessage);

            AlertDialog({
                icon: 'error',
                title: 'แจ้งเตือน',
                text: errorMessage,
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();

        if (!selectedFile) {
            AlertDialog({
                title: 'แจ้งเตือน',
                message: 'กรุณาเลือกไฟล์หลักฐานการซื้อสินค้า'
            });
            return;
        }

        if (!selectedDay) {
            AlertDialog({
                title: 'แจ้งเตือน',
                message: 'กรุณาเลือกวันที่ซื้อสินค้า'
            });
            return;
        }

        if (!custTel) {
            AlertDialog({
                title: 'แจ้งเตือน',
                message: 'กรุณากรอกเบอร์โทรลูกค้า'
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
                            const formData = new FormData();
                            formData.append('date_warranty', selectedDay);
                            // formData.append('serial_id', search.current.value);
                            formData.append('serial_id', product.serial_id);
                            formData.append('pid', product.pid);
                            formData.append('pname', product.pname);
                            formData.append('facmodel', product.facmodel || '');
                            formData.append('warrantyperiod', product.warrantyperiod);
                            formData.append('cust_tel', custTel);
                            formData.append('evidence_file', selectedFile);

                            if (product.power_accessories) {
                                formData.append('power_accessories', JSON.stringify(product.power_accessories));
                            }

                            if (product.is_combo && product.combo_items) {
                                formData.append('combo_items', JSON.stringify(product.combo_items));
                            }

                            const { data, status } = await axios.post(
                                route('warranty-history.store'),
                                formData,
                                { headers: { 'Content-Type': 'multipart/form-data' } }
                            );

                            console.log(data);
                            AlertDialog({
                                icon: 'success',
                                text: `${data.message}\nสิ้นสุดประกันถึง: ${data.expire_date}`
                            });
                            setProduct(prevProduct => ({
                                ...prevProduct,
                                buy_date: selectedDay,           // นำวันที่กรอกในฟอร์มไปอัปเดต
                                expire_date: data.expire_date,   // นำวันหมดอายุจาก API มาอัปเดต
                                warranty_status: true,           // ปรับสถานะเป็น True
                                warranty_text: 'อยู่ในประกัน',     // เปลี่ยน Text เป็นสีเขียว
                                warranty_color: 'green'
                            }));
                            setIsAlreadyRegistered(true);
                            setIsPendingApproval(false);
                        } catch (error) {
                            AlertDialog({
                                title: 'เกิดข้อผิดพลาด',
                                text: error.response?.data?.message || error.message || 'error'
                            });
                        }
                    }
                }
            });
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
            <Head title='ลงทะเบียนรับประกัน' />
            <Container sx={{ mt: 2 }}>
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
                                    startIcon={<Search />}
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
                            {/* <ProductDetail {...product} serial={search.current.value} /> */}
                            <ProductDetail {...product} serial={product.serial_id} />
                        </Grid2>
                    )}

                    {product?.is_combo && product?.combo_items && product.combo_items.length > 0 && (
                        <Grid2 size={12}>
                            <Paper elevation={2} sx={{ p: 3, borderLeft: '4px solid #ff5722' }}>
                                <Typography variant="h6" gutterBottom color="#ff5722">
                                    📦 สินค้าในชุด Combo Set
                                </Typography>
                                <Stack spacing={2} sx={{ mt: 2 }}>
                                    {product.combo_items.map((item, index) => (
                                        <Box
                                            key={`combo-${index}`}
                                            sx={{
                                                p: 2,
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 2,
                                                bgcolor: '#fafafa',
                                                display: 'flex',
                                                gap: 2,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <img
                                                src={`https://images.dcpumpkin.com/images/product/500/${item.pid}.jpg`}
                                                alt={item.pname}
                                                onError={(e) => {
                                                    e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg';
                                                }}
                                                onClick={(e) => setPreviewAccImage(e.target.src)}
                                                style={{
                                                    width: 80,
                                                    height: 80,
                                                    objectFit: 'contain',
                                                    borderRadius: 4,
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s',
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {item.pname}
                                                </Typography>
                                                <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <b>SKU:</b> {item.pid}
                                                    </Typography>
                                                    <Typography variant="body2" color="success.main">
                                                        <b>ระยะเวลารับประกัน:</b> {item.warrantyperiod ? `${item.warrantyperiod} เดือน` : 'อ้างอิงตามชุดหลัก'}
                                                    </Typography>
                                                </Stack>
                                                {item.warrantycondition && (
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                        เงื่อนไข: {item.warrantycondition}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid2>
                    )}

                    {product?.power_accessories && Object.keys(product.power_accessories).length > 0 && (
                        <Grid2 size={12}>
                            <Paper elevation={2} sx={{ p: 3, borderLeft: '4px solid #ff5722' }}>
                                <Typography variant="h6" gutterBottom color="#ff5722">
                                    อุปกรณ์เสริม (Power Accessories)
                                </Typography>
                                <Stack spacing={2} sx={{ mt: 2 }}>
                                    {Object.entries(product.power_accessories).map(([type, items]) =>
                                        items.map((acc, index) => (
                                            <Box
                                                key={`${type}-${index}`}
                                                sx={{
                                                    p: 2,
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: 2,
                                                    bgcolor: '#fafafa',
                                                    display: 'flex',
                                                    gap: 2,
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <img
                                                    src={`https://images.dcpumpkin.com/images/product/500/${acc.accessory_sku}.jpg`}
                                                    alt={acc.product_name}
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg';
                                                    }}
                                                    onClick={(e) => setPreviewAccImage(e.target.src)}
                                                    style={{
                                                        width: 80,
                                                        height: 80,
                                                        objectFit: 'contain',
                                                        borderRadius: 4,
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #ddd',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s',
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} // (แถม) ขยายขึ้นนิดนึงตอนเมาส์ชี้
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                />

                                                {/* ส่วนแสดงรายละเอียด */}
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {acc.product_name}
                                                    </Typography>
                                                    <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <b>SKU:</b> {acc.accessory_sku}
                                                        </Typography>
                                                        {/* <Typography variant="body2" color="text.secondary">
                                                            <b>จำนวน:</b> {acc.qty} ชิ้น
                                                        </Typography> */}
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            {acc.serial_label ? `Serial: ${acc.serial_label}` : 'ไม่มี Serial'}
                                                        </Typography>
                                                        <Typography variant="body2" color="success.main">
                                                            <b>ระยะเวลารับประกัน:</b> {acc.warranty_period ? `${acc.warranty_period} เดือน` : 'ไม่ระบุ'}
                                                        </Typography>
                                                    </Stack>

                                                    {acc.warranty_condition && (
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                            เงื่อนไข: {acc.warranty_condition}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </Stack>
                            </Paper>
                        </Grid2>
                    )}

                    {product && isAlreadyRegistered && (
                        <Grid2 size={12}>
                            <Alert
                                severity="success"
                                icon={<CheckCircle />}
                                sx={{ fontSize: '1.1rem', py: 2 }}
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

                    {product && isPendingApproval && (
                        <Grid2 size={12}>
                            <Alert
                                severity="warning"
                                icon={<AccessTime />}
                                sx={{ fontSize: '1.1rem', py: 2 }}
                            >
                                <Typography variant="h6" component="div">
                                    อยู่ระหว่างรออนุมัติการรับประกัน
                                </Typography>
                                <Typography variant="body2">
                                    สินค้าชิ้นนี้ได้ส่งข้อมูลลงทะเบียนแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบและอนุมัติ
                                </Typography>
                            </Alert>
                        </Grid2>
                    )}

                    {product && !isAlreadyRegistered && !isPendingApproval && (
                        <>
                            <Grid2 size={12}>
                                <Paper elevation={2} sx={{ p: 3 }}>
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

                                            {/* ฟอร์มเบอร์โทร */}
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    เบอร์โทรลูกค้า *
                                                </Typography>
                                                <TextField
                                                    size='small'
                                                    type='tel'
                                                    value={custTel}
                                                    onChange={(e) => setCustTel(e.target.value)}
                                                    required
                                                    placeholder="กรอกเบอร์โทร เช่น 081234****"
                                                    sx={{ mb: 2, minWidth: 300, }}
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
                                                    startIcon={<AppRegistration />}
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
            <Dialog
                open={!!previewAccImage}
                onClose={() => setPreviewAccImage(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent sx={{ position: 'relative', p: 2, bgcolor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton
                        onClick={() => setPreviewAccImage(null)}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255,255,255,0.8)',
                            '&:hover': { bgcolor: 'rgba(200,200,200,0.9)' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* รูปภาพขนาดใหญ่ */}
                    <img
                        src={previewAccImage}
                        alt="Enlarged Preview"
                        style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                    />
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    )
}
