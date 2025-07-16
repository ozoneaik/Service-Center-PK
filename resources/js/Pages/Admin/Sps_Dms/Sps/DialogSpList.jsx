import {useEffect, useState} from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    Grid2, Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, Typography
} from "@mui/material";
import {TableStyle} from "../../../../../css/TableStyle.js";
import IconButton from "@mui/material/IconButton";
import {Add, Delete, Edit} from "@mui/icons-material";

export default function DialogSpList({skuFg, open, setOpen}) {
    const [loading, setLoading] = useState(false)
    const [sps, setSps] = useState([]);
    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true)
            const {data, status} = await axios.get(route('admin.spare-parts.detail', {sku_fg: skuFg}))
            console.log(data, status);
            setSps(data.sps)

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog fullWidth maxWidth='xl' open={open} onClose={() => setOpen(false)}>
            <DialogContent>

                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Typography fontWeight='bold'>รายการอะไหล่ของ {skuFg}</Typography>
                            <Button variant='contained' startIcon={<Add/>}>
                                เพิ่มอะไหล่
                            </Button>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12} sx={{height: 'calc(100vh - 300px)', overflow: 'auto'}}>
                        {loading ? <CircularProgress/> : (
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={TableStyle.TableHead}>รูป</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>รหัสอะไหล่</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>ชื่ออะไหล่</TableCell>
                                        <TableCell sx={TableStyle.TableHead}>หน่วย</TableCell>
                                        <TableCell sx={TableStyle.TableHead} align='center'>จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sps.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <img
                                                    loading='lazy' width={50} height={50}
                                                    src={import.meta.env.VITE_IMAGE_SP + item.skusp + '.jpg'}
                                                    onError={(e) => {
                                                        e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{item.skusp}</TableCell>
                                            <TableCell>{item.skuspname}</TableCell>
                                            <TableCell>{item.skuspunit}</TableCell>
                                            <TableCell align='center'>
                                                <Stack direction='row' justifyContent='center' spacing={2}>
                                                    <IconButton color='warning'>
                                                        <Edit/>
                                                    </IconButton>
                                                    <IconButton color='error'>
                                                        <Delete/>
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Grid2>
                </Grid2>
            </DialogContent>
        </Dialog>
    )
}
