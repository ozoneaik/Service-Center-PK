// import React, { useEffect, useRef, useState } from "react";
// import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
// import { Download } from "@mui/icons-material";
// import axios from "axios";

// export default function DmPreview({
//   detail,                 // { pid, fac_model?, dm_type? }
//   diagramLayers = [],     // ถ้ามีจะใช้ชุดนี้เลย
//   initialLayout,          // "outside" | "inside" (ใช้ตั้งค่าแท็บเริ่มต้นเท่านั้น)
//   onLayoutChange,         // (layout, typedm?) => void
// }) {
//   const [layers, setLayers] = useState([]);
//   const [valueTab, setValueTab] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const pid = detail?.pid;
//   const fac_model = detail?.fac_model || "9999";
//   const dm_type = detail?.dm_type || "DM01";

//   const usePropLayers = Array.isArray(diagramLayers) && diagramLayers.length > 0;
//   const propLenKey = usePropLayers ? diagramLayers.length : 0;

//   const lastNotifiedLayoutRef = useRef(null);

//   useEffect(() => {
//     let active = true;

//     const load = async () => {
//       if (!pid) return;
//       try {
//         setLoading(true);

//         let raw = [];
//         if (usePropLayers) {
//           raw = diagramLayers;
//         } else {
//           const { data } = await axios.get(`/image-dm/${pid}/${fac_model}/${dm_type}`);
//           raw = Array.isArray(data) ? data : [];
//         }

//         const mapped = (raw || []).map((x, i) => ({
//           ...x,
//           layer: x?.layer || `รูปที่ ${i + 1}`,
//           path_file: x?.path_file || null,
//           layer_char: (x?.layer_char || (i === 0 ? "outside" : "inside")).toLowerCase().trim(),
//           typedm: x?.typedm || dm_type,
//         }));

//         if (!active) return;

//         setLayers(mapped);

//         const wantLayout = (initialLayout || "outside").toLowerCase().trim();
//         const idx = mapped.findIndex((x) => (x.layer_char || "outside") === wantLayout);
//         const startIndex = idx >= 0 ? idx : 0;
//         setValueTab(startIndex);

//         const first = mapped[startIndex];
//         if (first && typeof onLayoutChange === "function") {
//           if (lastNotifiedLayoutRef.current !== first.layer_char) {
//             lastNotifiedLayoutRef.current = first.layer_char;
//             if (onLayoutChange.length >= 2) onLayoutChange(first.layer_char, first.typedm);
//             else onLayoutChange(first.layer_char);
//           }
//         }
//       } catch (e) {
//         console.error("[DmPreview] load diagram error:", e);
//         if (active) setLayers([]);
//       } finally {
//         if (active) setLoading(false);
//       }
//     };

//     load();
//     return () => {
//       active = false;
//     };
//   }, [pid, fac_model, dm_type, usePropLayers, propLenKey]);

//   const handleChangeTab = (_e, newValue) => {
//     if (newValue < 0 || newValue >= layers.length) return;
//     setValueTab(newValue);

//     const next = layers[newValue];
//     if (next && typeof onLayoutChange === "function") {
//       const nextLayout = next?.layer_char || "outside";
//       const nextType = next?.typedm || dm_type;
//       if (lastNotifiedLayoutRef.current !== nextLayout) {
//         lastNotifiedLayoutRef.current = nextLayout;
//         if (onLayoutChange.length >= 2) onLayoutChange(nextLayout, nextType);
//         else onLayoutChange(nextLayout);
//       }
//     }
//   };

//   const currentIndex = Math.min(valueTab, Math.max(0, layers.length - 1));
//   const cur = layers[currentIndex] || {};

//   return (
//     <>
//       {loading ? (
//         <Box textAlign="center" py={3}><CircularProgress /></Box>
//       ) : layers.length > 0 ? (
//         <Box sx={{ width: "100%" }}>
//           <Tabs value={currentIndex} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
//             {layers.map((item, index) => (
//               <Tab key={index} label={item?.layer || `รูปที่ ${index + 1}`} />
//             ))}
//           </Tabs>

//           {layers.map((item, index) => (
//             <div key={index} hidden={currentIndex !== index}>
//               {currentIndex === index && (
//                 <Box>
//                   <img
//                     width="100%"
//                     src={item?.path_file || ""}
//                     alt={`dm_image_${index + 1}`}
//                     onError={(e) => (e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT)}
//                     style={{ cursor: item?.path_file ? "pointer" : "default" }}
//                     onClick={() => item?.path_file && window.open(item.path_file, "_blank")}
//                   />
//                 </Box>
//               )}
//             </div>
//           ))}
//         </Box>
//       ) : (
//         <Box textAlign="center" py={3}>
//           <img src={import.meta.env.VITE_IMAGE_DEFAULT} alt="ไม่มีรูป" width="100%" />
//         </Box>
//       )}
//       <Button
//         sx={{ my: 1 }}
//         variant="outlined"
//         startIcon={<Download />}
//         fullWidth
//         onClick={() => {
//           if (cur?.path_file) window.open(cur.path_file, "_blank");
//           else alert("ยังไม่มีไฟล์ให้ดาวน์โหลด");
//         }}
//       >
//         ดาวน์โหลดไดอะแกรม
//       </Button>
//     </>
//   );
// }
//------------------------------------------------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
import { Download } from "@mui/icons-material";
import axios from "axios";

