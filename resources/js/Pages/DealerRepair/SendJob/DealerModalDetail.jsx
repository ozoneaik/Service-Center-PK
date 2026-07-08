import {
    Chip, CircularProgress, Dialog, DialogContent,
    Table, TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DealerModalDetail({ open, setOpen, job_group }) {
    const [detail, setDetail] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(route("dealerRepair.send.group.detail", job_group));
            setDetail(data.group);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const statusChip = (status) => {
        if (status === "success") return <Chip label="สำเร็จ" color="success" icon={<CheckCircleIcon fontSize="small" />} size="small" />;
        if (status === "send") return <Chip label="ส่งไปยัง PK" color="warning" icon={<AccessTimeIcon fontSize="small" />} size="small" />;
        if (status === "pending") return <Chip label="รอดำเนินการ" color="info" size="small" />;
        return <Chip label={status} size="small" />;
    };

    return (
        <Dialog fullWidth maxWidth={false} open={open} onClose={() => setOpen(false)}>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow sx={HEADER_STYLE}>
                                <TableCell>เลขซีเรียล</TableCell>
                                <TableCell>เลขที่ JOB ID</TableCell>
                                <TableCell>ข้อมูลสินค้า</TableCell>
                                <TableCell>Ticket / ASS No.</TableCell>
                                <TableCell>สถานะ</TableCell>
                                <TableCell>อัปเดทล่าสุด</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detail.map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell>{item.serial_id}</TableCell>
                                    <TableCell>{item.job_id}</TableCell>
                                    <TableCell>
                                        รหัสสินค้า : {item.pid}<br />
                                        ชื่อสินค้า : {item.p_name}
                                    </TableCell>
                                    <TableCell>
                                        {item.ticket_code
                                            ? <Chip label={item.ticket_code} size="small" color="primary" variant="outlined" />
                                            : "-"}
                                    </TableCell>
                                    <TableCell>{statusChip(item.status)}</TableCell>
                                    <TableCell>{new Date(item.updated_at).toLocaleString("th")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
        </Dialog>
    );
}

const HEADER_STYLE = { backgroundColor: "#c7c7c7", fontWeight: "bold", fontSize: 16 };
