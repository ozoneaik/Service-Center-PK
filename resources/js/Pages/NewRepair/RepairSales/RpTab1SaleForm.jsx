import { Button, Card, CardContent, CircularProgress, Grid2, Stack } from "@mui/material";
import { HeaderTitle } from "@/Pages/NewRepair/HeaderCardTitle.jsx";
import RpSRA from "@/Pages/NewRepair/Tab1/RpSRA.jsx";
import RpUploadFileBeforeForm from "@/Pages/NewRepair/Tab1/RpUploadFileBeforeForm.jsx";
import { Save } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import RpWorkReceipt from "@/Pages/NewRepair/Tab1/RpWorkReceipt.jsx";
import RpSaleForm from "../RepairSales/RpSaleForm"; // Import RpSaleForm

const textQuestion = `
<span>กด ตกลง เพื่อยืนยันการบันทึกข้อมูลแจ้งซ่อม</span>
<br/>
<span style="color: red">⚠️ เมื่อบันทึกแล้ว จะไม่สามารถย้อนกลับมาแก้ไขในหน้านี้ได้</span>
`

export default function RpTab1SaleForm({ JOB, setJOB, form1Saved, setForm1Saved, setMainStep, setTabValue, onSaved }) {
    const [loadingJob, setLoadingJob] = useState(false);

    const { data, setData, processing, post } = useForm({
        job_id: JOB.job_id,
        serial_id: JOB.serial_id,
        customer: {},
        remark_symptom_accessory: {},
        file_befores: []
    });

    const { props } = usePage();

    useEffect(() => {
        fetchData().finally(() => setLoadingJob(false))
    }, []);

    const fetchData = async () => {
        try {
            setLoadingJob(true);

            // ดึงข้อมูลเดิม (ถ้ามี)
            const { data: resData } = await axios.get(route('repair.before.index', { job_id: JOB.job_id }));

            const customer = resData.form.customer || {};
            const remark_symptom_accessory = resData.form.remark_symptom_accessory || {};
            const file_befores = resData.form.file_befores || [];
            const saved = resData.saved || false;

            if (saved) {
                setForm1Saved(true);
            } else {
                setForm1Saved(false);
            }

            // ถ้ายังไม่ Save และไม่มีข้อมูลร้านค้าใน Form -> ให้ดึงจาก JOB มาใส่เป็น Default
            if (!saved && (!customer.shop_under_sale || !customer.is_code_cust_id)) {
                customer.shop_under_sale = JOB.cust_name || JOB.shop_under_sale_name || '';
                customer.is_code_cust_id = JOB.cust_code || JOB.is_code_cust_id || '';
                // เพิ่มเติม: ดึงเบอร์โทรและชื่อผู้ติดต่อถ้ามี
                if (JOB.cust_phone) customer.phone = JOB.cust_phone;
                if (JOB.cust_name) customer.name = JOB.cust_name;
            }

            setData('customer', customer);
            setData('remark_symptom_accessory', remark_symptom_accessory);
            setData('file_befores', file_befores);

        } catch (error) {
            console.error("Error fetching job data:", error);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.customer?.is_code_cust_id) {
            AlertDialog({
                icon: 'warning',
                title: 'ข้อมูลไม่ครบถ้วน',
                text: 'กรุณาเลือกศูนย์บริการ (Service Center) ก่อนบันทึก',
            });
            return; // หยุดการทำงาน ไม่ให้ไปต่อ
        } else if (!data.customer?.phone) {
            AlertDialog({
                icon: 'warning',
                title: 'ข้อมูลไม่ครบถ้วน',
                text: 'กรุณากรอกเบอร์โทรศัพท์ ก่อนบันทึก',
            });
            return; // หยุดการทำงาน ไม่ให้ไปต่อ
        }

        const submitRoute = route('repair.sale.store.detail');

        console.log("Submitting to:", submitRoute);

        AlertDialogQuestion({
            text: textQuestion,
            onPassed: (confirm) => {
                if (confirm) {
                    post(submitRoute, {
                        preserveState: true,
                        preserveScroll: true,
                        forceFormData: true,
                        transform: (currentData) => {
                            const formData = new FormData();

                            formData.append('job_id', currentData.job_id);

                            // 🧾 แยกฟิลด์ customer
                            const custData = currentData.customer || {};
                            for (const [key, value] of Object.entries(custData)) {
                                formData.append(`customer[${key}]`, value ?? '');
                            }

                            // [Logic เพิ่มเติม] ถ้าใน custData ไม่มีข้อมูลร้านค้า ให้ดึงจาก JOB ใส่เข้าไป (เผื่อกรณี User ไม่ได้แก้ไข Form)
                            if (!custData.shop_under_sale && (JOB.cust_name || JOB.shop_under_sale_name)) {
                                formData.append('customer[shop_under_sale]', JOB.cust_name || JOB.shop_under_sale_name);
                            }
                            if (!custData.is_code_cust_id && (JOB.cust_code || JOB.is_code_cust_id)) {
                                formData.append('customer[is_code_cust_id]', JOB.cust_code || JOB.is_code_cust_id);
                            }
                            if (!custData.shop_under_sale_id && JOB.shop_under_sale_id) {
                                formData.append('customer[shop_under_sale_id]', JOB.shop_under_sale_id);
                            }

                            // 🧾 แยกฟิลด์ remark_symptom_accessory
                            for (const [key, value] of Object.entries(currentData.remark_symptom_accessory || {})) {
                                formData.append(`remark_symptom_accessory[${key}]`, value ?? '');
                            }

                            // 📂 ส่งเฉพาะไฟล์ใหม่ (ที่เป็น File object)
                            if (Array.isArray(currentData.file_befores)) {
                                currentData.file_befores.forEach((fileItem) => {
                                    if (fileItem.file instanceof File) {
                                        formData.append(`file_befores[]`, fileItem.file);
                                    }
                                });
                            }

                            return formData;
                        },
                        onError: (res) => {
                            let error_message = 'เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูล';
                            console.log(res);
                            if (res.file_befores) error_message = res.file_befores;
                            if (res.error) error_message = res.error;

                            AlertDialog({ text: error_message });
                        },
                        onSuccess: (res) => {
                            const resMessage = res.props.flash;
                            AlertDialog({
                                icon: resMessage.error ? 'error' : 'success',
                                text: resMessage.message || resMessage.error || resMessage.success,
                                onPassed: () => {
                                    if (resMessage.success) {
                                        setTabValue(1);
                                        // เรียก fetchData ใหม่เพื่อ update state
                                        fetchData().finally(() => setLoadingJob(false));
                                        if (onSaved) onSaved();
                                    }
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
            {loadingJob ? (<CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />) : (
                <>
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

                                        <RpSaleForm
                                            form1Saved={form1Saved}
                                            data={data}
                                            setData={setData}
                                            JOB={JOB}
                                        />

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

                            {/* แสดงใบรับงาน ถ้าข้อมูลครบถ้วน */}
                            {/* หมายเหตุ: เช็คจาก data.customer หรือ JOB ก็ได้ แต่ควรเช็คให้ครอบคลุม */}
                            {/* {((data.customer?.name && data.customer?.phone) || (JOB.customer?.name && JOB.customer?.phone)) &&
                                ((data.remark_symptom_accessory?.symptom) || (JOB.remark_symptom_accessory?.symptom)) && (
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
                                )} */}

                            <Grid2 size={12}>
                                <Stack direction='row' spacing={2} justifyContent='end'>
                                    <Button
                                        // ปิดปุ่มถ้า status ไม่ใช่ pending (หรือสถานะอื่นที่อนุญาตให้แก้ไข)
                                        // หรือถ้า form1Saved เป็น true ก็อาจจะปิดด้วย แล้วแต่ requirement (ในที่นี้ปิดถ้า Save แล้ว)
                                        disabled={JOB.status !== 'pending' && JOB.status_mj !== 'active'}

                                        loading={processing}
                                        variant='contained'
                                        startIcon={<Save />}
                                        type='submit'
                                        sx={{ bgcolor: form1Saved ? 'grey.500' : 'primary.main' }}
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