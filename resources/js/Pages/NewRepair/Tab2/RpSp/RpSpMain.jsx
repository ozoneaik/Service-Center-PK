//----------------------------------------------------------------------------
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
//---------------------------------------------------------------------------------------------
// วิวแก้
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

  const memoDiagramLayers = useMemo(() => productDetail?.diagram_layers || [], [productDetail?.diagram_layers]);
  const defaultLayout = (productDetail?.active_layout || "outside").toLowerCase().trim();

  const [loading, setLoading] = useState(false);
  const [spSelected, setSpSelected] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeLayout, setActiveLayout] = useState(defaultLayout);
  const [filteredList, setFilteredList] = useState([]);

  //เพิ่ม: สำหรับเลือกโมเดล (เฉพาะเคส 9999)
  const [modelOptions, setModelOptions] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    // เตรียมตัวเลือกโมเดลจากข้อมูล productDetail
    const options = productDetail.model_options || [];
    setModelOptions(options);
    if (options.length > 0) setSelectedModel(options[0]);
  }, [productDetail]);

  // โหลดข้อมูลอะไหล่ที่เคยเลือก
  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        route("repair.after.spare-part.index", {
          serial_id: JOB.serial_id,
          job_id: JOB.job_id,
        })
      );
      setSpSelected(data.spare_parts);
      if (data.spare_parts.length > 0) setShowSummary(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddSpare = (newSpares) => {
    setSpSelected(() => {
      const updated = newSpares.filter(
        (item, index, self) => index === self.findIndex((i) => i.spcode === item.spcode)
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

  // ฟิลเตอร์ list ตาม layout + model
  useEffect(() => {
    const want = (activeLayout || "outside").toLowerCase().trim();

    const byLayout = listSparePart.filter(
      (x) => ((x.layout || "outside") + "").toLowerCase().trim() === want
    );

    const byModel = selectedModel
      ? byLayout.filter((x) => (x.modelfg || "").trim() === selectedModel.trim())
      : byLayout;

    setFilteredList(byModel.length ? byModel : listSparePart);
  }, [listSparePart, activeLayout, selectedModel]);

  // กรองรูปซ้ำ
  const diagramLayers = useMemo(() => {
    const layers = memoDiagramLayers || [];
    const unique = [];
    const seen = new Set();

    layers.forEach((layer) => {
      const key = `${layer.path_file}_${layer.layer_char}_${layer.typedm}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(layer);
      }
    });
    return unique;
  }, [memoDiagramLayers]);

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
              {/* ซ้าย: Diagram + (เลือกโมเดลถ้า 9999) */}
              <Grid2 size={{ md: 3, sm: 12 }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", p: 1 }}>
                  <CardContent sx={{ flex: 1, overflowY: "auto" }}>
                    {serial === "9999" && modelOptions.length >= 1 && (
                      <Box sx={{ mb: 2 }}>
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={modelOptions}
                          value={selectedModel}
                          onChange={(_e, v) => setSelectedModel(v)}
                          renderInput={(params) => (
                            <TextField {...params} label="เลือกโมเดล" placeholder="เช่น J-12BID1504" />
                          )}
                        />
                      </Box>
                    )}

                    <DmPreview
                      detail={{ pid, fac_model, dm_type: DM }}
                      diagramLayers={diagramLayers}
                      initialLayout={defaultLayout}
                      onLayoutChange={(layout) => {
                        const next = (layout || "outside").toLowerCase().trim();
                        setActiveLayout(next);
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