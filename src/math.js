module.exports = {
  "+": function (
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
      const sn = stack.pop();
      const fn = stack.pop();
      stack.push(fn + sn);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "-": function (
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
      const sn = stack.pop();
      const fn = stack.pop();
      stack.push(fn - sn);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "*": function (
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
      const sn = stack.pop();
      const fn = stack.pop();
      stack.push(fn * sn);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "/": function (
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
      const sn = stack.pop();
      const fn = stack.pop();
      stack.push(fn / sn);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "%": function (
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
      const sn = stack.pop();
      const fn = stack.pop();
      stack.push(fn % sn);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "!": function (
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
      const value = stack.pop();
      let final = 1;
      for (let j = 1; j <= value; j++) {
        final *= j;
      } // backwards from convention but this will work
      stack.push(final);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "?": function (
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
    stack.push(Math.random());
  },
  _: function (
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
      const op = stack.pop();
      const n = stack.pop();
      if ([3].includes(op)) {
        if (stack.length > 0) {
          stack.push([0, 0, 0, Math.pow][op](stack.pop(), n));
        } else {
          throw new err.StackUnderflow(i, truecol);
        }
      } else {
        stack.push([Math.floor, Math.ceil, Math.round][op](n));
      }
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