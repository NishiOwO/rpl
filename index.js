const language = require("./lang.js");
const fs = require("fs");
const colors = require("./colors.js");
const error_util = require("./error_util.js");
const readline = require("readline");

function crashdump(err){
  console.log(" ==== CRASH DUMP " + "=".repeat(process.stdout.columns - 19));
  console.log("Internal program crashed!");
  console.log("Error name: " + err.name);
  console.log(" ==== STACKTRACE " + "=".repeat(process.stdout.columns - 19));
  console.log(err.stack.split(/(?:\r|)\n/).slice(1).map(x=>x.replace(/^[ \t]*/,"")).join("\n"));
  console.log(err);
}

if(process.argv.length < 3){
  if(language.RC){
    console.log("\x1b[91m"
              + "****************************");
    console.log("*          WARNING         *");
    console.log("* You're using RC version! *");
    console.log("****************************");
    console.log(colors.RESET);
  }
  console.log((fs.readFileSync(__dirname + "\\ascii.txt") + "")
              .replace(/(R+)/g,"\x1b[91m\x1b[101m$1\x1b[m")
              .replace(/(G+)/g,"\x1b[92m\x1b[102m$1\x1b[m")
              .replace(/(B+)/g,"\x1b[94m\x1b[104m$1\x1b[m")
              .replace(/(#+)/g,"\x1b[97m\x1b[107m$1\x1b[m")
              + "\n");
  console.log("Welcome to RPL++ v" + language.version + (language.RC ? " RC" + language.RC.number + " (" + language.RC.codename + ")" : "") + ".");
  console.log("Type \"run\" to run program.");
  console.log("Type \"exit\" to exit RPL++.");
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
  if (!(error.code <= -1)){
    crashdump(error);
    return;
  }
  
  let lines = code.join("\n").split(/(?:\r|)\n/);
  console.error(colors.RED);
  const spc = (lines[error.line - 1].match(/^([ ]*)/) || [0,""])[1].replace(/ /g,"");
  console.error(error_util.justify((error.line-1).toString(), 4)+"| "+lines[error.line-2]);
  console.error(error_util.justify((error.line).toString(), 4)+"| "+lines[error.line-1]);
  console.error("      "+spc+(" ".repeat(lines[error.line - 1].split(" ").slice(0,error.col - 1).map(x=>x.length).reduce((x,y)=>{return x+y},0) + error.col - 1))+("^".repeat((lines[error.line - 1].split(" ")[error.col - 1].length))));
  console.error("      "+spc+(" ".repeat(lines[error.line - 1].split(" ").slice(0,error.col - 1).map(x=>x.length).reduce((x,y)=>{return x+y},0) + error.col - 1))+error.name);

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
if(process.argv.slice(3).includes("--nolog")){
  require("util").deprecate(()=>{},"--nolog doesn't work anymore.\n--nolog is abolished on \x1b[1m1.4.0 RC2\x1b[m.")();
}
process.chdir(require("path").dirname(process.argv[2]));
const dolog = false;// !process.argv.slice(3).includes("--nolog");
let code = fs.readFileSync(cwdp(process.argv[2]), "utf8");
if(dolog) console.log(colors.BRIGHT + "Read code: \n"+ colors.YELLOW + code + colors.RESET);
if(dolog) console.log(colors.BRIGHT + "Output:\n" + colors.GREEN);

try {

  language(code,d=>process.stdout.write(d));

} catch (error) {
  if(dolog) console.error(colors.RESET + colors.RED + "Process exited with errors");

  if (!(error.code <= -1)){
    crashdump(error);
    return;
  }
  let lines = code.split(/(?:\r|)\n/);

  if (lines.length > 1) {
    console.error(error_util.justify((error.line-1).toString(), 4)+"| "+lines[error.line-2]);
  }
  const spc = (lines[error.line - 1].match(/^([ ]*)/) || [0,""])[1].replace(/ /g,"");
  console.error(error_util.justify((error.line).toString(), 4)+"| "+lines[error.line-1]);
  //console.log(lines[error.line - 1].split(" ").slice(0,error.col));
  console.error("      "+spc+(" ".repeat(lines[error.line - 1].split(" ").slice(0,error.col - 1).map(x=>x.length).reduce((x,y)=>{return x+y},0) + error.col - 1))+("^".repeat((lines[error.line - 1].split(" ")[error.col - 1].length))));
  console.error("      "+spc+(" ".repeat(lines[error.line - 1].split(" ").slice(0,error.col - 1).map(x=>x.length).reduce((x,y)=>{return x+y},0) + error.col - 1))+error.name);

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