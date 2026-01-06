import {
    Accordion, AccordionDetails, AccordionSummary,
    Alert, Box, Button, CircularProgress,
    Grid2, IconButton, InputAdornment, Paper, Stack, Tab, TableCell, TableContainer, Tabs, TextField, Typography, useMediaQuery, useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import RpTab2Form from "@/Pages/NewRepair/Tab2/RpTab2Form.jsx";
import RpTab1Form from "@/Pages/NewRepair/Tab1/RpTab1Form.jsx";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import { Add, ArrowBack, Edit, ExpandMore, Search } from "@mui/icons-material"; // เพิ่ม ArrowBack
import axios from "axios";
import { Table, TableBody, TableHead, TableRow } from "@mui/material"; // ใช้ Table ของ MUI เพื่อความเข้ากันได้

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

export default function RepairSaleMain({ productDetail, serial_id }) {
    console.log(productDetail);

    const [message, setMessage] = useState('ไม่สามารถกระทำการใดๆ');
    const [tabValue, setTabValue] = useState(0);
    const [searchingJob, setSearchingJob] = useState(false);
    const [JOB, setJOB] = useState();
    const [jobFromPids, setJobFromPids] = useState([]);
    const [selectJobFormPid, setSelectJobFormPid] = useState({ job_id: null });
    const [form1Saved, setForm1Saved] = useState(false);
    const [propSn, setPropSn] = useState(serial_id);
    const [isSelectingCustomer, setIsSelectingCustomer] = useState(false);
    
    const [customerList, setCustomerList] = useState([]);
    const [loadingCust, setLoadingCust] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionMode, setActionMode] = useState('normal');

    const isMobile = useMediaQuery('(max-width:600px)');

    const { palette } = useTheme();

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
        if (form1Saved) setTabValue(1)
    }, [form1Saved]);

    useEffect(() => {
        fetchData(propSn).finally(() => setSearchingJob(false))
    }, []);
    const fetchData = async (sn) => {
        try {
            setSearchingJob(true)
            const { data, status } = await axios.post(route('repair.sale.search.job', {
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
                // ถ้าไม่เจอ Job ให้เด้งไปหน้าเลือกลูกค้าเลย (ถ้าต้องการ)
                // fetchCustomers(); 
                // setActionMode('normal'); // หรือโหมดที่เหมาะสม
                // setIsSelectingCustomer(true);
            }
            setMessage(error.response.data?.message)
        }
    }

    const fetchCustomers = async (search = '') => {
        setLoadingCust(true);
        try {
            const { data } = await axios.post(route('repair.sale.get.customers'), { search });
            // [Note] อย่าลืมตรวจสอบ Key 'data' จาก Backend (ว่าเป็น data.data หรือ data เฉยๆ)
            setCustomerList(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error(error);
            const serverMsg = error.response?.data?.message;
            AlertDialog({ text: serverMsg || 'ไม่สามารถดึงข้อมูลร้านค้าได้ กรุณาตรวจสอบ Console' });
        } finally {
            setLoadingCust(false);
        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsSelectingCustomer(false); 

        if (actionMode === 'create_new') {
            confirmStoreJobFromPid(customer);
        } else {
            confirmCreateJob(customer);
        }
    };

    const confirmCreateJob = (customerInfo) => {
        if (!customerInfo) return;

        AlertDialogQuestion({
            title: 'ยืนยันการแจ้งซ่อม',
            text: `ยืนยันการเปิดงานซ่อมให้: ${customerInfo.cust_name} หรือไม่?`,
            onPassed: async (confirm) => {
                if (confirm) {
                    const product_format = productFormat(productDetail);
                    try {
                        // [Note] ตรวจสอบ Key cust_id vs cust_code ให้ตรงกับ API ล่าสุด
                        await axios.post(route('repair.sale.store', {
                            serial_id: propSn,
                            productDetail: product_format,
                            customer_code: customerInfo.cust_id || customerInfo.cust_code, 
                            customer_name: customerInfo.cust_name
                        }));
                        fetchData(propSn).finally(() => setSearchingJob(false));
                    } catch (error) {
                        const errorMsg = error.response?.data?.message || error.message;
                        AlertDialog({ text: errorMsg });
                    }
                }
            }
        });
    }

    const confirmStoreJobFromPid = (customerInfo) => {
        AlertDialogQuestion({
            title: 'ยืนยันการบันทึกข้อมูลแจ้งซ่อม',
            text: `ยืนยันการสร้าง JOB ใหม่ให้คุณ: ${customerInfo.cust_name} หรือไม่?`,
            onPassed: async (confirm) => {
                if (!confirm) return;
                try {
                    setSearchingJob(true);
                    const product_format = productFormat(productDetail);

                    // [Note] ตรวจสอบ Key cust_id vs cust_code ให้ตรงกับ API ล่าสุด
                    const { data, status } = await axios.post(route('repair.sale.store.from.pid', {
                        productDetail: product_format,
                        customer_code: customerInfo.cust_id || customerInfo.cust_code,
                        customer_name: customerInfo.cust_name
                    }));

                    fetchData(data.serial_id).finally(() => setSearchingJob(false));
                } catch (error) {
                    const errorMsg = error.response?.data?.message || error.message;
                    AlertDialog({ text: errorMsg })
                } finally {
                    setSearchingJob(false);
                }
            }
        })
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
        fetchData(job.serial_id).finally(() => setSearchingJob(false));
    }

    const storeJobFromPid = () => {
        setActionMode('create_new');
        // [แก้ไข 3] เปิดหน้าเลือก Table แทน Modal
        setIsSelectingCustomer(true); 
        fetchCustomers(); 
    }
    
    // ฟังก์ชันสำหรับปุ่ม "ย้อนกลับ" จากหน้าตาราง
    const handleCancelSelection = () => {
        setIsSelectingCustomer(false);
        setCustomerList([]);
        setSearchTerm('');
    }

    const productFormat = (productDetail) => {
        return {
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
            warranty: productDetail.warranty || productDetail.warranty_status || productDetail.warrantyexpire || false,
            insurance_expire: productDetail.expire_date || null
        }
    }

    return (
        <Grid2 container spacing={2}>
            {searchingJob ? (<CircularProgress sx={{ mx: 'auto', mt: 4 }} />) : (
                <>
                    {isSelectingCustomer ? (
                        <Grid2 size={12}>
                            <Paper sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <IconButton onClick={handleCancelSelection}>
                                        <ArrowBack />
                                    </IconButton>
                                    <Typography variant="h6" fontWeight="bold">
                                        เลือกร้านค้าภายใต้การดูแล
                                    </Typography>
                                </Stack>

                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="ค้นหา รหัสลูกค้า หรือ ชื่อลูกค้า"
                                        variant="outlined"
                                        size="small"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') fetchCustomers(searchTerm) }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => fetchCustomers(searchTerm)}>
                                                        <Search />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>

                                {loadingCust ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                        <Table stickyHeader size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#eee' }}>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>รหัสลูกค้า</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อลูกค้า</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>ที่อยู่ (อำเภอ/จังหวัด)</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>เบอร์โทรศัพท์</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">#</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {customerList.length > 0 ? customerList.map((cust, index) => (
                                                    <TableRow key={index} hover>
                                                        {/* ตรวจสอบ Key ตาม API จริง (cust_id / cust_code) */}
                                                        <TableCell>{cust.cust_id || cust.cust_code}</TableCell>
                                                        <TableCell>{cust.cust_name}</TableCell>
                                                        <TableCell>
                                                            {cust.amphoe || cust.amphur} {cust.province}
                                                        </TableCell>
                                                        <TableCell>{cust.contact_phone || cust.tel || cust.phone}</TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => handleSelectCustomer(cust)}
                                                            >
                                                                เลือก
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                            ไม่พบข้อมูลร้านค้า
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Paper>
                        </Grid2>
                    ) : (
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
                                            setMainStep={setMainStep} setTabValue={setTabValue}
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
                                        {jobFromPids.map((job, index) => {
                                            return (
                                                <Accordion key={index}>
                                                    <AccordionSummary
                                                        expandIcon={<ExpandMore />}
                                                        aria-controls={`panel${index}-content`}
                                                        id={`panel${index}-header`}
                                                    >
                                                        <Typography component="span" sx={{ mr: 2 }}>
                                                            ชื่อลูกค้า : {job.cust_name}
                                                        </Typography>
                                                        <Typography component="span">
                                                            เบอร์โทรศัพท์ : {job.cust_phone}
                                                        </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Typography fontWeight='bold'>รายละเอียด</Typography>
                                                        <Typography>S/N : {job.serial_id}</Typography>
                                                        <Typography>รหัส Job : {job.job_id}</Typography>
                                                        <Typography>สินค้า : {job.pid} {job.p_name}</Typography>
                                                        <br />
                                                        <Button
                                                            fullWidth variant='contained' startIcon={<Edit />}
                                                            onClick={() => handleOnSelectJob(job)}
                                                        >
                                                            เลือก
                                                        </Button>
                                                    </AccordionDetails>
                                                </Accordion>
                                            )
                                        })}
                                    </Grid2>
                                    <Grid2 size={12}>
                                        <Stack direction='row' justifyContent='end'>
                                            <Button
                                                variant="contained" startIcon={<Add />}
                                                onClick={storeJobFromPid}
                                            >
                                                สร้าง JOB ใหม่
                                            </Button>
                                        </Stack>
                                    </Grid2>
                                </>

                            ) : (
                                <Alert sx={{ width: '100%', mb: 2 }} severity='info'>
                                    {message}
                                </Alert>
                            )}
                        </>
                    )}
                </>
            )}
        </Grid2>
    )
}