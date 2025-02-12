import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Breadcrumbs,
    Button,
    Card, Chip,
    Container,
    Grid2,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {Link} from "@inertiajs/react";
import SearchIcon from '@mui/icons-material/Search';
import {DateFormat} from "@/Components/DateFormat.jsx";


const StatusClaim = ({status}) =>
    (<Chip
        variant='outlined'
        size='small'
        color={status === 'pending' ? 'primary' : 'success'}
        label={status === 'pending' ? 'รอดำเนินงาน' : 'เสร็จสิ้น'}
    />)


export default function HistoryClaim({history}) {
    return (
        <AuthenticatedLayout>
            <Container maxWidth>
                <Grid2 container spacing={2} mt={3}>
                    <Grid2 size={12}>
                        <Breadcrumbs>
                            <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                            <Typography sx={{color: 'text.primary'}}>ประวัติเคลม</Typography>
                        </Breadcrumbs>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse' spacing={2} mb={2}>
                            <Button
                                component={Link} href={'/spare-claim/index'}
                                variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}>
                                สร้างเอกสารเคลม
                            </Button>
                            <Button
                                component={Link} href={'/spare-claim/history'}
                                variant={route().current() === 'spareClaim.history' ? 'contained' : 'outlined'}>
                                ประวัติเคลม
                            </Button>
                        </Stack>
                        <Card sx={{padding: 3,overflowX : 'scroll'}}>
                            <Stack direction='row' spacing={2} mb={2} alignItems='center'>
                                <TextField size='small' type='date'/>
                                <Typography>ถึง</Typography>
                                <TextField size='small' type='date'/>
                                <Button onClick={() => console.log(history)} startIcon={<SearchIcon/>}
                                        variant='contained'>ค้นหา</Button>
                            </Stack>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>รหัสเอกสารเคลม</TableCell>
                                        <TableCell>รหัส job</TableCell>
                                        <TableCell>รหัสอะไหล่</TableCell>
                                        <TableCell>ชื่ออะไหล่</TableCell>
                                        <TableCell>วันที่แจ้งเคลม</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>วันที่รับ</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.map((item, index) => (
                                        item.list.map((part, idx) => (
                                            <TableRow
                                                key={`${index}-${idx}`}
                                                sx={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent'}}
                                            >
                                                {idx === 0 && (
                                                    <TableCell rowSpan={item.list.length}>
                                                        {item.claim_id}
                                                    </TableCell>
                                                )}
                                                <TableCell>{part.job_id}</TableCell>
                                                <TableCell>{part.sp_code}</TableCell>
                                                <TableCell>{part.sp_name}</TableCell>
                                                {idx === 0 && (
                                                    <TableCell rowSpan={item.list.length}>
                                                        {DateFormat(item.created_at)}
                                                    </TableCell>
                                                )}
                                                <TableCell>{part.qty}</TableCell>
                                                <TableCell>{part.unit}</TableCell>
                                                <TableCell>{part.claim_date ? DateFormat(part.claim_date) : '-'}</TableCell>
                                                <TableCell>{part.claim_qty ?? '-'}</TableCell>
                                                <TableCell>{part.claim_unit}</TableCell>
                                                <TableCell>
                                                    <StatusClaim status={part.status}/>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}
