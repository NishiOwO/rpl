const language = require("./lang.js");
const fs = require("fs");
const colors = require("./colors.js");
const error_util = require("./error_util.js");
const readline = require("readline");
const pathlib = require("path");

function warn_rc(){
  console.log(
    colors.BRIGHT +
      colors.RED +
      "warn: you are using a release candidate! there may be bugs and instabilities." +
      colors.RESET
  );
}
function startup(){
  console.log(
    "Welcome to RPL++ v" +
      language.version +
      (language.RC
        ? " RC" + language.RC.number + " (" + language.RC.codename + ")"
        : "") +
      "."
  );
  console.log(
    'Start typing to run RPL++ code. Once done, type "run" to run the code or type "exit" to exit.'
  ); // todo: better REPL support
}
function err(lines,error){
  const spc = (lines[error.line - 1].match(/^([ ]*)/) || [
    0,
    "",
  ])[1].replace(/ /g, "");
  console.error(
    error_util.justify((error.line - 1).toString(), 4) +
      "| " +
      lines[error.line - 2]
  );
  console.error(
    error_util.justify(error.line.toString(), 4) +
      "| " +
      lines[error.line - 1]
  );
  console.error(
    "      " +
      spc +
      " ".repeat(
        lines[error.line - 1]
          .split(" ")
          .slice(0, error.col - 1)
          .map((x) => x.length)
          .reduce((x, y) => {
            return x + y;
          }, 0) +
          error.col -
          1
      ) +
      "^".repeat(lines[error.line - 1].split(" ")[error.col - 1].length)
  );
  console.error(
    "      " +
      spc +
      " ".repeat(
        lines[error.line - 1]
          .split(" ")
          .slice(0, error.col - 1)
          .map((x) => x.length)
          .reduce((x, y) => {
            return x + y;
          }, 0) +
          error.col -
          1
      ) +
      error.name
  );

  if (error.line != lines.length) {
    console.error(
      error_util.justify((error.line + 1).toString(), 4) +
        "| " +
        lines[error.line]
    );
  }

  if (error.tip) {
    console.error(
      colors.BRIGHT + colors.GREEN + "help: " + colors.RESET + error.tip
    );
  }

  if (error.detailedDesc) {
    console.error(colors.BRIGHT + "info: " + error.detailedDesc);
  }
};
function crashdump(error) {
  //! something bad happened, print scary stacktrace
  console.log(
    colors.RED +
      colors.BRIGHT +
      ` ==== Internal error ====` +
      colors.RESET
  );
  console.log(
    "Oops, the internal language process crashed. This " +
      colors.YELLOW +
      colors.BRIGHT +
      "is not" +
      colors.RESET +
      " an error with your code."
  );
  console.log(
    "Please contact the RPL++ developers on github and paste the code that triggered this error."
  );
  console.log("Error name: " + error.name);
  console.log(error.stack);
}
require("fs").readdirSync(pathlib.join(__dirname,"extension")).filter(x=>x.endsWith(".rpl.js")).forEach(x=>{
  let _result = require("./extension/"+x)(language.InternalError);
  for(let i in (_result.main||{})){
    try{
      if(eval(i));
      eval(i + " = _result.main[i];");
    }catch(e){
    }
  }
});
if (process.argv.find(x=>x.endsWith(".rpl")) == null) {
  if (language.RC) {
    // display a warning if we are using a rc version
    // todo: require user input to continue using
    warn_rc();
  }
  console.log(
    (fs.readFileSync(__dirname + "/ascii.txt") + "")
      .replace(/(R+)/g, "\x1b[91m\x1b[101m$1\x1b[m")
      .replace(/(G+)/g, "\x1b[92m\x1b[102m$1\x1b[m")
      .replace(/(B+)/g, "\x1b[94m\x1b[104m$1\x1b[m")
      .replace(/(#+)/g, "\x1b[97m\x1b[107m$1\x1b[m") + "\n"
  );
  startup(language);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "[1] ",
  });
  let code = [];
  let curline = 1;
  rl.on("line", (line) => {
    if (line == "exit") {
      process.exit(0);
    }
    if (line.startsWith("#J ")) {
      curline = line.slice(3);
      rl.setPrompt("[" + curline + "] ");
      rl.prompt();
      return;
    }
    if (line != "run") {
      code[curline - 1] = line;
      curline++;
      rl.setPrompt("[" + curline + "] ");
      rl.prompt();
      return;
    }
    try {
      language(code.join("\n"), (d) => process.stdout.write(d));
    } catch (error) {
      if (!(error.code <= -1)) {
        crashdump(error);
        return;
      }

      //! code failed, print error message
      let lines = code.join("\n").split(/(?:\r|)\n/);
      console.error(colors.RED);
      err(lines,error);

      console.error(colors.RESET);
    }
    code = [];
    curline = 1;
    process.stdout.write("\n");
    rl.setPrompt("[1] ");
    rl.prompt();
  });
  rl.prompt();
} else {
  function cwdp(p) {
    return p;
    return pathlib.join(".", p);
  }
  if (process.argv.slice(3).includes("--nolog")) {
    require("util").deprecate(() => {},
    "--nolog doesn't work anymore.\n--nolog is abolished on \x1b[1m1.4.0 RC2\x1b[m.")();
  }
  let codefile = process.argv.find(x=>x.endsWith(".rpl"));
  process.chdir(require("path").dirname(codefile));
  const dolog = false; // !process.argv.slice(3).includes("--nolog");
  let code = fs.readFileSync(cwdp(codefile), "utf8");
  if (dolog)
    console.log(
      colors.BRIGHT + "Read code: \n" + colors.YELLOW + code + colors.RESET
    );
  if (dolog) console.log(colors.BRIGHT + "Output:\n" + colors.GREEN);

  try {
    language(code, (d) => process.stdout.write(d));
  } catch (error) {
    if (dolog)
      console.error(colors.RESET + colors.RED + "Process exited with errors");

    if (!(error.code <= -1)) {
      crashdump(error);
      return;
    }
    let lines = code.split(/(?:\r|)\n/);
    console.error(colors.RED);
    err(lines,error);
    
    if (dolog) console.error(colors.RESET);
    process.exit(error.code);
  }
  if (dolog)
    console.log(colors.BRIGHT + colors.GREEN + "Process exited with 0 errors");
  if (dolog) console.log(colors.RESET);
}

//wait so this is apl but chopped up and reassembled
