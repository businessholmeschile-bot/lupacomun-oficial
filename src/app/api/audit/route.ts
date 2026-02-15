import { NextRequest, NextResponse } from 'next/server';
import { processDocument, saveForensicResults, detectPeriod } from '@/logic/documentProcessor';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const allResults = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const results = await processDocument(buffer, file.name, file.type);
            const period = detectPeriod(results.length > 0 ? results[0].descripcion : file.name, file.name);

            const { error } = await saveForensicResults(results, period);

            if (error === 'DUPLICATE') {
                return NextResponse.json({
                    error: 'DUPLICATE',
                    message: `¡Este mes (${period.mes} ${period.anio}) ya lo tenemos bajo la lupa! Sube otro mes para comparar o el mismo de otro año.`
                }, { status: 409 });
            }

            allResults.push(...results);
        }

        return NextResponse.json({
            success: true,
            count: files.length,
            anomalies: allResults.filter(r => r.es_anomalia).length
        });

    } catch (error) {
        console.error('Audit API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
