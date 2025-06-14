import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import {Button, CircularProgress, FormLabel, TextField} from "@mui/material";

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">อัปเดตรหัสผ่าน</h2>
                <p className="mt-1 text-sm text-gray-600">ตรวจสอบให้แน่ใจว่าบัญชีของคุณใช้รหัสผ่านแบบสุ่มที่ยาวเพื่อความปลอดภัย</p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <FormLabel required htmlFor="current_password">รหัสผ่านปัจจุบัน</FormLabel>

                    <TextField
                        required
                        id="current_password" ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password" fullWidth size='small'
                        helperText={errors.current_password}
                        error={!!errors.current_password}
                    />
                </div>

                <div>
                    <FormLabel required htmlFor="password">รหัสผ่านใหม่</FormLabel>
                    <TextField
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) =>
                            setData('password', e.target.value)
                        }
                        type="password" fullWidth size='small'
                        helperText={errors.password}
                        error={!!errors.password}
                    />
                </div>

                <div>
                    <FormLabel required htmlFor="password_confirmation">ยืนยันรหัสผ่าน</FormLabel>
                    <TextField
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password" fullWidth size='small'
                        helperText={errors.password_confirmation}
                        error={!!errors.password_confirmation}
                    />
                </div>

                <div className="flex items-center gap-4">

                    <Button variant='contained' disabled={processing} startIcon={processing && <CircularProgress size={20}/>} type='submit'>
                        บันทึก
                    </Button>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            บันทึกสำเร็จ
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
