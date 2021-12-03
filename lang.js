class InternalError extends Error {
  constructor(line, col, ...args) {
    super(...args);
    this.internalName = this.name = "InternalError";
    this.line = line + 1;
    this.col = col + 1;
    this.code = -1;
  }
}
InternalError.code = -1;
class StackUnderflow extends InternalError {
  constructor(...args) {
    super(...args);
    this.internalName = this.name = "StackUnderflow";
    this.code = -2;
    this.tip =
      "try to ensure that there are enough values on the stack (includes expression stack) for this operand";
    this.detailedDesc =
      "A StackUnderflow occurs when an operand requires more values on the stack than are currently there. This usually occurs when you forget to push a value to the stack.";
  }
}
StackUnderflow.code = -2;
class UnknownWord extends InternalError {
  constructor(thething, ...args) {
    super(...args);
    this.internalName = this.name = "UnknownWord";
    this.code = -3;
    this.tip =
      "make sure there aren't any spelling mistakes in `" +
      thething +
      "`, and check to make sure that `" +
      thething +
      "` actually exists";
    this.detailedDesc =
      "A UnknownWord error is thrown when the RPL++ interpreter finds a token and cannot figure out what it means. This usually occurs when you make a typo or a library function is renamed or removed.";
  }
}
UnknownWord.code = -3;
class IncorrectType extends InternalError {
  constructor(type1, type2, ...args) {
    super(...args);
    this.internalName = this.name = "IncorrectType(" + type1 + " != " + type2 + ")";
    this.code = -4;
    this.tip =
      "make sure the operation you are using (which is looking for a " +
      type2 +
      " type) supports the type you are giving it (which is " +
      type1 +
      ")";
    this.detailedDesc =
      "An IncorrectType error is thrown when an operand requires a specific type and you pass it the wrong type. This usually occurs when you attempt to call a function with the wrong arguments.";
  }
}
IncorrectType.code = -4;
class RPLRawStruct {
  constructor(name, list) {
    this.name = name;
    this.list = list;
  }
}
class RPLStruct extends RPLRawStruct {
  constructor(...args) {
    super(...args);
    for (let a in this.list) {
      this[a] = this.list[a];
    }
    delete this.list;
  }
}

function debug_gen(
  log,
  stack,
  variable,
  func,
  labels,
  labelq,
  wddict,
  operators,
  procstr,
  expr,
  stack2,
  i,
  j
){
  let strr = "";
  strr += "Debug v1.0.0\n";
  strr += "        Main Stack: " + (stack.map((x,ind,d)=>(ind==0?"":" ".repeat(20))+procstr(d[d.length-ind-1])).join("\n"));
  strr += "\n";
  strr += "      Second Stack: " + (stack2.map((x,ind,d)=>(ind==0?"":" ".repeat(20))+procstr(d[d.length-ind-1])).join("\n"));
  strr += "\n";
  strr += "  Expression Stack: " + (expr.map((x,ind,d)=>(ind==0?"":" ".repeat(20))+d[d.length-ind-1].str).join("\n"));
  strr += "\n";
  strr += "             Label: " + (Object.keys(labels).map((x,ind,d)=>(ind==0?"":" ".repeat(20))+ x + " => " + labels[x].join(":")).join("\n"));
  strr += "\n";
  strr += "           Worddef: " + (Object.keys(wddict).map((x,ind,d)=>(ind==0?"":" ".repeat(20)) + x + ` (${wddict[x].temp ? "Local word"+(wddict[x].list[0]==""?"":", includes "+wddict[x].list.map((z,ind,d)=>((d.length-1==ind&&ind!=0)?"and ":"")+'"'+z+'"').join(", ")) : "Global word"}, Minimum arguments: ${wddict[x].args})`).join("\n"));
  strr += "\n";
  strr += "         Variables: " + (Object.keys(variable).map((x,ind)=>(ind==0?"":" ".repeat(20))+x+" => "+procstr(variable[x])).join("\n"));
  strr += "\n";
  strr += "   Line (internal): " + i;
  strr += "\n";
  strr += "Cmd pos (internal): " + j;
  strr += "\n";
  return strr;
}

