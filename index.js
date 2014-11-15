var es = require('event-stream');
var PluginError = require('gulp-util').PluginError;
var Buffer = require('buffer').Buffer;
var jstransform = require('jstransform');

var PLUGIN_NAME = 'gulp-jstransform';

module.exports = function(opt){
  function modifyFile(file){
    if (file.isNull()){
      return this.emit('data', file); // pass along
    } 
    if (file.isStream()){
      return this.emit(
        'error', 
        new PluginError(PLUGIN_NAME, 'Streaming not supported.')
      );
    } 
    // Influenced by https://github.com/stoyan/etc/master/es6r/es6r.js
    var str = file.contents.toString('utf8');
    var visitors = [];
    [
      require('jstransform/visitors/es6-arrow-function-visitors'),
      require('jstransform/visitors/es6-class-visitors'),
      require('jstransform/visitors/es6-object-short-notation-visitors'),
      require('jstransform/visitors/es6-rest-param-visitors'),
      require('jstransform/visitors/es6-template-visitors')
    ].forEach(function(visitor) {
      visitors = visitors.concat(visitor.visitorList);
    });
   
    try {
      var converted = jstransform.transform(visitors, str);
      file.contents = new Buffer(converted.code);
      this.emit('data', file);
    } catch(e) {
      this.emit(
        'error', 
        new PluginError(PLUGIN_NAME, file.path + ': ' + e.message)
      );
    }
  }

  return es.through(modifyFile);
};
