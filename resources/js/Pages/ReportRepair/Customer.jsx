import {Button, CircularProgress, FormLabel, Stack, TextField, Typography} from "@mui/material";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {useRef, useState} from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

export const Customer = ({detail, setDetail}) => {
    const tel = useRef(null);
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState({
        phone: detail.selected.customerInJob.phone ?? '',
        name: detail.selected.customerInJob.name ?? '',
        address: detail.selected.customerInJob.address ?? '',
        remark: detail.selected.customerInJob.remark ?? '',
        subremark1: detail.selected.customerInJob.subremark1 ?? false,
        subremark2: detail.selected.customerInJob.subremark2 ?? false,
    });
    console.log(detail)
    const onSubmit = (e) => {
        console.log(customer)
        e.preventDefault();
        let Status = 400;
        let message = '';
        AlertDialog({
            icon: 'question',
            title: 'ยืนยันการบันทึกข้อมูล',
            text: 'กดตกลงเพื่อบันทึกหรืออัพเดทข้อมูล',
            onPassed: async (confirm) => {

                if (confirm) {
                    setLoading(true);
                    try {
                        const {data, status} = await axios.post('/customer-in-job/store', {
                            job_id: detail.job.job_id,
                            serial_id: detail.serial,
                            ...customer
                        });
                        console.log(data, status)
                        Status = status;
                        message = data.message;
                        setCustomer({
                        //     phone: data.phone,
                        //     name: data.name,
                        //     address: data.address,
                        //     remark: data.remark,
                        //     subremark1: data.subRemark1,
                        //     subremark2: data.subRemark2
                            ...data.data
                        });
                        setDetail(prevDetail => ({
                            ...prevDetail,
                            selected: {
                                ...prevDetail.selected,
                                customerInJob: data.data
                            }
                        }));
                    } catch (error) {
                        console.log(error.response.data.message)
                        Status = error.response.status;
                        message = error.response.data.message;
                    } finally {
                        AlertDialog({
                            icon: Status === 200 ? 'success' : 'error',
                            title: Status === 200 ? 'สำเร็จ' : 'เกิดข้อผิดพลาด',
                            text: message,
                            onPassed: () => {
                            }
                        })
                        setLoading(false)
                    }
                }
            }
        })

    }

    const searchCustomer = async () => {
        setLoading(true);
        let Status = 400;
        let message = '';
        try {
            const {data, status} = await axios.get(`/customer-in-job/searchPhone/${customer.phone}`);
            console.log(data, status)
            Status = status;
            message = data.message;
            setCustomer({
                phone: data.data.phone,
                name: data.data.name,
                address: data.data.address,
                remark: data.data.remark,
                subremark1: data.subremark1,
                subremark2: data.subremark2,
            });
        } catch (error) {
            console.log(error.response.data.message)
            Status = error.response.status;
            message = error.response.data.message;
        } finally {
            AlertDialog({
                icon: Status === 200 ? 'success' : 'error',
                title: Status === 200 ? 'สำเร็จ' : 'เกิดข้อผิดพลาด',
                text: message,
                onPassed: () => {
                }
            })
            setLoading(false)
        }
    }
    return (
        <form onSubmit={onSubmit}>
            <Stack direction='column' spacing={2}>
                <Typography>เบอร์โทรศัพท์</Typography>
                <Stack direction='row' spacing={2}>

                    <TextField
                        required
                        value={customer.phone} onChange={(e) => {
                        setCustomer(prevState => ({...prevState, phone: e.target.value}))
                    }}
                        inputRef={tel} fullWidth placeholder='เบอร์โทรศัพท์' type='number' size='small'
                    />
                    <Button disabled={loading} size='small' variant='contained' onClick={() => searchCustomer()}>
                        {loading ? <CircularProgress/> : 'ค้นหา'}
                    </Button>
                </Stack>
                <Typography>ชื่อ-นามสกุล</Typography>
                <TextField
                    required
                    value={customer.name}
                    onChange={(e) => {
                        setCustomer(prevState => ({...prevState, name: e.target.value}));
                    }}
                    placeholder="ชื่อ-นามสกุล"
                    size="small"
                />

                <Typography>ที่อยู่</Typography>
                <textarea
                    required
                    value={customer.address}
                    onChange={(e) => {
                        setCustomer(prevState => ({...prevState, address: e.target.value}));
                    }}
                    placeholder="ที่อยู่"
                />

                <Stack direction='row' spacing={1} alignItems='center'>
                    <Typography>หมายเหตุสำหรับลูกค้า</Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                defaultChecked={customer.subremark1}
                                onChange={(e) => setCustomer(prevState => ({
                                    ...prevState,
                                    subremark1: e.target.checked
                                }))}
                            />
                        }
                        label="เสนอราคาก่อนซ่อม"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                defaultChecked={customer.subremark2}
                                onChange={(e) => setCustomer(prevState => ({
                                    ...prevState,
                                    subremark2: e.target.checked
                                }))}
                            />
                        }
                        label="ซ่อมเสร็จส่งกลับทางไปรษณีย์"
                    />
                </Stack>
                <textarea
                    required
                    value={customer.remark}
                    onChange={(e) => {
                        setCustomer(prevState => ({...prevState, remark: e.target.value}))
                    }}
                    placeholder="หมายเหตุสำหรับลูกค้าในการสื่อสาร เช่น ลูกค้าให้ส่งใบเสนอราคาก่อนซ่อม,ลูกค้าต้องการให้จัดส่งสินค้าตามที่อยู่การจัดส่ง"
                />
                <Stack direction='row-reverse' spacing={2}>
                    <Button variant='contained' type='submit' disabled={detail.job.status !== 'pending'}>บันทึก</Button>
                    {/*<Button variant='outlined'>ยกเลิก</Button>*/}
                </Stack>
            </Stack>
        </form>
    )
}
