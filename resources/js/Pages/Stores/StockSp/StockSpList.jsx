import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, usePage} from "@inertiajs/react";
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Grid2,
    InputAdornment,
    Button,
    Paper,
    Chip,
    Stack,
    Typography,
    useMediaQuery, Card, CardContent, Box
} from "@mui/material";
import StoreIcon from '@mui/icons-material/Store';
import PasswordIcon from '@mui/icons-material/Password';
import SearchIcon from '@mui/icons-material/Search';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import {useState} from "react";
import AddSpWithBill from "./AddSpWithBill.jsx";
import AddSpBasic from "./AddSpBasic.jsx";

const tableHeaders = ['รูปภาพอะไหล่', 'รหัสอะไหล่', 'ชื่ออะไหล่', 'จำนวน', 'สต็อกยกมา', 'แจ้งซ่อม', 'แจ้งปรับปรุง', 'สต็อกคงเหลือ'];

const TableDetail = ({stocks}) => {
    return (
        <Table>
            <TableHead>
                <TableRow sx={TABLE_HEADER_STYLE}>
                    {tableHeaders.map((head, index) => (
                        <TableCell key={index}>{head}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {stocks.map((stock, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <img
                                width={80} src={import.meta.env.VITE_IMAGE_SP + stock.sp_code + ".jpg"} alt="no image"
                                onError={(e) => {
                                    e.target.src = import.meta.env.VITE_IMAGE_DEFAULT
                                }}
                            />
                        </TableCell>
                        <TableCell>{stock.sp_code}</TableCell>
                        <TableCell>{stock.sp_name}</TableCell>
                        <TableCell>{stock.qty_sp}</TableCell>
                        <TableCell>{stock.qty_sp}</TableCell>
                        <TableCell>{stock.qty_sp}</TableCell>
                        <TableCell>{stock.qty_sp}</TableCell>
                        <TableCell>{stock.qty_sp}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

const MobileDetail = ({stocks}) => {
    const isMobile = useMediaQuery('(max-width:600px)');
    return (
        <>
            {stocks.map((stock, index) => {
                return (
                    <Card
                        variant='outlined'
                        key={index}
                        sx={{
                            borderRadius: 3,
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            overflow: 'hidden'
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            {/* Header Section with Image */}
                            <Box sx={{
                                position: 'relative',
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                p: 2,
                                display: isMobile ? 'flex' : 'block',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                {/* Product Info */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{fontWeight: 600, color: '#1976d2', mb: 0.5, fontSize: '1.1rem'}}
                                    >
                                        {stock.sp_name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#666',
                                            fontFamily: 'monospace',
                                            backgroundColor: '#fff',
                                            padding: '4px 8px',
                                            borderRadius: 1,
                                            display: 'inline-block',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        รหัส: {stock.sp_code}
                                    </Typography>
                                </Box>

                                {/* Product Image */}
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <img
                                        width="100%"
                                        height="100%"
                                        style={{ objectFit: 'cover' }}
                                        src={import.meta.env.VITE_IMAGE_SP + stock.sp_code + ".jpg"}
                                        alt="no image"
                                        onError={(e) => {
                                            e.target.src = import.meta.env.VITE_IMAGE_DEFAULT
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Stock Information Grid */}
                            <Box sx={{ p: 2 }}>
                                <Grid2 container spacing={2}>
                                    {/* Stock Details */}
                                    <Grid2 size={{xs : 6}}>
                                        <Box sx={{
                                            textAlign: 'center',
                                            p: 1.5,
                                            backgroundColor: '#e3f2fd',
                                            borderRadius: 2,
                                            border: '1px solid #bbdefb'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                สต็อกยกมา
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                {stock.qty_sp?.toLocaleString() || 0}
                                            </Typography>
                                        </Box>
                                    </Grid2>

                                    <Grid2 size={{xs : 6}}>
                                        <Box sx={{
                                            textAlign: 'center',
                                            p: 1.5,
                                            backgroundColor: '#fff3e0',
                                            borderRadius: 2,
                                            border: '1px solid #ffcc02'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                แจ้งซ่อม
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#f57c00' }}>
                                                {stock.qty_sp?.toLocaleString() || 0}
                                            </Typography>
                                        </Box>
                                    </Grid2>

                                    <Grid2 size={{xs : 6}}>
                                        <Box sx={{
                                            textAlign: 'center',
                                            p: 1.5,
                                            backgroundColor: '#f3e5f5',
                                            borderRadius: 2,
                                            border: '1px solid #ce93d8'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                แจ้งปรับปรุง
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                                                {stock.qty_sp?.toLocaleString() || 0}
                                            </Typography>
                                        </Box>
                                    </Grid2>

                                    <Grid2 size={{xs : 6}}>
                                        <Box sx={{
                                            textAlign: 'center',
                                            p: 1.5,
                                            backgroundColor: stock.qty_sp > 0 ? '#e8f5e8' : '#ffebee',
                                            borderRadius: 2,
                                            border: `1px solid ${stock.qty_sp > 0 ? '#a5d6a7' : '#ffcdd2'}`
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                สต็อกคงเหลือ
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: stock.qty_sp > 0 ? '#2e7d32' : '#d32f2f'
                                                }}
                                            >
                                                {stock.qty_sp?.toLocaleString() || 0}
                                            </Typography>
                                        </Box>
                                    </Grid2>
                                </Grid2>
                            </Box>

                        </CardContent>
                    </Card>

                )
            })}
        </>
    )
}

export default function StockSpList({stocks, store}) {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [openAddSpBill, setOpenAddSpBill] = useState(false);
    const [openAddSpBasic, setOpenAddSpBasic] = useState(false);
    const {flash} = usePage().props

    return (
        <>
            {openAddSpBasic && <AddSpBasic openAddSpBasic={openAddSpBasic} setOpenAddSpBasic={setOpenAddSpBasic}/>}
            {openAddSpBill && <AddSpWithBill openAddSpBill={openAddSpBill} setOpenAddSpBill={setOpenAddSpBill}/>}
            <AuthenticatedLayout>
                <Head title="จัดการสต็อกอะไหล่"/>
                <Container maxWidth='false' sx={{backgroundColor: 'white', p: 3}}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{md: 3, xs: 12}}>
                            <TextField
                                fullWidth size="small" label='รหัสอะไหล่'
                                type="text" name="is_code_cust_id"
                                // onChange={handleFilterChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <PasswordIcon/>
                                        </InputAdornment>
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 size={{md: 3, xs: 12}}>
                            <TextField
                                fullWidth size="small" label='ชื่ออะไหล่'
                                type="text" name="stock_name"
                                // onChange={handleFilterChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <StoreIcon/>
                                        </InputAdornment>
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 size={{md: 3, xs: 12}}>
                            <TextField
                                fullWidth size="small" label='รหัสสินค้า'
                                type="text" name="serial_id"
                                // onChange={handleFilterChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <LocalPhoneIcon/>
                                        </InputAdornment>
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 size={{md: 3, xs: 12}}>
                            <TextField
                                fullWidth size="small" label='ชื่อสินค้า'
                                type="text" name="serial_id"
                                // onChange={handleFilterChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">
                                            <LocalPhoneIcon/>
                                        </InputAdornment>
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 size={12}>
                            <Button disabled fullWidth startIcon={<SearchIcon/>} variant="contained">ค้นหา</Button>
                        </Grid2>

                        <Grid2 size={12}>
                            <Stack direction={{md: 'row', xs: 'column'}} justifyContent='space-between'
                                   alignItems='center'>

                                <Typography variant='h5' fontWeight='bold'>
                                    จัดการสต็อกอะไหล่ ร้าน{store.shop_name}
                                </Typography>

                                <Stack direction={{md: 'row', xs: 'column'}} spacing={2} alignItems='center'>
                                    <Typography variant="subtitle1">รายการทั้งหมด {stocks.length} รายการ</Typography>
                                    <Button
                                        fullWidth={isMobile} variant="contained" color="info"
                                        onClick={() => setOpenAddSpBill(true)}
                                    >
                                        เพิ่มอะไหล่จากการสแกนบิล
                                    </Button>
                                    <Button
                                        fullWidth={isMobile} variant="contained"
                                        onClick={() => setOpenAddSpBasic(true)}
                                    >
                                        เพิ่มอะไหล่
                                    </Button>
                                    <Button
                                        fullWidth={isMobile}
                                        variant="contained"
                                        color="warning"
                                        component={Link}
                                        href={route('stockJob.index')}
                                    >
                                        ปรับปรุงสต็อก
                                    </Button>
                                </Stack>
                            </Stack>
                        </Grid2>

                        <Grid2 size={12}>
                            {isMobile ? (
                                <MobileDetail stocks={stocks}/>
                            ) : (
                                <Paper variant='outlined' sx={{p: 2, overflowX: 'auto'}}>
                                    <TableDetail stocks={stocks}/>
                                </Paper>
                            )}
                        </Grid2>
                    </Grid2>
                </Container>
            </AuthenticatedLayout>
        </>

    )
}

const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
