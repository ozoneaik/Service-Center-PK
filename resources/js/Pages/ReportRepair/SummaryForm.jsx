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


const BehaviorDetail = ({detail}) => (
    <Stack flexWrap='wrap' direction='row'>
        {detail.map((item, index) => (
            <Typography variant='body1' color='gray' key={index}>{item.causename}&nbsp;/&nbsp;</Typography>
        ))}
    </Stack>
)

const FileDetail = ({menu}) => (
    <Grid2 container>
        {menu.map((item, index) => (
            <Grid2 key={index} size={6}>
                <Typography>{item.menu_name}</Typography>
                <Stack direction='row' spacing={2}>
                    {item.list.map((image, i) => (
                        <ImagePreview key={i} src={image.full_file_path} width={50}/>
                    ))}
                </Stack>
            </Grid2>
        ))}
    </Grid2>
)

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
                    <TableRow key={index}>
                        <TableCell>image</TableCell>
                        <TableCell>{item.spcode}</TableCell>
                        <TableCell>{item.spname}</TableCell>
                        <TableCell>{item.price_per_unit}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{item.unit ?? 'อัน'}</TableCell>
                        <TableCell>{item.price_per_unit * item.qty}</TableCell>
                    </TableRow>
                ))}
                {sp_warranty.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell sx={highlight}>image</TableCell>
                        <TableCell sx={highlight}>{item.spcode}</TableCell>
                        <TableCell sx={highlight}>{item.spname}</TableCell>
                        <TableCell sx={highlight}>{item.price_per_unit}</TableCell>
                        <TableCell sx={highlight}>{item.qty}</TableCell>
                        <TableCell sx={highlight}>{item.unit ?? 'อัน'}</TableCell>
                        <TableCell sx={highlight}>{item.price_per_unit * item.qty}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


const CardDetail = ({children}) => (
    <Card variant="outlined">
        <CardContent>
            {children}
        </CardContent>
    </Card>
)


export const SummaryForm = ({detail, setDetail}) => {
    const selected = detail.selected;


    async function endJob() {

        AlertDialog({
            icon: 'question',
            title: 'ยืนยันการปิดงานซ่อม',
            text : 'กด ตกลง เพื่อ ยืนยันการปิดงานซ่อม',
            onPassed : async (confirm) => {
                if (confirm){
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
                    } finally {
                        AlertDialog({
                            icon: Status === 200 ? 'success' : 'error',
                            text: message,
                            onPassed: () => {
                            }
                        })
                    }
                }else console.log('ไม่ได้กด confirm')
            }
        });


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
                                <Stack direction='column'>
                                    <Typography><b>ชื่อ :</b> {selected.customerInJob.name}</Typography>
                                    <Typography>เบอร์โทร : {selected.customerInJob.phone}</Typography>
                                </Stack>
                            </Stack>
                        </CardDetail>
                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>รูปภาพ</Typography>
                            <FileDetail menu={selected.fileUpload}/>
                        </CardDetail>
                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>อาการ / สาเหตุ</Typography>
                            <BehaviorDetail detail={selected.behavior}/>
                        </CardDetail>
                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>บันทึกอะไหล่</Typography>
                            <SpDetail sp={selected.sp} sp_warranty={selected.sp_warranty}/>
                        </CardDetail>
                        <CardDetail>
                            <Typography variant='h6' fontWeight='bold'>หมายเหตุ</Typography>
                            <Typography variant='body1' color='gray'>- {selected.remark}</Typography>
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
