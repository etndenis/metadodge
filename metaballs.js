var GAME;

window.onload = function(){
  window.addEventListener('mousemove', onMousemove, false);
  window.addEventListener("mousedown", onMousedown, false);

  GAME = new game();
  GAME.metaball.makePoints(32);
  GAME.act();
}

function game(){
  this.preRenderCanvas = document.createElement("canvas")
  this.ctxPreRender = this.preRenderCanvas.getContext("2d");
  this.ctx = canvas.getContext("2d");
  canvas.style.border = "1px solid black"

  this.width = canvas.width = this.preRenderCanvas.width = 500;
  this.height = canvas.height = this.preRenderCanvas.height = 500;
  this.state = "menu";

  this.ui = new UI([new Button(this.width/2,this.height/2,100,50,"game","menu",(this.init.bind(this)))]);
  this.metaball = new metaballs();


  }

game.prototype.act = function(){
  if (GAME.state == "game") {
    GAME.player.act();
  }
    GAME.metaball.metabolize();
    GAME.metaball.processMetaball();

  GAME.ui.drawUI()
  console.log(this.state);
  requestAnimFrame(GAME.act);

}

game.prototype.init = function(){
  this.player = new player();
  this.metaball = new metaballs();
  this.metaball.makePoints(32);
    canvas.style.cursor = 'none';
  this.state = "game"

}

function metaballs(){
  this.points = [];
  this.threshold = 200;
}

metaballs.prototype.makePoints = function(num){
  for (var i = num; i >= 0; i--) {
    var x = GAME.width*.5;
    var y = GAME.width*.5;
    var vx = Math.random()*6-3;
    var vy = Math.random()*6-3;
    var size = Math.random()*100+50;
    this.points.push({x:x,y:y,vx:vx,vy:vy,size:size});
  };
}

metaballs.prototype.metabolize =function(){ 
  GAME.ctxPreRender.clearRect(0,0,GAME.width,GAME.height)
  for (var i = this.points.length - 1; i >= 0; i--) {
    var point = this.points[i];
    point.x += point.vx;
    point.y += point.vy;

    if(point.x > GAME.width+point.size){
        point.x = 0-point.size;
    }
    if(point.x < 0-point.size){
        point.x = GAME.width+point.size;
    }
    if(point.y > GAME.height+point.size){
        point.y = 0-point.size;
    }
    if(point.y < 0-point.size){
        point.y = GAME.height+point.size;
   }

    GAME.ctxPreRender.beginPath();
    var gradient = GAME.ctxPreRender.createRadialGradient(point.x, point.y, 1, point.x, point.y, point.size);
    gradient.addColorStop(1,"rgba(230,0,250,0)");
    gradient.addColorStop(0,"red");
    GAME.ctxPreRender.fillStyle = gradient;
    GAME.ctxPreRender.arc(point.x, point.y, point.size, 0, Math.PI*2);
    GAME.ctxPreRender.fill();
  };
}

metaballs.prototype.processMetaball = function(){
  var frame = GAME.ctxPreRender.getImageData(0,0,GAME.width,GAME.height)
  var pixel = frame.data;

  for (var i = 0, n = pixel.length; i <n; i += 4) {
    if(pixel[i+3]<this.threshold){
       pixel[i+3]=0;  
    }
  }

  if (GAME.state == "game") {
    var ymax = GAME.player.y+GAME.player.radius; 
    var xmax = GAME.player.x+GAME.player.radius;

    for (var y = GAME.player.y-GAME.player.radius; y < ymax; y+=3) {
      for (var x = GAME.player.x-GAME.player.radius; x < xmax; x+=3) {
        var index = (y * GAME.width + x) * 4;
        if (pixel[index+3]) {
          
          GAME.player.color = "rgba(0,0,0,0)"

        };
      }
    }
  }

  GAME.ctx.putImageData(frame, 0, 0);    

}

function player(){
  this.x = -10;
  this.y = -10;
  this.radius = 3;
  this.color = "blue"
}

player.prototype.draw = function(){
  GAME.ctx.fillStyle = this.color
  GAME.ctx.beginPath();
  GAME.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
  GAME.ctx.fill();
}

player.prototype.act = function(){
  this.draw();
}



function onMousedown(e){
  var pos = getMousePos(canvas, e);
  for (var i = 0; i < GAME.ui.buttons.length; i++) {

    if (GAME.ui.buttons[i].isClicked(pos.x,pos.y)&&GAME.state == GAME.ui.buttons[i].state) {
      GAME.ui.buttons[i].callback();
    };
  };  
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

function onMousemove(e){
  var pos = getMousePos(canvas, e);
  if (GAME.state == "game") {
    GAME.player.x = pos.x;
    GAME.player.y = pos.y;
  }
  for (var i = GAME.ui.buttons.length - 1; i >= 0; i--) {
      if (GAME.ui.buttons[i].isClicked(pos.x,pos.y)) {
        GAME.ui.buttons[i].fillStyle = "rgb(80,80,80)";
      }
      else
        GAME.ui.buttons[i].fillStyle = "rgb(50,50,50)";
    };
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

