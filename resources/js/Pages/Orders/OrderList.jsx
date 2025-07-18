import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Button, Card, Container, Grid2, Paper, Stack, TextField,
    Badge, CircularProgress, useMediaQuery, Box, Fab
} from "@mui/material";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import { useEffect, useRef, useState } from "react";
import RowView from "@/Pages/Orders/RowView.jsx";
import SumOrder from "@/Pages/Orders/SumOrder.jsx";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { CartProvider, useCart } from "@/Pages/Orders/CartContext.jsx";
import DmPreview from "@/Components/DmPreview.jsx";
import { Add, Search } from "@mui/icons-material";

export default function OrderList({ count_cart, message, sku, result }) {

    const [dmPreview, setDmPreview] = useState('');
    const user = usePage().props.auth.user;
    const [spList, setSpList] = useState(result?.sp || []);
    const searchSku = useRef(null);
    const [open, setOpen] = useState(false);
    const [address, setAddress] = useState(user.store_info.address);
    const [phone, setPhone] = useState(user.store_info.phone);
    const [loading, setLoading] = useState(false);
    const [countCart, setCountCart] = useState(count_cart);
    const [product, setProduct] = useState(result || null);

    useEffect(() => {
        if (result?.sp?.length > 0) {
            fetchDm();
        }
    }, [result]);
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        router.get(route('orders.list'), {
            sku: searchSku.current.value
        });
        return;
        try {
            const { data, status } = await axios.get(`/orders/search/${searchSku.current.value}`);
            if (status === 200) {
                setSpList(data.result.sp || []);
                setProduct(data.result);
                if (data.result.sp && data.result.sp.length > 0) {
                    await fetchDm();
                } else setDmPreview('');
            } else {
                setSpList([]);
                setDmPreview('');
            }
        } catch (error) {
            console.error(error);
            setSpList([]);
            setDmPreview('');
        } finally {
            setLoading(false);
        }

    };

    const fetchDm = async () => {
        const sku_path = import.meta.env.VITE_DIAGRAMS + `Diagrams-${sku}-DM01.jpg`;
        console.log('sku_path', sku_path);

        setDmPreview(sku_path);
    };

    return (
        <CartProvider>
            <OrderListContent
                setCountCart={setCountCart}
                countCart={countCart}
                dmPreview={dmPreview}
                spList={spList}
                setSpList={setSpList}
                searchSku={searchSku}
                handleSearch={handleSearch}
                open={open}
                setOpen={setOpen}
                loading={loading}
                address={address}
                setAddress={setAddress}
                phone={phone}
                setPhone={setPhone}
                setLoading={setLoading}
                product={product}
                setProduct={setProduct}
            />
        </CartProvider>
    );
}


function OrderListContent(props) {
    const { dmPreview, spList, setSpList, searchSku, handleSearch, open, setOpen, loading } = props;
    const { countCart } = props;
    const { product, setProduct } = props;
    const { address, setAddress, phone, setPhone } = props;
    const { clearCart } = useCart();
    const isMobile = useMediaQuery('(max-width:600px)');

    const handleBuyOrder = async (cartItems) => {
        const { data, status } = await axios.post('/orders/store', {
            spList: cartItems,
            address: address,
            phone: phone
        })
        if (status === 200) {
            alert('คำสั่งซื้อได้รับการยืนยันแล้ว');
            clearCart();
            setOpen(false);
            router.visit('/orders/success');
        }
    }

    const redirectCart = () => {
        router.get(route('orders.carts'), {
            preserveState: true, // ✅ คง state หน้าเดิม
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title='🛒 สั่งซื้อะไหล่' />

            {open && <SumOrder phone={phone} setPhone={setPhone} address={address} setAddress={setAddress} open={open}
                setOpen={setOpen} onBuyOrder={(cartItems) => handleBuyOrder(cartItems)} />}

            <Container maxWidth='false' sx={{ backgroundColor: 'white', p: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <form onSubmit={handleSearch}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField required inputRef={searchSku} fullWidth label='ค้นหารหัสสินค้า' type='text' />
                                <Stack direction='row' spacing={1}>
                                    <Button fullWidth={isMobile} type='submit' startIcon={<Search />} variant='contained'>ค้นหา</Button>

                                    {!isMobile && (
                                        <Button
                                            fullWidth={isMobile}
                                            startIcon={<AddShoppingCartIcon />}
                                            onClick={redirectCart}
                                            color='secondary' variant='contained'
                                        >
                                            {!isMobile && 'ตะกร้าสินค้า'}
                                        </Button>
                                    )}


                                    <Button
                                        fullWidth={isMobile}
                                        component={Link} href='/orders/history'
                                        startIcon={<HistoryIcon />}
                                        color='warning' variant='contained'
                                    >
                                        {!isMobile && 'ประวัติการสั่งซื้อ'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </form>
                    </Grid2>
                    {spList.length > 0 && !loading ? (
                        <>
                            <Grid2 size={{ md: 3, sm: 12 }}>
                                <Card variant='outlined'>
                                    <DmPreview detail={{ pid: product.pid, fac_model: product.facmodel }} />
                                </Card>
                            </Grid2>
                            <Grid2 size={{ md: 9, sm: 12 }}>
                                <Paper variant='outlined' sx={{ p: { sx: 0, lg: 3 } }}>
                                    <Grid2 container spacing={2}>
                                        <Grid2 container spacing={{ sx: 0, lg: 2 }} height={650}
                                            sx={{ overflowY: 'scroll' }}>
                                            <RowView spList={spList} setSpList={setSpList} />
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            </Grid2>
                        </>
                    ) : loading ? <CircularProgress /> : <>ไม่พบรายการอะไหล่รหัสสินค้านี้ โปรดลองอีกครั้ง</>}

                </Grid2>

                {isMobile && (
                    <Box
                        position="fixed" bottom={0} right={0} p={2}
                        zIndex={1000}
                    >
                        <Fab color='secondary' component={Link} href={route('orders.carts')}>
                            <AddShoppingCartIcon />
                        </Fab>
                    </Box>
                )}


            </Container>
        </AuthenticatedLayout>
    );
}
