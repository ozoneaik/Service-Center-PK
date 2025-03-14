import {Button, Grid2, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import ModeEditIcon from '@mui/icons-material/ModeEdit';

const TableC = ({detail = [], warranty = false}) => {
    const filteredData = detail.selected.sp?.filter(item =>
        warranty ? (item.warranty === true || item.spcode === 'SV001')
            : (item.warranty !== true && item.spcode !== 'SV001')
    );
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>รหัสอะไหล่</TableCell>
                    <TableCell>ชื่ออะไหล่</TableCell>
                    <TableCell>จำนวน</TableCell>
                    <TableCell>หน่วย</TableCell>
                    <TableCell>warranty</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredData.map((item, index) => {
                    const spPath = import.meta.env.VITE_IMAGE_PATH + `${detail.pid}/` + item.spcode + '.jpg';
                    return (
                        <TableRow key={index}>
                            <TableCell><ImagePreview src={spPath}/></TableCell>
                            <TableCell>{item.spcode}</TableCell>
                            <TableCell>{item.spname}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.sp_unit ?? 'อัน'}</TableCell>
                            <TableCell>{item.warranty ? 'w' : 'n'}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
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
                    อะไหล่ที่อยู่ในรับประกัน
                </Typography>
            </Grid2>
            <Grid2 size={12}>
                <TableC detail={detail} warranty={true}/>
            </Grid2>
            <Grid2 size={12}>
                <Typography fontWeight='bold'>
                    อะไหล่ที่ไม่อยู่ในรับประกัน
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
