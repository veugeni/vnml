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
  .command("compile")
  .alias("c")
  .description("Compiles the source .vnml into a runnable .html file")
  .argument("<source>", "source file name")
  .option("--check", "syntax check only")
  .option("-d, --destination <string>", "sets destination path")
  .action((source: string, options: any) => {
    console.log("options", options);
    compile(source, options, false);
  });

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
    compile(source, options, true);
  });

program.parse();

function compile(source: string, options: any, build: boolean) {
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

  if (build && options.clean) {
    console.log("Cleaning up output");

    try {
      const dir = fs.readdirSync(config.destPath);

      dir.forEach((e) => {
        console.log(`unlink ${e}`);
        fs.unlinkSync(path.join(config.destPath, e));
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

    let result = frame.replace("$TITLE$", config.title);

    if (build) {
      const rname =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(23).substring(2, 5);

      fs.copyFileSync(
        "./engine/vnengine.js",
        path.join(config.destPath, `${rname}.js`)
      );
      fs.copyFileSync(
        "./engine/cssreset.css",
        path.join(config.destPath, `${rname}.css`)
      );
      fs.copyFileSync(
        "./engine/vncore.css",
        path.join(config.destPath, `${rname}c.css`)
      );

      result = result
        .replace("vnengine.js", `${rname}.js`)
        .replace("cssreset.css", `${rname}.css`)
        .replace("vncore.css", `${rname}c.css`);
    }

    result = result.replace("$ITSAME$", sourceVnml);

    fs.writeFileSync(config.destFullPath, result);
    if (build) {
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
    } else {
      console.log(`File compiled successfully in ${config.destFullPath}`);
    }

    process.exit(0);
  } catch (err) {
    console.log("Error: ", err);
    process.exit(1);
  }
}
