import {Card, Grid2, Stack, Typography} from "@mui/material";


export default function ProductDetail({
                                          serial = 'ไม่พบ',
                                          imagesku,
                                          pname = 'ไม่พบ',
                                          pid = 'ไม่พบ',
                                          warranty = true,
                                          warranty_status = false,
                                          warrantycondition = '',
                                          warrantynote = '',
                                          warrantyperiod = '',
    status_job
                                      }) {
    const Detail = ({value, title, Color = '#f55721'}) => (
        <Typography fontWeight='bold' variant="subtitle1" sx={{color: 'black'}}>
            {title} : <span style={{color: Color, fontWeight: 'normal'}}>{value}</span>
        </Typography>
    )

    const DetailWarranty = ({title, Color = '#f55721', start, to}) => (
        <Typography fontWeight='bold' variant="subtitle1" sx={{color: 'black'}}>
            {title} : <span style={{color: Color, fontWeight: 'normal'}}>{start} <span
            style={{color: 'black'}}>ถึง</span> {to}</span>
        </Typography>
    )
    return (
        <Grid2 container spacing={3} direction={{lg: 'row', xs: 'column-reverse'}}>
            <Grid2 size={{xs: 12, lg: 8}}>
                <Stack direction='column' spacing={2} mb={3}>
                    <Typography variant="subtitle1">รายละเอียด</Typography>
                    <Typography variant='h5' fontWeight='bold'>{pid} {pname}</Typography>
                    <Typography variant='h5' fontWeight='bold'>S/N : {serial}</Typography>
                </Stack>
                <Stack direction='column' spacing={1}>
                    <Detail title={'ระยะเวลารับประกัน (เดือน)'} value={warrantyperiod}/>
                    <Detail title={'เงื่อนไขการรับประกัน'} value={warrantycondition}/>
                    <Detail title={'หมายเหตุรับประกัน'}
                            value={warrantynote}/>
                    {warranty && (
                        <>
                            {/*<DetailWarranty title={'ระยะประกัน'} to={'23-01-2024'} start={'23-01-2025'}/>*/}
                            <Detail title={'สถานะรับประกัน'}
                                    value={warranty_status ? 'อยู่ในประกัน' : 'ไม่อยู่ในประกัน'}
                                    Color={warranty_status ? 'green' : 'red'}/>
                        </>
                    )}
                    {status_job && <Detail title={'สถานะการซ่อม'} value={warrantynote}/>}

                </Stack>

            </Grid2>
            <Grid2 size={{xs: 12, md: 4}}>
                <img src={imagesku || 'https://images.dcpumpkin.com/images/product/500/default.jpg'} alt=""
                     width='100%'/>
            </Grid2>
        </Grid2>
    )
}
