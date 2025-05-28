import {useEffect, useState} from "react";
import {ImagePreview} from "@/Components/ImagePreview.jsx";
import React from "react";
import { Link } from "@inertiajs/react";

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
                        <a href={item.path_file} target="_blank">
                            <img src={item.path_file} alt="ไม่มีรูป" width='100%' />
                        </a>
                        {/* <ImagePreview src={item.path_file} alt='ไม่มีรูป' width='100%'/> */}
                    </React.Fragment>
                )
            })}
        </>
    )
}
