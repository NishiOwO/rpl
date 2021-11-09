module.exports = {
  "#<": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length < 2) throw new err.StackUnderflow(i,truecol);
    const filename = stack.pop();
    require("fs").writeFileSync(filename,stack.pop());
  },
  "#>": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length < 1) throw new err.StackUnderflow(i,truecol);
    stack.push(require("fs").readFileSync(stack.pop()) + "");
  },
  "#?": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length < 1) throw new err.StackUnderflow(i,truecol);
    stack.push(require("fs").existsSync(stack.pop()) ? 1 : 0);
  },
  ".?": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    const rl = require("readline-sync"); // require()ing this every time is probably not a good idea
    stack.push(rl.question());
  },
  ".": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char,result,procstr){
    if(stack.length < 1) throw new err.StackUnderflow(i,truecol);
    let r = procstr(stack.pop()).toString();
    result = r;
    log(r);
    return result;
  },
  ".NL": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char,result,procstr){
    if(stack.length < 1) throw new err.StackUnderflow(i,truecol);
    let r = procstr(stack.pop()).toString();
    log(r + "\n");
    result = r + "\n";
    return result;
  },
  "NL": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char,result){
    result = "\n";
    log("\n");
    return result;
  }
};