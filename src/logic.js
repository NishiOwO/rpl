module.exports = {
  "~": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 0){
      stack.push(!stack.pop() ? 1 : 0);
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "^": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 1){
      stack.push(stack.pop() ^ stack.pop() ? 1 : 0);
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "|": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 1){
      stack.push(stack.pop() || stack.pop() ? 1 : 0);
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "&": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 1){
      stack.push(stack.pop() && stack.pop() ? 1 : 0);
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "~.": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 0){
      stack.push(~stack.pop());
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "^.": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 1){
      stack.push(stack.pop() ^ stack.pop());
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "|.": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 1){
      stack.push(stack.pop() | stack.pop());
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "&.": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    if(stack.length > 1){
      stack.push(stack.pop() & stack.pop());
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  }
}