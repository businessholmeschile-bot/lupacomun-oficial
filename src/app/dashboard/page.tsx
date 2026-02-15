"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Search,
    Bell,
    FileUp,
    LayoutDashboard,
    History,
    Settings,
    BarChart3,
    ShieldCheck,
    AlertCircle,
    TrendingDown,
    CheckCircle2,
    LogOut,
    ChevronRight,
    Download,
    UploadCloud,
    Loader2,
    MessageSquarePlus
} from 'lucide-react';
import { calcularScoreTransparencia, calcularAhorroPotencial } from '@/logic/forensic';

// --- Types ---
interface Finding {
    id: string;
    descripcion: string;
    categoria: string;
    rut_proveedor: string;
    monto: number;
    es_anomalia: boolean;
    alerta_tipo: string;
    ai_comentario: string;
    periodo_mes?: string;
    periodo_anio?: number;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, badge, isAdminMode }: { icon: any, label: string, active?: boolean, badge?: string, isAdminMode?: boolean }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${active ? 'bg-[#652BEB] text-white shadow-lg shadow-[#652BEB]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-500'} />
        <span
            className="text-xs font-bold flex-grow truncate text-left"
            contentEditable={isAdminMode}
            suppressContentEditableWarning={true}
        >
            {label}
        </span>
        {badge && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20 text-white' : 'bg-[#EE6593] text-white shadow-lg shadow-[#EE6593]/20'}`}>
                {badge}
            </span>
        )}
    </div>
);

const ScoreCard = ({ title, value, subValue, icon: Icon, colorClass, trend, isAdminMode }: { title: string, value: string, subValue: string, icon: any, colorClass: string, trend?: string, isAdminMode?: boolean }) => (
    <div className="bg-[#2a2d31] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 shadow-xl hover:bg-[#32363b] transition-all group overflow-hidden relative">
        <div className="flex justify-between items-start relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${colorClass} group-hover:bg-white/10 transition-colors`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    <span className="text-[10px] font-black text-[#30E89E]">{trend}</span>
                </div>
            )}
        </div>
        <div className="text-left relative z-10">
            <p
                className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1"
                contentEditable={isAdminMode}
                suppressContentEditableWarning={true}
            >
                {title}
            </p>
            <h4 className="text-2xl font-black tracking-tighter italic">{value}</h4>
            <div
                className="text-[10px] text-gray-500 font-medium uppercase font-mono mt-1"
                contentEditable={isAdminMode}
                suppressContentEditableWarning={true}
            >
                {subValue}
            </div>
        </div>
    </div>
);

