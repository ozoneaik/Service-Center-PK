// import {
//     Box, Button, Card, CardActionArea, CardContent,
//     Dialog, DialogContent, Divider, Stack, Typography
// } from "@mui/material";
// import {useState} from "react";


// export function SelectSku({open, setOpen, onSelect, sku_list}) {
//     const [selectedCard, setSelectedCard] = useState();
//     const [selectedItem, setSelectedItem] = useState();

//     const handleSelect = (index, sku) => {
//         setSelectedItem(sku)
//         setSelectedCard(index);
//     }

//     const handleSelectConfirm = () => {
//         onSelect(selectedItem);
//         setOpen(false);
//     }
//     return (
//         <Dialog fullWidth open={open} onClose={() => setOpen(false)}>
//             <DialogContent>
//                 <Typography variant='h6' fontWeight='bold' mb={2}>เลือกสินค้าที่ต้องการซ่อม</Typography>
//                 <Stack direction={{sm: 'column', md: 'row'}} spacing={2} mb={3}>
//                     {sku_list && sku_list.length > 0 && sku_list.map((sku, index) => {
//                             const pImage = import.meta.env.VITE_IMAGE_PID + sku.pid + '.jpg';
//                             return (
//                                 <Card key={index} variant='outlined'>
//                                     <CardActionArea
//                                         data-active={selectedCard === index ? '' : undefined}
//                                         sx={{
//                                             height: '100%',
//                                             '&[data-active]': {
//                                                 backgroundColor: 'green',
//                                             },
//                                         }}
//                                         onClick={() => handleSelect(index, sku)}
//                                     >
//                                         <CardContent>
//                                             <Stack direction='column' spacing={2}>
//                                                 <Box width='100%'>
//                                                     <img src={pImage} width={200} alt=""/>
//                                                 </Box>
//                                                 <Divider/>
//                                                 <Typography>{sku.pid}</Typography>
//                                                 <Typography>{sku.pname}</Typography>
//                                             </Stack>
//                                         </CardContent>
//                                     </CardActionArea>
//                                 </Card>
//                             )
//                         }
//                     )}
//                 </Stack>
//                 <Stack direction={{sm : 'column', md :'row'}} spacing={2}>
//                     <Button onClick={handleSelectConfirm} fullWidth disabled={!selectedItem} variant='contained'>
//                         เลือก {selectedItem && `รหัสสินค้า ${selectedItem.pid} แล้ว`}
//                     </Button>
//                     <Button fullWidth onClick={()=>setOpen(false)} variant='outlined' color='error'>
//                         ยกเลิก
//                     </Button>
//                 </Stack>

//             </DialogContent>
//         </Dialog>
//     )
// }
//--------------------------------------------------------------------------------------------------------------------
import {
    Box, Button, Card, CardActionArea, CardContent,
    Dialog, DialogContent, Divider, Stack, Typography,
    useTheme 
} from "@mui/material";
import { useState } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 

export function SelectSku({ open, setOpen, onSelect, sku_list }) {
    const theme = useTheme(); // Hook to access the theme colors
    const [selectedCard, setSelectedCard] = useState();
    const [selectedItem, setSelectedItem] = useState();

    const handleSelect = (index, sku) => {
        setSelectedItem(sku);
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
                {/* Title Section */}
                <Typography variant='h5' fontWeight='bold' mb={3} color="primary">
                    🛠️ เลือกสินค้าที่ต้องการซ่อม (Select Product for Repair)
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Product Selection Area */}
                <Stack
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={3}
                    mb={4}
                    justifyContent="center" 
                    alignItems="stretch" 
                >
                    {sku_list && sku_list.length > 0 ? (
                        sku_list.map((sku, index) => {
                            const isSelected = selectedCard === index;
                            const pImage = import.meta.env.VITE_IMAGE_PID + sku.pid + '.jpg';

                            return (
                                <Card
                                    key={index}
                                    variant='outlined'
                                    sx={{
                                        flexGrow: 1,
                                        maxWidth: { xs: '100%', md: '300px' }, 
                                        ... (isSelected && selectedStyle) 
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => handleSelect(index, sku)}
                                    >
                                        <CardContent sx={{ position: 'relative' }}>
                                            {/* Selection Indicator Icon (Top Right) */}
                                            {isSelected && (
                                                <CheckCircleIcon
                                                    color="primary"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        zIndex: 1,
                                                        fontSize: 32 // Larger icon for visibility
                                                    }}
                                                />
                                            )}

                                            <Stack direction='column' spacing={1} alignItems="center">
                                                {/* Product Image */}
                                                <Box width={200} height={200} display="flex" justifyContent="center" alignItems="center" overflow="hidden">
                                                    {/* Added objectFit/aspectRatio for better image handling */}
                                                    <img
                                                        src={pImage}
                                                        alt={sku.pname}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain' // Ensures the image fits without cropping
                                                        }}
                                                        onError={(e) => {
                                                            // ตั้งค่ารูปภาพ default เมื่อโหลดรูปภาพหลักไม่ได้
                                                            e.target.src = import.meta.env.VITE_IMAGE_DEFAULT;
                                                        }}
                                                    />
                                                </Box>

                                                <Divider flexItem sx={{ width: '80%', my: 1 }} />

                                                {/* Product Details */}
                                                <Typography
                                                    variant='subtitle1'
                                                    fontWeight='medium'
                                                    align="center"
                                                    // ใช้ CSS เพื่อจำกัดข้อความเป็น 2 บรรทัด และเพิ่มจุดไข่ปลา
                                                    sx={{
                                                        overflow: 'hidden',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2, // จำกัดให้แสดงสูงสุด 2 บรรทัด
                                                        WebkitBoxOrient: 'vertical',
                                                        // ตั้งค่าความสูงของ container เพื่อรองรับ 2 บรรทัด
                                                        lineHeight: 1.5,
                                                        maxHeight: '3em', // 1.5 * 2 = 3em
                                                        minHeight: '3em', // กำหนดความสูงขั้นต่ำเพื่อให้การ์ดมีความสูงเท่ากัน
                                                        mb: 1
                                                    }}
                                                    title={sku.pname} // เพิ่ม title เพื่อให้ผู้ใช้ hover แล้วเห็นชื่อเต็ม
                                                >
                                                    {sku.pname}
                                                </Typography>
                                                <Typography variant='caption' color="text.secondary" align="center">
                                                    รหัสสินค้า: **{sku.pid}**
                                                </Typography>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            )
                        })
                    ) : (
                        <Typography variant="body1" color="error">
                            ไม่พบรายการสินค้าที่ต้องการซ่อม (No SKUs found for repair).
                        </Typography>
                    )}
                </Stack>

                <Divider sx={{ mb: 3 }} />

                {/* Action Buttons */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                >
                    <Button
                        onClick={handleSelectConfirm}
                        fullWidth
                        disabled={!selectedItem}
                        variant='contained'
                        size="large"
                    >
                        ยืนยันการเลือก **{selectedItem ? sku_list.find(s => s.pid === selectedItem.pid)?.pname : 'สินค้า'}**
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