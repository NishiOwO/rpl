const events = require("events");
module.exports = {
  ">?": function (
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
    let text = char.replace(/^>\?/, "");
    let serv = stack.pop();
    serv.emit(text);
  },
  ">!": function (
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
    let evt = new events();
    evt["#NAME"] = char.replace(/^>!/, "");
    stack.push(evt);
  },
};
