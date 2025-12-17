import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Button, Container, Table, TableBody, TableCell, TableHead, TableRow, Stack,
    TextField, MenuItem, Select, FormControl, InputLabel, Box, Pagination, InputAdornment, Paper, Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Head, Link, usePage } from "@inertiajs/react";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog";
import axios from "axios";

export default function UserList2({ list }) {
    const auth = usePage().props.auth.user;
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [ownerFilter, setOwnerFilter] = useState("all");

    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredData, setFilteredData] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        let processedData = [];

        list.forEach(shop => {
            // สำหรับกลุ่ม Sale: is_code_cust_id จะเป็น 'SALE_USERS_GROUP' 
            const isSaleGroup = shop.is_code_cust_id === 'SALE_USERS_GROUP';

            // กรองผู้ใช้ตามเงื่อนไขการค้นหาและตัวกรอง
            const filteredUsers = shop.users.filter(user => {

                // ปรับปรุงการค้นหา: ถ้าเป็นกลุ่ม Sale ให้ค้นหาแค่ shop_name (ซึ่งคือ 'พนักงานขาย')
                const shopIdentifier = isSaleGroup ? shop.shop_name : (shop.shop_name + ' ' + shop.is_code_cust_id);

                const matchesSearch =
                    shopIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.user_code.toLowerCase().includes(searchTerm.toLowerCase()) || // เพิ่ม user_code เข้ามา
                    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

                // กรองตามสิทธิ์
                const matchesRole = roleFilter === "all" || user.role === roleFilter;

                // กรองตามสถานะเจ้าของร้าน
                // สำหรับ Sale: admin_that_branch จะเป็น false เสมอ แต่ต้องมั่นใจว่าไม่มีการกรอง 'owner' ถ้า user.role คือ 'sale'
                const matchesOwner =
                    ownerFilter === "all" ||
                    (ownerFilter === "owner" && user.admin_that_branch) ||
                    (ownerFilter === "not-owner" && !user.admin_that_branch);

                return matchesSearch && matchesRole && matchesOwner;
            });

            // เพิ่มข้อมูลร้านเฉพาะเมื่อมีผู้ใช้ที่ตรงตามเงื่อนไข
            if (filteredUsers.length > 0) {
                processedData.push({
                    ...shop,
                    users: filteredUsers
                });
            }
        });

        // คำนวณจำนวนผู้ใช้ทั้งหมดหลังการกรอง
        let totalFilteredUsers = 0;
        processedData.forEach(shop => {
            totalFilteredUsers += shop.users.length;
        });

        setTotalUsers(totalFilteredUsers);
        setFilteredData(processedData);
    }, [list, searchTerm, roleFilter, ownerFilter]);

    // ข้อมูลสำหรับแสดงในหน้าปัจจุบัน
    const getCurrentPageData = () => {
        let allUsers = [];
        let shopMapping = {};

        // แปลงข้อมูลให้เป็นรูปแบบที่ง่ายต่อการแบ่งหน้า
        filteredData.forEach(shop => {
            // กำหนด shopId ที่แน่นอนสำหรับกลุ่ม Sale
            const shopIdentifier = shop.is_code_cust_id === 'SALE_USERS_GROUP' ? 'SALE_USERS_GROUP' : shop.is_code_cust_id;

            shop.users.forEach(user => {
                allUsers.push({
                    ...user,
                    shop_name: shop.shop_name,
                    is_code_cust_id: shop.is_code_cust_id,
                    shopId: shopIdentifier
                });

                // เก็บข้อมูลการจับคู่ระหว่างผู้ใช้และร้าน
                if (!shopMapping[shopIdentifier]) {
                    shopMapping[shopIdentifier] = {
                        shop_name: shop.shop_name,
                        is_code_cust_id: shop.is_code_cust_id,
                        userCount: shop.users.length
                    };
                }
            });
        });

        // คำนวณข้อมูลสำหรับหน้าปัจจุบัน
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const currentPageUsers = allUsers.slice(startIndex, endIndex);

        return { currentPageUsers, shopMapping };
    };

    const { currentPageUsers, shopMapping } = getCurrentPageData();

    // จัดการการเปลี่ยนหน้า
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // หาจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(totalUsers / rowsPerPage);

    // จัดการการเปลี่ยนแปลงจำนวนแถวต่อหน้า
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1); // รีเซ็ตกลับไปหน้าแรก
    };

    const handleDeleteUser = (userSel) => {
        AlertDialogQuestion({
            text: `กดตกลงเพื่อลบผู้ใช้ ${userSel.name}`,
            onPassed: async (confirm) => confirm && await deleteUser(userSel)
        });
    }

    const deleteUser = async (userSel) => {
        let message = '';
        let Status = '';
        try {
            const { data, status } = await axios.delete(`/admin/users-manage/delete/${userSel.user_code}`);
            Status = status;
            message = data.message;
        } catch (error) {
            Status = error.response.status;
            message = error.response.data.message;
        } finally {
            AlertDialog({
                icon: Status === 200 ? 'success' : 'error',
                title: Status === 200 ? 'สำเร็จ' : 'เกิดข้อผิดพลาด',
                text: message,
                onPassed: () => Status === 200 && window.location.reload()
            });
        }
    }

    return (
        <>
            <AuthenticatedLayout>
                <Head title="จัดการผู้ใช้" />
                <Container maxWidth="false">
                    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>รายการผู้ใช้งาน</Typography>
                        {/* ส่วนของตัวกรองและค้นหา */}
                        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {/* ช่องค้นหา */}
                            <TextField
                                label="ค้นหา"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ minWidth: 200 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* ตัวกรองตามสิทธิ์ */}
                            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>สิทธิ์</InputLabel>
                                <Select
                                    variant='outlined'
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    label="สิทธิ์"
                                >
                                    <MenuItem value="all">ทั้งหมด</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="service">Service</MenuItem> {/* เปลี่ยน 'user' เป็น 'service' */}
                                    <MenuItem value="dealer">Dealer</MenuItem>
                                    {/* <MenuItem value="sale">Sale</MenuItem> 🆕 เพิ่ม Sale */}
                                </Select>
                            </FormControl>

                            {/* ตัวกรองตามสถานะเจ้าของร้าน */}
                            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>สถานะเจ้าของ</InputLabel>
                                <Select
                                    variant='outlined'
                                    value={ownerFilter}
                                    onChange={(e) => setOwnerFilter(e.target.value)}
                                    label="สถานะเจ้าของ"
                                >
                                    <MenuItem value="all">ทั้งหมด</MenuItem>
                                    <MenuItem value="owner">เจ้าของร้าน</MenuItem>
                                    <MenuItem value="not-owner">ไม่ใช่เจ้าของร้าน</MenuItem>
                                </Select>
                            </FormControl>

                            {/* ตัวเลือกจำนวนแถวต่อหน้า */}
                            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>แถวต่อหน้า</InputLabel>
                                <Select
                                    value={rowsPerPage}
                                    onChange={handleChangeRowsPerPage}
                                    label="แถวต่อหน้า"
                                    variant='outlined'>
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                    <MenuItem value={50}>50</MenuItem>
                                </Select>
                            </FormControl>

                            <Button variant='contained' component={Link} href={route('userManage.create')}>
                                เพิ่มผู้ใช้
                            </Button>

                            {/* ปุ่มสำหรับสร้างผู้ใช้ Sale: แก้ไข route name
                            <Button variant='outlined' color="secondary" component={Link} href={route('saleManage.createSale')}>
                                เพิ่มผู้ใช้ (Sale)
                            </Button> */}
                        </Box>

                        {/* ส่วนแสดงข้อมูลผู้ใช้ */}
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell>ชื่อ/รหัส (ร้านค้า/กลุ่ม)</TableCell> {/* เปลี่ยนข้อความหัวตาราง */}
                                        <TableCell>ชื่อผู้ใช้</TableCell>
                                        <TableCell>อีเมล</TableCell>
                                        <TableCell>สิทธิ์</TableCell>
                                        <TableCell>เจ้าของร้าน</TableCell>
                                        <TableCell>จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentPageUsers.map((user, index) => {
                                        // ตรวจสอบว่าควรแสดงข้อมูลร้านหรือไม่
                                        const isFirstUserOfShop = index === 0 ||
                                            currentPageUsers[index - 1]?.shopId !== user.shopId;

                                        // คำนวณจำนวนแถวที่ต้องรวม (rowspan) สำหรับร้านปัจจุบัน
                                        const rowSpan = isFirstUserOfShop ?
                                            currentPageUsers.filter(u => u.shopId === user.shopId &&
                                                currentPageUsers.indexOf(u) >= index &&
                                                currentPageUsers.indexOf(u) < index + rowsPerPage).length : 0;

                                        // ตรวจสอบว่าเป็นกลุ่ม Sale หรือไม่
                                        const isSaleGroup = user.is_code_cust_id === 'SALE_USERS_GROUP';

                                        return (
                                            <TableRow key={`user-${index}`}
                                                sx={index % 2 ? { backgroundColor: '#fafafa' } : {}}>
                                                {isFirstUserOfShop && (
                                                    <TableCell rowSpan={rowSpan}>
                                                        {isSaleGroup ? (
                                                            // แสดงสำหรับกลุ่ม Sale
                                                            <Typography>กลุ่ม : <span
                                                                style={{ color: '#f15922' }}>พนักงานขาย (Sale)</span></Typography>
                                                        ) : (
                                                            // แสดงสำหรับกลุ่มร้านค้าปกติ
                                                            <>
                                                                <Typography>ชื่อร้าน : <span
                                                                    style={{ color: '#f15922' }}>{user.shop_name}</span></Typography>
                                                                <br />
                                                                <Typography>รหัส : <span
                                                                    style={{ color: '#f15922' }}>{user.is_code_cust_id}</span></Typography>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                )}
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell>
                                                    {!user.admin_that_branch ? '❌' : '✅'}
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction='row' spacing={2}>
                                                        {/* <Button
                                                            component={Link}
                                                            href={route('userManage.edit', { user_code: user.user_code })}
                                                            variant='contained' startIcon={<EditIcon />}
                                                        >
                                                            แก้ไข
                                                        </Button> */}
                                                        <Button
                                                            component={Link}
                                                            // จุดที่แก้ไข: ตรวจสอบ user.role เพื่อเลือก Route
                                                            href={user.role === 'sale'
                                                                ? route('saleManage.edit', { user_code: user.user_code })
                                                                : route('userManage.edit', { user_code: user.user_code })}
                                                            variant='contained' startIcon={<EditIcon />}
                                                        >
                                                            แก้ไข
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteUser(user)}
                                                            disabled={auth.id === user.id}
                                                            variant='contained' color='error'
                                                            startIcon={<DeleteIcon />}
                                                        >
                                                            ลบ
                                                        </Button>
                                                    </Stack>

                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {currentPageUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>

                        {/* ส่วนแสดงการแบ่งหน้า */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handleChangePage}
                                color="primary"
                                showFirstButton
                                showLastButton
                            />
                        </Box>

                        {/* แสดงข้อมูลสรุป */}
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                                แสดง {Math.min((page - 1) * rowsPerPage + 1, totalUsers)} - {Math.min(page * rowsPerPage, totalUsers)} จากทั้งหมด {totalUsers} รายการ
                            </Typography>
                        </Box>
                    </Paper>
                </Container>
            </AuthenticatedLayout>
        </>
    )
}