var steps = [
               
];

var Map = cc.Scene.extend({
	onEnter:function () {
	  this._super();
	  this.gameLayer = new cc.Layer();
	  this.map = new cc.TMXTiledMap('res/map/map_game.tmx');
	  this.gameLayer.addChild(this.map);
	  this.start = cc.p(0, -(this.map.getContentSize().height - 720));
	  
	  this.map.setPosition(this.start);
	  
	  this.addChild(this.gameLayer);
	  
	 /* setTimeout(function () {
		 this.map.runAction(new cc.MoveTo(3, cc.p(this.start.x - 200, this.start.y + 200)));  
	  }.bind(this), 3000);*/
	  
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
			  //Move the position of current button sprite
			  var target = event.getCurrentTarget();
			  var delta = touch.getDelta();
			  var pos = cc.p(
					  this.map.getPosition().x + delta.x,
					  this.map.getPosition().y + delta.y
			  );
			  this.map.setPosition(pos);
			  
			  //target.x += delta.x;
			  //target.y += delta.y;
			  
			  //cc.log('move');
		  }.bind(this)
	  }, this);
	  
	  
	}	
});