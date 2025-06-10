import {Avatar, Card, CardContent, FormGroup, Grid2, Stack, Typography, FormControlLabel, Button} from "@mui/material";
import React,{useEffect, useState} from "react";
import Checkbox from "@mui/material/Checkbox";
import {DocumentScanner} from "@mui/icons-material";

const CardDetail = ({children, headTitle}) => (
    <Card variant='outlined'>
        <CardContent>
            {headTitle && <Typography mb={1} variant='h6' fontWeight='bold'>{headTitle}</Typography>}
            {children}
        </CardContent>
    </Card>
)

export default function RpSummary({detail}) {
    const customer = detail.customer;
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
    }, [])
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <CardDetail headTitle={'ข้อมูลลูกค้า'}>
                    <Stack direction='row' spacing={2} alignItems='center'>
                        <Avatar/>
                        <Stack direction='column' spacing={1}>
                            <Typography fontWeight='bold'>
                                {'ชื่อ : '}
                                <span style={{fontWeight: 'normal'}}>{customer?.name}</span>
                            </Typography>
                            <Typography fontWeight='bold'>
                                {'เบอร์โทร : '}
                                <span style={{fontWeight: 'normal'}}>{customer?.phone}</span>
                            </Typography>
                        </Stack>
                    </Stack>
                </CardDetail>
            </Grid2>
            <Grid2 size={{md : 6, xs : 12}}>
                <CardDetail headTitle='รูปภาพ/วิดีโอสำหรับเคลมสินค้า'>

                </CardDetail>
            </Grid2>
            <Grid2 size={{md : 6, xs : 12}}>
                <CardDetail headTitle='รูปภาพ/วิดีโอสำหรับร้านค้าใช้ภายใน'>

                </CardDetail>
            </Grid2>
            <Grid2 size={12}>
                <CardDetail headTitle='อาการ / สาเหตุ'>
                    <Stack direction='row'>
                        {[1,2,3].map((item,index) => (
                            <React.Fragment key={index}>
                                <Typography variant='body1' >test</Typography>
                                <Typography variant='body1' >&nbsp;/&nbsp;</Typography>
                            </React.Fragment>
                        ))}
                    </Stack>
                </CardDetail>
            </Grid2>
            <Grid2 size={{md : 6, sm : 12}}>
                <CardDetail headTitle='หมายเหตุสำหรับลูกค้า'>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox checked={customer?.subremark1} disabled/> } label="เสนอราคาก่อนซ่อม" />
                        <FormControlLabel control={<Checkbox checked={customer?.subremark2} disabled/>} label="ซ่อมเสร็จส่งกลับทางไปรษณีย์" />
                    </FormGroup>
                    <Typography>- การรับประกันไม่รวม ความเสียหายที่เกิดจากการใช้งานและเก็บรักษา ตามเงื่อนไขบนใบรับประกัน</Typography>
                </CardDetail>
            </Grid2>
            <Grid2 size={{md : 6, sm : 12}}>
                <CardDetail headTitle='หมายเหตุสำหรับสื่อสารภายใน'>
                    <Typography>- การรับประกันไม่รวม ความเสียหายที่เกิดจากการใช้งานและเก็บรักษา ตามเงื่อนไขบนใบรับประกัน</Typography>
                </CardDetail>
            </Grid2>
            <Grid2 size={12}>
                <CardDetail headTitle='เอกสาร'>
                    <Stack direction='row' spacing={2}>
                        <Button startIcon={<DocumentScanner/>} variant='contained'>รับสินค้า</Button>
                        <Button startIcon={<DocumentScanner/>} variant='contained'>รับสินค้า</Button>
                    </Stack>
                </CardDetail>
            </Grid2>
            <Grid2 size={12}>
                <Stack direction='row' spacing={2} justifyContent='end'>
                    <Button startIcon={<DocumentScanner/>} variant='contained' color='error'>ยกเลิกงานรซ่อม</Button>
                    <Button startIcon={<DocumentScanner/>} variant='contained' color='success'>ปิดงานซ่อม</Button>
                </Stack>
            </Grid2>

        </Grid2>
    )
}
