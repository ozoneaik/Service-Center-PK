import {Box, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {showDefaultImage} from "@/utils/showImage.js";
import {useState} from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";


export default function RpsSparePart({spare_parts}) {

    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');

    const handleSelectImage = (path) => {
        setPreviewSelected(path);
        setPreviewImage(true);
    }

    const calculateTotalPrice = (price,qty) => {
        const floatPrice = parseFloat(price);
        const floatQty = parseFloat(qty);
        return floatPrice * floatQty;
    }
    return (
        <>
            {previewImage && <SpPreviewImage open={previewImage} setOpen={setPreviewImage} imagePath={previewSelected}/>}
            <Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>รูปภาพ</TableCell>
                            <TableCell>รหัสอะไหล่</TableCell>
                            <TableCell>ชื่ออะไหล่</TableCell>
                            <TableCell>ราคาต่อหน่วย</TableCell>
                            <TableCell>จำนวน</TableCell>
                            <TableCell>หน่วย</TableCell>
                            <TableCell>ราคารวม</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {spare_parts?.map((sp, index) => {
                            const imageSp = import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                            return (
                                <TableRow key={index}>
                                    <TableCell onClick={() => handleSelectImage(imageSp)}>
                                        <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                                    </TableCell>
                                    <TableCell>{sp.spcode}</TableCell>
                                    <TableCell>{sp.spname}</TableCell>
                                    <TableCell>{sp.spunit}</TableCell>
                                    <TableCell>{sp.price_per_unit}</TableCell>
                                    <TableCell>{sp.qty}</TableCell>
                                    <TableCell>{calculateTotalPrice(sp.price_per_unit,sp.qty)}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Box>
        </>
    )
}
