import {Alert, Button, Card, CardContent, CircularProgress, Grid2, Stack} from "@mui/material";
import DmPreview from "@/Pages/ReportRepair/SpNew/DmPreview.jsx";
import RpSpAdd from "@/Pages/NewRepair/Tab2/RpSp/RpSpAdd.jsx";
import RpSpSelected from "@/Pages/NewRepair/Tab2/RpSp/RpSpSelected.jsx";
import RpSpSummary from "@/Pages/NewRepair/Tab2/RpSp/RpSpSummary.jsx";
import PaletteIcon from "@mui/icons-material/Palette";
import SummarizeIcon from "@mui/icons-material/Summarize";
import React, {useEffect, useState} from "react";

export default function RpSpMain({listSparePart, productDetail, setStepForm, JOB}) {
    const pid = productDetail.pid;
    const fac_model = productDetail.facmodel;
    const DM = productDetail.dm || 'DM01';
    const [loading, setLoading] = useState(false);
    const [spSelected, setSpSelected] = useState([]);
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.get(route('repair.after.spare-part.index', {
                serial_id: JOB.serial_id,
                job_id: JOB.job_id,
            }))
            console.log(data, status)
            setSpSelected(data.spare_parts)
        } catch (error) {
            console.log(error)
        }
    }

    const handleOnClick = () => {
        console.log('productDetail => ',productDetail)
        console.log('listSparePart => ',listSparePart)
        console.log('spSelected => ',spSelected)
    }

    const handleAddSpare = (newSpares) => {
        // เพิ่มอะไหล่ใหม่เข้าไปใน spSelected
        setSpSelected(prev => [...prev, ...newSpares]);
    }

    const handleUpdateSpSelected = (updatedSpares) => {
        setSpSelected(updatedSpares);
    }

    return (
        <>
            <button onClick={handleOnClick}>Click</button>
            {loading ? (<CircularProgress/>) : (
                <>
                    {showSummary ? (
                        <RpSpSummary
                            spSelected={spSelected}
                            setShowSummary={setShowSummary}
                            onUpdateSpSelected={handleUpdateSpSelected}
                        />
                    ) : (
                        <Grid2 container spacing={2}>
                            <Grid2 size={{md : 3, sm : 12}}>
                                <Card sx={{maxHeight : 500 ,overflow : 'auto'}}>
                                    <CardContent>
                                        <DmPreview detail={{fac_model, dm_type: DM, pid: pid}}/>
                                    </CardContent>
                                </Card>
                            </Grid2>
                            <Grid2 size={{md : 9, sm : 12}}>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={12}>
                                        <Stack direction='row' spacing={2}>
                                            <Alert sx={{mb: 1}}
                                                   icon={<PaletteIcon fontSize="inherit"/>} severity="success">
                                                แถบสีเขียว คือ อะไหล่ที่อยู่ในรับประกัน
                                            </Alert>
                                            <Alert icon={<PaletteIcon fontSize="inherit"/>}
                                                   severity="error">
                                                แถบสีแดง คือ อะไหล่ที่ยังไม่ถูกตั้งราคา
                                            </Alert>
                                        </Stack>
                                    </Grid2>



                                    <Grid2 size={12}>
                                        {spSelected.length === 0 ? (
                                            <RpSpAdd
                                                listSparePart={listSparePart}
                                                onAddSpare={handleAddSpare}
                                            />
                                        ) : (
                                            <RpSpSelected
                                                spSelected={spSelected}
                                                listSparePart={listSparePart}
                                                onUpdateSpSelected={handleUpdateSpSelected}
                                                onAddSpare={handleAddSpare}
                                                setShowSummary={setShowSummary}
                                            />
                                        )}
                                    </Grid2>

                                    {/* ปุ่มสรุปการเลือกอะไหล่ */}
                                    {/*{spSelected.length > 0 && (*/}
                                    {/*    <Grid2 size={12}>*/}
                                    {/*        <Stack direction='row' justifyContent='end'>*/}
                                    {/*            <Button*/}
                                    {/*                variant="contained"*/}
                                    {/*                color="primary"*/}
                                    {/*                startIcon={<SummarizeIcon />}*/}
                                    {/*                onClick={() => setShowSummary(true)}*/}
                                    {/*                sx={{mb: 2}}*/}
                                    {/*            >*/}
                                    {/*                สรุปการเลือกอะไหล่*/}
                                    {/*            </Button>*/}
                                    {/*        </Stack>*/}

                                    {/*    </Grid2>*/}
                                    {/*)}*/}
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    )}
                </>
            )}
        </>
    )
}
