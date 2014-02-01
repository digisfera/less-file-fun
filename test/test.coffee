expect = require('chai').expect

lessFun = require('../index')

describe 'less-file-fun', ->

  it 'should compile less', (done) ->
    lessFun.file 'test/files/test01.less', 'test/tmp/test01.css', { sourceMap: true }, (err, result) ->
      console.log(err, result)
      done()

  it 'should compile glob', (done) ->
    lessFun.glob '*.less', { cwd: 'test/files/' }, 'test/tmp/glob01', { sourceMapDir: 'test/tmp/glob01-maps' }, (err, result) ->
      console.log(err, result)
      done()
