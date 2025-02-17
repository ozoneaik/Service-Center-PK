import {Button, CircularProgress, FormLabel, Stack, TextField, Typography} from "@mui/material";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {useRef, useState} from "react";

export const Customer = ({detail, setDetail}) => {
    const tel = useRef(null);
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState({
        phone: detail.selected.customerInJob.phone ?? '',
        name: detail.selected.customerInJob.name ?? ''
    });
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let Status = 400;
        let message = '';
        try {
            const {data, status} = await axios.post('/customer-in-job/store', {
                job_id: detail.job.job_id,
                name: customer.name,
                phone: customer.phone
            });
            console.log(data, status)
            Status = status;
            message = data.message;
            setCustomer({
                phone: data.phone,
                name: data.name
            });
            setDetail(prevDetail => ({
                ...prevDetail,
                selected: {
                    ...prevDetail.selected,
                    customerInJob : customer
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

    const searchCustomer = async () => {
        setLoading(true);
        let Status = 400;
        let message = '';
        try {
            const {data, status} = await axios.post('/searchPhone', {phone : customer.phone});
            console.log(data, status)
            Status = status;
            message = data.message;
            setCustomer({
                phone: data.phone,
                name: data.name
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
                <Stack direction='row' spacing={2}>
                    <TextField value={customer.phone} onChange={(e) => {
                        setCustomer(prevState => ({
                            ...prevState,
                            phone: e.target.value
                        }));
                    }} inputRef={tel} fullWidth placeholder='ค้นหาเบอร์โทรศัพท์' type='number' size='small'/>
                    <Button disabled={loading} size='small' variant='contained' onClick={() => searchCustomer()}>
                        {loading ? <CircularProgress/> : 'ค้นหา'}
                    </Button>
                </Stack>
                <Typography>ชื่อ-นามสกุล</Typography>
                <TextField
                    value={customer.name}
                    onChange={(e) => {
                        setCustomer(prevState => ({
                            ...prevState,
                            name: e.target.value
                        }));
                    }}
                    placeholder="ชื่อ-นามสกุล"
                    size="small"
                />
                <Stack direction='row-reverse' spacing={2}>
                    <Button variant='contained' type='submit'>save</Button>
                    <Button color='secondary' variant='contained'>cancel</Button>
                </Stack>
            </Stack>
        </form>
    )
}
