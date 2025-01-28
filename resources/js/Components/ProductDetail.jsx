import { Card, Grid2, Stack, Typography } from "@mui/material";


export default function ProductDetail({ serial = 'ไม่พบ', imagesku, pname = 'ไม่พบ', pid = 'ไม่พบ' }) {
    const Detail = ({ value, title }) => (
        <Typography variant="subtitle1" sx={{ color: '#f55721' }}>
            {title} : <span style={{ color: 'black' }}>{value}</span>
        </Typography>
    )
    return (
        <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 3 }}></Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
                <img src={imagesku || 'https://images.dcpumpkin.com/images/product/500/50277.jpg'} alt="" width='100%' />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
                <Stack direction='column' spacing={2} >
                    <Typography variant="h4" fontWeight='bold'>รายละเอียด</Typography>
                    <Detail title={'หมายเลขซีเรียล'} value={serial} />
                    <Detail title={'รหัสสินค้า'} value={pid} />
                    <Detail title={'ชื่อสินค้า'} value={pname} />
                    <Detail title={'วันที่ลงทะเบียนรับประกัน'} value={serial} />
                    <Detail title={'วันที่หมดอายุรับประกัน'} value={serial} />
                    <Detail title={'สถานะรับประกัน'} value={serial} />
                    <Detail title={'เงื่อนไขการรับประกันสินค้า'} value={serial} />
                </Stack>
            </Grid2>
        </Grid2>
    )
}
