// import React, { useEffect, useState } from "react";
// import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
// import { Download } from "@mui/icons-material";
// import axios from "axios";

// export default function DmPreview({ detail, diagramLayers = [], initialLayout, onLayoutChange }) {
//     const [dmPart, setDmPart] = useState([]);
//     const [valueTab, setValueTab] = useState(0);
//     const [loading, setLoading] = useState(false);

//     // useEffect(() => {
//     //     const loadDiagram = async () => {
//     //         try {
//     //             setLoading(true);
//     //             const pid = detail?.pid;

//     //             if (!pid) {
//     //                 setDmPart([]);
//     //                 setLoading(false);
//     //                 return;
//     //             }

//     //             if (diagramLayers && diagramLayers.length > 0) {
//     //                 console.log('Using diagram layers from Laravel:', diagramLayers);
//     //                 setDmPart(diagramLayers);
//     //                 if (initialLayout) {
//     //                     const targetIdx = diagramLayers.findIndex(
//     //                         (x) => (x.layer_char || "outside") === initialLayout
//     //                     );
//     //                     setValueTab(targetIdx >= 0 ? targetIdx : 0);
//     //                 } else {
//     //                     setValueTab(0);
//     //                 }
//     //             } else {
//     //                 console.log('No diagram layers from Laravel, fetching from API...');
//     //                 const fac_model = detail?.fac_model || "9999";
//     //                 const dm_type = detail?.dm_type || "DM01";
//     //                 const { data } = await axios.get(`/image-dm/${pid}/${fac_model}/${dm_type}`);
//     //                 const layers = Array.isArray(data) ? data : [];
//     //                 console.log('Loaded diagram layers from API:', layers);
//     //                 setDmPart(layers);
//     //                 if (initialLayout && layers.length > 0) {
//     //                     const targetIdx = layers.findIndex(
//     //                         (x) => (x.layer_char || "outside") === initialLayout
//     //                     );
//     //                     setValueTab(targetIdx >= 0 ? targetIdx : 0);
//     //                 } else {
//     //                     setValueTab(0);
//     //                 }
//     //             }
//     //         } catch (error) {
//     //             console.error('Error loading diagrams:', error);
//     //             setDmPart([]);
//     //         } finally {
//     //             setLoading(false);
//     //         }
//     //     };

//     //     loadDiagram();
//     // }, [detail?.pid, diagramLayers, initialLayout]);

//     useEffect(() => {
//         const loadDiagram = async () => {
//             if (!detail?.pid) return;
//             try {
//                 setLoading(true);
//                 if (diagramLayers?.length > 0) {
//                     setDmPart(diagramLayers);
//                     const targetIdx = diagramLayers.findIndex(
//                         x => (x.layer_char || "outside") === initialLayout
//                     );
//                     setValueTab(targetIdx >= 0 ? targetIdx : 0);
//                 } else {
//                     const fac_model = detail?.fac_model || "9999";
//                     const dm_type = detail?.dm_type || "DM01";
//                     const { data } = await axios.get(`/image-dm/${detail.pid}/${fac_model}/${dm_type}`);
//                     setDmPart(Array.isArray(data) ? data : []);
//                 }
//             } catch (error) {
//                 console.error('Error loading diagrams:', error);
//                 setDmPart([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         loadDiagram();
//     }, [detail?.pid]);

//     const handleChangeTab = (_e, newValue) => {
//         if (newValue < 0 || newValue >= dmPart.length) {
//             console.warn('Invalid tab index:', newValue);
//             return;
//         }

//         setValueTab(newValue);

//         if (onLayoutChange && dmPart[newValue]) {
//             const nextLayout = dmPart[newValue].layer_char || "outside";
//             console.log('Layout changed to:', nextLayout);
//             onLayoutChange(nextLayout);
//         }
//     };

//     const currentIndex = Math.min(valueTab, Math.max(0, dmPart.length - 1));
//     const cur = dmPart[currentIndex];

//     return (
//         <>
//             {loading ? (
//                 <Box textAlign="center" py={3}>
//                     <CircularProgress />
//                 </Box>
//             ) : dmPart.length > 0 ? (
//                 <Box sx={{ width: "100%" }}>
//                     <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
//                         <Tabs
//                             value={currentIndex}
//                             onChange={handleChangeTab}
//                             variant="scrollable"
//                             scrollButtons="auto"
//                         >
//                             {dmPart.map((item, index) => (
//                                 <Tab
//                                     key={index}
//                                     label={item?.layer || `รูปที่ ${index + 1}`}
//                                     id={`simple-tab-${index}`}
//                                     aria-controls={`simple-tabpanel-${index}`}
//                                 />
//                             ))}
//                         </Tabs>
//                     </Box>

