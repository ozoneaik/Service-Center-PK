import {useEffect, useState} from "react";
import {Card, Container, Grid2} from "@mui/material";
import DmPreview from "@/Pages/ReportRepair/SpNew/DmPreview.jsx";
import RpSpSelected from "@/Pages/NewRepair/ReportRepair/RpSp/RpSpSelected.jsx";
import RpSpAdd from "@/Pages/NewRepair/ReportRepair/RpSp/RpSpAdd.jsx";

export default function RpSpMain({detail, setDetail}) {
    const [spSelected, SetSpSelected] = useState(detail?.selected?.sp)
    const [showAdd, setShowAdd] = useState(false);
    console.log('spMain >>' , detail)
    return (
        <Grid2 container spacing={2}>
            <Grid2 size={{ lg: 4, sm: 4}}>
                <Card variant="outlined" sx={{p: 1}}>
                    <DmPreview detail={{pid: detail.pid, dm_type: detail.dm, fac_model: detail.facmodel}}/>
                </Card>
            </Grid2>
            <Grid2 size={{md: 12, lg: 8, sm: 12}}>
                {detail.selected?.sp.length > 0 && !showAdd ?
                    <RpSpSelected detail={detail} showAdd={showAdd} setShowAdd={setShowAdd}/>
                    :
                    <RpSpAdd detail={detail} showAdd={showAdd} setShowAdd={setShowAdd} setDetail={setDetail}/>
                }
            </Grid2>
        </Grid2>
    )
}
