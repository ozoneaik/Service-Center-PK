import {useState, useEffect} from "react";
import {
    Dialog, DialogContent, DialogTitle, TextField, Button,
    FormControlLabel, Checkbox, Box, Grid2, Typography, InputAdornment, Stack
} from "@mui/material";
import {router} from '@inertiajs/react';
import LoginIcon from "@mui/icons-material/Login";
import {AccountCircle, AlternateEmail, Password, Edit} from "@mui/icons-material";

export default function ModalEditUser({
                                          open, setOpen, user, onSave = () => {
    }
                                      }) {
    const [userData, setUserData] = useState({
        user_code: '',
        name: '',
        email: '',
        role: '',
        admin_that_branch: false,
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (user) {
            setUserData({
                ...user,
                password: '',
                password_confirmation: '',
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
