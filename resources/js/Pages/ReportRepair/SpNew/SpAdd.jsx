import { Alert, Button, Grid2, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import { ImagePreview } from "@/Components/ImagePreview.jsx";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Checkbox from "@mui/material/Checkbox";
import React, { useEffect, useState } from "react";
import SpSummary from "@/Pages/ReportRepair/SpNew/SpSummary.jsx";

export default function SpAdd({ detail, showAdd, setShowAdd, setDetail }) {
    const [selected, setSelected] = useState(detail.selected.sp);
    const [open, setOpen] = useState(false);
    const pid = detail.pid;
    const spPath = import.meta.env.VITE_IMAGE_PATH + pid;
    const [sv, setSv] = useState([{
        spcode: 'SV001',
        spname: 'ค่าบริการ',
        spunit: 'ครั้ง',
        price_per_unit: '0'
    }]);

    // รวม spAll กับ sv
    const [spAll, setSpAll] = useState(() => {
        const combinedSp = [...detail.sp]; // สร้างการคัดลอกของ detail.sp
        sv.forEach(svItem => { // เพิ่มข้อมูลจาก sv เข้าไปใน combinedSp
            const existingIndex = combinedSp.findIndex(item => item.spcode === svItem.spcode); // ตรวจสอบว่ามีรายการนี้ใน combinedSp หรือไม่
            if (existingIndex === -1) {// ถ้าไม่มีก็เพิ่มเข้าไป
                combinedSp.push(svItem);
            }
        });

        return combinedSp;
    });
    // ตรวจสอบว่ารายการอยู่ใน selected หรือไม่
    const isSelected = (item) => {
        return selected.some(sel => sel.spcode === item.spcode);
    };
    // ฟังก์ชั่นจัดการการเลือกรายการ
    const handelSelect = (e, item) => {
        const checked = e.target.checked;
        const warranty = detail.sp_warranty.some(t => t.spcode === item.spcode)
        if (checked) { // เพิ่มรายการเข้าไปใน selected
            setSelected(prev => [...prev, {
                ...item,
                gp: detail.selected.globalGP,
                qty: 1,
                price_multiple_gp: `${parseFloat(item.price_per_unit) + ((detail.selected.globalGP / 100) * parseFloat(item.price_per_unit))}`,
                sp_unit: item.spunit,
                warranty: warranty,
                remark: null,
                claim: false,
                approve: 'no',
                approve_status: 'yes'
            }]);
        } else { // ลบรายการออกจาก selected
            setSelected(prev => prev.filter(sel => sel.spcode !== item.spcode));
        }
    };
    // ผสาน selected กับ spAll เมื่อมีการโหลดคอมโพเนนต์
    useEffect(() => {
        if (selected.length > 0) {
            // สร้าง spAll ใหม่ที่มีสถานะ checked ตามที่เลือกไว้
            const updatedSpAll = spAll.map(item => {
                const existingSelected = selected.find(sel => sel.spcode === item.spcode);
                if (existingSelected) {
                    return existingSelected;  // แทนที่ข้อมูลใน spAll ด้วยข้อมูลจาก selected ที่มี spcode เดียวกัน
                }
                return item;
            });

            setSpAll(updatedSpAll);
        }
    }, []);
    return (
        <>
            {open && <SpSummary {...{ open, setOpen, detail, selected, setSelected, setDetail, setShowAdd }} />}
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Stack direction='row' spacing={2}>
                        <Alert onClick={() => console.log(selected)} sx={{ mb: 1 }}
                            icon={<PaletteIcon fontSize="inherit" />} severity="success">
                            แถบสีเขียว คือ อะไหล่ที่อยู่ในรับประกัน
                        </Alert>
                        <Alert onClick={() => console.log(spAll)} icon={<PaletteIcon fontSize="inherit" />}
                            severity="error">
                            แถบสีแดง คือ อะไหล่ที่ยังไม่ถูกตั้งราคา
                        </Alert>
                    </Stack>
                </Grid2>
                <Grid2 size={12}>
                    <Typography fontWeight='bold'>
                        บริการ
                    </Typography>
                </Grid2>
                <Grid2 size={12}>
                    <Paper sx={{ overflow: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>เลือก</TableCell>
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>รหัสอะไหล่</TableCell>
                                    <TableCell>ชื่ออะไหล่</TableCell>
                                    <TableCell>หน่วย</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sv.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected(item)}
                                                onChange={(e) => handelSelect(e, item)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <ImagePreview src={''} />
                                        </TableCell>
                                        <TableCell>{item.spcode}</TableCell>
                                        <TableCell>{item.spname}</TableCell>
                                        <TableCell>{item.spunit}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>

                </Grid2>
                <Grid2 size={12}>
                    <Typography fontWeight='bold'>
                        อะไหล่
                    </Typography>
                </Grid2>
                <Grid2 size={12}>
                    <Paper sx={{ overflow: 'auto',maxHeight : 400,overflowY : 'auto'}}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>เลือก</TableCell>
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>รหัสอะไหล่</TableCell>
                                    <TableCell>ชื่ออะไหล่</TableCell>
                                    <TableCell>หน่วย</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {spAll.map((item, index) => {
                                    // const spPath2 = `https://images.pumpkin.tools/SKUS/SP/${detail.pid}/${item.spcode}.jpg`;
                                    const spPath2 = `https://images.pumpkin.tools/SKUS/SP/new/${item.spcode}.jpg`;
                                    if (item.spcode !== 'SV001') {
                                        return (
                                            <TableRow key={index}
                                                sx={
                                                    item.price_per_unit === '-' ? { backgroundColor: '#fdeded' }
                                                        : detail.sp_warranty.find(it => it.spcode === item.spcode) ?
                                                            { backgroundColor: '#edf7ed' } : { backgroundColor: 'white' }
                                                }
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isSelected(item)}
                                                        disabled={item.price_per_unit === '-'}
                                                        onChange={(e) => handelSelect(e, item)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {/* <ImagePreview src={spPath + '/' + item.spcode + '.jpg'}/> */}
                                                    <ImagePreview src={spPath2} />
                                                </TableCell>
                                                <TableCell>{item.spcode}</TableCell>
                                                <TableCell>{item.spname}</TableCell>
                                                <TableCell>{item.spunit ? item.spunit : item.sp_unit}</TableCell>
                                            </TableRow>
                                        )
                                    } else {
                                        return <React.Fragment key={index}></React.Fragment>
                                    }

                                })}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid2>
                <Grid2 size={12}>
                    <Stack direction='row-reverse' spacing={2}>
                        <Button
                            onClick={() => setOpen(true)}
                            variant='contained'
                            startIcon={<ModeEditIcon />}
                        >
                            สรุปรายการอะไหล่
                        </Button>
                        <Button
                            color='error'
                            onClick={() => setShowAdd(false)}
                            variant='outlined'
                            startIcon={<ModeEditIcon />}
                        >
                            ยกเลิก
                        </Button>
                    </Stack>
                </Grid2>
            </Grid2>
        </>
    )
}
