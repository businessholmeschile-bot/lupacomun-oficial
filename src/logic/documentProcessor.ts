if (typeof global !== 'undefined' && !(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix { };
}

import { supabase } from '@/lib/supabase';

interface ForensicResult {
    descripcion: string;
    categoria: string;
    monto: number;
    es_anomalia: boolean;
    alerta_tipo: string | null;
    ai_comentario: string;
    rut_proveedor?: string;
}

export async function processDocument(buffer: Buffer, filename: string, mimeType: string): Promise<ForensicResult[]> {
    let text = '';
    console.log(`[Forensik Engine] Procesando: ${filename} (${mimeType})`);

    try {
        if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
            console.log(`[Forensik Engine] Cargando motor PDF...`);
            const pdf = require('pdf-parse');
            const data = await pdf(buffer);
            text = data.text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filename.endsWith('.docx')) {
            console.log(`[Forensik Engine] Cargando motor DOCX (Mammoth)...`);
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer: buffer });
            text = result.value;
        } else if (mimeType.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(filename)) {
            console.log(`[Forensik Engine] Iniciando Visión Forensik (OCR)...`);
            const { createWorker } = require('tesseract.js');
            const worker = await createWorker('spa');
            const { data: { text: ocrText } } = await worker.recognize(buffer);
            text = ocrText;
            await worker.terminate();
        } else {
            text = buffer.toString('utf8');
        }
    } catch (error) {
        console.error(`[Forensik Engine] CRASH en procesamiento:`, error);
        text = `Error en extracción de ${filename}`;
    }

    console.log(`[Forensik Engine] Finalizando análisis para: ${filename}`);
    return analyzeForensicText(text, filename);
}

async function analyzeForensicText(text: string, filename: string): Promise<ForensicResult[]> {
    const results: ForensicResult[] = [];
    const lowerText = text.toLowerCase();

    // --- Motor Forensik de LupaComún ---

    // 1. Extracción de Gastos Identificados (Heurística de Auditoría)
    const lines = text.split('\n');
    const spendingPatterns = [
        { regex: /(reparación|mantención|servicio|arreglo)\s+(.*?)\s+(\d+[\d\.]*)/i, categoria: 'Reparaciones' },
        { regex: /(honorarios|administración|gestión)\s+(\d+[\d\.]*)/i, categoria: 'Administración' },
        { regex: /(seguro|póliza|incendio)\s+(\d+[\d\.]*)/i, categoria: 'Seguros' },
        { regex: /(aguas?|luz|electricidad|gas)\s+(\d+[\d\.]*)/i, categoria: 'Suministros' }
    ];

    lines.forEach(line => {
        for (const pattern of spendingPatterns) {
            const match = line.match(pattern.regex);
            if (match) {
                const desc = match[1] + (match[2] ? ' ' + match[2] : '');
                const montoStr = match[match.length - 1].replace(/\./g, '').replace(',', '');
                const monto = parseInt(montoStr);

                if (!isNaN(monto)) {
                    results.push({
                        descripcion: desc.trim(),
                        categoria: pattern.categoria,
                        monto: monto,
                        es_anomalia: false,
                        alerta_tipo: null,
                        ai_comentario: 'Gasto detectado por Forensik Engine.'
                    });
                }
                break;
            }
        }
    });

    // 2. Análisis de Reajuste IPC (Chile 2026 Simulation)
    const ipcOficial = 0.45;
    const reajusteMatch = text.match(/(reajuste|ipc|incremento)\s+(\d+[\d\.]*)\s*%/i);

    if (reajusteMatch) {
        const alzaDetectada = parseFloat(reajusteMatch[2].replace(',', '.'));
        if (alzaDetectada > ipcOficial * 1.5) {
            results.push({
                descripcion: 'Reajuste Mensual de Gastos (Administración)',
                categoria: 'Administración',
                monto: 0,
                es_anomalia: true,
                alerta_tipo: 'EXCESO_IPC_JUSTIFICADO',
                ai_comentario: `ALERTA: El reajuste aplicado (${alzaDetectada}%) excede significativamente el IPC oficial (${ipcOficial}%).`
            });
        }
    }

    // 3. Auditoría de Probidad (RUTs)
    const rutRegex = /(\d{1,2}\.\d{3}\.\d{3}-[\dkK])/g;
    const rutsEncontrados = text.match(rutRegex);
    if (rutsEncontrados && results.length > 0) {
        results[0].rut_proveedor = rutsEncontrados[0];
    }

    if (results.length === 0) {
        results.push({
            descripcion: `Análisis de Documento: ${filename}`,
            categoria: 'Varios',
            monto: 0,
            es_anomalia: false,
            alerta_tipo: null,
            ai_comentario: 'Documento procesado. No se detectaron anomalías críticas evidentes en el primer escaneo.'
        });
    }

    return results;
}

export function detectPeriod(text: string, filename: string): { mes: string, anio: number } {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const textLower = (text + ' ' + filename).toLowerCase();

    let mes = 'marzo'; // Default
    let anio = 2026;

    for (const m of months) {
        if (textLower.includes(m)) {
            mes = m;
            break;
        }
    }

    const yearMatch = textLower.match(/20\d{2}/);
    if (yearMatch) anio = parseInt(yearMatch[0]);

    return { mes, anio };
}

export async function saveForensicResults(results: ForensicResult[], period: { mes: string, anio: number }) {
    const periodTag = `[${period.mes.toUpperCase()} ${period.anio}]`;

    // 1. Check for duplicates using the tag in description
    const { data: existing } = await supabase
        .from('gastos')
        .select('id')
        .ilike('descripcion', `%${periodTag}%`)
        .limit(1);

    if (existing && existing.length > 0) {
        return { error: 'DUPLICATE' };
    }

    // 2. Insert new results with the period in the description
    const { data, error } = await supabase
        .from('gastos')
        .insert(
            results.map(r => ({
                descripcion: `${r.descripcion} ${periodTag}`,
                categoria: r.categoria,
                monto: Math.round(r.monto),
                es_anomalia: r.es_anomalia,
                alerta_tipo: r.alerta_tipo,
                ai_comentario: r.ai_comentario,
                rut_proveedor: '76.123.456-7'
            }))
        );

    if (error) console.error('Error saving forensic results:', error);
    return { data, error };
}

// Helper to clear all data for a fresh demo (optional but useful)
export async function clearTable() {
    await supabase.from('gastos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}
