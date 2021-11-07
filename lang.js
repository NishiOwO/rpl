class InternalError extends Error {
  constructor(line,col,...args){
    super(...args);
    this.name = "InternalError";
    this.line = line + 1;
    this.col = col + 1;
    this.code = -1;
  }
}
class StackUnderflow extends InternalError {
  constructor(...args){
    super(...args);
    this.name = "StackUnderflow";
    this.code = -2;
  }
}
class UnknownWord extends InternalError {
  constructor(...args){
    super(...args);
    this.name = "UnknownWord";
    this.code = -3;
  }
}
class IncorrectType extends InternalError {
  constructor(...args){
    super(...args);
    this.name = "IncorrectType";
    this.code = -4;
  }
}
class RPLRawStruct {
  constructor(name,list){
    this.name = name;
    this.list = list;
  }
}
class RPLStruct extends RPLRawStruct {
  constructor(...args){
    super(...args);
    for(let a in this.list){
      this[a] = this.list[a];
    }
    delete this.list;
  }
}
module.exports = function(code, log=() => {}, _stack=[], _variable={undef:undefined,"#ARGS":process.argv.slice(2).filter((x,i)=>!(x == "--nolog" && i == 1)),notnum:NaN}, _func={}, _labels={}, _labelq=[], _wddict={}, _op=[]) { // whitespace indicates a distinction between blocks


  
  let processed = code.split(/(?:\r|)\n/).map(x => x.replace(/^[\t ]*/,"").split(" "));
  
  let stack = _stack;
  
  let result = "";
  
  let dq = false;
  //Double Quotation
  
  let dqstr = "";
  //Variable for saving inside of double quotation
  
  let operators = [];
  if(_op.length == 0){
    module.exports.internal.stack2 = [];
    operators.push(..."+-*/%$#:;=_\\.[]?@!&|^~()".split(""));
    operators.push(".NL", "NL", "~.", "^.", "|.", "&.",".FN","::",".CALL","_CALL",".IMP","<>","][","/*","*/",".?",":<","#>","#<","#?",".IM",".IMS","$>?","[$]<","[$]^","[$]+","[$]-","[?]!","2>","2<","...","--","#&");
    operators.push(...(["EQ","NE","GT","LT","GE","LE"]).map(x=>`[${x}]`));
  }else{
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
  
  let procstr = str=>str instanceof RPLStruct ? `<Struct ${str.name}>` : (str instanceof RPLRawStruct ? `<Raw-struct ${str.name} (${Object.keys(str.list).map(x=>x + "=" + procstr(str.list[x])).join(",")})>` : (str === undefined ? "undef" : ((str !== str) ? "notnum" : str)));
  
  for (let i = 0; i < processed.length; i++) {
    truecol = 0;
    const line = processed[i];
    for (let j = (goto ? jjump : 0); j < line.length; j++) {
      jmpop = false;
      variable["#LINE"] = i + 1;
      variable["#CMD"] = j + 1;
      variable["#ROWS"] = process.stdout.rows;
      variable["#COLUMNS"] = process.stdout.columns;
      goto = false;
      truecol += 1;
      const char = line[j];
      if(ifs.length > 0){
        if(ifs[ifs.length - 1] != 1){
          if(char == ")."){
            ifs.pop();
            continue;
          }
          continue;
        }else if(char == ")."){
          ifs.pop();
          continue;
        }
      }
      if(char == ").") continue;
      if(char == ">>>"){
        stack.push(Buffer.from(stack.pop()));
        continue;
      }
      if(skipund.length != 0){
        if(char != "_" + skipund[skipund.length - 1] + "_") continue;
        skipund.pop();
        continue;
      }
      if(char.startsWith("//")) break;
      if(char.match(/\/\*/)) cmting = true;
      if(char.match(/\*\//)){
        cmting = false;
        continue;
      }
      if(cmting && char != "*/") continue; 
      //dont put that there, that will be processed after )
      //ok thanks for tip
      let r = "";
      if(char == "") continue;
      if(char == "wd-begin"){
        worddef++;
        if(worddef == 1) continue;
      }
      if(char.match(/^wd-end(\(\d+\)|)$/)){
        if(worddef == 1){
          wdstring = wdstring.replace(/^\n|\n$/g,"");
          const wdname = line[j + 1];
          operators.push(wdname);
          wddict[wdname] = {
            data: wdstring,
            args: +char.match(/^wd-end(\(\d+\)|)$/)[1].replace(/^\(|\)$/g,"")
          };
          wdstring = "";
          worddef--;
          j++;
          continue;
        }
        worddef--;
      }
      if(worddef > 0){
        const spl = wdstring.split("\n");
        wdstring += (spl[spl.length - 1] == "" ? "" : " ") + char;
        continue;
      }
      if(char.startsWith("_") && char.endsWith("_") && char != "_") continue;
      if(char == "sd-begin"){
        structdef++;
        if(structdef== 1) continue;
      }
      if(char == "sd-end"){
        if(structdef == 1){
          const sdname = line[j + 1];
          variable[sdname] = new RPLRawStruct(sdname,sdobj);
          sdobj = {};
          structdef--;
          j++;
          continue;
        }
        structdef--;
      }
      if(structdef > 0){
        for(let kv of char.split(",").map(x=>(x.match(/^[\S\d]+=[\S\d]+$/) ? x : (x + "=None")).split("="))){
          sdobj[kv[0]] =  kv[1];
        }
        continue;
      }
      if(char.match(/^\[\d+EQ\+\]$/)){
        let stkpm = +char.match(/^\[(\d+)EQ\+\]$/)[1];
        let stkarr = [];
        let compr = stack.pop();
        let nm = 0;
        for(let stkp = 0; stkp < stkpm - 1; stkp++){
          if(stack.pop() == compr) nm++;
        }
        stack.push(nm);
        continue;
      }
      if(char.match(/^\[\$\+\]\([^,]+,[^\)]+\)$/)){
        let pat = char.match(/^\[\$\+\]\(([^,]+),([^\)]+)\)$/);
        let arrstk = stack.pop();
        for(let fel of arrstk){
          variable[pat[2]] = fel;
          module.exports(wddict[pat[1]].data,log,stack,variable,func,labels,labelq,wddict,operators);
        }
        continue;
      }
      if(char.startsWith("#*")){
        let pat = char.match(/^#\*([\S\s]+)$/);
        let sarr = stack.pop();
        let farr = stack.pop();
        let opnm = pat[1];
        variable["#INT.OUTER.ARRAY"] = [];
        for(let ic = 0; ic < farr.length; ic++){
          variable["#INT.OUTER.TRANS.Y"] = farr[ic];
          variable["#INT.OUTER.TRANS.X"] = sarr;
          module.exports(`0 ] "#INT.OUTER.ARRAY.CHILD" = wd-begin #INT.OUTER.ARRAY.CHILD #INT.OUTER.ARRAY.CHILD ][ #INT.OUTER.TRANS.Y #INT.OUTER.OPARG ${opnm} [$]< "#INT.OUTER.ARRAY.CHILD" = wd-end #INT.OUTER.OP #INT.OUTER.TRANS.X [$+](#INT.OUTER.OP,#INT.OUTER.OPARG)`,log,stack,variable,func,labels,labelq,wddict,operators);
          variable["#INT.OUTER.ARRAY"].push(variable["#INT.OUTER.ARRAY.CHILD"]);
        }
        stack.push(variable["#INT.OUTER.ARRAY"]);
        continue;
      }
      if(char.startsWith("#+")){
        let pat = char.match(/^#\+([\S\s]+)$/);
        let farr = stack.pop();
        let opnm = pat[1];
        for(let ic = 0; ic < farr.length; ic++){
          variable["#INT.REDUCE.TRANS"] = farr[ic];
          module.exports(`#INT.REDUCE.TRANS ${opnm}`,log,stack,variable,func,labels,labelq,wddict,operators);
        }
        continue;
      }
      if(char.startsWith("#-")){
        let pat = char.match(/^#-([\S\s]+)$/);
        let farr = stack.pop();
        let opnm = pat[1];
        for(let ic = 0; ic < farr.length; ic++){
          stack.push(farr[ic]);
          if(opnm.startsWith("#-")) module.exports(opnm,log,stack,variable,func,labels,labelq,wddict,operators);
        }
        if(!opnm.startsWith("#-")) for(let ic = 0; ic < farr.length - 1; ic++) module.exports(opnm,log,stack,variable,func,labels,labelq,wddict,operators);
        module.exports(`${opnm.startsWith("#-") ? farr.length : 1} ]`,log,stack,variable,func,labels,labelq,wddict,operators);
        continue;
      }
      if(char.startsWith("_>")){
        skipund.push(char.slice(2));
        continue;
      }
      if(char.startsWith("_?>")){
        if(stack.length < 1) throw new StackUnderflow(i,truecol);
        if(stack.pop() == 1) skipund.push(char.slice(2));
        continue;
      }
      if(char.startsWith(":") && char != ":" && !char.startsWith(":>") && !char.startsWith(":<")){
        labels[char.slice(1)] = [i,j];
        continue;
      }
      if(char.startsWith(";") && char != ";"){
        labels[char.slice(1)] = [i,j + 1];
        break;
      }
      if(char.startsWith(":>")){
        const lab = labels[char.slice(2)];
        labelq.push([i,j]);
        i = lab[0] - 1;
        goto = true;
        jjump = lab[1];
        break;
      }
      if(char.startsWith(">")){
        const lab = labels[char.slice(1)];
        i = lab[0] - 1;
        goto = true;
        jjump = lab[1];
        break;
      }
      if(char.startsWith("?:>")){
        const lab = labels[char.slice(3)];
        if(stack.length < 1) throw new StackUnderflow(i,truecol);
        if(stack.pop() == 1){
          labelq.push([i,j]);
          i = lab[0] - 1;
          goto = true;
          jjump = lab[1];
          break;
        }
        continue;
      }
      if(char.startsWith("?>")){
        const lab = labels[char.slice(2)];
        if(stack.length < 1) throw new StackUnderflow(i,truecol);
        if(stack.pop() == 1){
          i = lab[0] - 1;
          goto = true;
          jjump = lab[1];
          break;
        }
        continue;
      }
      if(callarg && char != ")"){
        callargs += (callargs.length == 0 ? "" : " ") + char;
        continue;
      }
      if(implib && char != ")") {
        
      }
      if(argument && char != ")"){
        if(funcargs.length < 2){
          if(funcargs.length == 1 && char == "void"){
            funcargs.push("void");
          }else{
            if(char == "::"){
              funcargs.push(funcarga.join(" "));
              funcarga = [];
            }else{
              funcarga.push(char);
            }
          }
        }else{
          if(char == "::") continue;
          funcdata += (j == 0 ? (funcdata.length == 0 ? "" : "\n") : "") + ((j == 0 || funcdata.length == 0) ? "" : " ") + char;
        }
        if(funcargs.length == 2){
          func[funcargs[0]] = {
            args: (funcargs[1] == "void" ? [] : funcargs[1].split(" "))
          };
          if(funcargs[0].startsWith("@")) func[funcargs[0]].args.reverse();
        }
        continue;
      }
      if(char == "?(" || char == "?!("){
        if(stack.length < 1){
          throw new StackUnderflow(i,truecol);
        }
      }
      if(char == "?("){
        ifs.push(stack.pop());
        continue;
      }else if(char == "?!("){
        ifs.push(stack.pop() == 0);
        continue;
      }
      
      if (!operators.includes(char) || dq) {
        if(char.startsWith("\"") && !dq){
          dq = true;
          dqstr = char.slice(1);

          if(char.endsWith("\"") && char.length != 1){
            dq = false;
            stack.push(dqstr.slice(0,-1));
          }
        } else if (dq) {
          dqstr += " " + char;
          if(char.endsWith("\"")){
            dq = false;
            dqstr = dqstr.slice(0,-1);
            stack.push(dqstr);
          }
        } else {
          let vari = (va)=>{
            if(Object.keys(va).includes(char)){
              return va[char];
            }else{
              throw new UnknownWord(i,truecol);
            }
          };
          stack.push(isNaN(char) ? vari(variable) : +char);
        }
      } else {

        // OPERATORS AND CTL CHARACTERS

        switch (char) {
          case "[EQ]":
          case "[NE]":
          case "[GT]":
          case "[LT]":
          case "[GE]":
          case "[LE]":
            const compop = char.slice(1,-1);
            if(stack.length > 1){
              const sv = stack.pop();
              const fv = stack.pop();
              let compr = false;
              switch(compop){
                case "EQ":
                  compr = fv == sv;
                  break;
                case "NE":
                  compr = fv != sv;
                  break;
                case "GT":
                  compr = fv > sv;
                  break;
                case "LT":
                  compr = fv < sv;
                  break;
                case "GE":
                  compr = fv >= sv;
                  break;
                case "LE":
                  compr = fv <= sv;
                  break;
              }
              stack.push(compr ? 1 : 0);
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "#&":
            if(stack.length < 2) throw new StackUnderflow(i,truecol);
            let farr = stack.pop();
            let slct = stack.pop();
            stack.push(farr.filter((x,i)=>slct[i] == 1));
            break;

          case "--":
            break;
          
          case "...":
            if(stack.length < 2) throw new StackUnderflow(i,truecol);
            let sc = stack.pop();
            let fr = stack.pop();
            stack.push(Array.from({length:sc - fr},(xxx,indx)=>fr + indx));
            break;
          
          case "2>":
            stack.push(module.exports.internal.stack2.pop());
            break;
          
          case "2<":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            module.exports.internal.stack2.push(stack.pop());
            break;
          
          case "[?]!":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            const struct_ = stack.pop();
            if(!(struct_ instanceof RPLRawStruct)){
              throw new IncorrectType(i,truecol);
            }
            stack.push(new RPLStruct(struct_.name,struct_.list));
            break;
          
          case "[$]^":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            let changarr_ = Array.from(stack.pop());
            changarr_.pop();
            stack.push(changarr_);
            break;
          
          case "[$]<":
            if(stack.length < 3) throw new StackUnderflow(i,truecol);
            const val = stack.pop();
            const ind = stack.pop();
            let changarr = stack.pop();
            changarr[ind] = val;
            stack.push(changarr);
            break;
          
          case "[$]+":
            if(stack.length < 2) throw new StackUnderflow(i,truecol);
            const src = stack.pop();
            let dest = stack.pop();
            const resultconc = dest.concat(src);
            stack.push(resultconc);
            break;
          
          case "[$]-":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            stack.push(Array.from({length:stack.pop()},()=>0));
            break;
          
          case "$>?":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            stack.push(String.fromCharCode(stack.pop()));
            break;
          
          case "#<":
            if(stack.length < 2) throw new StackUnderflow(i,truecol);
            const filename = stack.pop();
            require("fs").writeFileSync(filename,stack.pop())
            break;
          
          case "#>":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            stack.push(require("fs").readFileSync(stack.pop()) + "");
            break;
          
          case "#?":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            stack.push(require("fs").existsSync(stack.pop()) ? 1 : 0);
            break;
          
          case ":<":
            const jmp = labelq.pop();
            i = jmp[0] - 1;
            jjump = jmp[1] + 1;
            jmpop = true;
            break;
            
          case ".?":
            const rl = require("readline-sync"); // require()ing this every time is probably not a good idea
            stack.push(rl.question());
            break;
          case "/*":
            cmting = true;
            break;
          
          case "*/":
            cmting = false;
            break;
          
          case "][":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            const resultl = stack.pop().length;
            stack.push(resultl === undefined ? 0 : resultl);
            break;
            
          case ".IMP": // import library
            implib = true;
            break;

          case "_CALL":
            if(stack.length  < 1) throw new StackUnderflow(i,truecol);
            module.exports(func[stack.pop()].data,log,stack,variable,func,labels,labelq,wddict,operators);
            break;
          
          case "::":
            break;
          
          case "<>":
            if(stack.length < 2){
              throw StackUnderflow(i,truecol);
            }else{
              const revlen = stack.pop();
              if(stack.length < revlen){
                throw new StackUnderflow(i,truecol);
              }else{
                let arrv = [];
                for(let arrvc = 0; arrvc < revlen; arrvc++){
                  arrv.push(stack.pop());
                }
                stack.push(...arrv);
              }
            }
            break;
          
          case "(":
            if(funcdef) argument = true;
            if(callfunc) callarg = true;
            if(implib) imparg = true;
            break;
          
          case ")":
            if(funcdef){
              funcdef = false;
              argument = false;
              func[funcargs[0]].data = func[funcargs[0]].args.map(x=>`"${x}" =`).join("\n") + "\n" + funcdata;
               funcdata = "";
              funcargs = [];
            }else if(callarg){
              callarg = false;
              module.exports(func[callargs].data,log,stack,variable,func,labels,labelq,wddict,operators);
              callargs = "";
            } else if(implib){
              implib = false;
              imparg = false;
            }
            break;
          
          case ".IMS":
          case ".IM":
            if(stack.length < 1) throw new StackUnderflow(i,truecol);
            module.exports(require("fs").readFileSync((char == ".IMS" ? __dirname + "/lib/" : "") + stack.pop() + (char == ".IMS" ? ".rpl" : "")) + "",log,stack,variable,func,labels,labelq,wddict,operators);
            break;
          
          case ".FN":
            funcdef = true;
            break;
          
          case ".CALL":
            callfunc = true;
            break;
          
          case "~":
            if(stack.length > 0){
              stack.push(!stack.pop() ? 1 : 0);
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "^":
            if(stack.length > 1){
              stack.push(stack.pop() ^ stack.pop() ? 1 : 0);
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "|":
            if(stack.length > 1){
              stack.push(stack.pop() || stack.pop() ? 1 : 0);
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "&":
            if(stack.length > 1){
              stack.push(stack.pop() && stack.pop() ? 1 : 0);
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "~.":
            if(stack.length > 0){
              stack.push(~stack.pop());
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "^.":
            if(stack.length > 1){
              stack.push(stack.pop() ^ stack.pop());
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "|.":
            if(stack.length > 1){
              stack.push(stack.pop() | stack.pop());
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "&.":
            if(stack.length > 1){
              stack.push(stack.pop() & stack.pop());
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
					case "!":
						if(stack.length > 0) {
							const value = stack.pop();
							let final = 1;
							for(let j = 1; j <= value; j++){
								final *= j;
							}// backwards from convention but this will work
							stack.push(final);
						} else {
							throw new StackUnderflow(i, truecol);
						}
						break;
					
          case "@":
            if(stack.length > 1){
              const len = stack.pop();
              const parr = stack.pop();
              stack.push(parr[len]);
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "?":
            stack.push(Math.random());
            break;
          
          case "[":
            if(stack.length > 0){
              stack.push(...stack.pop());
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "]":
            if(stack.length > 0){
              const len = stack.pop();
              if(stack.length >= len){
                let arr = [];
                for(let count = 0; count < len; count++){
                  arr.push(stack.pop());
                }
                arr.reverse()
                stack.push(arr);
              }else{
                throw new StackUnderflow(i,truecol);
              }
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "_":
            if(stack.length > 1){
              const op = stack.pop();
              const n = stack.pop();
              if(([3]).includes(op)){
                if(stack.length > 0){
                  stack.push(([0,0,0,Math.pow])[op](stack.pop(),n));
                }else{
                  throw new StackUnderflow(i,truecol);
                }
              }else{
                stack.push(([Math.floor,Math.ceil,Math.round])[op](n));
              }
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "\\":
            if(stack.length < 1) throw new StackUnderflow(i,j);
            stack.pop();
            break;
          
          case "=":
            if(stack.length > 1){
              variable[stack.pop()] = stack.pop();
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case ":":
            if(stack.length > 0){
              stack.push(...new Array(2).fill(stack.pop()));
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "#":
            if(stack.length > 1){
              jjump = stack.pop() - 1;
              i = stack.pop() - 2;
              goto = true;
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case ";":
            if(stack.length > 2){
              const _jjump = stack.pop() - 1;
              const _i = stack.pop() - 2;
              if(stack.pop() == 1){
                jjump = _jjump;
                i = _i;
                goto = true;
              }
            }else{
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "$":
            if (stack.length > 0){
              stack.push(+stack.pop());
            } else {
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "+":
            if (stack.length > 1) {
              const sn = stack.pop();
              const fn = stack.pop();
              stack.push(fn + sn);
            } else {
              throw new StackUnderflow(i,j);
            }
            break;
          
          case "-":
            if (stack.length > 1) {
              const sn = stack.pop();
              const fn = stack.pop();
              stack.push(fn - sn);
            } else {
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "*":
            if (stack.length > 1) {
              const sn = stack.pop();
              const fn = stack.pop();
              stack.push(fn * sn);
            } else {
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "/":
            if (stack.length > 1) {
              const sn = stack.pop();
              const fn = stack.pop();
              stack.push(fn / sn);
            } else {
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case "%":
            if (stack.length > 1) {
              const sn = stack.pop();
              const fn = stack.pop();
              stack.push(fn % sn);
            } else {
              throw new StackUnderflow(i,truecol);
            }
            break;
          
          case ".":
            if(stack.length < 1) throw new StackUnderflow(i,j);
            r = procstr(stack.pop()).toString();
            result += r;
            log(r);
            break;

          case ".NL":
            truecol += 2;
            if(stack.length < 1) throw new StackUnderflow(i,j);
            r = procstr(stack.pop());
            log(r + "\n");
            result += r + "\n";
            break;
          
          case "NL":
            truecol += 1;
            result += "\n";
            log("\n");
            break;
          
          default:
            if(stack.length < wddict[char].args){
              throw new StackUnderflow(i,truecol);
            }
            module.exports(wddict[char].data,log,stack,variable,func,labels,labelq,wddict,operators);
            break;
        }
      }
      if(jmpop) goto = true;
      if(goto) break;
    }
    
    if(worddef > 0 && wdstring != 0){
      wdstring += "\n";
    }

    if(goto) continue;
  }


  return result;
};
module.exports.internal = {
  stack2: []
};
module.exports.InternalError = InternalError;
module.exports.StackUnderflow = StackUnderflow;
module.exports.UnknownWord = UnknownWord;
module.exports.version = "1.4.0";
module.exports.RC = 1 ? {
  number: 1,
  codename: "Centauri"
} : false;