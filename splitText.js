const splitText = (text, chunkSize = 300) => {
  return text.match(new RegExp(`(.|\\s){1,${chunkSize}}`, 'g'));
};

module.exports = splitText;
