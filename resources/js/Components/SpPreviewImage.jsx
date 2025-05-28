import {Dialog, DialogContent} from "@mui/material";

export default function SpPreviewImage({open, setOpen, imagePath}) {
    return (
        <Dialog open={open} onClose={() => setOpen(false)}
        >
            <DialogContent>
                <img
                    src={imagePath} alt={imagePath || 'no image'}
                    width='100%'
                    onError={(e) => {
                        e.target.src = 'https://images.dcpumpkin.com/images/product/500/default.jpg'
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
