import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, Link, useForm} from "@inertiajs/react";
import {
    Container,
    Grid2,
    TextField,
    Button,
    Typography,
    FormControlLabel,
    Switch,
    Card,
    CardContent,
    Box,
    Divider,
    Alert,
    Snackbar, Checkbox
} from "@mui/material";
import {useState} from "react";

export default function UserEdit({user, menu_access, list_all_menu}) {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    console.log(user, menu_access, list_all_menu)

    const {data, setData, put, processing, errors} = useForm({
        id: user.id,
        user_code: user.user_code,
        name: user.name,
        email: user.email,
        password: '',
        ConfirmPassword: '',
        role: user.role,
        is_code_cust_id: user.is_code_cust_id,
        shop_name: user.store_info.shop_name,
        phone: user.store_info.phone,
        admin_that_branch: user.admin_that_branch,
        address: user.store_info.address,
        menu_access: menu_access || []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('userManage.update', user.id), {
            onSuccess: () => {
                setOpenSnackbar(true);
            }
        });
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // ตรวจสอบว่า menu นั้นๆ ถูกเลือกหรือไม่
    const isMenuChecked = (menuId) => {
        return data.menu_access.some(access => access.menu_code === menuId);
    }

    // จัดการการเปลี่ยนแปลง checkbox ของ menu
    const handleMenuChange = (menuId, checked) => {
        let newAccessMenu = [...data.menu_access];

        if (checked) {
            // เพิ่ม menu ใหม่
            newAccessMenu.push({
                user_code: data.user_code,
                menu_code: menuId
            });
        } else {
            // ลบ menu ออก
            newAccessMenu = newAccessMenu.filter(access => access.menu_code !== menuId);
        }

        setData('menu_access', newAccessMenu);
    };

    return (
        <AuthenticatedLayout>
            <Head title="แก้ไขผู้ใช้"/>
            <Container maxWidth="md" sx={{py: 3}}>
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h5" component="h1" gutterBottom>
                            แก้ไขข้อมูลผู้ใช้
                        </Typography>
                        <Divider sx={{mb: 3}}/>

                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Grid2 container spacing={3}>
                                <Grid2 size={{xs: 12, sm: 6}}>
                                    <TextField
                                        label="รหัสผู้ใช้"
                                        fullWidth
                                        value={data.user_code}
                                        onChange={(e) => setData('user_code', e.target.value)}
                                        error={!!errors.user_code}
                                        helperText={errors.user_code}
                                        disabled
                                    />
                                </Grid2>
                                <Grid2 size={{xs: 12, sm: 6}}>
                                    <TextField
                                        label="รหัสลูกค้า"
                                        fullWidth
                                        value={data.is_code_cust_id}
                                        onChange={(e) => setData('is_code_cust_id', e.target.value)}
                                        error={!!errors.is_code_cust_id}
                                        helperText={errors.is_code_cust_id}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        label="ชื่อ"
                                        fullWidth
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        required
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        label="อีเมล"
                                        fullWidth
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        required
                                    />
                                </Grid2>
                                <Grid2 size={{xs: 12, md: 6}}>
                                    <TextField
                                        label="รหัสผ่านใหม่"
                                        fullWidth
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                    />
                                </Grid2>
                                <Grid2 size={{xs: 12, md: 6}}>
                                    <TextField
                                        required={data.password ? true : false}
                                        label="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                                        fullWidth
                                        value={data.ConfirmPassword}
                                        onChange={(e) => setData('ConfirmPassword', e.target.value)}
                                        error={!!errors.ConfirmPassword}
                                        helperText={errors.ConfirmPassword}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        disabled
                                        label="เบอร์โทรศัพท์"
                                        fullWidth
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        error={!!errors.phone}
                                        helperText={errors.phone}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        disabled
                                        label="ที่อยู่"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        error={!!errors.address}
                                        helperText={errors.address}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={data.admin_that_branch}
                                                onChange={(e) => setData('admin_that_branch', e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="แอดมินประจำสาขา"
                                    />
                                </Grid2>
                                {!data.admin_that_branch && (
                                    <Grid2 size={12}>
                                        <Box display='flex' flexWrap='wrap'>
                                            {list_all_menu.map((item, index) => {
                                                return (
                                                    <FormControlLabel
                                                        key={index}
                                                        control={
                                                            <Checkbox
                                                                checked={isMenuChecked(item.id)}
                                                                onChange={(e) => handleMenuChange(item.id, e.target.checked)}
                                                            />
                                                        }
                                                        label={item.menu_name}
                                                    />
                                                )
                                            })}
                                        </Box>
                                    </Grid2>
                                )}

                                <Grid2 size={12} sx={{display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2}}>
                                    <Button
                                        variant="outlined"
                                        component={Link}
                                        href={route('userManage.list')}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={processing}
                                    >
                                        บันทึกข้อมูล
                                    </Button>
                                </Grid2>
                            </Grid2>
                        </Box>
                    </CardContent>
                </Card>
            </Container>

            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity="success">
                    บันทึกข้อมูลเรียบร้อยแล้ว
                </Alert>
            </Snackbar>
        </AuthenticatedLayout>
    );
}