let procstr_list = {
  "str instanceof RPLStruct": str=>`<Struct ${str.name}>`,
  "str instanceof RPLRawStruct": str=>`<Raw-struct ${str.name} (${Object.keys(str.list)
        .map((x) => x + "=" + procstr(str.list[x]))
        .join(",")})>`,
  "str === undefined": str=>"undef",
  "str !== str": str=>"notnum",
  "str instanceof require(\"events\")": str=>`<EventEmitter${
        str["#NAME"] !== undefined && (str["#NAME"] || "") !== ""
          ? " " + str["#NAME"]
          : ""
      }>`,
  "str instanceof RegExp": str=>`<RegEx ${str}>`,
  "str instanceof require('url').Url": str=>`<URL ${require('url').format(str)}>`,
  "str === null": str=>"nil",
  "Array.isArray(str)": str=>`<Array [${str.map(x=>procstr(x)).join(", ")}]>`,
  "str instanceof Buffer": str=>`<Buffer [${[...str].map(x=>("0".repeat(2-x.toString(16).length))+x.toString(16)).join(", ")}]>`,
};
let procstr = (str) => {
  for(let i in procstr_list){
    if(eval(i)){
      return procstr_list[i](str,procstr);
    }
  }
  return str;
};

let version_mmp = "1.5.0A";

const [tcpRPL, eventRPL, compRPL, arrayRPL, mathRPL, logicRPL, ioRPL, miscRPL] =
  ["tcp", "event", "comparison", "array", "math", "logic", "io", "misc"].map(
    (x) => require("./src/" + x + ".js")
  );
const stackRPL = require("./src/stack.js");

const pathlib = require("path");

let geval = eval;
require("fs").readdirSync(pathlib.join(__dirname,"extension")).filter(x=>x.endsWith(".rpl.js")).forEach(x=>{
  let _result = require("./extension/"+x)(version_mmp);
  for(let i in (_result.lang||{})){
    try{
      if(eval(i));
      eval(i + " = _result.lang[i];");
    }catch(e){
    }
  }
});

const debug = 0;

let trycatch = false;

let trycatcherr = [];

