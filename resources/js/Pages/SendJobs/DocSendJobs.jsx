import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Button, Card, Chip, Grid2, Paper, Stack, Typography,
    Table, TableBody, TableCell, TableHead, TableRow, CardContent, Box, Divider, useMediaQuery
} from "@mui/material";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import DescriptionIcon from '@mui/icons-material/Description';
import {useState} from "react";
import ModalDetailSendJob from "@/Pages/SendJobs/ModalDetailSendJob.jsx";
import {DateFormatTh} from "@/Components/DateFormat.jsx";

export default function DocSendJobs({groups}) {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [open, setOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState();

    const TableComponent = () => (
        <Table>
            <TableHead>
                <TableRow sx={TABLE_HEADER_STYLE}>
                    <TableCell>ลำดับ</TableCell>
                    <TableCell>เลขที่ JOB (PK)</TableCell>
                    <TableCell>วันที่สร้าง JOB</TableCell>
                    <TableCell>พิมพ์ครั้งแรก</TableCell>
                    <TableCell>พิมพ์ครั้งล่าสุด</TableCell>
                    <TableCell>จำนวนครั้งที่พิมพ์</TableCell>
                    <TableCell>จัดการ</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {groups.map((group, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            {index + 1}
                        </TableCell>
                        <TableCell>
                            <Chip
                                variant='filled'
                                label={group.group_job}
                                color='secondary'
                            />
                        </TableCell>
                        <TableCell>
                            <DateFormatTh date={group.created_at}/>
                        </TableCell>
                        <TableCell>
                            <DateFormatTh date={group.print_at}/>
                        </TableCell>
                        <TableCell>
                            <DateFormatTh date={group.print_updated_at}/>
                        </TableCell>
                        <TableCell>
                            {group.counter_print}
                        </TableCell>
                        <TableCell>
                            <Stack direction='row' spacing={2}>
                                <Button
                                    size='small' variant='contained'
                                    startIcon={<DescriptionIcon/>}
                                    onClick={() => {
                                        setSelectedGroup(group.group_job)
                                        setOpen(true)
                                    }}
                                >
                                    รายละเอียด
                                </Button>
                                <Button
                                    size='small' color='secondary' variant='contained'
                                    startIcon={<LocalPrintshopIcon/>}
                                    component="a"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`/send-job/print/${group.group_job}`}
                                >
                                    พิมพ์
                                </Button>
                            </Stack>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )

    return (
        <>
            {open && <ModalDetailSendJob open={open} setOpen={setOpen} job_group={selectedGroup}/>}
            <AuthenticatedLayout>
                <Head title={'ทำใบ'}/>
                <Paper sx={{bgcolor: 'white', p: 3}}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                <Typography variant='h6'>ออกเอกสารส่งกลับ</Typography>
                                <Typography variant='body1'>รายการทั้งหมด {groups.length} รายการ</Typography>
                            </Stack>
                        </Grid2>

                        {/* Mobile View */}
                        {isMobile ? (
                            <Grid2 size={12}>
                                <Stack spacing={2}>
                                    {groups.map((group, index) => (
                                        <Card key={index} variant='outlined'>
                                            <CardContent>
                                                <Stack spacing={2}>
                                                    {/* Header ของ Card */}
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Typography variant='h6' color='text.secondary'>
                                                            #{index + 1}
                                                        </Typography>
                                                        <Chip
                                                            variant='filled'
                                                            label={group.group_job}
                                                            color='secondary'
                                                            size='medium'
                                                        />
                                                    </Stack>

                                                    <Divider />

                                                    {/* ข้อมูลการสร้าง */}
                                                    <Box>
                                                        <Typography variant='body2' color='text.secondary'>
                                                            วันที่สร้าง JOB
                                                        </Typography>
                                                        <Typography variant='body1' fontWeight='medium'>
                                                            <DateFormatTh date={group.created_at}/>
                                                        </Typography>
                                                    </Box>

                                                    {/* ข้อมูลการพิมพ์ */}
                                                    <Stack direction='row' spacing={2}>
                                                        <Box flex={1}>
                                                            <Typography variant='body2' color='text.secondary'>
                                                                พิมพ์ครั้งแรก
                                                            </Typography>
                                                            <Typography variant='body1' fontWeight='medium'>
                                                                <DateFormatTh date={group.print_at}/>
                                                            </Typography>
                                                        </Box>
                                                        <Box flex={1}>
                                                            <Typography variant='body2' color='text.secondary'>
                                                                พิมพ์ครั้งล่าสุด
                                                            </Typography>
                                                            <Typography variant='body1' fontWeight='medium'>
                                                                <DateFormatTh date={group.print_updated_at}/>
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    {/* จำนวนครั้งที่พิมพ์ */}
                                                    <Box>
                                                        <Typography variant='body2' color='text.secondary'>
                                                            จำนวนครั้งที่พิมพ์
                                                        </Typography>
                                                        <Chip
                                                            label={`${group.counter_print} ครั้ง`}
                                                            color='primary'
                                                            variant='outlined'
                                                            size='small'
                                                        />
                                                    </Box>

                                                    <Divider />

                                                    {/* ปุ่มจัดการ */}
                                                    <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                                        <Button
                                                            size='small'
                                                            variant='contained'
                                                            startIcon={<DescriptionIcon/>}
                                                            onClick={() => {
                                                                setSelectedGroup(group.group_job)
                                                                setOpen(true)
                                                            }}
                                                            sx={{ flex: 1 }}
                                                        >
                                                            รายละเอียด
                                                        </Button>
                                                        <Button
                                                            size='small'
                                                            color='secondary'
                                                            variant='contained'
                                                            startIcon={<LocalPrintshopIcon/>}
                                                            component="a"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={`/send-job/print/${group.group_job}`}
                                                            sx={{ flex: 1 }}
                                                        >
                                                            พิมพ์
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            </Grid2>
                        ) : (
                            /* Desktop View */
                            <Grid2 size={12}>
                                <Card variant='outlined'>
                                    <TableComponent/>
                                </Card>
                            </Grid2>
                        )}
                    </Grid2>
                </Paper>
            </AuthenticatedLayout>
        </>
    )
}

const TABLE_HEADER_STYLE = {backgroundColor: '#c7c7c7', fontWeight: 'bold', fontSize: 16};
