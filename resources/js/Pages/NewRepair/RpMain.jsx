import {Alert, Box, CircularProgress, Grid2, Tab, Tabs} from "@mui/material";
import {useEffect, useState} from "react";
import RpTab2Form from "@/Pages/NewRepair/Tab2/RpTab2Form.jsx";
import RpTab1Form from "@/Pages/NewRepair/Tab1/RpTab1Form.jsx";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";


function CustomTabPanel(props) {
    const {children, value, index, ...other} = props;
    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{py: 3}}>{children}</Box>}
        </div>
    )
}

export default function RpMain({productDetail, serial_id}) {
    const [message, setMessage] = useState('ไม่สามารถกระทำการใดๆ');
    const [tabValue, setTabValue] = useState(0);
    const [searchingJob, setSearchingJob] = useState(false);
    const [JOB, setJOB] = useState();
    const [form1Saved, setForm1Saved] = useState(false);

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
        fetchData().finally(() => setSearchingJob(false))
    }, []);
    const fetchData = async () => {
        try {
            setSearchingJob(true)
            const {data, status} = await axios.post(route('repair.search.job', {
                serial_id: serial_id, pid: productDetail.pid,
                job_id: productDetail.job_id || null
            }));
            setJOB(data.job.job_detail)
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

    return (
        <Grid2 container spacing={2}>
            {searchingJob ? (<CircularProgress/>) : (
                <>
                    {JOB ? (
                        <Grid2 size={12}>
                            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                <Tabs value={tabValue} onChange={handleChange} aria-label='tabs-for-repair'>
                                    <Tab label='บันทึกข้อมูลแจ้งซ่อม' {...a11yProps(0)}/>
                                    <Tab disabled={!form1Saved} label='บันทึกการซ่อม' {...a11yProps(1)}/>
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
                    ) : (
                        <Alert sx={{width : '100%',mb : 2}} severity='info'>
                            {message}
                        </Alert>
                    )}
                </>
            )}
        </Grid2>
    )
}
