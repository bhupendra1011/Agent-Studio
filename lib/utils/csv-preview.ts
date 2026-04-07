/** Minimal CSV line split — does not handle quoted commas in fields. */
function splitCsvLine(line: string): string[] {
  return line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
}

export interface CsvPreviewResult {
  headers: string[];
  rows: string[][];
  rowCountEstimate: number;
  hasPhoneColumn: boolean;
  phoneColumnKey: string | null;
  invalidE164Count: number;
}

const E164_LIKE = /^\+?[1-9]\d{6,14}$/;

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Parse CSV text for wizard preview: first row headers, up to `maxPreviewRows` data rows.
 * `rowCountEstimate` is line count minus header (blank lines skipped in count).
 */
export function parseCsvPreview(
  text: string,
  maxPreviewRows = 5
): CsvPreviewResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      headers: [],
      rows: [],
      rowCountEstimate: 0,
      hasPhoneColumn: false,
      phoneColumnKey: null,
      invalidE164Count: 0,
    };
  }

  const headers = splitCsvLine(lines[0]!).map(normalizeHeader);
  const dataLines = lines.slice(1);
  const rows = dataLines
    .slice(0, maxPreviewRows)
    .map((line) => splitCsvLine(line));

  const phoneIdx = headers.findIndex(
    (h) => h === "phone_number" || h === "phonenumber" || h === "phone"
  );
  const hasPhoneColumn = phoneIdx >= 0;
  const phoneColumnKey =
    phoneIdx >= 0 ? headers[phoneIdx] ?? "phone_number" : null;

  let invalidE164Count = 0;
  if (hasPhoneColumn && phoneIdx >= 0) {
    for (const line of dataLines) {
      const cells = splitCsvLine(line);
      const raw = (cells[phoneIdx] ?? "").replace(/[\s()-]/g, "");
      if (!raw) continue;
      if (!E164_LIKE.test(raw)) invalidE164Count += 1;
    }
  }

  return {
    headers: splitCsvLine(lines[0]!),
    rows,
    rowCountEstimate: dataLines.length,
    hasPhoneColumn,
    phoneColumnKey,
    invalidE164Count,
  };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}
