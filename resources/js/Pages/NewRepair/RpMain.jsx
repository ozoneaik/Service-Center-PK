import {
    Alert, Box, Button, Card, CardActionArea, CardContent, CircularProgress,
    Grid2, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import RpTab2Form from "@/Pages/NewRepair/Tab2/RpTab2Form.jsx";
import RpTab1Form from "@/Pages/NewRepair/Tab1/RpTab1Form.jsx";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import { Add, Edit } from "@mui/icons-material";
import axios from "axios";


function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    )
}

export default function RpMain({ productDetail, serial_id }) {
    const [message, setMessage] = useState('ไม่สามารถกระทำการใดๆ');
    const [tabValue, setTabValue] = useState(0);
    const [searchingJob, setSearchingJob] = useState(false);
    const [JOB, setJOB] = useState();
    const [jobFromPids, setJobFromPids] = useState([]);
    const [selectJobFormPid, setSelectJobFormPid] = useState({ job_id: null });
    const [form1Saved, setForm1Saved] = useState(false);
    const [propSn, setPropSn] = useState(serial_id);
    const isMobile = useMediaQuery('(max-width:600px)');

    const { palette } = useTheme();
    const pumpkinColor = palette.pumpkinColor.main;

    const [MainStep, setMainStep] = useState({
        step: 'before',
        sub_step: 0
    });

    useEffect(() => {
        if (MainStep.step === 'before') {
            setTabValue(0)
        } else {
            setTabValue(1)
        }
    }, [MainStep]);

    useEffect(() => {
        if (form1Saved) {
            setTabValue(1)
        }
    }, [form1Saved]);


    useEffect(() => {
        fetchData(propSn).finally(() => setSearchingJob(false))
    }, []);
    const fetchData = async (sn) => {
        try {
            setSearchingJob(true)
            const { data, status } = await axios.post(route('repair.search.job', {
                serial_id: sn, pid: productDetail.pid,
                job_id: productDetail.job_id || null
            }));
            console.log('search job data', data, propSn);
            if (data.search_by === 'pid') {
                setJobFromPids(data.jobs);
                return;
            }
            setJOB(data.job.job_detail)
            setPropSn(sn)
        } catch (error) {
            if (error.status === 404 && error.response.data?.found === false) {
                AlertDialogQuestion({
                    title: 'ยืนยันการแจ้งซ่อม',
                    text: 'กด ตกลง เพื่อ ยืนยันการแจ้งซ่อม',
                    onPassed: async (confirm) => {
                        if (confirm) {
                            console.log(productDetail)
                            const product_format = {
                                pid: productDetail.pid,
                                pname: productDetail.pname,
                                pbaseunit: productDetail.pbaseunit,
                                pcatid: productDetail.pcatid,
                                pCatName: productDetail.pCatName,
                                pSubCatName: productDetail.pSubCatName,
                                facmodel: productDetail.facmodel,
                                imagesku: productDetail.imagesku,
                                warrantyperiod: productDetail.warrantyperiod,
                                warrantycondition: productDetail.warrantycondition,
                                warrantynote: productDetail.warrantynote,
                                warranty: productDetail.warranty || productDetail.warranty_status || productDetail.warrantyexpire || false
                            }
                            try {
                                await axios.post(route('repair.store', {
                                    serial_id, productDetail: product_format
                                })
                                );
                                fetchData().finally(() => setSearchingJob(false));
                            } catch (error) {
                                AlertDialog({
                                    text: error.response.data?.message || error.message
                                })
                                console.log(error)
                            }
                        } else console.log('มีการยกเลิกสร้าง job');
                    }
                })
            }
            setMessage(error.response.data?.message)
        }
    }

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    }

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const handleOnSelectJob = (job) => {
        if (job.job_id === selectJobFormPid?.job_id) {
            setSelectJobFormPid({ job_id: null });
            return;
        }
        // setPropSn(job.serial_id);
        setSelectJobFormPid(job)
    }

    const handleSelectedJobFromPid = (sn) => {
        fetchData(sn).finally(() => setSearchingJob(false));
    }

    const storeJobFromPid = () => {
        AlertDialogQuestion({
            title: 'ยืนยันการบันทึกข้อมูลแจ้งซ่อม',
            text: 'กด ตกลง เพื่อ ยืนยันการบันทึกข้อมูลแจ้งซ่อม',
            onPassed: async (confirm) => {
                if (!confirm) return;
                try {
                    setSearchingJob(true);
                    const product_format = {
                        pid: productDetail.pid,
                        pname: productDetail.pname,
                        pbaseunit: productDetail.pbaseunit,
                        pcatid: productDetail.pcatid,
                        pCatName: productDetail.pCatName,
                        pSubCatName: productDetail.pSubCatName,
                        facmodel: productDetail.facmodel,
                        imagesku: productDetail.imagesku,
                        warrantyperiod: productDetail.warrantyperiod,
                        warrantycondition: productDetail.warrantycondition,
                        warrantynote: productDetail.warrantynote,
                        warranty: productDetail.warranty || productDetail.warranty_status || productDetail.warrantyexpire || false
                    }
                    const { data, status } = await axios.post(route('repair.store.from.pid',{
                        productDetail: product_format
                    }));
                    fetchData(data.serial_id).finally(() => setSearchingJob(false));
                } catch (error) {
                    const errorMsg = error.response?.data?.message || error.message;
                    AlertDialog({ text: errorMsg })
                }finally{
                    setSearchingJob(false);
                }
            }
        })
    }


    return (
        <Grid2 container spacing={2}>
            {searchingJob ? (<CircularProgress />) : (
                <>
                    {(JOB && propSn !== '9999') ? (
                        <Grid2 size={12}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={tabValue} onChange={handleChange} aria-label='tabs-for-repair'>
                                    <Tab label='บันทึกข้อมูลแจ้งซ่อม' {...a11yProps(0)} />
                                    <Tab disabled={!form1Saved} label='บันทึกการซ่อม' {...a11yProps(1)} />
                                </Tabs>
                            </Box>


                            <CustomTabPanel index={0} value={tabValue}>
                                <RpTab1Form
                                    setMainStep={setMainStep}
                                    JOB={JOB} setJOB={setJOB} form1Saved={form1Saved} setForm1Saved={setForm1Saved}
                                />
                            </CustomTabPanel>

                            <CustomTabPanel index={1} value={tabValue}>
                                <RpTab2Form
                                    MainStep={MainStep}
                                    setMainStep={setMainStep}
                                    JOB={JOB} setJOB={setJOB}
                                    productDetail={productDetail} serial_id={serial_id}
                                />
                            </CustomTabPanel>
                        </Grid2>
                    ) : (propSn === '9999') ? (
                        <>
                            <Grid2 size={12}>
                                <Typography fontWeight='bold'>
                                    เลือกรายการจ็อบที่ต้องการบันทึกข้อมูล หรือ สร้าง job ใหม่
                                </Typography>
                            </Grid2>
                            <Grid2 size={12}>
                                <Grid2 container spacing={2}>
                                    {jobFromPids.map((job, index) => (
                                        <Grid2 size={{ sm: 12, md: 6, lg: 3 }} key={index}>
                                            <Card variant='outlined'>
                                                <CardActionArea
                                                    onClick={() => handleOnSelectJob(job)}
                                                    data-active={selectJobFormPid.job_id === job.job_id ? '' : undefined}
                                                    sx={{
                                                        height: '100%',
                                                        '&[data-active]': {
                                                            backgroundColor: pumpkinColor,
                                                        },
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Typography>S/N : {job.serial_id}</Typography>
                                                        <Typography>สินค้า : {job.pid} {job.p_name}</Typography>
                                                        <Typography>ลูกค้า : {job.cust_name} {job.cust_phone}</Typography>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid2>
                                    ))}
                                    <Grid2 size={12} mb={3}>
                                        <Stack justifyContent='end' direction={isMobile ? 'column' : 'row'} spacing={2}>
                                            <Button
                                                variant='contained' startIcon={<Edit />}
                                                disabled={!selectJobFormPid.job_id}
                                                onClick={() => handleSelectedJobFromPid(selectJobFormPid.serial_id)}
                                            >
                                                {selectJobFormPid.job_id ? 'บันทึกข้อมูลแจ้งซ่อม job ที่เลือก' : 'กรุณาเลือก job ที่ต้องการกรอกข้อมูล'}

                                            </Button>
                                            <Button
                                                startIcon={<Add />} onClick={storeJobFromPid}
                                                variant='contained' color='secondary'
                                            >
                                                สร้าง JOB ใหม่
                                            </Button>
                                        </Stack>

                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        </>

                    ) : (
                        <Alert sx={{ width: '100%', mb: 2 }} severity='info'>
                            {message}
                        </Alert>
                    )}
                </>
            )}
        </Grid2>
    )
}
