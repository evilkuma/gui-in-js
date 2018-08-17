
(function() {
	this.strong_matrix = [
		[1, 0, 0],
		[-3, 4, -1],
		[2, -4, 2]
	];
	this.mul_to_strong = function(m) {
		var res = [0,0,0];
		for(var i in res) {
			for(var j in this.strong_matrix) {
				res[i] += this.strong_matrix[i][j]*m[j];
			}
		}
		return res;
	};
	this.build = function(points, start, end) {
		var x_m = [];
		var y_m = [];

		for(var i in points) {
			x_m.push(points[i][0]);
			y_m.push(points[i][1]);
		}

		var x_p = this.mul_to_strong(x_m);
		var y_p = this.mul_to_strong(y_m);

		var calc = i => {
			var x = x_p[0] + x_p[1]*i + x_p[2]*i*i;
			var y = y_p[0] + y_p[1]*i + y_p[2]*i*i;
			return [x, y];
		}

		var step = 0.01;
		var i = start;

		return {
			i: i,
			_start: start,
			_end: end,
			get start() {
				return this._start
			},
			set start(val) {
				this._start = val;
				if(this.i !== val) {
					this.i = val;
				}
			},
			get end() {
				return this._end;
			},
			set end(val) {
				this._end = val;
				this.start = this._start; // use start setter
			},
			next() {
				if(this.i === this.start) {
					this.i += step;
					return calc(this.start);
				}
				for(;this.i <= this.end;) {
					this.i += step;
					return calc(this.i);
				}
				return false;
			}
		};
	};

	this.crossPoints = function(point1, point2) {
		return point1[0] > point2[0] - 5 && point1[0] < point2[0] + 5 && 
				point1[1] > point2[1] - 5 && point1[1] < point2[1] + 5
	};

	var self = this;

	CanvasRenderingContext2D.prototype.spline = function(points) {
		var sp;
		var pos;
		var i = 0;
		for(; i < points.length - 3; i++) {
			sp = self.build([
				points[i],
				points[i+1],
				points[i+2]
			], 0, 0.5);
			pos = sp.next();
			this.moveTo(pos[0], pos[1]);
			while(pos = sp.next()) {
				this.lineTo(pos[0], pos[1]);
			}
		}
		// if lentgth < 3 init clear (add fake)
		var clear = 0;
		for(var j = points.length; j < 3; j++) {
			if(j > 0) {
				points.push(points[j-1]);
			} else {
				points.push([0, 0]);
			}
			clear++;
		}
		sp = self.build([
			points[i],
			points[i+1],
			points[i+2]
		], 0, 0.5);
		while(pos = sp.next()) {
			this.lineTo(pos[0], pos[1]);
		}
		sp.start = 0.5;
		sp.end   = 1;
		while(pos = sp.next()) {
			this.lineTo(pos[0], pos[1]);
		}
		// clear (rm fake)
		while(clear > 0) {
			points.splice(points.length - 1, 1);
			clear--;
		}
	};

	CanvasRenderingContext2D.prototype.crossSpline = function(points, point) {
		var sp;
		var pos;
		var i = 0;
		for(; i < points.length - 3; i++) {
			sp = self.build([
				points[i],
				points[i+1],
				points[i+2]
			], 0, 0.5);
			while(pos = sp.next()) {
				if(self.crossPoints(pos, point)) {
					return i;
				}
			}
		}
		var clear = 0;
		var nullClear = function() {
			while(clear > 0) {
				points.splice(points.length - 1, 1);
				clear--;
			}
		};
		for(var j = points.length; j < 3; j++) {
			if(j > 0) {
				points.push(points[j-1]);
			} else {
				points.push([0, 0]);
			}
			clear++;
		}
		sp = self.build([
			points[i],
			points[i+1],
			points[i+2]
		], 0, 0.5);
		while(pos = sp.next()) {
			if(self.crossPoints(pos, point)) {
				nullClear();
				return i;
			}
		}
		sp.start = 0.5;
		sp.end = 1;
		while(pos = sp.next()) {
			if(self.crossPoints(pos, point)) {
				nullClear();
				return i+1;
			}
		}
		nullClear();
		return false
	};
})()
