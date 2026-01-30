import React, { useEffect, useState } from "react";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Alert, Box, Button, CircularProgress,
    Grid2, IconButton, InputAdornment, Paper, Stack, Tab,
    TableCell, TableContainer, Tabs, TextField, Typography,
    useMediaQuery, useTheme, Table, TableBody, TableHead, TableRow
} from "@mui/material";
import {
    Add, ArrowBack, Edit, ExpandMore, Search
} from "@mui/icons-material";
import axios from "axios";
import RpTab1SaleForm from "./RpTab1SaleForm";
import RpSummaryForm from "./RpSummaryForm";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ display: value === index ? 'block' : 'none' }}
        >
            <Box sx={{ py: 3 }}>{children}</Box>
        </div>
    )
}

export default function RepairSaleMain({ productDetail, serial_id }) {
    // --- States ---
    const [message, setMessage] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [searchingJob, setSearchingJob] = useState(false);

    // [เพิ่ม] State เช็คว่าไม่พบ Job (เพื่อให้แสดงปุ่มสร้างใหม่)
    const [jobNotFound, setJobNotFound] = useState(false);

    // Job Data
    const [JOB, setJOB] = useState();
    const [jobFromPids, setJobFromPids] = useState([]);
    const [selectJobFormPid, setSelectJobFormPid] = useState({ job_id: null });

    // Flow Control
    const [form1Saved, setForm1Saved] = useState(false);
    const [propSn, setPropSn] = useState(serial_id);
    const [MainStep, setMainStep] = useState({ step: 'before', sub_step: 0 });

    // Customer Selection (For Sale)
    const [isSelectingCustomer, setIsSelectingCustomer] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [loadingCust, setLoadingCust] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionMode, setActionMode] = useState('normal');

    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        if (JOB?.status_mj === 'wait' || JOB?.status_mj === 'process' || JOB?.status_mj === 'complete') {
            setForm1Saved(true);
        }
    }, [JOB]);

    useEffect(() => {
        if (MainStep.step === 'before') {
            setTabValue(0);
        } else {
            setTabValue(1);
        }
    }, [MainStep]);

    useEffect(() => {
        if (form1Saved) setTabValue(1);
    }, [form1Saved]);

    useEffect(() => {
        fetchData(propSn).finally(() => setSearchingJob(false));
    }, []);

    const handleRefresh = () => {
        fetchData(propSn);
    };

    const fetchData = async (sn) => {
        try {
            setSearchingJob(true);
            setJobNotFound(false); // Reset
            setMessage('');
            setJOB(null);

            const { data } = await axios.post(route('repair.sale.search.job', {
                serial_id: sn,
                pid: productDetail.pid,
                job_id: productDetail.job_id || null
            }));

            // กรณีค้นหาด้วย 9999 (PID)
            if (data.search_by === 'pid') {
                setJobFromPids(data.jobs);
                return;
            }

            // กรณีเจอ Job และมีข้อมูล
            if (data.found && data.job?.job_detail) {
                setJOB(data.job.job_detail);
                setPropSn(sn);
            }
            // กรณีไม่เจอ Job (API ส่ง found: false กลับมา)
            else {
                setJobNotFound(true);
                setMessage(data.message || 'ไม่พบประวัติการแจ้งซ่อม');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
            setJobNotFound(false);
        } finally {
            setSearchingJob(false);
        }
    };

    const fetchCustomers = async (search = '') => {
        setLoadingCust(true);
        try {
            const { data } = await axios.post(route('repair.sale.get.customers'), { search });
            setCustomerList(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error(error);
            const serverMsg = error.response?.data?.message;
            AlertDialog({ text: serverMsg || 'ไม่สามารถดึงข้อมูลร้านค้าได้' });
        } finally {
            setLoadingCust(false);
        }
    };

    // --- Event Handlers ---

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOnSelectJob = (job) => {
        if (job.job_id === selectJobFormPid?.job_id) {
            setSelectJobFormPid({ job_id: null });
            return;
        }
        setSelectJobFormPid(job);
        fetchData(job.serial_id).finally(() => setSearchingJob(false));
    };

    const storeJobFromPid = () => {
        setActionMode('create_new');
        setIsSelectingCustomer(true);
        fetchCustomers();
    };

    // [เพิ่ม] ฟังก์ชันสำหรับเปิดหน้าเลือกลูกค้า กรณีสร้างงานจาก SN ปกติ
    const handleCreateNewJobForSn = () => {
        setActionMode('normal'); // หรือโหมดอื่นตาม Logic backend
        setIsSelectingCustomer(true);
        fetchCustomers();
    };

    const handleCancelSelection = () => {
        setIsSelectingCustomer(false);
        setCustomerList([]);
        setSearchTerm('');
    };

    const handleSelectCustomer = (customer) => {
        setIsSelectingCustomer(false);
        if (actionMode === 'create_new') {
            confirmStoreJobFromPid(customer);
        } else {
            confirmCreateJob(customer);
        }
    };

    // --- Action Confirmation ---
    const confirmCreateJob = (customerInfo) => {
        AlertDialogQuestion({
            title: 'ยืนยันการแจ้งซ่อม',
            text: `ยืนยันการเปิดงานซ่อมให้: ${customerInfo.cust_name} หรือไม่?`,
            onPassed: async (confirm) => {
                if (confirm) {
                    const product_format = productFormat(productDetail);
                    try {
                        await axios.post(route('repair.sale.store', {
                            serial_id: propSn,
                            productDetail: product_format,
                            customer_code: customerInfo.cust_id || customerInfo.cust_code,
                            customer_name: customerInfo.cust_name,
                            shop_under_sale_id: customerInfo.cust_id || customerInfo.cust_code,
                            shop_under_sale_name: customerInfo.cust_name,
                            shop_under_sale_phone: customerInfo.contact_phone || customerInfo.tel || customerInfo.phone
                        }));
                        fetchData(propSn);
                    } catch (error) {
                        const errorMsg = error.response?.data?.message || error.message;
                        AlertDialog({ text: errorMsg });
                    }
                }
            }
        });
    };

    const confirmStoreJobFromPid = (customerInfo) => {
        AlertDialogQuestion({
            title: 'ยืนยันการบันทึกข้อมูลแจ้งซ่อม',
            text: `ยืนยันการสร้าง JOB ใหม่ให้คุณ: ${customerInfo.cust_name} หรือไม่?`,
            onPassed: async (confirm) => {
                if (!confirm) return;
                try {
                    setSearchingJob(true);
                    const product_format = productFormat(productDetail);
                    const { data } = await axios.post(route('repair.sale.store.from.pid', {
                        productDetail: product_format,
                        customer_code: customerInfo.cust_id || customerInfo.cust_code,
                        customer_name: customerInfo.cust_name,
                        shop_under_sale_id: customerInfo.cust_id || customerInfo.cust_code,
                        shop_under_sale_name: customerInfo.cust_name,
                        shop_under_sale_phone: customerInfo.contact_phone || customerInfo.tel || customerInfo.phone
                    }));

                    fetchData(data.serial_id).finally(() => setSearchingJob(false));
                } catch (error) {
                    setSearchingJob(false);
                    const errorMsg = error.response?.data?.message || error.message;
                    AlertDialog({ text: errorMsg });
                }
            }
        });
    };

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

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    // --- Render ---
    return (
        <Grid2 container spacing={2}>
            {searchingJob ? (<CircularProgress sx={{ mx: 'auto', mt: 4 }} />) : (
                <>
                    {/* Mode: Selecting Customer (Table View) */}
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
                                                    <TableCell sx={{ fontWeight: 'bold' }}>ที่อยู่</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>เบอร์โทรศัพท์</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">#</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {customerList.length > 0 ? customerList.map((cust, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>{cust.cust_id || cust.cust_code}</TableCell>
                                                        <TableCell>{cust.cust_name}</TableCell>
                                                        <TableCell>{cust.amphoe || cust.amphur} {cust.province}</TableCell>
                                                        <TableCell>{cust.contact_phone || cust.tel || cust.phone}</TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                variant="contained" size="small"
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
                            {/* Mode: Display Job Info / Form */}
                            {(JOB && propSn !== '9999') ? (
                                <Grid2 size={12}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <Tabs value={tabValue} onChange={handleChange} aria-label='tabs-for-repair'>
                                            <Tab label='1. บันทึกข้อมูลแจ้งซ่อม' {...a11yProps(0)} />
                                            <Tab label='2. สรุปและส่งงาน' {...a11yProps(1)} />
                                        </Tabs>
                                    </Box>

                                    <CustomTabPanel index={0} value={tabValue}>
                                        <RpTab1SaleForm
                                            setMainStep={setMainStep} setTabValue={setTabValue}
                                            JOB={JOB} setJOB={setJOB}
                                            form1Saved={form1Saved} setForm1Saved={setForm1Saved}
                                            onSaved={handleRefresh}
                                        />
                                    </CustomTabPanel>

                                    <CustomTabPanel index={1} value={tabValue}>
                                        <RpSummaryForm
                                            JOB={JOB}
                                            productDetail={productDetail}
                                            setTabValue={setTabValue}
                                        />
                                    </CustomTabPanel>
                                </Grid2>
                            ) : (propSn === '9999') ? (
                                // Mode: 9999 (PID Search) -> Show List
                                <>
                                    <Grid2 size={12}>
                                        <Typography fontWeight='bold' sx={{ mb: 2 }}>
                                            เลือกรายการจ็อบที่ต้องการบันทึกข้อมูล หรือ สร้าง JOB ใหม่
                                        </Typography>
                                    </Grid2>
                                    <Grid2 size={12}>
                                        {jobFromPids
                                            .filter(job => job.job_id && job.job_id.startsWith('MJ'))
                                            .map((job, index) => (
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
                                                        <Box mt={2}>
                                                            <Button
                                                                fullWidth variant='contained' startIcon={<Edit />}
                                                                onClick={() => handleOnSelectJob(job)}
                                                            >
                                                                เลือกรายการนี้
                                                            </Button>
                                                        </Box>
                                                    </AccordionDetails>
                                                </Accordion>
                                            ))}
                                    </Grid2>
                                    <Grid2 size={12}>
                                        <Stack direction='row' justifyContent='end' mt={2}>
                                            <Button
                                                variant="contained" startIcon={<Add />}
                                                onClick={storeJobFromPid}
                                                color="success"
                                            >
                                                สร้าง JOB ใหม่
                                            </Button>
                                        </Stack>
                                    </Grid2>
                                </>
                            ) : (
                                // [ใหม่] กรณีค้นหาไม่เจอ (SN ปกติ) ให้แสดงปุ่มเปิดงานซ่อมใหม่
                                <Grid2 size={12}>
                                    <Alert sx={{ width: '100%', mb: 2 }} severity='info'>
                                        {message}
                                    </Alert>

                                    {jobNotFound && (
                                        <Stack direction="row" justifyContent="center">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<Add />}
                                                onClick={handleCreateNewJobForSn}
                                            >
                                                เปิดงานซ่อมใหม่ (สำหรับ {serial_id})
                                            </Button>
                                        </Stack>
                                    )}
                                </Grid2>
                            )}
                        </>
                    )}
                </>
            )}
        </Grid2>
    )
}