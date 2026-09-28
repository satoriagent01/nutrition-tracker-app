/**
 * OCR module using Tesseract.js to extract text from nutrition label images.
 */

import Tesseract from 'tesseract.js';

/**
 * Initialize Tesseract worker with Dutch and English languages for nutrition labels.
 */
let worker = null;

async function getWorker() {
  if (!worker) {
    worker = await Tesseract.createWorker(['nld', 'eng'], 1, {
      logger: () => {}, // Suppress logging
    });
  }
  return worker;
}

/**
 * Extract text from an image file (File, Blob, or ImageBitmap).
 * @param {File|Blob|ImageBitmap} image - The image to process.
 * @returns {Promise<string>} The extracted text.
 */
export async function extractText(image) {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  await worker.terminate();
  worker = null;
  return data.text;
}

/**
 * Extract text with confidence scores.
 * @param {File|Blob|ImageBitmap} image - The image to process.
 * @returns {Promise<{text: string, confidence: number, words: Array}>}
 */
export async function extractTextWithConfidence(image) {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  await worker.terminate();
  worker = null;

  const words = data.words?.map(w => ({
    text: w.text,
    confidence: w.confidence,
  })) || [];

  return {
    text: data.text,
    confidence: data.confidence,
    words,
  };
}