import { useState, useEffect, useRef, useCallback } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

const API = "https://warranty-sn.pumpkin.tools/api/diagram";
const SP_IMG = (c) => `https://warranty-sn.pumpkin.tools/storage/uploads/sp_images/${c}.jpg`;
const SP_FALL = "https://images.dcpumpkin.com/images/product/500/default.jpg";
const LOGO = "https://pumpkin-image-sku.s3.ap-southeast-1.amazonaws.com/pumpkin-image-logo/logo.png";

// ─── Views ────────────────────────────────────────────────────────────────────
const VIEW = { SEARCH: "search", DMS: "dms", DIAGRAM: "diagram" };

export default function CheckDiagram() {
    const [view, setView] = useState(VIEW.SEARCH);

    // search state
    const [query, setQuery] = useState("");
    const [searchError, setSearchError] = useState("");
    const [searching, setSearching] = useState(false);

    // DMS state
    const [dmsLabel, setDmsLabel] = useState("");
    const [dmsItems, setDmsItems] = useState([]);
    const [dmsLoading, setDmsLoading] = useState(false);
    const [dmsError, setDmsError] = useState("");

    // Diagram state
    const [ds, setDs] = useState({
        allAnnotations: [],
        allSpData: [],
        imgPages: [],
        activePage: 1,
        hoveredCode: null,
        selectedCode: null,
        listFilter: "",
        showPanel: true,
        currentSku: "",
        currentDm: "",
        headerModel: "",
        pdfUrl: null,
        manualPdfUrl: null,
        prevView: VIEW.SEARCH,
    });
    const [diagramLoading, setDiagramLoading] = useState(false);
    const [howToOpen, setHowToOpen] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const imgRef = useRef(null);
    const markerRef = useRef(null);

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const anns = useCallback(
        () => ds.allAnnotations.filter((a) => (a.page ?? 1) === ds.activePage),
        [ds.allAnnotations, ds.activePage]
    );

    const spPage = useCallback(
        () => ds.allSpData.filter((s) => (s.layout ?? 1) === ds.activePage),
        [ds.allSpData, ds.activePage]
    );

    const filtered = useCallback(() => {
        const f = ds.listFilter.toLowerCase();
        const p = spPage();
        if (!f) return p;
        return p.filter(
            (s) =>
                s.spname?.toLowerCase().includes(f) ||
                s.spcode?.toLowerCase().includes(f) ||
                String(s.tracking_number) === f
        );
    }, [ds.listFilter, spPage]);

    // ─── Search ───────────────────────────────────────────────────────────────
    async function performSearch(q) {
        q = q.trim();
        if (!q) { setSearchError("กรุณากรอกข้อมูลที่ต้องการค้นหา"); return; }
        setSearchError("กำลังค้นหา…");
        setSearching(true);
        try {
            const res = await fetch(
                `https://warranty-sn.pumpkin.tools/api/getdatadup?search=${encodeURIComponent(q)}`
            );
            const data = await res.json();
            if (data.status !== "SUCCESS") throw new Error(data.message || "ไม่พบข้อมูล");

            const reserved = new Set(["status", "message", "search", "search_type", "skumain"]);
            const skuKey = Object.keys(data).find((k) => !reserved.has(k));
            const result = skuKey ? data[skuKey] : null;
            if (!result) throw new Error("ไม่พบข้อมูลสำหรับคำค้นนี้");

            const sku = data.skumain || result.skumain || skuKey;
            setSearchError("");

            if (data.search_type === "serial") {
                result.sn_hd?.DM ? loadDiagram(sku, result.sn_hd.DM, VIEW.SEARCH) : loadDms(sku);
            } else {
                loadDms(sku);
            }
        } catch (err) {
            setSearchError(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setSearching(false);
        }
    }

    // ─── Load DMS ─────────────────────────────────────────────────────────────
    async function loadDms(sku) {
        setView(VIEW.DMS);
        setDmsLabel(sku);
        setDmsLoading(true);
        setDmsError("");
        setDmsItems([]);
        try {
            const res = await fetch(`${API}/${sku}?source=wordpress`);
            const data = await res.json();
            if (data.status === "not_found" || !data.dms?.length)
                throw new Error(`ไม่พบข้อมูลสำหรับ SKU ${sku}`);
            setDmsItems(data.dms);
        } catch (err) {
            setDmsError(err.message);
        } finally {
            setDmsLoading(false);
        }
    }

    // ─── Load Diagram ─────────────────────────────────────────────────────────
    async function loadDiagram(sku, dm, prevView = VIEW.DMS) {
        setDs((d) => ({
            ...d,
            allAnnotations: [], allSpData: [], imgPages: [],
            activePage: 1, hoveredCode: null, selectedCode: null,
            listFilter: "", showPanel: true,
            currentSku: sku, currentDm: dm,
            headerModel: "กำลังโหลด…", pdfUrl: null, manualPdfUrl: null,
            prevView,
        }));
        setView(VIEW.DIAGRAM);
        setDiagramLoading(true);
        try {
            const res = await fetch(`${API}/${sku}/${dm}?source=wordpress`);
            const data = await res.json();
            if (data.status !== "ok") throw new Error(data.message ?? "ไม่พบข้อมูล");

            const dm_ = data.dmData ?? {};
            const pages = [1, 2, 3, 4, 5].map((n) => dm_[`img_${n}`]).filter(Boolean);

            setDs((d) => ({
                ...d,
                allAnnotations: (data.annotations ?? []).map((a) => ({ ...a, page: a.page ?? 1 })),
                allSpData: Array.isArray(data.spData) ? data.spData : [],
                imgPages: pages,
                headerModel: dm_.modelfg ?? `SKU ${sku}`,
                pdfUrl: dm_.pdf_path ?? null,
                manualPdfUrl: dm_.manual_pdf_path ?? null,
            }));
        } catch (err) {
            setDs((d) => ({ ...d, headerModel: `เกิดข้อผิดพลาด: ${err.message}` }));
        } finally {
            setDiagramLoading(false);
        }
    }

    // ─── Render Markers ───────────────────────────────────────────────────────
    function renderMarkers() {
        if (!markerRef.current) return null;
        const spMap = Object.fromEntries(ds.allSpData.map((s) => [s.spcode, s]));
        return anns().map((ann) => {
            const sp = spMap[ann.spcode];
            const isH = ds.hoveredCode === ann.spcode;
            const isA = ds.selectedCode === ann.spcode;
            return (
                <div
                    key={ann.spcode + "_" + ann.tracking_number}
                    className="absolute z-10"
                    style={{
                        left: `${ann.x_percent}%`,
                        top: `${ann.y_percent}%`,
                        transform: "translate(-50%,-50%)",
                    }}
                >
                    {isH && (
                        <div
                            className="absolute bottom-full left-1/2 pb-3 z-50"
                            style={{ transform: "translateX(-50%)", minWidth: 220, pointerEvents: "none" }}
                        >
                            <div className="rounded-xl bg-white shadow-2xl border border-orange-200 p-3">
                                <div className="flex gap-2.5">
                                    <img
                                        src={SP_IMG(sp?.spcode ?? ann.spcode)}
                                        onError={(e) => (e.currentTarget.src = SP_FALL)}
                                        className="h-16 w-16 shrink-0 rounded-lg border border-gray-100 object-contain bg-gray-50 cursor-zoom-in hover:opacity-80 transition-opacity"
                                        onClick={() => setLightboxSrc(SP_IMG(sp?.spcode ?? ann.spcode))}
                                        style={{ pointerEvents: "auto" }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-sm text-gray-900 leading-snug mb-0.5">
                                            {ann.tracking_number}. {sp?.spname ?? ann.spname ?? ""}
                                        </div>
                                        <div className="font-mono text-[10px] text-gray-400">{sp?.spcode ?? ann.spcode}</div>
                                        {sp?.stdprice != null && (
                                            <div className="mt-1 font-bold text-orange-600 text-sm">
                                                ฿{Number(sp.stdprice).toLocaleString("th-TH")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center -mt-px">
                                <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "7px solid #fed7aa" }} />
                            </div>
                        </div>
                    )}
                    <div
                        className={`relative flex items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow select-none cursor-pointer transition-all duration-150 ${
                            isA ? "bg-green-600 ring-4 ring-green-300 ring-offset-1 z-20" : isH ? "bg-orange-400" : "bg-orange-500 opacity-90"
                        }`}
                        style={{
                            width: 26, height: 26,
                            transform: isA ? "scale(1.5)" : isH ? "scale(1.25)" : "",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setDs((d) => ({ ...d, selectedCode: d.selectedCode === ann.spcode ? null : ann.spcode }));
                        }}
                        onMouseEnter={() => setDs((d) => ({ ...d, hoveredCode: ann.spcode }))}
                        onMouseLeave={() => setDs((d) => ({ ...d, hoveredCode: null }))}
                    >
                        {ann.tracking_number ?? "?"}
                    </div>
                </div>
            );
        });
    }

    // ─── ESC key ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const fn = (e) => {
            if (e.key === "Escape") { setLightboxSrc(null); setHowToOpen(false); }
        };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, []);

    // ─── Views ────────────────────────────────────────────────────────────────
    const parts = filtered();
    const pageList = ds.imgPages;
    const currentImg = pageList[ds.activePage - 1] ?? null;
    const annCodes = new Set(anns().map((a) => a.spcode));

    return (
        <AuthenticatedLayout>
            <Head title="ตรวจเช็คอะไหล่ (Diagram)" />

            {/* ── Search View ─────────────────────────────────────────────── */}
            {view === VIEW.SEARCH && (
                <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
                    <div className="flex flex-col items-center w-full max-w-2xl text-center">
                        <img src={LOGO} className="w-16 mb-6" alt="logo" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">ตรวจเช็คอะไหล่ (Diagram)</h1>
                        <p className="text-sm md:text-base text-gray-500 mt-3 mb-8 max-w-md leading-relaxed">
                            ค้นหาอะไหล่ด้วยเลขที่ซีเรียล (Serial) หรือรหัสสินค้า (SKU)
                            <span className="text-xl font-bold text-orange-500 mt-2 block">
                                *การค้นหาด้วย Serial เพื่อการตรวจสอบและสั่งซื้ออะไหล่ต้องอย่างถูกต้องและไม่ซ้ำ
                            </span>
                        </p>
                        <div className="w-full max-w-xl px-1">
                            <form
                                className="flex flex-col md:flex-row items-stretch gap-1 w-full"
                                onSubmit={(e) => { e.preventDefault(); performSearch(query); }}
                            >
                                <div className="flex flex-row flex-1 h-12 md:h-14 rounded-lg border border-gray-300 overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-orange-200">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="กรอกเลขที่ซีเรียล หรือ รหัสสินค้า"
                                        autoComplete="off"
                                        autoCapitalize="none"
                                        className="flex-1 min-w-0 px-4 text-sm md:text-base text-gray-700 outline-none bg-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setHowToOpen(true)}
                                        className="flex items-center justify-center px-4 shrink-0"
                                        title="วิธีดูรหัสสินค้าและที่ซีเรียลนัมเบอร์"
                                    >
                                        <img
                                            src="https://uxwing.com/wp-content/themes/uxwing/download/signs-and-symbols/round-information-outline-orange-icon.png"
                                            alt="info"
                                            className="w-5 h-6 object-contain"
                                        />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="w-full md:w-32 h-10 md:h-14 flex items-center justify-center bg-orange-500 text-white text-base md:text-lg font-bold rounded-lg shadow-sm hover:bg-orange-600 transition-colors active:bg-orange-700 shrink-0 disabled:opacity-50"
                                >
                                    {searching ? "กำลังค้น…" : "ค้นหา"}
                                </button>
                            </form>
                            {searchError && (
                                <div className={`w-full mt-4 rounded-lg px-4 py-3 text-sm text-center font-medium ${
                                    searchError.startsWith("เกิด") || searchError.startsWith("กรุณา")
                                        ? "bg-red-50 border border-red-200 text-red-600"
                                        : "bg-blue-50 border border-blue-200 text-blue-600"
                                }`}>
                                    {searchError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── DMS View ────────────────────────────────────────────────── */}
            {view === VIEW.DMS && (
                <div className="min-h-screen bg-gray-50">
                    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
                        <div className="flex items-center gap-2 px-4 py-2.5">
                            <button
                                onClick={() => setView(VIEW.SEARCH)}
                                className="flex items-center text-orange-500 p-1 rounded hover:bg-orange-50 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-xs text-gray-500 font-medium">ผลการค้นหาสำหรับ:</span>
                            <span className="font-mono text-sm text-orange-600 font-bold">SKU {dmsLabel}</span>
                            {dmsLoading && <span className="ml-auto text-xs text-gray-400">กำลังโหลด…</span>}
                        </div>
                    </header>
                    <div className="p-4">
                        {dmsError ? (
                            <div className="py-10 text-sm text-red-500 text-center">{dmsError}</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                {dmsItems.map((dm) => (
                                    <button
                                        key={dm.dm}
                                        onClick={() => { loadDiagram(dmsLabel, dm.dm, VIEW.DMS); }}
                                        className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-left active:scale-95"
                                    >
                                        {dm.img ? (
                                            <img src={dm.img} alt="" className="w-full aspect-square object-contain bg-gray-50 p-2" onError={(e) => (e.currentTarget.style.display = "none")} />
                                        ) : (
                                            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-xs">ไม่มีรูป</div>
                                        )}
                                        <div className="px-3 py-2.5">
                                            <div className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{dm.modelfg ?? `DM ${dm.dm}`}</div>
                                            <div className="mt-1 flex items-center justify-between gap-1">
                                                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-orange-700">DM {dm.dm}</span>
                                                {dm.annotation_count > 0 && (
                                                    <span className="text-[10px] text-gray-400">{dm.annotation_count} ชิ้น</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Diagram View ─────────────────────────────────────────────── */}
            {view === VIEW.DIAGRAM && (
                <div className="flex flex-col bg-white relative" style={{ minHeight: "80vh" }}>
                    {/* Loading overlay */}
                    {diagramLoading && (
                        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-sm font-medium text-gray-600">กำลังโหลดไดอะแกรมและชุดอะไหล่...</p>
                        </div>
                    )}

                    {/* Header */}
                    <header className="shrink-0 border-b border-gray-100 bg-white shadow-sm z-20">
                        <div className="flex items-center justify-between gap-2 px-3 py-2.5 md:px-6 md:py-3">
                            <div className="flex min-w-0 items-center gap-2 md:gap-3">
                                <button
                                    onClick={() => ds.prevView === VIEW.DMS ? loadDms(ds.currentSku) : setView(VIEW.SEARCH)}
                                    className="flex items-center text-orange-500 shrink-0 hover:bg-orange-50 p-1 rounded transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="min-w-0 truncate font-semibold text-gray-900 text-sm md:text-base">{ds.headerModel}</span>
                                <span className="shrink-0 rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">DM {ds.currentDm}</span>
                                <span className="hidden md:inline shrink-0 font-mono text-xs text-gray-400">SKU {ds.currentSku}</span>
                            </div>
                            <button
                                onClick={() => setDs((d) => ({ ...d, showPanel: !d.showPanel }))}
                                className="flex items-center gap-1.5 shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d={ds.showPanel
                                            ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            : "M4 6h16M4 12h16M4 18h7"}
                                    />
                                </svg>
                                <span className="hidden sm:inline">{ds.showPanel ? "ซ่อนรายการ" : "แสดงรายการ"}</span>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col md:flex-row">
                        {/* Diagram Panel */}
                        <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
                            {/* Page tabs */}
                            {pageList.length > 1 && (
                                <div className="shrink-0 flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 md:px-4">
                                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide mr-1">หน้า</span>
                                    <div className="flex gap-2">
                                        {pageList.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setDs((d) => ({ ...d, activePage: i + 1 }))}
                                                className={`rounded px-3 py-1 text-xs font-medium transition-colors md:px-2.5 md:py-0.5 ${
                                                    ds.activePage === i + 1
                                                        ? "bg-orange-500 text-white"
                                                        : "border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PDF bar */}
                            <div className="shrink-0 flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-2 md:px-4">
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">ดาวน์โหลด</span>
                                {ds.pdfUrl ? (
                                    <a href={ds.pdfUrl} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600 hover:bg-orange-100 whitespace-nowrap transition-colors">
                                        📄 คัดอะไหล่ PDF
                                    </a>
                                ) : (
                                    <span className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400 whitespace-nowrap cursor-not-allowed">
                                        📄 คัดอะไหล่ PDF
                                    </span>
                                )}
                                {ds.manualPdfUrl ? (
                                    <a href={ds.manualPdfUrl} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 whitespace-nowrap transition-colors">
                                        📘 คู่มือใช้งาน
                                    </a>
                                ) : (
                                    <span className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400 whitespace-nowrap cursor-not-allowed">
                                        📘 คู่มือใช้งาน
                                    </span>
                                )}
                            </div>

                            {/* Diagram image + markers */}
                            <div className="overflow-auto flex-1">
                                <div className="p-4 md:p-6 min-w-[300px]"
                                    onClick={() => setDs((d) => ({ ...d, selectedCode: null }))}
                                >
                                    <div className="relative mx-auto max-w-5xl" ref={markerRef}>
                                        {currentImg && (
                                            <img
                                                ref={imgRef}
                                                src={currentImg}
                                                alt="Spare Parts Diagram"
                                                draggable={false}
                                                className="block w-full select-none rounded-lg shadow-md bg-white"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        )}
                                        <div className="absolute inset-0" style={{ overflow: "visible" }}>
                                            {renderMarkers()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parts List Panel */}
                        {ds.showPanel && (
                            <div className="md:w-96 xl:w-[420px] shrink-0 flex flex-col bg-white border-t md:border-t-0 md:border-l border-gray-200"
                                style={{ maxHeight: "calc(100vh - 120px)", overflow: "hidden" }}>
                                {/* List header */}
                                <div className="shrink-0 border-b border-gray-200 px-3 py-2.5 bg-white shadow-sm z-20">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">รายการอะไหล่</span>
                                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                            {parts.length}{ds.listFilter ? ` / ${spPage().length}` : ""} รายการ
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={ds.listFilter}
                                        onChange={(e) => setDs((d) => ({ ...d, listFilter: e.target.value }))}
                                        placeholder="ค้นหา ชื่อ / รหัส / เลข…"
                                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300 md:px-2.5 md:py-1.5 md:text-xs"
                                    />
                                </div>

                                {/* Parts list */}
                                <div className="flex-1 overflow-y-auto pb-6">
                                    {parts.map((sp) => {
                                        const isA = ds.selectedCode === sp.spcode;
                                        const isH = ds.hoveredCode === sp.spcode;
                                        const hm = annCodes.has(sp.spcode);
                                        return (
                                            <div
                                                key={sp.spcode}
                                                className={`flex cursor-pointer items-center gap-2.5 border-b border-gray-100 px-3 py-3 md:py-2 transition-colors ${
                                                    isA ? "bg-green-50" : isH ? "bg-orange-50" : "hover:bg-gray-50"
                                                }`}
                                                onClick={() => setDs((d) => ({ ...d, selectedCode: d.selectedCode === sp.spcode ? null : sp.spcode }))}
                                                onMouseEnter={() => setDs((d) => ({ ...d, hoveredCode: sp.spcode }))}
                                                onMouseLeave={() => setDs((d) => ({ ...d, hoveredCode: null }))}
                                            >
                                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold md:h-6 md:w-6 ${
                                                    hm ? ((isA || isH) ? "bg-green-500 text-white" : "bg-orange-500 text-white") : "bg-orange-100 text-orange-700"
                                                }`}>
                                                    {sp.tracking_number}
                                                </span>
                                                <span className="flex-1 text-xs leading-tight text-gray-800 overflow-hidden text-ellipsis">{sp.spname ?? ""}</span>
                                                <span className="hidden sm:inline shrink-0 font-mono text-[10px] text-gray-400">{sp.spcode}</span>
                                                <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-orange-700">
                                                    ฿{Number(sp.stdprice || 0).toLocaleString("th-TH")}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── How-To Modal ─────────────────────────────────────────────── */}
            {howToOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setHowToOpen(false)}>
                    <div className="relative bg-white p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-4xl my-auto flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setHowToOpen(false)} className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-100 transition-colors border border-gray-100">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-sm md:text-base font-bold text-gray-800 text-center mb-3 shrink-0">แนะนำวิธีดูรหัสสินค้าและที่ซีเรียลนัมเบอร์</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-1 text-center">
                            <div className="flex flex-col items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 mb-1.5">🔍 วิธีดูรหัสสินค้า / แม็ค (SKU)</span>
                                <img src="https://pumpkin-image-sku.s3.ap-southeast-1.amazonaws.com/diagram_check_pid_fg.png" alt="วิธีดูรหัสสินค้า" className="w-full object-contain rounded-lg bg-white shadow-sm max-h-64" />
                            </div>
                            <div className="flex flex-col items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 mb-1.5">🔍 วิธีดูหมายเลขซีเรียล (Serial Number)</span>
                                <img src="https://pumpkin-image-sku.s3.ap-southeast-1.amazonaws.com/diagram_check_sn.png" alt="วิธีดูซีเรียลนัมเบอร์" className="w-full object-contain rounded-lg bg-white shadow-sm max-h-64" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Lightbox ─────────────────────────────────────────────────── */}
            {lightboxSrc && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={() => setLightboxSrc(null)}>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setLightboxSrc(null)} className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-100 transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img src={lightboxSrc} alt="" onError={(e) => (e.currentTarget.src = SP_FALL)}
                            className="max-h-[80vh] max-w-[90vw] md:max-w-[70vw] rounded-2xl bg-white object-contain shadow-2xl" />
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
