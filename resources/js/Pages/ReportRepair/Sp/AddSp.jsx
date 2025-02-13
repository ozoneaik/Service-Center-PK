import {Button, Grid2, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,} from "@mui/material";
import {PhotoProvider, PhotoView} from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import {useEffect, useState} from "react";
import TotalPrice from "@/Pages/ReportRepair/Sp/TotalPrice.jsx";
import SelectSP from "@/Pages/ReportRepair/Sp/SelectSP.jsx";
import Checkbox from "@mui/material/Checkbox";
import {ImagePreview} from "@/Components/ImagePreview.jsx";


const imagePath = 'https://images.pumpkin.tools/A%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%20%e0%b9%81%e0%b8%a5%e0%b8%b0%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%e0%b9%84%e0%b8%a3%e0%b9%89%e0%b8%aa%e0%b8%b2%e0%b8%a2/50349/Diagrams_50349-DM01.jpg';


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
                       image
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
    const [open, setOpen] = useState(false)
    const [btnSelected, setBtnSelected] = useState(0);

    useEffect(() => {
        if (detail.selected.sp.length > 0 || detail.selected.sp_warranty.length > 0){
            setBtnSelected(1)
        }
    }, []);

    const [selected, setSelected] = useState({
            sp: detail.selected.sp,
            sp_warranty: detail.selected.sp_warranty
        }
    );
    const handelOpen = () => {setOpen(true)}
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
                <Grid2 size={{xs: 12, lg: 5}} sx={{cursor: 'pointer'}}>
                    <PhotoProvider>
                        <div className="foo">
                            <PhotoView src={imagePath}>
                                <img src={imagePath} alt="" width='100%'/>
                            </PhotoView>
                        </div>
                    </PhotoProvider>
                </Grid2>
                <Grid2 size={{xs: 12, lg: 7}}>
                    {(detail.selected.sp.length > 0 || detail.selected.sp_warranty.length > 0) && btnSelected === 1 ? (
                        <>
                            <Grid2 container spacing={2}>
                                <Typography fontWeight='bold'>อะไหล่ที่อยู่ในรับประกัน</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <TableSummary data={detail.selected.sp}/>
                                </Grid2>
                                <Typography fontWeight='bold'>อะไหล่ที่ไม่อยู่ในรับประกัน</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <TableSummary data={detail.selected.sp_warranty}/>
                                </Grid2>
                            </Grid2>
                            <Stack mt={3} direction='row' justifyContent='end' spacing={2}>
                                <Button onClick={()=>setBtnSelected(0)} variant='contained' color='primary'>
                                    แก้ไข
                                </Button>
                            </Stack>
                        </>
                    ) : (
                        <>
                            <Grid2 container spacing={2}>
                                <Typography fontWeight='bold'>บริการ</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <SelectSP warranty={true} selected={selected} setSelected={setSelected}
                                              list={detail.sp_warranty}/>
                                </Grid2>
                                <Typography fontWeight='bold'>อะไหล่</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <SelectSP selected={selected} setSelected={setSelected} list={detail.sp}/>
                                </Grid2>
                            </Grid2>
                            <Stack mt={3} direction='row' justifyContent='end' spacing={2}>
                                <Button variant='contained' color='secondary'>ยกเลิกบันทึกอะไหล่</Button>
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
