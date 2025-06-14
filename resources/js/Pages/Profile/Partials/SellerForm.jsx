import { Transition } from '@headlessui/react';
import {useForm, usePage} from '@inertiajs/react';
import {FormLabel, TextField} from "@mui/material";

export default function SellerForm({ className = '' }) {
    const {recentlySuccessful ,errors} = useForm({ sellerId: '', });
    const updatePassword = (e) => {
        e.preventDefault();
        alert('กำลังพัฒนา')
    };
    const sale_info = usePage().props.auth.sale_info;
    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">พนักงานขาย ประจำร้าน (Sale)</h2>
            </header>
            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <FormLabel required htmlFor="sellerName">ชื่อ-นามสกุล</FormLabel>
                    <TextField
                        value={sale_info?.sale_name || ''}  id="sellerName" type="text" fullWidth size='small' disabled
                        error={!!errors.password} helperText={errors.password}
                    />
                </div>
                <div className="flex items-center gap-4">
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
