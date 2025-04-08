import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
    AlertDialog,
    AlertDialogQuestion,
    AlertWithFormDialogTextArea
} from "@/Components/AlertDialog.js";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {useState} from "react";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {Paper, TableContainer} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";


const BehaviorDetail = ({detail}) => (
    <Stack flexWrap='wrap' direction='row'>
        {detail.map((item, index) => (
            <Typography variant='body1' color='gray' key={index}>{item.causename}&nbsp;/&nbsp;</Typography>
        ))}
    </Stack>
)
const FileDetail = ({menu, forService = false}) => {
    const displayStartIndex = forService ? 3 : 0;
    const displayEndIndex = forService ? menu.length : 3;
    return (
        <Grid2 container mt={2} spacing={2} sx={{overflowX: 'auto'}}>
            {menu
                .filter((_, index) => index >= displayStartIndex && index < displayEndIndex)
                .map((item, index) => (
                    <Grid2 key={index} size={12}>
                        <Typography>{item.menu_name}</Typography>
                        <Stack direction='row' spacing={2}>
                            {item.list.length > 0 ?
                                item.list.map((image, i) => (
                                    <ImagePreview
                                        key={i} width={100}
                                        src={image.full_file_path}
                                    />
                                )) : <>-</>
                            }
                        </Stack>
                    </Grid2>
                ))}
        </Grid2>
    );
};
const SpDetail = ({sp, sp_warranty, detail}) => {
    const highlight = {backgroundColor: '#e6ffe6'}
    const listHeader = ['รูปภาพ', 'รหัสอะไหล่', 'ชื่ออะไหล่', 'ราคาต่อหน่วย', 'จำนวน', 'หน่วย', 'ราคารวม'];
    return (
        <TableContainer component={Paper} sx={{maxWidth: '100%'}}>
            <Table>
                <TableHead>
                    <TableRow>
                        {listHeader.map((item, index) => (
                            <TableCell key={index}>{item}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sp.map((item, index) => {
                        const spPath2 = `https://images.pumpkin.tools/SKUS/SP/${detail.pid}/${item.spcode}.jpg`;
                        return (
                            <TableRow key={index} sx={item.warranty ? highlight : {}}>
                                <TableCell>
                                    <img src={spPath2} width={50} alt="image not found"
                                         onError={(e) => {
                                             e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg'
                                         }}/>
                                </TableCell>
                                <TableCell>{item.spcode}</TableCell>
                                <TableCell>{item.spname}</TableCell>
                                <TableCell>{item.price_multiple_gp}</TableCell>
                                <TableCell>{item.qty}</TableCell>
                                <TableCell>{item.sp_unit ?? 'อัน'}</TableCell>
                                <TableCell>{item.price_multiple_gp * item.qty}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const CardDetail = ({children}) => (
    <Paper variant='outlined' sx={{p: 2, overflowX: 'auto', width: '100%'}}>
        {children}
    </Paper>

)
const CardDetailForTable = ({children}) => (
    <Card variant="outlined" sx={{width: '100%'}}>
        <CardContent sx={{overflowX: 'auto'}}> {/* เพิ่ม scroll แนวนอน */}
            {children}
        </CardContent>
    </Card>
)

export const SummaryForm = ({detail, setDetail, setShowDetail}) => {
    const selected = detail.selected;
    const [loading, setLoading] = useState(false);

    async function endJob() {
        AlertDialog({
            icon: 'question',
            title: 'ยืนยันการปิดงานซ่อม',
            text: 'กด ตกลง เพื่อ ยืนยันการปิดงานซ่อม',
            onPassed: async (confirm) => {
                if (confirm) {
                    let message = '';
                    let Status = 400;
                    try {
                        const {data, status} = await axios.post('jobs/update', {
                            job_id: detail.job.job_id
                        });
                        Status = status;
                        message = data.message;
                        setDetail(prevDetail => ({
                            ...prevDetail,
                            job: {
                                ...prevDetail.job,
                                status: 'success'
                            }
                        }));
                    } catch (error) {
                        Status = error.response.status;
                        message = error.response.data.message;
                        if (message === 'ตรวจพบอะไหล่ที่ยังไม่ถูก approve กรุณาตรวจสอบในปุ่มแจ้งเตือน') {
                            setShowDetail(7)
                        }
                        if (message.includes('เนื่องจาก job นี้มีการส่งเคลมอะไหล่ กรุณาตรวจสอบข้อมูลสำหรับการเคลมอะไหล่ให้ครบถ้วน')) {
                            setShowDetail(2);
                        }
                    } finally {
                        AlertDialog({
                            icon: Status === 200 ? 'success' : 'error',
                            text: message,
                            onPassed: () => {
                            }
                        })
                    }
                } else console.log('ไม่ได้กด confirm')
            }
        });
    }


    const exportQu = async () => {
        console.log(detail)
        setLoading(true)
        let newDataFormat = [];
        detail.selected.sp.forEach((item) => {
            newDataFormat.push({
                pid: item.spcode,
                name: item.spname,
                qty: item.qty,
                unit: item.sp_unit ?? 'อัน',
                price: item.price_multiple_gp,
                prod_discount: 0
            });
        });
        console.log(detail.selected)
        let dataJson = {
            "req": "path",
            "regenqu": "Y",
            "typeservice": "SC",
            "docqu": `QU-${detail.job.job_id.replace('JOB-', '')}`,
            "custaddr": detail.selected.customerInJob.address,
            'custnamesc': detail.selected.customerInJob.name,
            "sku": newDataFormat,
            "assno": "",
            "fgcode": detail.job.skusp,
            "fgname": detail.job.skuspname,
            "custcode": detail.job.user_id,
            "custname": "custname",
            "docdate": "",
            "custtel": detail.selected.customerInJob.phone,
            "empcode": "empcode",
            "empname": "empname",
            "remark": detail.selected.remark,
            "cause_remark": "",
            "docmt": "",
            "serial": detail.selected.serial_id,
            "emprepair": ""
        };
        try {
            const {data, status} = await axios.post('/genQuPdf', {
                ...dataJson
            })
            window.open(data.pathUrl, '_blank');
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message,
            });
        } finally {
            setLoading(false);
        }
    }


    const cancelJob = () => {
        AlertDialogQuestion({
            text: 'กด ตกลง เพื่อยกเลิกการซ่อม',
            onPassed: async (confirm) => {
                confirm && await handleCancelJob()
            }
        })
    }
    const handleCancelJob = async () => {
        try {
            const {data, status} = await axios.put(`/jobs/cancel/${detail.job.job_id}`);
            console.log(data, status);
            AlertDialog({
                icon: 'success',
                title: 'สำเร็จ',
                text: data.message,
                onPassed: () => {
                    setDetail(prevDetail => ({
                        ...prevDetail,
                        job: {
                            ...prevDetail.job,
                            status: 'canceled'
                        }
                    }));
                }
            });
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message
            });
        }
    }

    const checkReceiveSku = () => {
        if (detail.selected.symptom !== null) {
            window.open(route('genReCieveSpPdf', { job_id: detail.job.job_id }), '_blank');
            return;
        }
        AlertWithFormDialogTextArea({
            icon : 'question',
            text : 'กรุณากรอกอาการเบื้องต้น',
            res : async (confirm, value) => {
                if (confirm && value){
                    try {
                        const {data, status} = await axios.post('/symptom/store', {
                            job_id: detail.job.job_id,
                            serial_id: detail.serial,
                            symptom: value,
                        });
                        setDetail(prevDetail => ({
                            ...prevDetail,
                            selected: {
                                ...prevDetail.selected,
                                symptom : value,
                            }
                        }));
                        window.open(route('genReCieveSpPdf', { job_id: detail.job.job_id }), '_blank');
                    }catch (error){
                        AlertDialog({
                            text : error.response.data?.message
                        })
                    }
                }
            }
        })
    }

    return (
        <Grid2 container>
            <Grid2 size={12}>
                <Stack direction='column' spacing={2}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <CardDetail>
                                <Stack direction='row' spacing={2} alignItems='center'>
                                    <Avatar sizes='lg' sx={{backgroundColor: '#eb5b1f', width: 50, height: 50}}/>
                                    <Stack direction='column'>
                                        <Typography>ชื่อ : {selected.customerInJob.name}</Typography>
                                        <Typography>เบอร์โทร : {selected.customerInJob.phone}</Typography>
                                    </Stack>
                                </Stack>
                            </CardDetail>
                        </Grid2>
                        <Grid2 size={12}>
                            <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                <CardDetail>
                                    <Typography variant='h6'
                                                fontWeight='bold'>รูปภาพ/วิดีโอสำหรับเคลมสินค้า</Typography>
                                    <FileDetail menu={selected.fileUpload}/>
                                </CardDetail>
                                <CardDetail>
                                    <Typography variant='h6'
                                                fontWeight='bold'>รูปภาพ/วิดีโอสำหรับร้านค้าใช้ภายใน</Typography>
                                    <FileDetail menu={selected.fileUpload} forService={true}/>
                                </CardDetail>
                            </Stack>
                        </Grid2>
                        <Grid2 size={12}>
                            <CardDetail>
                                <Typography variant='h6' fontWeight='bold'>อาการ / สาเหตุ</Typography>
                                <BehaviorDetail detail={selected.behavior}/>
                            </CardDetail>
                        </Grid2>

                        {/* <Grid2 size={12}>
                                <Paper variant='outlined' sx={{ p: 2, overflowX: 'auto' }}>
                                    <Typography variant='h6' fontWeight='bold'>บันทึกอะไหล่</Typography>
                                    <Grid2 container>
                                        <Grid2 size={12} sx={{ overflowX: 'auto' }}>
                                            <SpDetail sp={selected.sp} detail={detail} sp_warranty={selected.sp_warranty} />
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            </Grid2> */}

                        <Grid2 size={12}>
                            <Paper variant='outlined' sx={{p: 2}}>
                                <Typography variant='h6' fontWeight='bold'>บันทึกอะไหล่</Typography>
                                <Grid2 container>
                                    <Grid2 size={12}>
                                        <SpDetail sp={selected.sp} detail={detail} sp_warranty={selected.sp_warranty}/>
                                    </Grid2>
                                </Grid2>
                            </Paper>
                        </Grid2>


                        <Grid2 size={12}>
                            <CardDetail>
                                <Typography variant='h6' fontWeight='bold'>หมายเหตุสำหรับลูกค้า</Typography>
                                <FormControlLabel
                                    control={<Checkbox disabled defaultChecked={selected.customerInJob.subremark1}/>}
                                    label="เสนอราคาก่อนซ่อม"
                                />
                                <br/>
                                <FormControlLabel
                                    control={<Checkbox disabled defaultChecked={selected.customerInJob.subremark2}/>}
                                    label="ซ่อมเสร็จส่งกลับทางไปรษณีย์"
                                />
                                <Typography variant='body1' color='gray'>- {selected.customerInJob.remark}</Typography>
                            </CardDetail>
                        </Grid2>
                        <Grid2 size={12}>
                            <CardDetail>
                                <Typography variant='h6' fontWeight='bold'>หมายเหตุสำหรับสื่อสารภายใน</Typography>
                                <Typography variant='body1' color='gray'>- {selected.remark}</Typography>
                            </CardDetail>
                        </Grid2>
                        <Grid2 size={12}>
                            <CardDetail>
                                <Typography variant='h6' fontWeight='bold'>เอกสาร</Typography>
                                <Stack direction='row' spacing={2}>
                                    <Button onClick={()=>checkReceiveSku()} variant='contained' startIcon={<ReceiptLongIcon/>}>
                                        รับสินค้า
                                    </Button>
                                    {/*<a href={route('genReCieveSpPdf', {job_id: detail.job.job_id})} target='_blank'>*/}
                                    {/*    <Button variant='contained' startIcon={<ReceiptLongIcon/>}>*/}
                                    {/*        รับสินค้า*/}
                                    {/*    </Button>*/}
                                    {/*</a>*/}
                                    {detail.selected.sp.length > 0 && (
                                        <Button onClick={exportQu} startIcon={<PictureAsPdfIcon/>}
                                                variant='contained' disabled={loading}>
                                            {loading ? <CircularProgress size={18}/> : 'ออกใบเสนอราคา'}
                                        </Button>
                                    )}
                                </Stack>
                            </CardDetail>
                        </Grid2>
                    </Grid2>
                    <Stack direction='row' spacing={2} justifyContent='end'>
                        <Button
                            disabled={detail.job.status !== 'pending'}
                            variant='contained' color='error'
                            onClick={() => cancelJob()}
                        >
                            ยกเลิกงานซ่อม
                        </Button>
                        <Button
                            variant='contained' color='success'
                            disabled={detail.job.status !== 'pending'}
                            onClick={() => endJob()}
                        >
                            ปิดงานซ่อม
                        </Button>
                    </Stack>
                </Stack>
            </Grid2>
        </Grid2>
    )
}
