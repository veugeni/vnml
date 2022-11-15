export const ErrorCodes = {
  ERR001: "Not a valid VML file.",
  ERR002: "Node not found",
  ERR003: "Node must be unique",
  ERR004: "Node is misplaced",
  ERR005: "Syntax error",
  ERR006: "Multiple definition",
  ERR007: "Invalid or duplicated label",
  ERR000: "Something crashed!",
};

export const WarningsCodes = {
  WAR001: "Node not present",
  WAR002: "Unknown node found",
  WAR003: "Multiple elements found",
  WAR004: "Misplaced text",
  WAR005: "Inconsistent jump",
  WAR006: "Unknown attribute",
  WAR007: "Check resource url",
  WAR008: "Uknown variable",
};

export type VNMLError = keyof typeof ErrorCodes;
export type VNMLWarning = keyof typeof WarningsCodes;

export type VNMLCheck<T> = {
  startIndex: number;
  endIndex: number;
  extra: string;
  code: T;
};

export type SourceCheckResult = {
  errors: VNMLCheck<VNMLError>[];
  warnings: VNMLCheck<VNMLWarning>[];
};

const checkResult: SourceCheckResult = {
  errors: [],
  warnings: [],
};

export const clearCheckResults = () => {
  checkResult.errors = [];
  checkResult.warnings = [];
};

export const addError = (
  code: VNMLError,
  startIndex: number,
  endIndex: number,
  extra: string
) => {
  checkResult.errors.push({ code, startIndex, endIndex, extra });
};

export const addWarning = (
  code: VNMLWarning,
  startIndex: number,
  endIndex: number,
  extra: string
) => {
  checkResult.warnings.push({ code, startIndex, endIndex, extra });
};

export const checkResults = () => checkResult;

export const showCheckResults = (body: string) => {
  checkResult.errors.forEach((e) => {
    const line = getLine(body, e.startIndex);
    console.log(`${e.code} ${ErrorCodes[e.code]} at line ${line}. ${e.extra}`);
  });
  checkResult.warnings.forEach((w) => {
    const line = getLine(body, w.startIndex);
    console.log(
      `Warning: ${w.code} ${WarningsCodes[w.code]} at line ${line}. ${w.extra}`
    );
  });
};

export function getLine(body: string, index: number) {
  if (!body) return false;
  var subBody = body.substring(0, index);
  if (subBody === "") return false;
  var match = subBody.match(/\n/gi);
  if (match) return match.length + 1;
  return 1;
}

export const hasErrors = () => checkResult.errors.length > 0;
