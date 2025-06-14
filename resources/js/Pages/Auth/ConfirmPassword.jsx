import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import {Button, FormLabel, TextField} from "@mui/material";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setData(name, value);
    }

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-4 text-sm text-gray-600">
                นี่คือพื้นที่ปลอดภัยของแอปพลิเคชัน โปรดยืนยันรหัสผ่านของคุณก่อนดำเนินการต่อ
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <FormLabel required htmlFor="password">รหัสผ่าน</FormLabel>

                    <TextField
                        id='password' type="password"
                        name='password' value={data.password}
                        focused onChange={handleChange}
                        helperText={errors.password} error={!!errors.password}
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Button variant='contained' className="ms-4" disabled={processing}>
                        Confirm
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
