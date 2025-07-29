import { Head, useForm } from '@inertiajs/react';
import {
    Box, Button, CardContent, Container,
    FormControl, FormHelperText, InputAdornment,
    Paper, Stack, TextField, Typography, Alert, useTheme,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Logo from '../../assets/images/horizontalLogo1.png';
import SettingsIcon from '@mui/icons-material/Settings';
import HeaderImage from '../../assets/images/cover.png'
import watermark from '../../assets/images/coverMini.jpg'

const HeaderImageStyle = {
    backgroundImage: `url(${HeaderImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% auto',
    backgroundPosition: 'top',
    width: '100vw', height: '100vh'
}

const WatermarkStyle = {
    backgroundImage: `url(${watermark})`,
    backgroundRepeat: 'repeat',
    backgroundSize: '300px auto',
    backgroundPosition: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    pointerEvents: 'none'
}

const MuiGuestLayout = ({ children }) => {
    const theme = useTheme();
    const pumpkinColor = theme.palette.pumpkinColor;
    return (
        <div style={HeaderImageStyle}>
            <div style={WatermarkStyle}></div>
            <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper elevation={3} sx={{ width: '100%', p: 0, borderRadius: 2, overflow: 'hidden' }}>
                    <Stack direction='column' alignItems='center' spacing={2}>
                        <Box>
                            <img src={Logo || ''} alt="no image" width='100%' />
                        </Box>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            <SettingsIcon id="rotating-icon" sx={{ color: pumpkinColor.main }} fontSize='large' />
                            <Typography variant='h6' align="center" sx={{ color: pumpkinColor.main, mt: 2 }} fontWeight="bold">
                                SERVICE CENTER | บริการศูนย์ซ่อม
                            </Typography>
                            <SettingsIcon id="rotating-icon" sx={{ color: pumpkinColor.main }} fontSize='large' />
                        </Stack>
                    </Stack>
                    <CardContent sx={{ p: 3 }}>
                        {children}
                    </CardContent>
                </Paper>
            </Container>
        </div>

    );
};

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_code: '', password: '', remember: false,
    });
    const theme = useTheme();
    const pumpkinColor = theme.palette.pumpkinColor;
    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () =>{
                reset('password');
                console.log('hell0 world')
            },
        });
    };

    return (
        <MuiGuestLayout>
            <Head title="เข้าสู่ระบบ" />
            {status && (
                <Alert severity="success" sx={{ mb: 3 }}>{status}</Alert>
            )}
            <form onSubmit={submit}>
                <Stack spacing={3}>
                    <FormControl variant="outlined" fullWidth>
                        <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                            รหัสผู้ใช้งาน
                        </Typography>
                        <TextField
                            color='pumpkinColor'
                            variant="outlined" fullWidth id="user_code" name="user_code"
                            value={data.user_code} error={Boolean(errors.user_code)} required
                            autoFocus onChange={(e) => setData('user_code', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color='pumpkinColor' />
                                        </InputAdornment>
                                    )
                                }

                            }}
                            placeholder="กรุณาระบุรหัสผู้ใช้งาน"
                        />
                        {errors.user_code && (<FormHelperText sx={{ fontSize: 16 }} error>{errors.user_code}</FormHelperText>)}
                    </FormControl>

                    <FormControl variant="outlined" fullWidth>
                        <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                            รหัสผ่าน
                        </Typography>
                        <TextField
                            variant="outlined" fullWidth id="password" name="password"
                            type='password' value={data.password} color='pumpkinColor'
                            error={Boolean(errors.password)} required
                            onChange={(e) => setData('password', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: pumpkinColor.main }} />
                                        </InputAdornment>
                                    )
                                }

                            }}
                            placeholder="กรุณาระบุรหัสผ่าน"
                        />
                        {errors.password && (
                            <FormHelperText sx={{ fontSize: 16 }} error>{errors.password}</FormHelperText>
                        )}
                    </FormControl>

                    <Button
                        loading={processing}
                        type="submit" fullWidth disabled={processing} startIcon={<LoginIcon />}
                        variant="contained" size="large"
                        sx={{ py: 1.2, bgcolor: 'pumpkinColor.main' }}
                    >
                        เข้าสู่ระบบ
                    </Button>
                </Stack>
            </form>
        </MuiGuestLayout>
    );
}