module.exports = function (
  code,
  log = () => {},
  _stack = [],
  _variable = defaultVariable,
  _func = {},
  _labels = {},
  _labelq = [],
  _wddict = {},
  _op = []
) {
  // whitespace indicates a distinction between blocks
  let processed = code
    .split(/(?:\r|)\n/)
    .map((x) => x.replace(/\t/g, "    ").split(" "));

  let stack = _stack;

  let result = "";

  let dq = false;
  //Double Quotation

  let dqstr = "";
  //Variable for saving inside of double quotation

  let operators = [];
  if (_op.length == 0 || (_op.length >= 2 && _op[0] == 1 && _op[1])) {
    if(!(_op.length >= 2)){
      module.exports.internal.stack2 = [];
    }else{
      operators.push(..._op[1]);
    }
    operators.push(..."#;()".split(""));
    operators.push(
      ".FN",
      ".CALL",
      "_CALL",
      ".IMP",
      "/*",
      "*/",
      ":<",
      ".IM",
      ".IMS",
      "[?]!",
      "=.",
      ")%",
      "#DEBUG",
      "!{}",
      "^{}",
      ">{}"
    );
    operators.push(...["sin", "cos"].map((x) => "Exp::" + x));
    operators.push(...Object.keys(tcpRPL));
    operators.push(...Object.keys(eventRPL));
    operators.push(...Object.keys(compRPL));
    operators.push(...Object.keys(arrayRPL));
    operators.push(...Object.keys(mathRPL));
    operators.push(...Object.keys(logicRPL));
    operators.push(...Object.keys(ioRPL));
    operators.push(...Object.keys(stackRPL));
    operators.push(...Object.keys(miscRPL));
  } else {
    operators = _op;
  }

  let jjump = 0;

  let goto = false;

  let variable = _variable;

  let func = _func;

  let labels = _labels;

  let labelq = _labelq;

  let truecol = 0;

  let funcdef = false;

  let callfunc = false;

  let implib = false;

  let impargs = "";

  let argument = false;

  let callarg = false;

  let callargs = "";

  let funcargs = [];

  let funcdata = "";

  let funcarga = [];

  let cmting = false;

  let jmpop = false;

  let skipund = [];

  let worddef = 0;

  let structdef = 0;

  let wdstring = "";

  let wddict = _wddict;

  let sdobj = {};

  let ifs = [];
  
  let bracket = 0;
  
  let bracketins = "";
  
  let cmparr = [];

  for (let i = 0; i < processed.length; i++) {
    truecol = processed[i].filter((x) => x == "").length;
    truecol = truecol - 1;
    let pdq = false;
    const line = processed[i].filter((x) => {
      if(x.startsWith("\"")) pdq = true;
      if(x.endsWith("\"") && x != "\"") pdq = false;
      return x != "" && x != "\t";
    });
    for (let j = goto ? jjump : 0; j < line.length; j++) {
      let expr = module.exports.internal.expr;
      try{
        jmpop = false;
        variable["#LINE"] = i + 1;
        variable["#CMD"] = j + 1;
        variable["#ROWS"] = process.stdout.rows;
        variable["#COLUMNS"] = process.stdout.columns;
        goto = false;
        truecol++;
        const char = line[j];
        if(debug) console.log(i,":",truecol,trycatch,trycatcherr,char);
        if(trycatcherr.length > 0){
        if(trycatcherr[trycatcherr.length - 1][1]){
          if(char == `):[${trycatcherr[trycatcherr.length - 1][0].match(/^([^\(]+)/)[1]}](` || char == `):(` || char == ")%"){
            if(char == ")%"){
              trycatcherr.pop();
              trycatch = trycatcherr.length != 0;
            }else if(char == "):("){
              stack.push([
                trycatcherr[trycatcherr.length - 1][0],
                trycatcherr[trycatcherr.length - 1][2].name
              ]);
              trycatcherr.pop();
            }else{
              stack.push([
                trycatcherr[trycatcherr.length - 1][0],
                trycatcherr[trycatcherr.length - 1][2].name
              ]);
              trycatcherr.pop();
            }
            trycatch = trycatcherr.length != 0;
            continue;
          }else{
            continue;
          }
        }
        }
        if(char == "{"){
          bracket++;
          if(bracket == 1) continue;
        }
        if(bracket > 0){
          if(char == "}") bracket--;
          if(bracket > 0){
            bracketins += (bracketins.length == 0 ? "" : " ") + char;
          }else{
            expr.push({str: bracketins,i,j});
            bracketins = "";
          }
          continue;
        }
        if(char == "}") continue;
        if (ifs.length > 0) {
          if (Math.floor(ifs[ifs.length - 1]) != 1) {
            if(char == "=(" || char == "=>(" || char == "?(" || char == "?!(" || char == "*("){
              ifs.push(char == "*(" ? 0.5 : 0);
              continue;
            }
            if (char == ").") {
              ifs.pop();
              continue;
            }
            continue;
          } else if (char == ").") {
            if(ifs[ifs.length - 1] == 1.5){
              let expr_ = expr.pop();
              module.exports(
                expr_.str,
                log,
                stack,
                variable,
                func,
                labels,
                labelq,
                wddict,
                operators
              );
              if (stack.length < 1) throw new StackUnderflow(i, truecol);
              ifs.pop();
              let temp_ = stack.pop() == 1;
              if(temp_){
                jjump = expr_.j + 1;
                i = expr_.i - 1;
                goto = true;
                expr.push(expr_);
                ifs.push(1.5);
                break;
              }else{
                continue;
              }
            }
            ifs.pop();
            continue;
          }
        }
        if (char == ").") continue;
        if (skipund.length != 0) {
          if (char != "_" + skipund[skipund.length - 1] + "_") continue;
          skipund.pop();
          continue;
        }
        if (char.startsWith("//")) break;
        if (char.match(/\/\*/)) cmting = true;
        if (char.match(/\*\//)) {
          cmting = false;
          continue;
        }
        if (cmting && char != "*/") continue;
        //dont put that there, that will be processed after )
        //ok thanks for tip
        let r = "";
        if (char == "") continue;
        if (char == "wd-begin") {
          worddef++;
          if (worddef == 1) continue;
        }
        if (char.match(/^wd-end(_(\([^\)]+\)|)|)(\(\d+\)|)$/)) {
          if (worddef == 1) {
            wdstring = wdstring.replace(/^\n|\n$/g, "");
            const wdname = line[j + 1];
            operators.push(wdname);
            if(debug) console.log(wddict);
            wddict[wdname] = {
              data: wdstring,
              args: +char
                .match(/^wd-end(?:_(?:\([^\)]+\)|)|)(\(\d+\)|)$/)[1]
                .replace(/^\(|\)$/g, ""),
              temp:
                char.match(/^wd-end((_)(?:\([^\)]+\)|)|)(\(\d+\)|)$/)[2] == "_",
              list: (
                char.match(/^wd-end(_(\(([^\)]+)\)|)|)(\(\d+\)|)$/)[3] || ""
              ).split(","),
            };
            wdstring = "";
            worddef--;
            j++;
            continue;
          }
          worddef--;
        }
        if (worddef > 0) {
          const spl = wdstring.split("\n");
          wdstring += (spl[spl.length - 1] == "" ? "" : " ") + char;
          continue;
        }
        if (char.startsWith("_") && char.endsWith("_") && char != "_") continue;
        if (char == "sd-begin") {
          structdef++;
          if (structdef == 1) continue;
        }
        if (char == "sd-end") {
          if (structdef == 1) {
            const sdname = line[j + 1];
            variable[sdname] = new RPLRawStruct(sdname, sdobj);
            sdobj = {};
            structdef--;
            j++;
            continue;
          }
          structdef--;
        }
        if (structdef > 0) {
          for (let kv of char
            .split(",")
            .map((x) =>
              (x.match(/^[\S\d]+=[\S\d]+$/) ? x : x + "=None").split("=")
            )) {
            sdobj[kv[0]] = kv[1];
          }
          continue;
        }
        if (char.match(/^\[\d+EQ\+\]$/)) {
          let stkpm = +char.match(/^\[(\d+)EQ\+\]$/)[1];
          let stkarr = [];
          let compr = stack.pop();
          let nm = 0;
          for (let stkp = 0; stkp < stkpm - 1; stkp++) {
            if (stack.pop() == compr) nm++;
          }
          stack.push(nm);
          continue;
        }
        if (char.match(/^\[\$\+\]\([^,]+,[^\)]+\)$/)) {
          let pat = char.match(/^\[\$\+\]\(([^,]+),([^\)]+)\)$/);
          let arrstk = stack.pop();
          for (let fel of arrstk) {
            variable[pat[2]] = fel;
            module.exports(
              wddict[pat[1]].data,
              log,
              stack,
              variable,
              func,
              labels,
              labelq,
              wddict,
              operators
            );
          }
          continue;
        }
        if (char.startsWith("#*")) {
          let pat = char.match(/^#\*([\S\s]+)$/);
          let sarr = stack.pop();
          let farr = stack.pop();
          let opnm = pat[1];
          variable["#INT.OUTER.ARRAY"] = [];
          for (let ic = 0; ic < farr.length; ic++) {
            variable["#INT.OUTER.TRANS.Y"] = farr[ic];
            variable["#INT.OUTER.TRANS.X"] = sarr;
            module.exports(
              `0 ] "#INT.OUTER.ARRAY.CHILD" = wd-begin #INT.OUTER.ARRAY.CHILD #INT.OUTER.ARRAY.CHILD ][ #INT.OUTER.TRANS.Y #INT.OUTER.OPARG ${opnm} [$]< "#INT.OUTER.ARRAY.CHILD" = wd-end #INT.OUTER.OP #INT.OUTER.TRANS.X [$+](#INT.OUTER.OP,#INT.OUTER.OPARG)`,
              log,
              stack,
              variable,
              func,
              labels,
              labelq,
              wddict,
              operators
            );
            variable["#INT.OUTER.ARRAY"].push(
              variable["#INT.OUTER.ARRAY.CHILD"]
            );
          }
          stack.push(variable["#INT.OUTER.ARRAY"]);
          continue;
        }
        if (char.startsWith("#+")) {
          let pat = char.match(/^#\+([\S\s]+)$/);
          let farr = stack.pop();
          let opnm = pat[1];
          for (let ic = 0; ic < farr.length; ic++) {
            variable["#INT.REDUCE.TRANS"] = farr[ic];
            module.exports(
              `#INT.REDUCE.TRANS ${opnm}`,
              log,
              stack,
              variable,
              func,
              labels,
              labelq,
              wddict,
              operators
            );
          }
          continue;
        }
        if (char.startsWith("#:")) {
          let pat = char.match(/^#\:([\S\s]+)$/);
          let farr = stack.pop();
          let opnm = pat[1];
          variable["#INT.MAP.ARRAY"] = farr;
          for (let ic = 0; ic < farr.length; ic++) {
            variable["#INT.MAP.TRANS"] = farr[ic];
            variable["#INT.MAP.POINTER"] = ic;
            module.exports(
              `#INT.MAP.ARRAY #INT.MAP.POINTER #INT.MAP.TRANS ${opnm} [$]< "#INT.MAP.ARRAY" =`,
              log,
              stack,
              variable,
              func,
              labels,
              labelq,
              wddict,
              operators
            );
          }
          stack.push(variable["#INT.MAP.ARRAY"]);
          continue;
        }
        if (char.startsWith("#-")) {
          let pat = char.match(/^#-([\S\s]+)$/);
          let farr = stack.pop();
          let opnm = pat[1];
          for (let ic = 0; ic < farr.length; ic++) {
            stack.push(farr[ic]);
            if (opnm.startsWith("#-"))
              module.exports(
                opnm,
                log,
                stack,
                variable,
                func,
                labels,
                labelq,
                wddict,
                operators
              );
          }
          if (!opnm.startsWith("#-"))
            for (let ic = 0; ic < farr.length - 1; ic++)
              module.exports(
                opnm,
                log,
                stack,
                variable,
                func,
                labels,
                labelq,
                wddict,
                operators
              );
          module.exports(
            `${opnm.startsWith("#-") ? farr.length : 1} ]`,
            log,
            stack,
            variable,
            func,
            labels,
            labelq,
            wddict,
            operators
          );
          continue;
        }
        if (char.startsWith("_>")) {
          skipund.push(char.slice(2));
          continue;
        }
        if (char.startsWith("_?>")) {
          if (stack.length < 1) throw new StackUnderflow(i, truecol);
          if (stack.pop() == 1) skipund.push(char.slice(2));
          continue;
        }
        if (
          char.startsWith(":") &&
          char != ":" &&
          !char.startsWith(":>") &&
          !char.startsWith(":<")
        ) {
          labels[char.slice(1)] = [i, j];
          continue;
        }
        if (char.startsWith(";") && char != ";") {
          labels[char.slice(1)] = [i, j + 1];
          break;
        }
        if (char.startsWith(":>")) {
          const lab = labels[char.slice(2)];
          labelq.push([i, j]);
          i = lab[0] - 1;
          goto = true;
          jjump = lab[1];
          break;
        }
        if (
          char.startsWith(">") &&
          !char.startsWith(">>") &&
          !char.startsWith(">?") &&
          !char.startsWith(">!") &&
          char != ">>>" &&
          char != ">{}"
        ) {
          const lab = labels[char.slice(1)];
          i = lab[0] - 1;
          goto = true;
          jjump = lab[1];
          break;
        }
        if (char.startsWith("?:>")) {
          const lab = labels[char.slice(3)];
          if (stack.length < 1) throw new StackUnderflow(i, truecol);
          if (stack.pop() == 1) {
            labelq.push([i, j]);
            i = lab[0] - 1;
            goto = true;
            jjump = lab[1];
            break;
          }
          continue;
        }
        if (char.startsWith("?>")) {
          const lab = labels[char.slice(2)];
          if (stack.length < 1) throw new StackUnderflow(i, truecol);
          if (stack.pop() == 1) {
            i = lab[0] - 1;
            goto = true;
            jjump = lab[1];
            break;
          }
          continue;
        }
        if (callarg && char != ")") {
          callargs += (callargs.length == 0 ? "" : " ") + char;
          continue;
        }
        if (implib && char != ")") {
        }
        if (argument && char != ")") {
          if (funcargs.length < 2) {
            if (funcargs.length == 1 && char == "void") {
              funcargs.push("void");
            } else {
              if (char == "::") {
                funcargs.push(funcarga.join(" "));
                funcarga = [];
              } else {
                funcarga.push(char);
              }
            }
          } else {
            if (char == "::") continue;
            funcdata +=
              (j == 0 ? (funcdata.length == 0 ? "" : "\n") : "") +
              (j == 0 || funcdata.length == 0 ? "" : " ") +
              char;
          }
          if (funcargs.length == 2) {
            func[funcargs[0]] = {
              args: funcargs[1] == "void" ? [] : funcargs[1].split(" "),
            };
            if (funcargs[0].startsWith("@")) func[funcargs[0]].args.reverse();
          }
          continue;
        }
        if (char == "?(" || char == "?!(" || char == "=>(") {
          if (stack.length < 1) {
            throw new StackUnderflow(i, truecol);
          }
        }else if(char == "=(") {
          if (stack.length < 2) {
            throw new StackUnderflow(i, truecol);
          }
        }
        if (char == "=(") {
          let cmpfrom = stack.pop();
          let cmpto = stack.pop();
          ifs.push(cmpfrom == cmpto ? 1 : 0);
          cmparr.push(cmpto);
          continue;
        } else if (char == "=>(") {
          let cmpto = cmparr.pop();
          ifs.push(stack.pop() == cmpto ? 1 : 0);
          cmparr.push(cmpto);
          continue;
        } else if (char == "%(") {
          trycatch = true;
          continue;
        } else if (char == "?(") {
          ifs.push(stack.pop());
          continue;
        } else if (char == "?!(") {
          ifs.push(stack.pop() == 0);
          continue;
        } else if (char == "*(") {
          let expr_ = expr.pop();
          module.exports(
            expr_.str,
            log,
            stack,
            variable,
            func,
            labels,
            labelq,
            wddict,
            operators
          );
          if (stack.length < 1) throw new StackUnderflow(i, truecol);
          let temp_ = stack.pop() == 1;
          if(temp_) expr.push(expr_);
          ifs.push((temp_ ? 1 : 0) + 0.5);
          continue;
        }

        if (
          ((!operators.includes(char.replace(/^>>[^ ]+$/, ">>")) &&
            !operators.includes(char.replace(/^>(\?|!)[^ ]+$/, ">$1")) &&
            !operators.includes(char.replace(/^,\?[^ ]+$/, ",?"))) ||
            dq) &&
          char != ">>>"
        ) {
          if (char.startsWith('"') && !dq) {
            dq = true;
            dqstr = char.slice(1); 
            //if(char == "\"") dqstr += " ";
            if(debug) console.log(char);

            if (char.endsWith('"') && char.length != 1) {
              dq = false;
              dqstr = dqstr.replace(/\\(\\)|\\x([0-9a-fA-F]{2})|\\u([0-9a-fA-F]{4})|\\r|\\n/g,(_,slash,xpt,upt)=>{
                if(slash == "\\") return "\\";
                if(_ == "\\r") return "\r";
                if(_ == "\\n") return "\n";
                if(xpt || upt) return String.fromCharCode(+("0x" + (xpt || upt)));
              });
              stack.push(dqstr.slice(0, -1));
            }
          } else if (dq) {
            dqstr += " " + char;
            if (char.endsWith('"')) {
              dq = false;
              dqstr = dqstr.slice(0, -1);
              stack.push(dqstr);
            }
          } else {
            let vari = (va) => {
              if (Object.keys(va).includes(char)) {
                return va[char];
              } else {
                if(debug) console.log(wddict,variable);
                throw new UnknownWord(char, i, truecol);
              }
            };
            stack.push(isNaN(char) ? vari(variable) : +char);
          }
        } else {
          // OPERATORS AND CTL CHARACTERS

          switch (char) {
            case "Exp::sin":
              if (stack.length < 1) throw new StackUnderflow(i, truecol);
              stack.push(Math.sin(stack.pop()));
              break;

            case "Exp::cos":
              if (stack.length < 1) throw new StackUnderflow(i, truecol);
              stack.push(Math.cos(stack.pop()));
              break;
            
            case "!{}":
              if (expr.length < 1) throw new StackUnderflow(i, truecol);
              module.exports(
                expr[expr.length - 1].str,
                log,
                stack,
                variable,
                func,
                labels,
                labelq,
                wddict,
                operators
              );
              break;
            
            case "^{}":
              if (expr.length < 1) throw new StackUnderflow(i, truecol);
              expr.pop();
              break;
            
            case ">{}":
              if (stack.length < 1) throw new StackUnderflow(i, truecol);
              expr.push({
                str: stack.pop(),
                i,j
              });
              break;
            
            case "#DEBUG":
              let strr = debug_gen(
                log,
                stack,
                variable,
                func,
                labels,
                labelq,
                wddict,
                operators,
                procstr,
                expr,
                module.exports.internal.stack2,
                i,
                j
              );
              log(strr);
              result += strr;
              break;
            
            case ")%":
              break;
              
            case "=.":
              cmparr.pop();
              break;

            case "[?]!":
              if (stack.length < 1) throw new StackUnderflow(i, truecol);
              const struct_ = stack.pop();
              if (!(struct_ instanceof RPLRawStruct)) {
                throw new IncorrectType(
                  struct_.constructor.name,
                  RPLRawStruct.name,
                  i,
                  truecol
                );
              }
              stack.push(new RPLStruct(struct_.name, struct_.list));
              break;

            case ":<":
              const jmp = labelq.pop();
              i = jmp[0] - 1;
              jjump = jmp[1] + 1;
              jmpop = true;
              break;

            case "/*":
              cmting = true;
              break;

            case "*/":
              cmting = false;
              break;

            case ".IMP": // import library
              implib = true;
              break;

            case "_CALL":
              if (stack.length < 1) throw new StackUnderflow(i, truecol);
              module.exports(
                func[stack.pop()].data,
                log,
                stack,
                variable,
                func,
                labels,
                labelq,
                wddict,
                operators
              );
              break;

            case "(":
              if (funcdef) argument = true;
              if (callfunc) callarg = true;
              if (implib) imparg = true;
              break;

            case ")":
              if (funcdef) {
                funcdef = false;
                argument = false;
                func[funcargs[0]].data =
                  func[funcargs[0]].args.map((x) => `"${x}" =`).join("\n") +
                  "\n" +
                  funcdata;
                funcdata = "";
                funcargs = [];
              } else if (callarg) {
                callarg = false;
                module.exports(
                  func[callargs].data,
                  log,
                  stack,
                  variable,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators
                );
                callargs = "";
              } else if (implib) {
                implib = false;
                imparg = false;
              }
              break;

            case ".IMS":
            case ".IM":
              if (stack.length < 1) throw new StackUnderflow(i, truecol);
              module.exports(
                require("fs").readFileSync(
                  (char == ".IMS" ? __dirname + "/lib/" : "") +
                    stack.pop() +
                    (char == ".IMS" ? ".rpl" : "")
                ) + "",
                log,
                stack,
                variable,
                func,
                labels,
                labelq,
                wddict,
                operators
              );
              break;

            case ".FN":
              funcdef = true;
              break;

            case ".CALL":
              callfunc = true;
              break;

            case "#":
              if (stack.length > 1) {
                jjump = stack.pop() - 1;
                i = stack.pop() - 2;
                goto = true;
              } else {
                throw new StackUnderflow(i, truecol);
              }
              break;

            case ";":
              if (stack.length > 2) {
                const _jjump = stack.pop() - 1;
                const _i = stack.pop() - 2;
                if (stack.pop() == 1) {
                  jjump = _jjump;
                  i = _i;
                  goto = true;
                }
              } else {
                throw new StackUnderflow(i, truecol);
              }
              break;

            default:
              if (char.replace(/^>>[^ ]+$/, ">>") in tcpRPL && char != ">>>") {
                tcpRPL[char.replace(/^>>[^ ]+$/, ">>")](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char
                );
                break;
              } else if (char.replace(/^>(\?|!)[^ ]+$/, ">$1") in eventRPL) {
                eventRPL[char.replace(/^>(\?|!)[^ ]+$/, ">$1")](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char
                );
                break;
              } else if (char in compRPL) {
                compRPL[char](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char
                );
                break;
              } else if (char in arrayRPL) {
                arrayRPL[char](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char
                );
                break;
              } else if (char in mathRPL) {
                mathRPL[char](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char
                );
                break;
              } else if (char in logicRPL) {
                logicRPL[char](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char
                );
                break;
              } else if (char.replace(/^,\?[^ ]+$/, ",?") in ioRPL) {
                let temp_result = ioRPL[char.replace(/^,\?[^ ]+$/, ",?")](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char,
                  result,
                  procstr
                );
                if (temp_result != undefined) result += temp_result;
                break;
              } else if (char in stackRPL) {
                stackRPL[char](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char
                );
                break;
              } else if (char in miscRPL) {
                miscRPL[char](
                  stack,
                  module.exports,
                  variable,
                  log,
                  func,
                  labels,
                  labelq,
                  wddict,
                  operators,
                  i,
                  truecol,
                  char,
                  procstr
                );
                break;
              }
              if(debug) console.log("%O",wddict);
              if(debug) console.log(Object.prototype.toString.call(wddict));
              if (stack.length < wddict[char].args) {
                throw new StackUnderflow(i, truecol);
              }
              let wdtemp = {};
              Object.keys(wddict)
                .filter((x) => wddict[char].list.includes(x))
                .map((x) => {
                  wdtemp[x] = wddict[x];
                });
              let copied = {};
              Object.assign(copied,defaultVariable);
              Object.keys(variable).filter(x=>x.startsWith("%")&&x.endsWith("%")).map(x=>{
                copied[x] = variable[x];
              });
              module.exports(
                wddict[char].data,
                log,
                stack,
                wddict[char].temp ? copied : variable,
                func,
                labels,
                labelq,
                wddict[char].temp ? wdtemp : wddict,
                wddict[char].temp ? [1,Object.keys(wdtemp)] : operators
              );
              break;
          }
        }
        if (jmpop) goto = true;
        if (goto) break;
      } catch (e) {
        if(!(e.code <= -1)) throw e;
        if(!trycatch) throw e;
        trycatcherr.push([e.internalName,true,e]);
      }
    }

    if (worddef > 0 && wdstring != 0) {
      wdstring += "\n";
    }

    if (goto) continue;
  }

  return result;
};
module.exports.internal = {
  stack2: [],
  expr: []
};
module.exports.InternalError = InternalError;
module.exports.StackUnderflow = StackUnderflow;
module.exports.UnknownWord = UnknownWord;
module.exports.IncorrectType = IncorrectType;
module.exports.errors = {InternalError,StackUnderflow,UnknownWord,IncorrectType};
module.exports.version = version_mmp;
module.exports.RCversion = {
  number: "4",
  codename: "Westerwald",
};                                                 
module.exports.RC = 0
  ? module.exports.RCversion
  : false;

const defaultVariable = {
  undef: undefined,
  "#ARGS": process.argv.slice(2),
  notnum: NaN,
  "#VERSION": module.exports.version,
  "#VERSION.FULL":
    module.exports.version +
    (module.exports.RC
      ? " RC" +
        module.exports.RC.number +
        " (" +
        module.exports.RC.codename +
        ")"
      : ""),
  nil: null,
};