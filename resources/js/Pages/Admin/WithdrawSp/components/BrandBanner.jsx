import { Box, Card, CardActionArea, ButtonGroup, Button } from "@mui/material";
import { showDefaultImage } from "@/utils/showImage";

const norm = (v) => (String(v || "outside").toLowerCase().includes("inside") ? "inside" : "outside");

export default function BrandBanner({
    product,
    diagramLayers = [],
    layout = "outside",
    selectedModel,
    onLayoutChange,
}) {
    if (!product) return null;

    const layers = Array.isArray(diagramLayers) ? diagramLayers : [];
    const byModel = selectedModel ? layers.filter((l) => l.modelfg === selectedModel) : layers;

    // ลำดับเลย์เอาต์ที่มีจริง (คงลำดับ outside -> inside)
    const availableLayouts = ["outside", "inside"].filter((x) =>
        byModel.some((l) => norm(l.layer_char) === x)
    );

    // เลือกรูปตามเลย์เอาต์ที่ต้องการ
    const pickDiagram = (want = layout) => {
        const w = norm(want);
        const exact = byModel.find((l) => norm(l.layer_char) === w);
        const first = exact || byModel[0] || layers[0];
        return first?.path_file;
    };

    const diagramSrc =
        pickDiagram(layout) ||
        product.imagesku ||
        (import.meta.env.VITE_IMAGE_PID ? `${import.meta.env.VITE_IMAGE_PID}${product.pid}.jpg` : null);

    const active = norm(layout);

    return (
        <Card variant="outlined" sx={{ mx: 1.5, mt: 1, overflow: "hidden", borderRadius: 2 }}>
            <CardActionArea disableRipple>
                <Box
                    sx={{
                        width: "100%",
                        aspectRatio: "1/1",
                        position: "relative",
                        bgcolor: "#fff",
                    }}
                >
                    {/* รูปไดอะแกรม */}
                    <Box
                        component="img"
                        src={diagramSrc}
                        alt={product.pname || product.pid}
                        onError={showDefaultImage}
                        sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                        }}
                    />

                    {/* ปุ่มสลับรูป: แสดงเมื่อมีมากกว่า 1 เลย์เอาต์ */}
                    {availableLayouts.length > 1 && (
                        <Box
                            sx={{
                                position: "absolute",
                                right: 8,
                                bottom: 8,
                                bgcolor: "rgba(255,255,255,0.9)",
                                borderRadius: 2,
                                boxShadow: 1,
                            }}
                        >
                            <ButtonGroup size="small" variant="contained">
                                {availableLayouts.map((l) => (
                                    <Button
                                        key={l}
                                        color={active === l ? "primary" : "inherit"}
                                        onClick={() => onLayoutChange?.(l)}
                                        sx={{ textTransform: "none", fontWeight: 700 }}
                                    >
                                        {l === "outside" ? "รูปที่ 1" : "รูปที่ 2"}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Box>
                    )}
                </Box>
            </CardActionArea>
        </Card>
    );
}