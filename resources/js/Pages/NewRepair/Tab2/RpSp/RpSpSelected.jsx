import {
    Button, Card, CardContent, Grid2, IconButton, Stack, Table, TableBody, TableCell,
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

            <Grid2 size={12} bgcolor='white' maxHeight={400} sx={{overflowY: 'auto'}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={8} sx={{fontWeight: 'bold', fontSize: 18}}>
                                รายการอะไหล่ที่เลือก ({spSelected.length} รายการ)
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            {isMobile ? (
                                <>
                                    <TableCell/>
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>จำนวน</TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>รหัสและชื่ออะไหล่</TableCell>
                                    <TableCell>จำนวน</TableCell>
                                    <TableCell>หน่วย</TableCell>
                                    <TableCell>ราคา</TableCell>
                                    <TableCell>ราคาที่ + Gp แล้ว</TableCell>
                                    <TableCell>จัดการ</TableCell>
                                </>
                            )}
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
            </Grid2>
        </Grid2>
    )
}

function RowTable(props) {
    const {imageSp, sp, isMobile, setPreviewImage, setPreviewSelected} = props;
    const {onDelete, JOB, setOpenIndex, openIndex, index} = props;
    const isOpen = openIndex === index;
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
        <>
            <TableRow
                sx={{
                    backgroundColor: JOB.warranty && (sp.sp_warranty === 'Y' || sp.warranty === 'Y') ? '#e8f5e8' :
                        (!sp.price_per_unit || sp.price_per_unit === '-') ? '#ffebee' : 'inherit',
                    '&:hover': {backgroundColor: '#ccc'}
                }}
                onClick={() => isMobile && setOpenIndex(isOpen ? null : index)}
            >

                {isMobile ? (
                    <>
                        <TableCell>{!isOpen ? <ArrowDownward/> : <ArrowUpward/>}</TableCell>
                        <TableCell onClick={() => {
                            setPreviewImage(true);
                            setPreviewSelected(imageSp)
                        }}>
                            <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                        </TableCell>
                        <TableCell>
                            {sp.qty} {sp.spunit}
                        </TableCell>
                    </>
                ) : (
                    <>
                        <TableCell onClick={() => {
                            setPreviewImage(true);
                            setPreviewSelected(imageSp)
                        }}>
                            <img width={50} src={imageSp} onError={showDefaultImage} alt=""/>
                        </TableCell>
                        <TableCell>
                            {'('}{sp.spcode}{')'}&nbsp;{sp.spname}
                            {sp.remark_noclaim && (
                                <p style={{color: 'gray', fontSize: 10}}>
                                    สาเหตุของการไม่เคม : {sp.remark_noclaim}
                                </p>
                            )}
                            {parseFloat(sp.price_multiple_gp) === 0 && (
                                <>
                                    <p style={{color: 'gray', fontSize: 10}}>
                                        เคลม : {sp.claim_remark}
                                    </p>
                                    <p style={{color: 'gray', fontSize: 10}}>
                                        หมายเหตุ : {sp.remark}
                                    </p>
                                </>
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
                    </>
                )}
            </TableRow>
            {isMobile && (
                <TableRow>
                    <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Stack direction='column' spacing={1} my={1}>
                                <TextDetail label='รหัสและชื่ออะไหล่' value={`(${sp.spcode})${sp.spname}`}/>
                                <TextDetail label='ราคา' value={`${sp.price_per_unit || 0} บาท`}/>
                                <TextDetail label='ราคาที่ + Gp แล้ว' value={`${sp.price_multiple_gp || 0} บาท`}/>
                                {sp.remark_noclaim &&
                                    <TextDetail label='สาเหตุของการไม่เคม' value={sp.remark_noclaim}/>}
                                {(parseFloat(sp.price_multiple_gp) === 0 && sp.claim_remark) && (
                                    <TextDetail label='เคลม' value={sp.claim_remark}/>
                                )}
                                {(parseFloat(sp.price_multiple_gp) === 0 && sp.remark) && (
                                    <TextDetail label='หมายเหตุ' value={sp.remark}/>
                                )}
                                <br/>
                                <Button
                                    size='small' startIcon={<Delete/>} color='error' variant='contained'
                                    onClick={() => confirmDelete(sp.spcode,sp.spname)}
                                >
                                    ลบ
                                </Button>
                                <br/>
                            </Stack>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}

const TextDetail = ({label, value}) => (
    <Typography sx={breakWord}>
        <span style={{fontWeight: 'bold', color: '#f15922'}}>{label}</span>: {value}
    </Typography>
)

const breakWord = {
    wordBreak: 'break-word', whiteSpace: 'normal'
}


