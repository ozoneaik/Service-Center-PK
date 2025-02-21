import {PhotoProvider, PhotoView} from "react-photo-view";

export const ImagePreview = ({src, width = 50,alt='ไม่มีรูป'}) => (
    <PhotoProvider>
        <PhotoView src={src}>
            <img src={src} alt={alt} width={width}/>
        </PhotoView>
    </PhotoProvider>
)
