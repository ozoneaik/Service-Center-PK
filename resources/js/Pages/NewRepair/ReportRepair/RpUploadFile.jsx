import {Box, Card, CardContent, CircularProgress, Grid2, Tab, Tabs} from "@mui/material";
import React, {useEffect, useState} from "react";

export default function RpUploadFile({job_id}) {
    const [tabValue, setTabValue] = useState(0);
    const [loadingPage, setLoadingPage] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    useEffect(() => {
        fetchData().finally(() => setLoadingPage(false));
    }, []);

    const fetchData = async () => {
        try {
            setLoadingPage(true);
            const {data, status} = await axios.get(route('repair.upload-file.detail', {job_id}));
            console.log(data, status)
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            {!loadingPage ? (
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Card variant='outlined'>
                            <CardContent>
                                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                    <Tabs
                                        value={tabValue}
                                        onChange={(_, newValue) => setTabValue(newValue)}
                                        aria-label="tabs"
                                    >
                                        <Tab label="ภาพประกอบสำหรับการเคลม"/>
                                        <Tab label="สำหรับศูนย์ซ่อมใช้ภายใน"/>
                                    </Tabs>
                                </Box>

                                <CustomTabPanel value={tabValue} index={0}>
                                    0
                                </CustomTabPanel>

                                <CustomTabPanel value={tabValue} index={1}>
                                    1
                                </CustomTabPanel>
                            </CardContent>
                        </Card>
                    </Grid2>
                </Grid2>
            ) : <CircularProgress/>}
        </>
    )
}

const CustomTabPanel = ({children, value, index, ...other}) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
    >
        {value === index && <Box sx={{p: 3}}>{children}</Box>}
    </div>
);
