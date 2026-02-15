const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function debugExtraction() {
    const docxPath = path.join(__dirname, 'node_modules/mammoth/test/test-data/single-paragraph.docx');
    console.log(`[Diagnostic] Reading file from: ${docxPath}`);

    try {
        const buffer = fs.readFileSync(docxPath);
        console.log(`[Diagnostic] Buffer length: ${buffer.length} bytes`);

        console.log(`[Diagnostic] Calling mammoth.extractRawText({ buffer: buffer })`);
        const result = await mammoth.extractRawText({ buffer: buffer });

        console.log(`[Diagnostic] Success! Extracted text: "${result.value.trim()}"`);
        console.log(`[Diagnostic] Messages:`, result.messages);
    } catch (error) {
        console.error(`[Diagnostic] FAILED extraction:`, error);
    }
}

debugExtraction();
