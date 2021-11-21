function justify(str, len) {
  let spaceAmt = len - str.length;
  return str + " ".repeat(spaceAmt);
}

exports.justify = justify;
