import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, useForm, usePage} from "@inertiajs/react";
import {
    Box, Container, Grid2, Stack, Paper, Card, CardContent,
    Button, Divider, Typography, Alert, CircularProgress, TextField, InputAdornment,
} from "@mui/material";
import {AccountCircle, Badge, AdminPanelSettings, Token} from "@mui/icons-material";
import {useState} from "react";

export default function AddSale() {
    const {flash} = usePage().props;
    const user = usePage().props.auth.user;
    const {data, setData, post, processing, errors, reset, clearErrors} = useForm({
        sale_code: "",
        name: "",
        lark_token: "",
        is_code_cust_id : user.is_code_cust_id
    });
    const handleChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
    };

    const [showAlert, setShowAlert] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data)
        post(route('Sales.store'))
    }

    return (
        <AuthenticatedLayout>
            <Head title="สร้างเซลล์"/>
            <Container maxWidth="lg" sx={{py: 4}}>
                <Paper
                    elevation={0}
                    sx={{p: 3, borderRadius: 2, bgcolor: "background.paper", boxShadow: "0 0 20px rgba(0,0,0,0.05)"}}
                >
                    <Typography
                        variant="h5" component="h1"
                        color="primary.main" fontWeight="500"
                        sx={{display: 'flex', gap: 1, alignItems: 'center',}}
                    >
                        <Badge sx={{fontSize: 28}}/>
                        สร้างเซลล์ใหม่
                    </Typography>
                    <Divider sx={{mb: 4}}/>
                    <form onSubmit={handleSubmit}>
                        {showAlert && flash.success && (
                            <Grid2 container>
                                <Grid2 size={12} mb={2}>
                                    <Alert security="success" onClose={() => setShowAlert(false)}>
                                        {flash.success}
                                    </Alert>
                                </Grid2>
                            </Grid2>
                        )}

                        {showAlert && flash.error && (
                            <Grid2 container>
                                <Grid2 size={12} mb={2}>
                                    <Alert security="error" onClose={() => setShowAlert(false)}>
                                        {flash.error}
                                    </Alert>
                                </Grid2>
                            </Grid2>
                        )}

                        <Stack spacing={3}>
                            {/* ส่วนข้อมูลผู้ใช้ */}
                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 2, overflow: 'hidden',
                                    borderColor: 'primary.light'
                                }}
                            >
                                <Box sx={{
                                    bgcolor: 'primary.main', color: 'primary.contrastText',
                                    py: 1, px: 2, gap: 1,
                                    display: 'flex', alignItems: 'center',
                                }}>
                                    <AccountCircle/>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        ข้อมูลผู้ใช้
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Grid2 container spacing={3}>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="ชื่อ-สกุล" name="name" value={data.name}
                                                onChange={handleChange} error={!!errors.name}
                                                helperText={errors.name}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <AccountCircle color="primary"/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{xs: 12, md: 6}}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="รหัสเซลล์" name="sale_code" value={data.sale_code}
                                                onChange={handleChange} error={!!errors.sale_code}
                                                helperText={errors.sale_code}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <AdminPanelSettings color="primary"/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={12}>
                                            <TextField
                                                size="small" required fullWidth
                                                label="โทเค็น (lark)" name="lark_token" type="text"
                                                value={data.lark_token}
                                                onChange={handleChange} error={!!errors.lark_token}
                                                helperText={errors.lark_token}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Token color="primary"/>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>
                            <Stack direction='row-reverse' spacing={2}>
                                <Button
                                    type="submit" variant="contained"
                                    startIcon={processing && <CircularProgress size={20} color="inherit"/>}
                                >
                                    บันทึก
                                </Button>
                                <Button color="inherit" variant="outlined" onClick={() => reset()}>
                                    ยกเลิก
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}

