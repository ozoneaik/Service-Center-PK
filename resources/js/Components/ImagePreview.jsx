export const ImagePreview = ({src = '', width = 50, alt = 'ไม่มีรูป'}) => (
    <a href={src} target="_blank">
        <img src={src} width={width} alt={alt} onError={(e) => e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg'}/>
    </a>
    // <PhotoProvider>
    //     <PhotoView src={src}>
    //         <img
    //             src={src}
    //             alt={alt}
    //             width={width}
    //             onError={(e) => {
    //                 e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg'
    //             }}
    //         />

    //     </PhotoView>
    // </PhotoProvider>
)
