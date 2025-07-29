import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {
    Container, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
    Alert, Box, Card, CardContent, CardActions, Chip, LinearProgress, Divider, Stack
} from "@mui/material";
import * as XLSX from 'xlsx';
import {useState} from "react";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import {TableStyle} from "../../../../css/TableStyle.js";
import {Delete} from "@mui/icons-material";

export default function DmCreateExel() {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const requiredFields = ['sku_code', 'fac_model', 'dm_type', 'path_file', 'layer'];

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setFileName(file?.name || '');
        setError('');
        setIsLoading(true);

        if (!file) {
            setIsLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            setTimeout(() => { // จำลองการโหลด
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                // ตรวจสอบคอลัมน์
                const hasAllFields = requiredFields.every(field => Object.keys(json[0] || {}).includes(field));

                if (!hasAllFields) {
                    setRows([]);
                    setError(`ไฟล์ต้องมีคอลัมน์: ${requiredFields.join(', ')}`);
                } else {
                    setRows(json);
                }
                setIsLoading(false);
            }, 1000);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = () => {
        console.log(rows);
        alert('บันทึกข้อมูลจำนวน ' + rows.length + ' รายการ');
    };

    const handleDelete = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    }

    return (
        <AuthenticatedLayout>
            <Head title='เพิ่มรายการไดอะแกรมผ่าน Excel'/>
            <Container maxWidth="lg" sx={{bgcolor: 'white', py: 3, mt: 3}}>
                {/* Header */}
                <Box sx={{mb: 4}}>
                    <Typography
                        variant="h4" component="h1" gutterBottom
                        sx={{fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2}}
                    >
                        <DescriptionIcon fontSize="large"/>
                        นำเข้าไฟล์ Excel
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        อัปโหลดไฟล์ Excel เพื่อเพิ่มรายการไดอะแกรมแบบจำนวนมาก
                    </Typography>
                </Box>

                {/* Upload Section */}
                <Card sx={{mb: 3, boxShadow: 3}}>
                    <CardContent sx={{p: 4}}>
                        <Typography variant="h6" gutterBottom sx={{mb: 3}}>
                            เลือกไฟล์ Excel
                        </Typography>

                        <Box
                            sx={{
                                border: '2px dashed', borderRadius: 2, p: 2,
                                textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease'
                            }}
                        >
                            <input
                                type="file" accept=".xlsx, .xls" onChange={handleFileUpload}
                                style={{display: 'none'}} id="file-upload"
                            />
                            <label htmlFor="file-upload" style={{cursor: 'pointer', width: '100%', display: 'block'}}>
                                <CloudUploadIcon
                                    sx={{
                                        fontSize: 48, mb: 2,
                                        color: error ? 'error.main' : (fileName ? 'success.main' : 'grey.400'),
                                    }}
                                />
                                <Typography variant="h6" gutterBottom>
                                    {fileName ? 'เปลี่ยนไฟล์' : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    รองรับไฟล์ .xlsx และ .xls เท่านั้น
                                </Typography>
                            </label>
                        </Box>

                        {fileName && (
                            <Box sx={{mt: 3, display: 'flex', alignItems: 'center', gap: 1}}>
                                <CheckCircleIcon color="success"/>
                                <Typography variant="body1">
                                    ไฟล์ที่เลือก: <strong>{fileName}</strong>
                                </Typography>
                            </Box>
                        )}

                        {isLoading && (
                            <Box sx={{mt: 3}}>
                                <Typography variant="body2" gutterBottom>กำลังประมวลผลไฟล์...</Typography>
                                <LinearProgress/>
                            </Box>
                        )}

                        {/* Required Fields Info */}
                        <Box sx={{mt: 3, p: 2, borderRadius: 1}}>
                            <Typography variant="subtitle2" gutterBottom>คอลัมน์ที่จำเป็นในไฟล์ Excel:</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {requiredFields.map(field => (
                                    <Chip key={field} label={field} size="small" variant="outlined" color="info"/>
                                ))}
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" icon={<ErrorIcon/>} sx={{mb: 4, boxShadow: 2}}>
                        <Typography variant="subtitle1" gutterBottom>
                            เกิดข้อผิดพลาด
                        </Typography>
                        {error}
                    </Alert>
                )}

                {/* Data Preview */}
                {rows.length > 0 && (
                    <Card sx={{boxShadow: 3}}>
                        <CardContent sx={{p: 0}}>
                            <Box sx={{p: 3, pb: 2}}>
                                <Typography variant="h6" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <CheckCircleIcon color="success"/>
                                    ตรวจสอบข้อมูล ({rows.length} รายการ)
                                </Typography>
                            </Box>
                            <Divider/>

                            <Box sx={{overflow: 'auto', maxHeight: 400}}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={TableStyle.TableHead}>#</TableCell>
                                            {requiredFields.map((field, index) => (
                                                <TableCell key={index} sx={TableStyle.TableHead}>{field}</TableCell>
                                            ))}
                                            <TableCell sx={TableStyle.TableHead}>จัดการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{fontWeight: 'bold', color: 'primary.main'}}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>{row.sku_code}</TableCell>
                                                <TableCell>{row.fac_model}</TableCell>
                                                <TableCell>{row.dm_type}</TableCell>
                                                <TableCell>{row.path_file}</TableCell>
                                                <TableCell>{row.layer}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        color='error' startIcon={<Delete/>} size='small'
                                                        onClick={()=>handleDelete(index)}
                                                    >
                                                        ลบ
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </CardContent>

                        <CardActions sx={{p: 3, justifyContent: 'flex-end', bgcolor: 'grey.50'}}>
                            <Button
                                variant="contained" color="primary"
                                startIcon={<SaveIcon/>} onClick={handleSubmit}
                            >
                                บันทึกข้อมูล ({rows.length} รายการ)
                            </Button>
                        </CardActions>
                    </Card>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}
