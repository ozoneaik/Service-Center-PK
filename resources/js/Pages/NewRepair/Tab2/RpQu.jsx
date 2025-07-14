import {useEffect, useState} from "react";
import {
    Button, Card, CardContent, Chip,
    CircularProgress,
    Grid2,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, Typography,
    useMediaQuery
} from "@mui/material";
import {ArrowRight, Assignment, Download} from "@mui/icons-material";
import {DateFormat, DateFormatTh} from "@/Components/DateFormat.jsx";

export default function RpQu({JOB, setStepForm}) {

    const [loading, setLoading] = useState(false);
    const [pathPdf, setPathPdf] = useState();
    const [qus, setQus] = useState([]);
    const isMobile = useMediaQuery('(max-width:700px)');


    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.get(route('repair.after.qu.index', {job_id: JOB.job_id}));
            console.log(data, status)
            setQus(data.list)
        } catch (error) {
            console.log(error)
        }
    }

    const fetchDataSparePart = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.post(route('repair.after.qu.index', {
                job_id: JOB.job_id,
            }));
            console.log(data, status)
            setPathPdf(data.full_file_path)
            window.open(data.full_file_path, '_blank');
        } catch (error) {
            console.log(error)
        }
    }

    const getQuotation = () => {
        fetchDataSparePart().finally(() => setLoading(false));
    }

    const downloadFile = () => {
        const link = document.createElement('a');
        link.href = pathPdf;
        link.target = '_blank';
        link.download = `ใบเสนอราคา ${JOB.job_id} ${JOB.serial_id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <Stack direction={{sm: 'row', xs: 'column'}} justifyContent={{sm: 'space-between', xs: 'start'}}
                       gap={2}>
                    <Button loading={loading} variant='contained' startIcon={<Assignment/>} onClick={getQuotation}>
                        {loading ? 'กำลังสร้างใบเสนอราคา' : 'สร้างใบเสนอราคา'}
                    </Button>
                    <Button
                        disabled={!pathPdf}
                        variant='contained' startIcon={<Download/>}
                        id='download' color='success' onClick={downloadFile}
                    >
                        ดาวน์โหลดใบเสนอราคาล่าสุด
                    </Button>
                </Stack>
            </Grid2>
            {!loading && (
                <Grid2 size={12} sx={{bgcolor: 'white'}}>
                    {isMobile ? (
                        <Stack spacing={2}>
                            {qus.map((qu, index) => (
                                <Card key={index}>
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Typography
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >

                                                ชื่อไฟล์ :
                                                <a href={qu.full_file_path} target='_blank'>
                                                    {qu.file_name}
                                                </a>
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                สร้างเมื่อ : {DateFormatTh({date: qu.created_at})}
                                            </Typography>
                                            <Chip label={'จำนวนดาวน์โหลด : ' + qu.counter_print}/>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ชื่อไฟล์ ใบเสนอราคา</TableCell>
                                    <TableCell>สร้างเมื่อ</TableCell>
                                    <TableCell align='right'>จำนวนดาวน์โหลด</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {qus.length > 0 ? (
                                    <>
                                        {qus.map((qu, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <a href={qu.full_file_path} target='_blank'>
                                                        {qu.file_name}
                                                    </a>
                                                </TableCell>
                                                <TableCell>{DateFormatTh({date: qu.created_at})}</TableCell>
                                                <TableCell align='right'>{qu.counter_print}</TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell align='center' colSpan={3}>ไม่พบรายการ</TableCell>
                                    </TableRow>
                                )}

                            </TableBody>
                        </Table>
                    )}
                </Grid2>
            )}
            <Grid2 size={12}>
                <Stack direction='row' justifyContent='end' onClick={() => setStepForm(3)}>
                    <Button variant='contained' color='secondary' endIcon={<ArrowRight/>}>ถัดไป</Button>
                </Stack>
            </Grid2>
        </Grid2>
    )
}
