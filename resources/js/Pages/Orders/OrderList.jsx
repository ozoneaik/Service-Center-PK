import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Button, Card, Container, Grid2, Paper, Stack, TextField, CircularProgress,
    useMediaQuery, Box, Fab, Autocomplete
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import { useEffect, useRef, useState } from "react";
import RowView from "@/Pages/Orders/RowView.jsx";
import SumOrder from "@/Pages/Orders/SumOrder.jsx";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { CartProvider, useCart } from "@/Pages/Orders/CartContext.jsx";
import DmPreview from "@/Components/DmPreview.jsx";
import { Search } from "@mui/icons-material";
import axios from "axios";

export default function OrderList({ count_cart, message, sku, result }) {
    const user = usePage().props.auth.user;

    const [allSp, setAllSp] = useState(result?.sp || []);
    const [spList, setSpList] = useState([]);

    const [searchValue, setSearchValue] = useState(sku ?? "");
    const searchSku = useRef(null);

    const [modelOptions, setModelOptions] = useState(result?.model_options || []);
    const [selectedModel, setSelectedModel] = useState(null);

    const [open, setOpen] = useState(false);
    const [address, setAddress] = useState(user.store_info.address);
    const [phone, setPhone] = useState(user.store_info.phone);
    const [loading, setLoading] = useState(false);
    const [countCart, setCountCart] = useState(count_cart);
    const [product, setProduct] = useState(result || null);

    const [activeLayout, setActiveLayout] = useState("outside");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route("orders.list"),
            { sku: searchValue },
            {
                replace: true,
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            }
        );
    };

    useEffect(() => {
        setSearchValue(sku ?? "");

        const nextAll = result?.sp || [];
        setAllSp(nextAll);

        let models = Array.isArray(result?.model_options) ? [...result.model_options] : [];
        if (!models.length) {
            const uniq = Array.from(new Set((nextAll || []).map((x) => x.modelfg).filter(Boolean)));
            models = uniq;
        }
        setModelOptions(models);

        const firstModel = models.length ? models[0] : null;
        setSelectedModel(firstModel);

        const firstLayerOfModel = (result?.diagram_layers || []).find(
            (dl) => !firstModel || dl.modelfg === firstModel
        );
        setActiveLayout(((firstLayerOfModel?.layer_char || "outside") + "").toLowerCase().trim());

        if (firstModel) {
            const filtered = nextAll.filter((x) => (x.modelfg || null) === firstModel);
            setSpList(filtered.length ? filtered : nextAll);
        } else {
            setSpList(nextAll);
        }
    }, [result, sku]);

    useEffect(() => {
        const layersForModel = (product?.diagram_layers || []).filter(
            (x) => !selectedModel || x.modelfg === selectedModel
        );
        const first = layersForModel[0];
        const nextLayout = ((first?.layer_char || "outside") + "").toLowerCase().trim();
        setActiveLayout(nextLayout);

        const byModel = !selectedModel ? allSp : allSp.filter((x) => (x.modelfg || null) === selectedModel);
        const want = (nextLayout || "outside").toLowerCase().trim();
        const byLayout = byModel.filter(
            (x) => ((x.layout || "outside") + "").toLowerCase().trim() === want
        );

        setSpList(byLayout.length ? byLayout : byModel);
    }, [selectedModel]);

    useEffect(() => {
        const byModel = !selectedModel ? allSp : allSp.filter((x) => (x.modelfg || null) === selectedModel);

        const want = (activeLayout || "outside").toLowerCase().trim();
        const byLayout = byModel.filter(
            (x) => ((x.layout || "outside") + "").toLowerCase().trim() === want
        );
        setSpList(byLayout.length ? byLayout : byModel);
        
    }, [activeLayout, selectedModel, allSp]);

    const diagramLayersForModel = (product?.diagram_layers || []).filter(
        (x) => !selectedModel || x.modelfg === selectedModel
    );

    return (
        <CartProvider>
            <OrderListContent
                setCountCart={setCountCart}
                countCart={countCart}
                spList={spList}
                setSpList={setSpList}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
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
                modelOptions={modelOptions}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                diagramLayers={diagramLayersForModel}
                activeLayout={activeLayout}
                setActiveLayout={setActiveLayout}
            />
        </CartProvider>
    );
}

