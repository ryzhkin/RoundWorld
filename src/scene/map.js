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
		  onTouchBegan: function (touch, event) { 
			  return true;
		  },
		  onTouchMoved: function (touch, event) {   
			  this.TouchMoved = true;
			  this.moveMapDelta(touch.getDelta());
		  }.bind(this),
		  onTouchEnded: function (touch, event) {
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
					cc.log('simple click');
					//this.moveMapPos(17);
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
		  this.gameRepeat = data.repeat;
		  this.gameTransition = data.transition;
		  for (var i = 0; i < this.gamePath.length; i++) {
			 this.gamePath[i].inex = i; 
		  }
		  this.editMap = false;
		  if (app.debug && this.editMap == false) {
			//app.drawPath(this.drawLayer, app.preparePathPoints(data.path));
			this.game();  
		  }	 
	  }.bind(this));  
	},
	
	addDot: function (p) {
	  var dot = new cc.DrawNode();
	  this.drawLayer.addChild(dot);
	  dot.drawDot(p, 10, cc.color(242, 120, 14, 255));
	},
	logP: function (p) {
	  cc.log('x = ' + p.x);
	  cc.log('y = ' + p.y);
	},
	
	// Сдвинуть карту на смещение delta
	moveMapDelta: function (delta, anim, speed) {
		delta = this.checkBorder(this.map.getPosition(), delta);
		if (anim == true) {
			var speed = (typeof(speed) == 'undefined')?600:speed;
			var d = app.getDistance(this.map.getPosition().x, this.map.getPosition().y, this.map.getPosition().x + delta.x, this.map.getPosition().y + delta.y);
			var t = d/speed;
			this.map.runAction(
			   new cc.MoveTo(t, 
				  cc.p(
					this.map.getPosition().x + delta.x,
					this.map.getPosition().y + delta.y
				  )
			   )
			);

			this.drawLayer.runAction(
					new cc.MoveTo(t, 
							cc.p(
									this.drawLayer.getPosition().x + delta.x,
									this.drawLayer.getPosition().y + delta.y
							)
					)
			);
		} else {
			this.map.setPosition(
					cc.p(
							this.map.getPosition().x + delta.x,
							this.map.getPosition().y + delta.y
					)
			);
			this.drawLayer.setPosition(
					cc.p(
							this.drawLayer.getPosition().x + delta.x,
							this.drawLayer.getPosition().y + delta.y
					)		
			);	
		}
		
	},
	
	// Сдвинуть карту к координатам в системе кординат краты
	moveMap: function (pos, anim, speed) {
	 var delta = cc.p({
	   x: (-1)*(this.map.x - pos.x),
	   y: (-1)*(this.map.y - pos.y)
	 });	
	 this.moveMapDelta(delta, anim, speed);
	},

	// Передвинутся к игровой позиции
	moveMapPos: function (pos, anim) {
	  var r = 150;	
	  var p0 = this.gamePos(pos + 1);
	  //this.logP(p0);
	  //this.addDot(p0);

	  var p = cc.p({
		  x: p0.x - r,
		  y: p0.y - r
	  });

	  var p1 = this.convertNormalPosToMap(p);
	  //this.logP(p1);

	  if (this.isVisible(this.convertNormalPosToMap(p0)) == false) {
		  this.moveMap(p1, (typeof(anim) == 'undefined')?true:anim);  
	  } else {
		  //cc.log('VISIBLE!!!');  
	  }
	  //*/
	},


	checkBorder: function (pos, delta) {
		if ((pos.y + delta.y) < -(this.map.getContentSize().height - cc.view.getVisibleSize().height)) {
			//delta.y = 0;
			delta.y = -(this.map.getContentSize().height - cc.view.getVisibleSize().height) - pos.y;
		}
		if ((pos.y + delta.y) > 0) {
			//delta.y = 0;
			delta.y = (-1)*pos.y;
	  }
		if ((pos.x + delta.x) < -(this.map.getContentSize().width - cc.view.getVisibleSize().width)) { 
 	    //delta.x = 0;
		  delta.x = -(this.map.getContentSize().width - cc.view.getVisibleSize().width) - pos.x;
	  }
	  if ((pos.x + delta.x) > 0) { 
	    //delta.x = 0;
		  delta.x = (-1)*pos.x;
	  }
	  return delta;
	},
	
	isVisible: function (pos) {
		if (
			   (pos.x <= this.map.x)
		    && (pos.x >= this.map.x - cc.view.getVisibleSize().width)
		    && (pos.y <= this.map.y)
		    && (pos.y >= this.map.y - cc.view.getVisibleSize().height)
		   ) {
		   return true;	
		} else {
		   return false;	
		}
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
	
	movePlayer: function (player, step, options) {
		var p = this.players[player];
		var prevStep = (p.step == undefined)?1:p.step;
		this.moveMapPos(prevStep, false);
		
		this.moveMapPos(prevStep - 1);
		
		p.step = step;
		
		if (p.step > 119) {
			p.step = 119;
			step = 119;
		}
		
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
				// Проверяем финал игры
				if (p.step == 119) {
				  cc.log('ФИНАЛ ИГРЫ!!!');
				  return true;
				}
				
				
				// Проверяем игровое переходы
				var transition = this.getTransition(step);
				if (transition !== false) {
				  app.log(transition);
				  
				  if (transition.up) {
					cc.log('Играем радостную музыку!');  
				  } else {
					cc.log('Играем грустную музыку!');  
				  }
				  p.step = transition.transition + 1;
				  app.moveByPathConstantSpeed(
				   [
				    {
					  x: p.x,
					  y: p.y
				    }, {
				      x: this.gamePos(transition.transition + 1).x,
				      y: this.gamePos(transition.transition + 1).y
				    }
				   ], p, speed, function () {
					   this.moveMapPos(transition.transition + 1);
					   p.runAction(new cc.Sequence([
						                             new cc.RotateTo(0.5, 180, 180),
						                             new cc.RotateTo(0.5, 360, 360)
						                             ]));
					   
					   setTimeout(function () {
							this.showNextTurn({
								onTurn: function (steps) {
									var nextStep = this.players[this.currentPlayer].step + ((this.players[this.currentPlayer].step == 1)?(steps-1):steps);
									
									this.movePlayer(this.currentPlayer, nextStep);
									
									//cc.log('repeat = ' + nextStep);
									//cc.log(this.isRepeat(nextStep));
									
									if (this.isRepeat(nextStep) == false) {
										this.currentPlayer++;
										if (this.currentPlayer > (this.players.length-1)) {
											this.currentPlayer = 0;  
										}	
									}
									
								}.bind(this),
								isRepeat: this.isRepeat(p.step) 
							});		
						}.bind(this), 2000);
					   
					   
					   
				   }.bind(this)
				  );
				 // this.movePlayer(player, transition.transition, {});
				} else {
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
							var nextStep = this.players[this.currentPlayer].step + ((this.players[this.currentPlayer].step == 1)?(steps-1):steps);
							
							this.movePlayer(this.currentPlayer, nextStep);
							
							//cc.log('repeat = ' + nextStep);
							//cc.log(this.isRepeat(nextStep));
							
							if (this.isRepeat(nextStep) == false) {
								this.currentPlayer++;
								if (this.currentPlayer > (this.players.length-1)) {
									this.currentPlayer = 0;  
								}	
							} else {
							  cc.log('Повторный ход играем - радостную музыку!');	
							}
							
						}.bind(this),
						isRepeat: this.isRepeat(p.step) 
					});		
				}.bind(this), 1000);
				
			}
				
				
				
			}.bind(this), false, 
			function (point) {
				//cc.log(point.inex);
				var m = this.convertMapPosToNormal(this.map.getPosition());
				if (
						   (point.x >= m.x)
						   && (point.x <= m.x + cc.view.getVisibleSize().width)
						   && (point.y >= m.y)
						   && (point.y <= m.y + cc.view.getVisibleSize().height)
					     ) {
		                //cc.log('true');				  
					  } else {
						//cc.log('false');
						this.moveMapPos(point.inex);
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
	
	isRepeat: function (s) {
	  for (var i = 0; i < this.gameRepeat.length; i++) {
        if (this.gameRepeat[i] == s) {
          return true;	
        }		  
	  }	
	  return false;	
	},
	
	
	getTransition: function (s) {
		for (var i = 0; i < this.gameTransition.length; i++) {
	        if (this.gameTransition[i][0] == s) {
	          return {
	        	transition: this.gameTransition[i][1],
	        	up: ((this.gameTransition[i][1] < this.gameTransition[i][0])?false: true)  
	          };	
	        }		  
		}	
        return false;
	},
	
	convertMapPosToNormal: function (p) {
	  var mp  = cc.p({
		x: (-1)*p.x,
		y: (this.map.getContentSize().height - cc.view.getDesignResolutionSize().height) + p.y
	  });	
	  return mp;
	},
	convertNormalPosToMap: function (p) {
		var mp = cc.p({
			x: (-1)*p.x,
			y: this.start.y - p.y
		});	
		return mp;
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

		this.moveMapPos(0);

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
    		// Если игрок один 1 - добавляем компьютерного соперника 
    		if (this.countPlayers == 1) {
    		  var p = new cc.Sprite('res/player/' + playersImg[1] + '.png');
    		  p.imgName = 'res/player/' + playersImg[1] + '.png';
    		  p.ai = true; // Компьютерный игрок
    		  this.drawLayer.addChild(p);
    		  p.setPosition(this.gamePos(1));
    		  this.players.push(p);
    		  this.movePlayer(1, 1);	
    		  this.countPlayers++;
    		}
    		setTimeout(function () {
    			this.showNextTurn({
    				onTurn: function (steps) {
    					var nextStep = this.players[this.currentPlayer].step + ((this.players[this.currentPlayer].step == 1)?(steps-1):steps);
    					this.movePlayer(this.currentPlayer, nextStep);
    					if (this.isRepeat(nextStep) == false) {
    					  this.currentPlayer++;
    					  if (this.currentPlayer > (this.players.length-1)) {
    						this.currentPlayer = 0;  
    					  }
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
       		  ((options.isRepeat == true)?'Повторный ход':'Ход') + ((this.players[this.currentPlayer].ai == true)?' компьютера':' игрока'),
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
   	    
        //    
   	    if (this.players[this.currentPlayer].ai == true) {
   	    	var numbersInterval = setIntervalG(function () {
      	          numbers.n++;
	     	      if (numbers.n > 12) numbers.n = 1;
	     	      numbers.setTexture('res/numbers/' + numbers.n + '.png');
 	        }.bind(this), 100);
            setTimeout(function () {
      	      clearInterval(numbersInterval);  
      	      numbers.n = getRandomInt(2, 12);
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
   	    } else {
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
            	numbers.n = getRandomInt(2, 12);
            	//numbers.n = 0;
            	numbers.setTexture('res/numbers/' + numbers.n + '.png');
            	numbers.n = 24;
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
   	  }
	  //*/
	  
    },
    
    showFinal: function (options) {
      this.initMenu();	
    }
});