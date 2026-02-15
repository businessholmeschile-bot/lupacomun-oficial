const mammoth = require('mammoth');
const fs = require('fs');

async function testDocx() {
    try {
        console.log("Checking mammoth...");
        const result = await mammoth.extractRawText({ path: "test.docx" }); // This will fail if file doesn't exist
        console.log("Result:", result.value);
    } catch (e) {
        console.error("Test failed as expected or with error:", e.message);
    }
}

testDocx();
