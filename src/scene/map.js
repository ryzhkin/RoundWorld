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
			  var pos = cc.p(
					  this.map.getPosition().x + delta.x,
					  this.map.getPosition().y + delta.y
			  );
			  if (this.checkBorder(pos)) {
				this.map.setPosition(pos); 
				this.drawLayer.setPosition(cc.p(
						this.drawLayer.getPosition().x + delta.x,
						this.drawLayer.getPosition().y + delta.y
				));
			  }
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
				  this.movePlayer(this.currentPlayer, this.players[this.currentPlayer].step + getRandomInt(2, 12));
				  this.currentPlayer++;
				  if (this.currentPlayer > (this.players.length-1)) {
					  this.currentPlayer = 0;  
				  }
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
	checkBorder: function (pos) {
	  //cc.log(pos.y);	
	  if ( 
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
	movePlayer: function (player, step) {
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
		cc.log(path.length);
		if (path.length > 1) {
			app.moveByPathConstantSpeed(path, p, speed, function () {
				if (this.findPlayerInStep(step).length > 1) {
					p.runAction(new cc.Sequence([
						                             new cc.RotateTo(time/2, 180, 180),
						                             new cc.RotateTo(time/2, 360, 360)
						                             ]));
					  p.runAction(new cc.Sequence([
					                               new cc.Sequence([
			                                         new cc.ScaleTo(0.5, 0.5),
			                                         new cc.MoveTo(0.5, this.getStepPos(this.gamePos(step+1), this.findPlayerInStep(step).length))                 
					                                                ])
					  ]));
				  }
		  }.bind(this), false);  
	    } else {
		  if (this.findPlayerInStep(step).length > 1) {
			  p.runAction(new cc.Sequence([
				                             new cc.RotateTo(time/2, 180, 180),
				                             new cc.RotateTo(time/2, 360, 360)
				                             ]));
			  p.runAction(new cc.Sequence([
			                               new cc.Sequence([
	                                         new cc.ScaleTo(0.5, 0.5),
	                                         new cc.MoveTo(0.5, this.getStepPos(pos, this.findPlayerInStep(step).length))                 
			                                                ])
			  ]));
		  }  
	    }
	  
	  
	  /*if (this.findPlayerInStep(step).length > 1) {
		  //p.runAction(new cc.ScaleTo(0.5, 0.5)); 
		  p.runAction(new cc.Sequence([
		                               new cc.MoveTo(time, pos),
		                               new cc.Sequence([
                                         new cc.ScaleTo(0.5, 0.5),
                                         new cc.MoveTo(0.5, this.getStepPos(pos, this.findPlayerInStep(step).length))                 
		                                                ])
		                               
		  ]));
	  } else {
		p.runAction(new cc.ScaleTo(0.5, 1));  
		p.runAction(new cc.MoveTo(time, pos));  
	  }*/
	   
	  
	  
	},
	getStepPos: function (pos, n) {
	  return cc.p({
		x: pos.x - 40*Math.cos(n*(-2*Math.PI/6)),
		y: pos.y - 40*Math.sin(n*(-2*Math.PI/6)),
	  });	
	},
    game: function() {
      var countPlayers = 6;
      countPlayers = (countPlayers>6)?6:countPlayers; 
      this.players = [];
      this.currentPlayer = 0;
      for (var i = 0; i < countPlayers; i++) {
    	var p = new cc.Sprite('res/player/p' + (i+1) + '.png');
    	this.drawLayer.addChild(p);
    	p.setPosition(this.gamePos(1));
    	this.players.push(p);
    	this.movePlayer(i, 1);
      }
      
    }
});