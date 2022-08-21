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
    console.log("options", options);
    build(source, options);
});
program.parse();
function build(source, options) {
    var config = {
        sourceFullPath: source,
        sourcePath: path_1["default"].dirname(source),
        sourceFileName: path_1["default"].basename(source),
        sourceExt: path_1["default"].extname(source),
        destFileName: "",
        destExt: "",
        destPath: "",
        destFullPath: "",
        title: "build",
        port: options.port || "8080"
    };
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
    console.log("config", config);
    if (config.sourceExt.toLowerCase() === ".vnml") {
        try {
            if (!fs_1["default"].existsSync(config.sourceFullPath)) {
                console.log("File ".concat(config.sourceFileName, " does not exists."));
                process.exit(1);
            }
        }
        catch (err) {
            console.log("Error in getting file: ", err);
            process.exit(1);
        }
    }
    else {
        console.log("File ".concat(config.sourceFileName, " must be have .vnml extension. Why? Because I like the sound of it."));
        process.exit(1);
    }
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
        console.log("Cleaning up output");
        try {
            var dir = fs_1["default"].readdirSync(config.destPath, { withFileTypes: true });
            dir.forEach(function (e) {
                if (e.isFile()) {
                    console.log("unlink ".concat(e.name));
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
        var sourceVnml = fs_1["default"].readFileSync(config.sourceFullPath, {
            encoding: "utf8"
        });
        var frame = fs_1["default"].readFileSync("./engine/frame.template", {
            encoding: "utf8"
        });
        var menu = fs_1["default"].readFileSync("./engine/menu.template", {
            encoding: "utf8"
        });
        var menuResult = menu.replace("$TITLE$", config.title);
        var result = frame.replace("$TITLE$", config.title);
        var rname = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(23).substring(2, 5);
        fs_1["default"].copyFileSync("./engine/vnengine.js", path_1["default"].join(config.destPath, "".concat(rname, ".js")));
        fs_1["default"].copyFileSync("./engine/vncore.css", path_1["default"].join(config.destPath, "".concat(rname, ".css")));
        result = result
            .replace("vnengine.js", "".concat(rname, ".js"))
            .replace("vncore.css", "".concat(rname, ".css"));
        // TODO: A better solution for this!
        menuResult = menuResult
            .replace("vncore.css", "".concat(rname, ".css"))
            .replace("$DESTINATION$", "./".concat(rname, ".html"))
            .replace("$DESTINATION$", "./".concat(rname, ".html"))
            .replace("$DESTINATION$", "./".concat(rname, ".html"));
        fs_1["default"].writeFileSync(config.destFullPath, menuResult);
        result = result.replace("$ITSAME$", sourceVnml);
        fs_1["default"].writeFileSync(path_1["default"].join(config.destPath, "".concat(rname, ".html")), result);
        console.log("Distribution package built in ".concat(config.destPath));
        if (options.run) {
            console.log("Running debug server on port ".concat(config.port));
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
