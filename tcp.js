const net = require("net");
module.exports = {
  "~#": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol){
    if(stack.length < 1) throw new err.StackUnderflow(i,truecol);
    let serv = new net.Server({allowHalfOpen: (stack.pop() == 1)});
    stack.push(serv);
  },
  "~@": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol){
    if(stack.length < 1) throw new err.StackUnderflow(i,truecol);
    let sock = new net.Socket({allowHalfOpen: (stack.pop() == 1)});
    stack.push(sock);
  },
  "~>": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    let text = stack.pop();
    let serv = stack.pop();
    if(serv.constructor != net.Server && serv.constructor != net.Socket) throw new err.IncorrectType(i,truecol);
    serv.write(text);
    stack.push(serv);
  },
  "~<": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    let text = stack.pop();
    let serv = stack.pop();
    if(serv.constructor != net.Server && serv.constructor != net.Socket) throw new err.IncorrectType(i,truecol);
    serv.end(text);
    stack.push(serv);
  },
  ">>": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    let name = stack.pop();
    let serv = stack.pop();
    if(serv.constructor != net.Server && serv.constructor != net.Socket) throw new err.IncorrectType(i,truecol);
    serv.on(name,(...args)=>{
      variable["#SELF"] = serv;
      if(name == "connection"){
      args[0].on("error",()=>{});
      stack.push(args[0]);
      }else if(name == "data"){
      stack.push(args[0]);
      }
      err(char.replace(/^>>/,""),log,stack,variable,func,labels,labelq,wddict,operators);
    });
    stack.push(serv);
  },
  "~!": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol){
    if(stack.length < 2) throw new err.StackUnderflow(i,truecol);
    let port = stack.pop();
    let serv = stack.pop();
    if(serv.constructor != net.Server) throw new err.IncorrectType(i,truecol);
    serv.listen(port);
  },
  "~@!": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol){
    if(stack.length < 3) throw new err.StackUnderflow(i,truecol);
    let port = stack.pop();
    let host = stack.pop();
    let sock = stack.pop();
    if(sock.constructor != net.Socket) throw new err.IncorrectType(i,truecol);
    sock.connect(port,host);
  }
};