import {Button, CircularProgress, FormControl, FormLabel, Grid2, Stack, TextField} from "@mui/material";
import {Save} from "@mui/icons-material";
import {useEffect, useState} from "react";
import {useForm} from "@inertiajs/react";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

const placeholderSymptoms = 'หมายเหตุการซ่อมของช่างเทคนิค สำหรับการสื่อสารภายในศูนย์ซ่อม เช่น ตรวจสอบเครื่องเรียบร้อยแล้ว เสนอราคา';

export default function RpSymptomsRemark({job_id}) {
    const [loadingPage, setLoadingPage] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);
    const {data, setData} = useForm({
        'remark' : '',
        'symptom' : '',
        'job_id' : job_id,
        'serial_id' : '',
    })
    useEffect(() => {
        fetchData().finally(() => setLoadingPage(false));
    }, []);

    const fetchData = async () => {
        try {
            setLoadingPage(true);
            const {data, status} = await axios.get(route('repair.remark.symptom.detail',{job_id}))
            setData('remark', data.remark)
            setData('symptom',data.symptom)
            setData('serial_id',data.serial_id)
        }catch (error) {
            console.log(error)
        }
    }



    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name,value)
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        AlertDialogQuestion({
            text : 'กดตกลงเพื่อบันทึกหรืออัพเดทอาการเบื้องต้นหรือหมายเหตุสำหรับสื่อสารภายใน',
            onPassed : async (confirm) => confirm && await storeOrUpdate(data)
        });
    }

    const storeOrUpdate = async (form_data) => {
        let Status = 400;
        let Message = '';
        try {
            setLoadingForm(true);
            const {data, status} = await axios.post(route('repair.remark.symptom.store'), form_data);
            Status = status;
            Message = data.message;
        }catch (error) {
            Status = error.response.status;
            Message = error.response.data.message;
        }finally {
            setLoadingForm(false);
        }
        AlertDialog({
            text: Message,
            icon : Status === 200 ? 'success' : 'error',
        })
    }
    return (
        <>
            {!loadingPage ? (
                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <FormControl fullWidth={true}>
                                <FormLabel required sx={{mb: 1}} htmlFor='symptom'>กรอกอาการเบื้องต้น</FormLabel>
                                <TextField
                                    multiline minRows={3} type='text'
                                    placeholder='กรอกอาการเบื้องต้นที่ได้รับเข้ามาจากลูกค้า' fullWidth size='small'
                                    name='symptom' id='symptom' variant='outlined' required
                                    value={data.symptom || ''}  onChange={handleChange}
                                />
                            </FormControl>
                        </Grid2>
                        <Grid2 size={12}>
                            <FormControl fullWidth={true}>
                                <FormLabel sx={{mb: 1}} htmlFor='remark'>หมายเหตุสำหรับสื่อสารภายใน</FormLabel>
                                <TextField
                                    multiline minRows={3} value={data.remark || ''}
                                    placeholder={placeholderSymptoms}
                                    fullWidth size='small' type='text'
                                    name='remark' id='remark' variant='outlined'
                                    onChange={handleChange}
                                />
                            </FormControl>
                        </Grid2>
                        <Grid2 size={12}>
                            <Stack direction='row' justifyContent='end'>
                                <Button loading={loadingForm} type='submit' startIcon={<Save/>} variant='contained'>
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
