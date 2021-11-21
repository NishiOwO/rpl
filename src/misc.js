module.exports = {
  $: function (
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
      stack.push(+stack.pop());
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "=": function (
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
      variable[stack.pop()] = stack.pop();
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "$>?": function (
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
    stack.push(String.fromCharCode(stack.pop()));
  },
  "--": function (
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
  ) {},
  "::": module.exports["--"],
  ">>>": function (
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
    let val = stack.pop();
    if (!isNaN(val)) val = [val];
    stack.push(Buffer.from(val));
  },
  "!/#/": function (
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
    let flag = stack.pop();
    stack.push(new RegExp(stack.pop(), flag));
  },
  "?/#/": function (
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
    let regex = stack.pop();
    stack.push(stack.pop().match(regex));
  },
  ",/#/": function (
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
    let regex = stack.pop();
    stack.push(stack.pop().split(regex));
  },
  "^/#/": function (
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
    if (stack.length < 3) throw new err.StackUnderflow(i, truecol);
    let regex = stack.pop();
    let to = stack.pop();
    stack.push(stack.pop().replace(regex, to));
  },
};
