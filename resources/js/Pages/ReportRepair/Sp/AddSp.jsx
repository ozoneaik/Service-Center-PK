import {Button, Grid2, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,} from "@mui/material";
import 'react-photo-view/dist/react-photo-view.css';
import {useEffect, useState} from "react";
import TotalPrice from "@/Pages/ReportRepair/Sp/TotalPrice.jsx";
import SelectSP from "@/Pages/ReportRepair/Sp/SelectSP.jsx";
import DefaultSP from '../../../assets/images/defaultSP.jpg';
import {ImagePreview} from "@/Components/ImagePreview.jsx";

const TableSummary = ({data}) => (
    <Table stickyHeader>
        <TableHead>
            <TableRow sx={{fontWeight: 'bold'}}>
                <TableCell width={10}>#</TableCell>
                <TableCell>รหัสอะไหล่</TableCell>
                <TableCell>ชื่ออะไหล่</TableCell>
                <TableCell>จำนวน</TableCell>
                <TableCell>หน่วย</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {data && data.map((item, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <ImagePreview src={DefaultSP}/>
                    </TableCell>
                    <TableCell>{item.spcode}</TableCell>
                    <TableCell>{item.spname}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.sp_unit ?? 'อัน'} </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)

export const AddSp = ({detail, setDetail}) => {
    const DIAGRAM_PATH=import.meta.env.VITE_IMAGE_PATH+detail.pid+`/Diagrams_${detail.pid}-DM01.jpg`
    const [open, setOpen] = useState(false)
    const [btnSelected, setBtnSelected] = useState(0);
    useEffect(() => {
        if (detail.selected.sp.length > 0 || detail.selected.sp_warranty.length > 0) {setBtnSelected(1)}
    }, []);
    const [selected, setSelected] = useState({sp: detail.selected.sp});
    const [sp, setSp] = useState(detail.selected.sp.filter((item) => item.warranty === false));
    const [spW, setSpW] = useState(detail.selected.sp.filter((item) => item.warranty === true))
    const handelOpen = () => {
        console.log(selected)
        setOpen(true)
    }
    return (
        <>
            <TotalPrice
                detail={detail}
                setDetail={setDetail}
                serial_id={detail.serial}
                open={open}
                selected={selected}
                setSelected={setSelected}
                setOpen={setOpen}
                onClose={() => setOpen(!open)}
                btnSelected={btnSelected}
                setBtnSelected={setBtnSelected}
            />
            <Grid2 container spacing={2}>
                <Grid2 size={{xs: 12, lg: 4}} sx={{cursor: 'pointer'}}>
                    <ImagePreview src={DIAGRAM_PATH} width='100%'/>
                </Grid2>
                <Grid2 size={{xs: 12, lg: 8}}>
                    {(detail.selected.sp.length > 0 || detail.selected.sp_warranty.length > 0) && btnSelected === 1 ? (
                        <>
                            <Grid2 container spacing={2}>
                                <Typography fontWeight='bold'>อะไหล่ที่อยู่ในรับประกัน</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <TableSummary data={spW}/>
                                </Grid2>
                                <Typography fontWeight='bold'>อะไหล่ที่ไม่อยู่ในรับประกัน</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <TableSummary data={sp}/>
                                </Grid2>
                            </Grid2>
                            <Stack mt={3} direction='row' justifyContent='end' spacing={2}>
                                <Button onClick={() => setBtnSelected(0)} variant='contained' color='primary'>
                                    แก้ไข
                                </Button>
                            </Stack>
                        </>
                    ) : (
                        <>
                            <Grid2 container spacing={2}>
                                <Typography fontWeight='bold'>บริการ</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <SelectSP pid={detail.pid} warranty={true} selected={selected} setSelected={setSelected}
                                              list={detail.sp_warranty}/>
                                </Grid2>
                                <Typography fontWeight='bold'>อะไหล่</Typography>
                                <Grid2 size={12} sx={{maxHeight: 500, overflowY: 'scroll'}}>
                                    <SelectSP sp_warranty={detail.sp_warranty} pid={detail.pid} selected={selected} setSelected={setSelected} list={detail.sp}/>
                                </Grid2>
                            </Grid2>
                            <Stack mt={3} direction='row' justifyContent='end' spacing={2}>
                                <Button variant='contained' color='error'>ยกเลิกบันทึกอะไหล่</Button>
                                <Button onClick={() => handelOpen()} variant='contained' color='primary'>
                                    สรุปอะไหล่ / ตรวจสอบราคา
                                </Button>
                            </Stack>
                        </>
                    )}
                </Grid2>

            </Grid2>
        </>
    )
}
