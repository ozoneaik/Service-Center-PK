import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Transition } from '@headlessui/react';
import {useForm, usePage} from '@inertiajs/react';
import { useRef } from 'react';
import { Button, CircularProgress, TextField } from "@mui/material";

export default function SellerForm({ className = '' }) {
    const sellerIdInput = useRef(null);
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({ sellerId: '', });
    const updatePassword = (e) => {
        e.preventDefault();
        alert('กำลังพัฒนา')
        // put(route('password.update'), {
        //     preserveScroll: true,
        //     onSuccess: () => reset(),
        //     onError: (errors) => {
        //         if (errors.password) {
        //             reset('password', 'password_confirmation');
        //             sellerIdInput.current.focus();
        //         }
        //     },
        // });
    };
    const sale_info = usePage().props.auth.sale_info;
    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">พนักงานขาย ประจำร้าน (Sale)</h2>
                {/*<p className="mt-1 text-sm text-gray-600">คำอธิบาย</p>*/}
            </header>
            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    {/*<InputLabel htmlFor="sellerId" value="รหัสเซลล์" />*/}
                    {/*<TextField*/}
                    {/*    type='hidden'*/}
                    {/*    id="sellerId" inputRef={sellerIdInput} value={data.sellerId}*/}
                    {/*    // onChange={(e) => setData('sellerId', e.target.value)}*/}
                    {/*    fullWidth size='small'*/}
                    {/*/>*/}
                    {/*<InputError message={errors.sellerId} className="mt-2" />*/}
                </div>

                <div>
                    <InputLabel htmlFor="sellerName" value="ชื่อ-นามสกุล" />
                    <TextField value={sale_info.sale_name}  id="sellerName" type="text" fullWidth size='small' disabled />
                    <InputError message={errors.password} className="mt-2" />
                </div>
                <div className="flex items-center gap-4">
                    {/*<Button*/}
                    {/*    variant='contained' disabled={processing} type='submit'*/}
                    {/*    startIcon={processing && <CircularProgress size={20} />}*/}
                    {/*>*/}
                    {/*    บันทึก*/}
                    {/*</Button>*/}
                    <Transition show={recentlySuccessful}>
                        <p className="text-sm text-gray-600">
                            บันทึกสำเร็จ
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    )
}
