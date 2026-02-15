"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    ShieldCheck,
    ArrowRight,
    Check,
    Zap,
    Clock,
    FileText,
    TrendingUp,
    Fingerprint,
    Facebook,
    Twitter,
    Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ExternalLink, Eye, AlertTriangle, Activity } from 'lucide-react';

// --- Components ---

const Navbar = ({ onOpenRestricted }: { onOpenRestricted: () => void }) => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#222427]/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-20 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#652BEB] rounded-lg flex items-center justify-center">
                <Search size={18} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LupaComún</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#solucion" className="hover:text-white transition-colors">Solución</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
            <a href="#" className="hover:text-white transition-colors text-accent">Ley 21.442</a>
        </div>
        <button
            onClick={onOpenRestricted}
            className="bg-[#652BEB] hover:bg-[#5824d3] text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#652BEB]/20"
        >
            Auditar mi edificio
        </button>
    </nav>
);

const PainPointCard = ({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => (
    <div className="bg-[#2a2d31] border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-all group">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/5 group-hover:scale-110 transition-transform">
            <Icon size={24} style={{ color }} />
        </div>
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
);

const PricingCard = ({ title, price, features, highlighted = false, buttonText = "Elegir Plan", subText }: { title: string, price: string, features: string[], highlighted?: boolean, buttonText?: string, subText?: string }) => (
    <div className={`relative flex flex-col p-8 rounded-[32px] transition-all duration-300 ${highlighted
        ? 'bg-gradient-to-b from-[#2a2d31] to-[#222427] border-2 border-[#652BEB] shadow-2xl shadow-[#652BEB]/10 scale-105 z-10'
        : 'bg-[#2a2d31] border border-white/5'
        }`}>
        {highlighted && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#652BEB] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                Recomendado
            </div>
        )}
        <div className="mb-8 text-left">
            <h3 className="text-gray-400 font-bold text-sm mb-2">{title}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{price}</span>
                {subText && <span className="text-gray-500 text-sm font-medium">{subText}</span>}
            </div>
        </div>
        <div className="space-y-4 mb-10 flex-grow">
            {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-4 h-4 rounded-full bg-[#30E89E]/20 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-[#30E89E]" strokeWidth={3} />
                    </div>
                    <span className="text-xs text-gray-400 font-medium text-left">{feature}</span>
                </div>
            ))}
        </div>
        <button className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${highlighted
            ? 'bg-[#652BEB] text-white hover:bg-[#5824d3] shadow-lg shadow-[#652BEB]/20'
            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
            }`}>
            {buttonText}
        </button>
    </div>
);

const PreviewShowcase = () => {
    const [scanPos, setScanPos] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanPos(prev => (prev >= 100 ? 0 : prev + 0.3));
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-20 relative max-w-5xl mx-auto hidden md:block group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#222427] via-transparent to-transparent z-10 pointer-events-none" />

            <div className="bg-[#2a2d31] rounded-[40px] p-4 border border-white/5 shadow-2xl overflow-hidden relative">
                <div className="relative rounded-[30px] overflow-hidden aspect-[16/9] bg-black">
                    <img
                        src="/demo-doc.png"
                        alt="Auditoría Forense en Proceso"
                        className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                    />

                    {/* Laser Scanner */}
                    <motion.div
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#652BEB] to-transparent z-20 shadow-[0_0_20px_#652BEB]"
                        style={{ top: `${scanPos}%` }}
                    />

                    {/* Forensic Visual Layer */}
                    <div
                        className="absolute inset-0 z-10 pointer-events-none transition-all duration-300"
                        style={{
                            clipPath: `inset(0 0 ${100 - scanPos}% 0)`,
                            backgroundColor: 'rgba(101, 43, 235, 0.05)'
                        }}
                    >
                        {/* Findings Highlighters - Frame-perfect for the Spanish bill */}
                        {/* Mantención Ascensores Line */}
                        <div className="absolute top-[51.1%] left-[18%] w-[62%] h-[4.5%] border-2 border-red-500/50 bg-red-500/10 rounded-lg flex items-center justify-end pr-4 backdrop-blur-sm animate-pulse overflow-hidden">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={12} className="text-red-500" />
                                <span className="text-[9px] font-black uppercase text-red-500 tracking-tighter">Sobreprecio Detectado +24%</span>
                            </div>
                        </div>

                        {/* Gasto Eléctrico Común Line */}
                        <div className="absolute top-[56.1%] left-[18%] w-[62%] h-[4.5%] border-2 border-[#30E89E]/50 bg-[#30E89E]/10 rounded-lg flex items-center justify-end pr-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={12} className="text-[#30E89E]" />
                                <span className="text-[9px] font-black uppercase text-[#30E89E] tracking-tighter">Variación IPC Normal</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating UI Elements */}
                <AnimatePresence>
                    {scanPos > 15 && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute top-10 left-10 z-30 bg-[#222427]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl border-l-4 border-l-[#652BEB]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#652BEB]/20 flex items-center justify-center">
                                    <Activity size={16} className="text-[#652BEB]" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Analizando</p>
                                    <p className="text-xs font-black italic text-white/90">Forensik_Engine_Alpha_v1.0</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {scanPos > 65 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute bottom-10 right-10 z-30 bg-[#222427]/90 backdrop-blur-md border border-white/10 p-6 rounded-[32px] shadow-2xl max-w-[240px]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    Anomalía detectada
                                </p>
                                <AlertTriangle size={14} className="text-red-500" />
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                Se detectó que el contrato de <span className="text-white font-bold">Mantención de Ascensores</span> excede el benchmark regional en <span className="text-red-400">$245k</span>.
                            </p>
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase py-2 rounded-xl border border-white/10 transition-all">
                                Ver detalle forense
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function LandingPage() {
    const [linesAnalyzed, setLinesAnalyzed] = useState(0);
    const [showRestricted, setShowRestricted] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setLinesAnalyzed(prev => (prev < 500 ? prev + 12 : 500));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#222427] text-white selection:bg-[#652BEB]/30 overflow-x-hidden font-sans relative">
            <Navbar onOpenRestricted={() => setShowRestricted(true)} />

            {/* Modal de Acceso Restringido */}
            <AnimatePresence>
                {showRestricted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1a1c1e]/90 backdrop-blur-sm"
                        onClick={() => setShowRestricted(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#2a2d31] border border-white/10 p-10 rounded-[40px] max-w-md w-full text-center shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-[#652BEB]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={32} className="text-[#652BEB]" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic">Acceso Restringido</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                Estamos finalizando la fase de despliegue para el dominio <span className="text-white font-bold">lupacomun.cl</span>. El auditor automático estará disponible para nuevas comunidades en las próximas horas.
                            </p>
                            <button
                                onClick={() => setShowRestricted(false)}
                                className="w-full bg-[#652BEB] hover:bg-[#5824d3] text-white py-4 rounded-2xl font-bold transition-all"
                            >
                                Entendido
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 md:px-20 text-center overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#652BEB]/10 blur-[120px] rounded-full -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 font-mono"
                >
                    <ShieldCheck size={14} className="text-[#30E89E]" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cumplimiento Ley 21.442 garantizado</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl mx-auto leading-[1.1] mb-8"
                >
                    ¿Sabes realmente en qué se gasta el <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#652BEB] to-[#EE6593] italic">dinero</span> de tu comunidad?
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                >
                    Auditoría forense impulsada por IA para detectar irregularidades, sobreprecios y falta de transparencia en tus gastos comunes de forma instantánea.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => setShowRestricted(true)}
                        className="w-full sm:w-auto bg-[#652BEB] hover:bg-[#5824d3] text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-[#652BEB]/30 hover:scale-105 active:scale-95"
                    >
                        Auditar mi edificio ahora
                    </button>
                    <button
                        onClick={() => setShowRestricted(true)}
                        className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-bold text-lg transition-all"
                    >
                        Ver demo interactiva
                    </button>
                </motion.div>

                <PreviewShowcase />
            </section>

            {/* Comparison Section */}
            <section className="py-32 px-6 md:px-20 bg-[#1a1c1e]">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-black mb-6">¿Por qué esperar meses para saber dónde está tu dinero?</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs font-mono text-accent">La tecnología hace obsoleta a la auditoría manual.</p>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    <div className="bg-[#2a2d31]/50 border border-white/5 rounded-[40px] p-10 opacity-60 grayscale hover:grayscale-0 transition-all text-left">
                        <div className="flex items-center gap-3 mb-10">
                            <Clock className="text-gray-500" />
                            <h4 className="text-xl font-bold text-gray-400">Auditoría Tradicional</h4>
                        </div>
                        <div className="space-y-10">
                            {[
                                { label: 'TIEMPO DE ENTREGA', value: '60-90 días' },
                                { label: 'INVERSIÓN PROMEDIO', value: '$1.5M - $3M CLP' },
                                { label: 'ALCANCE DEL ANÁLISIS', value: 'Muestreo manual limitado' },
                                { label: 'ENTREGABLE', value: 'PDF estático de 50 páginas' },
                            ].map((item, i) => (
                                <div key={i} className="border-b border-white/5 pb-4">
                                    <p className="text-[10px] font-bold text-gray-600 mb-1">{item.label}</p>
                                    <p className="text-lg font-medium text-gray-400">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#2a2d31] to-[#222427] border-2 border-[#652BEB] rounded-[40px] p-10 shadow-2xl shadow-[#652BEB]/10 ring-4 ring-[#652BEB]/5 text-left">
                        <div className="flex items-center gap-3 mb-10">
                            <Zap className="text-[#652BEB]" fill="currentColor" />
                            <h4 className="text-xl font-bold text-white">LupaComún IA</h4>
                        </div>
                        <div className="space-y-10">
                            {[
                                { label: 'TIEMPO DE ENTREGA', value: '60 segundos' },
                                { label: 'INVERSIÓN PROMEDIO', value: 'Desde $9.990 CLP' },
                                { label: 'ALCANCE DEL ANÁLISIS', value: 'Análisis del 100% de los gastos' },
                                { label: 'ENTREGABLE', value: 'Dashboard interactivo con alertas Rojas' },
                            ].map((item, i) => (
                                <div key={i} className="border-b border-[#652BEB]/20 pb-4 relative group">
                                    <p className="text-[10px] font-bold text-[#652BEB] mb-1">{item.label}</p>
                                    <p className="text-lg font-black text-white">{item.value}</p>
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-[#30E89E] w-0 group-hover:w-full transition-all duration-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto mt-16 bg-white/5 border border-white/10 p-8 rounded-[32px] flex flex-col items-center text-center">
                    <div className="flex items-baseline gap-4 mb-2">
                        <span className="text-6xl font-black text-white tabular-nums">{linesAnalyzed}</span>
                        <span className="text-xl font-bold text-[#652BEB]">LÍNEAS DE GASTO</span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                        Nuestra IA analiza <span className="text-[#30E89E] font-bold">500 líneas de gasto por minuto</span>. La verdad, al instante.
                    </p>
                </div>
            </section>

            {/* Pain Points */}
            <section className="py-32 px-6 md:px-20">
                <div className="text-center mb-20 text-left md:text-center">
                    <h2 className="text-4xl font-black mb-4">La transparencia no es negociable</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Identificamos los 3 riesgos críticos que afectan a las comunidades en Chile bajo la nueva normativa legal.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
                    <PainPointCard
                        icon={FileText}
                        title="Gastos sin respaldo"
                        description="Nuestra IA detecta automáticamente egresos que no cuentan con facturas o boletas válidas ante el SII, evitando fugas de capital injustificadas."
                        color="#EE6593"
                    />
                    <PainPointCard
                        icon={TrendingUp}
                        title="Sobreprecios ocultos"
                        description="Comparamos los costos de mantención y servicios de tu edificio con los promedios del mercado para identificar cobros excesivos de proveedores."
                        color="#FFBC1E"
                    />
                    <PainPointCard
                        icon={Fingerprint}
                        title="Falta de transparencia legal"
                        description="Aseguramos que la rendición de cuentas cumpla estrictamente con la Ley 21.442, protegiendo al comité y a los copropietarios."
                        color="#30E89E"
                    />
                </div>
            </section>

            {/* Pricing */}
            <section className="py-32 px-6 md:px-20 bg-gradient-to-b from-[#222427] to-[#1a1c1e]">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-black mb-4">Planes para cada comunidad</h2>
                    <p className="text-gray-400">Invierte en tranquilidad y recupera el control de tus finanzas.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto items-stretch">
                    <PricingCard
                        title="Reporte Express"
                        price="$9.990"
                        subText="/una vez"
                        features={[
                            "Carga única de documentos",
                            "Detección de errores básicos",
                            "Resumen en PDF"
                        ]}
                    />
                    <PricingCard
                        title="Plan Vigilante"
                        price="1.5 UF"
                        subText="/mes"
                        highlighted
                        buttonText="Empezar Ahora"
                        features={[
                            "Monitoreo mensual continuo",
                            "Alertas de sobreprecio en tiempo real",
                            "Acceso a Dashboard IA",
                            "Certificación Ley 21.442"
                        ]}
                    />
                    <PricingCard
                        title="Sello de Transparencia"
                        price="Custom"
                        buttonText="Contactar Ventas"
                        features={[
                            "Para administradoras de edificios",
                            "Múltiples comunidades",
                            "API de integración"
                        ]}
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-20 pb-10 px-6 md:px-20 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-left">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-[#652BEB] rounded-lg flex items-center justify-center">
                                <Search size={18} className="text-white" strokeWidth={3} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">LupaComún</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Revolucionando la transparencia en edificios y condominios a través de inteligencia artificial aplicada a la auditoría forense.
                        </p>
                        <div className="flex gap-4">
                            <Facebook size={18} className="text-gray-500 hover:text-white cursor-pointer" />
                            <Twitter size={18} className="text-gray-500 hover:text-white cursor-pointer" />
                            <Instagram size={18} className="text-gray-500 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 uppercase text-[10px] tracking-widest text-[#652BEB]">Producto</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-medium">
                            <li className="hover:text-white cursor-pointer transition-colors">Cómo funciona</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Precios</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Seguridad</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Demo</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 uppercase text-[10px] tracking-widest text-[#652BEB]">Legales</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-medium">
                            <li className="hover:text-white cursor-pointer transition-colors">Términos de servicio</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Privacidad</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Ley 21.442</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Contacto</li>
                        </ul>
                    </div>
                    <div className="bg-[#2a2d31] p-6 rounded-3xl border border-white/5 text-center">
                        <h4 className="font-bold mb-4 text-xs">Certificación Oficial</h4>
                        <div className="w-full aspect-video bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-4">
                            <ShieldCheck size={40} className="text-[#30E89E]" />
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Cumple Normativa MINVU 2024</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-4 font-mono">
                    <p className="text-[10px] text-gray-600">
                        © 2024 LUPACOMÚN. TODOS LOS DERECHOS RESERVADOS.
                        <Link href="/dashboard" className="ml-2 opacity-0 hover:opacity-20 transition-opacity">
                            <span className="text-[8px]">CORE_ACCESS</span>
                        </Link>
                    </p>
                    <p className="text-[10px] text-gray-600 font-bold tracking-widest uppercase flex items-center gap-1">
                        HECHO CON <span className="text-[#EE6593]">♥</span> EN SANTIAGO, CHILE
                    </p>
                </div>
            </footer>
        </div>
    );
}
