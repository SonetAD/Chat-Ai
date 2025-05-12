const fs = require('fs');
const loadFile =  (fileName) => {
  try {
    const data =  fs.readFileSync(fileName, 'utf-8');
    return data;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = loadFile;