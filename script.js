var context;
var GAME = 0;
var TOTAL;
var DESTROYED = 0;  
var CLIC = 0;
//var CANVAS_WIDTH = window.innerWidth - 10;
var CANVAS_WIDTH = 640;
//var CANVAS_HEIGHT = window.innerheight - 10;
var CANVAS_HEIGHT = 480;
var BALL_RADIUS = 10;
var REFRESH_SPEED = 20;
var MIN_START = 50;
var MAX_EXPLOSION_SIZE = 50;
var PAUSE;
var WIN;
var LOSE;
var ROUND = 0;
var LEVEL;
var TIMER = 0;


function init(level) {
  PAUSE = false;
  WIN = false;
  LOSE = false;  
  DESTROYED = 0;  
  CLIC = 0;
  ROUND++;
  LEVEL = level;
  TOTAL = level * 5;

  $('#pause-button').show();
  $("#screen").hide();
  
  var eventName = Modernizr.touch ? 'touchstart' : 'click';

  canvas  = document.getElementById("myCanvas")
  context = canvas.getContext('2d');
  canvas.width  = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
    // Create an arry to store the balls info
  balls = [];

  balls = create_ball(balls,'normal',null,null,TOTAL);
  balls = create_ball(balls,'green',null,null,1);
  balls = create_ball(balls,'yellow',null,null,2);
  balls = create_ball(balls,'red',null,null,3);    

  TOTAL = balls.length;

  draw();

  $("#myCanvas").bind(eventName,function(event) {
    if (eventName == 'touchstart') {
      var orig = event.originalEvent;
      mouseX = orig.changedTouches[0].pageX;
      mouseY = orig.changedTouches[0].pageY;
    } else {
      mouseX = event.pageX - this.offsetLeft;
      mouseY = event.pageY - this.offsetTop;
    }
    CLIC++;

    balls = create_ball(balls,'bomb',mouseX,mouseY,1);
  });  
}

// Create balls of Specific Color, Size and speeds 
function Ball(color, radius,dx,dy,x,y,explode,expand,deleted,ball_type,ball_explosion_size,ball_explosion_speed,ball_explosion_color,ball_explosion_stop) {
  this.canvas  = canvas;
  this.context = canvas.getContext('2d');
  this.radius  = radius;
  this.x = x;
  this.y  = y;
  this.dx  = dx;
  this.dy  = dy;
  this.color   = color;
  this.explode = explode;
  this.expand = expand;
  this.deleted = deleted;
  this.ball_type = ball_type;
  this.ball_explosion_size = ball_explosion_size;
  this.ball_explosion_speed = ball_explosion_speed;
  this.ball_explosion_color = ball_explosion_color;
  this.ball_explosion_stop = ball_explosion_stop;
}

Ball.prototype.Create = function () {
  this.context.globalAlpha = 0.5;
  this.context.beginPath();
  this.context.fillStyle = this.color;
  this.context.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
  this.context.fill();
}

Ball.prototype.Bounce = function () {
  if (this.x >= (canvas.width - this.radius) || this.x <= this.radius) this.dx *= -1;
  if (this.y >= (canvas.height - this.radius) || this.y <= this.radius) this.dy *= -1; 
}

function draw(){
  context.clearRect(0,0, CANVAS_WIDTH,CANVAS_HEIGHT);

  for (i in balls) {
    if (!balls[i].deleted) {
      balls[i].x += balls[i].dx;
      balls[i].y += balls[i].dy;
      balls[i].Bounce();
      balls[i].Create();
      if (balls[i].expand) expand(balls,i);
    }
  }
  //debug('<p>LEVEL : '+ LEVEL + '<p>DESTROYED : '+ DESTROYED + '</p>' + '<p>CLIC : '+ CLIC + '</p><p>TOTAL : '+ TOTAL + '</p><p>truc : ' + (DESTROYED - CLIC) + '</p>');
  DESTROYED = count_destroyed(balls);
  $("#center-footer p").html(DESTROYED);
  $("#left-footer p").html('LEVEL : '+ LEVEL);

  if (DESTROYED == TOTAL) {
    context.clearRect(0,0, CANVAS_WIDTH,CANVAS_HEIGHT);
    win();
  }  

  if (!PAUSE && !WIN && !LOSE) {
    GAME = setTimeout(draw,REFRESH_SPEED);    
  }  
}

function main_menu() {
  //context.clearRect(0,0, CANVAS_WIDTH,CANVAS_HEIGHT);
  $("#screen").show();
  $("#text").html("MAIN MENU");
  $("#button").html('<a href="#" onClick="start();">New Game</a>');
}

function start() {
  init(1);
}

function restart() {
  init(LEVEL);
}

function next() {
  init(LEVEL + 1);
}

