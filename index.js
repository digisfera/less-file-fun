var less = require('less');
var fs = require('fs');
var path = require('path');
var fileFun = require('file-fun');
var _ = require('lodash');

relativePath = function(origFilePath, filePathToCalculate) {
  var p = path.relative(path.dirname(origFilePath), filePathToCalculate);
  return p.split(path.sep).join('/');
}

exports.file = function(inputFile, outputFile, options, callback) {
  options = options || {};

  var sourceMapFile = options.sourceMap;
  if(sourceMapFile === true) { sourceMapFile = outputFile + '.map'; }

  fs.readFile(inputFile, { encoding: 'utf-8' }, function(err, data) {

    var compileOptions = _.clone(options);
    compileOptions.paths = path.dirname(inputFile);
    compileOptions.filename = path.basename(inputFile);
    compileOptions.relativeUrls = true;

    var sourceMapContent = null;
    function writeSourceMap(result) { sourceMapContent = result; }

    if(sourceMapFile) {
      compileOptions.sourceMap = true;
      compileOptions.sourceMapFilename = sourceMapFile;
      compileOptions.sourceMapBasepath = path.dirname(inputFile);
      compileOptions.sourceMapRootpath = relativePath(outputFile, path.dirname(inputFile));
      compileOptions.sourceMapURL = relativePath(outputFile, sourceMapFile);
      compileOptions.writeSourceMap = writeSourceMap;
    }

    less.render(data, compileOptions, function(err, css) {
      if(err) { return cb(err); }

      if(sourceMapContent && sourceMapFile) {
        fileFun.mkWriteFiles([[outputFile, css], [sourceMapFile, sourceMapContent]], callback)
      }
      else {
        fileFun.mkWriteFile(outputFile, css, callback)
      }
    });

  });
}

exports.glob = function(patterns, globOptions, outputDir, options, callback, updateCallback, removeCallback) {
  options = options || {};

  fileFun.glob(patterns, globOptions, outputDir, { extension: 'css', sourceMapDir: options.sourceMapDir, watch: options.watch }, function(inputFile, outputFile, sourceMapFile, cb) {

    var fileFunOptions = _.clone(options);
    fileFunOptions.sourceMap = sourceMapFile;

    exports.file(inputFile, outputFile, fileFunOptions, cb);
  }, callback, updateCallback, removeCallback);
}