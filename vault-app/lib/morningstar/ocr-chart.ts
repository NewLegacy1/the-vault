/** Browser OCR for chart snapshots — lazy-loads tesseract.js. */

export async function ocrChartText(dataUrlOrBlob: string | Blob): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: () => undefined,
  });
  try {
    const {
      data: { text },
    } = await worker.recognize(dataUrlOrBlob);
    return text ?? "";
  } finally {
    await worker.terminate();
  }
}
