var less = require('less');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Args = require('args-js');
var filerw = require('file-rw');
var mirrorGlob = require('mirror-glob');

relativePath = function(origFilePath, filePathToCalculate) {
  var p = path.relative(path.dirname(origFilePath), filePathToCalculate);
  return p.split(path.sep).join('/');
}

exports.file = function(inputFile, outputFile, options, callback) {

  args = Args([
    { inputFile:  Args.STRING | Args.Required },
    { outputFile:  Args.STRING | Args.Required },
    { options: Args.OBJECT | Args.Optional, _default: {} },
    { callback: Args.FUNCTION | Args.Optional, _default: function() {} }
  ], arguments)

  var inputFile = args.inputFile,
      outputFile = args.outputFile,
      options = args.options,
      callback = args.callback;


  var sourceMapFile = options.sourceMap;
  if(sourceMapFile === true) { sourceMapFile = outputFile + '.map'; }

  fs.readFile(inputFile, { encoding: 'utf-8' }, function(err, data) {

    if(err) { return callback(err); }

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
      if(err) {
        err.toString = less.formatError.bind(null, err);
        return callback(err);
      }
      if(sourceMapContent && sourceMapFile) {
        var toReturn = { outputFile: outputFile, outputData: css, sourceMapFile: sourceMapFile, sourceMapData: sourceMapContent };

        if(options.noWrite) { callback(null, toReturn); }
        else {
          filerw.mkWriteFiles([[outputFile, css], [sourceMapFile, sourceMapContent]], function(err, result) {
            if(err) { callback(err); }
            else { callback(null, toReturn); }
          });
        }
      }
      else {
        var toReturn = { outputFile: outputFile, outputData: css };

        if(options.noWrite) { callback(null, toReturn); }
        else {
          filerw.mkWriteFile(outputFile, css, function(err, result) {
            if(err) { callback(err); }
            else { callback(null, toReturn); }
          });
        }
      }
    });

  });
}

exports.glob = function(patterns, globOptions, outputDir, options, callback, updateCallback, removeCallback) {

  args = Args([
    { patterns:  Args.ANY | Args.Required },
    { globOptions: Args.ANY | Args.Required },
    { outputDir: Args.STRING | Args.Required },
    { options: Args.OBJECT | Args.Optional, _default: {} },
    { callback: Args.FUNCTION | Args.Optional, _default: function() {} },
    { updateCallback: Args.FUNCTION | Args.Optional, _default: function() {} },
    { removeCallback: Args.FUNCTION | Args.Optional, _default: function() {} }
  ], arguments)

  var patterns = args.patterns,
      globOptions = args.globOptions,
      outputDir = args.outputDir,
      options = args.options,
      callback = args.callback,
      updateCallback = args.updateCallback,
      removeCallback = args.removeCallback;

  mirrorGlob(patterns, globOptions, outputDir, function(inputFile, outputFile, extraFiles, cb) {

    var fileFunOptions = _.omit(options, [ 'sourceMapDir', 'watch', 'extension' ]);
    fileFunOptions.sourceMap = extraFiles.sourceMap;

    exports.file(inputFile, outputFile, fileFunOptions, cb);
  }, { extension: 'css', sourceMapDir: options.sourceMapDir, watch: options.watch }, callback, updateCallback, removeCallback);
}