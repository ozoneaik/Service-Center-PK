import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Box,
    Breadcrumbs,
    Button,
    Card, CardContent, Chip,
    Container,
    Grid2,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography, useMediaQuery, Divider
} from "@mui/material";
import { Link } from "@inertiajs/react";
import SearchIcon from '@mui/icons-material/Search';
import { DateFormat } from "@/Components/DateFormat.jsx";
import Checkbox from "@mui/material/Checkbox";


const StatusClaim = ({ status }) => (
    <Chip
        size='small'
        color={status === 'pending' ? 'secondary' : status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info'}
        label={status === 'pending' ? 'รอดำเนินงาน' : status === 'approved' ? 'เสร็จสิ้น' : status === 'rejected' ? 'ไม่อนุมัติ' : 'ไม่สามารถระบุได้'}
    />
)


export default function HistoryClaim({ history }) {
    const isMobile = useMediaQuery('(max-width:700px)');
    return (
        <AuthenticatedLayout>
            <Container maxWidth='false'>
                <Grid2 container spacing={2} mt={3}>
                    <Grid2 size={12}>
                        <Breadcrumbs>
                            <Typography sx={{ color: 'text.primary' }}>แจ้งเคลมอะไหล่</Typography>
                            <Typography sx={{ color: 'text.primary' }}>ประวัติเคลม</Typography>
                        </Breadcrumbs>
                    </Grid2>
                    <Grid2 size={12}>
                        {/* ปุ่มเมนู - สำหรับ Mobile จัดเป็นแนวตั้ง */}
                        <Stack
                            direction={isMobile ? 'column' : 'row-reverse'}
                            spacing={1}
                            mb={2}
                        >
                            <Button
                                component={Link} href={'/spare-claim/index'}
                                variant={route().current() === 'spareClaim.index' ? 'contained' : 'outlined'}
                                fullWidth={isMobile}
                            >
                                แจ้งเคลมอะไหล่
                            </Button>
                            <Button
                                color='warning'
                                component={Link} href={'/spare-claim/history'}
                                variant={route().current() === 'spareClaim.history' ? 'contained' : 'outlined'}
                                fullWidth={isMobile}
                            >
                                ประวัติเคลม
                            </Button>
                            <Button
                                color='secondary'
                                component={Link} href={'/spare-claim/pending'}
                                variant={route().current() === 'spareClaim.pending' ? 'contained' : 'outlined'}
                                fullWidth={isMobile}
                            >
                                ค้างเคลมอะไหล่
                            </Button>
                        </Stack>

                        <Card sx={{ padding: 3, overflowX: 'scroll' }}>
                            {/* ส่วนค้นหา */}
                            <Stack
                                direction={isMobile ? 'column' : 'row'}
                                spacing={2}
                                mb={2}
                                alignItems={isMobile ? 'stretch' : 'center'}
                            >
                                <TextField
                                    size='small'
                                    type='date'
                                    fullWidth={isMobile}
                                    label={isMobile ? 'วันที่เริ่มต้น' : ''}
                                />
                                {!isMobile && <Typography>ถึง</Typography>}
                                {isMobile && (
                                    <Typography variant='body2' textAlign='center' color='text.secondary'>
                                        ถึง
                                    </Typography>
                                )}
                                <TextField
                                    size='small'
                                    type='date'
                                    fullWidth={isMobile}
                                    label={isMobile ? 'วันที่สิ้นสุด' : ''}
                                />
                                <Button
                                    onClick={() => console.log(history)}
                                    startIcon={<SearchIcon />}
                                    variant='contained'
                                    fullWidth={isMobile}
                                >
                                    ค้นหา
                                </Button>
                            </Stack>

                            {isMobile ? (
                                <Stack spacing={2}>
                                    {history.map((item, index) => (
                                        <Card
                                            key={index}
                                            variant='outlined'
                                            sx={{
                                                transition: 'background-color 0.3s ease',
                                                border: '1px solid #e0e0e0'
                                            }}
                                        >
                                            <CardContent>
                                                {/* Header ของ Claim */}
                                                <Stack direction={isMobile ? 'column' : 'row'} justifyContent='space-between' alignItems='center' mb={2}>
                                                    <Typography variant='h6' fontWeight='bold' color='primary'>
                                                        {item.claim_id}
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        {DateFormat(item.created_at)}
                                                    </Typography>
                                                </Stack>

                                                <Divider sx={{ mb: 2 }} />

                                                {/* รายการอะไหล่ */}
                                                <Stack spacing={2}>
                                                    {item.list.map((part, idx) => (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: idx % 2 === 0 ? '#f8f9fa' : 'transparent',
                                                                borderRadius: 1,
                                                                border: '1px solid #f0f0f0'
                                                            }}
                                                        >
                                                            <Stack spacing={1}>
                                                                {/* Job ID */}
                                                                <Box>
                                                                    <Typography variant='body2' color='text.secondary'>
                                                                        รหัส Job
                                                                    </Typography>
                                                                    <Typography variant='body1' fontWeight='medium'>
                                                                        {part.job_id}
                                                                    </Typography>
                                                                </Box>

                                                                {/* รหัส และ ชื่ออะไหล่ */}
                                                                <Box>
                                                                    <Typography variant='body2' color='text.secondary'>
                                                                        รหัสอะไหล่
                                                                    </Typography>
                                                                    <Typography variant='body1' fontWeight='medium'>
                                                                        {part.sp_code}
                                                                    </Typography>
                                                                </Box>

                                                                <Box>
                                                                    <Typography variant='body2' color='text.secondary'>
                                                                        ชื่ออะไหล่
                                                                    </Typography>
                                                                    <Typography variant='body1' fontWeight='medium'>
                                                                        {part.sp_name}
                                                                    </Typography>
                                                                </Box>

                                                                {/* จำนวนที่แจ้งเคลม */}
                                                                <Stack direction='row' spacing={2}>
                                                                    <Box flex={1}>
                                                                        <Typography variant='body2' color='text.secondary'>
                                                                            จำนวนที่แจ้ง
                                                                        </Typography>
                                                                        <Typography variant='body1' fontWeight='medium'>
                                                                            {part.qty} {part.unit}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box flex={1}>
                                                                        <Typography variant='body2' color='text.secondary'>
                                                                            จำนวนที่รับ
                                                                        </Typography>
                                                                        <Typography variant='body1' fontWeight='medium'>
                                                                            {part.claim_qty ?? '-'} {part.claim_unit || ''}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>

                                                                {/* วันที่รับ */}
                                                                <Box>
                                                                    <Typography variant='body2' color='text.secondary'>
                                                                        วันที่รับ
                                                                    </Typography>
                                                                    <Typography variant='body1' fontWeight='medium'>
                                                                        {part.claim_date ? DateFormat(part.claim_date) : '-'}
                                                                    </Typography>
                                                                </Box>

                                                                {/* สถานะ */}
                                                                <Stack direction='row' justifyContent='space-between' alignItems='center' mt={1}>
                                                                    <Typography variant='body2' color='text.secondary'>
                                                                        สถานะ
                                                                    </Typography>
                                                                    <StatusClaim status={part.status} />
                                                                </Stack>
                                                            </Stack>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
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
                                                    sx={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent' }}
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
                                                        <StatusClaim status={part.status} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Card>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}
