import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

function buildPageText(textContent) {
  if (!textContent.items || textContent.items.length === 0) return '';

  let result = '';
  let lastY = null;

  for (const item of textContent.items) {
    if (!item.str) continue;
    const y = item.transform ? item.transform[5] : null;

    if (lastY !== null && y !== null && Math.abs(y - lastY) > 1) {
      result += '\n';
    } else if (lastY !== null) {
      result += ' ';
    }

    result += item.str;
    if (y !== null) lastY = y;
  }

  return result;
}

export async function extractTextFromPDF(file) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = buildPageText(textContent);

    if (pages.length > 0) {
      pages.push(`--- 第 ${i} 页 ---\n${pageText}`);
    } else {
      pages.push(pageText);
    }
  }

  const fullText = pages.join('\n\n');
  return fullText.trim() || null;
}
