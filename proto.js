console.log('node running proto.js');

/* Module dependencies */

var express = require('express'),
    jade = require('jade');
    stylus = require('stylus');
    nib = require('nib');

var app = express();

function compile(str, path) {
    return stylus(str) .set('filename', path) .use(nib());
}

app.set('view engine', 'jade');
app.use(stylus.middleware({
    src: __dirname + '/public',
    compile: compile
}));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render('bitstarter', {title: 'Bitstarter Home'});
})
app.get('/protohome', function(req, res){
    res.render('protohome', {title: 'Prototype Home'});
})

app.listen(8080);

