import { Card, Grid2, Stack, Typography } from "@mui/material";
import { showDefaultImage } from "@/utils/showImage.js";

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
    status_job,
    expire_date,
    buy_date,
    warranty_text = null,
    warranty_color = null
}) {
    const Detail = ({ value, title, Color = '#f55721' }) => (
        <Typography fontWeight='bold' variant="subtitle1" sx={{ color: 'black' }}>
            {title} : <span style={{ color: Color, fontWeight: 'normal' }}>{value}</span>
        </Typography>
    )

    const DetailWarranty = ({ title, Color = '#f55721', start, to }) => (
        <Typography fontWeight='bold' variant="subtitle1" sx={{ color: 'black' }}>
            {title} : <span style={{ color: Color, fontWeight: 'normal' }}>{start} <span
                style={{ color: 'black' }}>ถึง</span> {to}</span>
        </Typography>
    )

    //เช๊คสถานะการรับประกันกรณีเป็น false
    const now = new Date();
    let warrantyStatusText = warranty_status ? 'อยู่ในประกัน' : 'ไม่อยู่ในประกัน';
    let warrantyColor = warranty_status ? 'green' : 'red';

    //เดิมเงื่อนไขการแสดงผลสถานะการรับประกัน (วิว)
    // if (!warranty_status) {
    //     if (!buy_date) {
    //         warrantyStatusText = 'ยังไม่ได้ลงทะเบียนรับประกัน';
    //         warrantyColor = 'orange';
    //     } else if (expire_date) {
    //         const expireDate = new Date(expire_date);
    //         if (expireDate < now) {
    //             warrantyStatusText = 'หมดอายุการรับประกัน';
    //             warrantyColor = 'red';
    //         } else {
    //             warrantyStatusText = 'ไม่อยู่ในประกัน';
    //             warrantyColor = 'red';
    //         }
    //     } else {
    //         warrantyStatusText = 'ไม่อยู่ในประกัน';
    //         warrantyColor = 'red';
    //     }
    // }

    // เงื่อนไขการแสดงผลสถานะการรับประกันใหม่ (วิว)
    // if (!warranty_status) {
    //     if (expire_date) {
    //         const expireDate = new Date(expire_date);
    //         if (expireDate < now) {
    //             warrantyStatusText = 'หมดอายุการรับประกัน';
    //             warrantyColor = 'red';
    //         } else {
    //             warrantyStatusText = 'ไม่อยู่ในประกัน';
    //             warrantyColor = 'red';
    //         }
    //     } else if (!buy_date) {
    //         warrantyStatusText = 'ยังไม่ได้ลงทะเบียนรับประกัน';
    //         warrantyColor = 'orange';
    //     } else {
    //         warrantyStatusText = 'ไม่อยู่ในประกัน';
    //         warrantyColor = 'red';
    //     }
    // }

    if (!warranty_status) {
        if (expire_date) {
            const expireDate = new Date(expire_date);
            if (expireDate < now) {
                warrantyStatusText = 'หมดอายุการรับประกัน';
                warrantyColor = 'red';
            } else {
                warrantyStatusText = 'ไม่อยู่ในประกัน';
                warrantyColor = 'red';
            }
        } else if (!buy_date) {
            warrantyStatusText = 'ยังไม่ได้ลงทะเบียนรับประกัน';
            warrantyColor = 'orange';
        } else {
            // เพิ่มเงื่อนไข: มี buy_date แต่ไม่มี expire_date (insurance_expire เป็น null)
            warrantyStatusText = 'รออนุมัติการรับประกัน';
            warrantyColor = '#f39c12'; // สีส้มอมเหลือง หรือใช้ 'orange' ก็ได้ครับ
        }
    }

    return (
        <Grid2 container spacing={3} direction={{ lg: 'row', xs: 'column-reverse' }}>
            <Grid2 size={{ xs: 12, lg: 8 }}>
                <Stack direction='column' spacing={2} mb={3}>
                    <Typography variant="subtitle1">รายละเอียด</Typography>
                    <Typography variant='h5' fontWeight='bold'>{pid} {pname}</Typography>
                    <Typography variant='h5' fontWeight='bold'>S/N : {serial}</Typography>
                </Stack>
                <Stack direction='column' spacing={1}>

                    <Detail title={'ระยะเวลารับประกัน (เดือน)'} value={warrantyperiod} />
                    <Detail title={'เงื่อนไขการรับประกัน'} value={warrantycondition} />
                    <Detail title={'หมายเหตุรับประกัน'}
                        value={warrantynote} />
                    {warranty && (
                        <>
                            {/*<DetailWarranty title={'ระยะประกัน'} to={'23-01-2024'} start={'23-01-2025'}/>*/}
                            {/* <Detail title={'สถานะรับประกัน'}
                                value={warranty_status ? 'อยู่ในประกัน' : 'ไม่อยู่ในประกัน'}
                                Color={warranty_status ? 'green' : 'red'} /> */}

                            {/* <Detail title={'สถานะรับประกัน'}
                                value={warrantyStatusText}
                                Color={warrantyColor}
                            /> */}
                            <Detail
                                title={'สถานะรับประกัน'}
                                value={warranty_text || warrantyStatusText}
                                Color={warranty_color || warrantyColor}
                            />
                        </>
                    )}
                    {status_job && <Detail title={'สถานะการซ่อม'} value={warrantynote} />}
                    {buy_date && (
                        <Detail
                            title={'วันที่ซื้อสินค้า'}
                            value={buy_date}
                        />
                    )}
                    {/* {warrantyStatusText && <Detail title={'วันที่หมดประกัน'} value={expire_date} />} */}
                    {expire_date && <Detail title={'วันที่หมดประกัน'} value={expire_date} />}
                    {/* <Detail title={'วันที่หมดประกัน'} value={expire_date} /> */}
                </Stack>

            </Grid2>
            <Grid2 size={{ xs: 5, md: 4 }}>
                <img style={{ mixBlendMode: 'multiply', maxHeight: '300px' }}
                    src={imagesku || 'https://images.dcpumpkin.com/images/product/500/default.jpg'} onError={showDefaultImage} />
            </Grid2>
        </Grid2>
    )
}