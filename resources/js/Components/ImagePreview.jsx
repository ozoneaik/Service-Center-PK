import {PhotoProvider, PhotoView} from "react-photo-view";

export const ImagePreview = ({src, width = '50'}) => (
    <PhotoProvider>
        <PhotoView src={src}>
            <img src={src} alt="" width={width}/>
        </PhotoView>
    </PhotoProvider>
)
