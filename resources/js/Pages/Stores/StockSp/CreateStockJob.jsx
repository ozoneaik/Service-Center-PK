import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Add, Delete, Save, Search } from "@mui/icons-material";
import {
    Box, Button, Container, FormControl, FormControlLabel,
    IconButton, Radio, RadioGroup, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography, useTheme, useMediaQuery, Grid2
} from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle";
import { useRef, useState, useCallback } from "react";
import axios from "axios";
import { AlertDialog } from "@/Components/AlertDialog";

export default function CreateStockJob({ new_job_id, sp_list = [], job_type = 'add' }) {
    // States
    const [spList, setSpList] = useState(sp_list);
    const [jobType, setJobType] = useState(job_type);
    const [searchResult, setSearchResult] = useState(null);
    const [searchQty, setSearchQty] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(null);


    // Refs
    const searchSp = useRef(null);

    // Responsive
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // ค้นหาอะไหล่
    const handleSearchSp = useCallback(async () => {
        const searchValue = searchSp.current?.value?.trim();

        if (!searchValue) {
            AlertDialog({
                title: 'แจ้งเตือน',
                text: 'กรุณากรอกรหัสอะไหล่ที่ต้องการค้นหา'
            });
            return;
        }

        setIsSearching(true);

        try {
            const { data } = await axios.get(route('utils.spare-part.detail', { skusp: searchValue }));
            setSearchResult(data.spare_part);

            // แจ้งเตือนเมื่อพบอะไหล่
            AlertDialog({
                title: 'พบอะไหล่',
                text: `พบอะไหล่: ${data.spare_part.skuspname}`,
                icon: 'success'
            });

        } catch (error) {
            setSearchResult(null);
            AlertDialog({
                title: 'ไม่พบอะไหล่',
                text: error.response?.data?.message || "ไม่พบรหัสอะไหล่นี้ในระบบ",
                icon: 'error'
            });
        } finally {
            setIsSearching(false);
        }
    }, []);

    // เพิ่มรายการ
    const handleAddItem = useCallback(async () => {
        // ตรวจสอบว่าค้นหาอะไหล่แล้วหรือยัง
        if (!searchResult) {
            AlertDialog({
                title: 'แจ้งเตือน',
                text: 'กรุณาค้นหาอะไหล่ก่อนเพิ่มรายการ',
                icon: 'warning'
            });
            return;
        }

        const { data, status } = await axios.get(route('stockSp.countSp', { sp_code: searchSp.current?.value?.trim() }));
        const count_sp = data.sp_count;
        const total_aready = data.total_aready;


        // ตรวจสอบจำนวน
        if (!searchQty || searchQty <= 0) {
            AlertDialog({
                title: 'แจ้งเตือน',
                text: 'กรุณากรอกจำนวนที่ถูกต้อง (มากกว่า 0)',
                icon: 'warning'
            });
            return;
        }

        // ตรวจสอบว่ามีในรายการแล้วหรือยัง
        const existsIndex = spList.findIndex(sp => sp.sp_code === searchResult.skusp);

        if (existsIndex >= 0) {
            // ถ้ามีแล้ว บวกจำนวนเพิ่ม
            const updatedList = [...spList];
            updatedList[existsIndex].sp_qty += Number(searchQty);
            updatedList[existsIndex].count_sp = count_sp;
            updatedList[existsIndex].total_aready = total_aready
            updatedList[existsIndex].total_after_total_if_add = total_aready + updatedList[existsIndex].sp_qty,
                updatedList[existsIndex].total_after_total_if_remove = total_aready - updatedList[existsIndex].sp_qty
            setSpList(updatedList);

            // ⭐ highlight แถวที่อัปเดต
            setHighlightedIndex(existsIndex);
            setTimeout(() => setHighlightedIndex(null), 1000);

        } else {
            // เพิ่มรายการใหม่
            setSpList(prev => [
                ...prev,
                {
                    sp_code: searchResult.skusp,
                    sp_name: searchResult.skuspname,
                    sp_unit: searchResult.skuspunit,
                    sp_qty: Number(searchQty),
                    count_sp: count_sp,
                    total_aready: total_aready,
                    total_after_total_if_add: total_aready + Number(searchQty),
                    total_after_total_if_remove: total_aready - Number(searchQty),
                }
            ]);

            AlertDialog({
                title: 'เพิ่มสำเร็จ',
                text: `เพิ่มรายการ ${searchResult.skuspname} จำนวน ${searchQty} ${searchResult.skuspunit}`,
                icon: 'success'
            });
        }

        // รีเซ็ตฟอร์ม
        clearSearchForm();
    }, [searchResult, searchQty, spList]);

    // รีเซ็ตฟอร์มค้นหา
    const clearSearchForm = useCallback(() => {
        if (searchSp.current) {
            searchSp.current.value = "";
        }
        setSearchResult(null);
        setSearchQty(1);
    }, []);

    // เปลี่ยนประเภท job
    const handleChangeType = useCallback((e) => {
        setJobType(e.target.value);
    }, []);

    // ลบรายการ
    const handleDeleteItem = useCallback((index) => {
        const itemToDelete = spList[index];
        const updated = [...spList];
        updated.splice(index, 1);
        setSpList(updated);

        AlertDialog({
            title: 'ลบสำเร็จ',
            text: `ลบรายการ ${itemToDelete.sp_name} ออกจากรายการแล้ว`,
            icon: 'success'
        });
    }, [spList]);

    // บันทึกข้อมูล
    const handleSave = useCallback(() => {
        if (spList.length === 0) {
            AlertDialog({
                title: 'แจ้งเตือน',
                text: 'กรุณาเพิ่มรายการอะไหล่อย่างน้อย 1 รายการ',
                icon: 'warning'
            });
            return;
        }

        // TODO: ส่งข้อมูลไปบันทึก
        console.log('Data to save:', {
            job_id: new_job_id,
            job_type: jobType,
            items: spList
        });

        AlertDialog({
            title: 'กำลังบันทึก',
            text: 'ระบบกำลังดำเนินการบันทึกข้อมูล',
            icon: 'info'
        });
    }, [spList, jobType, new_job_id]);

    // กด Enter ในช่องค้นหา
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSearchSp();
        }
    }, [handleSearchSp]);

    // กด Enter ในช่องจำนวน
    const handleQtyKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && searchResult) {
            handleAddItem();
        }
    }, [handleAddItem, searchResult]);

    // เช็คว่ามีรายการใดที่สต็อกติดลบหรือไม่
    const hasInvalidStock = spList.some(
        (sp) => jobType === 'remove' && sp.total_after_total_if_remove < 0
    );

    return (
        <AuthenticatedLayout>
            <Head title="สร้าง job" />
            <Container maxWidth="false" sx={{ backgroundColor: 'white', p: isMobile ? 2 : 3 }}>

                {/* Header */}
                <Box display='flex'
                    flexDirection={isMobile ? 'column' : 'row'}
                    justifyContent='space-between'
                    alignItems={isMobile ? 'flex-start' : 'center'}
                    mb={2}
                    gap={isMobile ? 2 : 0}>
                    <Box display='flex'
                        flexDirection={isMobile ? 'column' : 'row'}
                        alignItems={isMobile ? 'flex-start' : 'center'}
                        gap={2}>
                        <Typography fontSize={isMobile ? 18 : 20} fontWeight='bold'>
                            สร้าง #{new_job_id}
                        </Typography>
                        <Typography variant="body2">เลือกประเภทของ job</Typography>
                        <FormControl>
                            <RadioGroup name="select-type" value={jobType} row={!isMobile} onChange={handleChangeType}>
                                <FormControlLabel value="add" control={<Radio />} label="เพิ่ม" />
                                <FormControlLabel value="remove" control={<Radio />} label="ลด" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Box>

                {/* Search Zone */}
                <Box mb={3}>
                    <Grid2 container spacing={2}>
                        {/* รหัสอะไหล่ */}
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth placeholder="รหัสอะไหล่ เช่น SP50277-01"
                                size="small" inputRef={searchSp}
                                onKeyPress={handleKeyPress} disabled={isSearching}
                            />
                        </Grid2>

                        {/* ปุ่มค้นหา */}
                        <Grid2 size={{ xs: 12, md: 2 }}>
                            <Button
                                fullWidth size="small" startIcon={<Search />}
                                variant="outlined" onClick={handleSearchSp}
                                disabled={isSearching}
                            >
                                {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
                            </Button>
                        </Grid2>

                        {/* ชื่ออะไหล่ */}
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth placeholder="ชื่ออะไหล่" size="small"
                                value={searchResult?.skuspname || ""} disabled
                            />
                        </Grid2>

                        {/* หน่วย */}
                        <Grid2 size={{ xs: 6, md: 1 }}>
                            <TextField
                                fullWidth placeholder="หน่วย" size="small"
                                value={searchResult?.skuspunit || ""} disabled
                            />
                        </Grid2>

                        {/* จำนวน */}
                        <Grid2 size={{ xs: 6, md: 1 }}>
                            <TextField
                                fullWidth placeholder="จำนวน" type="number"
                                size="small" value={searchQty}
                                onChange={(e) => setSearchQty(Number(e.target.value))}
                                onKeyPress={handleQtyKeyPress} inputProps={{ min: 1 }}
                            />
                        </Grid2>

                        {/* ปุ่มเพิ่ม */}
                        <Grid2 size={{ xs: 12, md: 2 }}>
                            <Button
                                fullWidth size="small" variant="contained"
                                startIcon={<Add />} onClick={handleAddItem}
                                disabled={!searchResult}
                            >
                                เพิ่มรายการ
                            </Button>
                        </Grid2>
                    </Grid2>
                </Box>

                {/* Table */}
                <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={TableStyle.TableHead}>
                                <TableCell sx={{ minWidth: isMobile ? 120 : 'auto' }}>รหัสอะไหล่</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 200 : 'auto' }}>ชื่ออะไหล่</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>หน่วย</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>จำนวน</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>สต็อกคงเหลือ</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>สต็อกคงเหลือ พร้อมใช้งาน</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>สต็อกหลังปรับ</TableCell>
                                <TableCell align="center" sx={{ minWidth: isMobile ? 80 : 'auto' }}>#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {spList.length > 0 ? (
                                spList.map((sp, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            transition: 'background-color 0.5s ease',
                                            backgroundColor: highlightedIndex === index ? '#f15922' : 'transparent'
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.sp_code}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.sp_name}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.sp_unit}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {jobType !== 'add' ? `-${sp.sp_qty}` : sp.sp_qty}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.count_sp}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                            {sp.total_aready}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem', backgroundColor: sp.total_after_total_if_remove < 0 && jobType === 'remove' && '#f2b8b5' }}>
                                            {jobType === 'add' ? sp.total_after_total_if_add : sp.total_after_total_if_remove}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteItem(index)}
                                                size={isMobile ? "small" : "medium"}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography color="text.secondary">
                                            ไม่พบข้อมูล กรุณาเพิ่มรายการอะไหล่
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>

                {/* Summary */}
                {spList.length > 0 && (
                    <Box mt={2} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            รวมรายการทั้งหมด: {spList.length} รายการ
                        </Typography>
                    </Box>
                )}

                {/* Save button */}
                <Box display='flex' justifyContent='center' mt={3}>
                    <Button
                        disabled={spList.length < 1 || hasInvalidStock}
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        sx={{ minWidth: isMobile ? 150 : 200 }}
                    >
                        บันทึก ({spList.length} รายการ)
                    </Button>
                </Box>
            </Container>
        </AuthenticatedLayout>
    );
}