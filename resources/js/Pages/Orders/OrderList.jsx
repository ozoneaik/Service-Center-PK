import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Button, Card, CardActions, CardContent, CardMedia, Grid2, Stack, Typography} from "@mui/material";
import {useRef} from "react";


const CardPreview = () => (
    <Card>
        <CardMedia
            sx={{ height: 150 }}
            image="https://images.dcpumpkin.com/images/product/500/50303.jpg"
            title="no preview Image"
        />
        <CardContent>
            <Typography gutterBottom variant="h5" component="div">
                ชื่ออะไหล่
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                รายละเอียดอะไหล่
            </Typography>
        </CardContent>
        <CardActions>
            <Button size="small">จัด</Button>
            <Button size="small">รายละเอียด</Button>
        </CardActions>
    </Card>
)

export default function OrderList(){
    const search = useRef(null);
    return (
        <AuthenticatedLayout>
            <div className={'p-2'}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse' spacing={2}>
                            <input style={{
                                borderRadius: 5,
                                border: '1px black solid',
                                padding: 12,
                                fontSize: 18,
                                width : 500
                            }} ref={search} placeholder='ค้นหาอะไหล่'/>
                        </Stack>
                    </Grid2>
                    {[1, 2, 3, 4, 5, 6,12,32,34,445,65,7,6,5,4,3].map((item, index) => (
                        <Grid2 size={{lg: 2, md: 6}} key={index}>
                            <CardPreview/>
                        </Grid2>
                    ))}
                </Grid2>
            </div>
        </AuthenticatedLayout>
    )
}
