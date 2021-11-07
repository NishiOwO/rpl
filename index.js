const language = require("./lang.js");
const fs = require("fs");
const colors = require("./colors.js");
const error_util = require("./error_util.js");
const readline = require("readline");

if(process.argv.length < 3){
  if(language.RC){
    console.log("\x1b[38;5;9m"
              + "****************************");
    console.log("*          WARNING         *");
    console.log("* You're using RC version! *");
    console.log("****************************");
    console.log(colors.RESET);
  }
  console.log("Welcome to RPL v" + language.version + (language.RC ? " RC" + language.RC.number + " (" + language.RC.codename + ")" : "") + ".");
  console.log("Type \"run\" to run program.");
  console.log("Type \"exit\" to exit RPL.");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "[1] "
  });
  let code = [];
  let curline = 1;
  rl.on("line",line=>{
  if(line.startsWith("#J ")){
    curline = line.slice(3);
    rl.setPrompt("[" + curline + "] ");
    rl.prompt();
    return;
  }
  if(line == "exit"){
    process.exit(0);
  }
  if(line != "run"){
    code[curline - 1] = line;
    curline++;
    rl.setPrompt("[" + curline + "] ");
    rl.prompt();
    return;
  }
  try {

  language(code.join("\n"),d=>process.stdout.write(d));

} catch (error) {
  if (!(error.code <= -1)) process.exit(-1);
  
  let lines = code.join("\n").split(/(?:\r|)\n/);
  console.error(colors.RED);
  console.error(error_util.justify((error.line-1).toString(), 4)+"| "+lines[error.line-2]);
  console.error(error_util.justify((error.line).toString(), 4)+"| "+lines[error.line-1]);
  console.error("    "+" ".repeat(error.col+1)+"^".repeat((error.name.length-2)));
  console.error("    "+" ".repeat(error.col+1)+error.name);

  if (error.line != lines.length) {
    console.error(error_util.justify((error.line+1).toString(), 4)+"| "+lines[error.line]);
  }

  console.error(colors.RESET);
}
code = [];
curline = 1;
process.stdout.write("\n");
rl.setPrompt("[1] ");
rl.prompt();
});
rl.prompt();
}else{
function cwdp(p){
  return p;
  return require("path").join(".",p);
}
const dolog = !process.argv.slice(3).includes("--nolog");
let code = fs.readFileSync(cwdp(process.argv[2]), "utf8");
if(dolog) console.log(colors.BRIGHT + "Read code: \n"+ colors.YELLOW + code + colors.RESET);
if(dolog) console.log(colors.BRIGHT + "Output:\n" + colors.GREEN);

try {

  language(code,d=>process.stdout.write(d));

} catch (error) {
  if(dolog) console.error(colors.RESET + colors.RED + "Process exited with errors");

  if (!(error.code <= -1)) process.exit(-1);
  
  let lines = code.split(/(?:\r|)\n/);

  if (lines.length > 1) {
    console.error(error_util.justify((error.line-1).toString(), 4)+"| "+lines[error.line-2]);
  }
  console.error(error_util.justify((error.line).toString(), 4)+"| "+lines[error.line-1]);
  console.error("    "+" ".repeat(error.col+1)+"^".repeat((error.name.length-2)));
  console.error("    "+" ".repeat(error.col+1)+error.name);

  if (error.line != lines.length) {
    console.error(error_util.justify((error.line+1).toString(), 4)+"| "+lines[error.line]);
  }

  if(dolog) console.error(colors.RESET);
  process.exit(error.code);
}
if(dolog) console.log(colors.BRIGHT + colors.GREEN + "Process exited with 0 errors");
if(dolog) console.log(colors.RESET);
}

//wait so this is apl but chopped up and reassembled 