var app = {
  debug: true,		
  init: function () {
	cc.director.runScene(new Map());
  },
  
  localX: function (x) {
	return x  
  },
  
  localY: function (y) {
	return y  
  },
  
  preparePathPoints: function (path) {
	  var points = [];
	  var i = 0;
	  while (i < path.length) {
		  points.push(cc.p(app.localX(path[i]), app.localY(path[i + 1])));	
		  i += 2;
	  }	
	  return points;
  },

  drawPath: function (parent, path) {
	  var pathLine = new cc.DrawNode();
	  parent.addChild(pathLine);

	  var i = 0;
	  while (i < path.length) {
		  if (i%2 == 0) {
			  if ((i+1) < path.length) {	
				  pathLine.drawSegment(
						  path[i], 
						  path[i + 1], 
						  2, 
						  cc.color(26, 252, 22, 255)
				  );
			  }	
			  if ((i+2) < path.length) {	
				  pathLine.drawSegment(
						  path[i + 1], 
						  path[i + 2], 
						  2, 
						  cc.color(26, 252, 22, 255)
				  );
			  }	

		  }  
		  pathLine.drawDot(path[i], 10, cc.color(242, 120, 14, 255));
		  i++;  
	  }
  },

  
  /**
   * Вычисляет растояние между 2 точками с координатами.
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @return {Number}
   */
  getDistance: function (x1, y1, x2, y2) {
  	return (Math.pow((Math.pow((x2 - x1), 2) +  Math.pow((y2 - y1), 2)), 0.5));
  },
  
  //Вычисляет длинну маршрута
  getPathDistance: function (path) {
	  var s = 0;
	  for (var i = 0; i < Math.floor(path.length/4)*4; i +=2) {
		  var d = this.getDistance(path[i], path[i + 1], path[i + 2], path[i + 3]);
  		s += (!isNaN(parseFloat(d)))?d:0;
  	}
  	return s;
  },
  
  getPathPointsDistance: function (path) {
	  var s = 0;
	  var p = [];
	  for (var i = 0; i < path.length; i++) {
		  p.push(path[i].x);
		  p.push(path[i].y);
	  }
	  s = getPathDistance(p);
	  return s;
  },
  
  moveByPathConstant: function (path, sprite, time, onSuccess, dir) {
	  var pathLength = this.getPathPointsDistance(path);
	  var pathSpeed  = pathLength/time;
	  var moves = [];
	  var prevLocation = sprite.getPosition();
	  for (var i = 0; i < path.length; i++) {
		  
		var d = getDistance(prevLocation.x, prevLocation.y, path[i].x, path[i].y);
		var t = d/pathSpeed;
		if (dir !== false) {
			var alpha = Math.atan2(-path[i].y + prevLocation.y, path[i].x - prevLocation.x)*(180/Math.PI) + 90;
			//cc.log('alpha[' + i + '] = ' + alpha);
			moves.push(new cc.RotateTo(0, alpha, alpha));	
		}
		
		
		moves.push(cc.moveTo(t, path[i]));
		prevLocation = path[i];
	  }
	  moves.push(cc.callFunc(function () {
		if (typeof(onSuccess) == 'function') {
		  onSuccess();		
		}  
	  }));
	  sprite.runAction(new cc.Sequence(moves));  
  },
  moveByPathConstantSpeed : function (path, sprite, speed, onSuccess, dir) {
	var pathLength = this.getPathPointsDistance(path); 
	var time = pathLength/speed;
	this.moveByPathConstant(path, sprite, time, onSuccess, dir);
  },
  
}
