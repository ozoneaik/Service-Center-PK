import {Button, Checkbox, Grid2, Stack, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {showDefaultImage} from "@/utils/showImage.js";
import {useState, useEffect} from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import SaveIcon from "@mui/icons-material/Save";

export default function RpSpAdd({listSparePart, onAddSpare, spSelected,JOB}) {
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    const [selectedSpares, setSelectedSpares] = useState([]);
    const [selectedService, setSelectedService] = useState(false);

    // ข้อมูลบริการ SV001
    const serviceData = {
        spcode: 'SV001',
        spname: 'ค่าบริการ',
        spunit: 'ครั้ง',
        stdprice_per_unit: '0',
        price_per_unit: '0',
        warranty: 'N',
        sp_warranty: false,
    };

    // ตั้งค่า state เริ่มต้นตาม spSelected ที่ส่งมา
    useEffect(() => {
        if (spSelected && spSelected.length > 0) {
            // แยกอะไหล่และบริการ
            const spares = spSelected.filter(sp => sp.spcode !== 'SV001');
            const hasService = spSelected.some(sp => sp.spcode === 'SV001');

            setSelectedSpares(spares);
            setSelectedService(hasService);
        }
    }, [spSelected]);

    const handleSpareCheck = (spare, checked) => {
        if (checked) {
            // เพิ่มอะไหล่ใหม่ พร้อมกับ qty = 1
            setSelectedSpares(prev => [...prev, {...spare, qty: 1}]);
        } else {
            // ลบอะไหล่ออก
            setSelectedSpares(prev => prev.filter(sp => sp.spcode !== spare.spcode));
        }
    };

    const handleServiceCheck = (checked) => {
        setSelectedService(checked);
    };

    const handleSaveSelection = () => {
        const sparesToAdd = [];

        // เพิ่มบริการถ้าถูกเลือก
        if (selectedService) {
            sparesToAdd.push({...serviceData, qty: 1});
        }

        // เพิ่มอะไหล่ที่เลือก
        sparesToAdd.push(...selectedSpares);

        // ส่งข้อมูลกลับไปยัง parent component
        if (sparesToAdd.length > 0) {
            onAddSpare(sparesToAdd);
        }
    };

    const isSpareSelected = (spcode) => {
        return selectedSpares.some(sp => sp.spcode === spcode);
    };

    // คำนวณจำนวนรายการที่เลือกทั้งหมด
    const totalSelectedItems = selectedSpares.length + (selectedService ? 1 : 0);

    return (

        <Grid2 container spacing={2}>
            {/* ปุ่มบันทึกการเลือก */}
            {totalSelectedItems > 0 && (
                <Grid2 size={12}>
                    <Stack justifyContent='start' direction='row'>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveSelection}
                            sx={{mb: 2}}
                        >
                            บันทึกการเลือกอะไหล่ ({totalSelectedItems} รายการ)
                        </Button>
                    </Stack>
                </Grid2>
            )}
            {previewImage &&
                <SpPreviewImage open={previewImage} setOpen={setPreviewImage} imagePath={previewSelected}/>}

            {/* ตารางบริการ */}
            <Grid2 size={12} bgcolor='white' maxHeight={400} sx={{overflowY: 'auto'}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={5} sx={{fontWeight: 'bold', fontSize: 20}}>บริการ</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>เลือก</TableCell>
                            <TableCell>รูปภาพ</TableCell>
                            <TableCell>รหัสอะไหล่</TableCell>
                            <TableCell>ชื่ออะไหล่</TableCell>
                            <TableCell>หน่วย</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Checkbox
                                    checked={selectedService}
                                    onChange={(e) => handleServiceCheck(e.target.checked)}
                                />
                            </TableCell>
                            <TableCell onClick={() => {
                                setPreviewImage(true);
                                setPreviewSelected('')
                            }}>
                                <img width={50} src={''} onError={showDefaultImage} alt=""/>
                            </TableCell>
                            <TableCell>SV001</TableCell>
                            <TableCell>ค่าบริการ</TableCell>
                            <TableCell>ครั้ง</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Grid2>

            {/* ตารางอะไหล่ */}
            <Grid2 size={12} bgcolor='white' maxHeight={400} sx={{overflowY: 'auto'}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={5} sx={{fontWeight: 'bold', fontSize: 20}}>อะไหล่</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>เลือก</TableCell>
                            <TableCell>รูปภาพ</TableCell>
                            <TableCell>รหัสอะไหล่</TableCell>
                            <TableCell>ชื่ออะไหล่</TableCell>
                            <TableCell>หน่วย</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listSparePart.map((sp, index) => {
                            const imageSp = import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                            const isSelected = isSpareSelected(sp.spcode);

                            return (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: (sp.warranty === 'Y' && JOB.warranty) ? '#e8f5e8' :
                                            (!sp.price_per_unit || sp.price_per_unit === '0') ? '#ffebee' : 'inherit'
                                    }}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={(e) => handleSpareCheck(sp, e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell onClick={() => {
                                        setPreviewImage(true);
                                        setPreviewSelected(imageSp)
                                    }}>
                                        <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                                    </TableCell>
                                    <TableCell>{sp.spcode}</TableCell>
                                    <TableCell>{sp.spname}</TableCell>
                                    <TableCell>{sp.spunit}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Grid2>


        </Grid2>
    )
}
