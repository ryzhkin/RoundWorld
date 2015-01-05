var Map = cc.Scene.extend({
	onEnter:function () {
	  this._super();
	  this.gameLayer = new cc.Layer();
	  this.map = new cc.TMXTiledMap('res/map/map_game.tmx');
	  this.gameLayer.addChild(this.map);
	  this.start = cc.p(0, -(this.map.getContentSize().height - cc.view.getDesignResolutionSize().height));
	  
	  this.map.setPosition(this.start);
	  
	  this.addChild(this.gameLayer);
	  
	 /* setTimeout(function () {
		 this.map.runAction(new cc.MoveTo(3, cc.p(this.start.x - 200, this.start.y + 200)));  
	  }.bind(this), 3000);*/
	  
	  this.editMap = true;
	  cc.eventManager.addListener({
		  event: cc.EventListener.TOUCH_ONE_BY_ONE,
		  // When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
		  swallowTouches: true,
		  //onTouchBegan event callback function                      
		  onTouchBegan: function (touch, event) { 
			  /* var target = event.getCurrentTarget();  
			  var s = target.getContentSize();
			  var rect = cc.rect(0, 0, s.width, s.height);

			  //Get the position of the current point relative to the button
			  var locationInNode = target.convertToNodeSpace(touch.getLocation());    
			  //Check the click area
			  if (cc.rectContainsPoint(rect, locationInNode)) {       
				  //cc.log("sprite began... x = " + locationInNode.x + ", y = " + locationInNode.y);
				  area.click(target);
				  return true;
			  }
			  return false;*/
			  return true;
		  },
		  //Trigger when moving touch
		  onTouchMoved: function (touch, event) {   
			  this.TouchMoved = true;
			  //Move the position of current button sprite
			  var target = event.getCurrentTarget();
			  var delta = touch.getDelta();
			  
			  delta = this.checkBorder(this.map.getPosition(), delta);
			  
			  var pos = cc.p(
					  this.map.getPosition().x + delta.x,
					  this.map.getPosition().y + delta.y
			  );
			  this.map.setPosition(pos);
			  
			  
			  var pos = cc.p(
					  this.drawLayer.getPosition().x + delta.x,
					  this.drawLayer.getPosition().y + delta.y
			  );
			  this.drawLayer.setPosition(pos);
			  
		  }.bind(this),
		  onTouchEnded: function (touch, event) {
			  /*var m = this.map.getPosition();
			  
			  cc.log('Map x = ' + m.x);
			  cc.log('Map y = ' + m.y);*/
			  
			  if (this.TouchMoved !== true) {
				var m = this.map.getPosition();
				var d = cc.p({
					x: this.start.x - m.x,
					y: this.start.y - m.y
				});
				var p = touch.getLocation();  
				var g = cc.p({
					x: p.x + d.x,
					y: p.y + d.y
				});
				if (app.debug && this.editMap) {
				  if (typeof(this.path) == 'undefined') {
					this.path = [];  
				  }
				  if (this.path.length >= 4 && app.getDistance(this.path[this.path.length-2], this.path[this.path.length-1], g.x, g.y) < 20) {
					cc.log('Конец!');
					cc.log(this.path);
					this.editMap = false;
					cc.log(this.path);
				  }
				  this.path.push(g.x);
				  this.path.push(g.y);
				  if (this.path.length >= 4) {
					app.drawPath(this.drawLayer, app.preparePathPoints([this.path[this.path.length-4], this.path[this.path.length-3],this.path[this.path.length-2], this.path[this.path.length-1]]));  
				  }
				} else {
				  //cc.log('simple click');
				  /*this.movePlayer(this.currentPlayer, this.players[this.currentPlayer].step + getRandomInt(2, 12));
				  this.currentPlayer++;
				  if (this.currentPlayer > (this.players.length-1)) {
					  this.currentPlayer = 0;  
				  }*/
				}
			  }
			  this.TouchMoved = false;
		  }.bind(this),
	  }, this);
	  
	  
	  this.drawLayer = new cc.Layer();
	  this.addChild(this.drawLayer);
	  
	  
	  cc.loader.loadJson('res/game.json', function(error, data){
		  //cc.log(data.path);
		  this.gamePath = app.preparePathPoints(data.path);
		  this.editMap = false;
		  if (app.debug && this.editMap == false) {
			//app.drawPath(this.drawLayer, app.preparePathPoints(data.path));
			this.game();  
		  }	 
	  }.bind(this));  
	},
	checkBorder: function (pos, delta) {
	  //cc.log(pos.y);	
	 /* if ( 
		  (pos.y < -(this.map.getContentSize().height - cc.view.getDesignResolutionSize().height)) 
	       || (pos.y > 0)
	  )  
	  {
		  return false; 
	  }	
	  if (
		   (pos.x > 0)
		   || (pos.x < -(this.map.getContentSize().width - cc.view.getDesignResolutionSize().width))
		 ) {
		 return false;
	  }
	  return true;
	  */
		
	  if ((pos.y + delta.y) < -(this.map.getContentSize().height - cc.view.getVisibleSize().height)) {
		delta.y = 0; 
	  }
	  if ((pos.y + delta.y) > 0) {
		delta.y = 0; 
	  }
	  if ((pos.x + delta.x) < -(this.map.getContentSize().width - cc.view.getVisibleSize().width)) { 
 	    delta.x = 0;
	  }
	  if ((pos.x + delta.x) > 0) { 
	    delta.x = 0;
	  }
	  return delta;
	},
	gamePos: function (pos) {
	  return this.gamePath[pos-1];	
	},
	findPlayerInStep: function (step) {
	  var ps = [];	
	  for (var i = 0; i < this.players.length; i++) {
		  if (this.players[i].step == step) {
			  ps.push(this.players[i]);	
		  }  
	  }		
	  return ps;
	},
	movePlayer: function (player, step, onSuccess) {
		var p = this.players[player];
		var prevStep = (p.step == undefined)?1:p.step;
		p.step = step;
		var pos = this.gamePos(step);

		var speed = 300;	
		var pathLength = app.getDistance(p.x, p.y, pos.x, pos.y);
		var time = pathLength/speed;



		p.runAction(new cc.ScaleTo(0.5, 1));


		var path = [];
		for (var i = prevStep; i <= p.step; i++) {
			path.push(this.gamePath[i]);

		}
		//cc.log(path.length);
		
		if (path.length > 1) {
			app.moveByPathConstantSpeed(path, p, speed, function () {
				if (this.findPlayerInStep(step).length > 1) {
					
				    p.runAction(new cc.Sequence([
					                             new cc.RotateTo(time/2, 180, 180),
					                             new cc.RotateTo(time/2, 360, 360)
					                             ]));
					p.runAction(new cc.Sequence([
					                             new cc.Sequence([
					                                              new cc.ScaleTo(0.5, 0.8),
					                                              new cc.MoveTo(0.5, this.getStepPos(this.gamePos(step+1), this.findPlayerInStep(step).length))                 
					                                              ])
					                             ]));
				}
				setTimeout(function () {
					this.showNextTurn({
						onTurn: function (steps) {
							this.movePlayer(this.currentPlayer, this.players[this.currentPlayer].step + (steps));
							this.currentPlayer++;
							if (this.currentPlayer > (this.players.length-1)) {
								this.currentPlayer = 0;  
							}
						}.bind(this)
					});		
				}.bind(this), 1000);
			}.bind(this), false, 
			function (point) {
				
			  cc.log('+-+');
			  
			  /*
		      cc.log((-1)*this.map.x);
		      cc.log(point.x);
		      cc.log((-1)*this.map.x + cc.view.getVisibleSize().width);
		      //*/
				
			  
			  cc.log((this.map.getContentSize().height - cc.view.getDesignResolutionSize().height) + this.map.y);
		      cc.log(point.y);
		      cc.log((this.map.getContentSize().height - cc.view.getDesignResolutionSize().height) + this.map.y + cc.view.getVisibleSize().height);
		      //*/
			  
			  if (
				   (point.x >= (-1)*this.map.x)
				   && (point.x <= (-1)*this.map.x + cc.view.getVisibleSize().width)
				   && (point.y >= (this.map.getContentSize().height - cc.view.getDesignResolutionSize().height) + this.map.y)
				   && (point.y <= (this.map.getContentSize().height - cc.view.getDesignResolutionSize().height) + this.map.y + cc.view.getVisibleSize().height)
			     ) {
                cc.log('true');				  
			  } else {
				cc.log('false');  
			  }
			  
			}.bind(this)
		  );  
		} else {
			if (this.findPlayerInStep(step).length > 1) {
				p.runAction(new cc.Sequence([
				                             new cc.RotateTo(time/2, 180, 180),
				                             new cc.RotateTo(time/2, 360, 360)
				                             ]));
				p.runAction(new cc.Sequence([
				                             new cc.Sequence([
				                                              new cc.ScaleTo(0.5, 0.8),
				                                              new cc.MoveTo(0.5, this.getStepPos(pos, this.findPlayerInStep(step).length))                 
				                                              ])
				                             ]));
			}  
	    }
	  
	  
	 
	   
	  
	  
	},
	getStepPos: function (pos, n) {
	  return cc.p({
		x: pos.x - 40*Math.cos(n*(-2*Math.PI/6)),
		y: pos.y - 40*Math.sin(n*(-2*Math.PI/6)),
	  });	
	},
	countPlayers: 1,
	players: [],
	currentPlayer: 0,
    game: function() {
      var playersImg = [
        'p1',
        'p2',
        'p3',
        'p4',
        'p5',
        'p6'
      ]; 	
      playersImg.shuffle();
      
    	
      this.players = [];
      this.currentPlayer = 0;
      this.countPlayers = 1;
      this.showIntro({
    	  onStart: function () {
    		cc.log('Start game');
    		for (var i = 0; i < this.countPlayers; i++) {
    			var p = new cc.Sprite('res/player/' + playersImg[i] + '.png');
    			p.imgName = 'res/player/' + playersImg[i] + '.png';
    			this.drawLayer.addChild(p);
    			p.setPosition(this.gamePos(1));
    			this.players.push(p);
    			this.movePlayer(i, 1);
    		}
    		setTimeout(function () {
    			this.showNextTurn({
    				onTurn: function (steps) {
    					this.movePlayer(this.currentPlayer, this.players[this.currentPlayer].step + (steps-1));
    					this.currentPlayer++;
    					if (this.currentPlayer > (this.players.length-1)) {
    						this.currentPlayer = 0;  
    					}
    				}.bind(this)
    			});	
    		}.bind(this), 1000);
    	  }.bind(this)  
      });
      
      
    },
    
    initMenu: function () {
      	
      if (typeof(this.backMenu) == 'undefined') {
    	  this.backMenu = new cc.Sprite('res/menu-board.png');
          this.backMenu.attr({
        	  x: (cc.view.getVisibleSize().width)/2,
        	  y: (cc.view.getVisibleSize().height)/2,
        	  anchorX: 0.5,
        	  anchorY: 0.5,
        	  opacity: 190
          });
          this.addChild(this.backMenu); 
      } else {
    	this.backMenu.attr({
    	   visible: true
    	}); 
      }
      this.backMenu.removeAllChildren(true);
    },
    
    showIntro: function (options) {
      this.initMenu();	
      
      var line = new cc.LabelTTF(
    		  'Путешествуйте вокруг света.',
    		  'Times New Roman',
			  34
	  );
      line.setPosition(this.backMenu.width/2, this.backMenu.height - 34);
	  line.setAnchorPoint(0.5, 1);
	  line.setColor(cc.color(0, 0, 0, 255));
	  this.backMenu.addChild(line);
	  
	  var line = new cc.LabelTTF(
    		  'В игре могут участвовать от 1 до 6 игроков.',
    		  'Times New Roman',
			  24
	  );
	  line.setPosition(this.backMenu.width/2, this.backMenu.height - 34 - 50);
	  line.setAnchorPoint(0.5, 1);
	  line.setColor(cc.color(0, 0, 0, 255));
	  this.backMenu.addChild(line);
	  
	  var line = new cc.LabelTTF(
			  'Побеждает тот игрок, который первый закончит',
    		  'Times New Roman',
			  24
	  );
      line.setPosition(this.backMenu.width/2, this.backMenu.height - 34 - 50 - 34);
	  line.setAnchorPoint(0.5, 1);
	  line.setColor(cc.color(0, 0, 0, 255));
	  this.backMenu.addChild(line);

	  var line = new cc.LabelTTF(
			  'путишествие! Удачи!',
			  'Times New Roman',
			  24
	  );
	  line.setPosition(this.backMenu.width/2, this.backMenu.height - 34 - 50 - 34 - 34);
	  line.setAnchorPoint(0.5, 1);
	  line.setColor(cc.color(0, 0, 0, 255));
	  this.backMenu.addChild(line);


	  this.countPlayersLine = new cc.LabelTTF(
			  'Игроков 1',
			  'Times New Roman',
			  30
	  );
	  this.countPlayersLine.setPosition(this.backMenu.width/2, this.backMenu.height - 34 - 50 - 34 - 80);
	  this.countPlayersLine.setAnchorPoint(0.5, 1);
	  this.countPlayersLine.setColor(cc.color(0, 0, 0, 255));
	  this.backMenu.addChild(this.countPlayersLine);
	  
	  
	  
	  var countPlayers = new ccui.Slider();
	  countPlayers.setTouchEnabled(true);
	  
	  countPlayers.loadBarTexture("res/slider/sliderTrack.png");
	  countPlayers.loadSlidBallTextures("res/slider/sliderThumb.png", "res/slider/sliderThumb.png", "");
	  countPlayers.loadProgressBarTexture("res/slider/sliderProgress.png");

	  countPlayers.setPosition(this.backMenu.width/2, this.backMenu.height - 34 - 50 - 34 - 34 - 120);
	  countPlayers.addEventListener(function (sender, type) { 
		  switch (type) {
		  case ccui.Slider.EVENT_PERCENT_CHANGED:
			  var slider = sender;
			  var percent = slider.getPercent();
			  this.countPlayers = Math.round(percent/(100/5)) + 1;
			  this.countPlayersLine.setString("Игроков " + this.countPlayers);
			  break;
		  default:
			  break;
		  }
	  }, this);
	  this.backMenu.addChild(countPlayers);
	  
	  var button = new ccui.ImageView();
	  button.setTouchEnabled(true);
	  button.loadTexture('res/menu-button-start.png');
	  button.setPosition(this.backMenu.width/2, this.backMenu.height - 34 - 50 - 34 - 34 - 120 - 70);
	  button.addTouchEventListener(function (sender, type) { 
		  switch (type) {
		  case ccui.Widget.TOUCH_ENDED: {
			  this.backMenu.attr({
				  visible: false
			  });  	
			  if (typeof(options.onStart) == 'function') {
				  options.onStart();  
			  } 
			  break;
		  }
		  default:
			  break;
		  }
	  }, this);
	  this.backMenu.addChild(button);
    },
    
    showNextTurn: function (options) {
    	this.initMenu();

    	var line = new cc.LabelTTF(
       		  'Ходит игрок',
       		  'Times New Roman',
   			  34
   	    );
        line.setPosition(this.backMenu.width/2, this.backMenu.height - 34);
   	    line.setAnchorPoint(0.5, 1);
   	    line.setColor(cc.color(0, 0, 0, 255));
   	    this.backMenu.addChild(line);
    	
   	    var playerImg = new cc.Sprite(this.players[this.currentPlayer].imgName);
   	    playerImg.attr({
   	      scale: 1.5	
   	    });
   	    playerImg.setPosition(this.backMenu.width/2, this.backMenu.height - 80);
   	    playerImg.setAnchorPoint(0.5, 1);
	    this.backMenu.addChild(playerImg);
   	    
   	    var numbers = new cc.Sprite('res/numbers/0.png');
   	    numbers.n = 0;
   	    numbers.setPosition(this.backMenu.width/2, this.backMenu.height - 150);
   	    numbers.setAnchorPoint(0.5, 1);
   	    this.backMenu.addChild(numbers);
   	    

    	var button = new ccui.ImageView();
    	button.setTouchEnabled(true);
    	button.loadTexture('res/menu-button-turn.png');
	    button.setPosition(this.backMenu.width/2, this.backMenu.height - 34 - 50 - 34 - 34 - 120 - 70);
	    button.addTouchEventListener(function (sender, type) { 
		  switch (type) {
		    case ccui.Widget.TOUCH_ENDED: {
		      
		    	
		   	  var numbersInterval = setIntervalG(function () {
		     	      //numbers.n = getRandomInt(1, 12);
		     	      numbers.n++;
		     	      if (numbers.n > 12) numbers.n = 1;
		     	      numbers.setTexture('res/numbers/' + numbers.n + '.png');
		      }.bind(this), 100);
              setTimeout(function () {
            	clearInterval(numbersInterval);  
            	numbers.n = getRandomInt(1, 12);
            	numbers.setTexture('res/numbers/' + numbers.n + '.png');
            	setTimeout(function () {
            		this.backMenu.attr({
    		    	  visible: false
    		        });
            		if (typeof(options.onTurn) == 'function') {
          		      options.onTurn(numbers.n);  
          		    }	
            	}.bind(this), 2000);
              }.bind(this), 2000); 
		    	
		       	
		       
		      break;
		    }
		    default:
			  break;
		  }
	  }, this);
	  this.backMenu.addChild(button);
    },
    
    showFinal: function (options) {
      this.initMenu();	
    }
});