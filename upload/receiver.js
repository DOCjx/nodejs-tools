var http = require('http');
var net = require('net');
var url = require('url');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var util = require('util');

var exists = fs.existsSync;

function mkdir (p, mode) {
  if (typeof mode === 'undefined') {
    //511 === 0777
    mode = 511 & (~process.umask());
  }
  if (exists(p)) return;
  p.split('/').reduce(function(prev, next) {
    if (prev && !exists(prev)) {
      fs.mkdirSync(prev, mode);
    }
    return prev + '/' + next;
  });
  if (!exists(p)) {
    fs.mkdirSync(p, mode);
  }
}

http.createServer(function(req, res){
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var form = new formidable.IncomingForm();
  mkdir('../tmp');
  form.uploadDir = '../tmp';
  form.parse(req, function(err, fields, files) {
    var toDir = path.resolve(process.cwd(), decodeURI(fields.to));
    var fileName = decodeURI(files.file.name);
    if (!exists(toDir)) {
      console.log('Create dir ' + toDir);
      mkdir(toDir);
    }
    fs.renameSync(files.file.path, toDir + path.sep + fileName);
    console.info('Saved file ' + toDir + path.sep + fileName);
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:' + fileName);
    res.end();
  });
}).listen(8337);

console.log('Severing at 8337');
