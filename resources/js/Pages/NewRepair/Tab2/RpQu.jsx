import {useEffect, useState} from "react";
import {Button, CircularProgress} from "@mui/material";
import {BuildTwoTone} from "@mui/icons-material";

export default function RpQu({JOB}){

    console.log('JOB => ',JOB)

    const [loading, setLoading] = useState(false);

    const [pathPdf, setPathPdf] = useState();

    useEffect(()=> {
        fetchDataSparePart().finally(() => setLoading(false));
    },[]);

    const fetchDataSparePart = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.post(route('repair.after.qu.index',{
                job_id : JOB.job_id,
            }));
            console.log(data, status)
            setPathPdf(data.pathUrl)
        }catch (error) {

        }
    }

    return (
        <>
            {loading ? (<CircularProgress/>) : (
                <div style={{
                    width: '100%',
                    height: '100%',
                    margin: 0,
                    padding: 0,
                }}>
                    <iframe src={pathPdf} style={{width: '100%', height: '500px'}} title="PDF Viewer">
                        RpQu
                    </iframe>
                </div>
            )}
            {pathPdf &&  <a href={pathPdf} download target='_blank'>ดาวน์โหลด</a>}
        </>
    )
}
