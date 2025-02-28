import {Button, Card, CardContent, CardMedia, Grid2, Stack, Typography} from "@mui/material";

export default function RowView({spList}){
    return (
        <>
            {spList.map((item, index) => (
                <Grid2 size={12} key={index}>
                    <Card variant="outlined" sx={{display: 'flex'}}>
                        <CardMedia
                            component="img"
                            sx={{width: 151}}
                            image={item.pathfile_sp + item.skufg + '/' + item.namefile_sp}
                            alt="ไม่มีรูป"
                        />
                        <CardContent sx={{width: '100%'}}>
                            <Stack direction='row' justifyContent='space-between'
                                   alignItems='center'>
                                <div>
                                    <Typography fontWeight='bold' gutterBottom variant="h5"
                                                component="div">
                                        {item.skusp}
                                    </Typography>
                                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                        {item.skuspname}
                                    </Typography>
                                    <Typography color='green'>
                                        ฿{item.price ?? 0}
                                    </Typography>
                                </div>
                                <Stack direction='column' spacing={2}>
                                    <Button variant='contained' size="small" color="primary">
                                        + เพิ่มลงในตะกร้า
                                    </Button>
                                    {/*<Button disabled color='inherit'>เพิ่มในตะกร้าแล้ว</Button>*/}
                                </Stack>
                            </Stack>

                        </CardContent>

                    </Card>

                </Grid2>
            ))}
        </>
    )
}