function OrderListContent(props) {
    const {
        spList,
        setSpList,
        searchValue,
        setSearchValue,
        searchSku,
        handleSearch,
        open,
        setOpen,
        loading,
        product,
        address,
        setAddress,
        phone,
        setPhone,

        modelOptions,
        selectedModel,
        setSelectedModel,
        diagramLayers,

        activeLayout,
        setActiveLayout,
    } = props;

    const { clearCart } = useCart();
    const isMobile = useMediaQuery("(max-width:600px)");
    const showModelPicker = !!product && Array.isArray(modelOptions) && modelOptions.length > 0;

    const handleBuyOrder = async (cartItems) => {
        const { status } = await axios.post("/orders/store", {
            spList: cartItems,
            address: address,
            phone: phone,
        });
        if (status === 200) {
            alert("คำสั่งซื้อได้รับการยืนยันแล้ว");
            clearCart();
            setOpen(false);
            router.visit("/orders/success");
        }
    };

    const redirectCart = () => {
        router.get(route("orders.carts"), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="สั่งซื้ออะไหล่" />

            {open && (
                <SumOrder
                    phone={phone}
                    setPhone={setPhone}
                    address={address}
                    setAddress={setAddress}
                    open={open}
                    setOpen={setOpen}
                    onBuyOrder={(cartItems) => handleBuyOrder(cartItems)}
                />
            )}

            <Container maxWidth="false" sx={{ backgroundColor: "white", p: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <form onSubmit={handleSearch}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        required
                                        inputRef={searchSku}
                                        fullWidth
                                        label="ค้นหารหัสสินค้า"
                                        type="text"
                                        size="small"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                    {showModelPicker && (
                                        <Box sx={{ mt: 2 }}>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={modelOptions}
                                                value={selectedModel}
                                                onChange={(_e, v) => setSelectedModel(v)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="เลือกโมเดล"
                                                        placeholder="เช่น J-12BID1504"
                                                        fullWidth
                                                        size="small"
                                                    />
                                                )}
                                            />
                                        </Box>
                                    )}
                                </Box>

                                <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                    <Button
                                        fullWidth={isMobile}
                                        type="submit"
                                        startIcon={<Search />}
                                        variant="contained"
                                        size="small"
                                        disabled={loading}
                                    >
                                        ค้นหา
                                    </Button>

                                    {!isMobile && (
                                        <Button
                                            startIcon={<AddShoppingCartIcon />}
                                            onClick={redirectCart}
                                            color="secondary"
                                            variant="contained"
                                            size="small"
                                        >
                                            ตะกร้าสินค้า
                                        </Button>
                                    )}
                                    <Button
                                        fullWidth={isMobile}
                                        component={Link}
                                        href="/orders/history"
                                        startIcon={<HistoryIcon />}
                                        color="warning"
                                        variant="contained"
                                        size="small"
                                    >
                                        {!isMobile && "ประวัติการสั่งซื้อ"}
                                    </Button>
                                </Stack>
                            </Stack>
                        </form>
                    </Grid2>

                    {spList.length > 0 && !loading ? (
                        <>
                            <Grid2 size={{ md: 3, sm: 12 }}>
                                <Card variant="outlined">
                                    {product ? (
                                        <DmPreview
                                            key={`${product?.pid || ""}-${selectedModel || "all"}`} 
                                            detail={{ pid: product.pid }}
                                            diagramLayers={diagramLayers}              
                                            initialLayout={activeLayout}               
                                            onLayoutChange={(layout) => {              
                                                const next = (layout || "outside").toLowerCase().trim();
                                                setActiveLayout(next);
                                            }}
                                        />
                                    ) : (
                                        <Box p={2} textAlign="center">ไม่มีข้อมูลสินค้า</Box>
                                    )}
                                </Card>
                            </Grid2>

                            <Grid2 size={{ md: 9, sm: 12 }}>
                                <Paper variant="outlined" sx={{ p: { sx: 0, lg: 3 } }}>
                                    <Grid2 container spacing={2}>
                                        <Grid2
                                            container
                                            spacing={{ sx: 0, lg: 2 }}
                                            height={650}
                                            sx={{ overflowY: "scroll" }}
                                        >
                                            <RowView spList={spList} setSpList={setSpList} />
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            </Grid2>
                        </>
                    ) : loading ? (
                        <Grid2 size={12}>
                            <Box textAlign="center" py={5}>
                                <CircularProgress />
                            </Box>
                        </Grid2>
                    ) : (
                        <Grid2 size={12}>
                            <Box textAlign="center" py={5}>
                                ไม่พบรายการอะไหล่รหัสสินค้านี้ โปรดลองอีกครั้ง
                            </Box>
                        </Grid2>
                    )}
                </Grid2>

                {isMobile && (
                    <Box position="fixed" bottom={0} right={0} p={2} zIndex={1000}>
                        <Fab color="secondary" component={Link} href={route("orders.carts")}>
                            <AddShoppingCartIcon />
                        </Fab>
                    </Box>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}