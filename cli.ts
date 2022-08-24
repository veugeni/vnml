#!/usr/bin/env node
import { version } from "./package.json";
import fs from "fs";
import path from "path";
import { Command } from "commander";
import { spawnSync } from "child_process";

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
    console.log("options", options);
    build(source, options);
  });

program.parse();

function build(source: string, options: any) {
  const config = {
    sourceFullPath: source,
    sourcePath: path.dirname(source),
    sourceFileName: path.basename(source),
    sourceExt: path.extname(source),
    destFileName: "",
    destExt: "",
    destPath: "",
    destFullPath: "",
    title: "build",
    port: options.port || "8080",
  };

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

  console.log("config", config);

  if (config.sourceExt.toLowerCase() === ".vnml") {
    try {
      if (!fs.existsSync(config.sourceFullPath)) {
        console.log(`File ${config.sourceFileName} does not exists.`);
        process.exit(1);
      }
    } catch (err) {
      console.log("Error in getting file: ", err);
      process.exit(1);
    }
  } else {
    console.log(
      `File ${config.sourceFileName} must be have .vnml extension. Why? Because I like the sound of it.`
    );
    process.exit(1);
  }

  try {
    if (!fs.existsSync(config.destPath)) {
      fs.mkdirSync(config.destPath);
    }
  } catch (err) {
    console.log(`Error creating destination path ${config.destPath}:`, err);
    process.exit(1);
  }

  if (options.clean) {
    console.log("Cleaning up output");

    try {
      const dir = fs.readdirSync(config.destPath, { withFileTypes: true });

      dir.forEach((e) => {
        if (e.isFile()) {
          console.log(`unlink ${e.name}`);
          fs.unlinkSync(path.join(config.destPath, e.name));
        }
      });
    } catch (err) {
      console.log("Error cleaning output:", err);
      process.exit(1);
    }
  }

  try {
    const sourceVnml = fs.readFileSync(config.sourceFullPath, {
      encoding: "utf8",
    });

    const frame = fs.readFileSync("./engine/frame.template", {
      encoding: "utf8",
    });

    const menu = fs.readFileSync("./engine/menu.template", {
      encoding: "utf8",
    });

    let menuResult = menu.replace("$TITLE$", config.title);
    let result = frame.replace("$TITLE$", config.title);

    const rname =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(23).substring(2, 5);

    fs.copyFileSync(
      "./engine/vnengine.js",
      path.join(config.destPath, `${rname}.js`)
    );
    fs.copyFileSync(
      "./engine/vncore.css",
      path.join(config.destPath, `${rname}.css`)
    );

    result = result
      .replace("vnengine.js", `${rname}.js`)
      .replace("vncore.css", `${rname}.css`);

    // TODO: A better solution for this!
    menuResult = menuResult
      .replace("vncore.css", `${rname}.css`)
      .replace("$DESTINATION$", `./${rname}.html`)
      .replace("$DESTINATION$", `./${rname}.html`)
      .replace("$DESTINATION$", `./${rname}.html`);
    fs.writeFileSync(config.destFullPath, menuResult);

    result = result
      .replace("$ITSAME$", sourceVnml)
      .replace("$EXITURL$", config.destFileName);

    fs.writeFileSync(path.join(config.destPath, `${rname}.html`), result);

    console.log(`Distribution package built in ${config.destPath}`);

    if (options.run) {
      console.log(`Running debug server on port ${config.port}`);
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
}
