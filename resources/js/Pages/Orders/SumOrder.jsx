import {
    alpha,
    AppBar,
    Button,
    Dialog,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Toolbar,
    Typography,
    TextField,
    Box,
    Stack,
    Card,
    CardContent,
    Grid, Grid2, CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {useTheme} from '@mui/material/styles';
import {useState, useEffect, useMemo, useContext, createContext} from "react";

// สร้าง Context สำหรับจัดการข้อมูลตะกร้าสินค้าทั่วแอพพลิเคชัน
const CartContext = createContext();
const CART_STORAGE_KEY = 'pumpkin_pos_cart';
export const CartProvider = ({children}) => {
    const [cartItems, setCartItems] = useState([]);

    // โหลดข้อมูลจาก localStorage เมื่อคอมโพเนนต์ถูกโหลด
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Error loading cart from localStorage:", error);
            // กรณีเกิดข้อผิดพลาด ให้เริ่มต้นด้วยตะกร้าว่าง
            setCartItems([]);
        }
    }, []);

    // บันทึกข้อมูลลง localStorage ทุกครั้งที่ cartItems เปลี่ยนแปลง
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error("Error saving cart to localStorage:", error);
        }
    }, [cartItems]);

    const addToCart = (item, quantity = 1) => {
        console.log(item)
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.spcode === item.spcode);
            if (existingItem) {
                return prevItems.map(i =>
                    i.pid === item.spcode
                        ? {...i,
                            quantity: i.quantity + quantity}
                        : i
                );
            }
            return [...prevItems, {...item, quantity}];
        });
    };

    const removeFromCart = (spcode) => {
        setCartItems(prevItems => prevItems.filter(item => item.spcode !== spcode));
    };

    const updateQuantity = (spcode, quantity) => {
        if (quantity <= 0) {
            removeFromCart(spcode);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.spcode === spcode ? {...item, quantity} : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within CartProvider");
    }
    return context;
};

export default function SumOrder({
                                     open, setOpen, onBuyOrder = cartItems => {
    }
                                 }) {
    const theme = useTheme();
    const {cartItems, removeFromCart, updateQuantity, clearCart} = useCart();
    const [loading, setLoading] = useState(false);
    // จัดกลุ่มสินค้าตาม SKU
    const groupedItems = useMemo(() => {
        const groups = {};

        cartItems.forEach(item => {
            // ดึงส่วนแรกของ SKU เพื่อใช้เป็น key ในการจัดกลุ่ม
            // สมมติว่า skufg คือรหัสกลุ่มสินค้า ถ้าไม่มีจะแยกตามตัวอักษรแรกของ skusp
            const groupKey = item.skufg || item.skufg.substring(0, 3);

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }

            groups[groupKey].push(item);
        });

        return groups;
    }, [cartItems]);

    // คำนวณราคารวมทั้งหมด
    const totalPrice = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            return sum + (item.price_per_unit || 0) * item.quantity;
        }, 0);
    }, [cartItems]);

    const formatFloat = (price_per_unit, quantity,item) => {
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
        await onBuyOrder(cartItems).then(() => setLoading(false)).catch((error) => setLoading(false))
        clearCart();
        setOpen(false);
    };


    return (
        <Dialog
            fullScreen
            open={open}
            onClose={() => setOpen(false)}
        >
            <AppBar sx={{
                position: 'relative',
                backgroundColor: theme.palette.pumpkinColor?.main || theme.palette.primary.main
            }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setOpen(false)}
                        aria-label="close"
                    >
                        <CloseIcon/>
                    </IconButton>
                    <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                        สรุปรายการคำสั่งซื้อ
                    </Typography>
                    <Button
                        color="inherit"
                        onClick={clearCart}
                        disabled={cartItems.length === 0}
                    >
                        ล้างตะกร้า
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{p: 2, height: '90%', display: 'flex', flexDirection: 'column'}}>
                {cartItems.length === 0 ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1}}>
                        <Typography variant="h6" color="text.secondary">
                            ไม่มีสินค้าในตะกร้า
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box sx={{flexGrow: 1, overflow: 'auto', mb: 2}}>
                            {Object.entries(groupedItems).map(([groupKey, items]) => (
                                <Card key={groupKey} variant="outlined" sx={{mb: 2}}>
                                    <CardContent>
                                        <Typography variant="h6"
                                                    sx={{mb: 2, backgroundColor: 'rgba(0,0,0,0.05)', p: 1}}>
                                            กลุ่มสินค้า: {groupKey}
                                        </Typography>

                                        <List>
                                            {items.map((item) => (
                                                <Box key={item.spcode}>
                                                    <ListItem
                                                        sx={{
                                                            display: 'flex', flexDirection: {xs: 'column', sm: 'row'},
                                                            alignItems: {xs: 'flex-start', sm: 'center'}
                                                        }}
                                                    >
                                                        <Box sx={{
                                                            display: 'flex', flexGrow: 1,
                                                            width: '100%', alignItems: 'center'
                                                        }}>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography fontWeight="bold">
                                                                        {item.spcode}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <>
                                                                        <Typography variant="body2">
                                                                            {item.spname}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="green">
                                                                            {formatFloat(item.price_per_unit, item.quantity,item)}
                                                                        </Typography>
                                                                    </>
                                                                }
                                                                sx={{mr: 2}}
                                                            />

                                                            <Stack direction="row" spacing={1}
                                                                   sx={{alignItems: 'center', mt: {xs: 1, sm: 0}}}>
                                                                <TextField
                                                                    label="จำนวน" type="number"
                                                                    InputProps={{inputProps: {min: 1}}}
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateQuantity(item.spcode, parseInt(e.target.value) || 0)}
                                                                    size="small" sx={{width: '100px'}}
                                                                />
                                                                <IconButton
                                                                    color="error" size="small"
                                                                    onClick={() => removeFromCart(item.spcode)}
                                                                >
                                                                    <DeleteIcon/>
                                                                </IconButton>
                                                            </Stack>
                                                        </Box>
                                                    </ListItem>
                                                    <Divider/>
                                                </Box>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        <Box sx={{p: 2, borderTop: '1px solid', borderColor: 'divider'}}>
                            <Grid2 container spacing={2} alignItems="center">
                                <Grid2 size={{xs: 12, sm: 6}}>
                                    <Typography variant="h6">
                                        จำนวนรายการทั้งหมด: {cartItems.length} รายการ
                                    </Typography>
                                    <Typography variant="h5" color="primary">
                                        ยอดรวมทั้งสิ้น: ฿{totalPrice.toFixed(2)}
                                    </Typography>
                                </Grid2>
                                <Grid2 size={{xs: 12, sm: 6}} sx={{textAlign: 'right'}}>
                                    <Button
                                        disabled={loading}
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleConfirmOrder}
                                        startIcon={loading && <CircularProgress/>}
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
