import {Button, Grid2, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import {useState} from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";

const TableC = ({detail = [], warranty = false}) => {
    const filteredData = detail.selected.sp?.filter(item =>
        warranty ? (item.spcode === 'SV001')
            : (item.spcode !== 'SV001')
    );
    const [currentImage, setCurrentImage] = useState('');
    const [openPreview, setOpenPreview] = useState(false);
    return (
        <Paper sx={{overflow: 'auto'}}>
            {openPreview && <SpPreviewImage open={openPreview} setOpen={setOpenPreview} imagePath={currentImage}/>}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>รหัสอะไหล่</TableCell>
                        <TableCell>ชื่ออะไหล่</TableCell>
                        <TableCell>จำนวน</TableCell>
                        <TableCell>หน่วย</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredData.map((item, index) => {
                        // const spPath2 = `https://images.pumpkin.tools/SKUS/SP/${detail.pid}/${item.spcode}.jpg`;
                        const spPath2 = `https://images.pumpkin.tools/SKUS/SP/new/${item.spcode}.jpg`;
                        const spPath = import.meta.env.VITE_IMAGE_PATH + `${detail.pid}/` + item.spcode + '.jpg';
                        return (
                            <TableRow key={index} sx={
                                item.price_per_unit === '-' ? {backgroundColor: '#fdeded'}
                                    : detail.sp_warranty.find(it => it.spcode === item.spcode) ?
                                        {backgroundColor: '#edf7ed'} : {backgroundColor: 'white'}
                            }>
                                <TableCell width={10} onClick={() => {
                                    setCurrentImage(spPath2);
                                    setOpenPreview(true);
                                }}>
                                    <img src={spPath2} width={50} alt={(e) => {
                                        e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg'
                                    }}/>
                                </TableCell>
                                <TableCell>{item.spcode}
                                </TableCell>
                                <TableCell>{item.spname}</TableCell>
                                <TableCell>{item.qty}</TableCell>
                                <TableCell>{item.sp_unit ?? 'อัน'}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>

    )
}

export default function SpSelected({detail, setShowAdd, showAdd}) {

    const handelChangeShow = () => {
        setShowAdd(true);
    }
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <Typography fontWeight='bold'>
                    บริการ
                </Typography>
            </Grid2>
            <Grid2 size={12}>
                <TableC detail={detail} warranty={true}/>
            </Grid2>
            <Grid2 size={12}>
                <Typography fontWeight='bold'>
                    อะไหล่
                </Typography>
            </Grid2>
            <Grid2 size={12}>
                <TableC detail={detail}/>
            </Grid2>
            <Grid2 size={12}>
                <Stack direction='row-reverse'>
                    <Button
                        disabled={detail.job.status !== 'pending'}
                        onClick={handelChangeShow}
                        variant='contained'
                        startIcon={<ModeEditIcon/>}
                    >
                        แก้ไข
                    </Button>
                </Stack>
            </Grid2>
        </Grid2>

    )
}
