import {Card, Grid2, Stack, Typography} from "@mui/material";


export default function ProductDetail({serial = 'ไม่พบ', imagesku, pname = 'ไม่พบ', pid = 'ไม่พบ'}) {
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
        <Grid2 container spacing={3} direction={{lg : 'row', xs : 'column-reverse'}}>
            <Grid2 size={{xs: 12, md: 8}}>
                <Stack direction='column' spacing={2} mb={3}>
                    <Typography variant="subtitle1">รายละเอียด</Typography>
                    <Typography variant='h5' fontWeight='bold'>{pid} {pname}</Typography>
                    <Typography variant='h5' fontWeight='bold'>S/N : {serial}</Typography>
                </Stack>
                <Stack direction='column'  sx={{gap : 0.75}}>
                    <Detail title={'ระยะเวลารับประกัน (เดือน)'} value={12}/>
                    <Detail title={'เงื่อนไขการรับประกัน'} value={'รับประกันเฉพาะมอเตอร์ (ทุ่นและสตอร์เท่านั้น)'}/>
                    <Detail title={'หมายเหตุรับประกัน'} value={'การรับประกันไม่รวม ความเสียหายที่เกิดจากการใช้งานและเก็บรักษา ตามเงื่อนไขบนใบรับประกัน'}/>
                    <DetailWarranty title={'ระยะประกัน'} to={'23-01-2024'} start={'23-01-2025'}/>
                    <Detail title={'สถานะรับประกัน'} value={'อยู่ในประกัน'} Color='green'/>
                </Stack>

            </Grid2>
            <Grid2 size={{xs: 12, md: 4}}>
                <img src={imagesku || 'https://images.dcpumpkin.com/images/product/500/default.jpg'} alt="" width='100%'/>
            </Grid2>
        </Grid2>
    )
}
