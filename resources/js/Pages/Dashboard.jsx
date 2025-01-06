import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { faBell, } from '@fortawesome/free-regular-svg-icons';
import { faCircleInfo, faClockRotateLeft, faFileInvoice, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ImageEmptry from '../assets/Empty.png'
import Checkbox from '@/Components/Checkbox';

const Detail = ({ title = 'title', result = '', Refe }) => (
    <div className='flex mb-3 text-lg'>
        <p className='font-bold text-gray-800'>{title} : </p>
        <span className='text-orange-600'>{result}</span>
        {Refe && <FontAwesomeIcon icon={faCircleInfo} size='lg' className='ms-2' />}
    </div>
)

export default function Dashboard({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({ serialNumber: '' });
    const [detail, setDetail] = useState({});

    const submit = (e) => {
        e.preventDefault();
        setDetail({
            previewImage: 'https://images.dcpumpkin.com/images/product/500/50175.jpg',
            serialNumber: '123456789',
            skuCode: '123456789',
            skuName: 'สินค้าทดสอบ',
            warrantyAt: '2021-01-01',
            warrantyExpire: '2022-01-01',
            status: 'อยู่ระหว่างการรับประกัน',
            warrantyCondition: 'เงื่อนไขการรับประกันสินค้า'
        });
    };



    return (
        <AuthenticatedLayout user={auth.user}// header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">แดชบอร์ด</h2>}
        >
            <Head title="Dashboard" />
            <div className="py-4">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="container mx-auto">
                                <form onSubmit={submit}>
                                    <input
                                        className="w-full focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm border-1 border-gray-300 mb-3"
                                        placeholder="กรอก SerialNumber"
                                        value={data.serialNumber}
                                        onChange={(e) => setData('serialNumber', e.target.value)}
                                    />
                                    <button type="submit" className="hidden">Submit</button> {/* ซ่อนปุ่มแต่ยังคงการทำงาน */}
                                </form>
                                {processing ? <p>กำลังโหลดข้อมูล...</p> : (
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-3">
                                            <img src={detail.previewImage || ImageEmptry} className='border-2 rounded-lg border-gray-300' width={500} height={500} />
                                        </div>
                                        <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-8 text-md">
                                            <h3 className='text-3xl mb-3 font-bold text-orange-600'>
                                                <FontAwesomeIcon icon={faFileInvoice} className='mr-3' />
                                                รายละเอียด
                                            </h3>
                                            <Detail title={'ซีเรียลนัมเบอร์'} result={detail.serialNumber} />
                                            <Detail title={'รหัสสินค้า'} result={detail.skuCode} />
                                            <Detail title={'ชื่อสินค้า'} result={detail.skuName} />
                                            <Detail title={'วันที่ลงทะเบียนรับประกัน'} result={detail.warrantyAt} Refe={'hello'} />
                                            <Detail title={'วันที่ลงหมดอายุรับประกัน'} result={detail.warrantyExpire} />
                                            <Detail title={'สถานะรับประกัน'} result={detail.status} />
                                            <Detail title={'เงื่อนไขการรับประกันสินค้า'} result={detail.warrantyCondition} />
                                        </div>
                                        <div className="col-span-12 text-md">
                                            <div className='grid grid-cols-12 gap-4'>
                                                <div className='col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-4'>
                                                    <button disabled={processing} className='btn-primary mt-4 pt-3 text-lg'>
                                                        <FontAwesomeIcon icon={faBell} className='mr-1' />
                                                        แจ้งซ่อม
                                                    </button>
                                                </div>
                                                <div className='col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-4'>
                                                    <button disabled={processing} className='btn-primary mt-4 pt-3 text-lg bg-yellow-500'>
                                                        <FontAwesomeIcon icon={faSpinner} className='mr-1' />
                                                        กำลังดำเนินการ
                                                    </button>
                                                </div>
                                                <div className='col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-4'>
                                                    <button disabled={processing} className='btn-primary mt-4 pt-3 text-lg bg-slate-400'>
                                                        <FontAwesomeIcon icon={faClockRotateLeft} className='mr-1' />
                                                        ดูประวัติการซ่อม
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-span-12'>
                                            <hr />
                                        </div>
                                        <div className='col-span-12 lg:col-span-4'>
                                            <input type="file" name="file-input" id="file-input" className="input-file" />
                                            <img src='joekr' alt="no image" />
                                            <img src='joekr' alt="no image" />
                                            <img src='joekr' alt="no image" />
                                            <img src='joekr' alt="no image" />
                                        </div>
                                        <div className='col-span-12 lg:col-span-8'>
                                            <div className='grid grid-cols-12 gap-4'>
                                                <div className='col-span-12'>
                                                    <label htmlFor="" className='mb-3'>หมายเหตุ</label>
                                                    <textarea name="" id="" className='w-full rounded border-gray-300'></textarea>
                                                </div>
                                                <div className='col-span-12 lg:col-span-6'>
                                                    <label htmlFor="">เลือกอาการ</label>
                                                    <br />
                                                    <div>
                                                        <Checkbox/>
                                                        <span>ไฟไม่ติด</span>
                                                    </div>
                                                    <div>
                                                        <Checkbox/>
                                                        <span>ไฟไม่ติด</span>
                                                    </div>
                                                </div>
                                                <div className='col-span-12 lg:col-span-6'>
                                                    <label htmlFor="">เลือกอะไหล่</label>
                                                    <ul>
                                                        <li>helo</li>
                                                        <li>helo</li>
                                                        <li>helo</li>
                                                        <li>helo</li>
                                                        <hr />
                                                        <li>ljsdlf</li>
                                                    </ul>
                                                    
                                                </div>
                                                <div className='col-span-12'>
                                                    <button className='btn-primary mt-4 pt-3 text-lg bg-yellow-500 mr-2'>บันทึก</button>
                                                    <button className='btn-primary mt-4 pt-3 text-lg bg-yellow-500 mr-2'>แก้ไข</button>
                                                    <button className='btn-primary mt-4 pt-3 text-lg bg-yellow-500 mr-2'>ยกเลิกการซ่อม</button>
                                                    <button className='btn-primary mt-4 pt-3 text-lg bg-yellow-500'>ปิดงานซ่อม</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
