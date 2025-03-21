import {useEffect, useState} from "react";
import {ImagePreview} from "@/Components/ImagePreview.jsx";

export default function DmPreview({detail}){
    const [dmPart,setDmPart] = useState();
    useEffect(() => {
        console.log('fetch DM image',detail)
        testH().then(r => {});
    }, []);

    const testH = async () => {
        try {
            const {data, status} = await axios.get(`/image-dm/${detail.pid}`)
            console.log(data, status)
            console.log('รูป DM => ',data);
            setDmPart(data.path_file_dm);
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <ImagePreview src={dmPart ? dmPart : ''} alt='ไม่มีรูป' width='100%'/>
    )
}
