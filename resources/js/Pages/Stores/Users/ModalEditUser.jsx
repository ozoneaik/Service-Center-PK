import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Box, Grid2, Typography } from "@mui/material";
import { router } from '@inertiajs/react';

export default function ModalEditUser({ open, setOpen, user, onSave = () => {} }) {
    // Initial user state
    const [userData, setUserData] = useState({
        user_code: '',
        name: '',
        email: '',
        role: '', // admin, dealer, service
        admin_that_branch: false, // true = เจ้าของร้าน, false = พนักงาน
        password: '',
        password_confirmation: '',
    });

    // Errors state
    const [errors, setErrors] = useState({});
    
    // Loading state
    const [loading, setLoading] = useState(false);

    // Update userData when user prop changes
    useEffect(() => {
        if (user) {
            setUserData({
                ...user,
                password: '',
                password_confirmation: '',
            });
        }
    }, [user]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setUserData({
            ...userData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Handle form submission
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
        <Dialog 
            open={open} 
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>แก้ไข {user.name}</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{xs : 12}}>
                            <TextField
                                name="user_code"
                                label="รหัสผู้ใช้"
                                fullWidth
                                value={userData.user_code}
                                onChange={handleChange}
                                error={!!errors.user_code}
                                helperText={errors.user_code}
                                disabled
                            />
                        </Grid2>
                        
                        <Grid2 size={{xs : 12}}>
                            <TextField
                                name="name"
                                label="ชื่อ"
                                fullWidth
                                value={userData.name}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                required
                            />
                        </Grid2>
                        
                        <Grid2 size={{xs : 12}}>
                            <TextField
                                name="email"
                                label="อีเมล"
                                fullWidth
                                type="email"
                                value={userData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                            />
                        </Grid2>
                    
                        
                        <Grid2 size={{xs : 12}}>
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
                        
                        <Grid2 size={{xs : 12}}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                เปลี่ยนรหัสผ่าน (เว้นว่างถ้าไม่ต้องการเปลี่ยน)
                            </Typography>
                        </Grid2>
                        
                        <Grid2 size={{xs : 12}}>
                            <TextField
                                name="password"
                                label="รหัสผ่านใหม่"
                                type="password"
                                fullWidth
                                value={userData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                        </Grid2>
                        
                        <Grid2 size={{xs : 12}}>
                            <TextField
                                name="password_confirmation"
                                label="ยืนยันรหัสผ่านใหม่"
                                type="password"
                                fullWidth
                                value={userData.password_confirmation}
                                onChange={handleChange}
                                error={!!errors.password_confirmation}
                                helperText={errors.password_confirmation}
                            />
                        </Grid2>
                        
                        <Grid2 size={{xs : 12}} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button 
                                variant="outlined" 
                                onClick={() => setOpen(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                disabled={loading}
                            >
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </Grid2>
                    </Grid2>
                </Box>
            </DialogContent>
        </Dialog>
    );
}