function pause() {
  //debug("aaa" + GAME);
  if (!PAUSE) {
    PAUSE = true;
    $("#screen").show();
    $("#text").html("MENU");
    $("#button").html('<a href="#" onClick="pause();">Continue</a>');
    $("#button").append('<a href="#" onClick="restart(' + LEVEL + ');">Restart</a>');
    $("#button").append('<a href="#" onClick="main_menu();">Main Menu</a>');
    $('#pause-button').hide();
  } else {
    PAUSE = false;
    $("#screen").hide();
    $('#pause-button').show();
    draw();
  }
}

function expand(balls, i) {
  //if (balls[i].color != '#FFFF55') {
  if (balls[i].ball_explosion_stop) {

    balls[i].dx = 0;
    balls[i].dy = 0;
  }
  explosion_size = balls[i].ball_explosion_size;
  balls[i].radius = balls[i].radius + balls[i].ball_explosion_speed;
  if (balls[i].radius > explosion_size) {
    explode(balls,i);
    balls[i].expand = false;
  }
  //var red_colors = ['#B43104', '#B40404', '#DF0101', '#DBA901', '#8A2908', '#ff0000', '#DF0101'];    
  var red_colors = ['#DF0101'];    
  if (balls[i]) {
    for (j in balls) {
      if (!balls[j].expand) { //if ball is not currently exploding
        if (balls[j].x > (balls[i].x - balls[i].radius) && balls[j].x < (balls[i].x + balls[i].radius)) {
          if (balls[j].y > (balls[i].y - balls[i].radius) && balls[j].y < (balls[i].y + balls[i].radius)) {
            balls[j].expand = true;
            balls[j].color = balls[j].ball_explosion_color;
          }
        }
      }
    }
  }
}

function explode(balls, i) {
    balls[i].deleted = true;
}

function win() {
  $("#screen").show();
  $("#text").html((CLIC / ROUND) + " clics !");
  $("#button").html('<a href="#" onClick="next();">Next Level</a>');
  $("#button").append('<a href="#" onClick="restart(' + LEVEL + ');">Restart</a>');
  $("#button").append('<a href="#" onClick="main_menu();">Main Menu</a>');    
  CLIC = 0;
  WIN = true;
}

function create_ball(balls,ball_type,init_startX,init_startY,count) {
  var color = "#000000";
  var ball_radius = BALL_RADIUS;
  var expand = false;
  var ball_explosion_size = 10;
  var ball_explosion_speed = 1;
  var ball_explosion_color = "#ff0000";
  var ball_explosion_stop = true;
  
  for (var i = 0; i < count;i++) {
    var startX = get_start_position(CANVAS_WIDTH, MIN_START);
    var startY = get_start_position(CANVAS_HEIGHT, MIN_START);
    var speedX = get_start_angle();
    var speedY = get_start_angle();


    switch (ball_type) {
      case 'bomb' :   color = '#444444';
                      ball_explosion_size = 50;
                      ball_explosion_speed = 2;
                      ball_explosion_color = "#444444";
                      expand = true;
                      speedX = 0;
                      speedY = 0;
                      startX = init_startX;
                      startY = init_startY;
        break;
      case 'normal' : color = '#2471b0';
                      ball_explosion_size = 50;
                      ball_explosion_speed = 1;
                      ball_explosion_color = "#AAD4FF";
        break;
      case 'green' :  color = '#00ff00';
                      ball_radius = ball_radius *2;
                      ball_explosion_size = 100;
                      ball_explosion_speed = 0.5;
                      ball_explosion_color = "#AAFFAA";
        break;
      case 'yellow' : color = '#FFAA00';
                      ball_radius = 5;
                      ball_explosion_size = 30;
                      ball_explosion_speed = 0.2;
                      ball_explosion_color = "#FFFF55";
                      ball_explosion_stop = false;
                      //ball_speed = 1;
        break;
      case 'red' : color = '#FF0000';
                      ball_explosion_size = 100;
                      ball_explosion_speed = 5;
                      ball_explosion_color = "#ff5500";
        break;
    }
  
    balls.push(new Ball(color,ball_radius,speedX,speedY,startX,startY,false,expand,false,ball_type,ball_explosion_size,ball_explosion_speed,ball_explosion_color,ball_explosion_stop));
  }
  return balls;
}

function get_start_position(max, min) {
  var position = Math.floor(Math.random() * ((max - min) - min + 1)) + min;  
  if (position < 25) position + 10;
  return position;
}

function get_start_angle() {
  return Math.random() < 0.5 ? -3 : 3;

  //Below random start speed
  var value = Math.floor(Math.random() * 8) - 4;
  if (value == 0 ) { 
    value = Math.random() < 0.5 ? -1 : 1;
  }
  return value;
}

function debug(html) {
  $("#debug").show();
  $("#debug").html(html);
}

function count_destroyed(balls) {
  var count =  0;
    for (i in balls) {
      if (balls[i].deleted && !is_bomb(balls[i])) {
        count++;
      }
    }
  return count;
}

function is_bomb(ball) {
  if (ball.ball_type == 'bomb') {
    return true;
  } else {
    return false;
  }
}

function is_normal(ball) {
  if (ball.ball_type == 'bomb') {
    return true;
  } else {
    return false;
  }
}