var testrunner = require('qunit');
var Stemmer = require('./stemmer');

var stem = new Stemmer();
console.log(stem.getWordBase('благонамереннейший'))