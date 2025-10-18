// import {Alert, Button, Card, CardContent, CircularProgress, Grid2, Stack} from "@mui/material";
// import DmPreview from "@/Components/DmPreview.jsx";
// import RpSpAdd from "@/Pages/NewRepair/Tab2/RpSp/RpSpAdd.jsx";
// import RpSpSummary from "@/Pages/NewRepair/Tab2/RpSp/RpSpSummary.jsx";
// import PaletteIcon from "@mui/icons-material/Palette";
// import React, {useEffect, useState} from "react";

// export default function RpSpMain({listSparePart, productDetail, setStepForm, JOB,subremark1}) {
//     const pid = productDetail.pid;
//     const fac_model = productDetail.facmodel;
//     const DM = productDetail.dm || 'DM01';
//     const [loading, setLoading] = useState(false);
//     const [spSelected, setSpSelected] = useState([]);
//     const [showSummary, setShowSummary] = useState(false);

//     useEffect(() => {
//         fetchData().finally(() => setLoading(false));
//     }, []);


//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const {data, status} = await axios.get(route('repair.after.spare-part.index', {
//                 serial_id: JOB.serial_id,
//                 job_id: JOB.job_id,
//             }))
//             setSpSelected(data.spare_parts)
//             if (data.spare_parts.length > 0){
//                 setShowSummary(true)
//             }
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     const handleAddSpare = (newSpares) => {
//         setSpSelected(prev => {
//             // รวมของเดิมที่ยังมีอยู่กับของใหม่ที่ยังไม่เคยมี
//             const updated = newSpares.filter(
//                 (item, index, self) =>
//                     index === self.findIndex(i => i.spcode === item.spcode) // กันของซ้ำใน newSpares เอง
//             );
//             return updated;
//         });
//         setShowSummary(true);
//     };

//     const handleUpdateSpSelected = (updatedSpares) => {
//         setSpSelected(updatedSpares);
//     }


//     // หากบันทึกจากหน้า สรุปรายการอะไหล่เสร็จสิ้น
//     const Saved = (full_file_path = null) => {
//         // fetchData().finally(()=>setLoading(false))
//         setStepForm(2);
//         if (full_file_path) {
//             window.open(full_file_path, '_blank');
//         }
//     }

//     return (
//         <>
//             {loading ? (<CircularProgress/>) : (
//                 <>
//                     {showSummary ? (
//                         <RpSpSummary
//                             JOB={JOB}
//                             spSelected={spSelected}
//                             setShowSummary={setShowSummary}
//                             onUpdateSpSelected={handleUpdateSpSelected}
//                             onSaved={(full_file_path)=>Saved(full_file_path)}
//                         />
//                     ) : (
//                         <Grid2 container spacing={2}>
//                             <Grid2 size={{md : 3, sm : 12}}>
//                                 <Card sx={{maxHeight : 500 ,overflow : 'auto'}}>
//                                     <CardContent>
//                                         <DmPreview detail={{fac_model, dm_type: DM, pid: pid}}/>
//                                     </CardContent>
//                                 </Card>
//                             </Grid2>
//                             <Grid2 size={{md : 9, sm : 12}}>
//                                 <Grid2 container spacing={2}>
//                                     <Grid2 size={12}>
//                                         <Stack direction='row' spacing={2}>
//                                             {JOB.warranty && (
//                                                 <Alert sx={{mb: 1,width : '100%'}}
//                                                        icon={<PaletteIcon fontSize="inherit"/>} severity="success">
//                                                     แถบสีเขียว คือ อะไหล่ที่อยู่ในรับประกัน
//                                                 </Alert>
//                                             )}
//                                             <Alert icon={<PaletteIcon fontSize="inherit"/>}
//                                                    severity="error" sx={{mb: 1,width : '100%'}}>
//                                                 แถบสีแดง คือ อะไหล่ที่ยังไม่ถูกตั้งราคา {showSummary && 'show'} {spSelected.length}
//                                             </Alert>
//                                         </Stack>
//                                     </Grid2>


//                                     <Grid2 size={12}>
//                                         {!showSummary && (
//                                             <RpSpAdd
//                                                 JOB={JOB}
//                                                 listSparePart={listSparePart}
//                                                 onAddSpare={handleAddSpare}
//                                                 spSelected={spSelected}
//                                             />
//                                         )}
//                                     </Grid2>
//                                 </Grid2>
//                             </Grid2>
//                         </Grid2>
//                     )}
//                 </>
//             )}
//         </>
//     )
// }

//-------------------------------------2---------------------------------------------------
// import { Alert, Card, CardContent, CircularProgress, Grid2, Stack } from "@mui/material";
// import DmPreview from "@/Components/DmPreview.jsx";
// import RpSpAdd from "@/Pages/NewRepair/Tab2/RpSp/RpSpAdd.jsx";
// import RpSpSummary from "@/Pages/NewRepair/Tab2/RpSp/RpSpSummary.jsx";
// import PaletteIcon from "@mui/icons-material/Palette";
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";

// export default function RpSpMain({ listSparePart, productDetail, setStepForm, JOB, subremark1 }) {
//   const pid = productDetail.pid;
//   const fac_model = productDetail.facmodel;
//   const DM = productDetail.dm || "DM01";

//   const diagramLayers = productDetail?.diagram_layers || [];
//   const defaultLayout = (productDetail?.active_layout || "outside").toLowerCase().trim();

//   const [loading, setLoading] = useState(false);
//   const [spSelected, setSpSelected] = useState([]);
//   const [showSummary, setShowSummary] = useState(false);
//   const [activeLayout, setActiveLayout] = useState(defaultLayout);

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
//     setSpSelected((prev) => {
//       // กันของซ้ำใน newSpares เอง
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

//   const filteredListSparePart = useMemo(() => {
//     const want = (activeLayout || "outside").toLowerCase().trim();
//     const filtered = (listSparePart || []).filter((sp) => {
//       const layout = ((sp?.layout ?? "outside") + "").toLowerCase().trim();
//       return layout === want;
//     });
//     console.log("[RpSpMain] activeLayout =", want, " -> filtered count =", filtered.length);
//     return filtered;
//   }, [listSparePart, activeLayout]);

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
//               <Grid2 size={{ md: 3, sm: 12 }}>
//                 <Card sx={{ maxHeight: 500, overflow: "auto" }}>
//                   <CardContent>
//                     <DmPreview
//                       detail={{ fac_model, dm_type: DM, pid }}
//                       diagramLayers={diagramLayers}
//                       initialLayout={defaultLayout}
//                       onLayoutChange={(layout) => {
//                         const next = (layout || "outside").toLowerCase().trim();
//                         console.log("[RpSpMain] layout from DmPreview =", next);
//                         setActiveLayout(next);
//                       }}
//                     />
//                   </CardContent>
//                 </Card>
//               </Grid2>

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
//                         listSparePart={filteredListSparePart} 
//                         onAddSpare={handleAddSpare}
//                         spSelected={spSelected}
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

//-----------------------------------------3------------------------------------------------
import { Alert, Card, CardContent, CircularProgress, Grid2, Stack } from "@mui/material";
import DmPreview from "@/Components/DmPreview.jsx";
import RpSpAdd from "@/Pages/NewRepair/Tab2/RpSp/RpSpAdd.jsx";
import RpSpSummary from "@/Pages/NewRepair/Tab2/RpSp/RpSpSummary.jsx";
import PaletteIcon from "@mui/icons-material/Palette";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function RpSpMain({ listSparePart, productDetail, setStepForm, JOB, subremark1 }) {
  const pid = productDetail.pid;
  const fac_model = productDetail.facmodel;
  const DM = productDetail.dm || "DM01";

  const memoDiagramLayers = useMemo(
    () => productDetail?.diagram_layers || [],
    [productDetail?.diagram_layers]
  );

  const defaultLayout = (productDetail?.active_layout || "outside").toLowerCase().trim();

  const [loading, setLoading] = useState(false);
  const [spSelected, setSpSelected] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeLayout, setActiveLayout] = useState(defaultLayout);

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
  const filteredListSparePart = useMemo(() => {
    const want = (activeLayout || "outside").toLowerCase().trim();
    const filtered = (listSparePart || []).filter((sp) => {
      const layout = ((sp?.layout ?? "outside") + "").toLowerCase().trim();
      return layout === want;
    });
    return filtered;
  }, [listSparePart, activeLayout]);

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
              <Grid2 size={{ md: 3, sm: 12 }}>
                <Card sx={{ maxHeight: 500, overflow: "auto" }}>
                  <CardContent>
                    <DmPreview
                      detail={{ fac_model, dm_type: DM, pid }}
                      diagramLayers={memoDiagramLayers}    
                      initialLayout={defaultLayout}
                      onLayoutChange={(layout) => {
                        const next = (layout || "outside").toLowerCase().trim();
                        setActiveLayout(next);
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 size={{ md: 9, sm: 12 }}>
                <Grid2 container spacing={2}>
                  <Grid2 size={12}>
                    <Stack direction="row" spacing={2}>
                      {JOB.warranty && (
                        <Alert sx={{ mb: 1, width: "100%" }} icon={<PaletteIcon fontSize="inherit" />} severity="success">
                          แถบสีเขียว คือ อะไหล่ที่อยู่ในรับประกัน
                        </Alert>
                      )}
                      <Alert icon={<PaletteIcon fontSize="inherit" />} severity="error" sx={{ mb: 1, width: "100%" }}>
                        แถบสีแดง คือ อะไหล่ที่ยังไม่ถูกตั้งราคา
                      </Alert>
                    </Stack>
                  </Grid2>
                  <Grid2 size={12}>
                    {!showSummary && (
                      <RpSpAdd
                        JOB={JOB}
                        listSparePart={filteredListSparePart}
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