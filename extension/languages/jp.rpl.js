let colors = require("../colors.js");
module.exports=function(ver){
  class InternalError extends Error {
    constructor(line, col, ...args) {
      super(...args);
      this.name = "プログラムエラー";
      this.internalName = "InternalError";
      this.line = line + 1;
      this.col = col + 1;
      this.code = -1;
    }
  };
  let lang = {};
  let main = {};
  lang.StackUnderflow = class extends InternalError {
    constructor(...args) {
      super(...args);
      this.name = "スタックアンダーフロー";
      this.internalName = "StackUnderflow";
      this.code = -2;
      this.tip =
        "そのオペランドを実行するために必要な値がスタック(式スタックも含む)に入っているか確認してみてください。";
      this.detailedDesc =
        "スタックアンダーフローはオペランドがスタックに既に入っている値よりもさらに必要な時に起こります。 これはよくユーザーがスタックに値をプッシュし忘れた時に起こります。";
    }
  };
  lang.StackUnderflow.code = -2;
  lang.UnknownWord = class extends InternalError {
    constructor(thething, ...args) {
      super(...args);
      this.name = "未知ワード";
      this.internalName = "UnknownWord";
      this.code = -3;
      this.tip =
        "スペルミスが`" +
        thething +
        "`にないことを確かめ、さらに`" +
        thething +
        "`が本当に存在するか確かめてみてください。";
      this.detailedDesc =
        "未知ワードエラーはRPL++のインタプリターがトークンを見つけ、さらにそれの意味が理解できない時に起こります。 これはよくユーザーが打ち間違えた時やライブラリの関数名が変わった、または関数そのものが削除された際に起こります。";
    }
  };
  lang.UnknownWord.code = -3;
  lang.IncorrectType = class extends InternalError {
    constructor(type1, type2, ...args) {
      super(...args);
      this.name = "不適切型(" + type1 + " != " + type2 + ")";
      this.internalName = "IncorrectType(" + type1 + " != " + type2 + ")";
      this.code = -4;
      this.tip =
        "あなたが使っている命令 (" +
        type2 +
        "型を求めている) があなたが渡した (" +
        type1 +
        "型) 値をサポートしているか確かめてください。";
      this.detailedDesc =
        "不適切型エラーはオペランドが特定の型が必要なのにユーザーが別の型を渡した際に起こります。 これはよくユーザーが命令を不適切な引数で呼ぼうとした際に起きます。";
    }
  };
  lang.IncorrectType.code = -4;
  lang.debug_gen = function(
    log,
    stack,
    variable,
    func,
    labels,
    labelq,
    wddict,
    operators,
    procstr,
    expr,
    stack2,
    i,
    j
  ){
    let strr = "";
    strr += "デバッグ バージョンJ1.0.0\n";
    strr += "           ﾒｲﾝｽﾀｯｸ: " + (stack.map((x,ind,d)=>(ind==0?"":" ".repeat(20))+procstr(d[d.length-ind-1])).join("\n"));
    strr += "\n";
    strr += "         ｾｶﾝﾄﾞｽﾀｯｸ: " + (stack2.map((x,ind,d)=>(ind==0?"":" ".repeat(20))+procstr(d[d.length-ind-1])).join("\n"));
    strr += "\n";
    strr += "            式ｽﾀｯｸ: " + (expr.map((x,ind,d)=>(ind==0?"":" ".repeat(20))+d[d.length-ind-1].str).join("\n"));
    strr += "\n";
    strr += "              ﾗﾍﾞﾙ: " + (Object.keys(labels).map((x,ind,d)=>(ind==0?"":" ".repeat(20))+ x + " => " + labels[x].join(":")).join("\n"));
    strr += "\n";
    strr += "     ﾕｰｻﾞｰ定義ﾜｰﾄﾞ: " + (Object.keys(wddict).map((x,ind,d)=>(ind==0?"":" ".repeat(20)) + x + ` (${wddict[x].temp ? "ﾛｰｶﾙﾜｰﾄﾞ"+(wddict[x].list[0]==""?"":"､"+wddict[x].list.map(z=>'"'+z+'"').join("と")+"をｲﾝｸﾙｰﾄﾞ") : "ｸﾞﾛｰﾊﾞﾙﾜｰﾄﾞ"}､最低限必要な引数の数: ${wddict[x].args})`).join("\n"));
    strr += "\n";
    strr += "              変数: " + (Object.keys(variable).map((x,ind)=>(ind==0?"":" ".repeat(20))+x+" => "+procstr(variable[x])).join("\n"));
    strr += "\n";
    strr += "         行 (内部): " + i;
    strr += "\n";8
    
    strr += "         列 (内部): " + j;
    strr += "\n";
    return strr;
  };
  lang["procstr_list['Array.isArray(str)']"] = (str,procstr)=>`<配列 [${str.map(x=>procstr(x)).join(", ")}]>`;
  lang["procstr_list['str instanceof RegExp']"] = str=>`<正規表現 ${str}>`;
  lang["procstr_list['str instanceof Buffer']"] = str=>`<バッファー [${[...str].map(x=>("0".repeat(2-x.toString(16).length))+x.toString(16)).join(", ")}]>`;
  if(typeof ver == "string") lang["version_mmp"] = "J" + ver;
  main.crashdump = function(error) {
    //! something bad happened, print scary stacktrace
    console.log(
      colors.RED +
        colors.BRIGHT +
        ` ==== 内部エラー ====` +
        colors.RESET
    );
    console.log(
      "おっと、RPL++の内部プロセスがクラッシュしたようです。これは" +
        "あなたのコードが原因で起きたエラーでは" +
        colors.YELLOW +
        colors.BRIGHT +
        "ありません" +
        colors.RESET + "。"
    );
    console.log(
      "GithubでRPL++の開発者に連絡をとり、そしてエラーを引き起こしたコードを貼り付けてください。"
    );
    console.log("エラー名: " + error.name);
    console.log(error.stack);
  };
  main.startup = function(language){
    console.log("RPL++日本語化プログラムがインクルードされました。");
    console.log();
    console.log(
      "RPL++ バージョン" +
        language.version +
        (language.RC
          ? " RC" + language.RC.number + " (" + language.RC.codename + ")"
          : "") +
        "へようこそ！"
    );
    console.log(
      'タイピングを開始するとRPL++のコードを実行できます。 できたら、"run"と打ってコードを実行できます。 また、"exit"と打つと終了できます。'
    ); // todo: better REPL support
  };
  main.warn_rc = function warn_rc(){
    console.log(
      colors.BRIGHT +
        colors.RED +
        "警告: あなたはリリース候補版を使っています！もしかしたらバグが起きたり、不安定さがあったりするかもしれません。" +
        colors.RESET
    );
  };
  return {lang,main};
};