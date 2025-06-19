import {
    Button, Card, CardContent, Divider, Grid2, IconButton, Stack, Table, TableBody, TableCell,
    TableHead, TableRow, Typography, useMediaQuery
} from "@mui/material";
import {showDefaultImage} from "@/utils/showImage.js";
import React, {useState} from "react";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RpSpAdd from "./RpSpAdd.jsx";
import SummarizeIcon from "@mui/icons-material/Summarize";
import {ArrowDownward, ArrowUpward, Delete} from "@mui/icons-material";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import {AlertDialogQuestion} from "@/Components/AlertDialog.js";

export default function RpSpSelected(props) {
    const {spSelected, listSparePart, onUpdateSpSelected, setShowSummary, setSpSelected, JOB} = props;
    const [previewImage, setPreviewImage] = useState(false);
    const [previewSelected, setPreviewSelected] = useState('');
    const [showAddMore, setShowAddMore] = useState(false);

    const isMobile = useMediaQuery('(max-width:600px)');
    const [openIndex, setOpenIndex] = useState(null);

    const handleDeleteSpare = (spcode) => {
        const updatedSpares = spSelected.filter(sp => sp.spcode !== spcode);
        onUpdateSpSelected(updatedSpares);
    };

    const handleAddMoreSpares = (newSpares) => {
        setSpSelected(newSpares);
        setShowAddMore(false);
    };

    const confirmDelete = (spcode, spname) => {
        AlertDialogQuestion({
            text : `ลบ ${spcode} ${spname} ออกจากรายการ`,
            onPassed : (confirm) => {
                confirm && handleDeleteSpare(spcode)
            }
        })
    }

    if (showAddMore) {
        return (
            <Card>
                <CardContent>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Button
                                fullWidth={isMobile}
                                variant="outlined"
                                onClick={() => setShowAddMore(false)}
                                sx={{mb: 2}}
                            >
                                ← กลับไปดูรายการที่เลือก
                            </Button>
                        </Grid2>
                        <Grid2 size={12}>
                            <RpSpAdd
                                JOB={JOB}
                                spSelected={spSelected}
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
                <SpPreviewImage open={previewImage} setOpen={setPreviewImage} imagePath={previewSelected}/>
            }

            {JOB.status === 'pending' && (
                <Grid2 size={12}>
                    <Stack direction='row' justifyContent='start' width='100%' spacing={2}>
                        <Button
                            variant="contained" color="primary" startIcon={<AddIcon/>}
                            onClick={() => setShowAddMore(true)} sx={{mb: 2}}
                        >
                            เพิ่มหรือลดอะไหล่
                        </Button>

                        {/* ปุ่มสรุปการเลือกอะไหล่ */}
                        {spSelected.length > 0 && (
                            <Button
                                variant="contained" color="primary" startIcon={<SummarizeIcon/>}
                                onClick={() => setShowSummary(true)} sx={{mb: 2}}
                            >
                                สรุปการเลือกอะไหล่
                            </Button>
                        )}
                    </Stack>
                </Grid2>
            )}

            <Grid2 size={12}>
                <Card sx={{overflow: 'auto'}}>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2}}>
                            รายการอะไหล่ที่เลือก ({spSelected.length} รายการ)
                        </Typography>

                        {isMobile ? (
                            // Mobile View - Card Layout
                            <Stack spacing={2}>
                                {spSelected.map((sp, index) => {
                                    const imageSp = sp.spcode === 'SV001' ? '' : import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                                    const isOpen = openIndex === index;
                                    const GreenHighlight = JOB.warranty && (sp.sp_warranty === 'Y' || sp.warranty === 'Y') ? '#e8f5e8' :
                                        (!sp.price_per_unit || sp.price_per_unit === '-') ? '#ffebee' : 'inherit';

                                    return (
                                        <Card
                                            key={sp.spcode}
                                            sx={{
                                                backgroundColor: GreenHighlight,
                                                cursor: 'pointer',
                                                '&:hover': {backgroundColor: '#f5f5f5'}
                                            }}
                                        >
                                            <CardContent
                                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                                sx={{pb: '8px !important'}}
                                            >
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <img
                                                            width={50}
                                                            height={50}
                                                            src={imageSp}
                                                            onError={showDefaultImage}
                                                            alt=""
                                                            style={{borderRadius: 4}}
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
                                                                จำนวน: {sp.qty || 1} {sp.spunit}
                                                            </Typography>
                                                            <Typography variant="body2" color="primary" fontWeight="bold">
                                                                {sp.price_multiple_gp || 0} บาท
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <IconButton size="small">
                                                        {isOpen ? <ArrowUpward/> : <ArrowDownward/>}
                                                    </IconButton>
                                                </Box>
                                            </CardContent>

                                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                <CardContent sx={{pt: 0}}>
                                                    <Divider sx={{mb: 2}}/>
                                                    <Stack spacing={2}>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                ชื่ออะไหล่:
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {sp.spname}
                                                            </Typography>
                                                        </Box>

                                                        <Grid2 container spacing={2}>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    หน่วย:
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {sp.spunit}
                                                                </Typography>
                                                            </Grid2>
                                                            <Grid2 size={6}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    ราคาต่อหน่วย:
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {sp.price_per_unit || 0} บาท
                                                                </Typography>
                                                            </Grid2>
                                                        </Grid2>

                                                        {/* แสดงข้อมูลเพิ่มเติม */}
                                                        {sp.remark_noclaim && (
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    สาเหตุของการไม่เคม:
                                                                </Typography>
                                                                <Typography variant="body2" color="orange">
                                                                    {sp.remark_noclaim}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {(parseFloat(sp.price_multiple_gp) === 0 && sp.claim_remark) && (
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    เคลม:
                                                                </Typography>
                                                                <Typography variant="body2" color="green">
                                                                    {sp.claim_remark}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {(parseFloat(sp.price_multiple_gp) === 0 && sp.remark) && (
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    หมายเหตุ:
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {sp.remark}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {/* ปุ่มลบ */}
                                                        {JOB.status === 'pending' && (
                                                            <Button
                                                                size='small'
                                                                startIcon={<DeleteIcon/>}
                                                                color='error'
                                                                variant='contained'
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    confirmDelete(sp.spcode, sp.spname);
                                                                }}
                                                            >
                                                                ลบ
                                                            </Button>
                                                        )}
                                                    </Stack>
                                                </CardContent>
                                            </Collapse>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        ) : (
                            // Desktop View - Table Layout
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>รูปภาพ</TableCell>
                                        <TableCell>รหัสและชื่ออะไหล่</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>หน่วย</TableCell>
                                        <TableCell>ราคา</TableCell>
                                        <TableCell>ราคาที่ + Gp แล้ว</TableCell>
                                        <TableCell>จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {spSelected.map((sp, index) => {
                                        const imageSp = sp.spcode === 'SV001' ? '' : import.meta.env.VITE_IMAGE_SP + sp.spcode + '.jpg';
                                        return (
                                            <RowTable
                                                key={index} imageSp={imageSp} sp={sp} isMobile={isMobile}
                                                setPreviewImage={setPreviewImage} setPreviewSelected={setPreviewSelected}
                                                onDelete={(spcode) => handleDeleteSpare(spcode)} JOB={JOB}
                                                setOpenIndex={setOpenIndex} openIndex={openIndex} index={index}
                                            />
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>
    )
}

function RowTable(props) {
    const {imageSp, sp, isMobile, setPreviewImage, setPreviewSelected} = props;
    const {onDelete, JOB, setOpenIndex, openIndex, index} = props;

    const confirmDelete = (spcode, spname) => {
        AlertDialogQuestion({
            text : `ลบ ${spcode} ${spname} ออกจากรายการ`,
            onPassed : (confirm) => {
                if (confirm) {
                    onDelete(spcode);
                }
            }
        })
    }

    return (
        <TableRow
            sx={{
                backgroundColor: JOB.warranty && (sp.sp_warranty === 'Y' || sp.warranty === 'Y') ? '#e8f5e8' :
                    (!sp.price_per_unit || sp.price_per_unit === '-') ? '#ffebee' : 'inherit',
                '&:hover': {backgroundColor: '#ccc'}
            }}
        >
            <TableCell onClick={() => {
                setPreviewImage(true);
                setPreviewSelected(imageSp)
            }}>
                <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
            </TableCell>
            <TableCell>
                {'('}{sp.spcode}{')'}&nbsp;{sp.spname}
                {sp.remark_noclaim &&
                    <TextDetailDesktop label='สาเหตุของการไม่เคม' value={sp.remark_noclaim}/>}
                {(parseFloat(sp.price_multiple_gp) === 0 && sp.claim_remark) && (
                    <TextDetailDesktop label='เคลม' value={sp.claim_remark}/>
                )}
                {(parseFloat(sp.price_multiple_gp) === 0 && sp.remark) && (
                    <TextDetailDesktop label='หมายเหตุ' value={sp.remark}/>
                )}
            </TableCell>
            <TableCell>{sp.qty || 1}</TableCell>
            <TableCell>{sp.spunit}</TableCell>
            <TableCell>{sp.price_per_unit || 0}</TableCell>
            <TableCell>{sp.price_multiple_gp || 0}</TableCell>
            <TableCell>
                <IconButton
                    disabled={JOB.status !== 'pending'}
                    color="error"
                    onClick={() => confirmDelete(sp.spcode,sp.spname)}
                    size="small"
                >
                    <DeleteIcon/>
                </IconButton>
            </TableCell>
        </TableRow>
    )
}

const TextDetail = ({label, value}) => (
    <Typography sx={breakWord}>
        <span style={{fontWeight: 'bold', color: '#f15922'}}>{label}</span>: {value}
    </Typography>
)

const TextDetailDesktop = ({label, value}) => (
    <Typography sx={breakWord} fontSize={10} color={'gray'}>
        <span style={{fontWeight : 'bold'}}>{label}</span>: {value}
    </Typography>
)

const breakWord = {
    wordBreak: 'break-word', whiteSpace: 'normal'
}


