import {
    Box, Button, Card, CardActionArea, CardContent,
    Dialog, DialogContent, Divider, Stack, Typography
} from "@mui/material";
import {useState} from "react";


export function SelectSku({open, setOpen, onSelect, sku_list}) {
    const [selectedCard, setSelectedCard] = useState();
    const [selectedItem, setSelectedItem] = useState();

    const handleSelect = (index, sku) => {
        setSelectedItem(sku)
        setSelectedCard(index);
    }

    const handleSelectConfirm = () => {
        onSelect(selectedItem);
        setOpen(false);
    }
    return (
        <Dialog fullWidth open={open} onClose={() => setOpen(false)}>
            <DialogContent>
                <Typography variant='h6' fontWeight='bold' mb={2}>เลือกสินค้าที่ต้องการซ่อม</Typography>
                <Stack direction={{sm: 'column', md: 'row'}} spacing={2} mb={3}>
                    {sku_list && sku_list.length > 0 && sku_list.map((sku, index) => {
                            const pImage = import.meta.env.VITE_IMAGE_PID + sku.pid + '.jpg';
                            return (
                                <Card key={index} variant='outlined'>
                                    <CardActionArea
                                        data-active={selectedCard === index ? '' : undefined}
                                        sx={{
                                            height: '100%',
                                            '&[data-active]': {
                                                backgroundColor: 'green',
                                            },
                                        }}
                                        onClick={() => handleSelect(index, sku)}
                                    >
                                        <CardContent>
                                            <Stack direction='column' spacing={2}>
                                                <Box width='100%'>
                                                    <img src={pImage} width={200} alt=""/>
                                                </Box>
                                                <Divider/>
                                                <Typography>{sku.pid}</Typography>
                                                <Typography>{sku.pname}</Typography>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            )
                        }
                    )}
                </Stack>
                <Stack direction={{sm : 'column', md :'row'}} spacing={2}>
                    <Button onClick={handleSelectConfirm} fullWidth disabled={!selectedItem} variant='contained'>
                        เลือก {selectedItem && `รหัสสินค้า ${selectedItem.pid} แล้ว`}
                    </Button>
                    <Button fullWidth onClick={()=>setOpen(false)} variant='outlined' color='error'>
                        ยกเลิก
                    </Button>
                </Stack>

            </DialogContent>
        </Dialog>
    )
}
