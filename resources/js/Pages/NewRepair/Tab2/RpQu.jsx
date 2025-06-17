import {useEffect, useState} from "react";
import {Button, CircularProgress, Grid2, Stack} from "@mui/material";
import {ArrowRight, Assignment, Download} from "@mui/icons-material";

export default function RpQu({JOB,setStepForm}) {

    console.log('JOB => ', JOB)

    const [loading, setLoading] = useState(false);

    const [pathPdf, setPathPdf] = useState();

    useEffect(() => {
        // fetchDataSparePart().finally(() => setLoading(false));
    }, []);

    const fetchDataSparePart = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.post(route('repair.after.qu.index', {
                job_id: JOB.job_id,
            }));
            console.log(data, status)
            setPathPdf(data.pathUrl)
            window.open(data.pathUrl,'_blank');
        } catch (error) {
            console.log(error)
        }
    }

    const getQuotation = () => {
        fetchDataSparePart().finally(() => setLoading(false));
    }

    const downloadFile = () => {
        const link = document.createElement('a');
        link.href = pathPdf;
        link.target = '_blank';
        link.download = `ใบเสนอราคา ${JOB.job_id} ${JOB.serial_id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <Stack direction={{sm : 'row' , xs : 'column'}} justifyContent={{sm : 'space-between' , xs : 'start'}} gap={2}>
                    <Button loading={loading} variant='contained' startIcon={<Assignment/>} onClick={getQuotation}>
                        {loading ? 'กำลังสร้างใบเสนอราคา' : 'สร้างใบเสนอราคา'}
                    </Button>
                    {pathPdf && (
                        <Button
                            variant='contained' startIcon={<Download/>}
                            id='download' color='success' onClick={downloadFile}
                        >
                            ดาวน์โหลด
                        </Button>
                    )}
                </Stack>
            </Grid2>
            {/*<Grid2 size={12}>*/}
            {/*    {pathPdf && (*/}
            {/*        <div style={{*/}
            {/*            width: '100%',*/}
            {/*            height: '100%',*/}
            {/*            margin: 0,*/}
            {/*            padding: 0,*/}
            {/*        }}>*/}
            {/*            <iframe src={pathPdf} style={{width: '100%', height: '500px'}} title="PDF Viewer">*/}
            {/*                RpQu*/}
            {/*            </iframe>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</Grid2>*/}
                {!pathPdf && (
            <Grid2 size={12}>
                <Stack direction='row' justifyContent='end' onClick={()=>setStepForm(3)}>
                    <Button variant='contained' color='secondary' endIcon={<ArrowRight/>}>ไปยังฟอร์ม สภาพสินค้าหลังซ่อม</Button>
                </Stack>
            </Grid2>
                )}

        </Grid2>
    )
}
