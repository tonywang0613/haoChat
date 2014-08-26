$(document).ready(function(){
	var socket=io.connect();
	var from=$.cookie('user');
	var to='all';
	
	

	socket.emit('online',{user:from});
	socket.on('online',function(data){
		
		if(data.user!=from){
				var sys='<div style="color:#f00">System('+now()+'):'+'User'+data.user+' is online</div>';
			}else{
				var sys='<div style="color:#f00">System('+now()+'):You are in the chat room now</div>';

			}

		$("#contents").append(sys+"<br/>");
		flushUsers(data.users);
		showSayTo();
	});

	socket.on('say',function(data){
		if(data.to=='all'){
			$("#contents").append('<div>'+data.from+'('+now()+')to all :<br/>'+data.msg+'</div><br/>');

		}
		if(data.to==from){
			$("#contents").append('<div style="color:#00f">'+data.from+'('+now()+')to you:<br/>'+data.msg+'</div><br/>');
			$('#contents').append(sys+"<br/>");
			flushUsers(data.users);
			if(data.user==to){
				to="all"
			}
			showSayTo();			
		}
	});

	socket.on('offline',function(data){
		var sys='<div style="color:#f00">System('+now()+'):'+'User'+data.user+' is offline!</div>';
	});

function flushUsers(users) {
    //清空之前用户列表，添加 "所有人" 选项并默认为灰色选中效果
    $("#list").empty().append('<li title="double click to talk" alt="all" class="sayingto" onselectstart="return false">所有人</li>');
    //遍历生成用户在线列表
    for (var i in users) {
      $("#list").append('<li alt="' + users[i] + '" title="double click to talk" onselectstart="return false">' + users[i] + '</li>');
    }
    //双击对某人聊天
    $("#list > li").dblclick(function() {
      //如果不是双击的自己的名字

      if ($(this).attr('alt') != from) {
        //设置被双击的用户为说话对象
        to = $(this).attr('alt');
        //清除之前的选中效果
        $("#list > li").removeClass('sayingto');
        //给被双击的用户添加选中效果
        $(this).addClass('sayingto');
        //刷新正在对谁说话
        showSayTo();
      }
    });
  }

function showSayTo(){
	$('#from').html(from);
	$('#to').html(to=="all"?"All":to);
}


function now(){
	var date=new Date();
	var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
	return time;
}

$("#say").click(function(){
	alert("ddd");
	var $msg=$("#input_content").html();
	if($msg=="") return;
	if(to=="all"){
		$("#contents").append('<div>You('+now()+')talk to everyone:<br/>'+$msg+'</div><br/>');

	}else{
		$("#contents").append('<div style="color:#00f"> You('+now()+')to '+ to+'talk:<br/>'+$msg+'</div><br/>');
	}
	socket.emit('say',{from:from,to:to,msg:$msg});
	$("#input_content").html("").focus();
});

});
