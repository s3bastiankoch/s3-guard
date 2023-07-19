import { parse } from "csv-parse/sync";

export function parseCSV(input: string) {
  return parse(input, {
    columns: true,
    skip_empty_lines: true,
  });
}
