import { Button, Card, Grid2 } from "@mui/material"
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    // height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    // whiteSpace: 'nowrap',
    // width: 1,
});

export const InsertPicture = ({imageList, setImageList}) => {
    const handleUpload = (event) => {
        setImageList([...imageList, ...event.target.files]);
    }
    return (
        <Grid2 container spacing={1}>
            {imageList.map((image, index) => {
                return (
                    <Grid2 size={4} key={index}>
                        <Card onClick={() => console.log(image)}>
                            {/* add button remove image */}
                            <Button
                                style={{
                                    position: 'relative', // ใช้สำหรับจัดตำแหน่ง
                                    display: 'inline-block',
                                    border: 'none',
                                    padding: '0',
                                    margin: '5px',
                                    cursor: 'pointer',
                                    background: 'none', // ลบพื้นหลังของ Button
                                }}
                                onClick={() => {
                                    const newList = imageList.filter((_, i) => i !== index);
                                    setImageList(newList);
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.querySelector('.delete-overlay').style.display = 'flex';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.querySelector('.delete-overlay').style.display = 'none';
                                }}
                            >
                                <div
                                    className="delete-overlay"
                                    style={{
                                        display: 'none', // ซ่อนตอนแรก
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // สีดำโปร่งแสง
                                        justifyContent: 'center', // จัดไอคอนให้อยู่กลางแนวนอน
                                        alignItems: 'center', // จัดไอคอนให้อยู่กลางแนวตั้ง
                                        zIndex: '2',
                                        color: 'white',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    🗑️
                                </div>
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="image"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        borderRadius: '8px',
                                    }}
                                />
                            </Button>

                        </Card>
                    </Grid2>
                )
            })}
            <Grid2 size={12}>
                <Button
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    fullWidth
                >
                    + อัปโหลดรูปภาพ
                    <VisuallyHiddenInput
                        type="file"
                        onChange={(event) => handleUpload(event)}
                        multiple
                        accept="image/*"
                    />
                </Button>
            </Grid2>
        </Grid2>
    )
}