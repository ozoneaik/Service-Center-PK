import React, {useEffect, useState} from "react";
import {
    Button, Card, CardContent, CircularProgress, FormControl, FormControlLabel,
    FormLabel, Grid2, Stack, TextField
} from "@mui/material";
import {Save, Search} from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import {useForm} from "@inertiajs/react";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

const placeholderRemark = 'หมายเหตุสำหรับลูกค้าในการสื่อสาร เช่น ลูกค้าให้ส่งใบเสนอราคาก่อนซ่อม,ลูกค้าต้องการให้จัดส่งสินค้าตามที่อยู่จัดส่ง';

export default function RpCustomer({job_id}) {
    const [loading, setLoading] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);
    const {data, setData} = useForm({
        phone: '', name: '', address: '', remark: '', subremark1: '', subremark2: '', job_id, serial_id: ''
    });
    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.get(route('repair.customer.detail', {job_id}));
            console.log(data, status)
            if (status === 200 && data.customer) {
                setData(data.customer);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleChange = (e) => {
        const {name, value, checked} = e.target;
        if (name === 'subremark1' || name === 'subremark2') setData(name, checked);
        else setData(name, value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        AlertDialogQuestion({
            text: 'กดตกลงเพื่อบันทึกหรืออัพเดทข้อมูลลูกค้า',
            onPassed: async (confirm) => confirm && await storeOrUpdate(data)
        });
    }

    const storeOrUpdate = async (form_data) => {
        let Status = 400;
        let Message = '';
        try {
            setLoadingForm(true);
            const {data, status} = await axios.post(route('repair.customer.store', form_data));
            console.log(data, status)
            Status = 200;
            Message = data.message;
        } catch (error) {
            console.log(error)
            Message = error.response.data.message;
            Status = error.response.status;
        }finally {
            setLoadingForm(false);
        }
        AlertDialog({
            icon: Status === 200 ? 'success' : 'error',
            text: Message,
        })
    }
    return (
        <>
            {!loading ? (
                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Card variant='outlined'>
                                <CardContent component={Stack} direction={'column'} spacing={2}>
                                    <FormControl fullWidth={true}>
                                        <FormLabel sx={{mb: 1}} required htmlFor='phone'>เบอร์โทรศัพท์</FormLabel>
                                        <Stack direction='row' spacing={2}>
                                            <TextField
                                                value={data.phone} onChange={handleChange}
                                                placeholder='ex.09999xxxx' fullWidth size='small' type='number'
                                                name='phone' id='phone' variant='outlined' required
                                            />
                                            <Button variant='contained' startIcon={<Search/>}>ค้นหา</Button>
                                        </Stack>
                                    </FormControl>
                                    <FormControl fullWidth={true}>
                                        <FormLabel sx={{mb: 1}} required htmlFor='name'>ชื่อ-นามสกุล</FormLabel>
                                        <TextField
                                            value={data.name} onChange={handleChange}
                                            placeholder='ex.มานี มานะ' fullWidth size='small' type='text'
                                            name='name' id='name' variant='outlined' required
                                        />
                                    </FormControl>
                                    <FormControl fullWidth={true}>
                                        <FormLabel sx={{mb: 1}} htmlFor='address'>ที่อยู่</FormLabel>
                                        <TextField
                                            value={data.address} onChange={handleChange}
                                            multiline minRows={3}
                                            placeholder='ex.999 หมู่ 9 ซอย 9 แขวง xxx กทม xxxx' fullWidth size='small'
                                            type='text'
                                            name='address' id='address' variant='outlined'
                                        />
                                    </FormControl>
                                    <FormControl fullWidth={true}>
                                        <FormLabel sx={{mb: 1}} htmlFor='remark'>หมายเหตุสำหรับลูกค้า</FormLabel>
                                        <Stack direction='row' spacing={2}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!data.subremark1}
                                                        name={'subremark1'}
                                                        onChange={handleChange}
                                                    />
                                                } label="เสนอราคาก่อนซ่อม"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!data.subremark2}
                                                        name={'subremark2'}
                                                        onChange={handleChange}
                                                    />
                                                } label="ซ่อมเสร็จส่งกลับทางไปรษณีย์"
                                            />
                                        </Stack>
                                        <TextField
                                            value={data.remark} onChange={handleChange}
                                            multiline minRows={3}
                                            placeholder={placeholderRemark}
                                            fullWidth size='small' type='text'
                                            name='remark' id='remark' variant='outlined'
                                        />
                                    </FormControl>
                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={12}>
                            <Stack direction='row' justifyContent='end'>
                                <Button
                                    loading={loadingForm}
                                    type='submit' startIcon={<Save/>}
                                    variant='contained'
                                >
                                    บันทึก
                                </Button>
                            </Stack>
                        </Grid2>
                    </Grid2>
                </form>
            ) : (
                <CircularProgress/>
            )}

        </>
    )
}