//                     {dmPart.map((item, index) => (
//                         <div
//                             key={index}
//                             role="tabpanel"
//                             hidden={currentIndex !== index}
//                             id={`simple-tabpanel-${index}`}
//                         >
//                             {currentIndex === index && (
//                                 <Box>
//                                     <img
//                                         width="100%"
//                                         src={item?.path_file || ""}
//                                         alt={`dm_image_${index + 1}`}
//                                         onError={(e) => {
//                                             e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT;
//                                         }}
//                                         style={{ cursor: item?.path_file ? "pointer" : "default" }}
//                                         onClick={() => item?.path_file && window.open(item.path_file, "_blank")}
//                                     />
//                                 </Box>
//                             )}
//                         </div>
//                     ))}
//                 </Box>
//             ) : (
//                 <Box textAlign="center" py={3}>
//                     <img src={import.meta.env.VITE_IMAGE_DEFAULT} alt="ไม่มีรูป" width="100%" />
//                 </Box>
//             )}

//             <Button
//                 sx={{ my: 1 }}
//                 variant="outlined"
//                 startIcon={<Download />}
//                 fullWidth
//                 onClick={() => {
//                     if (cur?.path_file) window.open(cur.path_file, "_blank");
//                     else alert("ยังไม่มีไฟล์ให้ดาวน์โหลด");
//                 }}
//             >
//                 ดาวน์โหลดไดอะแกรม
//             </Button>
//         </>
//     );
// }

//-----------------------------------------2----------------------------------------------------
// import React, { useEffect, useState } from "react";
// import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
// import { Download } from "@mui/icons-material";
// import axios from "axios";

// export default function DmPreview({ detail, diagramLayers = [], initialLayout, onLayoutChange }) {
//   const [dmPart, setDmPart] = useState([]);
//   const [valueTab, setValueTab] = useState(0);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const loadDiagram = async () => {
//       if (!detail?.pid) return;
//       try {
//         setLoading(true);
//         let layers = [];
//         if (diagramLayers?.length > 0) {
//           layers = diagramLayers;
//           console.log("[DmPreview] use layers from BE:", layers);
//         } else {
//           const fac_model = detail?.fac_model || "9999";
//           const dm_type = detail?.dm_type || "DM01";
//           const { data } = await axios.get(`/image-dm/${detail.pid}/${fac_model}/${dm_type}`);
//           layers = Array.isArray(data) ? data : [];
//           console.log("[DmPreview] layers from /image-dm:", layers);
//         }

//         layers = layers.map((x, i) => ({
//           ...x,
//           layer: x?.layer || `รูปที่ ${i + 1}`,
//           layer_char: (x?.layer_char || (i === 0 ? "outside" : "inside")).toLowerCase().trim(),
//         }));

//         setDmPart(layers);

//         const want = (initialLayout || "outside").toLowerCase().trim();
//         const idx = layers.findIndex((x) => (x.layer_char || "outside") === want);
//         const startIndex = idx >= 0 ? idx : 0;
//         setValueTab(startIndex);

//         onLayoutChange?.(layers[startIndex].layer_char);
//         console.log(`[DmPreview] initial -> รูปที่ ${startIndex + 1}, layout = ${layers[startIndex].layer_char}`);
//       } catch (error) {
//         console.error("Error loading diagrams:", error);
//         setDmPart([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadDiagram();
//   }, [detail?.pid, diagramLayers?.length, initialLayout]);

//   const handleChangeTab = (_e, newValue) => {
//     if (newValue < 0 || newValue >= dmPart.length) {
//       console.warn("Invalid tab index:", newValue);
//       return;
//     }
//     setValueTab(newValue);
//     const nextLayout = dmPart[newValue]?.layer_char || "outside";
//     console.log(`[DmPreview] click รูปที่ ${newValue + 1} -> layout = ${nextLayout}`);
//     onLayoutChange?.(nextLayout);
//   };

//   const currentIndex = Math.min(valueTab, Math.max(0, dmPart.length - 1));
//   const cur = dmPart[currentIndex];

