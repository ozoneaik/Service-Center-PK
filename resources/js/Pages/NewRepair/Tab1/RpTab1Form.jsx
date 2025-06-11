import {Button, Card, CardContent, CircularProgress, Grid2, Stack, Typography} from "@mui/material";
import {HeaderTitle} from "@/Pages/NewRepair/HeaderCardTitle.jsx";
import RpCustomerForm from "@/Pages/NewRepair/Tab1/RpCustomerForm.jsx";
import RpSRA from "@/Pages/NewRepair/Tab1/RpSRA.jsx";
import RpUploadFileBeforeForm from "@/Pages/NewRepair/Tab1/RpUploadFileBeforeForm.jsx";
import {Save} from "@mui/icons-material";
import {useEffect, useState} from "react";
import {useForm} from "@inertiajs/react";

export default function RpTab1Form({JOB, setJOB}) {
    const [loadingJob, setLoadingJob] = useState(false);
    const {data, setData} = useForm({
        customer: {
            name: '',
            phone: '',
            address: '',
            remark: '',
            subremark1: '',
            subremark2: '',
            subremark3: '',
        }
    });

    useEffect(() => {
        fetchData().finally(() => setLoadingJob(false))
    }, []);

    const fetchData = async () => {
        try {
            setLoadingJob(true);
            const {data, status} = await axios.get(route('repair.before.index', {job_id: JOB.job_id}));
            console.log('ดึงข้อมูล job บันทึกการซ่อม ==> 🔍',data)
            const customer = data.form.customer;
            const remark_symptom_accessory = data.form.remark_symptom_accessory;
            const file_befores = data.form.file_befores;
            setData('customer', customer)
            setData('remark_symptom_accessory', remark_symptom_accessory)
            setData('file_befores', file_befores)
        } catch (error) {

        }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('submit')
    }
    return (
        <>
            {loadingJob ? (<CircularProgress/>) : (
                <>
                    <button onClick={()=>console.log(data)}>click</button>
                    <form onSubmit={handleSubmit}>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <Card
                                    variant='outlined'
                                    sx={(theme) => (
                                        {backgroundColor: theme.palette.cardFormRpColor.main}
                                    )}
                                >
                                    <CardContent>
                                        <HeaderTitle headTitle='ข้อมูลลูกค้า'/>
                                        <RpCustomerForm data={data} setData={setData}/>
                                    </CardContent>
                                </Card>
                            </Grid2>
                            <Grid2 size={12}>
                                <Card
                                    variant='outlined'
                                    sx={(theme) => (
                                        {backgroundColor: theme.palette.cardFormRpColor.main}
                                    )}
                                >
                                    <CardContent>
                                        <HeaderTitle headTitle='อาการเบื้องต้น'/>
                                        <RpSRA data={data} setData={setData}/>
                                    </CardContent>
                                </Card>
                            </Grid2>
                            <Grid2 size={12}>
                                <Card
                                    variant='outlined'
                                    sx={(theme) => (
                                        {backgroundColor: theme.palette.cardFormRpColor.main}
                                    )}
                                >
                                    <CardContent>
                                        <HeaderTitle headTitle='สภาพสินค้าก่อนซ่อม'/>
                                        <RpUploadFileBeforeForm data={data} setData={setData}/>
                                    </CardContent>
                                </Card>
                            </Grid2>
                            <Grid2 size={12}>
                                <Stack direction='row' spacing={2} justifyContent='end'>
                                    <Button variant='contained' startIcon={<Save/>} type='submit'>
                                        บันทึก
                                    </Button>
                                </Stack>
                            </Grid2>
                        </Grid2>
                    </form>
                </>
            )}
        </>
    )
}
