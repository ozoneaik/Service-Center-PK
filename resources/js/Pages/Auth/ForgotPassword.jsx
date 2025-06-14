import GuestLayout from '@/Layouts/GuestLayout';
import {Head, useForm} from '@inertiajs/react';
import {Button, TextField} from "@mui/material";

export default function ForgotPassword({status}) {
    const {data, setData, post, processing, errors} = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
    }

    return (
        <GuestLayout>
            <Head title="Forgot Password"/>

            <div className="mb-4 text-sm text-gray-600">
                ลืมรหัสผ่านหรือไม่? ไม่ต้องกังวล เพียงแจ้งที่อยู่อีเมลของคุณให้เราทราบ
                แล้วเราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณทางอีเมล ซึ่งจะช่วยให้คุณเลือกรหัสผ่านใหม่ได้
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextField
                    id="email" type="email" name="email"
                    value={data.email} focused onChange={handleChange}
                    error={!!errors.email} helperText={errors.email}
                />

                <div className="mt-4 flex items-center justify-end">
                    <Button variant='contained' className="ms-4" disabled={processing}>
                        Email Password Reset Link
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
