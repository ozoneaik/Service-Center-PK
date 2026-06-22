import { Button, Card, CardContent, Chip, Grid2, IconButton, Stack, Typography } from "@mui/material";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { AlertDialog } from "@/Components/AlertDialog.js";
import { useState } from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

export default function RowView({ spList, setSpList }) {
    const [loadingMap, setLoadingMap] = useState({});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [openSpImage, setOpenSpImage] = useState(false);
    const [spImage, setSpImage] = useState('');

    const setItemLoading = (spcode, val) =>
        setLoadingMap(prev => ({ ...prev, [spcode]: val }));

    const handleAddToCart = async (item) => {
        try {
            setItemLoading(item.spcode, true);
            const { data, status } = await axios.post('/orders/carts/add-cart', { ...item });
            if (status === 200) {
                setSpList(spList.map(sp =>
                    sp.spcode === item.spcode
                        ? { ...sp, added: true, cartId: data.cart.id, cartQty: 1 }
                        : sp
                ));
            }
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message
            });
        } finally {
            setItemLoading(item.spcode, false);
        }
    };

    const handleQtyChange = async (item, direction) => {
        try {
            setItemLoading(item.spcode, true);
            if (direction === 'remove' && item.cartQty <= 1) {
                await axios.delete(`/orders/carts/delete/${item.cartId}`);
                setSpList(spList.map(sp =>
                    sp.spcode === item.spcode
                        ? { ...sp, added: false, cartId: null, cartQty: 0 }
                        : sp
                ));
            } else {
                const { data } = await axios.post(`/orders/carts/add-remove/${direction}`, { id: item.cartId });
                setSpList(spList.map(sp =>
                    sp.spcode === item.spcode
                        ? { ...sp, cartQty: data.sp.qty }
                        : sp
                ));
            }
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response?.data?.message || 'เกิดข้อผิดพลาด'
            });
        } finally {
            setItemLoading(item.spcode, false);
        }
    };

    return (
        <>
            {openSpImage && <SpPreviewImage imagePath={spImage} setOpen={setOpenSpImage} open={openSpImage} />}
            {spList.map((item, index) => (
                <Grid2 size={12} key={index}>
                    <Card
                        variant="outlined"
                        sx={{
                            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'stretch' : 'center', width: '100%'
                        }}
                    >
                        <Box
                            sx={{
                                px: 1,
                                py: isMobile ? 1.5 : 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: isMobile ? '100%' : 100,
                                gap: 0.5
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                                ตำแหน่งไดอะแกรม
                            </Typography>
                            <Chip
                                size="small"
                                label={`${item.tracking_number ?? '-'}`}
                                color="default"
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    padding: 1,
                                    display: 'flex', justifyContent: 'center',
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex', justifyContent: 'center',
                                padding: isMobile ? theme.spacing(2, 0, 0, 0) : 0
                            }}
                        >
                            <img
                                width={isMobile ? 120 : 151} height={isMobile ? 120 : 'auto'}
                                style={{ objectFit: 'contain' }} src={item.path_file} alt="ไม่มีรูป"
                                onClick={() => {
                                    setOpenSpImage(true);
                                    setSpImage(item.path_file)
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.dcpumpkin.com/images/product/500/default.jpg";
                                }}
                            />
                        </Box>
                        <CardContent sx={{ width: '100%' }}>
                            <Stack
                                direction={isMobile ? 'column' : 'row'}
                                justifyContent='space-between'
                                alignItems={isMobile ? 'flex-start' : 'center'}
                                spacing={isMobile ? 2 : 0}
                            >
                                <Stack direction='column'>
                                    <Typography
                                        fontWeight='bold'
                                        gutterBottom
                                        variant={isMobile ? "body1" : "h5"}
                                        component="div"
                                    >
                                        {item.spcode}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {item.spname}
                                    </Typography>

                                    {
                                        isNaN(parseFloat(item.price_per_unit)) ? (
                                            <Typography variant="body2" sx={{ color: 'red' }}>
                                                ไม่สามารถเพิ่มใส่ตะกร้าได้ เนื่องจากไม่พบราคา
                                            </Typography>
                                        ) : (
                                            <Stack direction='row' spacing={2} alignItems='center' paddingTop={1}>
                                                <Typography color='green' fontSize={14} fontWeight={'bold'}>
                                                    <span style={{ color: 'black' }}>ราคาทุน:</span>  ฿{parseFloat(item.price_per_unit).toFixed(2) ?? 0}
                                                </Typography>
                                                <Typography color='gray' fontSize={14} fontWeight={'bold'}>
                                                    <span>ราคาขาย: เร็วๆนี้</span>
                                                </Typography>
                                                <Typography color='green' fontSize={14} fontWeight={'bold'}>
                                                    <span style={{ color: 'black' }}>ราคาตั้ง:</span> ฿{parseFloat(item.stdprice_per_unit).toFixed(2) ?? 0}
                                                </Typography>
                                            </Stack>
                                        )
                                    }
                                </Stack>
                                <Box sx={{ width: isMobile ? '100%' : 'auto' }}>
                                    {item.added ? (
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            justifyContent={isMobile ? 'center' : 'flex-end'}
                                            spacing={1}
                                        >
                                            <IconButton
                                                size="small"
                                                disabled={loadingMap[item.spcode]}
                                                onClick={() => handleQtyChange(item, 'remove')}
                                                color={item.cartQty <= 1 ? 'error' : 'default'}
                                            >
                                                {item.cartQty <= 1 ? <DeleteIcon fontSize="small" /> : <RemoveIcon fontSize="small" />}
                                            </IconButton>
                                            <Typography fontWeight="bold" minWidth={24} textAlign="center">
                                                {item.cartQty ?? 1}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                disabled={loadingMap[item.spcode]}
                                                onClick={() => handleQtyChange(item, 'add')}
                                                color="primary"
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    ) : (
                                        !isNaN(parseFloat(item.price_per_unit)) &&
                                        <Button
                                            disabled={isNaN(parseFloat(item.price_per_unit)) || loadingMap[item.spcode]}
                                            variant='contained'
                                            size="small"
                                            color='primary'
                                            fullWidth={isMobile}
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            {loadingMap[item.spcode] ? 'กำลังเพิ่ม...' : 'เพิ่มลงในตะกร้า'}
                                        </Button>
                                    )}
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid2>
            ))}
        </>
    );
}
