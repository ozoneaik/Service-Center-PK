import {Alert, Card, CardContent, Grid2, Stack} from "@mui/material";
import DmPreview from "@/Pages/ReportRepair/SpNew/DmPreview.jsx";
import RpSpAdd from "@/Pages/NewRepair/Tab2/RpSp/RpSpAdd.jsx";
import PaletteIcon from "@mui/icons-material/Palette";
import React from "react";

export default function RpSpMain({listSparePart,productDetail}) {
    const pid = productDetail.pid;
    const fac_model = productDetail.facmodel;
    const DM = productDetail.dm || 'DM01';
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={3}>
                <Card>
                    <CardContent>
                        <DmPreview detail={{fac_model, dm_type: DM, pid : pid}}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={9}>
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
                        <RpSpAdd listSparePart={listSparePart}/>
                    </Grid2>
                </Grid2>
            </Grid2>
        </Grid2>
    )
}
