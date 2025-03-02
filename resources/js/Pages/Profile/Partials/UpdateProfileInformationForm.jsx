import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import {Transition} from '@headlessui/react';
import {Link, useForm, usePage} from '@inertiajs/react';
import {Button, CircularProgress, TextField} from "@mui/material";

export default function UpdateProfileInformation({mustVerifyEmail, status, className = ''}) {
    const user = usePage().props.auth.user;

    const {data, setData, patch, errors, processing, recentlySuccessful} =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            shop_name: user.shop_name,
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
                    <InputLabel htmlFor="name" value="ชื่อ"/>

                    <TextField
                        id='name'
                        type='text'
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete='name'
                        fullWidth
                        size='small'
                    />
                    <InputError className="mt-2" message={errors.name}/>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="อีเมล"/>
                    <TextField
                        id='email'
                        type='email'
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete='email'
                        fullWidth
                        size='small'
                    />
                    <InputError className="mt-2" message={errors.email}/>
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="เบอร์โทรศัพท์"/>
                    <TextField
                        id='phone'
                        type='text'
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                        autoComplete='phone'
                        fullWidth
                        size='small'
                    />
                    <InputError className="mt-2" message={errors.phone}/>
                </div>

                <div>
                    <InputLabel htmlFor="address" value="ที่อยู่"/>
                    <textarea
                        id='address'
                        style={{width: '100%'}}
                        rows={4}
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        required
                        autoComplete='phone'
                    />
                    <InputError className="mt-2" message={errors.address}/>
                </div>

                <div>
                    <InputLabel htmlFor="shop_name" value={'ชื่อร้าน ' + `( ${data.is_code_cust_id} )`}/>
                    <TextField
                        id='shop_name'
                        type='text'
                        value={data.shop_name}
                        onChange={(e) => setData('shop_name', e.target.value)}
                        required
                        autoComplete='shop_name'
                        fullWidth
                        size='small'
                    />
                    <InputError className="mt-2" message={errors.shop_name}/>
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

                <div className="flex items-center gap-4">
                    <Button type='submit' disabled={processing} variant='contained'
                            startIcon={processing && <CircularProgress size={20}/>}>
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
