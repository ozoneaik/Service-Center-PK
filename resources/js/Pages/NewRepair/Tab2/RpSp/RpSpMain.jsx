// ----------------------------------------------------------------------------
// import {
//   Alert,
//   Card,
//   CardContent,
//   CircularProgress,
//   Grid2,
//   Stack,
//   Box,
// } from "@mui/material";
// import PaletteIcon from "@mui/icons-material/Palette";
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import DmPreview from "@/Components/DmPreview.jsx";
// import RpSpAdd from "@/Pages/NewRepair/Tab2/RpSp/RpSpAdd.jsx";
// import RpSpSummary from "@/Pages/NewRepair/Tab2/RpSp/RpSpSummary.jsx";

// export default function RpSpMain({ listSparePart, productDetail, setStepForm, JOB, subremark1 }) {
//   const pid = productDetail.pid;
//   const fac_model = productDetail.facmodel;
//   const DM = productDetail.dm || "DM01";

//   const memoDiagramLayers = useMemo(() => productDetail?.diagram_layers || [], [productDetail?.diagram_layers]);
//   const defaultLayout = (productDetail?.active_layout || "outside").toLowerCase().trim();

//   const [loading, setLoading] = useState(false);
//   const [spSelected, setSpSelected] = useState([]);
//   const [showSummary, setShowSummary] = useState(false);
//   const [activeLayout, setActiveLayout] = useState(defaultLayout);
//   const [filteredList, setFilteredList] = useState([]);

