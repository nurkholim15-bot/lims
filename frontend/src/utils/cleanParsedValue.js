export const cleanParsedValue = (val) => {
  if (!val) return "";
  // Remove percent signs and trim whitespace
  let cleaned = val.replace(/%/g, "").trim();
  // Replace commas with dots for decimal numbers
  cleaned = cleaned.replace(/,/g, ".");
  // Split by whitespace and pick the first numeric token
  const parts = cleaned.split(/\s+/);
  for (const p of parts) {
    if (/^[\d.]+$/.test(p)) {
      return p;
    }
  }
  return cleaned;
};
