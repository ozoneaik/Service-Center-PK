import {
    Box,
    Button, Card, CardContent, Divider,
    Grid2,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, Typography,
    useMediaQuery
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import PreviewIcon from "@mui/icons-material/Preview";
import {useEffect, useState} from "react";
import DialogDetail from "@/Pages/SpareClaim/DialogDetail.jsx";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {DateFormatTh} from "@/Components/DateFormat.jsx";

export default function AlreadyClaim({spareParts}) {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState();

    const isMobile = useMediaQuery('(max-width: 600px)');
    const [selected, setSelected] = useState(spareParts.map(item => ({
        ...item,
        checked: false,
        detail: item.detail.map(detailItem => ({...detailItem, checked: false}))
    })));

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(spareParts)
    }, []);
    const showModal = (data) => {
        setDetail(data.detail);
        setOpen(true);
    };

    const selectAll = (event) => {
        const checked = event.target.checked;
        setSelected(prevSelected =>
            prevSelected.map(item => ({
                ...item, checked,
                detail: item.detail.map(detailItem => ({
                    ...detailItem, checked
                }))
            }))
        );
    };

    const handleCheckboxChange = (index) => {
        setSelected(prevSelected =>
            prevSelected.map((item, i) => i === index ? {...item, checked: !item.checked} : item)
        );
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const formData = selected.filter((item) => item.checked === true);
        let message = '';
        let Status
        AlertDialog({
            icon: 'question',
            title: 'ยืนยันการบันทึก',
            text: 'กด ตกลง เพื่อสร้างเอกสารเคลมอะไหล่',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        setLoading(true);
                        const {data, status} = await axios.post('/spare-claim/store', {
                            selected: formData
                        });
                        message = data.message;
                        Status = status;
                    } catch (error) {
                        message = error.response.data.message ?? 'มีปัญหาทาง server';
                        Status = error.response.status
                    } finally {
                        AlertDialog({
                            icon: Status === 200 ? 'success' : 'error',
                            text: message,
                            onPassed: () => {
                                if (Status === 200) window.location.reload()
                            }
                        })
                        setLoading(false);
                    }
                } else console.log('ไม่ได้กด confirm')
            }
        })

    }

    return (
        <>
            {open && <DialogDetail sparePartsDetail={detail} open={open} setOpen={setOpen} data={[1, 2, 3, 4]}/>}
            <Paper variant='outlined' sx={{p: 2, overflowX: 'auto', mb: isMobile ? 10 : 0}}>
                <Grid2 container spacing={2}>
                    {isMobile ? (
                        <Grid2 size={12}>
                            {/* เลือกทั้งหมด สำหรับ Mobile */}
                            <Card variant='outlined' sx={{mb: 2, p: 2}}>
                                <Stack direction='row' alignItems='center' spacing={1}>
                                    <Checkbox onChange={selectAll}
                                              checked={selected.every(item => item.checked)}/>
                                    <Typography variant='body2' fontWeight='bold'>
                                        เลือกทั้งหมด
                                    </Typography>
                                </Stack>
                            </Card>

                            {/* รายการ Jobs สำหรับ Mobile */}
                            <Stack spacing={2}>
                                {selected.map((item, index) => {
                                    return (
                                        <Card
                                            key={index}
                                            variant='outlined'
                                            sx={{
                                                transition: 'background-color 0.3s ease',
                                            }}
                                        >
                                            <CardContent>
                                                <Stack direction='row' alignItems='flex-start' spacing={2}>
                                                    <Checkbox
                                                        checked={item.checked}
                                                        onChange={() => handleCheckboxChange(index)}
                                                    />
                                                    <Box flex={1}>
                                                        <Typography variant='h6' fontWeight='bold' color='primary'
                                                                    gutterBottom>
                                                            {item.sp_code} {item.sp_name}
                                                        </Typography>

                                                        <Stack spacing={1}>

                                                            <Box>
                                                                <Typography variant='body2' color='text.secondary'>
                                                                    สต็อกศูนย์ซ่อม : {item.stock_local?.qty_sp ?? 0}
                                                                </Typography>
                                                            </Box>

                                                            <Box>
                                                                <Typography variant='body2' color='text.secondary'>
                                                                    สต็อกพัมคิน : 0
                                                                </Typography>
                                                            </Box>

                                                            <Box>
                                                                <Typography variant='body2' color='text.secondary'>
                                                                    จำนวน : {item.qty} ต่อ 1 {item.sp_unit || 'อัน'}
                                                                </Typography>
                                                            </Box>
                                                            <Button onClick={() => showModal(item)}>
                                                                <PreviewIcon/>
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </Stack>
                        </Grid2>
                    ) : (
                        <Grid2 size={12}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Checkbox onChange={selectAll}
                                                      checked={selected.every(item => item.checked)}/>
                                        </TableCell>
                                        <TableCell>รหัสอะไหล่</TableCell>
                                        <TableCell>ชื่ออะไหล่</TableCell>
                                        <TableCell>สต็อกศูนย์ซ่อม</TableCell>
                                        <TableCell>สต็อกพัมคิน</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>รายละเอียด</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selected.map((item, index) => {

                                        return (
                                            <TableRow key={index}
                                                      sx={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent'}}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={item.checked}
                                                        onChange={() => handleCheckboxChange(index)}
                                                    />
                                                </TableCell>
                                                <TableCell>{item.sp_code}</TableCell>
                                                <TableCell>{item.sp_name}</TableCell>
                                                <TableCell>{item.stock_local?.qty_sp ?? 0}</TableCell>
                                                <TableCell>0</TableCell>
                                                <TableCell>{item.qty}</TableCell>
                                                <TableCell>{item.sp_unit}</TableCell>
                                                <TableCell>
                                                    <Button onClick={() => showModal(item)}>
                                                        <PreviewIcon/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )

                                    })}
                                </TableBody>
                            </Table>
                        </Grid2>
                    )}
                </Grid2>


            </Paper>


            <Box
                position="fixed" bottom={0} left={0}
                width="100%" zIndex={1000} bgcolor="white" boxShadow={3}
            >
                <form onSubmit={onSubmit}>
                    <Stack direction='row-reverse' spacing={2} m={2}>
                        <Button variant='contained' type='submit' loading={loading}>
                            สร้างเอกสารเคลม
                        </Button>
                    </Stack>
                </form>
            </Box>

        </>
    );
}
