import {
    Accordion, AccordionDetails, AccordionSummary,
    Alert, Button, Chip, CircularProgress,
    Grid2, Stack, Typography,
} from "@mui/material";
import { Add, Edit, ExpandMore } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import RpTab1Form from "@/Pages/NewRepair/Tab1/RpTab1Form.jsx";
import { usePage } from "@inertiajs/react";

export default function DealerRpMain({ productDetail, serial_id }) {
    const { auth } = usePage().props;
    const storeInfo = auth?.user?.store_info;

    const [message, setMessage] = useState("ไม่สามารถกระทำการใดๆ");
    const [searchingJob, setSearchingJob] = useState(true);
    const [JOB, setJOB] = useState();
    const [jobFromPids, setJobFromPids] = useState([]);
    const [selectJobFromPid, setSelectJobFromPid] = useState({ job_id: null });
    const [form1Saved, setForm1Saved] = useState(false);
    const [propSn, setPropSn] = useState(serial_id);

    const dealerName = storeInfo?.shop_name ?? "";
    const dealerPhone = storeInfo?.phone ?? "";
    const [showDealerForm, setShowDealerForm] = useState(false);

    useEffect(() => {
        fetchData(propSn).finally(() => setSearchingJob(false));
    }, []);

    const fetchData = async (sn) => {
        try {
            setSearchingJob(true);
            const { data } = await axios.post(route("dealerRepair.search.job", {
                serial_id: sn,
                pid: productDetail.pid,
                job_id: productDetail.job_id || null,
            }));

            if (data.search_by === "pid") {
                setJobFromPids(data.jobs);
                return;
            }
            setJOB(data.job.job_detail);
            setPropSn(sn);
        } catch (error) {
            const status = error.response?.status;
            if (status === 404 && error.response?.data?.found === false) {
                setShowDealerForm(true);
            }
            setMessage(error.response?.data?.message || "ไม่พบข้อมูล");
        }
    };

    const confirmAndStoreJob = () => {
        if (!dealerName.trim() || !dealerPhone.trim()) {
            AlertDialog({ text: "กรุณากรอกชื่อร้านค้าและเบอร์ติดต่อก่อน" });
            return;
        }

        AlertDialogQuestion({
            title: "ยืนยันการแจ้งซ่อม",
            text: "กด ตกลง เพื่อยืนยันการแจ้งซ่อม",
            onPassed: async (confirm) => {
                if (!confirm) return;
                try {
                    setSearchingJob(true);
                    await axios.post(route("dealerRepair.store", {
                        serial_id: propSn,
                        productDetail: productFormat(productDetail),
                        dealer_name: dealerName,
                        dealer_phone: dealerPhone,
                    }));
                    setShowDealerForm(false);
                    fetchData(propSn).finally(() => setSearchingJob(false));
                } catch (error) {
                    AlertDialog({ text: error.response?.data?.message || error.message });
                    setSearchingJob(false);
                }
            },
        });
    };

    const storeJobFromPid = () => {
        if (!dealerName.trim() || !dealerPhone.trim()) {
            AlertDialog({ text: "กรุณากรอกชื่อร้านค้าและเบอร์ติดต่อก่อน" });
            return;
        }

        AlertDialogQuestion({
            title: "ยืนยันการบันทึกข้อมูลแจ้งซ่อม",
            text: "กด ตกลง เพื่อยืนยันการบันทึกข้อมูลแจ้งซ่อม",
            onPassed: async (confirm) => {
                if (!confirm) return;
                try {
                    setSearchingJob(true);
                    const { data } = await axios.post(route("dealerRepair.store.from.pid", {
                        productDetail: productFormat(productDetail),
                        dealer_name: dealerName,
                        dealer_phone: dealerPhone,
                    }));
                    setShowDealerForm(false);
                    fetchData(data.serial_id).finally(() => setSearchingJob(false));
                } catch (error) {
                    AlertDialog({ text: error.response?.data?.message || error.message });
                } finally {
                    setSearchingJob(false);
                }
            },
        });
    };

    const productFormat = (pd) => ({
        pid: pd.pid,
        pname: pd.pname,
        pbaseunit: pd.pbaseunit,
        pcatid: pd.pcatid,
        pCatName: pd.pCatName,
        pSubCatName: pd.pSubCatName,
        facmodel: pd.facmodel,
        imagesku: pd.imagesku,
        warrantyperiod: pd.warrantyperiod,
        warrantycondition: pd.warrantycondition,
        warrantynote: pd.warrantynote,
        warranty: pd.warranty || pd.warranty_status || pd.warrantyexpire || false,
        insurance_expire: pd.expire_date || null,
    });

    // --- กรณี SN = 9999 (ไม่ว่าจะมี job เดิมหรือไม่) ---
    if (propSn === "9999") {
        return (
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Typography fontWeight="bold">
                        เลือกรายการ Job ที่ต้องการบันทึกข้อมูล หรือ สร้าง Job ใหม่
                    </Typography>
                </Grid2>
                <Grid2 size={12}>
                    {jobFromPids.map((job, index) => (
                        <Accordion key={index}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Typography component="span">ชื่อลูกค้า : {job.cust_name}</Typography>
                                    <Typography component="span">เบอร์โทรศัพท์ : {job.cust_phone}</Typography>
                                    {job.status === 'send' && (
                                        <Chip label="ส่งซ่อมแล้ว" color="warning" size="small" />
                                    )}
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography fontWeight="bold">รายละเอียด</Typography>
                                <Typography>S/N : {job.serial_id}</Typography>
                                <Typography>รหัส Job : {job.job_id}</Typography>
                                <Typography>สินค้า : {job.pid} {job.p_name}</Typography>
                                <br />
                                <Button
                                    fullWidth variant="contained" startIcon={<Edit />}
                                    color={job.status === 'send' ? 'warning' : 'primary'}
                                    onClick={() => {
                                        setSelectJobFromPid(job);
                                        fetchData(job.serial_id).finally(() => setSearchingJob(false));
                                    }}
                                >
                                    {job.status === 'send' ? 'ดูรายละเอียด' : 'เลือก'}
                                </Button>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Grid2>
                <Grid2 size={12}>
                    <Stack direction="row" justifyContent="end">
                        <Button variant="contained" startIcon={<Add />} onClick={storeJobFromPid}>
                            สร้าง Job ใหม่
                        </Button>
                    </Stack>
                </Grid2>
            </Grid2>
        );
    }

    // --- กรณียังไม่มี job ---
    if (showDealerForm && !JOB) {
        return (
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Alert severity="info">
                        ยังไม่มีข้อมูลการแจ้งซ่อม กดยืนยันเพื่อสร้าง Job
                    </Alert>
                </Grid2>
                <Grid2 size={12}>
                    <Stack direction="row" justifyContent="end">
                        <Button variant="contained" startIcon={<Add />} onClick={confirmAndStoreJob}>
                            ยืนยันการแจ้งซ่อม
                        </Button>
                    </Stack>
                </Grid2>
            </Grid2>
        );
    }

    return (
        <Grid2 container spacing={2}>
            {searchingJob ? (
                <CircularProgress />
            ) : JOB ? (
                <Grid2 size={12}>
                    {JOB.status !== 'pending' && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            งานนี้ถูกส่งซ่อมไปยังพัมคินแล้ว ไม่สามารถแก้ไขข้อมูลได้
                        </Alert>
                    )}
                    <RpTab1Form
                        JOB={JOB} setJOB={setJOB}
                        form1Saved={form1Saved} setForm1Saved={setForm1Saved}
                        setMainStep={() => {}} setTabValue={() => {}}
                        dealerInfo={storeInfo}
                    />
                </Grid2>
            ) : (
                <Alert sx={{ width: "100%", mb: 2 }} severity="info">
                    {message}
                </Alert>
            )}
        </Grid2>
    );
}
