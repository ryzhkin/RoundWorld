
if ( !Array.prototype.forEach ) {
	Array.prototype.forEach = function( callback, thisArg ) {

		var T, k;

		if ( this == null ) {
			throw new TypeError( "this is null or not defined" );
		}

		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0; // Hack to convert O.length to a UInt32

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if ( {}.toString.call(callback) != "[object Function]" ) {
			throw new TypeError( callback + " is not a function" );
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if ( thisArg ) {
			T = thisArg;
		}

		// 6. Let k be 0
		k = 0;

		// 7. Repeat, while k < len
		while( k < len ) {

			var kValue;

			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if ( k in O ) {

				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				kValue = O[ k ];

				// ii. Call the Call internal method of callback with T as the this value and
				// argument list containing kValue, k, and O.
				callback.call( T, kValue, k, O );
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined
	};
}

if ( !Array.prototype.foreach ) {
	Array.prototype.foreach = Array.prototype.forEach;
}



/**
 * Случайное целое из диапазона min, max
 * @param min
 * @param max
 * @return {Number}
 */
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Перемешивает члены массива случайным образом
 * @param b
 * @return {*}
 */
Array.prototype.shuffle = function( b ) {
	var i = this.length, j, t;
	while( i )
	{
		j = Math.floor( ( i-- ) * Math.random() );
		t = b && typeof this[i].shuffle!=='undefined' ? this[i].shuffle() : this[i];
		this[i] = this[j];
		this[j] = t;
	}

	return this;
};


var intervalTracking = new Array();
var intervalCount=0;

setIntervalG = ( function(func, interval) {
	var interval = setInterval(func, interval);
    intervalTracking[++intervalCount]=interval;
    return interval;
});

clearAllIntervals = function () {
    for (var i = 0 ; i <= intervalCount; i++) {
      clearInterval(intervalTracking[i]);
    }
    intervalCount = 0;
    intervalTracking = [];
}

/**
 * Число в строку с ведущими нулями
 * @param number  - число
 * @param length - кол-во ведущих нулей
 * @return {*}
 */
function leadZero(number, length) {
	length = (typeof(length) == 'undefined')?2:length;
	while(number.toString().length < length){
		number = '0' + number;
	}
	return number;
}

/**
 * Вычисляет растояние между 2 точками с координатами.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @return {Number}
 */
var getDistance = function (x1, y1, x2, y2) {
	return (Math.pow((Math.pow((x2 - x1), 2) +  Math.pow((y2 - y1), 2)), 0.5));
}

//Вычисляет длинну маршрута
var getPathDistance = function (path) {
	var s = 0;
	for (var i = 0; i < Math.floor(path.length/4)*4; i +=2) {
		var d = getDistance(path[i], path[i + 1], path[i + 2], path[i + 3]);
		s += (!isNaN(parseFloat(d)))?d:0;
	}
	return s;
}

function isPointInPoly(x, y, path){
	var pt = {
			x: x,
			y: y
	};
	var poly = [];
	for (var i = 0; i < path.length; i +=2) {
		poly.push({
			x: path[i],
			y: path[i + 1]
		});
	}
	for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
		((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
		&& (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
		&& (c = !c);
	return c;
}

var getPathPointsDistance = function (path) {
	var s = 0;
	var p = [];
	for (var i = 0; i < path.length; i++) {
	  p.push(path[i].x);
	  p.push(path[i].y);
	}
	s = getPathDistance(p);
	return s;
}

// Немного векторной алгебры
var alg = {
		v2f: function (x, y) {
			return {
				x: x,
				y: y
			}	
		},
		v2fLength: function (v) {
			return (Math.pow((Math.pow(v.x, 2) +  Math.pow(v.y, 2)), 0.5));	
		},	
		v2fMult: function (p, floatVar) {
			return {
				x: p.x*floatVar,
				y: p.y*floatVar
			} 
		},
		v2fNormalize : function (v) {
			return this.v2fMult(v, 1.0 / this.v2fLength(v));	
		},
		v2fMultVectors: function (v1, v2) {
			return (v1.x*v2.x + v1.y*v2.y);
		},
		v2fAngelVectors: function (v1, v2) {
			v1 = this.v2fNormalize(v1);
			v2 = this.v2fNormalize(v2);
			var angel = (180/Math.PI*Math.acos(this.v2fMultVectors(v1, v2)));
			return (!isNaN(angel))?angel:90;
		}
}

var help = {
		extend: function(target, source) {
			target = target || {};
			for (var prop in source) {
				if (typeof source[prop] === 'object') {
					target[prop] = this.extend(target[prop], source[prop]);
				} else {
					target[prop] = source[prop];
				}
			}
			return target;
		},
		hexToRgb: function (hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}
}