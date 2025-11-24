import {
    Box, Button, Card, CardContent, Checkbox, Divider, Grid2, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, Typography,
    useMediaQuery
} from "@mui/material";
import { showDefaultImage } from "@/utils/showImage.js";
import { useState, useEffect } from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import SaveIcon from "@mui/icons-material/Save";
import Collapse from "@mui/material/Collapse";

export default function RpSpAdd({ listSparePart, onAddSpare, spSelected = [], JOB, showServiceRow = true }) {
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    const [selectedSpares, setSelectedSpares] = useState([]);
    const [selectedService, setSelectedService] = useState(false);

    const [openIndex, setOpenIndex] = useState(null);

    const isMobile = useMediaQuery('(max-width:600px)');

    console.log(spSelected);

    // ข้อมูลบริการ SV001
    const serviceData = {
        spcode: 'SV001',
        // spname: 'ค่าบริการ',
        spname: spSelected?.find(sp => sp.spcode === 'SV001')?.spname || 'ค่าบริการ',
        spunit: 'บาท',
        stdprice_per_unit: spSelected?.find(sp => sp.spcode === 'SV001')?.price_multiple_gp || 0,
        price_per_unit: spSelected?.find(sp => sp.spcode === 'SV001')?.price_multiple_gp || 0,
        warranty: 'No',
        sp_warranty: false,
        price_multiple_gp: spSelected?.find(sp => sp.spcode === 'SV001')?.price_multiple_gp || 0,
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
            console.log(spare)
            const ZeroValue = (spare.warranty === 'yes' && JOB.warranty) ? 0 : spare.price_per_unit;
            // เพิ่มอะไหล่ใหม่ พร้อมกับ qty = 1
            setSelectedSpares(prev => [
                ...prev, {
                    ...spare,
                    qty: 1,
                    price_multiple_gp: ZeroValue,
                    claim: spare.warranty === 'yes' && JOB.warranty
                }
            ]);
        } else {
            // ลบอะไหล่ออก
            setSelectedSpares(prev => prev.filter(sp => sp.spcode !== spare.spcode));
        }
    };

    const handleServiceCheck = (e) => {
        const {checked} = e.target;
        setSelectedService(checked);
    };

    const handleSaveSelection = () => {
        console.log(selectedService);
        const sparesToAdd = [];

        // เพิ่มบริการถ้าถูกเลือก
        if (selectedService) {
            sparesToAdd.push({ ...serviceData, qty: 1 });
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
        <>
            {previewImage && <SpPreviewImage open={previewImage} setOpen={setPreviewImage} imagePath={previewSelected} />}
            {isMobile ? (
                <Grid2 size={12} maxHeight={400} overflow='auto'>
                    <Stack spacing={2}>
                        {showServiceRow && (
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: '#f5f5f5' }
                                }}
                            >
                                <CardContent
                                    onClick={() => { }}
                                    sx={{ pb: '8px !important' }}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <img
                                                width={50} height={50}
                                                src={import.meta.env.VITE_IMAGE_DEFAULT}
                                                style={{ borderRadius: 4 }}
                                            />
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {serviceData.spcode}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {serviceData.spname}
                                                </Typography>
                                                <Typography variant="body2" color="primary" fontWeight="bold">
                                                    {serviceData.price_per_unit} บาท
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Checkbox
                                            checked={selectedService}
                                            onChange={handleServiceCheck}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {listSparePart.map((sp, index) => {
                            const imageSp = import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                            const isSelected = isSpareSelected(sp.spcode);
                            const isOpen = openIndex === index;
                            const GreenHighlight = (sp.warranty === 'yes' && JOB.warranty) ? '#e8f5e8' :
                                (!sp.price_per_unit || sp.price_per_unit === '-') ? '#ffebee' : 'white';

                            return (
                                <Card
                                    key={sp.spcode}
                                    sx={{
                                        backgroundColor: GreenHighlight,
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: '#f5f5f5' }
                                    }}
                                >
                                    <CardContent
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        sx={{ pb: '8px !important' }}
                                    >
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <img
                                                    width={50} height={50} src={imageSp}
                                                    onError={showDefaultImage}
                                                    style={{ borderRadius: 4 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(true);
                                                        setPreviewSelected(imageSp);
                                                    }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {sp.spcode}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {sp.spname}
                                                    </Typography>
                                                    <Typography variant="body2" color="primary" fontWeight="bold">
                                                        {sp.price_per_unit || 0} บาท
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Checkbox
                                                disabled={sp.price_per_unit === '-' || !sp.price_per_unit}
                                                checked={isSelected}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleSpareCheck(sp, e.target.checked)}
                                            />
                                        </Box>
                                    </CardContent>

                                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                        <CardContent sx={{ pt: 0 }}>
                                            <Divider sx={{ mb: 2 }} />
                                            <Typography variant="body2">หน่วย: {sp.spunit}</Typography>
                                            <Typography variant="body2">การรับประกัน: {sp.warranty}</Typography>
                                        </CardContent>
                                    </Collapse>
                                </Card>
                            );
                        })}
                    </Stack>
                </Grid2>
            ) : (
                // *** แสดงตารางเดิมใน Desktop view (ไม่ต้องเปลี่ยน) ***
                //วิวแก้ไข
                <Grid2 size={12} bgcolor='white' maxHeight={457} sx={{ overflowY: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={6} sx={{ fontWeight: 'bold', fontSize: 20 }}>อะไหล่</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>เลือก</TableCell>
                                <TableCell>ตำแหน่ง</TableCell>
                                <TableCell>รูปภาพ</TableCell>
                                <TableCell>รหัสและชื่ออะไหล่</TableCell>
                                <TableCell>ราคาอะไหล่</TableCell>
                                <TableCell>หน่วย</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {showServiceRow && (
                                <TableRow>
                                    <TableCell>
                                        <Checkbox checked={selectedService} onChange={handleServiceCheck} />
                                    </TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>
                                        <img width={50} src={import.meta.env.VITE_IMAGE_DEFAULT} />
                                    </TableCell>
                                    <TableCell>
                                        {serviceData.spcode}
                                        <br />
                                        {serviceData.spname}
                                    </TableCell>
                                    <TableCell>{serviceData.price_multiple_gp}</TableCell>
                                    <TableCell>{serviceData.spunit}</TableCell>
                                </TableRow>
                            )}
                            {listSparePart.map((sp, index) => {
                                const imageSp = import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                                const isSelected = isSpareSelected(sp.spcode);

                                return (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            backgroundColor: (sp.warranty === 'yes' && JOB.warranty) ? '#e8f5e8' :
                                                (!sp.price_per_unit || sp.price_per_unit === '-') ? '#ffebee' : 'inherit'
                                        }}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                disabled={sp.price_per_unit === '-' || !sp.price_per_unit}
                                                checked={isSelected}
                                                onChange={(e) => handleSpareCheck(sp, e.target.checked)}
                                            />
                                        </TableCell>

                                        {/* คอลัมน์ใหม่ “ตำแหน่งไดอะแกรม” */}
                                        <TableCell sx={{ fontWeight: 'bold', color: 'green' }}>
                                            {sp.tracking_number ?? '-'}
                                        </TableCell>

                                        <TableCell
                                            onClick={() => {
                                                setPreviewImage(true);
                                                setPreviewSelected(imageSp);
                                            }}
                                        >
                                            <img width={50} src={imageSp} onError={showDefaultImage} alt="" />
                                        </TableCell>

                                        <TableCell>
                                            {sp.spcode}
                                            <br />
                                            {sp.spname}
                                        </TableCell>
                                        <TableCell>{sp.price_per_unit}</TableCell>
                                        <TableCell>{sp.spunit}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Grid2>
            )}
            {totalSelectedItems > 0 && (
                <Box
                    position="fixed" bottom={0} left={0} width="100%"
                    zIndex={1000} bgcolor="white" boxShadow={3} p={1}
                >
                    <Grid2 container>
                        <Grid2 size={12}>
                            <Stack direction='row' justifyContent='end'>
                                <Button
                                    fullWidth={isMobile} variant="contained"
                                    color="success" size='large' startIcon={<SaveIcon />}
                                    onClick={handleSaveSelection}
                                >
                                    บันทึกการเลือกอะไหล่ ({totalSelectedItems} รายการ)
                                </Button>
                            </Stack>
                        </Grid2>
                    </Grid2>
                </Box>
            )}
        </>

    )
}
