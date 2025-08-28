import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Tabs,
    Tab,
    Box,
    TextField,
} from "@mui/material";

export default function ListClosedConfig() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("ทั้งหมด");
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get("/admin/config/getclosed").then((res) => {
            if (res.data.status) {
                setNotifications(res.data.data);
            }
        });
    }, []);

    const getChipColor = (status) => {
        switch (status) {
            case "ใหม่":
                return "primary";
            case "กำลังทำงาน":
                return "warning";
            case "เสร็จสิ้น":
                return "success";
            case "ปิดการใช้งาน":
                return "default";
            default:
                return "default";
        }
    };

    // ฟิลเตอร์ตาม Tab
    let filteredData =
        filter === "ทั้งหมด"
            ? notifications
            : notifications.filter((n) => n.status === filter);

    // ฟิลเตอร์ตาม Search
    filteredData = filteredData.filter(
        (n) =>
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.message.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Typography
                variant="h5"
                sx={{ mb: 2, width: "100%", textAlign: "center" }}
            >
                รายการแจ้งเตือน
            </Typography>

            {/* Bar Menu + Search */}
            <Box
                sx={{
                    width: "80%",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                {/* Tabs */}
                <Tabs
                    value={filter}
                    onChange={(e, newValue) => setFilter(newValue)}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab value="ทั้งหมด" label="ทั้งหมด" />
                    <Tab value="ใหม่" label="ใหม่" />
                    <Tab value="กำลังทำงาน" label="กำลังทำงาน" />
                    <Tab value="เสร็จสิ้น" label="เสร็จสิ้น" />
                    <Tab value="ปิดการใช้งาน" label="ปิดการใช้งาน" />
                </Tabs>

                {/* Search */}
                <TextField
                    variant="outlined"
                    placeholder="ค้นหา..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Box>

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    width: "80%",
                    margin: "0 auto",
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ลำดับ</TableCell>
                            <TableCell>หัวข้อ</TableCell>
                            <TableCell>รายละเอียด</TableCell>
                            <TableCell>กลุ่ม</TableCell>
                            <TableCell>สถานะ</TableCell>
                            <TableCell>วันที่</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.title}</TableCell>
                                    <TableCell>{item.message}</TableCell>
                                    <TableCell>
                                        {item.groups?.length > 0
                                            ? item.groups.join(", ")
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.status}
                                            color={getChipColor(item.status)}
                                        />
                                    </TableCell>
                                    <TableCell>{item.date}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    ไม่พบข้อมูล
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
