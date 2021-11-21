const net = require("net");
module.exports = {
  "~#": function (
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
    truecol
  ) {
    if (stack.length < 1) throw new err.StackUnderflow(i, truecol);
    let serv = new net.Server({ allowHalfOpen: stack.pop() == 1 });
    serv["#NAME"] = "TCPServer";
    stack.push(serv);
  },
  "~@": function (
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
    truecol
  ) {
    if (stack.length < 1) throw new err.StackUnderflow(i, truecol);
    let sock = new net.Socket({ allowHalfOpen: stack.pop() == 1 });
    sock["#NAME"] = "TCPSocket";
    stack.push(sock);
  },
  "~>": function (
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
    let text = stack.pop();
    let serv = stack.pop();
    if (serv.constructor != net.Server && serv.constructor != net.Socket)
      throw new err.IncorrectType(
        serv.constructor.name,
        net.Server.name,
        i,
        truecol
      );
    serv.write(text);
    stack.push(serv);
  },
  "~<": function (
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
    let text = stack.pop();
    let serv = stack.pop();
    if (serv.constructor != net.Server && serv.constructor != net.Socket)
      throw new err.IncorrectType(
        serv.constructor.name,
        net.Server.name,
        i,
        truecol
      );
    serv.end(text);
    stack.push(serv);
  },
  ">>": function (
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
    let name = stack.pop();
    let serv = stack.pop();
    serv.on(name, (...args) => {
      variable["#SELF"] = serv;
      if (serv.constructor == net.Server && name == "connection") {
        args[0].on("error", () => {});
        args[0]["#NAME"] = "TCPSocket";
        stack.push(args[0]);
      } else if (
        (serv.constructor == net.Server || serv.constructor == net.Socket) &&
        name == "data"
      ) {
        stack.push(args[0]);
      }
      err(
        char.replace(/^>>/, ""),
        log,
        stack,
        variable,
        func,
        labels,
        labelq,
        wddict,
        operators
      );
    });
    stack.push(serv);
  },
  "~!": function (
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
    truecol
  ) {
    if (stack.length < 2) throw new err.StackUnderflow(i, truecol);
    let port = stack.pop();
    let serv = stack.pop();
    if (serv.constructor != net.Server)
      throw new err.IncorrectType(
        serv.constructor.name,
        net.Server.name,
        i,
        truecol
      );
    serv.listen(port);
  },
  "~@!": function (
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
    truecol
  ) {
    if (stack.length < 3) throw new err.StackUnderflow(i, truecol);
    let port = stack.pop();
    let host = stack.pop();
    let sock = stack.pop();
    if (sock.constructor != net.Socket)
      throw new err.IncorrectType(
        sock.constructor.name,
        net.Socket.name,
        i,
        truecol
      );
    sock.connect(port, host);
  },
};
