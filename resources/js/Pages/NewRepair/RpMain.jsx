import {Box, CircularProgress, Grid2, Tab, Tabs} from "@mui/material";
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
    const [tabValue, setTabValue] = useState(0);
    const [searchingJob, setSearchingJob] = useState(false);
    const [JOB, setJOB] = useState();
    const [form1Saved, setForm1Saved] = useState(false);

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
                serial_id: serial_id, pid: productDetail.pid
            }));
            console.log('ผลลัพทธ์การค้นหา job >> ', data.job.job_detail)
            setJOB(data.job.job_detail)
        } catch (error) {
            if (error.status === 404 && error.response.data?.found === false) {
                AlertDialogQuestion({
                    title: 'ยืนยันการแจ้งซ่อม',
                    text: 'กด ตกลง เพื่อ ยืนยันการแจ้งซ่อม',
                    onPassed: async (confirm) => {
                        if (confirm) {
                            const product_format = {
                                pid: productDetail.pid,
                                pname: productDetail.pname,
                                pbaseunit: productDetail.pbaseunit,
                                pcatid: productDetail.pcatid,
                                pCatName: productDetail.pCatName,
                                pSubCatName: productDetail.pSubCatName,
                                facmodel: productDetail.facmodel,
                                imagesku: productDetail.imagesku,
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
                            }
                        } else console.log('มีการยกเลิกสร้าง job');
                    }
                })
            }
            console.log(error)
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
                                    JOB={JOB} setJOB={setJOB} form1Saved={form1Saved} setForm1Saved={setForm1Saved}
                                />
                            </CustomTabPanel>

                            <CustomTabPanel index={1} value={tabValue}>
                                <RpTab2Form
                                    JOB={JOB} setJOB={setJOB}
                                    productDetail={productDetail} serial_id={serial_id}
                                />
                            </CustomTabPanel>
                        </Grid2>
                    ) : (<>ไม่สามารถกระทำการใดๆได้</>)}
                </>
            )}
        </Grid2>
    )
}
