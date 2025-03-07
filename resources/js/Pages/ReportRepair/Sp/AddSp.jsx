import {
    Alert,
    Button, Divider,
    Grid2,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import 'react-photo-view/dist/react-photo-view.css';
import {useEffect, useState} from "react";
import TotalPrice from "@/Pages/ReportRepair/Sp/TotalPrice.jsx";
import SelectSP from "@/Pages/ReportRepair/Sp/SelectSP.jsx";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import Checkbox from "@mui/material/Checkbox";
import PaletteIcon from '@mui/icons-material/Palette';

const TableSummary = ({ pid, data, warranty }) => {
    const filteredData = data?.filter(item =>
        warranty ? (item.warranty === true || item.spcode === 'SV001')
            : (item.warranty !== true && item.spcode !== 'SV001')
    );

    console.log(filteredData)

    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow sx={{ fontWeight: 'bold' }}>
                    <TableCell width={10}>#</TableCell>
                    <TableCell>รหัสอะไหล่</TableCell>
                    <TableCell>ชื่ออะไหล่</TableCell>
                    <TableCell>จำนวน</TableCell>
                    <TableCell>หน่วย</TableCell>
                    {/*<TableCell>warranty</TableCell>*/}
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredData.map((item, index) => {
                    const spPath = import.meta.env.VITE_IMAGE_PATH + `${pid}/` + item.spcode + '.jpg';
                    return (
                        <TableRow key={index}>
                            <TableCell><ImagePreview src={spPath} /></TableCell>
                            <TableCell>{item.spcode}</TableCell>
                            <TableCell>{item.spname}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.sp_unit ?? 'อัน'}</TableCell>
                            {/*<TableCell>{item.warranty ? 'w' : 'n'}</TableCell>*/}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};


const TableService = ({data, setSelected, selected}) => {

    const handelSelected = (e) => {
        const checked = e.target.checked;
        setSelected(prevSelected =>
            checked
                ? {
                    ...prevSelected, sp: [...prevSelected.sp, {
                        spcode: 'SV001',
                        spname: 'SV001',
                        spunit: 'ครั้ง',
                        claim: false,
                        remark: null,
                        price_per_unit: 0,
                        approve: 'yes',
                        approve_status: 'no'
                    }]
                }
                : {
                    ...prevSelected,
                    sp: prevSelected.sp.filter(spItem => spItem.spcode !== 'SV001')
                }
        );
    }
    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow sx={{fontWeight: 'bold'}}>
                    <TableCell width={10}>#</TableCell>
                    <TableCell>รูปภาพ</TableCell>
                    <TableCell>รหัสอะไหล่</TableCell>
                    <TableCell>ชื่ออะไหล่</TableCell>
                    {/*<TableCell>จำนวน</TableCell>*/}
                    {/*<TableCell>หน่วย</TableCell>*/}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>

                    <TableCell>
                        <Checkbox
                            checked={selected.sp.some(l => l.spcode === 'SV001')}
                            onChange={(e) => handelSelected(e)}
                            // checked={selected.sp.some(l => item.spcode === l.spcode)}
                            // disabled={item.price_per_unit === '-'}
                            // onChange={(e) => handleOnChange(item, e)}
                        />
                    </TableCell>
                    <TableCell><ImagePreview
                        src='https://images.dcpumpkin.com/images/product/500/default.jpg'/></TableCell>
                    <TableCell>SV001</TableCell>
                    <TableCell>ค่าบริการ</TableCell>
                    {/*<TableCell>sdfsd</TableCell>*/}
                    {/*<TableCell>sdfsd</TableCell>*/}
                </TableRow>
            </TableBody>
        </Table>
    )
}


export const AddSp = ({detail, setDetail}) => {
    const DIAGRAM_PATH = import.meta.env.VITE_IMAGE_PATH + detail.pid + `/Diagrams_${detail.pid}-DM01.jpg`
    const [open, setOpen] = useState(false)
    const [dmPath, setDmPart] = useState('');
    const [btnSelected, setBtnSelected] = useState(0);
    useEffect(() => {
        if (detail.selected.sp.length > 0 || detail.selected.sp_warranty.length > 0) {
            setBtnSelected(1)
        }
    }, []);
    const pid = detail.pid;
    const [selected, setSelected] = useState({sp: detail.selected.sp});
    const [sp, setSp] = useState(detail.selected.sp.filter((item) => item.warranty === false));
    const [spW, setSpW] = useState(detail.selected.sp.filter((item) => item.warranty === true))
    const handelOpen = () => {
        setOpen(true)
    }

    useEffect(() => {
        testH();
    }, []);

    const testH = async () => {
        try {
            const {data, status} = await axios.get(`/image-dm/${detail.pid}`)
            console.log(data, status)
            setDmPart(data.pathfile_dm + data.namefile_dm);
        } catch (error) {
            console.error(error)
        }
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
                    <ImagePreview src={dmPath} width='100%'/>
                </Grid2>
                <Grid2 size={{xs: 12, lg: 8}}>
                    {/*<Button onClick={() => testH()}>CLick show Log</Button>*/}
                    {(detail.selected.sp.length > 0 || detail.selected.sp_warranty.length > 0) && btnSelected === 1 ?
                        <>
                            <Grid2 container spacing={2}>
                                <Typography fontWeight='bold'>อะไหล่ที่อยู่ในรับประกัน</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <TableSummary pid={detail.pid} warranty={true} data={detail.selected.sp}/>
                                </Grid2>
                                <Typography fontWeight='bold'>อะไหล่ที่ไม่อยู่ในรับประกัน</Typography>
                                <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                                    <TableSummary pid={detail.pid} warranty={false} data={detail.selected.sp}/>
                                </Grid2>
                            </Grid2>
                            <Stack mt={3} direction='row' justifyContent='end' spacing={2}>
                                <Button onClick={() => setBtnSelected(0)} variant='contained' color='primary'>
                                    แก้ไข
                                </Button>
                            </Stack>
                        </>
                        :
                        <>
                            <Grid2 container spacing={2}>
                                <Typography fontWeight='bold'>บริการ</Typography>
                                <Grid2 size={12}>
                                    <TableService data={detail} selected={selected} setSelected={setSelected}/>
                                    <Divider/>
                                </Grid2>
                                <Grid2 size={12}>
                                    <Stack direction='row' spacing={2}>
                                        <Alert sx={{mb: 1}} icon={<PaletteIcon fontSize="inherit"/>} severity="success">
                                            อะไหร่ที่อยู่ในรับประกัน
                                        </Alert>
                                        <Alert icon={<PaletteIcon fontSize="inherit"/>} severity="error">
                                            อะไหร่ที่ไม่พบราคา
                                        </Alert>
                                    </Stack>
                                </Grid2>
                                <Typography fontWeight='bold'>อะไหล่</Typography>
                                <Grid2 size={12} sx={{maxHeight: 500, overflowY: 'scroll'}}>
                                    <SelectSP sp_warranty={detail.sp_warranty} pid={detail.pid} selected={selected}
                                              setSelected={setSelected} list={detail.sp}/>
                                </Grid2>
                            </Grid2>
                            <Stack mt={3} direction='row' justifyContent='end' spacing={2}>
                                <Button variant='contained' color='error'>ยกเลิกบันทึกอะไหล่</Button>
                                <Button onClick={() => handelOpen()} variant='contained' color='primary'>
                                    สรุปอะไหล่ / ตรวจสอบราคา
                                </Button>
                            </Stack>
                        </>
                    }
                </Grid2>

            </Grid2>
        </>
    )
}
