import { useState } from "react";
import axios from "axios";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { Box, Button, Card, CardContent, Grid2, Stack, Typography, Chip } from "@mui/material";
import { showDefaultImage } from "@/utils/showImage";
import { AlertDialog } from "@/Components/AlertDialog";

const DEFAULT_SP_IMG =
  (import.meta.env.VITE_IMAGE_SP || "https://images.dcpumpkin.com/images/product/500/") + "default.jpg";

export default function SpGridMobile({ spList = [], onAdded, onPreview }) {
  const [loadingId, setLoadingId] = useState(null);

  const money = (n) =>
    n != null ? `${Number(n).toLocaleString()} ฿` : "—";

  const handleAddToCart = async (sp) => {
    try {
      const stockQty = Number(sp.stock_balance ?? 0);
      if (stockQty <= 0) {
        AlertDialog({
          title: "สต็อกไม่เพียงพอ",
          text: `สินค้า "${sp.spname}" ไม่มีสต็อกคงเหลือ ไม่สามารถเพิ่มในตะกร้าได้`,
          icon: "warning",
        });
        return;
      }

      setLoadingId(sp.spcode);
      const { status } = await axios.post(route("withdrawSp.carts.add"), {
        ...sp,
        skufg: sp.skufg,
        pname: sp.pname,
        remark: "มาจากการเบิก",
      });
      if (status === 200) onAdded?.(sp);
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Grid2 container spacing={1} sx={{ px: 1.5, py: 1 }}>
      {spList.map((sp) => {
        const stockQty = Number(sp.stock_balance ?? 0);
        const outOfStock = stockQty <= 0;

        return (
          <Grid2 key={sp.spcode} size={6}>
            <Card variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
              {/* รูป + Badge ตำแหน่งไดอะแกรม */}
              <Box sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src={sp.path_file || DEFAULT_SP_IMG}
                  alt={sp.spname}
                  onError={showDefaultImage}
                  onClick={() => onPreview?.(sp.path_file || DEFAULT_SP_IMG, sp.spname || sp.spcode)}
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    display: "block",
                    cursor: "zoom-in",
                  }}
                />
                {sp.tracking_number && (
                  <Box
                    title={`ตำแหน่งไดอะแกรม: ${sp.tracking_number}`}
                    sx={{
                      position: "absolute",
                      left: 8,
                      bottom: 8,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: "rgba(0,0,0,0.65)",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    #{sp.tracking_number}
                  </Box>
                )}
              </Box>

              <CardContent sx={{ p: 1 }}>
                {/* ชื่อ + รหัส */}
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap title={sp.spname}>
                  {sp.spname || "-"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {sp.spcode}
                </Typography>

                {/* โมเดล + เลย์เอาต์ */}
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                  {sp.modelfg && (
                    <Chip size="small" label={`โมเดล: ${sp.modelfg}`} variant="outlined" />
                  )}
                  {sp.layout && (
                    <Chip
                      size="small"
                      label={String(sp.layout).toLowerCase().trim() === "inside" ? "Inside" : "Outside"}
                      variant="outlined"
                    />
                  )}
                </Stack>

                {/* สต็อกคงเหลือ */}
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
                  <Typography variant="caption" color="text.secondary">
                    คงเหลือ:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, color: outOfStock ? "error.main" : "primary.main" }}
                  >
                    {stockQty} {sp.spunit || "ชิ้น"}
                  </Typography>
                </Stack>

                {/* ราคาตั้ง / ราคาทุน (ให้ตรงกับ Desktop) */}
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.25 }}>
                  <Typography variant="caption" color="text.secondary">
                    ราคาตั้ง
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {money(sp.stdprice_per_unit)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    ราคาทุน
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {money(sp.price_per_unit)}
                  </Typography>
                </Stack>

                {/* ปุ่มเพิ่มในตะกร้า */}
                <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mt: 0.75 }}>
                  {sp.added ? (
                    <Button size="small" disabled>
                      เพิ่มแล้ว
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddShoppingCartIcon fontSize="small" />}
                      onClick={() => handleAddToCart(sp)}
                      disabled={loadingId === sp.spcode || outOfStock}
                    >
                      {outOfStock ? "สต็อกหมด" : loadingId === sp.spcode ? "เพิ่ม..." : "เพิ่ม"}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        );
      })}
    </Grid2>
  );
}
