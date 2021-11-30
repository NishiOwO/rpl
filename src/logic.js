module.exports = {
  "~": function (
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
      stack.push(!stack.pop() ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "^": function (
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
    if (stack.length > 1) {
      stack.push(stack.pop() ^ stack.pop() ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "|": function (
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
    if (stack.length > 1) {
      stack.push(stack.pop() || stack.pop() ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "&": function (
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
    if (stack.length > 1) {
      stack.push(stack.pop() && stack.pop() ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "~.": function (
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
      stack.push(~stack.pop());
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "^.": function (
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
    if (stack.length > 1) {
      stack.push(stack.pop() ^ stack.pop());
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "|.": function (
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
    if (stack.length > 1) {
      stack.push(stack.pop() | stack.pop());
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "&.": function (
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
    if (stack.length > 1) {
      stack.push(stack.pop() & stack.pop());
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
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