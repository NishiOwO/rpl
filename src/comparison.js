module.exports = {
  "[EQ]": function (
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
    const compop = char.slice(1, -1);
    if (stack.length > 1) {
      const sv = stack.pop();
      const fv = stack.pop();
      let compr = fv == sv;
      stack.push(compr ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "[NE]": function (
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
    const compop = char.slice(1, -1);
    if (stack.length > 1) {
      const sv = stack.pop();
      const fv = stack.pop();
      let compr = fv != sv;
      stack.push(compr ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "[GT]": function (
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
    const compop = char.slice(1, -1);
    if (stack.length > 1) {
      const sv = stack.pop();
      const fv = stack.pop();
      let compr = fv > sv;
      stack.push(compr ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "[LT]": function (
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
    const compop = char.slice(1, -1);
    if (stack.length > 1) {
      const sv = stack.pop();
      const fv = stack.pop();
      let compr = fv < sv;
      stack.push(compr ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "[GE]": function (
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
    const compop = char.slice(1, -1);
    if (stack.length > 1) {
      const sv = stack.pop();
      const fv = stack.pop();
      let compr = fv >= sv;
      stack.push(compr ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "[LE]": function (
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
    const compop = char.slice(1, -1);
    if (stack.length > 1) {
      const sv = stack.pop();
      const fv = stack.pop();
      let compr = fv <= sv;
      stack.push(compr ? 1 : 0);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
};
