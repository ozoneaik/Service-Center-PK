import {Box, Typography, Button, useTheme} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {Link} from "@inertiajs/react";

export default function OrderSuccess() {
    const theme = useTheme();
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            textAlign="center"
            sx={{ bgcolor: "#f9f9f9", p: 3 }}
        >
            <CheckCircleIcon sx={{ fontSize: 80, color: "green" }} />
            <Typography variant="h4" sx={{ mt: 2, fontWeight: "bold" }}>
                สั่งซื้อสำเร็จ!
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: "gray" }}>
                ขอบคุณสำหรับการสั่งซื้ออะไหล่ของทาง Pumpkin
            </Typography>

            <Box mt={3}>
                <Button
                    component={Link}
                    href='/orders/list'
                    variant="contained"
                    sx={{ bgcolor: theme.palette.pumpkinColor.main ,mr :2}}

                >
                    ซื้อสินค้าต่อ
                </Button>
                <Button
                    component={Link}
                    href='/orders/history'
                    variant="outlined"
                    color='info'
                >
                    ดูคำสั่งซื้อของฉัน
                </Button>
            </Box>
        </Box>
    );
}
