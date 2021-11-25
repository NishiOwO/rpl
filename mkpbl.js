const fs = require("fs");
const { execSync } = require("child_process");

const VERSION = "1.5.0-rc3";

console.log("mkpbl - configuring");

fullBuild = [
  "index.js",
  "colors.js",
  "error_util.js",
  "lang.js",
  "LICENSE",
  "README.md",
  "ReferenceManual.pdf",
  "RPL.png",
  "ascii.txt",
  "src/array.js",
  "src/comparison.js",
  "src/event.js",
  "src/io.js",
  "src/logic.js",
  "src/math.js",
  "src/misc.js",
  "src/stack.js",
  "src/tcp.js",
  "lib/MathEx.rpl",
  "lib/wavefile.write.rpl",
  "lib/http.rpl",
  "examples/run.sh",
  "examples/README.md",
  "examples/basic/fibonacci.rpl",
  "examples/basic/helloworld.rpl",
  "examples/math/prime-number.rpl",
  "examples/tcp/server-image.base64",
  "examples/tcp/server-image.png",
  "examples/tcp/server-index.html",
  "examples/tcp/server.rpl",
  "examples/misc/donut.rpl",
];

command = "";

for (var i = 0; i < fullBuild.length; i++) {
  console.log("Configuring " + fullBuild[i]);
  command += fullBuild[i] + " ";
}

filename = "rpl-" + VERSION + ".tar.xz";

console.log("Compressing to " + filename);
execSync("tar cvfj " + filename + " " + command);

minBuild = [
  "index.js",
  "colors.js",
  "error_util.js",
  "lang.js",
  "LICENSE",
  "ascii.txt",
  "src/array.js",
  "src/comparison.js",
  "src/event.js",
  "src/io.js",
  "src/logic.js",
  "src/math.js",
  "src/misc.js",
  "src/stack.js",
  "src/tcp.js",
  "lib/MathEx.rpl",
  "lib/wavefile.write.rpl",
  "lib/http.rpl",
];

console.log("Done");
console.log("Configuing for light build");

command = "";

for (var i = 0; i < minBuild.length; i++) {
  console.log("Configuring " + minBuild[i]);
  command += minBuild[i] + " ";
}

filename = "rpl-light-" + VERSION + ".tar.xz";

console.log("Compressing to " + filename);
execSync("tar cvfj " + filename + " " + command);

console.log("Done! Builds written");
