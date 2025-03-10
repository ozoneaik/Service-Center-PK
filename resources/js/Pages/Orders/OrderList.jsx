import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Button, Card, Container, Grid2, Paper, Stack, TextField, Badge, CircularProgress} from "@mui/material";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import {useMemo, useRef, useState} from "react";
import RowView from "@/Pages/Orders/RowView.jsx";
import SumOrder from "@/Pages/Orders/SumOrder.jsx";
import {Link, router} from "@inertiajs/react";
import {CartProvider, useCart} from "@/Pages/Orders/CartContext.jsx";


export default function OrderList() {
    const [dmPreview, setDmPreview] = useState('');
    const [spList, setSpList] = useState([]);
    const searchSku = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, status } = await axios.get(`/orders/search/${searchSku.current.value}`);

            if (status === 200) {
                console.log(data, status);
                setSpList(data.result.sp || []);

                if (data.result.sp && data.result.sp.length > 0) {
                    await fetchDm(); // เรียก fetchDm() แต่ไม่ปิด loading ที่นี่
                } else {
                    setDmPreview('');
                }
            } else {
                setSpList([]);
                setDmPreview('');
            }
        } catch (error) {
            console.error(error);
            setSpList([]);
            setDmPreview('');
        } finally {
            setLoading(false); // ปิด loading หลังจากทุกอย่างเสร็จ
        }
    };

    const fetchDm = async () => {
        try {
            const { data, status } = await axios.get(`/image-dm/${searchSku.current.value}`);
            console.log(data, status);
            setDmPreview(data.pathfile_dm + data.namefile_dm);
        } catch (error) {
            console.error(error);
            setDmPreview('');
        }
    };

    return (
        <CartProvider> {/* ครอบ component ด้วย CartProvider */}
            <OrderListContent
                dmPreview={dmPreview}
                spList={spList}
                searchSku={searchSku}
                handleSearch={handleSearch}
                open={open}
                setOpen={setOpen}
                loading={loading}
                setLoading={setLoading}
            />
        </CartProvider>
    );
}

// แยก component เนื้อหาออกมาเพื่อให้สามารถใช้ useCart ได้
function OrderListContent({dmPreview, spList, setCardView, searchSku, handleSearch, open, setOpen,loading,setLoading}) {
    const {cartItems} = useCart(); // ใช้ hook useCart เพื่อเข้าถึงข้อมูลตะกร้า

    const handleBuyOrder = async (cartItems) => {
        const {data,status} = await axios.post('/orders/store',{
            spList : cartItems
        })
        console.log(data, status)
        if (status === 200) {
            alert('คำสั่งซื้อได้รับการยืนยันแล้ว');
            router.visit('/orders/success');
        }
    }

    return (
        <AuthenticatedLayout>
            {open && <SumOrder open={open} setOpen={setOpen} onBuyOrder={(cartItems) => handleBuyOrder(cartItems)}/>}
            <Container maxWidth='false' sx={{backgroundColor: 'white', p: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <form onSubmit={handleSearch}>
                            <Stack direction='row' spacing={2}>
                                <TextField required inputRef={searchSku} fullWidth label='ค้นหารหัสสินค้า' type='text'/>
                                <Button type='submit' variant='contained'>ค้นหา</Button>
                                <Badge badgeContent={cartItems.length} color="error">
                                    <Button
                                        onClick={() => setOpen(true)}
                                        startIcon={<AddShoppingCartIcon/>}
                                        color='secondary'
                                        variant='contained'
                                    />
                                </Badge>
                                <Button
                                    component={Link}
                                    href='/orders/history'
                                    startIcon={<HistoryIcon/>}
                                    color='secondary'
                                    variant='contained'
                                >
                                    ประวัติการสั่งซื้อ
                                </Button>
                            </Stack>
                        </form>
                    </Grid2>
                    {spList.length > 0 && !loading ? (
                        <>
                            <Grid2 size={{md: 3, sm: 12}}>
                                <Card variant='outlined'>
                                    <img
                                        width='100%'
                                        src={dmPreview || ''}
                                        alt='no image'
                                    />
                                </Card>
                            </Grid2>
                            <Grid2 size={{md: 9, sm: 12}}>
                                <Paper variant='outlined' sx={{p: 3}}>
                                    <Grid2 container spacing={2}>
                                        <Grid2 container spacing={2} height={650} sx={{overflowY: 'scroll'}}>
                                            <RowView spList={spList}/>
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            </Grid2>
                        </>
                    ) : loading ? <CircularProgress/> : <>ไม่พบรายการอะไหล่รหัสสินค้านี้ โปรดลองอีกครั้ง</>}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}
