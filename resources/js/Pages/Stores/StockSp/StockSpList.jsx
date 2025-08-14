import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, router} from "@inertiajs/react";
import {
    Container, Table, TableBody, TableCell, TableHead, TableRow, TextField, Grid2, InputAdornment, Button, Paper,
    Stack, Typography, useMediaQuery, Card, CardContent, Box, Divider
} from "@mui/material";
import {useState} from "react";
import AddSpWithBill from "./AddSpWithBill.jsx";
import AddSpBasic from "./AddSpBasic.jsx";
import {Add, Clear,Search, Build, DriveFileRenameOutline} from "@mui/icons-material";

const tableHeaders = ['รูปภาพอะไหล่', 'รหัสอะไหล่', 'ชื่ออะไหล่', 'สต็อกรวม', 'แจ้งซ่อม', 'แจ้งปรับปรุง', 'สต็อกคงเหลือ'];

// function ลบ
const different = (qty_sp = 0, rp_qty = 0, stj_qty = 0) => {
    return (qty_sp - rp_qty) + stj_qty;
}

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
                        <TableCell>{stock.qty_sp || 0}</TableCell>
                        <TableCell>{stock.rp_qty || 0}</TableCell>
                        <TableCell>{stock.stj_qty || 0}</TableCell>
                        <TableCell>
                            {different(stock.qty_sp, stock.rp_qty, stock.stj_qty)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

const MobileDetail = ({stocks}) => {
    const isMobile = useMediaQuery('(max-width:600px)');
    return (
        <Stack spacing={2}>
            {stocks.map((stock, index) => {
                return (
                    <Card
                        variant='outlined'
                        key={index}
                        sx={{
                            borderRadius: 3, border: '1px solid #e0e0e0',
                            transition: 'all 0.3s ease', overflow: 'hidden'
                        }}
                    >
                        <CardContent sx={{p: 0}}>
                            {/* Header Section with Image */}
                            <Box sx={{
                                position: 'relative', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                p: 2, display: isMobile ? 'flex' : 'block', alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                {/* Product Info */}
                                <Box sx={{flex: 1}}>
                                    <Typography
                                        variant="h6"
                                        sx={{fontWeight: 600, color: '#1976d2', fontSize: '1.1rem'}}
                                    >
                                        {`(${stock.sp_code})`}&nbsp;{stock.sp_name}
                                    </Typography>
                                </Box>

                                {/* Product Image */}
                                <Box sx={{width: 50, height: 50, borderRadius: 2, overflow: 'hidden',}}>
                                    <img
                                        width="100%"
                                        height="100%"
                                        style={{objectFit: 'cover'}}
                                        src={import.meta.env.VITE_IMAGE_SP + stock.sp_code + ".jpg"}
                                        alt="no image"
                                        onError={(e) => {
                                            e.target.src = import.meta.env.VITE_IMAGE_DEFAULT
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Stock Information Grid */}
                            <Box sx={{px : 2, pt : 2 , pb : 0}}>
                                <Grid2 container spacing={2}>
                                    {/* Stock Details */}
                                    <Grid2 size={{xs: 6}}>
                                        <Box sx={{
                                            textAlign: 'center', p: 1.5, backgroundColor: '#e3f2fd',
                                            borderRadius: 2, border: '1px solid #bbdefb'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                สต็อกยกมา
                                            </Typography>
                                            <Typography variant="h6" sx={{fontWeight: 600, color: '#1976d2'}}>
                                                {stock.qty_sp?.toLocaleString() || 0}
                                            </Typography>
                                        </Box>
                                    </Grid2>

                                    <Grid2 size={{xs: 6}}>
                                        <Box sx={{
                                            textAlign: 'center', p: 1.5, backgroundColor: '#fff3e0',
                                            borderRadius: 2, border: '1px solid #ffcc02'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                แจ้งซ่อม
                                            </Typography>
                                            <Typography variant="h6" sx={{fontWeight: 600, color: '#f57c00'}}>
                                                {stock.rp_qty || 0}
                                            </Typography>
                                        </Box>
                                    </Grid2>

                                    <Grid2 size={{xs: 6}}>
                                        <Box sx={{
                                            textAlign: 'center', p: 1.5, backgroundColor: '#f3e5f5',
                                            borderRadius: 2, border: '1px solid #ce93d8'
                                        }}>
                                            <Typography variant="body2" color="text.secondary">
                                                แจ้งปรับปรุง
                                            </Typography>
                                            <Typography variant="h6" sx={{fontWeight: 600, color: '#7b1fa2'}}>
                                                {stock.stj_qty || 0}
                                            </Typography>
                                        </Box>
                                    </Grid2>

                                    <Grid2 size={{xs: 6}}>
                                        <Box sx={{
                                            textAlign: 'center', p: 1.5, borderRadius: 2,
                                            backgroundColor: '#e8f5e8',
                                            border: `1px solid #a5d6a7`
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
                                                {different(stock.qty_sp, stock.rp_qty, stock.stj_qty)}
                                            </Typography>
                                        </Box>
                                    </Grid2>
                                </Grid2>
                            </Box>
                        </CardContent>
                    </Card>
                )
            })}
        </Stack>
    )
}

export default function StockSpList({stocks, store, job_pending}) {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [openAddSpBill, setOpenAddSpBill] = useState(false);
    const [openAddSpBasic, setOpenAddSpBasic] = useState(false);

    const [filter, setFilter] = useState({sp_code: '', sp_name: ''});

    const handleFilter = (e) => {
        e.preventDefault();
        const jsonForm = {
            is_code_cust_id: store.is_code_cust_id,
            sp_name: filter.sp_name || null,
            sp_code: filter.sp_code || null
        }
        router.get(route('stockSp.list', {...jsonForm}));
    }

    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setFilter(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleClearFilter = () => {
        router.get(route('stockSp.list', {is_code_cust_id: store.is_code_cust_id,}));
    }

    return (
        <>
            {openAddSpBasic && <AddSpBasic openAddSpBasic={openAddSpBasic} setOpenAddSpBasic={setOpenAddSpBasic}/>}
            {openAddSpBill && <AddSpWithBill openAddSpBill={openAddSpBill} setOpenAddSpBill={setOpenAddSpBill}/>}
            <AuthenticatedLayout>
                <Head title="จัดการสต็อกอะไหล่"/>
                <Container maxWidth='false' sx={{backgroundColor: 'white', p: 3}}>
                    <Grid2 container spacing={2}>
                        {/* Filter */}
                        <Grid2 size={12}>
                            <Box>
                                <form onSubmit={handleFilter}>
                                    <Stack spacing={2} direction={isMobile ? 'column' : 'row'}>
                                        <TextField
                                            fullWidth size="small" label='รหัสอะไหล่'
                                            type="text" name="sp_code"
                                            onChange={handleOnChange}
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">
                                                        <Build/>
                                                    </InputAdornment>
                                                }
                                            }}
                                        />
                                        <TextField
                                            label='ชื่ออะไหล่' type="text" name="sp_name"
                                            onChange={handleOnChange}
                                            fullWidth size="small"
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">
                                                        <DriveFileRenameOutline/>
                                                    </InputAdornment>
                                                }
                                            }}
                                        />
                                        <Button
                                            sx={{minWidth: 100}} startIcon={<Search/>}
                                            variant="contained" type="submit"
                                        >
                                            ค้นหา
                                        </Button>
                                        <Button
                                            sx={{minWidth: 150}} startIcon={<Clear/>}
                                            variant="contained" color="secondary" onClick={handleClearFilter}
                                        >
                                            ล้างการกรอง
                                        </Button>
                                    </Stack>
                                </form>
                            </Box>
                        </Grid2>

                        <Grid2 size={12}>
                            <Divider/>
                        </Grid2>


                        <Grid2 size={12}>
                            <Stack
                                direction={{md: 'row', xs: 'column'}}
                                justifyContent='space-between' alignItems='center'
                            >
                                <Stack spacing={1}>
                                    <Typography variant='h5' fontWeight='bold'>
                                        จัดการสต็อกอะไหล่ ร้าน{store.shop_name}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        รายการทั้งหมด {stocks.length} รายการ
                                    </Typography>
                                </Stack>

                                <Stack direction='row' spacing={2}>
                                    <Button
                                        startIcon={<Add/>} variant="contained" color="info"
                                        onClick={() => setOpenAddSpBill(true)}
                                    >
                                        เพิ่มอะไหล่จากการสแกนบิล
                                    </Button>
                                    <Button
                                        variant="contained" startIcon={<Add/>}
                                        onClick={() => setOpenAddSpBasic(true)}
                                    >
                                        เพิ่มอะไหล่
                                    </Button>
                                    <Button
                                        startIcon={<Add/>} variant="contained"
                                        color="warning" component={Link}
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
