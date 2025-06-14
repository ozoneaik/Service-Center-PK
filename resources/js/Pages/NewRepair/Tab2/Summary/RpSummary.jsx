import {Button, Card, CardContent, CircularProgress, Divider, Grid2, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import RpsCustomer from "@/Pages/NewRepair/Tab2/Summary/RpsCustomer.jsx";
import RpsBehavior from "@/Pages/NewRepair/Tab2/Summary/RpsBehavior.jsx";
import RpsUploadFile from "@/Pages/NewRepair/Tab2/Summary/RpsUploadFile.jsx";
import RpsRemarkCustomer from "@/Pages/NewRepair/Tab2/Summary/RpsRemarkCustomer.jsx";
import RpsSymptomRemarkAccessory from "@/Pages/NewRepair/Tab2/Summary/RpsSymptomRemarkAccessory.jsx";
import RpsDoc from "@/Pages/NewRepair/Tab2/Summary/RpsDoc.jsx";
import {Cancel, Save} from "@mui/icons-material";
import {AlertDialog} from "@/Components/AlertDialog.js";
import RpsSparePart from "@/Pages/NewRepair/Tab2/Summary/RpsSparePart.jsx";
import SkeletonLoading from "@/Components/SkeletonLoading.jsx";
import {CardComponent} from "@/Components/CardComponent.jsx";

export default function RpSummary({JOB}) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState({});

    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.get(route('repair.after.summary.index', {
                serial_id: JOB.serial_id,
                job_id: JOB.job_id
            }))
            console.log(data, status)
            setResult(data)
        } catch (error) {
            AlertDialog({
                text: error.response.data.message || error.message,
            });
        }
    }

    return (
        <>
            {loading ? (<SkeletonLoading/>) : (
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <CardComponent headTitle='ข้อมูลลูกค้า'>
                            <RpsCustomer customer={result.customer}/>
                        </CardComponent>
                    </Grid2>
                    <Grid2 size={12}>
                        {/*<CardComponent headTitle='รูปภาพ/วิดีโอสำหรับเคลมสินค้า'>*/}
                            <RpsUploadFile file_uploads={result.file_uploads}/>
                        {/*</CardComponent>*/}
                    </Grid2>
                    <Grid2 size={12}>
                        <CardComponent headTitle='อาการ / สาเหตุ'>
                            <RpsBehavior behaviours={result.behaviours}/>
                        </CardComponent>
                    </Grid2>
                    <Grid2 size={12}>
                        <CardComponent headTitle='บันทึกอะไหล่'>
                            <RpsSparePart spare_parts={result.spare_parts}/>
                        </CardComponent>
                    </Grid2>
                    <Grid2 size={12}>
                        <CardComponent headTitle={'หมายเหตุสำหรับลูกค้า'}>
                            <RpsRemarkCustomer customer={result.customer}/>
                        </CardComponent>
                    </Grid2>
                    <Grid2 size={12}>
                        <CardComponent headTitle='หมายเหตุสำหรับสื่อสารภายใน'>
                            <RpsSymptomRemarkAccessory
                                symptom={result.symptom} remark={result.remark}
                                accessory={result.accessory}
                            />
                        </CardComponent>
                    </Grid2>
                    {/*<Grid2 size={12}>*/}
                    {/*    <RpsDoc/>*/}
                    {/*</Grid2>*/}
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='end' spacing={2}>
                            <Button variant='contained' color='error' startIcon={<Cancel/>}>
                                ยกเลิกงานซ่อม
                            </Button>
                            <Button variant='contained' startIcon={<Save/>}>
                                ปิดงานซ่อม
                            </Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            )}
        </>

    )
}
