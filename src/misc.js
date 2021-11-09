module.exports = {
  "$": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if (stack.length > 0){
      stack.push(+stack.pop());
    } else {
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "=": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 1){
      variable[stack.pop()] = stack.pop();
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "$>?": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length < 1) throw new err.StackUnderflow(i,truecol);
    stack.push(String.fromCharCode(stack.pop()));
  },
  "--": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
  },
  "::": module.exports["--"],
  ">>>": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    let val = stack.pop();
    if(!isNaN(val)) val = [val];
    stack.push(Buffer.from(val));
  }
};