//   return (
//     <>
//       {loading ? (
//         <Box textAlign="center" py={3}>
//           <CircularProgress />
//         </Box>
//       ) : dmPart.length > 0 ? (
//         <Box sx={{ width: "100%" }}>
//           <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
//             <Tabs
//               value={currentIndex}
//               onChange={handleChangeTab}
//               variant="scrollable"
//               scrollButtons="auto"
//             >
//               {dmPart.map((item, index) => (
//                 <Tab
//                   key={index}
//                   label={item?.layer || `รูปที่ ${index + 1}`}
//                   id={`simple-tab-${index}`}
//                   aria-controls={`simple-tabpanel-${index}`}
//                 />
//               ))}
//             </Tabs>
//           </Box>

//           {dmPart.map((item, index) => (
//             <div
//               key={index}
//               role="tabpanel"
//               hidden={currentIndex !== index}
//               id={`simple-tabpanel-${index}`}
//             >
//               {currentIndex === index && (
//                 <Box>
//                   <img
//                     width="100%"
//                     src={item?.path_file || ""}
//                     alt={`dm_image_${index + 1}`}
//                     onError={(e) => {
//                       e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT;
//                     }}
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

//--------------------------------------3-------------------------------------------
// import React, { useEffect, useState } from "react";
// import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
// import { Download } from "@mui/icons-material";
// import axios from "axios";

// export default function DmPreview({ detail, diagramLayers = [], initialLayout, onLayoutChange }) {
//   const [dmPart, setDmPart] = useState([]);
//   const [valueTab, setValueTab] = useState(0);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const loadDiagram = async () => {
//       if (!detail?.pid) return;
//       try {
//         setLoading(true);
//         let layers = [];

//         if (diagramLayers?.length > 0) {
//           layers = diagramLayers;
//           console.log("[DmPreview] use layers from backend:", layers);
//         }
//         else {
//           const fac_model = detail?.fac_model || "9999";
//           const dm_type = detail?.dm_type || "DM01";
//           const { data } = await axios.get(`/image-dm/${detail.pid}/${fac_model}/${dm_type}`);
//           layers = Array.isArray(data) ? data : [];
//           console.log("[DmPreview] layers from /image-dm:", layers);
//         }

//         layers = layers.map((x, i) => ({
//           ...x,
//           layer: x?.layer || `รูปที่ ${i + 1}`,
//           layer_char: (x?.layer_char || (i === 0 ? "outside" : "inside")).toLowerCase().trim(),
//           typedm: x?.typedm || "DM01",
//         }));

//         setDmPart(layers);
//         const want = (initialLayout || "outside").toLowerCase().trim();
//         const idx = layers.findIndex((x) => (x.layer_char || "outside") === want);
//         const startIndex = idx >= 0 ? idx : 0;
//         setValueTab(startIndex);

//         const first = layers[startIndex];
//         console.log(`[DmPreview] initial -> รูปที่ ${startIndex + 1}, layout=${first.layer_char}, typedm=${first.typedm}`);

//         if (onLayoutChange) {
//           if (onLayoutChange.length >= 2) onLayoutChange(first.layer_char, first.typedm);
//           else onLayoutChange(first.layer_char);
//         }
//       } catch (error) {
//         console.error("Error loading diagrams:", error);
//         setDmPart([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDiagram();
//   }, [detail?.pid, diagramLayers?.length, initialLayout]);

//   const handleChangeTab = (_e, newValue) => {
//     if (newValue < 0 || newValue >= dmPart.length) {
//       console.warn("Invalid tab index:", newValue);
//       return;
//     }

//     setValueTab(newValue);
//     const next = dmPart[newValue];
//     const nextLayout = next?.layer_char || "outside";
//     const nextType = next?.typedm || "DM01";

//     console.log(`[DmPreview] click รูปที่ ${newValue + 1} -> layout=${nextLayout}, typedm=${nextType}`);

//     if (onLayoutChange) {
//       if (onLayoutChange.length >= 2) onLayoutChange(nextLayout, nextType);
//       else onLayoutChange(nextLayout);
//     }
//   };

//   const currentIndex = Math.min(valueTab, Math.max(0, dmPart.length - 1));
//   const cur = dmPart[currentIndex];

