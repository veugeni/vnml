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

export type VNMLCheck<T> = { line: number; extra: string; code: T };

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

export const addError = (code: VNMLError, line: number, extra: string) => {
  checkResult.errors.push({ code, line, extra });
};

export const addWarning = (code: VNMLWarning, line: number, extra: string) => {
  checkResult.warnings.push({ code, line, extra });
};

export const checkResults = () => checkResult;

export const showCheckResults = () => {
  checkResult.errors.forEach((e) =>
    console.log(`${e.code} ${ErrorCodes[e.code]} at line ${e.line}. ${e.extra}`)
  );
  checkResult.warnings.forEach((w) =>
    console.log(
      `Warning: ${w.code} ${WarningsCodes[w.code]} at line ${w.line}. ${
        w.extra
      }`
    )
  );
};

export const hasErrors = () => checkResult.errors.length > 0;
