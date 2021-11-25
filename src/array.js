module.exports = {
  "#&": function (
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
    let farr = stack.pop();
    let slct = stack.pop();
    stack.push(farr.filter((x, i) => slct[i] == 1));
  },
  "[$]^": function (
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
    let changarr_ = Array.from(stack.pop());
    changarr_.pop();
    stack.push(changarr_);
  },
  "[$]^": function (
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
    let changarr_ = Array.from(stack.pop());
    changarr_.pop();
    stack.push(changarr_);
  },
  "[$]<": function (
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
    const val = stack.pop();
    const ind = stack.pop();
    let changarr = stack.pop();
    changarr[ind] = val;
    stack.push(changarr);
  },
  "[$]+": function (
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
    const src = stack.pop();
    let dest = stack.pop();
    const resultconc = dest.concat(src);
    stack.push(resultconc);
  },
  "[$],": function (
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
    const dest = stack.pop();
    let src = stack.pop();
    stack.push(src.join(dest));
  },
  "[$]-": function (
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
    stack.push(Array.from({ length: stack.pop() }, () => 0));
  },
  "[$]*": function (
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
    let len = stack.pop();
    let elem = stack.pop();
    if(!Array.isArray(elem)) elem = [elem];
    stack.push(Array.from({ length: len }, () => Array.of(...elem)));
  },
  "][": function (
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
    const resultl = stack.pop().length;
    stack.push(resultl === undefined ? 0 : resultl);
  },
  "@": function (
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
      const len = stack.pop();
      const parr = stack.pop();
      stack.push(parr[len]);
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "[": function (
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
      stack.push(...stack.pop());
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "]": function (
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
      const len = stack.pop();
      if (stack.length >= len) {
        let arr = [];
        for (let count = 0; count < len; count++) {
          arr.push(stack.pop());
        }
        arr.reverse();
        stack.push(arr);
      } else {
        throw new err.StackUnderflow(i, truecol);
      }
    } else {
      throw new err.StackUnderflow(i, truecol);
    }
  },
  "...": function (
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
    let sc = stack.pop();
    let fr = stack.pop();
    stack.push(Array.from({ length: sc - fr }, (xxx, indx) => fr + indx));
  },
  "[+]": function (
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
    let sa = stack.pop();
    let fa = stack.pop();
    stack.push(Array.from({ length: sa.length }, (xxx, indx) => [fa[indx],sa[indx]]));
  },
  "[-]": function (
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
    let ta = stack.pop();
    let fa = [];
    let sa = [];
    ta.forEach((xxx, indx) => {
      fa.push(xxx[0]);
      sa.push(xxx[1]);
    });
    stack.push(fa);
    stack.push(sa);
  },
};