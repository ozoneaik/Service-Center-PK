import { Button, Card, CardContent, CircularProgress, Grid2, Stack } from "@mui/material";
import { HeaderTitle } from "@/Pages/NewRepair/HeaderCardTitle.jsx";
import RpCustomerForm from "@/Pages/NewRepair/Tab1/RpCustomerForm.jsx";
import RpSRA from "@/Pages/NewRepair/Tab1/RpSRA.jsx";
import RpUploadFileBeforeForm from "@/Pages/NewRepair/Tab1/RpUploadFileBeforeForm.jsx";
import { Save } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import RpWorkReceipt from "@/Pages/NewRepair/Tab1/RpWorkReceipt.jsx";

const textQuestion = `
<span>กด ตกลง เพื่อยืนยันการบันทึกข้อมูลแจ้งซ่อม</span>
<br/>
<span style="color: red">⚠️ เมื่อบันทึกแล้ว จะไม่สามารถย้อนกลับมาแก้ไขในหน้านี้ได้</span>
`

export default function RpTab1Form({ JOB, setJOB, form1Saved, setForm1Saved, setMainStep,setTabValue }) {
    const [loadingJob, setLoadingJob] = useState(false);
    const { data, setData, processing, post } = useForm({
        job_id: JOB.job_id,
        serial_id: JOB.serial_id,
    });

    useEffect(() => {
        fetchData().finally(() => setLoadingJob(false))
    }, []);

    const fetchData = async () => {
        try {
            setLoadingJob(true);
            const { data, status } = await axios.get(route('repair.before.index', { job_id: JOB.job_id }));
            const customer = data.form.customer;
            const remark_symptom_accessory = data.form.remark_symptom_accessory;
            const file_befores = data.form.file_befores;
            const saved = data.saved || false;
            if (saved) {
                setForm1Saved(true);
            } else {
                setForm1Saved(false);
            }
            setData('customer', customer)
            setData('remark_symptom_accessory', remark_symptom_accessory)
            setData('file_befores', file_befores)
        } catch (error) {

        }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data)
        AlertDialogQuestion({
            text: textQuestion,
            onPassed: (confirm) => {
                if (confirm) {
                    post(route('repair.before.store'), {
                        preserveState: true,
                        preserveScroll: true,
                        forceFormData: true,
                        transform: (data) => {
                            const formData = new FormData();

                            formData.append('job_id', data.job_id);

                            // 🧾 แยกฟิลด์ customer
                            for (const [key, value] of Object.entries(data.customer || {})) {
                                formData.append(`customer[${key}]`, value);
                            }

                            // 🧾 แยกฟิลด์ remark_symptom_accessory
                            for (const [key, value] of Object.entries(data.remark_symptom_accessory || {})) {
                                formData.append(`remark_symptom_accessory[${key}]`, value);
                            }

                            // 📂 ส่งเฉพาะไฟล์ใหม่ (ที่เป็น File object)
                            if (Array.isArray(data.file_befores)) {
                                data.file_befores.forEach((fileItem, index) => {
                                    if (fileItem.file instanceof File) {
                                        formData.append(`file_befores[]`, fileItem.file);
                                    }
                                });
                            }

                            return formData;
                        },
                        onError: (res) => {
                            let error_message = '';
                            console.log(res)
                            if (res.file_befores) {
                                error_message = res.file_befores
                            }

                            AlertDialog({
                                text: error_message
                            })
                        },
                        onSuccess: (res) => {
                            const resMessage = res.props.flash;
                            AlertDialog({
                                icon: resMessage.error ? 'error' : 'success',
                                text: resMessage.message || resMessage.error || resMessage.success,
                                onPassed: () => {
                                    // setForm1Saved(true);
                                    if (resMessage.success) {
                                        setTabValue(1);
                                    }
                                    resMessage.success && fetchData().finally(() => {
                                        setLoadingJob(false)
                                        // window.open(route('genReCieveSpPdf',JOB.job_id),'_blank')
                                    })
                                }
                            });

                            

                        },
                    });

                }
            }
        })

    }
    return (
        <>
            {loadingJob ? (<CircularProgress />) : (
                <>
                    {/*<button onClick={() => console.log(data)}>click</button>*/}
                    <form onSubmit={handleSubmit}>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <Card
                                    variant='outlined'
                                    sx={(theme) => (
                                        { backgroundColor: theme.palette.cardFormRpColor.main }
                                    )}
                                >
                                    <CardContent>
                                        <HeaderTitle headTitle='ข้อมูลลูกค้า' />
                                        <RpCustomerForm form1Saved={form1Saved} data={data} setData={setData} />
                                    </CardContent>
                                </Card>
                            </Grid2>
                            <Grid2 size={12}>
                                <Card
                                    variant='outlined'
                                    sx={(theme) => (
                                        { backgroundColor: theme.palette.cardFormRpColor.main }
                                    )}
                                >
                                    <CardContent>
                                        <HeaderTitle headTitle='อาการเบื้องต้น' />
                                        <RpSRA form1Saved={form1Saved} data={data} setData={setData} />
                                    </CardContent>
                                </Card>
                            </Grid2>
                            <Grid2 size={12}>
                                <Card
                                    variant='outlined'
                                    sx={(theme) => (
                                        { backgroundColor: theme.palette.cardFormRpColor.main }
                                    )}
                                >
                                    <CardContent>
                                        <HeaderTitle headTitle='สภาพสินค้าก่อนซ่อม' />
                                        <RpUploadFileBeforeForm form1Saved={form1Saved} data={data} setData={setData} />
                                    </CardContent>
                                </Card>
                            </Grid2>
                            {JOB.customer?.name && JOB.customer?.phone && JOB.remark_symptom_accessory?.symptom && (
                                <Grid2 size={12}>
                                    <Card
                                        variant='outlined'
                                        sx={(theme) => (
                                            { backgroundColor: theme.palette.cardFormRpColor.main }
                                        )}
                                    >
                                        <CardContent>
                                            <HeaderTitle headTitle='ใบรับงานสินค้า' />
                                            <RpWorkReceipt form1Saved={form1Saved} JOB={JOB} />
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            )}
                            <Grid2 size={12}>
                                <Stack direction='row' spacing={2} justifyContent='end'>
                                    <Button
                                        disabled={JOB.status !== 'pending'}
                                        // disabled={form1Saved}
                                        loading={processing} variant='contained' startIcon={<Save />}
                                        type='submit'
                                    >
                                        {form1Saved ? 'บันทึกฟอร์มเรียบร้อยแล้ว' : 'บันทึก'}
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