//   // โหลดข้อมูลอะไหล่ที่เคยเลือก
//   useEffect(() => {
//     fetchData().finally(() => setLoading(false));
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(
//         route("repair.after.spare-part.index", {
//           serial_id: JOB.serial_id,
//           job_id: JOB.job_id,
//         })
//       );
//       setSpSelected(data.spare_parts);
//       if (data.spare_parts.length > 0) setShowSummary(true);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleAddSpare = (newSpares) => {
//     setSpSelected(() => {
//       const updated = newSpares.filter(
//         (item, index, self) => index === self.findIndex((i) => i.spcode === item.spcode)
//       );
//       return updated;
//     });
//     setShowSummary(true);
//   };

//   const handleUpdateSpSelected = (updatedSpares) => setSpSelected(updatedSpares);

//   const Saved = (full_file_path = null) => {
//     setStepForm(2);
//     if (full_file_path) window.open(full_file_path, "_blank");
//   };

//   // ฟิลเตอร์ list ตาม layout (inside / outside)
//   useEffect(() => {
//     const want = (activeLayout || "outside").toLowerCase().trim();
//     const byLayout = listSparePart.filter(
//       (x) => ((x.layout || "outside") + "").toLowerCase().trim() === want
//     );
//     setFilteredList(byLayout.length ? byLayout : listSparePart);
//   }, [listSparePart, activeLayout]);

//   // const diagramLayers = memoDiagramLayers;
//   const diagramLayers = useMemo(() => {
//     const layers = memoDiagramLayers || [];
//     const unique = [];
//     const seen = new Set();

//     layers.forEach((layer) => {
//       const key = `${layer.path_file}_${layer.layer_char}_${layer.typedm}`;
//       if (!seen.has(key)) {
//         seen.add(key);
//         unique.push(layer);
//       }
//     });
//     return unique;
//   }, [memoDiagramLayers]);

//   const firstDiagramLayout = diagramLayers.length > 0
//     ? (diagramLayers[0].layer_char || "outside").toLowerCase().trim()
//     : "outside";

//   const isFirstDiagram = (activeLayout || "").toLowerCase().trim() === firstDiagramLayout;

//   return (
//     <>
//       {loading ? (
//         <CircularProgress />
//       ) : (
//         <>
//           {showSummary ? (
//             <RpSpSummary
//               JOB={JOB}
//               spSelected={spSelected}
//               setShowSummary={setShowSummary}
//               onUpdateSpSelected={handleUpdateSpSelected}
//               onSaved={(full_file_path) => Saved(full_file_path)}
//             />
//           ) : (
//             <Grid2 container spacing={2}>

//               {/* ซ้าย: Diagram แสดงรูป Inside/Outside */}
//               <Grid2 size={{ md: 3, sm: 12 }}>
//                 <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: 1 }}>
//                   <CardContent sx={{ flex: 1, overflowY: "auto" }}>
//                     <DmPreview
//                       detail={{ pid, fac_model, dm_type: DM }}
//                       diagramLayers={diagramLayers}
//                       initialLayout={defaultLayout}
//                       onLayoutChange={(layout) => {
//                         const next = (layout || "outside").toLowerCase().trim();
//                         setActiveLayout(next);
//                       }}
//                     />
//                   </CardContent>
//                 </Card>
//               </Grid2>

//               {/* ขวา: รายการอะไหล่ */}
//               <Grid2 size={{ md: 9, sm: 12 }}>
//                 <Grid2 container spacing={2}>
//                   <Grid2 size={12}>
//                     <Stack direction="row" spacing={2}>
//                       {JOB.warranty && (
//                         <Alert
//                           sx={{ mb: 1, width: "100%" }}
//                           icon={<PaletteIcon fontSize="inherit" />}
//                           severity="success"
//                         >
//                           แถบสีเขียว คือ อะไหล่ที่อยู่ในรับประกัน
//                         </Alert>
//                       )}
//                       <Alert
//                         icon={<PaletteIcon fontSize="inherit" />}
//                         severity="error"
//                         sx={{ mb: 1, width: "100%" }}
//                       >
//                         แถบสีแดง คือ อะไหล่ที่ยังไม่ถูกตั้งราคา
//                       </Alert>
//                     </Stack>
//                   </Grid2>
//                   <Grid2 size={12}>
//                     {!showSummary && (
//                       <RpSpAdd
//                         JOB={JOB}
//                         listSparePart={filteredList}
//                         onAddSpare={handleAddSpare}
//                         spSelected={spSelected}
//                         showServiceRow={isFirstDiagram}
//                       />
//                     )}
//                   </Grid2>
//                 </Grid2>
//               </Grid2>
//             </Grid2>
//           )}
//         </>
//       )}
//     </>
//   );
// }
//------------------------------------------------------------------------------
// วิวแก้
// import {
//   Alert,
//   Card,
//   CardContent,
//   CircularProgress,
//   Grid2,
//   Stack,
//   Box,
//   Autocomplete,
//   TextField,
// } from "@mui/material";
// import PaletteIcon from "@mui/icons-material/Palette";
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import DmPreview from "@/Components/DmPreview.jsx";
// import RpSpAdd from "@/Pages/NewRepair/Tab2/RpSp/RpSpAdd.jsx";
// import RpSpSummary from "@/Pages/NewRepair/Tab2/RpSp/RpSpSummary.jsx";

// export default function RpSpMain({ listSparePart, productDetail, setStepForm, JOB, subremark1 }) {
//   const pid = productDetail.pid;
//   const fac_model = productDetail.facmodel;
//   const DM = productDetail.dm || "DM01";
//   const serial = productDetail.serial_id || "";

//   const memoDiagramLayers = useMemo(() => productDetail?.diagram_layers || [], [productDetail?.diagram_layers]);
//   // const defaultLayout = (productDetail?.active_layout || "outside").toLowerCase().trim();
//   const defaultLayoutRaw = productDetail?.active_layout ?? "outside";
//   const defaultLayout =
//     typeof defaultLayoutRaw === "number"
//       ? defaultLayoutRaw === 1
//         ? "outside"
//         : "inside"
//       : String(defaultLayoutRaw || "outside").toLowerCase().trim();

//   const [loading, setLoading] = useState(false);
//   const [spSelected, setSpSelected] = useState([]);
//   const [showSummary, setShowSummary] = useState(false);
//   const [activeLayout, setActiveLayout] = useState(defaultLayout);
//   const [filteredList, setFilteredList] = useState([]);

//   //เพิ่ม: สำหรับเลือกโมเดล (เฉพาะเคส 9999)
//   const [modelOptions, setModelOptions] = useState([]);
//   const [selectedModel, setSelectedModel] = useState(null);
//   const [showComboDialog, setShowComboDialog] = useState(false);

//   // useEffect(() => {
//   //   // เตรียมตัวเลือกโมเดลจากข้อมูล productDetail
//   //   const options = productDetail.model_options || [];
//   //   setModelOptions(options);
//   //   if (options.length > 0) setSelectedModel(options[0]);
//   // }, [productDetail]);

//   useEffect(() => {
//     if (productDetail?.combo_set) {
//       // ✅ ถ้าเป็นสินค้าชุด combo ให้เปิด dialog เลือกสินค้าในชุด
//       setShowComboDialog(true);
//     } else {
//       setShowComboDialog(false);
//     }
//   }, [productDetail]);

//   useEffect(() => {
//     const options = productDetail.model_options || [];
//     setModelOptions(options);
//     if (options.length > 0) setSelectedModel(options[0]);
//     // ✅ ถ้ามีหลาย diagram/model (has_multi_dm)
//     // if ((productDetail.has_multi_dm || options.length > 1) && options.length > 0) {
//     //   setSelectedModel(options[0]);
//     // } else {
//     //   setSelectedModel(null);
//     // }
//   }, [productDetail]);

//   // โหลดข้อมูลอะไหล่ที่เคยเลือก
//   useEffect(() => {
//     fetchData().finally(() => setLoading(false));
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(
//         route("repair.after.spare-part.index", {
//           serial_id: JOB.serial_id,
//           job_id: JOB.job_id,
//         })
//       );
//       setSpSelected(data.spare_parts);
//       if (data.spare_parts.length > 0) setShowSummary(true);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleAddSpare = (newSpares) => {
//     setSpSelected(() => {
//       const updated = newSpares.filter(
//         (item, index, self) => index === self.findIndex((i) => i.spcode === item.spcode)
//       );
//       return updated;
//     });
//     setShowSummary(true);
//   };

//   const handleUpdateSpSelected = (updatedSpares) => setSpSelected(updatedSpares);

//   const Saved = (full_file_path = null) => {
//     setStepForm(2);
//     if (full_file_path) window.open(full_file_path, "_blank");
//   };

//   // ฟิลเตอร์ list ตาม layout + model
//   // useEffect(() => {
//   //   const want = (activeLayout || "outside").toLowerCase().trim();

//   //   const byLayout = listSparePart.filter(
//   //     (x) => ((x.layout || "outside") + "").toLowerCase().trim() === want
//   //   );

//   //   const byModel = selectedModel
//   //     ? byLayout.filter((x) => (x.modelfg || "").trim() === selectedModel.trim())
//   //     : byLayout;

//   //   setFilteredList(byModel.length ? byModel : listSparePart);
//   // }, [listSparePart, activeLayout, selectedModel]);

//   useEffect(() => {
//     // map layout เป็น string และ normalize
//     const normalizeLayout = (val) => {
//       if (val === null || val === undefined) return "outside";
//       if (typeof val === "number") return val === 1 ? "outside" : "inside";
//       const str = String(val).toLowerCase().trim();
//       if (str === "1") return "outside";
//       if (str === "2") return "inside";
//       return str || "outside";
//     };

//     const want = normalizeLayout(activeLayout);

//     const byLayout = listSparePart.filter(
//       (x) => normalizeLayout(x.layout) === want
//     );

//     const byModel = selectedModel
//       ? byLayout.filter((x) => (x.modelfg || "").trim() === selectedModel.trim())
//       : byLayout;

//     setFilteredList(byModel.length ? byModel : listSparePart);
//   }, [listSparePart, activeLayout, selectedModel]);

//   const diagramLayers = useMemo(() => {
//     const layers = memoDiagramLayers || [];
//     const unique = [];
//     const seen = new Set();

//     layers.forEach((layer) => {
//       const key = `${layer.path_file}_${layer.layer_char}_${layer.typedm}`;
//       if (!seen.has(key)) {
//         seen.add(key);
//         unique.push(layer);
//       }
//     });
//     return unique;
//   }, [memoDiagramLayers]);

//   return (
//     <>
//       {loading ? (
//         <CircularProgress />
//       ) : (
//         <>
//           {showSummary ? (
//             <RpSpSummary
//               JOB={JOB}
//               spSelected={spSelected}
//               setShowSummary={setShowSummary}
//               onUpdateSpSelected={handleUpdateSpSelected}
//               onSaved={(full_file_path) => Saved(full_file_path)}
//             />
//           ) : (
//             <Grid2 container spacing={2}>
//               {/* ซ้าย: Diagram + (เลือกโมเดลถ้า 9999) */}
//               <Grid2 size={{ md: 3, sm: 12 }}>
//                 <Card sx={{ height: "100%", display: "flex", flexDirection: "column", p: 1 }}>
//                   <CardContent sx={{ flex: 1, overflowY: "auto" }}>
//                     {serial === "9999" && modelOptions.length >= 1 && (
//                       <Box sx={{ mb: 2 }}>
//                         <Autocomplete
//                           fullWidth
//                           size="small"
//                           options={modelOptions}
//                           value={selectedModel}
//                           onChange={(_e, v) => setSelectedModel(v)}
//                           renderInput={(params) => (
//                             <TextField {...params} label="เลือกโมเดล" placeholder="เช่น J-12BID1504" />
//                           )}
//                         />
//                       </Box>
//                     )}

//                     <DmPreview
//                       detail={{ pid, fac_model, dm_type: DM }}
//                       diagramLayers={diagramLayers}
//                       initialLayout={defaultLayout}
//                       // onLayoutChange={(layout) => {
//                       //   const next = (layout || "outside").toLowerCase().trim();
//                       //   setActiveLayout(next);
//                       // }}
//                       onLayoutChange={(layout) => {
//                         const next = typeof layout === "number" ? layout === 1 ? "outside" : "inside" : String(layout || "outside").toLowerCase().trim();
//                         setActiveLayout(next);
//                       }}
//                     />
//                   </CardContent>
//                 </Card>
//               </Grid2>

//               {/* ขวา: รายการอะไหล่ */}
//               <Grid2 size={{ md: 9, sm: 12 }}>
//                 <Grid2 container spacing={2}>
//                   <Grid2 size={12}>
//                     <Stack direction="row" spacing={2}>
//                       {JOB.warranty && (
//                         <Alert
//                           sx={{ mb: 1, width: "100%" }}
//                           icon={<PaletteIcon fontSize="inherit" />}
//                           severity="success"
//                         >
//                           แถบสีเขียว คือ อะไหล่ที่อยู่ในรับประกัน
//                         </Alert>
//                       )}
//                       <Alert
//                         icon={<PaletteIcon fontSize="inherit" />}
//                         severity="error"
//                         sx={{ mb: 1, width: "100%" }}
//                       >
//                         แถบสีแดง คือ อะไหล่ที่ยังไม่ถูกตั้งราคา
//                       </Alert>
//                     </Stack>
//                   </Grid2>
//                   <Grid2 size={12}>
//                     {!showSummary && (
//                       <RpSpAdd
//                         JOB={JOB}
//                         listSparePart={filteredList}
//                         onAddSpare={handleAddSpare}
//                         spSelected={spSelected}
//                         showServiceRow={activeLayout === "outside"}
//                       />
//                     )}
//                   </Grid2>
//                 </Grid2>
//               </Grid2>
//             </Grid2>
//           )}
//         </>
//       )}
//     </>
//   );
// }

//--------------------------------------------------------------------------------
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Grid2,
  Stack,
  Box,
  Autocomplete,
  TextField,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DmPreview from "@/Components/DmPreview.jsx";
import RpSpAdd from "@/Pages/NewRepair/Tab2/RpSp/RpSpAdd.jsx";
import RpSpSummary from "@/Pages/NewRepair/Tab2/RpSp/RpSpSummary.jsx";

export default function RpSpMain({ listSparePart, productDetail, setStepForm, JOB, subremark1 }) {
  const pid = productDetail.pid;
  const fac_model = productDetail.facmodel;
  const DM = productDetail.dm || "DM01";
  const serial = productDetail.serial_id || "";

  // const isSearchBy9999 = serial === "9999";
  const isSearchBy9999 = serial.startsWith("9999");

  const memoDiagramLayers = useMemo(
    () => productDetail?.diagram_layers || [],
    [productDetail?.diagram_layers]
  );

  // layout เริ่มต้นจาก active_layout (รองรับทั้ง 1/2 และ string)
  const defaultLayoutRaw = productDetail?.active_layout ?? "outside";
  const defaultLayout =
    typeof defaultLayoutRaw === "number"
      ? defaultLayoutRaw === 1
        ? "outside"
        : "inside"
      : String(defaultLayoutRaw || "outside").toLowerCase().trim();

  const [loading, setLoading] = useState(false);
  const [spSelected, setSpSelected] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeLayout, setActiveLayout] = useState(defaultLayout);
  const [filteredList, setFilteredList] = useState([]);

  // เลือกโมเดล (เฉพาะเคส 9999 + multi model)
  const [modelOptions, setModelOptions] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  // dialog combo set (เปิดเฉพาะถ้า is_combo/combo_set = true)
  const [showComboDialog, setShowComboDialog] = useState(false);

  useEffect(() => {
    // แสดง dialog เฉพาะกรณีเป็น combo จริง ๆ
    if (productDetail?.is_combo || productDetail?.combo_set) {
      setShowComboDialog(true);
    } else {
      setShowComboDialog(false);
    }
  }, [productDetail]);

  // useEffect(() => {
  //   // เตรียม model_options จาก backend
  //   const rawOptions = productDetail.model_options || [];
  //   const options = Array.isArray(rawOptions)
  //     ? rawOptions.map((m) => String(m).trim()).filter((m) => m)
  //     : [];

  //   // เฉพาะเคสค้นด้วย 9999 และมีมากกว่า 1 โมเดลเท่านั้นที่ให้เลือก
  //   if (isSearchBy9999 && options.length > 1) {
  //     setModelOptions(options);
  //     setSelectedModel(options[0]);
  //   } else {
  //     setModelOptions([]);
  //     setSelectedModel(null);
  //   }

  // }, [productDetail, isSearchBy9999]);

  useEffect(() => {
    const rawOptions = productDetail.model_options || [];
    const options = Array.isArray(rawOptions)
      ? rawOptions.map((m) => String(m).trim()).filter((m) => m)
      : [];

    // เงื่อนไขเดียว ครอบทั้ง 9999 / 9999-xxxx และจาก history
    if ((productDetail.allow_model_select || isSearchBy9999) && options.length > 0) {
      setModelOptions(options);
      setSelectedModel(options[0]);
    } else {
      setModelOptions([]);
      setSelectedModel(null);
    }
  }, [productDetail, isSearchBy9999]);


  // โหลดข้อมูลอะไหล่ที่เคยเลือก
  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  // รวม diagram_layers (กันซ้ำ)
  const diagramLayers = useMemo(() => {
    const layers = memoDiagramLayers || [];
    const unique = [];
    const seen = new Set();

    layers.forEach((layer) => {
      const key = `${layer.path_file || ""}_${layer.layer_char ?? layer.layout ?? ""
        }_${layer.typedm || ""}_${layer.modelfg || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(layer);
      }
    });

    return unique;
  }, [memoDiagramLayers]);

  const diagramLayersFiltered = useMemo(() => {
    // ถ้าไม่ได้ค้นด้วย 9999 → ใช้ทั้งหมดได้เลย
    if (!isSearchBy9999) return diagramLayers;

    // ถ้ามีเลือกโมเดล → กรองเฉพาะ pid/modelfg ที่ตรง
    if (selectedModel) {
      return diagramLayers.filter(
        (x) =>
          (x.modelfg && x.modelfg.trim() === selectedModel.trim()) ||
          (x.pid && String(x.pid).trim() === selectedModel.trim())
      );
    }

    // ถ้ายังไม่ได้เลือก ให้ใช้ทั้งหมด (default)
    return diagramLayers;
  }, [diagramLayers, isSearchBy9999, selectedModel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        route("repair.after.spare-part.index", {
          serial_id: JOB.serial_id,
          job_id: JOB.job_id,
        })
      );
      setSpSelected(data.spare_parts || []);
      if ((data.spare_parts || []).length > 0) {
        setShowSummary(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddSpare = (newSpares) => {
    setSpSelected(() => {
      const updated = newSpares.filter(
        (item, index, self) =>
          index === self.findIndex((i) => i.spcode === item.spcode)
      );
      return updated;
    });
    setShowSummary(true);
  };

  const handleUpdateSpSelected = (updatedSpares) => setSpSelected(updatedSpares);

  const Saved = (full_file_path = null) => {
    setStepForm(2);
    if (full_file_path) window.open(full_file_path, "_blank");
  };

  // ฟิลเตอร์ list ตาม layout + (โมเดลที่เลือกในเคส 9999)
  useEffect(() => {
    const normalizeLayout = (val) => {
      if (val === null || val === undefined) return "outside";
      if (typeof val === "number") return val === 1 ? "outside" : "inside";
      const str = String(val).toLowerCase().trim();
      if (str === "1") return "outside";
      if (str === "2") return "inside";
      return str || "outside";
    };

    const wantLayout = normalizeLayout(activeLayout);

    // กรองตาม layout ก่อน
    const byLayout = (listSparePart || []).filter(
      (x) => normalizeLayout(x.layout) === wantLayout
    );

    const byModel =
      (isSearchBy9999 || productDetail.allow_model_select) && selectedModel
        ? byLayout.filter(
          (x) =>
            (x.modelfg && x.modelfg.trim() === selectedModel.trim()) ||
            (x.pid && String(x.pid).trim() === selectedModel.trim())
        )
        : byLayout;

    // ถ้าหลังกรองยังมีของ → ใช้เลย
    if (byModel.length > 0) {
      setFilteredList(byModel);
    } else {
      // fallback: เผื่อข้อมูลไม่ครบ ให้เห็น listSparePart ตาม layout เดิม
      setFilteredList(byLayout.length > 0 ? byLayout : listSparePart || []);
    }
  }, [listSparePart, activeLayout, selectedModel, isSearchBy9999]);

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {showSummary ? (
            <RpSpSummary
              JOB={JOB}
              spSelected={spSelected}
              setShowSummary={setShowSummary}
              onUpdateSpSelected={handleUpdateSpSelected}
              onSaved={(full_file_path) => Saved(full_file_path)}
            />
          ) : (
            <Grid2 container spacing={2}>
              {/* ซ้าย: Diagram + (เลือกโมเดลถ้า 9999 และมีหลายโมเดล) */}
              <Grid2 size={{ md: 3, sm: 12 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: 1,
                  }}
                >
                  <CardContent sx={{ flex: 1, overflowY: "auto" }}>
                    {/* {productDetail.allow_model_select && modelOptions.length > 0 && ( */}
                    {(productDetail.allow_model_select || isSearchBy9999) && modelOptions.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={modelOptions}
                          value={selectedModel}
                          onChange={(_e, v) => setSelectedModel(v)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="เลือกโมเดล"
                              placeholder="เช่น RO-200HS / H-R6550"
                            />
                          )}
                        />
                      </Box>
                    )}

                    <DmPreview
                      detail={{ pid, fac_model, dm_type: DM }}
                      // diagramLayers={diagramLayers}
                      diagramLayers={diagramLayersFiltered}
                      initialLayout={defaultLayout}
                      onLayoutChange={(layout) => {
                        const nextLayout =
                          typeof layout === "number"
                            ? layout === 1
                              ? "outside"
                              : "inside"
                            : String(layout || "outside")
                              .toLowerCase()
                              .trim();
                        setActiveLayout(nextLayout);
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid2>

              {/* ขวา: รายการอะไหล่ */}
              <Grid2 size={{ md: 9, sm: 12 }}>
                <Grid2 container spacing={2}>
                  <Grid2 size={12}>
                    <Stack direction="row" spacing={2}>
                      {JOB.warranty && (
                        <Alert
                          sx={{ mb: 1, width: "100%" }}
                          icon={<PaletteIcon fontSize="inherit" />}
                          severity="success"
                        >
                          แถบสีเขียว คือ อะไหล่ที่อยู่ในรับประกัน
                        </Alert>
                      )}
                      <Alert
                        icon={<PaletteIcon fontSize="inherit" />}
                        severity="error"
                        sx={{ mb: 1, width: "100%" }}
                      >
                        แถบสีแดง คือ อะไหล่ที่ยังไม่ถูกตั้งราคา
                      </Alert>
                    </Stack>
                  </Grid2>

                  <Grid2 size={12}>
                    {!showSummary && (
                      <RpSpAdd
                        JOB={JOB}
                        listSparePart={filteredList}
                        onAddSpare={handleAddSpare}
                        spSelected={spSelected}
                        showServiceRow={activeLayout === "outside"}
                      />
                    )}
                  </Grid2>
                </Grid2>
              </Grid2>
            </Grid2>
          )}
        </>
      )}
    </>
  );
}