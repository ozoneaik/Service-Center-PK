import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, router, usePage} from "@inertiajs/react";
import {useState} from "react";
import {
    Card, Typography, Box, Tabs, Tab, Chip, Grid2, Paper, Divider, List, ListItem, ListItemText,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, ImageList, ImageListItem
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

// สร้าง TabPanel component
function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

// สร้าง styled component สำหรับ header
const StyledHeader = styled(Box)(({theme}) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
}));

export default function JobFromServiceDetail({jobDetail}) {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // แปลงสถานะเป็นภาษาไทย
    const getStatusThai = (status) => {
        const statusMap = {
            "send": "ส่งงาน",
            "pending": "รอดำเนินการ"
            // เพิ่มสถานะอื่นๆ ตามต้องการ
        };
        return statusMap[status] || status;
    };

    // คำนวณราคารวมของอะไหล่
    const calculateTotalPrice = () => {
        return jobDetail.sp.reduce((total, item) => {
            return total + (parseFloat(item.price_per_unit) * item.qty);
        }, 0);
    };

    // สร้าง color chip ตามสถานะ
    const getStatusColor = (status) => {
        if (status === "send") return "primary";
        if (status === "pending") return "warning";
        return "default";
    };

    const {flash} = usePage().props;

    const handleSubmit = () => {
        AlertDialogQuestion({
            text : 'กดตกลงเพื่อปิดงานซ่อม',
            onPassed : (confirm) => {
                if (confirm){
                    setLoading(true);
                    router.put(route('JobFormService.update',{job_id : jobDetail.job_id}),{},{
                        onFinish : (e) => {
                            console.log(e,flash.success)
                            setLoading(false)
                        },
                    })
                }
            }
        })
    }

    return (
        <AuthenticatedLayout>
            <Head title={"รายละเอียดงานซ่อม"}/>

            <Box sx={{maxWidth: 1200, margin: '0 auto', p: 3}}>
                <Card>
                    <StyledHeader>
                        <Box>
                            <Typography variant="h5" component="h1" sx={{fontWeight: 'bold'}}>
                                {jobDetail.job_id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                สร้างเมื่อ: {new Date(jobDetail.created_at).toLocaleString('th-TH')}
                            </Typography>
                        </Box>
                        <Chip
                            label={getStatusThai(jobDetail.status)}
                            color={getStatusColor(jobDetail.status)}
                            variant="filled"
                        />
                    </StyledHeader>

                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="job detail tabs">
                            <Tab label="ข้อมูลสินค้า" {...a11yProps(0)} />
                            <Tab label="ข้อมูลลูกค้า" {...a11yProps(1)} />
                            <Tab label="อาการเสีย" {...a11yProps(2)} />
                            <Tab label="อะไหล่" {...a11yProps(3)} />
                            <Tab label="รูปภาพ" {...a11yProps(4)} />
                        </Tabs>
                    </Box>

                    {/* Tab 1: ข้อมูลสินค้า */}
                    <TabPanel value={tabValue} index={0}>
                        <Grid2 container spacing={3}>
                            <Grid2 size={{xs : 12, md : 4}}>
                                <Box sx={{p: 2, display: 'flex', justifyContent: 'center'}}>
                                    <img
                                        src={jobDetail.image_sku}
                                        alt={jobDetail.p_name}
                                        style={{maxWidth: '100%', maxHeight: 250, objectFit: 'contain'}}
                                    />
                                </Box>
                            </Grid2>

                            <Grid2 size={{xs : 12, md : 8}}>
                                <Paper elevation={0} variant="outlined" sx={{p: 2}}>
                                    <Typography variant="h6" gutterBottom>
                                        {jobDetail.p_name}
                                    </Typography>

                                    <Box sx={{mt: 2}}>
                                        <Grid2 container spacing={2}>
                                            <Grid2 size={{xs : 12, sm : 6}}>
                                                <Typography variant="body2"
                                                            color="text.secondary">หมายเลขซีเรียล</Typography>
                                                <Typography variant="body1">{jobDetail.serial_id}</Typography>
                                            </Grid2>
                                            <Grid2 size={{xs : 12, sm : 6}}>
                                                <Typography variant="body2" color="text.secondary">รุ่น</Typography>
                                                <Typography variant="body1">{jobDetail.fac_model}</Typography>
                                            </Grid2>
                                            <Grid2 size={{xs : 12, sm : 6}}>
                                                <Typography variant="body2" color="text.secondary">หมวดหมู่</Typography>
                                                <Typography variant="body1">{jobDetail.p_cat_name}</Typography>
                                            </Grid2>
                                            <Grid2 size={{xs : 12, sm : 6}}>
                                                <Typography variant="body2"
                                                            color="text.secondary">หมวดหมู่ย่อย</Typography>
                                                <Typography variant="body1">{jobDetail.p_sub_cat_name}</Typography>
                                            </Grid2>
                                            <Grid2 size={{xs : 12}}>
                                                <Chip
                                                    label={jobDetail.warranty ? "อยู่ในประกัน" : "ไม่อยู่ในประกัน"}
                                                    color={jobDetail.warranty ? "success" : "error"}
                                                    size="small"
                                                />
                                            </Grid2>
                                            <Grid2 size={{xs : 12, sm : 6}}>
                                                <Typography variant="body2"
                                                            color="text.secondary">ศูนย์บริการที่ส่งเข้ามา</Typography>
                                                <Typography variant="body1">{jobDetail.shop_name}</Typography>
                                            </Grid2>
                                            <Grid2 size={{xs : 12, sm : 6}}>
                                                <Typography variant="body2"
                                                            color="text.secondary">ที่อยู่ศูนย์บริการ</Typography>
                                                <Typography variant="body1">{jobDetail.address} {jobDetail.phone}</Typography>
                                            </Grid2>
                                        </Grid2>
                                    </Box>
                                </Paper>

                                {jobDetail.symptoms && (
                                    <Paper elevation={0} variant="outlined" sx={{p: 2, mt: 2}}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            หมายเหตุประกัน
                                        </Typography>
                                        <Typography variant="body2">
                                            {jobDetail.symptoms.symptom}
                                        </Typography>
                                    </Paper>
                                )}
                            </Grid2>
                        </Grid2>
                    </TabPanel>

                    {/* Tab 2: ข้อมูลลูกค้า */}
                    <TabPanel value={tabValue} index={1}>
                        <Paper elevation={0} variant="outlined" sx={{p: 2}}>
                            <Grid2 container spacing={3}>
                                <Grid2 size={{xs : 12, md : 6}}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        ข้อมูลติดต่อ
                                    </Typography>
                                    <List disablePadding>
                                        <ListItem disablePadding sx={{pt: 1, pb: 1}}>
                                            <ListItemText
                                                primary="ชื่อลูกค้า"
                                                secondary={jobDetail.customer_in_job?.name || "-"}
                                            />
                                        </ListItem>
                                        <Divider component="li"/>
                                        <ListItem disablePadding sx={{pt: 1, pb: 1}}>
                                            <ListItemText
                                                primary="เบอร์โทรศัพท์"
                                                secondary={jobDetail.customer_in_job?.phone || "-"}
                                            />
                                        </ListItem>
                                        <Divider component="li"/>
                                        <ListItem disablePadding sx={{pt: 1, pb: 1}}>
                                            <ListItemText
                                                primary="ที่อยู่"
                                                secondary={jobDetail.customer_in_job?.address || "-"}
                                            />
                                        </ListItem>
                                    </List>
                                </Grid2>
                                <Grid2 size={{xs : 12, md : 6}}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        หมายเหตุ
                                    </Typography>
                                    <Paper variant="outlined" sx={{p: 2, backgroundColor: '#f5f5f5'}}>
                                        <Typography variant="body2">
                                            {jobDetail.customer_in_job?.remark || "ไม่มีหมายเหตุ"}
                                        </Typography>
                                    </Paper>

                                    <Box sx={{mt: 3}}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            หมายเหตุเพิ่มเติม
                                        </Typography>
                                        <Paper variant="outlined" sx={{p: 2, backgroundColor: '#f5f5f5'}}>
                                            <Typography variant="body2">
                                                {jobDetail.remark?.remark || "ไม่มีหมายเหตุเพิ่มเติม"}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </Grid2>
                            </Grid2>
                        </Paper>
                    </TabPanel>

                    {/* Tab 3: อาการเสีย */}
                    <TabPanel value={tabValue} index={2}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow sx={{backgroundColor: '#f5f5f5'}}>
                                        <TableCell>อาการเสีย</TableCell>
                                        <TableCell>สาเหตุ</TableCell>
                                        <TableCell>รหัสสาเหตุ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobDetail.behaviors.map((behavior, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{behavior.behavior_name}</TableCell>
                                            <TableCell>{behavior.cause_name}</TableCell>
                                            <TableCell>{behavior.cause_code}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Tab 4: อะไหล่ */}
                    <TabPanel value={tabValue} index={3}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow sx={{backgroundColor: '#f5f5f5'}}>
                                        <TableCell>รูปภาพ</TableCell>
                                        <TableCell>รหัสอะไหล่</TableCell>
                                        <TableCell>ชื่ออะไหล่</TableCell>
                                        <TableCell align="right">ราคาต่อหน่วย</TableCell>
                                        <TableCell align="right">จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell align="right">ราคารวม</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobDetail.sp.map((part) => {
                                        const imagePath = import.meta.env.VITE_IMAGE_SP + `new/${part.sp_code}.jpg`
                                        return (
                                            <TableRow key={part.id}>
                                                <TableCell>
                                                    <img src={imagePath} width={50}
                                                         alt={`ไม่พบรูปอะไหล่ ${part.sp_code}`}/>
                                                </TableCell>
                                                <TableCell>{part.sp_code}</TableCell>
                                                <TableCell>{part.sp_name}</TableCell>
                                                <TableCell
                                                    align="right">{parseFloat(part.price_per_unit).toLocaleString('th-TH')}</TableCell>
                                                <TableCell align="right">{part.qty}</TableCell>
                                                <TableCell>{part.sp_unit}</TableCell>
                                                <TableCell align="right">
                                                    {(parseFloat(part.price_per_unit) * part.qty).toLocaleString('th-TH')}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={6} align="left"
                                                   sx={{fontWeight: 'bold'}}>
                                            ราคารวมทั้งสิ้น&nbsp;
                                        </TableCell>
                                        <TableCell align="right"
                                                   sx={{fontWeight: 'bold'}}>
                                            {calculateTotalPrice().toLocaleString('th-TH')}
                                        </TableCell>
                                        {/*<TableCell></TableCell>*/}
                                    </TableRow>
                                </TableHead>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Tab 5: รูปภาพ */}
                    <TabPanel value={tabValue} index={4}>
                        <Box sx={{maxWidth: 800, margin: '0 auto'}}>
                            <ImageList cols={2} gap={16}>
                                {jobDetail.upload_file.map((file, index) => (
                                    <ImageListItem key={index}>
                                        <img
                                            src={file.full_file_path}
                                            alt={`รูปภาพ ${index + 1}`}
                                            loading="lazy"
                                            style={{borderRadius: '4px'}}
                                        />
                                        <Typography variant="caption" sx={{mt: 1}}>
                                            รูปภาพ {index + 1}
                                        </Typography>
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </Box>
                    </TabPanel>
                </Card>

                <Box sx={{mt: 3, display: 'flex', justifyContent: 'flex-end'}}>
                    {/*<Button variant="outlined" sx={{ mr: 2 }}>กลับ</Button>*/}
                    <Button variant="contained" onClick={()=>handleSubmit()} color="success">ปิดงานซ่อม</Button>
                </Box>
            </Box>
        </AuthenticatedLayout>
    );
}
