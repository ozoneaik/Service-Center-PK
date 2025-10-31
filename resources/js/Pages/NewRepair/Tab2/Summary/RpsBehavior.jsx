import { Grid2, Paper, Stack, Typography } from "@mui/material";

export default function RpsBehavior({ behaviours }) {
    return (
        // <Stack display={'flex'} flexWrap={"wrap"} spacing={1}>
        //     {behaviours?.map((behaviour, index) => (
        //         <Typography key={index}>
        //             {index + 1}. {behaviour.cause_name}
        //         </Typography>
        //     ))}
        // </Stack>
        <Grid2 container spacing={1}>
            {behaviours?.map((b, i) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            bgcolor: "#f7f7f7",
                            borderRadius: "8px",
                            height: "100%",
                        }}
                    >
                        <Typography variant="body2">
                            <b>{i + 1}.</b> {b.cause_name}
                        </Typography>
                    </Paper>
                </Grid2>
            ))}
        </Grid2>
    )
}