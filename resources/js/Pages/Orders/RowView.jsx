import { Button, Card, CardContent,Grid2, Stack, Typography } from "@mui/material";
import {useCart} from "@/Pages/Orders/CartContext.jsx";

export default function RowView({ spList }) {
    const { cartItems, addToCart } = useCart();

    // ตรวจสอบว่าสินค้าอยู่ในตะกร้าหรือไม่
    const isInCart = (spcode) => {
        return cartItems.some(item => item.spcode === spcode);
    };

    return (
        <>
            {spList.map((item, index) => (
                <Grid2 size={12} key={index}>
                    <Card variant="outlined" sx={{ display: 'flex' }}>
                        <img
                            width={151}
                            src={item.path_file}
                            alt="ไม่มีรูป"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.dcpumpkin.com/images/product/500/default.jpg";
                            }}
                        />
                        <CardContent sx={{ width: '100%' }}>
                            <Stack direction='row' justifyContent='space-between'
                                   alignItems='center'>
                                <div>
                                    <Typography fontWeight='bold' gutterBottom variant="h5"
                                                component="div">
                                        {item.spcode}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {item.spname}
                                    </Typography>
                                    <Typography color='green'>
                                        ฿{parseFloat(item.price_per_unit).toFixed(3) ?? 0}
                                    </Typography>
                                </div>
                                <Stack direction='column' spacing={2}>
                                    {isInCart(item.spcode) ? (
                                        <Button disabled color='inherit'>เพิ่มในตะกร้าแล้ว</Button>
                                    ) : (
                                        <Button
                                            variant='contained'
                                            size="small"
                                            color="primary"
                                            onClick={() => addToCart(item)}
                                        >
                                            + เพิ่มลงในตะกร้า
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>
            ))}
        </>
    );
}
