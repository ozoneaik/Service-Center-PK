import {useEffect, useState} from "react";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import React from "react";

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
            setDmPart(data);
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            {dmPart && dmPart.map((item,index) => {
                return (
                    <React.Fragment key={index}>
                        <ImagePreview src={item.path_file} alt='ไม่มีรูป' width='100%'/>
                    </React.Fragment>
                )
            })}
        </>
    )
}
