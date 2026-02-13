const formulaPrefixes = new Set(["=", "+", "-", "@"]);

export const escapeField = (value: unknown): string => {
  let str = String(value ?? "");

  // Prevent CSV formula injection
  if (str.length > 0 && formulaPrefixes.has(str[0])) {
    str = `'${str}`;
  }

  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

export const generateCsv = (headers: string[], rows: unknown[][]): string => {
  const headerLine = headers.map(escapeField).join(",");
  const dataLines = rows.map((row) => row.map(escapeField).join(","));
  return [headerLine, ...dataLines].join("\n");
};