//   return (
//     <>
//       {loading ? (
//         <Box textAlign="center" py={3}>
//           <CircularProgress />
//         </Box>
//       ) : dmPart.length > 0 ? (
//         <Box sx={{ width: "100%" }}>
//           <Tabs value={currentIndex} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
//             {dmPart.map((item, index) => (
//               <Tab key={index} label={item?.layer || `รูปที่ ${index + 1}`} id={`simple-tab-${index}`} />
//             ))}
//           </Tabs>
//           {dmPart.map((item, index) => (
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

//-----------------------------------------4----------------------------------------
// import React, { useEffect, useState } from "react";
// import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
// import { Download } from "@mui/icons-material";

// export default function DmPreview({ detail, diagramLayers = [] }) {
//   const [layers, setLayers] = useState([]);
//   const [valueTab, setValueTab] = useState(0);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // diagramLayers ที่ส่งเข้ามา คือของ "โมเดลที่เลือก" แล้ว
//     setLoading(true);
//     const arr = (diagramLayers || []).map((x, i) => ({
//       layer: x?.layer || `รูปที่ ${i + 1}`,
//       path_file: x?.path_file || null,
//     }));
//     setLayers(arr);
//     setValueTab(0);
//     setLoading(false);
//   }, [detail?.pid, diagramLayers]);

//   const handleChangeTab = (_e, newValue) => {
//     if (newValue < 0 || newValue >= layers.length) return;
//     setValueTab(newValue);
//   };

//   const cur = layers[valueTab] || {};

//   return (
//     <>
//       {loading ? (
//         <Box textAlign="center" py={3}>
//           <CircularProgress />
//         </Box>
//       ) : layers.length > 0 ? (
//         <Box sx={{ width: "100%" }}>
//           <Tabs value={valueTab} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
//             {layers.map((item, index) => (
//               <Tab key={index} label={item?.layer || `รูปที่ ${index + 1}`} />
//             ))}
//           </Tabs>
//           {layers.map((item, index) => (
//             <div key={index} hidden={valueTab !== index}>
//               {valueTab === index && (
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

//-----------------------------------------5------------------------------------------
// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
// import { Download } from "@mui/icons-material";
// import axios from "axios";

// export default function DmPreview({
//   detail,                 // { pid, fac_model?, dm_type? }
//   diagramLayers = [],     // รูปจาก parent (กรองตามโมเดลมาแล้ว)
//   initialLayout,          // "outside" | "inside"
//   onLayoutChange,         // (layout, typedm?) => void
// }) {
//   const [layers, setLayers] = useState([]);
//   const [valueTab, setValueTab] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const pid = detail?.pid;
//   const fac_model = detail?.fac_model || "9999";
//   const dm_type = detail?.dm_type || "DM01";

//   const usePropLayers = Array.isArray(diagramLayers) && diagramLayers.length > 0;

//   // 🔑 key ที่จะเปลี่ยนเมื่อชุดรูป “จริง ๆ” เปลี่ยน (เช่นเปลี่ยนโมเดล)
//   const layersKey = useMemo(() => {
//     if (!usePropLayers) return "";
//     try {
//       return diagramLayers
//         .map(d => `${d.modelfg || ""}|${d.layer_char || ""}|${d.path_file || ""}`)
//         .join("::");
//     } catch {
//       return String(diagramLayers.length);
//     }
//   }, [usePropLayers, diagramLayers]);

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
//           // fallback ไปโหลดจาก API ถ้า parent ไม่ได้ส่งรูปมา
//           const { data } = await axios.get(`/image-dm/${pid}/${fac_model}/${dm_type}`);
//           raw = Array.isArray(data) ? data : [];
//         }

//         const mapped = (raw || []).map((x, i) => ({
//           ...x,
//           layer: x?.layer || `รูปที่ ${i + 1}`,
//           path_file: x?.path_file || null,
//           layer_char: (x?.layer_char || (i === 0 ? "outside" : "inside"))
//             .toLowerCase()
//             .trim(),
//           typedm: x?.typedm || dm_type,
//         }));

//         if (!active) return;

//         setLayers(mapped);

//         // ตั้งแท็บเริ่มต้นตาม initialLayout (ถ้าไม่เจอ ใช้ index 0)
//         const wantLayout = (initialLayout || "outside").toLowerCase().trim();
//         const idx = mapped.findIndex(
//           (x) => (x.layer_char || "outside") === wantLayout
//         );
//         const startIndex = idx >= 0 ? idx : 0;
//         setValueTab(startIndex);

