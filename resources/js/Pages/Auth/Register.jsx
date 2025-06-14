import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {Button, FormLabel, Stack, TextField} from '@mui/material';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <FormLabel required htmlFor="name">ชื่อ</FormLabel>
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='name' type='text' name='name'
                        value={data.name} required
                        onChange={(e) => setData('name', e.target.value)}
                        error={!!errors.name} helperText={errors.name}
                        autoFocus
                    />
                </div>

                <div className="mt-4">
                    <FormLabel required htmlFor="email">อีเมล</FormLabel>
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='email' type='email' name='email'
                        value={data.email} required
                        onChange={(e) => setData('email', e.target.value)}
                        error={!!errors.email} helperText={errors.email}
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

                <div className="mt-4">
                    <FormLabel required htmlFor="password_confirmation">ยืนยันรหัสผ่าน</FormLabel>
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='password_confirmation' type='password' name='password_confirmation'
                        value={data.password_confirmation} required
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={!!errors.password_confirmation} helperText={errors.password_confirmation}
                    />
                </div>

                <Stack direction='row' spacing={2} justifyContent='end' alignItems='center' mt={2}>
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        มับสมัครแล้ว? เข้าสู่ระบบ
                    </Link>
                    <Button type='submit' disabled={processing} variant="contained">
                        ลงทะเบียน
                    </Button>
                </Stack>
            </form>
        </GuestLayout>
    );
}
