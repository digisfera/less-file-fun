var expect = require('chai').expect,
    rimraf = require('rimraf'),
    fs = require('fs'),
    path = require('path'),
    lessFun = require('../index');

describe('less-file-fun', function() {

  before(function() {
    rimraf.sync(__dirname + '/tmp');
  });

  it('should compile less', function(done) {
    lessFun.file(__dirname + '/files/test01.less', __dirname + '/tmp/test01.css', { sourceMap: true }, function(err, result) {
      expect(err).to.be.not.ok;
      expect(result).to.have.property('outputFile').that.equals( __dirname + '/tmp/test01.css')
      expect(result).to.have.property('sourceMapFile').that.equals( __dirname + '/tmp/test01.css.map')
      expect(result).to.have.property('outputData').with.length.greaterThan(0)
      expect(result).to.have.property('sourceMapData').with.length.greaterThan(0)
      expect(fs.readFileSync(__dirname + '/tmp/test01.css')).to.have.length.greaterThan(0)
      expect(fs.readFileSync(__dirname + '/tmp/test01.css.map')).to.have.length.greaterThan(0)
      done();
    });
  });

  it('should compile glob', function(done) {
    lessFun.glob('*.less', __dirname + '/files', __dirname + '/tmp/glob01', { sourceMapDir: __dirname + '/tmp/glob01-maps' }, function(err, result) {
      expect(err).to.be.not.ok;
      expect(result).to.have.length(1)

      expect(result[0]).to.have.property('outputFile').that.equals( path.join(__dirname, 'tmp', 'glob01', 'test01.less.css'))
      expect(result[0]).to.have.property('sourceMapFile').that.equals( path.join(__dirname, 'tmp', 'glob01-maps/test01.less.map'))
      expect(result[0]).to.have.property('outputData').with.length.greaterThan(0)
      expect(result[0]).to.have.property('sourceMapData').with.length.greaterThan(0)

      expect(fs.readFileSync(path.join(__dirname, 'tmp', 'glob01', 'test01.less.css'))).to.have.length.greaterThan(0)
      expect(fs.readFileSync(path.join(__dirname, 'tmp', 'glob01-maps/test01.less.map'))).to.have.length.greaterThan(0)

      done();
    });
  });

});