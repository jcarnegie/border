let Promise = require("bluebird");
let babel = require("babel-core");

let transformFile = Promise.promisify(babel.transformFile.bind(babel));

export default transformFile;
