import {Button, Grid2, Stack, Typography,} from "@mui/material";
import {PhotoProvider, PhotoView} from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import {useState} from "react";
import TotalPrice from "@/Pages/ReportRepair/Sp/TotalPrice.jsx";
import SelectSP from "@/Pages/ReportRepair/Sp/SelectSP.jsx";


const imagePath = 'https://images.pumpkin.tools/A%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%20%e0%b9%81%e0%b8%a5%e0%b8%b0%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%e0%b9%84%e0%b8%a3%e0%b9%89%e0%b8%aa%e0%b8%b2%e0%b8%a2/50349/Diagrams_50349-DM01.jpg';


export const AddSp = ({detail, setDetail}) => {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState({
            sp: detail.selected.sp,
            sp_warranty: detail.selected.sp_warranty
        }
    );

    const handelOpen = () => {
        setOpen(true);
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
                </Grid2>
            </Grid2>
        </>
    )
}
