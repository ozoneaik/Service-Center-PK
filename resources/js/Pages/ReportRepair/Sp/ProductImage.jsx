import { useState, useEffect } from "react";
import axios from "axios";
import {ImagePreview} from "@/Components/ImagePreview.jsx";


const fetchImage = async (spcode,spPath) => {
    const path = `${spPath}/${spcode}.jpg`;

    try {
        const response = await axios.head(path); // ใช้ HEAD เพื่อลดโหลดข้อมูล
        if (response.status === 200) {
            return path;
        }
    } catch (error) {
        console.error("Image not found, using default:", error);
    }

    return "https://images.dcpumpkin.com/images/product/500/default.jpg";
};

const ProductImage = ({ spcode,spPath }) => {
    const [imageSrc, setImageSrc] = useState("");

    useEffect(() => {
        console.log(spcode,spPath)
        fetchImage(spcode,spPath).then(setImageSrc);
    }, [spcode]);

    return <ImagePreview src={imageSrc} />;
};

export default ProductImage;
