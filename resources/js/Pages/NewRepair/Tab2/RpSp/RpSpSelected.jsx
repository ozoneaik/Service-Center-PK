import {
    Button,
    Card,
    CardContent,
    Checkbox,
    Grid2,
    IconButton, Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {showDefaultImage} from "@/utils/showImage.js";
import {useState} from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RpSpAdd from "./RpSpAdd.jsx";
import SummarizeIcon from "@mui/icons-material/Summarize";

export default function RpSpSelected({spSelected, listSparePart, onUpdateSpSelected, onAddSpare, setShowSummary}) {
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    const [showAddMore, setShowAddMore] = useState(false);

    const handleDeleteSpare = (spcode) => {
        const updatedSpares = spSelected.filter(sp => sp.spcode !== spcode);
        onUpdateSpSelected(updatedSpares);
    };

    const handleAddMoreSpares = (newSpares) => {
        // กรองอะไหล่ที่ยังไม่มีในรายการ
        const filteredSpares = newSpares.filter(newSp =>
            !spSelected.some(existingSp => existingSp.spcode === newSp.spcode)
        );

        if (filteredSpares.length > 0) {
            onAddSpare(filteredSpares);
        }
        setShowAddMore(false);
    };

    if (showAddMore) {
        return (
            <Card>
                <CardContent>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Button
                                variant="outlined"
                                onClick={() => setShowAddMore(false)}
                                sx={{mb: 2}}
                            >
                                ← กลับไปดูรายการที่เลือก
                            </Button>
                        </Grid2>
                        <Grid2 size={12}>
                            <RpSpAdd
                                listSparePart={listSparePart}
                                onAddSpare={handleAddMoreSpares}
                            />
                        </Grid2>
                    </Grid2>
                </CardContent>
            </Card>
        );
    }

    return (
        <Grid2 container spacing={2}>
            {previewImage &&
                <SpPreviewImage open={previewImage} setOpen={setPreviewImage} imagePath={previewSelected}/>}
            <Grid2 size={12}>
                <Stack direction='row' justifyContent='start' width='100%' spacing={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowAddMore(true)}
                        sx={{mb: 2}}
                    >
                        เพิ่มอะไหล่เพิ่มเติม
                    </Button>

                    {/* ปุ่มสรุปการเลือกอะไหล่ */}
                    {spSelected.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SummarizeIcon/>}
                            onClick={() => setShowSummary(true)}
                            sx={{mb: 2}}
                        >
                            สรุปการเลือกอะไหล่
                        </Button>

                    )}

                </Stack>
            </Grid2>

            <Grid2 size={12} bgcolor='white' maxHeight={400} sx={{overflowY: 'auto'}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={6} sx={{fontWeight: 'bold', fontSize: 20}}>
                                รายการอะไหล่ที่เลือก ({spSelected.length} รายการ)
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>รูปภาพ</TableCell>
                            <TableCell>รหัสอะไหล่</TableCell>
                            <TableCell>ชื่ออะไหล่</TableCell>
                            <TableCell>หน่วย</TableCell>
                            <TableCell>จำนวน</TableCell>
                            <TableCell>จัดการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {spSelected.map((sp, index) => {
                            const imageSp = sp.spcode === 'SV001' ? '' :
                                import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';

                            return (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: sp.warranty === 'Y' ? '#e8f5e8' :
                                            (!sp.price_per_unit || sp.price_per_unit === '0') ? '#ffebee' : 'inherit'
                                    }}
                                >
                                    <TableCell onClick={() => {
                                        setPreviewImage(true);
                                        setPreviewSelected(imageSp)
                                    }}>
                                        <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                                    </TableCell>
                                    <TableCell>{sp.spcode}</TableCell>
                                    <TableCell>{sp.spname}</TableCell>
                                    <TableCell>{sp.spunit}</TableCell>
                                    <TableCell>{sp.qty || 1}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteSpare(sp.spcode)}
                                            size="small"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Grid2>
        </Grid2>
    )
}
