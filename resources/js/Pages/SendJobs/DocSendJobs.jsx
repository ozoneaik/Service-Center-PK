import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Button,
    Card, Chip,
    Grid2,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import DescriptionIcon from '@mui/icons-material/Description';

export default function DocSendJobs({groups}) {
    console.log(groups)
    return (
        <AuthenticatedLayout>
            <Head title={'ทำใบ'}/>
            <Paper sx={{bgcolor: 'white', p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography variant='h6'>ทำใบ PK</Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        <Card variant='outlined'>
                            <Table>
                                <TableHead>
                                    <TableRow sx={TABLE_HEADER_STYLE}>
                                        {['ลำดับ', 'เลข job', 'ปริ้นครั้งแรก', 'ปริ้นครั้งล่าสุด', 'จัดการ'].map((item, index) => (
                                            <TableCell key={index}>{item}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groups.map((group, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip variant='filled' label={group.group_job} color='secondary'/>
                                                </TableCell>
                                                <TableCell>{group.print_at || 'ไม่มีข้อมูล'}</TableCell>
                                                <TableCell>{group.print_updated_at || 'ไม่มีข้อมูล'}</TableCell>
                                                <TableCell>
                                                    <Stack direction='column' spacing={2} width='50%'>
                                                        <Button size='small' variant='contained'
                                                                startIcon={<DescriptionIcon/>}>
                                                            รายละเอียด
                                                        </Button>
                                                        <Button size='small' color='secondary' variant='contained'
                                                                startIcon={<LocalPrintshopIcon/>}>
                                                            พิมพ์ (จำนวนการพิมพ์ {group.counter_print} ครั้ง)
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </Grid2>
                </Grid2>
            </Paper>

        </AuthenticatedLayout>
    )
}

const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};

