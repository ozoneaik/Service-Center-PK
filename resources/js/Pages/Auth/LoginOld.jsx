import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import {Button, FormLabel, Stack, TextField} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_code: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <FormLabel required htmlFor="user_code">รหัสผู้ใช้งาน</FormLabel>
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='user_code' name='user_code'
                        value={data.user_code} required
                        onChange={(e) => setData('user_code', e.target.value)}
                        error={!!errors.user_code} helperText={errors.user_code}
                    />

                </div>

                <div className="mt-4">
                    <FormLabel required htmlFor="password">รหัสผ่าน</FormLabel>
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='password' type='password' name='password'
                        value={data.password} required
                        onChange={(e) => setData('password', e.target.value)}
                        error={!!errors.password} helperText={errors.password}
                    />

                </div>
                <Stack direction='row' mt={2}>
                    <Button type='submit' fullWidth disabled={processing} startIcon={<LoginIcon/>} variant="contained">
                        {processing ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}
                    </Button>
                </Stack>
            </form>
        </GuestLayout>
    );
}
