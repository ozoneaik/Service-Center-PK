import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Button, CircularProgress, FormLabel, TextField } from "@mui/material";

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.store_info.phone,
            address: user.store_info.address,
            shop_name: user.store_info.shop_name,
            footer_description: user.store_info.footer_description || "",
            is_code_cust_id: user.is_code_cust_id,
            role: user.role,
            admin_that_branch: user.admin_that_branch,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    ข้อมูลโปรไฟล์
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    อัปเดตข้อมูลโปรไฟล์บัญชีและที่อยู่อีเมลของคุณ
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <FormLabel required htmlFor="name">ชื่อ</FormLabel>

                    <TextField
                        id='name'
                        type='text'
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete='name'
                        fullWidth
                        size='small'
                        error={!!errors.name} helperText={errors.name}
                    />
                </div>

                <div>
                    <FormLabel required htmlFor="email">อีเมล</FormLabel>
                    <TextField
                        id='email'
                        type='email'
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete='email'
                        fullWidth
                        size='small'
                        error={!!errors.email} helperText={errors.email}
                    />
                </div>

                <div>
                    <FormLabel required htmlFor="phone">เบอร์โทรศัพท์</FormLabel>
                    <TextField
                        disabled={!user.admin_that_branch}
                        id='phone'
                        type='text'
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                        autoComplete='phone'
                        fullWidth
                        size='small'
                        error={!!errors.phone} helperText={errors.phone}
                    />
                </div>

                <div>
                    <FormLabel required htmlFor="address">ที่อยู่</FormLabel>
                    <br />
                    <TextField
                        disabled={!user.admin_that_branch}
                        id='address'
                        fullWidth
                        multiline minRows={4}
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        required
                        autoComplete='phone'
                        error={!!errors.address} helperText={errors.address}
                    />
                </div>

                <div>
                    <FormLabel required htmlFor="shop_name">ชื่อร้าน {data.is_code_cust_id}</FormLabel>
                    <TextField
                        disabled={!user.admin_that_branch}
                        id='shop_name'
                        type='text'
                        value={data.shop_name}
                        onChange={(e) => setData('shop_name', e.target.value)}
                        required
                        autoComplete='shop_name'
                        fullWidth
                        size='small'
                        error={!!errors.shop_name} helperText={errors.shop_name}
                    />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            ที่อยู่อีเมลของคุณยังไม่ได้รับการยืนยัน
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                คลิกที่นี่เพื่อส่งอีเมลยืนยันอีกครั้ง
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                ลิงค์ยืนยันใหม่ได้ถูกส่งไปยังที่อยู่อีเมลของคุณแล้ว
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <FormLabel htmlFor="footer_description">ข้อความท้ายใบรับซ่อม (optional)</FormLabel>
                    <TextField
                        id="footer_description"
                        fullWidth
                        multiline
                        minRows={3}
                        value={data.footer_description || ""}
                        onChange={(e) => setData("footer_description", e.target.value)}
                        autoComplete="off"
                        size="small"
                        error={!!errors.footer_description}
                        helperText={errors.footer_description}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Button type='submit' disabled={processing} variant='contained'
                        startIcon={processing && <CircularProgress size={20} />}>
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
                            บันทึกสำเร็จ.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
