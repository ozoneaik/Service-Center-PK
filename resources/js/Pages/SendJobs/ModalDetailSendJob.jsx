import {CircularProgress, Dialog, DialogContent, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {useEffect, useState} from "react";

function ModalDetailSendJob({open, setOpen, job_group}) {
    const [detail, setDetail] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchData().then();
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.get(`/send-job/group-detail/${job_group}`)
            setDetail(data.group);
            console.log(data, status)
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }
    return (
        <Dialog
            fullWidth
            maxWidth='false'
            open={open}
            onClose={() => setOpen(false)}
        >
            <DialogContent>
                {!loading ? (
                    <Table>
                        <TableHead>
                            <TableRow sx={TABLE_HEADER_STYLE}>
                                <TableCell>เลขซีเรียล</TableCell>
                                <TableCell>ข้อมูลสินค้า</TableCell>
                                <TableCell>อัพเดทล่าสุด</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.map((item, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{item.serial_id}</TableCell>
                                        <TableCell>
                                            รหัสสินค้า : {item.pid}
                                            <br/>
                                            ชื่อสินค้า : {item.p_name}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(item.updated_at).toLocaleString('th')}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <CircularProgress/>
                )}

            </DialogContent>
        </Dialog>
    );
}

export default ModalDetailSendJob;


const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};
