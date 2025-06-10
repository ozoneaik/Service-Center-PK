import {Checkbox, Grid2, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {showDefaultImage} from "@/utils/showImage.js";
import {useState} from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";

export default function RpSpAdd({listSparePart}) {
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    return (
        <Grid2 container spacing={2}>
            {previewImage &&
                <SpPreviewImage open={previewImage} setOpen={setPreviewImage} imagePath={previewSelected}/>}
            <Grid2 size={12} bgcolor='white' maxHeight={400} sx={{overflowY: 'auto'}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={5} sx={{fontWeight: 'bold', fontSize: 20}}>บริการ</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>เลือก</TableCell>
                            <TableCell>รูปภาพ</TableCell>
                            <TableCell>รหัสอะไหล่</TableCell>
                            <TableCell>ชื่ออะไหล่</TableCell>
                            <TableCell>หน่วย</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Checkbox/>
                            </TableCell>
                            <TableCell onClick={() => {
                                setPreviewImage(true);
                                setPreviewSelected('')
                            }}>
                                <img width={50} src={''} onError={showDefaultImage} alt=""/>
                            </TableCell>
                            <TableCell>SV001</TableCell>
                            <TableCell>ค่าบริการ</TableCell>
                            <TableCell>ครั้ง</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Grid2>

            <Grid2 size={12} bgcolor='white' maxHeight={400} sx={{overflowY: 'auto'}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={5} sx={{fontWeight: 'bold', fontSize: 20}}>อะไหล่

                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>เลือก</TableCell>
                            <TableCell>รูปภาพ</TableCell>
                            <TableCell>รหัสอะไหล่</TableCell>
                            <TableCell>ชื่ออะไหล่</TableCell>
                            <TableCell>หน่วย</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listSparePart.map((sp, index) => {
                            const imageSp = import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Checkbox/>
                                    </TableCell>
                                    <TableCell onClick={() => {
                                        setPreviewImage(true);
                                        setPreviewSelected(imageSp)
                                    }}>
                                        <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                                    </TableCell>
                                    <TableCell>{sp.spcode}</TableCell>
                                    <TableCell>{sp.spname}</TableCell>
                                    <TableCell>{sp.spunit}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Grid2>
        </Grid2>
    )
}
