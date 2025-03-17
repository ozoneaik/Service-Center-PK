import LayoutMangeAdmin from "@/Pages/Admin/LayoutMangeAdmin.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Button, Container, Grid2, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, MenuItem, Select, FormControl, InputLabel, Box, Pagination,
    InputAdornment, IconButton, Paper, Typography
} from "@mui/material";
import React, {useState, useEffect} from "react";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import {Head, Link} from "@inertiajs/react";

export default function UserList({list}) {
    // สถานะสำหรับค้นหาและกรอง
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [ownerFilter, setOwnerFilter] = useState("all");

    const [open, setOpen] = useState(false);

    // สถานะสำหรับการแบ่งหน้า
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // สำหรับเก็บข้อมูลที่ผ่านการกรองและค้นหาแล้ว
    const [filteredData, setFilteredData] = useState([]);
    // สำหรับเก็บจำนวนผู้ใช้ทั้งหมดหลังการกรอง
    const [totalUsers, setTotalUsers] = useState(0);

    // ฟังก์ชันสำหรับประมวลผลข้อมูลตามการค้นหาและตัวกรอง
    useEffect(() => {
        // สร้างข้อมูลตามรูปแบบที่ง่ายต่อการกรองและแสดงผล
        let processedData = [];

        list.forEach(shop => {
            // กรองผู้ใช้ตามเงื่อนไขการค้นหาและตัวกรอง
            const filteredUsers = shop.users.filter(user => {
                // กรองตาม search term
                const matchesSearch =
                    shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    shop.is_code_cust_id.toLowerCase().includes(searchTerm.toLowerCase());

                // กรองตามสิทธิ์
                const matchesRole = roleFilter === "all" || user.role === roleFilter;

                // กรองตามสถานะเจ้าของร้าน
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
            shop.users.forEach(user => {
                allUsers.push({
                    ...user,
                    shop_name: shop.shop_name,
                    is_code_cust_id: shop.is_code_cust_id,
                    shopId: shop.id || shop.shop_name // ใช้ ID หรือชื่อร้านเป็น key
                });

                // เก็บข้อมูลการจับคู่ระหว่างผู้ใช้และร้าน
                if (!shopMapping[shop.id || shop.shop_name]) {
                    shopMapping[shop.id || shop.shop_name] = {
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

        return {currentPageUsers, shopMapping};
    };

    const {currentPageUsers, shopMapping} = getCurrentPageData();

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

    return (
        <>
            <AuthenticatedLayout>
                <Head title="จัดการผู้ใช้"/>
                    <Container maxWidth="false">
                        <Paper elevation={3} sx={{p: 3, mt: 3}}>
                            <Typography variant="h5" sx={{mb: 2}}>รายการผู้ใช้งาน</Typography>

                            {/* ส่วนของตัวกรองและค้นหา */}
                            <Box sx={{mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2}}>
                                {/* ช่องค้นหา */}
                                <TextField
                                    label="ค้นหา"
                                    variant="outlined"
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={{minWidth: 200}}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon/>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* ตัวกรองตามสิทธิ์ */}
                                <FormControl variant="outlined" size="small" sx={{minWidth: 150}}>
                                    <InputLabel>สิทธิ์</InputLabel>
                                    <Select
                                        variant='outlined'
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        label="สิทธิ์"
                                    >
                                        <MenuItem value="all">ทั้งหมด</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="user">User</MenuItem>
                                        <MenuItem value="manager">Manager</MenuItem>
                                    </Select>
                                </FormControl>

                                {/* ตัวกรองตามสถานะเจ้าของร้าน */}
                                <FormControl variant="outlined" size="small" sx={{minWidth: 150}}>
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
                                <FormControl variant="outlined" size="small" sx={{minWidth: 150}}>
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

                                <Button variant='contained' component={Link} href='/admin/users-manage/create'>
                                    เพิ่มผู้ใช้
                                </Button>
                            </Box>

                            {/* ส่วนแสดงข้อมูลผู้ใช้ */}
                            <Box sx={{overflowX: 'auto'}}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{backgroundColor: '#f5f5f5'}}>
                                            <TableCell>ชื่อร้าน</TableCell>
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

                                            return (
                                                <TableRow key={`user-${index}`}
                                                          sx={index % 2 ? {backgroundColor: '#fafafa'} : {}}>
                                                    {isFirstUserOfShop && (
                                                        <TableCell rowSpan={rowSpan}>
                                                            <Typography>ชื่อร้าน : <span
                                                                style={{color: '#f15922'}}>{user.shop_name}</span></Typography>
                                                            <br/>
                                                            <Typography>รหัส : <span
                                                                style={{color: '#f15922'}}>{user.is_code_cust_id}</span></Typography>
                                                        </TableCell>
                                                    )}
                                                    <TableCell>{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.role}</TableCell>
                                                    <TableCell>{!user.admin_that_branch ? '❌' : '✅'}</TableCell>
                                                    <TableCell>
                                                        <Button variant='contained' size='small'>แก้ไข</Button>
                                                        &nbsp;
                                                        <Button variant='contained' color='error'
                                                                size='small'>ลบ</Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                        {currentPageUsers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{py: 3}}>
                                                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>

                            {/* ส่วนแสดงการแบ่งหน้า */}
                            <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
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
                            <Box sx={{mt: 2, textAlign: 'right'}}>
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
