import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Add, ArrowBack, Delete, Save, Search } from "@mui/icons-material";
import {
    Box, Button, Container, FormControl, FormControlLabel,
    IconButton, Radio, RadioGroup, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography, useTheme, useMediaQuery, Grid2,
    Chip
} from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle";
import { useRef, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { AlertDialog } from "@/Components/AlertDialog";

export default function CreateStockJob({ new_job_id, sp_list = [], job_type = 'add', from = 'create' }) {
    // States
    const [spList, setSpList] = useState(sp_list);
    const [jobType, setJobType] = useState(job_type);

    useEffect(() => {
        if (from === "edit" && job_type === "add" && sp_list.length > 0) {

            const fixed = sp_list.map(sp => {
                const qty = Number(sp.sp_qty || 0);
                const available = Number(sp.total_aready || 0);

                return {
                    ...sp,
                    sp_qty: qty,
                    total_after_total_if_add: available + qty,
                    total_after_total_if_remove: available - qty,
                    _editing: false,
                    _draftQty: qty,
                };
            });

            setSpList(fixed);
        }
    }, []);

    const [searchResult, setSearchResult] = useState(null);
    const [searchQty, setSearchQty] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(null);


    // Refs
    const searchSp = useRef(null);

    // Responsive
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));


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

    const handleAddItem = useCallback(async () => {
        if (!searchResult) {
            AlertDialog({
                title: 'แจ้งเตือน',
                text: 'กรุณาค้นหาอะไหล่ก่อนเพิ่มรายการ',
                icon: 'warning'
            });
            return;
        }

        if (!searchQty || searchQty <= 0) {
            AlertDialog({ title: 'แจ้งเตือน', text: 'กรุณากรอกจำนวนที่ถูกต้อง (มากกว่า 0)', icon: 'warning' });
            return;
        }

        let count_sp = 0;
        let total_aready = 0;
        try {
            const { data } = await axios.get(route('stockSp.countSp', {
                sp_code: searchSp.current?.value?.trim(),
                stock_job_id: new_job_id
            }),{
                params : {from : from, searchQty: searchQty}
            });
            count_sp = data.sp_count;
            total_aready = data.total_aready;
        } catch (error) {
            AlertDialog({
                title: 'เกิดผิดพลาด',
                text: error.response?.data?.message || "ไม่สามารถตรวจสอบสต็อกอะไหล่ได้",
            });
            return;
        }

        const existsIndex = spList.findIndex(sp => sp.sp_code === searchResult.skusp);
        if (existsIndex >= 0) {
            // เพิ่มจำนวนในแถวเดิม
            const updatedList = [...spList];
            const nextQty = (Number(updatedList[existsIndex].sp_qty) || 0) + Number(searchQty);
            updatedList[existsIndex].sp_qty = nextQty;
            updatedList[existsIndex].count_sp = count_sp;
            updatedList[existsIndex].total_aready = total_aready;
            updatedList[existsIndex].total_after_total_if_add = total_aready + nextQty;
            updatedList[existsIndex].total_after_total_if_remove = total_aready - nextQty;
            // clear any editing draft
            updatedList[existsIndex]._editing = false;
            updatedList[existsIndex]._draftQty = undefined;
            updatedList[existsIndex]._draft_after_add = undefined;
            updatedList[existsIndex]._draft_after_remove = undefined;

            setSpList(updatedList);
            setHighlightedIndex(existsIndex);
            setTimeout(() => setHighlightedIndex(null), 800);
        } else {
            // เพิ่มแถวใหม่
            setSpList(prev => ([
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
                    // flags for row editing
                    _editing: false,
                    _draftQty: undefined,
                    _draft_after_add: undefined,
                    _draft_after_remove: undefined,
                }
            ]));
            AlertDialog({
                title: 'เพิ่มสำเร็จ',
                text: `เพิ่มรายการ ${searchResult.skuspname} จำนวน ${searchQty} ${searchResult.skuspunit}`,
                icon: 'success'
            });
        }

        clearSearchForm();
    }, [searchResult, searchQty, spList, from, new_job_id]);

    const clearSearchForm = useCallback(() => {
        if (searchSp.current) searchSp.current.value = "";
        setSearchResult(null);
        setSearchQty(1);
    }, []);

    // ==========================
    // Row-level Edit
    // ==========================
    const startEditRow = useCallback((index) => {
        setSpList(prev => {
            const draft = [...prev];
            draft[index] = {
                ...draft[index],
                _editing: true,
                _draftQty: Number(draft[index].sp_qty || 0),
                _draft_after_add: Number(draft[index].total_aready ?? 0) + Number(draft[index].sp_qty || 0),
                _draft_after_remove: Number(draft[index].total_aready ?? 0) - Number(draft[index].sp_qty || 0),
            };
            return draft;
        });
    }, []);

    const handleRowQtyDraftChange = useCallback((index, nextQty) => {
        setSpList(prev => {
            const draft = [...prev];
            const item = { ...draft[index] };
            const qty = Math.max(0, Number(nextQty) || 0);
            const base = Number(item.total_aready ?? 0);
            item._draftQty = qty;
            item._draft_after_add = base + qty;
            item._draft_after_remove = base - qty;
            draft[index] = item;
            return draft;
        });
    }, []);

    const cancelEditRow = useCallback((index) => {
        setSpList(prev => {
            const draft = [...prev];
            draft[index] = {
                ...draft[index],
                _editing: false,
                _draftQty: undefined,
                _draft_after_add: undefined,
                _draft_after_remove: undefined,
            };
            return draft;
        });
    }, []);

    const saveRow = useCallback((index) => {
        setSpList(prev => {
            const draft = [...prev];
            const item = { ...draft[index] };
            const qty = Math.max(0, Number(item._draftQty) || 0);
            const base = Number(item.total_aready ?? 0);

            item.sp_qty = qty;
            item.total_after_total_if_add = base + qty;
            item.total_after_total_if_remove = base - qty;

            item._editing = false;
            item._draftQty = undefined;
            item._draft_after_add = undefined;
            item._draft_after_remove = undefined;

            draft[index] = item;
            return draft;
        });
        AlertDialog({ title: 'บันทึกแล้ว', text: 'อัปเดตจำนวนของรายการนี้เรียบร้อย', icon: 'success' });
    }, []);

    // ==========================
    // Misc
    // ==========================
    const handleChangeType = useCallback((e) => {
        setJobType(e.target.value); // ใช้ได้เฉพาะตอน create; edit จะโชว์ Chip อย่างเดียว
    }, []);

    const handleDeleteItem = useCallback((index) => {
        const itemToDelete = spList[index];
        const updated = [...spList];
        updated.splice(index, 1);
        setSpList(updated);
        AlertDialog({ title: 'ลบสำเร็จ', text: `ลบรายการ ${itemToDelete.sp_name} ออกจากรายการแล้ว`, icon: 'success' });
    }, [spList]);

    const handleSave = () => {
        if (spList.length === 0) {
            AlertDialog({ title: 'แจ้งเตือน', text: 'กรุณาเพิ่มรายการอะไหล่อย่างน้อย 1 รายการ', icon: 'warning' });
            return;
        }
        const dataToSave = {
            job_id: new_job_id,
            job_type: jobType,
            list: spList.map(sp => ({
                sp_code: sp.sp_code,
                sp_name: sp.sp_name,
                sp_unit: sp.sp_unit,
                sp_qty: Number(sp.sp_qty || 0),
                count_sp: Number(sp.count_sp || 0),
                total_aready: Number(sp.total_aready ?? 0),
                total_after_total_if_add: Number(sp.total_after_total_if_add ?? (Number(sp.total_aready ?? 0) + Number(sp.sp_qty || 0))),
                total_after_total_if_remove: Number(sp.total_after_total_if_remove ?? (Number(sp.total_aready ?? 0) - Number(sp.sp_qty || 0))),
            }))
        };
        router.post(route('stockJob.store'), { dataToSave });
    };

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') handleSearchSp();
    }, [handleSearchSp]);

    const handleQtyKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && searchResult) handleAddItem();
    }, [handleAddItem, searchResult]);

    // hasInvalidStock: รองรับทั้งค่าที่ commit แล้ว และ draft ขณะกำลังแก้ไข
    const hasInvalidStock = spList.some(sp => {
        const afterRemove = sp._editing
            ? (sp._draft_after_remove ?? (Number(sp.total_aready ?? 0) - Number(sp._draftQty ?? sp.sp_qty)))
            : Number(sp.total_after_total_if_remove ?? (Number(sp.total_aready ?? 0) - Number(sp.sp_qty || 0)));
        return jobType === 'remove' && afterRemove < 0;
    });

    return (
        <AuthenticatedLayout>
            <Head title={from === 'edit' ? `แก้ไข #${new_job_id}` : `สร้าง #${new_job_id}`} />
            <Container maxWidth="false" sx={{ backgroundColor: 'white', p: isMobile ? 2 : 3 }}>

                {/* Header */}
                <Box display='flex'
                    flexDirection={isMobile ? 'column' : 'row'}
                    justifyContent='space-between'
                    alignItems={isMobile ? 'flex-start' : 'center'}
                    mb={2}
                    gap={isMobile ? 2 : 0}
                >
                    <Box display='flex'
                        flexDirection={isMobile ? 'column' : 'row'} gap={2}
                        alignItems={isMobile ? 'flex-start' : 'center'}
                    >
                        <Button
                            size='small' variant="outlined" color="inherit" startIcon={<ArrowBack />}
                            onClick={() => router.get(route('stockJob.index'))}
                        >
                            กลับไปยังหน้ารายการ job
                        </Button>
                        <Typography fontSize={isMobile ? 18 : 20} fontWeight='bold'>
                            {from === 'edit' ? 'แก้ไข' : 'สร้าง'} #{new_job_id}
                        </Typography>
                        <Typography variant="body2">
                            {from === 'add' && 'เลือก'}ประเภทของ job
                        </Typography>
                        <FormControl>
                            {from === 'edit' ? (
                                <Chip label={jobType === 'add' ? 'เพิ่ม' : 'ลด'} />
                            ) : (
                                <RadioGroup name="select-type" value={jobType} row={!isMobile} onChange={handleChangeType}>
                                    <FormControlLabel value="add" control={<Radio />} label="เพิ่ม" />
                                    <FormControlLabel value="remove" control={<Radio />} label="ลด" />
                                </RadioGroup>
                            )}
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
                                <TableCell sx={{ minWidth: isMobile ? 100 : 140 }}>จำนวน</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>สต็อกคงเหลือ</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>สต็อกคงเหลือ พร้อมใช้งาน</TableCell>
                                <TableCell sx={{ minWidth: isMobile ? 100 : 140 }}>สต็อกหลังปรับ</TableCell>
                                <TableCell align="center" sx={{ minWidth: isMobile ? 140 : 200 }}>ตัวจัดการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {spList.length > 0 ? (
                                spList.map((sp, index) => {
                                    const base = Number(sp.total_aready ?? 0);
                                    const liveQty = sp._editing ? Number(sp._draftQty ?? sp.sp_qty) : Number(sp.sp_qty || 0);
                                    const liveAfterAdd = sp._editing
                                        ? (sp._draft_after_add ?? (base + liveQty))
                                        : Number(sp.total_after_total_if_add ?? (base + liveQty));
                                    const liveAfterRemove = sp._editing
                                        ? (sp._draft_after_remove ?? (base - liveQty))
                                        : Number(sp.total_after_total_if_remove ?? (base - liveQty));
                                    const afterDisplay = jobType === 'add' ? liveAfterAdd : liveAfterRemove;
                                    const dangerBg = jobType === 'remove' && afterDisplay < 0 ? '#f2b8b5' : 'transparent';

                                    return (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                transition: 'background-color 0.5s ease',
                                                backgroundColor: highlightedIndex === index ? '#f1592222' : 'transparent'
                                            }}
                                        >
                                            <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>{sp.sp_code}</TableCell>
                                            <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>{sp.sp_name}</TableCell>
                                            <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>{sp.sp_unit}</TableCell>

                                            {/* Qty (editable per row) */}
                                            <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                                {sp._editing ? (
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0 }}
                                                        value={sp._draftQty ?? sp.sp_qty}
                                                        onChange={(e) => handleRowQtyDraftChange(index, e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') saveRow(index); }}
                                                        sx={{ width: isMobile ? 90 : 120 }}
                                                    />
                                                ) : (
                                                    <>{jobType !== 'add' ? `-${sp.sp_qty}` : sp.sp_qty}</>
                                                )}
                                            </TableCell>

                                            {/* current stock & available */}
                                            <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>{sp.count_sp}</TableCell>
                                            <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>{base}</TableCell>

                                            {/* after */}
                                            <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem', backgroundColor: dangerBg }}>
                                                {afterDisplay}
                                            </TableCell>

                                            {/* actions */}
                                            <TableCell align="center">
                                                {sp._editing ? (
                                                    <>
                                                        <Button
                                                            variant="contained"
                                                            size={isMobile ? "small" : "medium"}
                                                            onClick={() => saveRow(index)}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            บันทึกแถว
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="inherit"
                                                            size={isMobile ? "small" : "medium"}
                                                            onClick={() => cancelEditRow(index)}
                                                        >
                                                            ยกเลิก
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="outlined"
                                                            size={isMobile ? "small" : "medium"}
                                                            onClick={() => startEditRow(index)}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            แก้ไข
                                                        </Button>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDeleteItem(index)}
                                                            size={isMobile ? "small" : "medium"}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                        {/* <IconButton
                                                            color="info"
                                                            onClick={() => console.log(sp)}
                                                            size={isMobile ? "small" : "medium"}
                                                        >
                                                            check
                                                        </IconButton> */}
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography color="text.secondary">ไม่พบข้อมูล กรุณาเพิ่มรายการอะไหล่</Typography>
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