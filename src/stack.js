module.exports = {
  ":": function (
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
    if (stack.length > 0) {
      stack.push(...new Array(2).fill(stack.pop()));
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "\\": function (
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
    if (stack.length < 1) throw new err.StackUnderflow(i, j);
    stack.pop();
  },
  "<>": function (
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
    if (stack.length < 2) {
      throw err.StackUnderflow(i, truecol);
    } else {
      const revlen = stack.pop();
      if (stack.length < revlen) {
        throw new err.StackUnderflow(i, truecol);
      } else {
        let arrv = [];
        for (let arrvc = 0; arrvc < revlen; arrvc++) {
          arrv.push(stack.pop());
        }
        stack.push(...arrv);
      }
    }
  },
  "2>": function (
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
    stack.push(err.internal.stack2.pop());
  },
  "2<": function (
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
    err.internal.stack2.push(stack.pop());
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