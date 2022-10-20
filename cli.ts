#!/usr/bin/env node
import { version } from "./package.json";
import fs from "fs";
import path from "path";
import { Command } from "commander";
import { spawnSync } from "child_process";
import { Parser } from "htmlparser2";
import {
  addError,
  addWarning,
  clearCheckResults,
  hasErrors,
  showCheckResults,
} from "./errorCodes";

const program = new Command();

program
  .name("vnml")
  .description("VNML Visual Novel Markup Language Compiler")
  .version(version);

program
  .command("build")
  .alias("b")
  .description("Builds a distributable pack")
  .argument("<source>", "source file name")
  .option("-d, --destination <string>", "sets destination path")
  .option("-r, --run", "run test http server on build directory")
  .option("-c, --clean", "clean up destination folder before building")
  .option("-p, --port <port>", "sets debug server port (default 8080)")
  .action((source: string, options: any) => {
    build(source, options);
  });

program
  .command("check")
  .alias("c")
  .description("Syntax checks VNML file")
  .argument("<source>", "source file name")
  .action((source: string, options: any) => {
    compile(source, options);
  });

program.parse();

interface Config {
  sourceFullPath: string;
  sourcePath: string;
  sourceFileName: string;
  sourceExt: string;
  destFileName: string;
  destExt: string;
  destPath: string;
  destFullPath: string;
  title: string;
  author: string;
  pageTitle: string;
  port: string;
  menuBackground: string;
}

function getDefaultConfig(source: string, options: any): Config {
  const ext = path.extname(source);
  let fullPath = source;

  if (ext === "") {
    fullPath = fullPath + ".vnml";
  }

  return {
    sourceFullPath: fullPath,
    sourcePath: path.dirname(fullPath),
    sourceFileName: path.basename(fullPath),
    sourceExt: path.extname(fullPath),
    destFileName: "",
    destExt: "",
    destPath: "",
    destFullPath: "",
    title: "Unspecified...",
    author: "Unspecified...",
    pageTitle: "VNML Game",
    port: options.port || "8080",
    menuBackground: "",
  };
}

function checkSourceExistance(config: Config) {
  if (config.sourceExt.toLowerCase() === ".vnml") {
    try {
      if (!fs.existsSync(config.sourceFullPath)) {
        console.log(`File ${config.sourceFileName} does not exists.`);
        return false;
      }
      return true;
    } catch (err) {
      console.log("Error in getting file: ", err);
      return false;
    }
  } else {
    console.log(
      `File ${config.sourceFileName} must be have .vnml extension. Why? Because I like the sound of it.`
    );
    return false;
  }
}

function compile(source: string, options: any) {
  console.log(`VNML Compiler & builder v.${version}\n`);
  console.log(`Checking ${source}\n`);

  const config = getDefaultConfig(source, options);

  if (checkSourceExistance(config)) {
    try {
      const sourceVnml = fs.readFileSync(config.sourceFullPath, {
        encoding: "utf8",
      });

      checkSource(sourceVnml);
      showCheckResults();
      process.exit(hasErrors() ? 1 : 0);
    } catch (err) {
      console.log("Error: ", err);
      process.exit(1);
    }
  }

  process.exit(1);
}

