"use strict";
exports.__esModule = true;
exports.hasErrors = exports.showCheckResults = exports.checkResults = exports.addWarning = exports.addError = exports.clearCheckResults = exports.WarningsCodes = exports.ErrorCodes = void 0;
exports.ErrorCodes = {
    ERR001: "Not a valid VML file.",
    ERR002: "Node not found",
    ERR003: "Node must be unique",
    ERR004: "Node is misplaced",
    ERR005: "Syntax error",
    ERR006: "Multiple definition",
    ERR007: "Invalid or duplicated label",
    ERR000: "Something crashed!"
};
exports.WarningsCodes = {
    WAR001: "Node not present",
    WAR002: "Unknown node found",
    WAR003: "Multiple elements found",
    WAR004: "Misplaced text",
    WAR005: "Inconsistent jump"
};
var checkResult = {
    errors: [],
    warnings: []
};
var clearCheckResults = function () {
    checkResult.errors = [];
    checkResult.warnings = [];
};
exports.clearCheckResults = clearCheckResults;
var addError = function (code, line, extra) {
    checkResult.errors.push({ code: code, line: line, extra: extra });
};
exports.addError = addError;
var addWarning = function (code, line, extra) {
    checkResult.warnings.push({ code: code, line: line, extra: extra });
};
exports.addWarning = addWarning;
var checkResults = function () { return checkResult; };
exports.checkResults = checkResults;
var showCheckResults = function () {
    checkResult.errors.forEach(function (e) {
        return console.log("".concat(e.code, " ").concat(exports.ErrorCodes[e.code], " at line ").concat(e.line, ". ").concat(e.extra));
    });
    checkResult.warnings.forEach(function (w) {
        return console.log("Warning: ".concat(w.code, " ").concat(exports.WarningsCodes[w.code], " at line ").concat(w.line, ". ").concat(w.extra));
    });
};
exports.showCheckResults = showCheckResults;
var hasErrors = function () { return checkResult.errors.length > 0; };
exports.hasErrors = hasErrors;
