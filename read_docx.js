const fs = require('fs');
const JSZip = require('jszip');

async function readDocx(filePath) {
  const content = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(content);
  const docXml = await zip.file('word/document.xml').async('string');
  const text = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(text);
}
readDocx(process.argv[2]).catch(console.error);