function build(source: string, options: any) {
  console.log(`VNML Compiler & builder v.${version}\n`);
  console.log(`Building ${source}\n`);

  const config = getDefaultConfig(source, options);

  if (options.destination) {
    config.destExt = path.extname(options.destination);

    if (config.destExt) {
      config.destFullPath = options.destination;
      config.destFileName = path.basename(options.destination);
      config.destPath = path.dirname(options.destination);
    } else {
      config.destExt = ".html";
      config.destFileName = config.destFileName = config.sourceFileName.replace(
        config.sourceExt,
        config.destExt
      );
      config.destPath = options.destination;
    }
  } else {
    config.destExt = ".html";
    config.destFileName = config.sourceFileName.replace(
      config.sourceExt,
      config.destExt
    );
    config.destPath = "./build";
  }

  config.destFullPath = path.join(config.destPath, config.destFileName);

  if (checkSourceExistance(config)) {
    try {
      if (!fs.existsSync(config.destPath)) {
        fs.mkdirSync(config.destPath);
      }
    } catch (err) {
      console.log(`Error creating destination path ${config.destPath}:`, err);
      process.exit(1);
    }

    if (options.clean) {
      console.log("Cleaning up output...");

      try {
        const dir = fs.readdirSync(config.destPath, { withFileTypes: true });

        dir.forEach((e) => {
          if (e.isFile()) {
            // console.log(`unlink ${e.name}`);
            fs.unlinkSync(path.join(config.destPath, e.name));
          }
        });
      } catch (err) {
        console.log("Error cleaning output:", err);
        process.exit(1);
      }
    }

    try {
      console.log("Reading source...");

      const sourceVnml = fs.readFileSync(config.sourceFullPath, {
        encoding: "utf8",
      });

      console.log("Checking source...");
      const parsed = checkSource(sourceVnml);

      console.log("");
      showCheckResults();
      console.log("");

      if (hasErrors()) {
        process.exit(1);
      }

      console.log("Building package...");
      config.title = parsed.title;
      config.author = parsed.author;
      config.pageTitle = `${parsed.title} by ${parsed.author}`;
      config.menuBackground = parsed.menuResource;

      const frameTemplate = require.resolve("./engine/frame.template");

      const frame = fs.readFileSync(frameTemplate, {
        encoding: "utf8",
      });

      const menuTemplate = require.resolve("./engine/menu.template");

      const menu = fs.readFileSync(menuTemplate, {
        encoding: "utf8",
      });

      let menuResult = replaceAll(menu, "$TITLE$", config.title);
      menuResult = replaceAll(menuResult, "$PAGETITLE$", config.pageTitle);
      menuResult = replaceAll(menuResult, "$AUTHOR$", config.author);

      let result = replaceAll(frame, "$TITLE$", config.title);
      result = replaceAll(result, "$PAGETITLE$", config.pageTitle);
      result = replaceAll(result, "$AUTHOR$", config.author);

      const rname =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(23).substring(2, 5);

      const engine = require.resolve("./engine/vnengine.js");

      fs.copyFileSync(engine, path.join(config.destPath, `${rname}.js`));

      const csscore = require.resolve("./engine/vncore.css");

      fs.copyFileSync(csscore, path.join(config.destPath, `${rname}.css`));

      result = result
        .replace("vnengine.js", `${rname}.js`)
        .replace("vncore.css", `${rname}.css`);

      menuResult = menuResult
        .replace("vnengine.js", `${rname}.js`)
        .replace("vncore.css", `${rname}.css`)
        .replace("$DESTINATION$", `./${rname}.html`)
        .replace("$MENUBACKGROUND$", assetsUrl(config.menuBackground));
      fs.writeFileSync(config.destFullPath, menuResult);

      result = result
        .replace("$ITSAME$", sourceVnml)
        .replace("$EXITURL$", config.destFileName);

      fs.writeFileSync(path.join(config.destPath, `${rname}.html`), result);

      console.log(`Distribution package built in ${config.destPath}`);

      if (options.run) {
        console.log(`\nRunning debug server on port ${config.port}`);
        console.log("Press CTRL+C to stop it");
        const p = spawnSync(
          "http-server",
          [
            config.destPath,
            `-o ${config.destFileName} `,
            "-c-1",
            "--silent",
            `-p${config.port}`,
          ],
          { shell: true }
        );

        if (p) {
          console.log("p:", p);
        }
      }

      process.exit(0);
    } catch (err) {
      console.log("Error: ", err);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}

type NodeStackElement = {
  name: string;
  found: string[];
};

function checkSource(source: string) {
  clearCheckResults();
  const nodeStack: NodeStackElement[] = [];
  let vnmlFound: boolean = false;
  let hasTextValue = false;

  const parsed = {
    menuResource: "",
    title: "Unknown title",
    author: "Unknown author",
    characters: [] as string[],
    labels: [] as string[],
    jumps: [] as string[],
    variables: [] as string[],
    chapters: 0,
    choices: 0,
  };

  try {
    const parentIs = (name: string) =>
      (nodeStack.length > 0 ? nodeStack[nodeStack.length - 1].name : "") ===
      name;

    const getParent = () =>
      nodeStack.length > 0 ? nodeStack[nodeStack.length - 1].name : "";

    const grandIs = (name: string) =>
      (nodeStack.length > 1 ? nodeStack[nodeStack.length - 2].name : "") ===
      name;

    const alreadyFound = (name: string) =>
      nodeStack.length > 0
        ? nodeStack[nodeStack.length - 1].found.includes(name)
        : false;

    const hasChildren = () =>
      nodeStack.length > 0
        ? nodeStack[nodeStack.length - 1].found.length > 0
        : false;

    const pushNode = (name: string) => {
      if (nodeStack.length > 0)
        nodeStack[nodeStack.length - 1].found.push(name);
      nodeStack.push({ name, found: [] });
    };

    const popNode = () => nodeStack.pop();

    const check1 = (name: string, parent: string, unique: boolean) => {
      if (parentIs(parent)) {
        if (unique && alreadyFound(name)) {
          // Multiple not allowed
          addError("ERR003", 0, name);
        }
      } else {
        // must be used in specific parent
        addError("ERR004", 0, `${name} must be child of ${parent}`);
      }
    };

    const checkValidAttributes = (
      name: string,
      attributes: { [s: string]: string },
      valid: string[],
      allowNumeric: boolean
    ) => {
      Object.entries(attributes)
        .filter((e) =>
          allowNumeric && !isNaN(parseInt(e[0])) ? false : !valid.includes(e[0])
        )
        .forEach((e) =>
          addWarning("WAR006", 0, `Attribute ${e[0]} of ${name} is unknown.`)
        );
    };

    const isImageResource = (url: string) =>
      [".jpeg", ".gif", ".png", ".apng", ".svg", ".bmp", ".ico", ".jpg"].filter(
        (e) => url.toLowerCase().endsWith(e)
      ).length > 0;

    const isSoundResource = (url: string) =>
      [".ogg", ".mp3", ".wav"].filter((e) => url.toLowerCase().endsWith(e))
        .length > 0;

    const isKnownVariable = (variable: string) =>
      variable !== "" ? parsed.variables.includes(variable) : true;

    const addVariable = (variable: string) =>
      variable !== "" &&
      !parsed.variables.includes(variable) &&
      parsed.variables.push(variable);

    const parser = new Parser(
      {
        onopentag(name, attributes) {
          if (vnmlFound) {
            hasTextValue = false;

            switch (name) {
              case "vnml":
                addError("ERR003", 0, "Main node (VNML)");
                break;
              case "vn":
              case "vnd":
                check1(name, "vnml", true);
                break;
              case "bk":
                if (grandIs("vnd")) {
                  if (alreadyFound("bk")) {
                    addError(
                      "ERR003",
                      0,
                      "Image node must be unique in reference"
                    );
                  }
                } else {
                  if (!parentIs("vn")) {
                    addError(
                      "ERR005",
                      0,
                      "Background node must be used in reference or chapters only"
                    );
                  }
                }
                checkValidAttributes(
                  name,
                  attributes,
                  ["flip", "blur", "gray", "flash", "thunder"],
                  false
                );
                break;
              case "nm":
                if (grandIs("vnd")) {
                  if (alreadyFound("nm")) {
                    addError(
                      "ERR003",
                      0,
                      "Name node must be unique in reference"
                    );
                  }
                } else {
                  addError(
                    "ERR005",
                    0,
                    "Name node must be used in reference only"
                  );
                }
                break;
              case "st":
              case "au":
                check1(name, "vnd", true);
                break;
              case "gt":
                check1(name, "ch", true);
                break;
              case "ch":
                check1(name, "vn", false);
                parsed.choices++;
                break;
              case "hideifzero":
              case "showifzero":
              case "showifnonzero":
              case "hideifnonzero":
                check1(name, "ch", false);
                break;
              case "cr":
              case "cl":
              case "cm":
                check1(name, "vn", false);
                checkValidAttributes(
                  name,
                  attributes,
                  ["flip", "blur", "gray", "shadow", "shatter"],
                  false
                );
                break;
              case "lb":
              case "bgm":
              case "sfx":
              case "end":
                check1(name, "vn", false);
                break;
              case "p":
                parsed.chapters++;
                check1(name, "vn", false);
                break;
              case "wait":
              case "end":
                check1(name, "vn", false);
                break;
              case "inc":
              case "dec":
              case "clr":
                check1(name, "vn", false);
                break;
              default:
                // Not reserved words
                if (parentIs("vnd")) {
                  // It's a character definition
                  if (parsed.characters.includes(name)) {
                    addError("ERR006", 0, `Reference ${name} already defined.`);
                  }
                  parsed.characters.push(name);
                } else if (parentIs("vn")) {
                  // It's a paragraph
                  parsed.chapters++;
                } else if (
                  parentIs("cr") ||
                  parentIs("cm") ||
                  parentIs("cl") ||
                  parentIs("bk")
                ) {
                  // It's an image reference
                  if (hasChildren()) {
                    addWarning("WAR003", 0, `Only one reference allowed.`);
                  }
                } else {
                  // It will be ignored.
                  addWarning("WAR002", 0, `maybe ${name} is misplaced?`);
                }
                break;
            }
          }

          if (name === "vnml") vnmlFound = true;

          pushNode(name);
        },
        ontext(text) {
          hasTextValue = true;

          switch (getParent()) {
            case "lb":
              if (parsed.labels.includes(text)) {
                addError("ERR007", 0, `${text} is duplicated`);
              }
              parsed.labels.push(text);
              break;
            case "gt":
              parsed.jumps.push(text);
              break;
            case "au":
              parsed.author = text;
              break;
            case "st":
              parsed.title = text;
              break;
            case "bk":
              if (
                grandIs("vn") &&
                !parsed.characters.includes(text) &&
                !isImageResource(text)
              ) {
                addError(
                  "ERR005",
                  0,
                  `background ${text} is not a resource name or an image url`
                );
                return;
              }

              if (!grandIs("vn") && !isImageResource(text)) {
                addError("ERR005", 0, `background ${text} is not an image url`);
                return;
              }

              if (grandIs("menu")) {
                parsed.menuResource = text;
              }

              break;
            case "cl":
            case "cr":
            case "cm":
              if (!parsed.characters.includes(text) && !isImageResource(text)) {
                addError(
                  "ERR005",
                  0,
                  `Character ${text} is not a character name or an image resource`
                );
              }
              break;
            case "bgm":
              if (!isSoundResource(text)) {
                addError(
                  "ERR005",
                  0,
                  `Background music ${text} is not a sound resource`
                );
              }
              break;
            case "sfx":
              if (!isSoundResource(text)) {
                addError(
                  "ERR005",
                  0,
                  `Sound effect ${text} is not a sound resource`
                );
              }
              break;
            case "wait":
              const secs = parseInt(text);

              if (text !== "key" && (isNaN(secs) || secs <= 0 || secs > 60)) {
                addError(
                  "ERR005",
                  0,
                  `Wait tag must specify a time in seconds between 1 and 60 or 'key'`
                );
              }
              break;
            case "end":
              if (!isKnownVariable(text)) {
                addWarning(
                  "WAR008",
                  0,
                  `Variable ${text} specified in end tag is unknown or not yet defined`
                );
              }
              break;
            case "hideifzero":
            case "showifzero":
            case "showifnonzero":
            case "hideifnonzero":
              if (!isKnownVariable(text)) {
                addWarning(
                  "WAR008",
                  0,
                  `Variable ${text} specified in ${getParent()} tag is unknown or not yet defined`
                );
              }
              break;
            case "inc":
            case "dec":
            case "clr":
              if (text !== "") {
                addVariable(text);
              } else {
                addError(
                  "ERR005",
                  0,
                  `${getParent()} tag must specify a variable name`
                );
              }
              break;
          }
        },
        onclosetag(tagname) {
          switch (tagname) {
            case "wait":
              if (!hasTextValue) {
                addError(
                  "ERR005",
                  0,
                  `Wait tag must specify a time in seconds between 1 and 60 or 'key'`
                );
              }
            case "hideifzero":
            case "showifzero":
            case "showifnonzero":
            case "hideifnonzero":
            case "inc":
            case "dec":
            case "clr":
              if (!hasTextValue) {
                addError(
                  "ERR005",
                  0,
                  `${tagname} must specify a variable name`
                );
              }
              break;
          }

          const node = popNode();
          if (node?.name !== tagname) {
            addError(
              "ERR005",
              0,
              `misplaced closing tag ${tagname} needed ${node?.name}`
            );
          }
        },
      },
      { lowerCaseTags: true, recognizeSelfClosing: true }
    );

    parser.write(source);
    parser.end();

    parsed.jumps.forEach((e) => {
      if (!parsed.labels.includes(e)) {
        addWarning("WAR005", 0, `Jump to ${e} have no corresponding label`);
      }
    });

    console.log("References");
    parsed.characters.forEach((e) => console.log(`- ${e}`));
    console.log("");
    console.log("Labels");
    parsed.labels.forEach((e) => console.log(`- ${e}`));
    console.log("");
    console.log("Variables");
    parsed.variables.forEach((e) => console.log(`- ${e}`));
    console.log("");
    console.log(`Menu background: ${parsed.menuResource}`);
    console.log("");
    console.log(`Total number of jumps: ${parsed.jumps.length}`);
    console.log(`Total number of choices: ${parsed.choices}`);
    console.log(`Total number of chapters: ${parsed.chapters}`);
    console.log("");
    console.log(`Title: ${parsed.title}, Author: ${parsed.author}`);
    console.log("");
  } catch (err) {
    console.log("Error in syntax checking: ", err);
    addError("ERR000", 0, "");
  }

  return parsed;
}

function replaceAll(text: string, search: string, what: string): string {
  let result = text + "";

  while (result.indexOf(search) >= 0) {
    result = result.replace(search, what);
  }

  return result;
}

function assetsUrl(resource: string) {
  return resource
    ? resource.indexOf("/") >= 0
      ? resource
      : `res/${resource}`
    : "";
}
