import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Stack, TextField } from '@mui/material';

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
                    <InputLabel htmlFor="name" value="ชื่อ" />
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='name' type='text' name='name'
                        value={data.name} required
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
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

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="ยืนยันรหัสผ่าน"/>
                    <TextField
                        variant='outlined' fullWidth size='small'
                        id='password_confirmation' type='password' name='password_confirmation'
                        value={data.password_confirmation} required
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
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
