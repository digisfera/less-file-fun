var less = require('less'),
    fileFun = require('file-fun');

exports.globsToDirWithWatch = fileFun.stringToString_globsToDirWithWatch(less.render, 'css')
exports.globsToDir = fileFun.stringToString_globsToDir(less.render, 'css')
exports.fileToFile = fileFun.stringToString_fileToFile(less.render)
exports.async = less.render