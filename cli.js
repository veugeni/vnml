#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var package_json_1 = require("./package.json");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var commander_1 = require("commander");
var child_process_1 = require("child_process");
var htmlparser2_1 = require("htmlparser2");
var errorCodes_1 = require("./errorCodes");
var program = new commander_1.Command();
program
    .name("vnml")
    .description("VNML Visual Novel Markup Language Compiler")
    .version(package_json_1.version);
program
    .command("build")
    .alias("b")
    .description("Builds a distributable pack")
    .argument("<source>", "source file name")
    .option("-d, --destination <string>", "sets destination path")
    .option("-r, --run", "run test http server on build directory")
    .option("-c, --clean", "clean up destination folder before building")
    .option("-p, --port <port>", "sets debug server port (default 8080)")
    .action(function (source, options) {
    build(source, options);
});
program
    .command("check")
    .alias("c")
    .description("Syntax checks VNML file")
    .argument("<source>", "source file name")
    .action(function (source, options) {
    compile(source, options);
});
program.parse();
function getDefaultConfig(source, options) {
    var ext = path_1["default"].extname(source);
    var fullPath = source;
    if (ext === "") {
        fullPath = fullPath + ".vnml";
    }
    return {
        sourceFullPath: fullPath,
        sourcePath: path_1["default"].dirname(fullPath),
        sourceFileName: path_1["default"].basename(fullPath),
        sourceExt: path_1["default"].extname(fullPath),
        destFileName: "",
        destExt: "",
        destPath: "",
        destFullPath: "",
        title: "Unspecified...",
        author: "Unspecified...",
        pageTitle: "VNML Game",
        port: options.port || "8080"
    };
}
function checkSourceExistance(config) {
    if (config.sourceExt.toLowerCase() === ".vnml") {
        try {
            if (!fs_1["default"].existsSync(config.sourceFullPath)) {
                console.log("File ".concat(config.sourceFileName, " does not exists."));
                return false;
            }
            return true;
        }
        catch (err) {
            console.log("Error in getting file: ", err);
            return false;
        }
    }
    else {
        console.log("File ".concat(config.sourceFileName, " must be have .vnml extension. Why? Because I like the sound of it."));
        return false;
    }
}
function compile(source, options) {
    console.log("VNML Compiler & builder v.".concat(package_json_1.version, "\n"));
    console.log("Checking ".concat(source, "\n"));
    var config = getDefaultConfig(source, options);
    if (checkSourceExistance(config)) {
        try {
            var sourceVnml = fs_1["default"].readFileSync(config.sourceFullPath, {
                encoding: "utf8"
            });
            checkSource(sourceVnml);
            (0, errorCodes_1.showCheckResults)();
            process.exit((0, errorCodes_1.hasErrors)() ? 1 : 0);
        }
        catch (err) {
            console.log("Error: ", err);
            process.exit(1);
        }
    }
    process.exit(1);
}
function build(source, options) {
    console.log("VNML Compiler & builder v.".concat(package_json_1.version, "\n"));
    console.log("Building ".concat(source, "\n"));
    var config = getDefaultConfig(source, options);
    if (options.destination) {
        config.destExt = path_1["default"].extname(options.destination);
        if (config.destExt) {
            config.destFullPath = options.destination;
            config.destFileName = path_1["default"].basename(options.destination);
            config.destPath = path_1["default"].dirname(options.destination);
        }
        else {
            config.destExt = ".html";
            config.destFileName = config.destFileName = config.sourceFileName.replace(config.sourceExt, config.destExt);
            config.destPath = options.destination;
        }
    }
    else {
        config.destExt = ".html";
        config.destFileName = config.sourceFileName.replace(config.sourceExt, config.destExt);
        config.destPath = "./build";
    }
    config.destFullPath = path_1["default"].join(config.destPath, config.destFileName);
    if (checkSourceExistance(config)) {
        try {
            if (!fs_1["default"].existsSync(config.destPath)) {
                fs_1["default"].mkdirSync(config.destPath);
            }
        }
        catch (err) {
            console.log("Error creating destination path ".concat(config.destPath, ":"), err);
            process.exit(1);
        }
        if (options.clean) {
            console.log("Cleaning up output...");
            try {
                var dir = fs_1["default"].readdirSync(config.destPath, { withFileTypes: true });
                dir.forEach(function (e) {
                    if (e.isFile()) {
                        // console.log(`unlink ${e.name}`);
                        fs_1["default"].unlinkSync(path_1["default"].join(config.destPath, e.name));
                    }
                });
            }
            catch (err) {
                console.log("Error cleaning output:", err);
                process.exit(1);
            }
        }
        try {
            console.log("Reading source...");
            var sourceVnml = fs_1["default"].readFileSync(config.sourceFullPath, {
                encoding: "utf8"
            });
            console.log("Checking source...");
            var copyright = checkSource(sourceVnml);
            console.log("");
            (0, errorCodes_1.showCheckResults)();
            console.log("");
            if ((0, errorCodes_1.hasErrors)()) {
                process.exit(1);
            }
            console.log("Building package...");
            config.title = copyright.title;
            config.author = copyright.author;
            config.pageTitle = "".concat(copyright.title, " by ").concat(copyright.author);
            var frameTemplate = require.resolve("./engine/frame.template");
            var frame = fs_1["default"].readFileSync(frameTemplate, {
                encoding: "utf8"
            });
            var menuTemplate = require.resolve("./engine/menu.template");
            var menu = fs_1["default"].readFileSync(menuTemplate, {
                encoding: "utf8"
            });
            var menuResult = replaceAll(menu, "$TITLE$", config.title);
            menuResult = replaceAll(menuResult, "$PAGETITLE$", config.pageTitle);
            menuResult = replaceAll(menuResult, "$AUTHOR$", config.author);
            var result = replaceAll(frame, "$TITLE$", config.title);
            result = replaceAll(result, "$PAGETITLE$", config.pageTitle);
            result = replaceAll(result, "$AUTHOR$", config.author);
            var rname = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(23).substring(2, 5);
            var engine = require.resolve("./engine/vnengine.js");
            fs_1["default"].copyFileSync(engine, path_1["default"].join(config.destPath, "".concat(rname, ".js")));
            var csscore = require.resolve("./engine/vncore.css");
            fs_1["default"].copyFileSync(csscore, path_1["default"].join(config.destPath, "".concat(rname, ".css")));
            result = result
                .replace("vnengine.js", "".concat(rname, ".js"))
                .replace("vncore.css", "".concat(rname, ".css"));
            menuResult = menuResult
                .replace("vnengine.js", "".concat(rname, ".js"))
                .replace("vncore.css", "".concat(rname, ".css"))
                .replace("$DESTINATION$", "./".concat(rname, ".html"));
            fs_1["default"].writeFileSync(config.destFullPath, menuResult);
            result = result
                .replace("$ITSAME$", sourceVnml)
                .replace("$EXITURL$", config.destFileName);
            fs_1["default"].writeFileSync(path_1["default"].join(config.destPath, "".concat(rname, ".html")), result);
            console.log("Distribution package built in ".concat(config.destPath));
            if (options.run) {
                console.log("\nRunning debug server on port ".concat(config.port));
                console.log("Press CTRL+C to stop it");
                var p = (0, child_process_1.spawnSync)("http-server", [
                    config.destPath,
                    "-o ".concat(config.destFileName, " "),
                    "-c-1",
                    "--silent",
                    "-p".concat(config.port),
                ], { shell: true });
                if (p) {
                    console.log("p:", p);
                }
            }
            process.exit(0);
        }
        catch (err) {
            console.log("Error: ", err);
            process.exit(1);
        }
    }
    else {
        process.exit(1);
    }
}
function checkSource(source) {
    (0, errorCodes_1.clearCheckResults)();
    var nodeStack = [];
    var vnmlFound = false;
    var characters = [];
    var labels = [];
    var jumps = [];
    var variables = [];
    var chapters = 0;
    var choices = 0;
    var title = "Unknown title";
    var author = "Unknown author";
    var hasTextValue = false;
    try {
        var parentIs_1 = function (name) {
            return (nodeStack.length > 0 ? nodeStack[nodeStack.length - 1].name : "") ===
                name;
        };
        var getParent_1 = function () {
            return nodeStack.length > 0 ? nodeStack[nodeStack.length - 1].name : "";
        };
        var grandIs_1 = function (name) {
            return (nodeStack.length > 1 ? nodeStack[nodeStack.length - 2].name : "") ===
                name;
        };
        var alreadyFound_1 = function (name) {
            return nodeStack.length > 0
                ? nodeStack[nodeStack.length - 1].found.includes(name)
                : false;
        };
        var hasChildren_1 = function () {
            return nodeStack.length > 0
                ? nodeStack[nodeStack.length - 1].found.length > 0
                : false;
        };
        var pushNode_1 = function (name) {
            if (nodeStack.length > 0)
                nodeStack[nodeStack.length - 1].found.push(name);
            nodeStack.push({ name: name, found: [] });
        };
        var popNode_1 = function () { return nodeStack.pop(); };
        var check1_1 = function (name, parent, unique) {
            if (parentIs_1(parent)) {
                if (unique && alreadyFound_1(name)) {
                    // Multiple not allowed
                    (0, errorCodes_1.addError)("ERR003", 0, name);
                }
            }
            else {
                // must be used in specific parent
                (0, errorCodes_1.addError)("ERR004", 0, "".concat(name, " must be child of ").concat(parent));
            }
        };
        var checkValidAttributes_1 = function (name, attributes, valid, allowNumeric) {
            Object.entries(attributes)
                .filter(function (e) {
                return allowNumeric && !isNaN(parseInt(e[0])) ? false : !valid.includes(e[0]);
            })
                .forEach(function (e) {
                return (0, errorCodes_1.addWarning)("WAR006", 0, "Attribute ".concat(e[0], " of ").concat(name, " is unknown."));
            });
        };
        var isImageResource_1 = function (url) {
            return [".jpeg", ".gif", ".png", ".apng", ".svg", ".bmp", ".ico", ".jpg"].filter(function (e) { return url.toLowerCase().endsWith(e); }).length > 0;
        };
        var isSoundResource_1 = function (url) {
            return [".ogg", ".mp3", ".wav"].filter(function (e) { return url.toLowerCase().endsWith(e); })
                .length > 0;
        };
        var isKnownVariable_1 = function (variable) {
            return variable !== "" ? variables.includes(variable) : true;
        };
        var parser = new htmlparser2_1.Parser({
            onopentag: function (name, attributes) {
                if (vnmlFound) {
                    hasTextValue = false;
                    switch (name) {
                        case "vnml":
                            (0, errorCodes_1.addError)("ERR003", 0, "Main node (VNML)");
                            break;
                        case "vn":
                        case "vnd":
                            check1_1(name, "vnml", true);
                            break;
                        case "bk":
                            if (grandIs_1("vnd")) {
                                if (alreadyFound_1("bk")) {
                                    (0, errorCodes_1.addError)("ERR003", 0, "Image node must be unique in reference");
                                }
                            }
                            else {
                                if (!parentIs_1("vn")) {
                                    (0, errorCodes_1.addError)("ERR005", 0, "Background node must be used in reference or chapters only");
                                }
                            }
                            checkValidAttributes_1(name, attributes, ["flip", "blur", "gray", "flash", "thunder"], false);
                            break;
                        case "nm":
                            if (grandIs_1("vnd")) {
                                if (alreadyFound_1("nm")) {
                                    (0, errorCodes_1.addError)("ERR003", 0, "Name node must be unique in reference");
                                }
                            }
                            else {
                                (0, errorCodes_1.addError)("ERR005", 0, "Name node must be used in reference only");
                            }
                            break;
                        case "st":
                        case "au":
                            check1_1(name, "vnd", true);
                            break;
                        case "gt":
                            check1_1(name, "ch", true);
                            break;
                        case "ch":
                            check1_1(name, "vn", false);
                            choices++;
                            break;
                        case "hideifzero":
                        case "showifzero":
                        case "showifnonzero":
                        case "hideifnonzero":
                            check1_1(name, "ch", false);
                            break;
                        case "cr":
                        case "cl":
                        case "cm":
                            check1_1(name, "vn", false);
                            checkValidAttributes_1(name, attributes, ["flip", "blur", "gray", "shadow", "shatter"], false);
                            break;
                        case "lb":
                        case "bgm":
                        case "sfx":
                        case "end":
                            check1_1(name, "vn", false);
                            break;
                        case "p":
                            chapters++;
                            check1_1(name, "vn", false);
                            break;
                        case "wait":
                        case "end":
                            check1_1(name, "vn", false);
                            break;
                        case "inc":
                        case "dec":
                        case "clr":
                            check1_1(name, "vn", false);
                            break;
                        default:
                            // Not reserved words
                            if (parentIs_1("vnd")) {
                                // It's a character definition
                                if (characters.includes(name)) {
                                    (0, errorCodes_1.addError)("ERR006", 0, "Reference ".concat(name, " already defined."));
                                }
                                characters.push(name);
                            }
                            else if (parentIs_1("vn")) {
                                // It's a paragraph
                                chapters++;
                            }
                            else if (parentIs_1("cr") ||
                                parentIs_1("cm") ||
                                parentIs_1("cl") ||
                                parentIs_1("bk")) {
                                // It's an image reference
                                if (hasChildren_1()) {
                                    (0, errorCodes_1.addWarning)("WAR003", 0, "Only one reference allowed.");
                                }
                            }
                            else {
                                // It will be ignored.
                                (0, errorCodes_1.addWarning)("WAR002", 0, "maybe ".concat(name, " is misplaced?"));
                            }
                            break;
                    }
                }
                if (name === "vnml")
                    vnmlFound = true;
                pushNode_1(name);
            },
            ontext: function (text) {
                hasTextValue = true;
                switch (getParent_1()) {
                    case "lb":
                        if (labels.includes(text)) {
                            (0, errorCodes_1.addError)("ERR007", 0, "".concat(text, " is duplicated"));
                        }
                        labels.push(text);
                        break;
                    case "gt":
                        jumps.push(text);
                        break;
                    case "au":
                        author = text;
                        break;
                    case "st":
                        title = text;
                        break;
                    case "bk":
                        if (grandIs_1("vn") &&
                            !characters.includes(text) &&
                            !isImageResource_1(text)) {
                            (0, errorCodes_1.addError)("ERR005", 0, "background ".concat(text, " is not a resource name or an image url"));
                        }
                        break;
                    case "cl":
                    case "cr":
                    case "cm":
                        if (!characters.includes(text) && !isImageResource_1(text)) {
                            (0, errorCodes_1.addError)("ERR005", 0, "Character ".concat(text, " is not a character name or an image resource"));
                        }
                        break;
                    case "bgm":
                        if (!isSoundResource_1(text)) {
                            (0, errorCodes_1.addError)("ERR005", 0, "Background music ".concat(text, " is not a sound resource"));
                        }
                        break;
                    case "sfx":
                        if (!isSoundResource_1(text)) {
                            (0, errorCodes_1.addError)("ERR005", 0, "Sound effect ".concat(text, " is not a sound resource"));
                        }
                        break;
                    case "wait":
                        var secs = parseInt(text);
                        if (text !== "key" && (isNaN(secs) || secs <= 0 || secs > 60)) {
                            (0, errorCodes_1.addError)("ERR005", 0, "Wait tag must specify a time in seconds between 1 and 60 or 'key'");
                        }
                        break;
                    case "end":
                        if (!isKnownVariable_1(text)) {
                            (0, errorCodes_1.addWarning)("WAR008", 0, "Variable ".concat(text, " specified in end tag is unknown or not yet defined"));
                        }
                        break;
                    case "hideifzero":
                    case "showifzero":
                    case "showifnonzero":
                    case "hideifnonzero":
                        if (!isKnownVariable_1(text)) {
                            (0, errorCodes_1.addWarning)("WAR008", 0, "Variable ".concat(text, " specified in ").concat(getParent_1(), " tag is unknown or not yet defined"));
                        }
                        break;
                    case "inc":
                    case "dec":
                    case "clr":
                        if (text !== "") {
                            variables.push(text);
                        }
                        else {
                            (0, errorCodes_1.addError)("ERR005", 0, "".concat(getParent_1(), " tag must specify a variable name"));
                        }
                        break;
                }
            },
            onclosetag: function (tagname) {
                switch (tagname) {
                    case "wait":
                        if (!hasTextValue) {
                            (0, errorCodes_1.addError)("ERR005", 0, "Wait tag must specify a time in seconds between 1 and 60 or 'key'");
                        }
                    case "hideifzero":
                    case "showifzero":
                    case "showifnonzero":
                    case "hideifnonzero":
                    case "inc":
                    case "dec":
                    case "clr":
                        if (!hasTextValue) {
                            (0, errorCodes_1.addError)("ERR005", 0, "".concat(tagname, " must specify a variable name"));
                        }
                        break;
                }
                var node = popNode_1();
                if ((node === null || node === void 0 ? void 0 : node.name) !== tagname) {
                    (0, errorCodes_1.addError)("ERR005", 0, "misplaced closing tag ".concat(tagname, " needed ").concat(node === null || node === void 0 ? void 0 : node.name));
                }
            }
        }, { lowerCaseTags: true, recognizeSelfClosing: true });
        parser.write(source);
        parser.end();
        jumps.forEach(function (e) {
            if (!labels.includes(e)) {
                (0, errorCodes_1.addWarning)("WAR005", 0, "Jump to ".concat(e, " have no corresponding label"));
            }
        });
        console.log("References");
        characters.forEach(function (e) { return console.log("- ".concat(e)); });
        console.log("");
        console.log("Labels");
        labels.forEach(function (e) { return console.log("- ".concat(e)); });
        console.log("");
        console.log("Variables");
        variables.forEach(function (e) { return console.log("- ".concat(e)); });
        console.log("");
        console.log("Total number of jumps: ".concat(jumps.length));
        console.log("Total number of choices: ".concat(choices));
        console.log("Total number of chapters: ".concat(chapters));
        console.log("");
        console.log("Title: ".concat(title, ", Author: ").concat(author));
        console.log("");
    }
    catch (err) {
        console.log("Error in syntax checking: ", err);
        (0, errorCodes_1.addError)("ERR000", 0, "");
    }
    return { title: title, author: author };
}
function replaceAll(text, search, what) {
    var result = text + "";
    while (result.indexOf(search) >= 0) {
        result = result.replace(search, what);
    }
    return result;
}
