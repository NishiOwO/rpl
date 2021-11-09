module.exports = {
  "[EQ]": function(stack,err,variable,log,func,labels,labelq,wddict,operators,i,truecol,char){
    const compop = char.slice(1,-1);
    if(stack.length > 1){
      const sv = stack.pop();
      const fv = stack.pop();
      let compr = false;
      switch(compop){
        case "EQ":
          compr = fv == sv;
          break;
        case "NE":
          compr = fv != sv;
          break;
        case "GT":
          compr = fv > sv;
          break;
        case "LT":
          compr = fv < sv;
          break;
        case "GE":
          compr = fv >= sv;
          break;
        case "LE":
          compr = fv <= sv;
          break;
      }
      stack.push(compr ? 1 : 0);
    }else{
      throw new err.StackUnderflow(i,truecol);
    }
  },
  "[NE]": module.exports["[EQ]"],
  "[GT]": module.exports["[EQ]"],
  "[LT]": module.exports["[EQ]"],
  "[GE]": module.exports["[EQ]"],
  "[LE]": module.exports["[EQ]"]
};