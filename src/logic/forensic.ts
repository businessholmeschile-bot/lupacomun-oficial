import { supabase } from '@/lib/supabase';

export interface Gasto {
    id: string;
    auditoria_id?: string;
    categoria: string;
    descripcion: string;
    monto: number;
    rut_proveedor: string;
    es_anomalia: boolean;
    alerta_tipo: string;
    ai_comentario: string;
}

export interface PrecioReferencia {
    id: string;
    item_nombre: string;
    precio_promedio_mercado: number;
    comuna: string;
    unidad_medida: string;
}

/**
 * El Cerebro Forense - LupaComún
 * Lógica para detectar sobreprecios y anomalías bajo la Ley 21.442
 */
export async function detectarSobreprecios(gasto: Gasto) {
    // 1. Buscar precio de referencia para el item/servicio
    const { data: referencias } = await supabase
        .from('precios_referencia')
        .select('*')
        .ilike('item_nombre', `%${gasto.descripcion.split(' ')[0]}%`);

    if (!referencias || referencias.length === 0) return { es_anomalia: false };

    const ref = referencias[0];
    const sobreprecioPorcentaje = ((gasto.monto - ref.precio_promedio_mercado) / ref.precio_promedio_mercado) * 100;

    // 2. Forensik Protocol: Desviación > 30% es Anomalía Crítica
    if (sobreprecioPorcentaje > 30) {
        return {
            es_anomalia: true,
            alerta_tipo: 'SOBREPRECIO_CRITICO',
            comentario: `ALERTA FORENSE: Sobreprecio del ${sobreprecioPorcentaje.toFixed(2)}% detectado. Precio mercado estimado para la comuna: $${ref.precio_promedio_mercado}.`,
            diferencia: gasto.monto - ref.precio_promedio_mercado
        };
    } else if (sobreprecioPorcentaje > 15) {
        return {
            es_anomalia: true,
            alerta_tipo: 'SOBREPRECIO_MODERADO',
            comentario: `Aviso: El costo es un ${sobreprecioPorcentaje.toFixed(2)}% superior al promedio de mercado.`,
            diferencia: gasto.monto - ref.precio_promedio_mercado
        };
    }

    return { es_anomalia: false };
}

/**
 * Genera un Score de Transparencia (0-100) basado en anomalías y cumplimiento
 */
export function calcularScoreTransparencia(gastos: Gasto[]): number {
    if (gastos.length === 0) return 100;

    const totalGastos = gastos.length;
    const anomaliasCriticas = gastos.filter(g => g.alerta_tipo === 'SOBREPRECIO_CRITICO' || g.alerta_tipo === 'EXCESO_IPC_JUSTIFICADO').length;
    const anomaliasModeradas = gastos.filter(g => g.alerta_tipo === 'SOBREPRECIO_MODERADO' || g.alerta_tipo === 'INTERÉS_SOBRE_LÍMITE').length;

    // Penalizaciones
    const penalizacionCritica = anomaliasCriticas * 25;
    const penalizacionModerada = anomaliasModeradas * 10;

    const score = 100 - (penalizacionCritica + penalizacionModerada);
    return Math.max(0, score);
}

/**
 * Calcula el Ahorro Potencial si se eliminaran los sobreprecios
 */
export function calcularAhorroPotencial(gastos: Gasto[]): number {
    return gastos.reduce((acc, g) => {
        if (g.es_anomalia && g.ai_comentario.includes('Precio mercado:')) {
            const match = g.ai_comentario.match(/mercado: \$([\d\.]+)/);
            if (match) {
                const precioMercado = parseInt(match[1].replace(/\./g, ''));
                return acc + (g.monto - precioMercado);
            }
        }
        // Si no tenemos el precio de mercado exacto en el comentario, usamos una estimación conservadora del 20% del sobreprecio
        if (g.es_anomalia && g.alerta_tipo === 'SOBREPRECIO_CRITICO') {
            return acc + (g.monto * 0.25);
        }
        return acc;
    }, 0);
}