export default function DmPreview({
  detail,
  diagramLayers = [],
  initialLayout = 1,
  onLayoutChange,
}) {
  const [layers, setLayers] = useState([]);
  const [valueTab, setValueTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const pid = detail?.pid;
  const fac_model = detail?.fac_model || "9999";
  const dm_type = detail?.dm_type || "DM01";

  const lastNotifiedLayoutRef = useRef(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!pid) return;
      try {
        setLoading(true);

        let raw = [];
        // ถ้า diagramLayers ไม่มีข้อมูล จะ fallback ไปโหลดจาก API
        if (Array.isArray(diagramLayers) && diagramLayers.length > 0) {
          raw = diagramLayers;
        } else {
          const { data } = await axios.get(`/image-dm/${pid}/${fac_model}/${dm_type}`);
          raw = Array.isArray(data) ? data : [];
        }

        // map ให้มี layout เป็นเลขและ path_file ปลอดภัย
        const mapped = (raw || []).map((x, i) => ({
          ...x,
          layer: x?.layer || `รูปที่ ${i + 1}`,
          path_file: x?.path_file || x?.img_url || null,
          layout: Number(x?.layout || i + 1),
          typedm: x?.typedm || dm_type,
        })).filter(x => !!x.path_file);

        if (!active) return;
        setLayers(mapped);

        // กำหนดแท็บเริ่มต้น
        const startIndex = Math.max(0, mapped.findIndex((x) => x.layout === initialLayout));
        setValueTab(startIndex >= 0 ? startIndex : 0);

        // แจ้ง layout เริ่มต้นให้พ่อ
        const first = mapped[startIndex] || mapped[0];
        if (first && typeof onLayoutChange === "function") {
          if (lastNotifiedLayoutRef.current !== first.layout) {
            lastNotifiedLayoutRef.current = first.layout;
            onLayoutChange(first.layout, first.typedm);
          }
        }
      } catch (e) {
        console.error("[DmPreview] load diagram error:", e);
        if (active) setLayers([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [pid, fac_model, dm_type, diagramLayers]);

  const handleChangeTab = (_e, newValue) => {
    if (newValue < 0 || newValue >= layers.length) return;
    setValueTab(newValue);

    const next = layers[newValue];
    if (next && typeof onLayoutChange === "function") {
      const layoutNum = Number(next.layout || newValue + 1);
      const nextType = next?.typedm || dm_type;
      if (lastNotifiedLayoutRef.current !== layoutNum) {
        lastNotifiedLayoutRef.current = layoutNum;
        onLayoutChange(layoutNum, nextType);
      }
    }
  };

  const currentIndex = Math.min(valueTab, Math.max(0, layers.length - 1));
  const cur = layers[currentIndex] || {};

  return (
    <>
      {loading ? (
        <Box textAlign="center" py={3}><CircularProgress /></Box>
      ) : layers.length > 0 ? (
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={currentIndex}
            onChange={handleChangeTab}
            variant="scrollable"
            scrollButtons="auto"
          >
            {layers.map((item, index) => (
              <Tab key={index} label={item?.layer || `รูปที่ ${index + 1}`} />
            ))}
          </Tabs>

          {layers.map((item, index) => (
            <div key={index} hidden={currentIndex !== index}>
              {currentIndex === index && (
                <Box>
                  <img
                    width="100%"
                    src={item?.path_file || ""}
                    alt={`dm_image_${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT;
                    }}
                    style={{ cursor: item?.path_file ? "pointer" : "default" }}
                    onClick={() => item?.path_file && window.open(item.path_file, "_blank")}
                  />
                </Box>
              )}
            </div>
          ))}
        </Box>
      ) : (
        <Box textAlign="center" py={3}>
          <img src={import.meta.env.VITE_IMAGE_DEFAULT} alt="ไม่มีรูป" width="100%" />
        </Box>
      )}
      <Button
        sx={{ my: 1 }}
        variant="outlined"
        startIcon={<Download />}
        fullWidth
        onClick={() => {
          if (cur?.path_file) window.open(cur.path_file, "_blank");
          else alert("ยังไม่มีไฟล์ให้ดาวน์โหลด");
        }}
      >
        ดาวน์โหลดไดอะแกรม
      </Button>
    </>
  );
}