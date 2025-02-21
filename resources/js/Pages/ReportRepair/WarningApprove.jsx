import {Alert, Chip, Grid2, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';


export const WarningApprove = ({detail, setDetail}) => {
    const spPath = import.meta.env.VITE_IMAGE_PATH + detail.pid;
    const sp = detail.selected.sp;
    const spTargetZero = sp.filter(item => parseFloat(item.price_multiple_gp) === 0 && detail.job.warranty === true);
    const files = detail.selected.fileUpload;
    const claimedPartsImage = files.find(item => item.id === 3);
    const foundFile = claimedPartsImage.list.length > 0;


    const TableList = () => (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>รูปภาพ</TableCell>
                    <TableCell>รหัสอะไหล่</TableCell>
                    <TableCell>ชื่ออะไหล่</TableCell>
                    <TableCell>ราคาอะไหล่</TableCell>
                    <TableCell>สถานะอนุมัติ</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {spTargetZero.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell><ImagePreview src={spPath + '/' + item.spcode + '.jpg'}/></TableCell>
                        <TableCell>{item.spcode}</TableCell>
                        <TableCell>{item.spname}</TableCell>
                        <TableCell>{item.price_multiple_gp}</TableCell>
                        <TableCell>
                            <Chip label={item.approve_status}/>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <Grid2 container>
                    <Grid2 size={12}>
                        <Alert
                            icon={foundFile ? <CheckIcon fontSize="inherit"/> : <InfoIcon fontSize="inherit"/>}
                            severity={foundFile ? 'success' : 'warning'}>
                            {foundFile ? 'ภาพอะไหล่ที่เสียส่งเคลม อัปโหลดแล้ว' : 'จำเป็นต้องอัปโหลดภาพอะไหล่ที่เสียส่งเคลม'}
                        </Alert>
                    </Grid2>
                </Grid2>
            </Grid2>
            <Grid2 size={12}>
                <Grid2 container>
                    <Grid2 size={12}>
                        {spTargetZero.length > 0 &&
                            <Alert
                                icon={<InfoIcon fontSize="inherit"/>}
                                severity='warning'>
                                {spTargetZero.length > 0 ? 'ตรวจพบราคาอะไหล่ที่ไม่อยู่ในการเคลมเป็น 0 ติดต่อเจ้าหน้าที่' : 'จำเป็นต้องอัปโหลดภาพอะไหล่ที่เสียส่งเคลม'}
                            </Alert>
                        }
                    </Grid2>
                    {spTargetZero.length > 0 && <Grid2 size={12}><TableList/></Grid2>}
                </Grid2>
            </Grid2>

        </Grid2>
    )
}
