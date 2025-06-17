import {useEffect, useState} from "react";
import React from "react";
import {Box, Button, CircularProgress, Tab, Tabs} from "@mui/material";
import {Download} from "@mui/icons-material";

export default function DmPreview({detail}) {
    const [dmPart, setDmPart] = useState();
    const [valueTab, setValueTab] = useState(0);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        testH().finally(() => setLoading(false));
    }, []);

    const testH = async () => {
        try {
            setLoading(true);
            const fac_model = detail.fac_model || '9999';
            const dm_type = detail.dm_type || 'DM01';
            const {data} = await axios.get(route('dmImage',{pid : detail.pid,fac_model,dm_type}));
            // const {data} = await axios.get(`/image-dm/${detail.pid}/${fac_model}/${dm_type}`)
            setDmPart(data);
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            {loading ? <CircularProgress/> : (
                <>
                    {dmPart && dmPart.length > 0 && (
                        <Box sx={{width: '100%'}}>
                            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                <Tabs value={valueTab} onChange={(e, newValue) => {
                                    setValueTab(newValue);
                                }}>
                                    {dmPart.map((item, index) => (
                                        <Tab
                                            key={index} label={item.layer} id={`simple-tab-${index}`}
                                            aria-controls={`simple-tabpanel-${index}`}
                                        />
                                    ))}
                                </Tabs>
                            </Box>
                            {dmPart.map((item, index) => (
                                <React.Fragment key={index}>
                                    <CustomTabPanel value={valueTab} index={index}>
                                        <img
                                            width='100%' src={item.path_file || ''} alt={'dm_image'}
                                            onError={(e) => {
                                                e.target.src = import.meta.env.VITE_IMAGE_DEFAULT
                                            }}
                                            onClick={()=> {window.open(item.path_file, '_blank')}}
                                        />
                                    </CustomTabPanel>
                                </React.Fragment>
                            ))}
                        </Box>
                    )}
                    {dmPart && dmPart.length === 0 && <img
                        src={import.meta.env.VITE_IMAGE_DEFAULT} alt="ไม่มีรูป" width='100%'
                    />}

                </>
            )}
            <Button
                sx={{my : 1}} variant='outlined' startIcon={<Download/>} fullWidth
                onClick={()=>alert('ยังไม่มีไฟล์ให้ดาวน์โหลด')}
            >
                ดาวน์โหลดไดอะแกรม
            </Button>
        </>
    )
}

function CustomTabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}
