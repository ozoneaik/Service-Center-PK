import {
    Button, Card, Grid2, MenuItem, Stack, TextField,
    Typography, Box, Divider, Paper, FormControl, InputAdornment,
    IconButton,
    InputLabel,
} from "@mui/material";
import Select from "@mui/material/Select";
import { useRef, useState } from "react";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import axios from 'axios';

export default function CreateEmployeeThatBranch() {
    // Refs สำหรับเก็บค่าจากฟอร์ม
    const name = useRef(null);
    const user_code = useRef(null);
    const password = useRef(null);
    const password_confirmation = useRef(null);
    const email = useRef(null);
    const role = useRef(null);

    // State สำหรับจัดการการแสดงรหัสผ่าน
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ฟังก์ชันสำหรับการส่งฟอร์ม
    const onSubmit = (e) => {
        e.preventDefault();
        const formData = {
            name: name.current.value,
            user_code: user_code.current.value,
            password: password.current.value,
            password_confirmation: password_confirmation.current.value,
            email: email.current.value,
            role: role.current.value,
        };

        AlertDialogQuestion({
            title: 'ยืนยันการสร้างผู้ใช้',
            text: 'คุณต้องการสร้างผู้ใช้ใหม่ใช่หรือไม่?',
            confirmButtonText: 'สร้างผู้ใช้',
            cancelButtonText: 'ยกเลิก',
            onPassed: async (confirm) => {
                confirm && await createEmployee(formData);
            }
        });
    };

    // ฟังก์ชันสำหรับส่งข้อมูลไปยัง API
    const createEmployee = async (formData) => {
        let Status, Message, newEmp;
        try {
            const { data, status } = await axios.post('/emp/store', { ...formData });
            Message = data.message;
            Status = status;
            newEmp = data.newEmp;
        } catch (error) {
            Message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้';
            Status = error.response?.status || 500;
        } finally {
            AlertDialog({
                icon: Status === 200 ? 'success' : 'error',
                title: Status === 200 ? 'สร้างผู้ใช้สำเร็จ' : 'ไม่สามารถสร้างผู้ใช้ได้',
                text: Message,
                onPassed: () => {
                    Status === 200 && window.location.reload();
                }
            });
        }
    };

    // ฟังก์ชันสำหรับการเปลี่ยนการแสดงรหัสผ่าน
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, display: 'flex', alignItems: 'center' }}>
                <PersonAddIcon sx={{ mr: 1.5 }} />
                <Typography variant='h6' fontWeight="bold">เพิ่มผู้ใช้ใหม่</Typography>
            </Box>
            <Divider />
            <Card sx={{ p: 3, boxShadow: 'none' }}>
                <form onSubmit={onSubmit}>
                    <Grid2 container spacing={3}>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <TextField
                                label='ชื่อ-นามสกุล'
                                    id='name'
                                    fullWidth
                                    required
                                    inputRef={name}
                                    type='text'
                                    variant="outlined"
                                    size='small'
                                    placeholder='ระบุชื่อ-นามสกุล'
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <BadgeIcon color="primary" fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }

                                    }}
                                />
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <TextField
                                label='ชื่อผู้ใช้ (สำหรับเข้าสู่ระบบ)'
                                    id='user_code'
                                    fullWidth
                                    required
                                    inputRef={user_code}
                                    type='text'
                                    variant="outlined"
                                    size='small'
                                    placeholder='ระบุชื่อผู้ใช้'
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AccountCircleIcon color="primary" fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }

                                    }}
                                />
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <TextField
                                label='อีเมล'
                                    id='email'
                                    fullWidth
                                    required
                                    inputRef={email}
                                    type='email'
                                    variant="outlined"
                                    size='small'
                                    placeholder='ระบุอีเมล'
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color="primary" fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>บทบาท</InputLabel>
                                <Select
                                    label="บทบาท"
                                    fullWidth
                                    required
                                    inputRef={role}
                                    id="role"
                                    size='small'
                                    defaultValue='user'
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <AdminPanelSettingsIcon color="primary" />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value={'admin'}>ผู้ดูแลระบบประจำศูนย์ซ่อม</MenuItem>
                                    <MenuItem value={'user'}>ผู้ใช้ทั่วไป</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <TextField
                                    id='password'
                                    fullWidth
                                    label='รหัสผ่าน'
                                    required
                                    inputRef={password}
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    size='small'
                                    placeholder='ระบุรหัสผ่าน'
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <KeyIcon color="primary" fontSize="small" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }

                                    }}
                                />
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <TextField
                                    id='password_confirmation'
                                    fullWidth
                                    label='ยืนยันรหัสผ่าน'
                                    required
                                    inputRef={password_confirmation}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    size='small'
                                    placeholder='ยืนยันรหัสผ่านอีกครั้ง'
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <KeyIcon color="primary" fontSize="small" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowConfirmPassword}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }

                                    }}
                                />
                            </FormControl>
                        </Grid2>
                        <Grid2 size={12}>
                            <Box sx={{ mt: 2 }}>
                                <Divider sx={{ mb: 3 }} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                                    <Button
                                        variant="outlined" sx={{ px: 4 }}
                                        onClick={() => window.location.reload()}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type='submit' variant='contained'
                                        sx={{ px: 4 }} startIcon={<PersonAddIcon />}
                                    >
                                        สร้างผู้ใช้
                                    </Button>
                                </Stack>
                            </Box>
                        </Grid2>
                    </Grid2>
                </form>
            </Card>
        </Paper>
    );
}