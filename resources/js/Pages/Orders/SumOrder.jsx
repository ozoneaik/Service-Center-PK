import {
    AppBar, Button, Dialog, Divider, IconButton,
    List, ListItem, ListItemText, Toolbar,
    Typography, TextField,
    Box, Stack, Card, CardContent,
    Grid2, CircularProgress, Avatar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from '@mui/material/styles';
import { useState, useMemo } from "react";
import { useCart } from "@/Pages/Orders/CartContext.jsx";
import React from "react";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { usePage } from "@inertiajs/react";


export default function SumOrder({
    open, setOpen, onBuyOrder = cartItems => {
    }, address, setAddress, phone, setPhone
}) {
    const user = usePage().props.auth.user;
    const theme = useTheme();
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const PumpkinColor = theme.palette.pumpkinColor.main;
    const groupedItems = useMemo(() => { // จัดกลุ่มสินค้าตาม SKU
        const groups = {};
        cartItems.forEach(item => { // สมมติว่า skufg คือรหัสกลุ่มสินค้า ถ้าไม่มีจะแยกตามตัวอักษรแรกของ skusp
            const groupKey = item.skufg || item.skufg.substring(0, 3);
            if (!groups[groupKey]) groups[groupKey] = {
                namesku: item.pname, // ใช้ชื่อสินค้าหลักเป็น namesku
                sku_image_path: item.imagesku, // ใช้รูปภาพของ SKU
                items: [] // เก็บรายการสินค้าในกลุ่ม
            };
            groups[groupKey].items.push(item);

        });
        console.log(groups)
        return groups;
    }, [cartItems]);

    // คำนวณราคารวมทั้งหมด
    const totalPrice = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            return sum + (item.price_per_unit || 0) * item.quantity;
        }, 0);
    }, [cartItems]);

    const formatFloat = (price_per_unit, quantity, item) => {
        const PricePerUnitForCal = parseFloat(price_per_unit) || 0;
        const Qty = parseFloat(quantity);
        const totalPriceSp = (PricePerUnitForCal * Qty).toFixed(2);
        const showPricePerUnit = parseFloat(PricePerUnitForCal).toFixed(2);
        return `${showPricePerUnit} × ${Qty} = ${totalPriceSp}`;
    };

    // จัดการการยืนยันคำสั่งซื้อ
    const handleConfirmOrder = async () => {
        console.log("Order confirmed:", cartItems);
        setLoading(true)
        // return ;
        await onBuyOrder(cartItems).then(() => setLoading(false)).catch((error) => setLoading(false))
        // clearCart();
        // setOpen(false);
    };


    const ListSp = ({ sp }) => {
        return (
            <Card variant='outlined' sx={{ p: 1 }}>
                <Stack direction='row' width='100%' justifyContent='space-between' alignItems='center'>
                    <Stack direction='row' spacing={2} alignItems='center'>
                        <img src={sp.path_file} alt={sp.spname} width='100' />
                        <Stack direction='column' spacing={1}>
                            <Typography fontWeight='bold'>{sp.spcode}</Typography>
                            <Typography variant='body2'>{sp.spname}</Typography>
                            <Typography variant="body2" color="green">
                                {formatFloat(sp.price_per_unit, sp.quantity, sp)}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
                        <IconButton
                            color="primary" size="small"
                            onClick={() => updateQuantity(sp.spcode, Math.max(1, sp.quantity - 1))}
                        >
                            <RemoveIcon />
                        </IconButton>
                        <Typography variant="body1" sx={{ width: '40px', textAlign: 'center' }}>
                            {sp.quantity}
                        </Typography>

                        <IconButton
                            color="primary" size="small"
                            onClick={() => updateQuantity(sp.spcode, sp.quantity + 1)}
                        >
                            <AddIcon />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => removeFromCart(sp.spcode)}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>

                </Stack>
            </Card>
        )
    }


    return (
        <Dialog fullScreen open={open} onClose={() => setOpen(false)}>
            <AppBar sx={{ position: 'relative', backgroundColor: PumpkinColor }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        สรุปรายการคำสั่งซื้อ
                    </Typography>
                    <Button color="inherit" onClick={clearCart} disabled={cartItems.length === 0}>
                        ล้างตะกร้า
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 2, height: '90%', display: 'flex', flexDirection: 'column' }}>
                {cartItems.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                        <Typography variant="h6" color="text.secondary">
                            ไม่มีสินค้าในตะกร้า
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>

                            <Card variant="outlined" sx={{ p: 2 }}>
                                <Typography variant='h6'>ที่อยู่จัดส่ง</Typography>
                                <TextField
                                    variant='standard' defaultValue={address} sx={{ width: '100%' }}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </Card>
                            <br />
                            <Card variant="outlined" sx={{ p: 2 }}>
                                <Typography variant='h6'>เบอร์โทรศัพท์</Typography>
                                <TextField
                                    variant='standard' defaultValue={phone} sx={{ width: '100%' }}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </Card>
                            <br />

                            {Object.entries(groupedItems).map(([groupKey, group]) => (
                                <Card key={groupKey} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" spacing={2}
                                            sx={{ mb: 2, backgroundColor: '#0000000D', p: 1 }}>
                                            <Avatar
                                                src={group.sku_image_path} variant="square"
                                                sx={{ width: 48, height: 48 }}
                                            />
                                            <Typography
                                                variant="h6">กลุ่มสินค้า: {group.namesku} ( {groupKey} )
                                            </Typography>
                                        </Stack>
                                        <Stack direction="column" spacing={1}>
                                            {group.items.map((item) => (
                                                <React.Fragment key={item.spcode}>
                                                    <ListSp sp={item} />
                                                </React.Fragment>
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Grid2 container spacing={2} alignItems="center">
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="h6">
                                        จำนวนรายการทั้งหมด: {cartItems.length} รายการ
                                    </Typography>
                                    <Typography variant="h5" color="primary">
                                        ยอดรวมทั้งสิ้น: ฿{totalPrice.toFixed(2)}
                                    </Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'right' }}>
                                    <Button
                                        disabled={loading}
                                        variant="contained" color="primary" size="large"
                                        onClick={handleConfirmOrder}
                                        startIcon={loading && <CircularProgress />}
                                    >
                                        ยืนยันการสั่งซื้อ
                                    </Button>
                                </Grid2>
                            </Grid2>
                        </Box>
                    </>
                )}
            </Box>
        </Dialog>
    );
}
