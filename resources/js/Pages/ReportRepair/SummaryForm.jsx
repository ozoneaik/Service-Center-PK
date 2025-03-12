import {
    Avatar,
    Button,
    Card,
    CardContent,
    Grid2,
    Stack,
    Table, TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material"
import FormGroup from '@mui/material/FormGroup';
import {AlertDialog} from "@/Components/AlertDialog.js";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {useProductTarget} from "@/Context/ProductContext.jsx";


const BehaviorDetail = ({detail}) => (
    <Stack flexWrap='wrap' direction='row'>
        {detail.map((item, index) => (
            <Typography variant='body1' color='gray' key={index}>{item.causename}&nbsp;/&nbsp;</Typography>
        ))}
    </Stack>
)

const FileDetail = ({ menu, forService = false }) => {
    const displayStartIndex = forService ? 3 : 0;
    const displayEndIndex = forService ? menu.length : 3;
    return (
        <Grid2 container mt={2} spacing={2} sx={{overflowX : 'scroll'}}>
            {menu
                .filter((_, index) => index >= displayStartIndex && index < displayEndIndex)
                .map((item, index) => (
                    <Grid2 key={index} size={12}>
                        <Typography>{item.menu_name}</Typography>
                        <Stack direction='row' spacing={2}>
                            {item.list.length > 0 ?
                                item.list.map((image, i) => (
                                    <ImagePreview
                                        key={i}
                                        src={image.full_file_path}
                                        width={100}
                                    />
                                )) :
                                <>-</>
                            }
                        </Stack>
                    </Grid2>
                ))}
        </Grid2>
    );
};



const SpDetail = ({sp, sp_warranty}) => {
    const highlight = {backgroundColor: '#e6ffe6'}
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>รูปภาพ</TableCell>
                    <TableCell>รหัสอะไหล่</TableCell>
                    <TableCell>ชื่ออะไหล่</TableCell>
                    <TableCell>ราคาต่อหน่วย</TableCell>
                    <TableCell>จำนวน</TableCell>
                    <TableCell>หน่วย</TableCell>
                    <TableCell>ราคารวม</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {sp.map((item, index) => (
                    <TableRow key={index} sx={item.warranty ? highlight : {}}>
                        <TableCell>image</TableCell>
                        <TableCell>{item.spcode}</TableCell>
                        <TableCell>{item.spname}</TableCell>
                        <TableCell>{item.price_multiple_gp}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{item.sp_unit ?? 'อัน'}</TableCell>
                        <TableCell>{item.price_multiple_gp * item.qty}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


const CardDetail = ({children}) => (
    <Card variant="outlined" sx={{width : '100%'}}>
        <CardContent>
            {children}
        </CardContent>
    </Card>
)


export const SummaryForm = ({detail, setDetail,setShowDetail}) => {
    const selected = detail.selected;
    const {productTarget} = useProductTarget()
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
                        if (message === 'ตรวจพบอะไหล่ที่ยังไม่ถูก approve กรุณาตรวจสอบในปุ่มแจ้งเตือน'){
                            setShowDetail(7)
                        }
                        if (message === 'จำเป็นต้องอัปโหลดภาพอะไหล่ที่เสียส่งเคลม กรุณาตรวจสอบในปุ่มแจ้งเตือน'){
                            setShowDetail(2)
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
            "custaddr" : detail.selected.customerInJob.address,
            'custnamesc' : detail.selected.customerInJob.name,
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
            const {data, status} = await axios.post('/genQuPdf',{
                ...dataJson
            })
            window.open(data.pathUrl,'_blank');
        }catch (error){
            AlertDialog({
                title : 'เกิดข้อผิดพลาด',
                text : error.response.data.message,
                onPassed : () => {}
            })
        }


    }

    return (
        <Grid2 container>
            <Grid2 size={12}>
                <FormGroup>
                    <Stack direction='column' spacing={2}>
                        <CardDetail>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <Avatar sizes='lg' sx={{backgroundColor: '#eb5b1f', width: 50, height: 50}}/>
                                <Stack direction='column'>
                                    <Typography>ชื่อ : {selected.customerInJob.name}</Typography>
                                    <Typography>เบอร์โทร : {selected.customerInJob.phone}</Typography>
                                </Stack>
                            </Stack>
                        </CardDetail>
                        <Stack direction='row' spacing={2}>
                            <CardDetail>
                                <Typography variant='h6' fontWeight='bold'>รูปภาพ/วิดีโอสำหรับเคลมสินค้า</Typography>
                                <FileDetail menu={selected.fileUpload} />
                            </CardDetail>
                            <CardDetail>
                                <Typography variant='h6' fontWeight='bold'>รูปภาพ/วิดีโอสำหรับร้านค้าใช้ภายใน</Typography>
                                <FileDetail menu={selected.fileUpload} forService={true}/>
                            </CardDetail>
                        </Stack>

                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>อาการ / สาเหตุ</Typography>
                            <BehaviorDetail detail={selected.behavior}/>
                        </CardDetail>
                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>บันทึกอะไหล่</Typography>
                            <SpDetail sp={selected.sp} sp_warranty={selected.sp_warranty}/>
                        </CardDetail>
                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>หมายเหตุสำหรับลูกค้า</Typography>
                            <Typography variant='body1' color='gray'>- {selected.customerInJob.remark}</Typography>
                        </CardDetail>
                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>หมายเหตุสำหรับสื่อสารภายใน</Typography>
                            <Typography variant='body1' color='gray'>- {selected.remark}</Typography>
                        </CardDetail>
                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>เอกสาร</Typography>
                            <Stack direction='row' spacing={2}>
                                {
                                    detail.selected.sp.length > 0 && (
                                        <Button onClick={exportQu} startIcon={<PictureAsPdfIcon/>} variant='contained'>QU</Button>
                                    )
                                }
                                   <Button variant='contained'>รับสินค้า</Button>
                            </Stack>
                        </CardDetail>

                        <Stack direction='row' spacing={2} justifyContent='end'>
                            <Button variant='contained' color='error'
                                    onClick={() => console.log(selected)}>ยกเลิกงานซ่อม</Button>
                            <Button variant='contained' color='success' disabled={detail.job.status === 'success'}
                                    onClick={() => endJob()}>ปิดงานซ่อม</Button>
                        </Stack>
                    </Stack>
                </FormGroup>

            </Grid2>
        </Grid2>
    )
}
