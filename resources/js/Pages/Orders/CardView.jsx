import {Button, Card, CardActions, CardContent, CardMedia, Grid2, Stack, Typography} from "@mui/material";

export default function CardView({spList}){
    return (
        <>
            {spList.map((item, index) => (
                <Grid2 size={{md: 6, lg: 4, xl: 3, xs: 12}} key={index}>
                    <Card variant="outlined">
                        <CardMedia
                            component="img"
                            height="140"
                            image={item.pathfile_sp + item.skufg + '/' + item.namefile_sp}
                            alt="ไม่มีรูป"
                        />
                        <CardContent>
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
                                </div>
                                <div>
                                    <Typography variant="h6" color='green'>
                                        ฿{item.price ?? 0}
                                    </Typography>
                                </div>
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Stack mt={3} direction='row' spacing={2}>
                                <Button size="small" color="primary">
                                    + เพิ่มลงในตะกร้า
                                </Button>
                                {/*<Button disabled color='inherit'>เพิ่มในตะกร้าแล้ว</Button>*/}
                            </Stack>

                        </CardActions>
                    </Card>

                </Grid2>
            ))}
        </>
    )
}
