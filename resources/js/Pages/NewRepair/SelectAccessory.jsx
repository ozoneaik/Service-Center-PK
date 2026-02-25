import {
    Box, Button, Card, CardActionArea, CardContent,
    Dialog, DialogContent, Divider, Stack, Typography,
    useTheme, Chip
} from "@mui/material";
import { useState } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export function SelectAccessory({ open, setOpen, onSelect, accessoryList }) {
    const theme = useTheme();
    const [selectedCard, setSelectedCard] = useState();
    const [selectedItem, setSelectedItem] = useState();

    const handleSelect = (index, item) => {
        setSelectedItem(item);
        setSelectedCard(index);
    }

    const handleSelectConfirm = () => {
        onSelect(selectedItem);
        setOpen(false);
    }

    const selectedStyle = {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
        boxShadow: theme.shadows[4],
    };

    return (
        <Dialog fullWidth maxWidth="md" open={open} onClose={() => setOpen(false)}>
            <DialogContent>
                <Typography variant='h5' fontWeight='bold' mb={3} color="primary">
                    🔌 เลือกชิ้นส่วนที่ต้องการส่งซ่อม (Select Item for Repair)
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    mb={4}
                    justifyContent="center"
                    alignItems="stretch"
                    flexWrap="wrap"
                    useFlexGap
                >
                    {accessoryList && accessoryList.length > 0 ? (
                        accessoryList.map((item, index) => {
                            const isSelected = selectedCard === index;
                            const pImage = import.meta.env.VITE_IMAGE_PID + item.pid + '.jpg';

                            // กำหนดสีของ Chip ตามประเภท
                            let chipColor = "default";
                            if (item.display_type === 'main') chipColor = "primary";
                            else if (item.display_type === 'battery') chipColor = "success";
                            else if (item.display_type === 'charger') chipColor = "warning";

                            return (
                                <Card
                                    key={index}
                                    variant='outlined'
                                    sx={{
                                        flexGrow: 1,
                                        width: { xs: '100%', md: '280px' },
                                        maxWidth: { xs: '100%', md: '300px' },
                                        ...(isSelected && selectedStyle)
                                    }}
                                >
                                    <CardActionArea onClick={() => handleSelect(index, item)} sx={{ height: '100%' }}>
                                        <CardContent sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {isSelected && (
                                                <CheckCircleIcon
                                                    color="primary"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        zIndex: 1,
                                                        fontSize: 32
                                                    }}
                                                />
                                            )}

                                            <Stack direction='column' spacing={1} alignItems="center" flexGrow={1}>
                                                <Chip
                                                    label={item.display_name}
                                                    color={chipColor}
                                                    size="small"
                                                    sx={{ alignSelf: 'flex-start', mb: 1, fontWeight: 'bold' }}
                                                />

                                                <Box width={150} height={150} display="flex" justifyContent="center" alignItems="center" overflow="hidden">
                                                    <img
                                                        src={pImage}
                                                        alt={item.pname}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                        onError={(e) => {
                                                            e.target.src = import.meta.env.VITE_IMAGE_DEFAULT;
                                                        }}
                                                    />
                                                </Box>

                                                <Divider flexItem sx={{ width: '100%', my: 1 }} />

                                                <Typography
                                                    variant='subtitle2'
                                                    fontWeight='bold'
                                                    align="center"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        lineHeight: 1.5,
                                                        minHeight: '3em',
                                                    }}
                                                    title={item.pname}
                                                >
                                                    {item.pname}
                                                </Typography>

                                                <Typography variant='caption' color="text.secondary" align="center">
                                                    SKU: <b>{item.pid}</b>
                                                </Typography>
                                                <Typography variant='caption' color="primary" align="center">
                                                    S/N: <b>{item.target_serial}</b>
                                                </Typography>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            )
                        })
                    ) : (
                        <Typography variant="body1" color="error">
                            ไม่พบรายการ (No items found).
                        </Typography>
                    )}
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                        onClick={handleSelectConfirm}
                        fullWidth
                        disabled={!selectedItem}
                        variant='contained'
                        size="large"
                    >
                        ยืนยันส่งซ่อม {selectedItem ? selectedItem.display_name : ''}
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setOpen(false)}
                        variant='outlined'
                        color='error'
                        size="large"
                    >
                        ยกเลิก
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}