//         // reset layout notify เมื่อรูปชุดใหม่เข้ามา
//         lastNotifiedLayoutRef.current = null;

//         // แจ้ง parent layout เริ่มต้นเมื่อเปลี่ยนจริง
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

//     // ✅ ถ้า parent ส่งรูปมา ใช้ layersKey เป็นตัวบังคับ reload เมื่อโมเดล/รูปเปลี่ยน
//     // ✅ ถ้าไม่ได้ส่งรูปมา ให้ฟังตาม pid/fac_model/dm_type เพื่อโหลดจาก API
//   }, [pid, fac_model, dm_type, usePropLayers, layersKey, initialLayout, onLayoutChange]);

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
//         <Box textAlign="center" py={3}>
//           <CircularProgress />
//         </Box>
//       ) : layers.length > 0 ? (
//         <Box sx={{ width: "100%" }}>
//           <Tabs
//             value={currentIndex}
//             onChange={handleChangeTab}
//             variant="scrollable"
//             scrollButtons="auto"
//           >
//             {layers.map((item, index) => (
//               <Tab key={`${item.path_file || index}`} label={item?.layer || `รูปที่ ${index + 1}`} />
//             ))}
//           </Tabs>

//           {layers.map((item, index) => (
//             <div key={`${item.path_file || index}-panel`} hidden={currentIndex !== index}>
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


//------------------------------------latest-------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
import { Download } from "@mui/icons-material";
import axios from "axios";

export default function DmPreview({
  detail,                 // { pid, fac_model?, dm_type? }
  diagramLayers = [],     // ถ้ามีจะใช้ชุดนี้เลย
  initialLayout,          // "outside" | "inside" (ใช้ตั้งค่าแท็บเริ่มต้นเท่านั้น)
  onLayoutChange,         // (layout, typedm?) => void
}) {
  const [layers, setLayers] = useState([]);
  const [valueTab, setValueTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const pid = detail?.pid;
  const fac_model = detail?.fac_model || "9999";
  const dm_type = detail?.dm_type || "DM01";

  const usePropLayers = Array.isArray(diagramLayers) && diagramLayers.length > 0;
  const propLenKey = usePropLayers ? diagramLayers.length : 0;

  const lastNotifiedLayoutRef = useRef(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!pid) return;
      try {
        setLoading(true);

        let raw = [];
        if (usePropLayers) {
          raw = diagramLayers;
        } else {
          const { data } = await axios.get(`/image-dm/${pid}/${fac_model}/${dm_type}`);
          raw = Array.isArray(data) ? data : [];
        }

        const mapped = (raw || []).map((x, i) => ({
          ...x,
          layer: x?.layer || `รูปที่ ${i + 1}`,
          path_file: x?.path_file || null,
          layer_char: (x?.layer_char || (i === 0 ? "outside" : "inside")).toLowerCase().trim(),
          typedm: x?.typedm || dm_type,
        }));

        if (!active) return;

        setLayers(mapped);

        const wantLayout = (initialLayout || "outside").toLowerCase().trim();
        const idx = mapped.findIndex((x) => (x.layer_char || "outside") === wantLayout);
        const startIndex = idx >= 0 ? idx : 0;
        setValueTab(startIndex);

        const first = mapped[startIndex];
        if (first && typeof onLayoutChange === "function") {
          if (lastNotifiedLayoutRef.current !== first.layer_char) {
            lastNotifiedLayoutRef.current = first.layer_char;
            if (onLayoutChange.length >= 2) onLayoutChange(first.layer_char, first.typedm);
            else onLayoutChange(first.layer_char);
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
  }, [pid, fac_model, dm_type, usePropLayers, propLenKey]);

  const handleChangeTab = (_e, newValue) => {
    if (newValue < 0 || newValue >= layers.length) return;
    setValueTab(newValue);

    const next = layers[newValue];
    if (next && typeof onLayoutChange === "function") {
      const nextLayout = next?.layer_char || "outside";
      const nextType = next?.typedm || dm_type;
      if (lastNotifiedLayoutRef.current !== nextLayout) {
        lastNotifiedLayoutRef.current = nextLayout;
        if (onLayoutChange.length >= 2) onLayoutChange(nextLayout, nextType);
        else onLayoutChange(nextLayout);
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
          <Tabs value={currentIndex} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
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
                    onError={(e) => (e.currentTarget.src = import.meta.env.VITE_IMAGE_DEFAULT)}
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