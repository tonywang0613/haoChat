var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port',process.env.PORT||3001);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var users={};
app.get('/',function(req,res){
    if (req.cookies.user==null){
        res.redirect('/signin');
    }else{
        res.sendfile('views/index.html');
    }
});

app.get('/signin',function(req,res){
    res.sendfile('views/signin.html');
});

app.post('/signin',function(req,res){
    if(users[req.body.name]){
        res.redirect('/signin');
    }else{
        res.cookie("user",req.body.name,{maxAge:1000*60*60*24*30});
        res.redirect('/');
    }
});



/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server=require('http').createServer(app);
server.listen(app.get('port'), function(){
    console.log('Express server listening on port '+app.get('port'));
});

var io=require('socket.io').listen(server);
var socketList=new Array();
io.sockets.on('connection',function(socket){
    socketList.push(socket);
    console.log("connection is setup");
    socket.on('online',function(data){
        console.log("online");
        socket.name=data.user;
        if(!users[data.user]){
            users[data.user]=data.user;
        }
        io.sockets.emit('online',{users:users,user:data.user});
    });

    socket.on('say',function(data){
        if(data.to=='all'){
            socket.broadcast.emit('say',data);
        }else{
            
            socketList.forEach(function(socket){
                if(socket.name==data.to){
                    socket.emit('say',data);
                }
            });
        }
    });

    socket.on('disconnect',function(){
        if(users[socket.name]){
            delete users[socket.name];
            socket.broadcast.emit('offline',{users:users,user:socket.name});
        }
    });
});



//module.exports = app;
