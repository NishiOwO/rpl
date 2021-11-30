module.exports = {
  "#<": function (
    stack,
    err,
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
  ) {
    if (stack.length < 2) throw new err.StackUnderflow(i, truecol);
    const filename = stack.pop();
    require("fs").writeFileSync(filename, stack.pop());
  },
  "#>": function (
    stack,
    err,
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
  ) {
    if (stack.length < 1) throw new err.StackUnderflow(i, truecol);
    stack.push(require("fs").readFileSync(stack.pop()) + "");
  },
  "#?": function (
    stack,
    err,
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
  ) {
    if (stack.length < 1) throw new err.StackUnderflow(i, truecol);
    stack.push(require("fs").existsSync(stack.pop()) ? 1 : 0);
  },
  ".?": function (
    stack,
    err,
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
  ) {
    const rl = require("readline-sync"); // require()ing this every time is probably not a good idea
    stack.push(rl.question("", { hideEchoBack: false }));
  },
  ".": function (
    stack,
    err,
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
  ) {
    if (stack.length < 1) throw new err.StackUnderflow(i, truecol);
    let r = procstr(stack.pop()).toString();
    result = r;
    log(r);
    return result;
  },
  ".NL": function (
    stack,
    err,
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
  ) {
    if (stack.length < 1) throw new err.StackUnderflow(i, truecol);
    let r = procstr(stack.pop()).toString();
    log(r + "\n");
    result = r + "\n";
    return result;
  },
  NL: function (
    stack,
    err,
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
    result
  ) {
    result = "\r\n";
    log("\r\n");
    return result;
  },
  ",?": function (
    stack,
    err,
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
    result
  ) {
    let charc = char.replace(/^,\?/, "");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", (str) => {
      stack.push(str);
      let wdtemp = {};
      wdtemp = Object.keys(wddict)
        .filter((x) => wddict[charc].list.includes(x))
        .map((x) => wddict[x]);
      err(
        wddict[charc].data,
        log,
        stack,
        wddict[charc].temp ? defaultVariable : variable,
        func,
        labels,
        labelq,
        wddict[charc].temp ? wdtemp : wddict,
        operators
      );
    });
  },
};
require("fs").readdirSync(require("path").join(__dirname,"../extension")).filter(x=>x.endsWith(".rpl.js")).forEach(x=>{
  let _result = require("../extension/"+x)();
  for(let i in (_result.word||{})){
    try{
      if(eval("module.exports[\"" + i + "\"]"));
      eval("module.exports[\"" + i + "\"] = _result.word[i];");
    }catch(e){
    }
  }
});