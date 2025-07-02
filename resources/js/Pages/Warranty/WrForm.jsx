import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Button, Container, Grid2,
    Stack, TextField, Typography, Paper, Alert, Box
} from "@mui/material";
import {Search, CheckCircle, AppRegistration} from "@mui/icons-material";
import {useRef, useState} from "react";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";
import ProductDetail from "@/Components/ProductDetail.jsx";

export default function WrForm() {
    const search = useRef(null);
    const [loading, setLoading] = useState(false);
    const [registering, setRegistering] = useState(false);

    const [product, setProduct] = useState(null);
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

    // Form states
    const [selectedDay, setSelectedDay] = useState('');


    const handleSearch = async (e) => {
        e.preventDefault();
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

        try {
            setRegistering(true);
            AlertDialogQuestion({
                text: 'กด ตกลง เพื่อยืนยัน',
                onPassed: async (confirm) => {
                    if (confirm) {
                        try {
                            const {data, status} = await axios.post(route('warranty.store'), {
                                date_warranty: selectedDay,
                                serial_id: search.current.value,
                                pid: product.pid,
                                p_name: product.pname,
                                warrantyperiod: product.warrantyperiod
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
                                                <Stack direction='row' spacing={2}>
                                                    <TextField
                                                        size='small' type='date'
                                                        onChange={(e) => setSelectedDay(e.target.value)}
                                                    />
                                                    <Button
                                                        startIcon={<AppRegistration/>}
                                                        type="submit"
                                                        variant="contained"
                                                        disabled={registering}
                                                        sx={{alignSelf: 'flex-start'}}
                                                    >
                                                        {registering ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                                                    </Button>


                                                </Stack>
                                                <Stack spacing={2}>
                                                    <Typography>อัปโหลดไฟล์หลักฐาน</Typography>
                                                    <TextField type='file'/>
                                                </Stack>
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
