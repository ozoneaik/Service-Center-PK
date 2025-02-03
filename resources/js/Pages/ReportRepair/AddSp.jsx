import {
    Button, DialogTitle,
    Grid2,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Dialog, DialogContent, TextField, useTheme
} from "@mui/material";
import {PhotoProvider, PhotoView} from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import Checkbox from "@mui/material/Checkbox";
import {useState} from "react";
import useMediaQuery from '@mui/material/useMediaQuery';


const imagePath = 'https://images.pumpkin.tools/A%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%20%e0%b9%81%e0%b8%a5%e0%b8%b0%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%e0%b9%84%e0%b8%a3%e0%b9%89%e0%b8%aa%e0%b8%b2%e0%b8%a2/50349/Diagrams_50349-DM01.jpg';
const spPath = 'https://images.dcpumpkin.com/images/product/500/default.jpg';

function SimpleDialog(props) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const {open, setOpen} = props
    return (
        <Dialog fullWidth fullScreen={fullScreen} maxWidth='lg' open={open} onClose={() => setOpen(false)}>
            <DialogTitle fontWeight='bold'>สรุปรายการอะไหล่</DialogTitle>
            <DialogContent>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{fontWeight: 'bold'}}>
                                    <TableCell width={10}>#</TableCell>
                                    <TableCell width={10}>รูปภาพ</TableCell>
                                    <TableCell>รหัสอะไหล่</TableCell>
                                    <TableCell>ชื่ออะไหล่</TableCell>
                                    <TableCell>ราคาต่อหน่วย</TableCell>
                                    <TableCell width={200}>จำนวน</TableCell>
                                    <TableCell>หน่วย</TableCell>
                                    <TableCell>ราคา</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <Checkbox/>
                                    </TableCell>
                                    <TableCell>
                                        <ImageShow src={spPath}/>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>sdfs</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>sdfsd</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>sdfsd</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            <TextField type="number"/>
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>sdfsd</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>sdfsd</Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell colSpan={6} sx={{textAlign : 'end'}}></TableCell>
                                    <TableCell sx={{fontWeight : 'bold'}}>
                                        รวม
                                    </TableCell>
                                    <TableCell sx={{fontWeight : 'bold',color : 'orange' , fontSize:30}}>
                                        100
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='end' spacing={2}>
                            <Button variant='contained' onClick={() => setOpen(false)} color='primary'>ยกเลิก</Button>
                            <Button variant='contained' color='error'>บันทึก</Button>
                        </Stack>
                    </Grid2>
                </Grid2>
            </DialogContent>
        </Dialog>
    )
}

function ImageShow({src}) {
    return (
        <PhotoProvider>
            <div className="foo">
                <PhotoView src={src}>
                    <img src={src} alt="" width='50'/>
                </PhotoView>
            </div>
        </PhotoProvider>
    )
}

export const AddSp = ({detail}) => {
    const [open, setOpen] = useState(false)

    const TableList = ({list}) => (
        <Table>
            <TableHead>
                <TableRow sx={{fontWeight: 'bold'}}>
                    <TableCell width={10}>#</TableCell>
                    <TableCell width={10}>รูปภาพ</TableCell>
                    <TableCell>รหัสอะไหล่</TableCell>
                    <TableCell>ชื่ออะไหล่</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {list && list.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <Checkbox/>
                        </TableCell>
                        <TableCell>
                            <ImageShow src={spPath}/>
                        </TableCell>
                        <TableCell>
                            <Typography>{item.spcode}</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography>{item.spname}</Typography>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )

    return (
        <>
            <SimpleDialog
                open={open}
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
                            <TableList list={detail.sp_warranty}/>
                        </Grid2>
                        <Typography fontWeight='bold'>อะไหล่</Typography>
                        <Grid2 size={12} sx={{maxHeight: 300, overflowY: 'scroll'}}>
                            <TableList list={detail.sp}/>
                        </Grid2>
                    </Grid2>
                    <Stack mt={3} direction='row' justifyContent='end' spacing={2}>
                        <Button variant='contained' color='secondary'>ยกเลิกบันทึกอะไหล่</Button>
                        <Button onClick={() => setOpen(true)} variant='contained' color='primary'>
                            สรุปอะไหล่ / ตรวจสอบราคา
                        </Button>
                    </Stack>
                </Grid2>
            </Grid2>
        </>
    )
}
