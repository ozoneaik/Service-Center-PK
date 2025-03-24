import {PhotoProvider, PhotoView} from "react-photo-view";

export const ImagePreview = ({src = '', width = 50, alt = 'ไม่มีรูป'}) => (
    <PhotoProvider>
        <PhotoView src={src}>
            <img
                src={src}
                alt={alt}
                width={width}
                onError={(e) => {
                    e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg'
                }}
            />

        </PhotoView>
    </PhotoProvider>
)