const LupaComunDashboard = () => {
    const [gastos, setGastos] = useState<Finding[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Finding>>({});
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [isCommentMode, setIsCommentMode] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newCommentPos, setNewCommentPos] = useState<{ x: number, y: number } | null>(null);
    const [commentText, setCommentText] = useState("");

    // Persistencia del Modo Administrador
    useEffect(() => {
        const saved = localStorage.getItem('lupa_admin_mode');
        if (saved === 'true') setIsAdminMode(true);
        fetchComments();
    }, []);

    const fetchComments = async () => {
        const { data } = await supabase.from('dashboard_comments').select('*').eq('resolved', false);
        if (data) setComments(data);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (!isCommentMode) return;
        setNewCommentPos({ x: e.clientX, y: e.clientY });
    };

    const saveComment = async () => {
        if (!newCommentPos || !commentText) return;
        const { error } = await supabase.from('dashboard_comments').insert([{
            content: commentText,
            pos_x: (newCommentPos.x / window.innerWidth) * 100,
            pos_y: (newCommentPos.y / window.innerHeight) * 100,
            section_id: 'dashboard_main'
        }]);

        if (!error) {
            setCommentText("");
            setNewCommentPos(null);
            fetchComments();
        } else {
            console.error("Comment Error:", error);
            alert("Necesitas crear la tabla dashboard_comments primero.");
        }
    };

    const toggleAdminMode = () => {
        const newState = !isAdminMode;
        setIsAdminMode(newState);
        if (newState) setIsCommentMode(false); // Desactivar feedback al entrar en admin
        localStorage.setItem('lupa_admin_mode', newState.toString());
    };

    const fetchGastos = async () => {
        const { data, error } = await supabase
            .from('gastos')
            .select('*')
            .order('monto', { ascending: false });

        if (data) {
            setGastos(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGastos();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let files: File[] = [];
        if ('files' in event.target && event.target.files) {
            files = Array.from(event.target.files);
        } else if ('dataTransfer' in event) {
            event.preventDefault();
            files = Array.from((event as React.DragEvent).dataTransfer.files);
        }

        if (files.length === 0) return;

        setIsAnalyzing(true);
        setUploadProgress(10);

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        let interval: any;
        try {
            interval = setInterval(() => {
                setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
            }, 800);

            const response = await fetch('/api/audit', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (interval) clearInterval(interval);
            setUploadProgress(100);

            if (response.ok) {
                // Éxito total
                setTimeout(() => fetchGastos(), 500);
            } else if (response.status === 409) {
                alert(result.message || "Este documento ya fue auditado.");
            } else {
                alert(`Error en Motor Forensik (${response.status}): ${result.error || 'Falla desconocida'}`);
            }
        } catch (error: any) {
            console.error('Upload Error:', error);
            alert(`Error de conexión: No se pudo alcanzar el centro de auditoría.`);
        } finally {
            if (interval) clearInterval(interval);
            setTimeout(() => {
                setIsAnalyzing(false);
                setUploadProgress(0);
            }, 1000);
        }
    };

    const handleEditStart = (finding: Finding) => {
        setEditingId(finding.id);
        setEditValues(finding);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleSaveUpdate = async (id: string) => {
        try {
            const { error } = await supabase
                .from('gastos')
                .update({
                    descripcion: editValues.descripcion,
                    categoria: editValues.categoria,
                    monto: editValues.monto
                })
                .eq('id', id);

            if (error) throw error;

            setEditingId(null);
            fetchGastos(); // Recargar datos para actualizar KPIs
        } catch (error) {
            console.error('Update Error:', error);
            alert("No se pudo guardar el cambio en el Cerebro.");
        }
    };

    const stats = {
        transparencia: calcularScoreTransparencia(gastos),
        alertas: gastos.filter(g => g.es_anomalia).length,
        ahorro: calcularAhorroPotencial(gastos),
        estado: calcularScoreTransparencia(gastos) > 70 ? "En Regla" : "Bajo Observación"
    };

    return (
        <div className={`flex h-screen bg-[#222427] text-white font-sans selection:bg-[#652BEB]/30 selection:text-white transition-all duration-500 ${isAdminMode ? 'ring-inset ring-2 ring-[#652BEB]/30' : ''}`}>
            {isAdminMode && (
                <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#652BEB] via-[#EE6593] to-[#30E89E] z-[100] animate-pulse" />
            )}
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col p-6 shrink-0 bg-[#1a1c1e]">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-[#652BEB] rounded-xl flex items-center justify-center shadow-lg shadow-[#652BEB]/20">
                        <Search size={22} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="text-left">
                        <h1 className="text-lg font-bold leading-none tracking-tight">LupaComún</h1>
                        <p className="text-[10px] text-gray-500 font-medium font-mono">AUDITORÍA FORENSE AI</p>
                    </div>
                </div>

                <div className="mb-6 px-2">
                    <div
                        onClick={toggleAdminMode}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${isAdminMode
                            ? 'bg-[#652BEB]/20 border-[#652BEB] shadow-[0_0_15px_rgba(101,43,235,0.3)]'
                            : 'bg-white/5 border-white/5 grayscale opacity-60'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className={isAdminMode ? 'text-[#652BEB]' : 'text-gray-500'} />
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isAdminMode ? 'text-white' : 'text-gray-500'}`}>
                                Modo Admin
                            </span>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${isAdminMode ? 'bg-[#652BEB]' : 'bg-gray-700'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isAdminMode ? 'right-0.5' : 'left-0.5'}`} />
                        </div>
                    </div>
                </div>

                <div className="mb-2 px-2">
                    <button
                        onClick={() => setIsCommentMode(!isCommentMode)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${isCommentMode
                            ? 'bg-[#EE6593]/20 border-[#EE6593] shadow-[0_0_15px_rgba(238,101,147,0.3)]'
                            : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquarePlus size={16} className={isCommentMode ? 'text-[#EE6593]' : 'text-gray-500'} />
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isCommentMode ? 'text-white' : 'text-gray-500'}`}>
                                Dejar Feedback
                            </span>
                        </div>
                    </button>
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                    <SidebarItem icon={LayoutDashboard} label="Resumen General" active isAdminMode={isAdminMode} />
                    <SidebarItem icon={FileUp} label="Subir Liquidaciones" isAdminMode={isAdminMode} />
                    <SidebarItem icon={History} label="Historial Anomalías" badge={stats.alertas.toString()} isAdminMode={isAdminMode} />

                    <div className="mt-8 mb-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">Comunidad</div>
                    <SidebarItem icon={BarChart3} label="Benchmarking" isAdminMode={isAdminMode} />
                    <SidebarItem icon={ShieldCheck} label="Ley 21.442" isAdminMode={isAdminMode} />
                    <SidebarItem icon={Settings} label="Configuración" isAdminMode={isAdminMode} />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl text-left">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#652BEB] to-[#EE6593] flex items-center justify-center font-bold text-xs">HA</div>
                        <div className="flex-grow min-w-0">
                            <p
                                className="text-[xs] font-bold truncate"
                                contentEditable={isAdminMode}
                                suppressContentEditableWarning={true}
                            >
                                H. Autonomy Lab
                            </p>
                            <p
                                className="text-[10px] text-gray-400 truncate font-mono"
                                contentEditable={isAdminMode}
                                suppressContentEditableWarning={true}
                            >
                                LAB_CORE_USER_01
                            </p>
                        </div>
                        <LogOut size={16} className="text-gray-500 hover:text-white cursor-pointer" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`flex-grow overflow-y-auto bg-[#222427] relative ${isCommentMode ? 'cursor-crosshair' : ''}`}
                onClick={isCommentMode ? handleCanvasClick : undefined}
            >
                {/* Pins de Comentarios */}
                {comments.map((c) => (
                    <div
                        key={c.id}
                        className="fixed z-[90] group"
                        style={{ left: `${c.pos_x}%`, top: `${c.pos_y}%` }}
                    >
                        <div className="w-3 h-3 bg-[#EE6593] rounded-full shadow-[0_0_10px_#EE6593] animate-bounce" />
                        <div className="absolute left-4 top-0 w-48 bg-[#1a1c1e] border border-white/10 p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                            <p className="text-[10px] text-[#EE6593] font-black uppercase mb-1">AUDITOR FEEDBACK:</p>
                            <p className="text-[11px] text-gray-300 leading-relaxed font-medium">{c.content}</p>
                        </div>
                    </div>
                ))}

                {/* Nuevo Pin Temporal */}
                {newCommentPos && (
                    <div
                        className="fixed z-[100] bg-[#1a1c1e] border border-[#EE6593] p-4 rounded-2xl shadow-2xl"
                        style={{ left: newCommentPos.x + 20, top: newCommentPos.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-[10px] font-black uppercase text-[#EE6593] mb-2 tracking-widest">Nueva Anotación</p>
                        <textarea
                            className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white w-64 h-24 focus:outline-none focus:border-[#EE6593] transition-colors"
                            placeholder="Escribe aquí tu cambio solicitado..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                onClick={() => setNewCommentPos(null)}
                                className="text-[10px] font-bold text-gray-500 uppercase px-3 py-1.5"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveComment}
                                className="bg-[#EE6593] text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-lg shadow-lg hover:shadow-[#EE6593]/20 transition-all"
                            >
                                Añadir Pin
                            </button>
                        </div>
                    </div>
                )}
                <header className="px-10 py-8 flex justify-between items-center bg-[#222427]/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
                    <div className="text-left">
                        <h2
                            className="text-2xl font-black tracking-tighter uppercase italic"
                            contentEditable={isAdminMode}
                            suppressContentEditableWarning={true}
                        >
                            Panel de Control de Auditoría
                        </h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                Laboratorio Autonomy, Sistema Conectado.
                            </span>
                            <span className="px-2 py-0.5 bg-[#30E89E]/10 text-[#30E89E] text-[10px] font-black rounded-md border border-[#30E89E]/20">VERIFICADO</span>
                            <span className="text-[10px] font-medium opacity-60 font-mono italic">Última act: Hoy, Realtime</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                            <Bell size={20} />
                        </button>
                        <button className="flex items-center gap-2 bg-[#652BEB] hover:bg-[#5824d3] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#652BEB]/20">
                            <Download size={18} />
                            Exportar Reporte
                        </button>
                    </div>
                </header>

                <div className="px-10 py-10 pb-12 flex flex-col gap-8">
                    {/* Top KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ScoreCard
                            title="TRANSPARENCIA"
                            value={stats.transparencia.toString()}
                            subValue="+4 pts vs mes anterior"
                            icon={ShieldCheck}
                            colorClass="text-[#30E89E]"
                            trend="+4 pts vs mes anterior"
                            isAdminMode={isAdminMode}
                        />
                        <ScoreCard
                            title="ALERTAS"
                            value={stats.alertas.toString()}
                            subValue="Atención Inmediata"
                            icon={AlertCircle}
                            colorClass="text-[#EE6593]"
                            isAdminMode={isAdminMode}
                        />
                        <ScoreCard
                            title="AHORRO POTENCIAL"
                            value={`$${(stats.ahorro / 1000).toFixed(0)}k`}
                            subValue="Benchmark Comunal"
                            icon={TrendingDown}
                            colorClass="text-[#FFBC1E]"
                            isAdminMode={isAdminMode}
                        />
                        <ScoreCard
                            title="ESTADO LEY 21.442"
                            value={stats.estado}
                            subValue="100% Cumplimiento"
                            icon={CheckCircle2}
                            colorClass="text-[#30E89E]"
                            isAdminMode={isAdminMode}
                        />
                    </div>

                    {/* Analysis Section */}
                    <section className="bg-gradient-to-br from-[#2a2d31] to-[#222427] border border-white/5 rounded-3xl p-8 text-left">
                        <div className="flex items-center gap-3 mb-8">
                            <UploadCloud size={24} className="text-[#652BEB]" />
                            <h3 className="text-lg font-bold">Analizar Nuevas Liquidaciones</h3>
                            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <ShieldCheck size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Encriptación de extremo a extremo</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Dropzone */}
                            <div
                                onClick={() => document.getElementById('file-upload')?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileUpload}
                                className="border-2 border-dashed border-[#652BEB]/30 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-[#652BEB]/5 hover:bg-[#652BEB]/10 transition-colors cursor-pointer group"
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <div className="w-14 h-14 bg-[#652BEB] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#652BEB]/20 group-hover:scale-110 transition-transform">
                                    <FileUp size={28} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-base">Arrastre Documentos aquí</p>
                                    <p className="text-xs text-gray-500 mt-1 font-mono uppercase">Formatos: PDF, DOCX, PNG, JPG // MAX 20MB</p>
                                </div>
                            </div>

                            {/* Progress/AI Analysis */}
                            <div className="flex flex-col justify-center gap-6">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <Loader2 size={18} className={`text-[#30E89E] ${isAnalyzing ? 'animate-spin' : ''}`} />
                                        <span className="text-sm font-bold text-[#30E89E] uppercase tracking-tighter">
                                            {isAnalyzing ? 'Análisis de IA en curso...' : 'Sistema listo para escaneo'}
                                        </span>
                                    </div>
                                    <span className="text-2xl font-black text-white tabular-nums">{uploadProgress}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#652BEB] to-[#30E89E] transition-all duration-700 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2 opacity-100">
                                        <CheckCircle2 size={14} className="text-[#30E89E]" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide font-mono">OCR_MODULE_READY</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-50">
                                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide font-mono">CLASSIFICATION_ACTIVE</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-50">
                                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide font-mono">MARKET_BENCHMARK_LINK</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                        {/* Findings Table */}
                        <div className="lg:col-span-2 bg-[#2a2d31] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-xl">
                            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#1a1c1e]/50">
                                <h3
                                    className="text-lg font-bold tracking-tight uppercase italic"
                                    contentEditable={isAdminMode}
                                    suppressContentEditableWarning={true}
                                >
                                    Hallazgos Críticos
                                </h3>
                                <button className="text-[10px] font-black text-[#652BEB] uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                                    VER TODO <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="overflow-x-auto flex-grow">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-black/10">
                                            <th className="px-8 py-4">Ítem / Categoría</th>
                                            <th className="px-4 py-4">Periodo</th>
                                            <th className="px-4 py-4">Costo</th>
                                            <th className="px-8 py-4 text-right">Análisis IA</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {gastos.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                                                    Esperando datos del Cerebro...
                                                </td>
                                            </tr>
                                        ) : (
                                            gastos.map((finding) => {
                                                const isEditing = editingId === finding.id;
                                                const periodMatch = finding.descripcion.match(/\[(.*?)\]/);
                                                const periodLabel = periodMatch ? periodMatch[1] : '--';
                                                const cleanDesc = finding.descripcion.replace(/\[.*?\]/, '').trim();

                                                return (
                                                    <tr key={finding.id} className={`${isEditing ? 'bg-[#652BEB]/10' : 'hover:bg-[#652BEB]/5'} transition-colors group`}>
                                                        <td className="px-8 py-5">
                                                            {isEditing && isAdminMode ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <input
                                                                        className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm font-bold text-white w-full focus:outline-none focus:border-[#652BEB]"
                                                                        value={editValues.descripcion || ''}
                                                                        onChange={(e) => setEditValues({ ...editValues, descripcion: e.target.value })}
                                                                    />
                                                                    <select
                                                                        className="bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-gray-400 uppercase focus:outline-none focus:border-[#652BEB]"
                                                                        value={editValues.categoria || ''}
                                                                        onChange={(e) => setEditValues({ ...editValues, categoria: e.target.value })}
                                                                    >
                                                                        <option value="Reparaciones">Reparaciones</option>
                                                                        <option value="Administración">Administración</option>
                                                                        <option value="Seguros">Seguros</option>
                                                                        <option value="Suministros">Suministros</option>
                                                                        <option value="Varios">Varios</option>
                                                                    </select>
                                                                </div>
                                                            ) : (
                                                                <div className={isAdminMode ? "cursor-pointer" : ""} onClick={() => isAdminMode && handleEditStart(finding)}>
                                                                    <p className="text-sm font-bold group-hover:text-[#652BEB] transition-colors">{cleanDesc}</p>
                                                                    <p className="text-[10px] text-gray-500 font-medium uppercase font-mono">{finding.categoria}</p>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-5">
                                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-[#652BEB]/10 border border-[#652BEB]/20 px-2 py-1 rounded">
                                                                {periodLabel}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-5">
                                                            {isEditing && isAdminMode ? (
                                                                <input
                                                                    type="number"
                                                                    className="bg-black/20 border border-white/10 rounded px-2 py-1 font-mono text-sm font-black text-white italic tracking-tighter w-28 focus:outline-none focus:border-[#652BEB]"
                                                                    value={editValues.monto || 0}
                                                                    onChange={(e) => setEditValues({ ...editValues, monto: parseInt(e.target.value) })}
                                                                />
                                                            ) : (
                                                                <p className={`font-mono text-sm font-black text-white italic tracking-tighter ${isAdminMode ? "cursor-pointer" : ""}`} onClick={() => isAdminMode && handleEditStart(finding)}>
                                                                    ${finding.monto.toLocaleString()}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {isEditing && isAdminMode ? (
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleSaveUpdate(finding.id)}
                                                                        className="bg-[#30E89E] text-black text-[9px] font-black uppercase px-3 py-1 rounded shadow-lg hover:bg-white transition-colors"
                                                                    >
                                                                        Guardar
                                                                    </button>
                                                                    <button
                                                                        onClick={handleEditCancel}
                                                                        className="bg-white/10 text-white text-[9px] font-black uppercase px-3 py-1 rounded hover:bg-white/20 transition-colors"
                                                                    >
                                                                        X
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border tracking-tighter shadow-sm ${finding.es_anomalia ? 'bg-[#EE6593]/10 text-[#EE6593] border-[#EE6593]/20' : 'bg-[#30E89E]/10 text-[#30E89E] border-[#30E89E]/20'
                                                                    }`}>
                                                                    {finding.es_anomalia ? finding.alerta_tipo?.replace(/_/g, ' ') : 'VERIFICADO'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="bg-[#2a2d31] border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#652BEB]/5 blur-[60px] rounded-full pointer-events-none" />
                            <div>
                                <h3
                                    className="text-lg font-bold tracking-tight uppercase italic"
                                    contentEditable={isAdminMode}
                                    suppressContentEditableWarning={true}
                                >
                                    Gastos vs. Comuna
                                </h3>
                                <p
                                    className="text-[10px] text-gray-500 mt-1 font-mono uppercase"
                                    contentEditable={isAdminMode}
                                    suppressContentEditableWarning={true}
                                >
                                    Comparativa mercado // Realtime
                                </p>
                            </div>

                            {/* Simulated Chart Bars */}
                            <div className="flex-grow flex items-end justify-between gap-3 h-48 px-2">
                                {[
                                    { m: 'MAY', h: '60%', p: '45%' },
                                    { m: 'JUN', h: '75%', p: '50%' },
                                    { m: 'JUL', h: '65%', p: '55%' },
                                    { m: 'AGO', h: '90%', p: '58%' },
                                    { m: 'SEP', h: '82%', p: '60%' },
                                    { m: 'OCT', h: '95%', p: '62%' },
                                ].map((bar, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-3 flex-grow max-w-[40px] group">
                                        <div className="w-full flex items-end gap-1 h-full">
                                            <div className="flex-grow bg-[#652BEB] rounded-t-sm group-hover:bg-white transition-colors" style={{ height: bar.h }} />
                                            <div className="flex-grow bg-white/5 rounded-t-sm" style={{ height: bar.p }} />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-600 font-mono italic">{bar.m}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-6 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#652BEB]" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Mi Edificio</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white/10" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Promedio</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-4 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">
                        <p
                            contentEditable={isAdminMode}
                            suppressContentEditableWarning={true}
                        >
                            © 2026 LUPACOMÚN SPA // LEY 21.442 COMPLIANCE
                        </p>
                        <div className="flex gap-4 opacity-50">
                            <span
                                className="hover:text-white cursor-pointer transition-colors"
                                contentEditable={isAdminMode}
                                suppressContentEditableWarning={true}
                            >
                                SECURITY_PROTOCOL
                            </span>
                            <span className="hover:text-white cursor-pointer transition-colors">TERMS_CORE</span>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default LupaComunDashboard;
