import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button, Stack, TextField } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
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
                    <InputLabel htmlFor="email" value="อีเมล" />
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='email' type='email' name='email'
                        value={data.email} required
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="รหัสผ่าน" />
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='password' type='password' name='password'
                        value={data.password} required
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
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
