"use strict";
exports.__esModule = true;
exports.hasErrors = exports.getLine = exports.showCheckResults = exports.checkResults = exports.addWarning = exports.addError = exports.clearCheckResults = exports.WarningsCodes = exports.ErrorCodes = void 0;
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
    WAR005: "Inconsistent jump",
    WAR006: "Unknown attribute",
    WAR007: "Check resource url",
    WAR008: "Uknown variable"
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
var addError = function (code, startIndex, endIndex, extra) {
    checkResult.errors.push({ code: code, startIndex: startIndex, endIndex: endIndex, extra: extra });
};
exports.addError = addError;
var addWarning = function (code, startIndex, endIndex, extra) {
    checkResult.warnings.push({ code: code, startIndex: startIndex, endIndex: endIndex, extra: extra });
};
exports.addWarning = addWarning;
var checkResults = function () { return checkResult; };
exports.checkResults = checkResults;
var showCheckResults = function (body) {
    checkResult.errors.forEach(function (e) {
        var line = getLine(body, e.startIndex);
        console.log("".concat(e.code, " ").concat(exports.ErrorCodes[e.code], " at line ").concat(line, ". ").concat(e.extra));
    });
    checkResult.warnings.forEach(function (w) {
        var line = getLine(body, w.startIndex);
        console.log("Warning: ".concat(w.code, " ").concat(exports.WarningsCodes[w.code], " at line ").concat(line, ". ").concat(w.extra));
    });
};
exports.showCheckResults = showCheckResults;
function getLine(body, index) {
    if (!body)
        return false;
    var subBody = body.substring(0, index);
    if (subBody === "")
        return false;
    var match = subBody.match(/\n/gi);
    if (match)
        return match.length + 1;
    return 1;
}
exports.getLine = getLine;
var hasErrors = function () { return checkResult.errors.length > 0; };
exports.hasErrors = hasErrors;
