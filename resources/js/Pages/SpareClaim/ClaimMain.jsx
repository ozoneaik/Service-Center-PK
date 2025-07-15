import {Breadcrumbs, Grid2, Typography} from "@mui/material";
import AlreadyClaim from "@/Pages/SpareClaim/AlreadyClaim.jsx";

import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";

export default function ClaimMain({spareParts}) {
    return (
        <LayoutClaim>
            <Grid2 container>
                <Grid2 size={12}>
                    <Breadcrumbs>
                        <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                        <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                    </Breadcrumbs>
                </Grid2>
                <Grid2 size={12}>

                    <AlreadyClaim spareParts={spareParts}/>
                </Grid2>
            </Grid2>
        </LayoutClaim>


    )
}
