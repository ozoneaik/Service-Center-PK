import {Button, Card, CardActions, CardContent, CardMedia, Grid2, Stack, Typography} from "@mui/material";
import {useState} from "react";
import {ListDetailModal} from "@/Pages/HistoryPage/ListDetailModal.jsx";

export const ListSku = ({listSku}) => {
    const [open, setOpen] = useState(false)
    const [list, setList] = useState([]);
    return (
        <>
            {open && <ListDetailModal list={list} open={open} setOpen={setOpen}/>}
            {listSku.map((item, index) => (
                <Grid2 key={index} size={{md: 3, xl: 2, sm: 6}}>
                    <Card>
                        <CardMedia
                            sx={{height: 140, width: '100%'}}
                            image={item.detail.image_sku}
                            title="green iguana"
                        />
                        <CardContent>
                            <Stack direction='column' spacing={1}>
                                <Typography variant="h6">
                                    SN : {item.detail.serial_id}
                                </Typography>
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    รหัสสินค้า : {item.detail.pid}
                                </Typography>
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    ชื่อสินค้า : {item.detail.p_name}
                                </Typography>
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Button onClick={() => {
                                setList(item.list)
                                setOpen(true)
                            }} size="small">ประวัติการซ่อม</Button>
                        </CardActions>
                    </Card>
                </Grid2>
            ))}
        </>
    )
}
