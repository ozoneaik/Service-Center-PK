import {
    Box, Card, CardContent, Stack, useMediaQuery, Typography,
    Table, TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import {showDefaultImage} from "@/utils/showImage.js";
import {useState} from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import {green} from "@mui/material/colors";


export default function RpsSparePart({spare_parts,JOB}) {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');

    const handleSelectImage = (path) => {
        setPreviewSelected(path);
        setPreviewImage(true);
    }

    const calculateTotalPrice = (price, qty) => {
        const floatPrice = parseFloat(price);
        const floatQty = parseFloat(qty);
        return floatPrice * floatQty;
    }
    return (
        <Box sx={{maxHeight: 400, overflow: 'auto'}}>
            {previewImage &&
                <SpPreviewImage open={previewImage} setOpen={setPreviewImage} imagePath={previewSelected}/>}

            {isMobile ? (
                <Stack spacing={1}>
                    {spare_parts?.map((sp, index) => {
                        const imageSp = import.meta.env.VITE_IMAGE_SP_NEW + sp.spcode + '.jpg';
                        const greenHighlight = (sp.warranty === 'Y' && JOB.warranty) ? '#e8f5e8' : 'white';
                        return (
                            <Card key={index} variant='outlined' sx={{backgroundColor : greenHighlight}}>
                                <CardContent>
                                    <Stack spacing={1}>
                                        <img
                                            width={80} src={imageSp}
                                            onClick={() => handleSelectImage(imageSp)}
                                            onError={showDefaultImage} alt=""
                                        />
                                        <Typography>
                                            ชื่อ/รหัสอะไหล่ : {sp.spname} {sp.spcode}
                                        </Typography>
                                        <Typography>
                                            จำนวน : {sp.qty}
                                        </Typography>
                                        <Typography>
                                            ราคาต่อหน่วย : {sp.price_multiple_gp} ต่อ 1 {sp.spunit}
                                        </Typography>
                                        <Typography>
                                            ราคารวม : {calculateTotalPrice(sp.price_multiple_gp, sp.qty)}
                                        </Typography>
                                        {sp.claim_remark && (
                                            <>
                                                ประเภทการเคลม : {sp.claim_remark}
                                                <br/>
                                                หมายเหตุการเคม : {sp.remark}
                                            </>
                                        )}
                                        {sp.remark_noclaim !== 'เคลมปกติ' && sp.remark_noclaim && (
                                            <>
                                                เหตุผลของการไม่เคลม : {sp.remark_noclaim}
                                            </>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )
                    })}
                </Stack>
            ) : (
                <Box>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>รูปภาพ</TableCell>
                                <TableCell>รหัส/ชื่ออะไหล่</TableCell>
                                <TableCell>หน่วย</TableCell>
                                <TableCell>ราคาต่อหน่วย</TableCell>
                                <TableCell>จำนวน</TableCell>
                                <TableCell>ราคารวม</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {spare_parts?.map((sp, index) => {
                                const imageSp = import.meta.env.VITE_IMAGE_SP_NEW + sp.spcode + '.jpg';
                                const greenHighlight = (sp.warranty === 'Y' && JOB.warranty) ? '#e8f5e8' : 'white';
                                return (
                                    <TableRow key={index} sx={{backgroundColor : greenHighlight}}>
                                        <TableCell onClick={() => handleSelectImage(imageSp)}>
                                            <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                                        </TableCell>
                                        <TableCell>
                                            {sp.spcode} {sp.spname}
                                            <br/>
                                            {sp.claim_remark && (
                                                <>
                                                    ประเภทการเคลม : {sp.claim_remark}
                                                    <br/>
                                                    หมายเหตุการเคม : {sp.remark}
                                                </>
                                            )}
                                            {sp.remark_noclaim !== 'เคลมปกติ' && sp.remark_noclaim && (
                                                <>
                                                    เหตุผลของการไม่เคลม : {sp.remark_noclaim}
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell>{sp.spunit}</TableCell>
                                        <TableCell>{sp.price_multiple_gp}</TableCell>
                                        <TableCell>{sp.qty}</TableCell>
                                        <TableCell>{calculateTotalPrice(sp.price_multiple_gp, sp.qty)}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Box>
            )}


        </Box>
    )
}
