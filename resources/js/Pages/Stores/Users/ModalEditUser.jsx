import {useState, useEffect} from "react";
import {
    Dialog, DialogContent, DialogTitle, TextField, Button,
    FormControlLabel, Checkbox, Box, Grid2, Typography, InputAdornment, Stack, Divider
} from "@mui/material";
import {router, usePage} from '@inertiajs/react';
import LoginIcon from "@mui/icons-material/Login";
import {AccountCircle, AlternateEmail, Password, Edit} from "@mui/icons-material";

export default function ModalEditUser({open, setOpen, user, onSave, listMenu}) {
    const { auth } = usePage().props; 
    const currentUserRole = auth.user.role;
    const [userData, setUserData] = useState({
        user_code: '', name: '', email: '', role: '', admin_that_branch: false,
        password: '', password_confirmation: '', access_menu: []
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUserData({
                ...user,
                password: '',
                password_confirmation: '',
                access_menu: user.access_menu || []
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const {name, value, checked, type} = e.target;
        setUserData({
            ...userData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.put(route('storeUsers.update'), userData, {
            onSuccess: () => {
                setOpen(false);
                onSave('success');
                setLoading(false);
            },
            onError: (errors) => {
                setErrors(errors);
                onSave('error');
                setLoading(false);
            },
        });
    };

    // ตรวจสอบว่า menu นั้นๆ ถูกเลือกหรือไม่
    const isMenuChecked = (menuId) => {
        return userData.access_menu.some(access => access.menu_code === menuId);
    }

    // จัดการการเปลี่ยนแปลง checkbox ของ menu
    const handleMenuChange = (menuId, checked) => {
        let newAccessMenu = [...userData.access_menu];

        if (checked) {
            // เพิ่ม menu ใหม่
            newAccessMenu.push({
                user_code: userData.user_code,
                menu_code: menuId
            });
        } else {
            // ลบ menu ออก
            newAccessMenu = newAccessMenu.filter(access => access.menu_code !== menuId);
        }

        setUserData({
            ...userData,
            access_menu: newAccessMenu
        });
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle sx={{backgroundColor: 'primary.main', color: 'white'}}>
                <Stack direction='row' spacing={2} alignItems='center'>
                    <Edit/>&nbsp;
                    แก้ไข {user.name}
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{mt: 2}}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LoginIcon/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="user_code" label="รหัสผู้ใช้" fullWidth disabled
                                value={userData.user_code} onChange={handleChange}
                                error={!!errors.user_code} helperText={errors.user_code}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircle/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="name" label="ชื่อ" fullWidth required
                                value={userData.name} onChange={handleChange}
                                error={!!errors.name} helperText={errors.name}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AlternateEmail/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="email" label="อีเมล" fullWidth type="email" required
                                value={userData.email} onChange={handleChange}
                                error={!!errors.email} helperText={errors.email}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="admin_that_branch"
                                        checked={userData.admin_that_branch}
                                        onChange={handleChange}
                                    />
                                }
                                label="เจ้าของร้าน"
                            />
                            {errors.admin_that_branch && (
                                <Typography variant="caption" color="error" display="block">
                                    {errors.admin_that_branch}
                                </Typography>
                            )}
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <Typography variant="subtitle2" sx={{mb: 1}}>
                                เปลี่ยนรหัสผ่าน (เว้นว่างถ้าไม่ต้องการเปลี่ยน)
                            </Typography>
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Password/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="password" label="รหัสผ่านใหม่" type="password" fullWidth
                                value={userData.password} onChange={handleChange}
                                error={!!errors.password} helperText={errors.password}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Password/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="password_confirmation" label="ยืนยันรหัสผ่านใหม่" type="password" fullWidth
                                value={userData.password_confirmation} onChange={handleChange}
                                error={!!errors.password_confirmation} helperText={errors.password_confirmation}
                            />
                        </Grid2>

                        {!userData.admin_that_branch && (
                            <Grid2 size={12}>
                                <Typography variant="subtitle2" sx={{mb: 1}}>สิทธิ์การเข้าถึงเมนู</Typography>
                                <Box display='flex' flexWrap='wrap'>
                                    {/* {listMenu.map((item, index) => (
                                        <FormControlLabel
                                            key={index}
                                            label={item.menu_name}
                                            control={
                                                <Checkbox
                                                    checked={isMenuChecked(item.id)}
                                                    onChange={(e) => handleMenuChange(item.id, e.target.checked)}
                                                />
                                            }
                                        />
                                    ))} */}
                                    {listMenu.map((item, index) => {
                                        // [แก้ไข] เพิ่ม Logic การตรวจสอบสิทธิ์
                                        // ตรวจสอบว่าเป็นเมนู "เซลล์แจ้งซ่อม" หรือไม่ (เช็คจากชื่อ หรือ redirect_route ตาม Seeder)
                                        const isSaleRepairMenu = item.menu_name === 'เซลล์แจ้งซ่อม' || item.redirect_route === 'repair.sale.index';
                                        const isAccReceive = item.menu_name === 'บัญชีรับอะไหล่' || item.redirect_route === 'accounting.return.index';

                                        // ถ้าเป็นเมนูเซลล์แจ้งซ่อม และ คนที่ Login ไม่ใช่ Admin -> ให้ข้ามไปเลย (ไม่แสดง)
                                        if (isSaleRepairMenu && currentUserRole !== 'admin') {
                                            return null;
                                        }

                                        if (isAccReceive && currentUserRole !== 'admin') {
                                            return null;
                                        }

                                        return (
                                            <FormControlLabel
                                                key={index}
                                                label={item.menu_name}
                                                control={
                                                    <Checkbox
                                                        checked={isMenuChecked(item.id)}
                                                        onChange={(e) => handleMenuChange(item.id, e.target.checked)}
                                                    />
                                                }
                                            />
                                        );
                                    })}
                                </Box>
                            </Grid2>
                        )}

                        <Grid2 size={{xs: 12}} sx={{mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                            <Button variant="outlined" onClick={() => setOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </Grid2>
                    </Grid2>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
