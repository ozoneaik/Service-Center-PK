import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import {Button, FormLabel, TextField} from "@mui/material";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <form onSubmit={submit}>
                <div>
                    <FormLabel required htmlFor="email" >Email</FormLabel>
                    <TextField
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        error={!!errors.email} helperText={errors.email}
                    />
                </div>

                <div className="mt-4">
                    <FormLabel required htmlFor="password">Password</FormLabel>
                    <TextField
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        error={!!errors.password} helperText={errors.password}
                    />
                </div>

                <div className="mt-4">
                    <FormLabel required htmlFor="password_confirmation">Confirm Password</FormLabel>
                    <TextField
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        error={!!errors.password_confirmation} helperText={errors.password_confirmation}
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Button variant='contained' className="ms-4" disabled={processing}>
                        Reset Password
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
