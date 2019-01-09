#! /usr/bin/node

require = require("esm")(module, {"force": true, "mode": "auto", "cjs": { "vars": true } });

// register application
module.exports = require('./server').default;
