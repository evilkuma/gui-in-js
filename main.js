
(function() {
    
})();
var canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 500;
canvas.style.background = 'rgb(69, 72, 76)';
canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.bottom = 0;
canvas.style.left = 0;
canvas.style.right = 0;
canvas.style.margin = 'auto';
document.body.appendChild(canvas);

var ctx    = canvas.getContext('2d');

var blocks = [
    new Block(120, 110).addInPoint().addInPoint().addInPoint().addInPoint()
                            .addOutPoint().addOutPoint().addOutPoint().addOutPoint().draw(),
    new Block(300, 300).addInPoint().addOutPoint().addOutPoint().draw()
];

var out_data = null; //kostil for out save
var step = false;
var block = false;
var point = false;
var link = false;

ctx.handle('mousedown', function(e) {
    var pos = [e.layerX, e.layerY];
    for(var i in blocks) {
        if(blocks[i].crossByPoint(pos)) {
            block = blocks[i];
            if(blocks[i].crossMoverByPoint(pos)) {
                step = [block.x - e.layerX, block.y - e.layerY]
                return;
            }
            var p_data = blocks[i].crossInPoint(pos);
            if(p_data) {
                point = p_data[0];
                link = p_data[1];
                link.addOut(block);
                return;
            }
            p_data = blocks[i].crossOutPoint(pos);
            if(p_data) {
                point = p_data[0];
                out_data = p_data[1];
                link = new Link();
                link.addOut(blocks[i]);
                return;
            }
            point = false;
        }
    }
});
ctx.handle('mouseup',   function(e) {
    if(point) {
        for(var i in blocks) {
            if(blocks[i].crossByPoint([e.layerX, e.layerY])) {
                if(link._in && (point = blocks[i].crossOutPoint([e.layerX, e.layerY]))) {
                    point[1].push(link);
                    link.calc(link.setOut(blocks[i]), false, point[0]);
                    link.draw();
                    break;
                }
                if(!link._in && (point = blocks[i].crossInPoint([e.layerX, e.layerY]))) {
                    var end = link._points[0][0];
                    link.destroy();
                    link = point[1];
                    out_data.push(link); // point[1].push(link);
                    link.addOut(block);
                    link.calc('last', point[0], end);
                    link.draw();
                    break;
                }
            }
        }
    }
    step = false;
    block = false;
    point = false;
});
ctx.handle('mousemove', function(e) {
    if(block && step) {
        block.x = e.layerX + step[0];
        block.y = e.layerY + step[1];
        block.draw();
    }
    if(point && link) {
        link.calc(0, point, [e.layerX, e.layerY]);
        link.draw();
    }
});

function Block(x, y) {
    this.ctx = ctx.layer();
    this.x = x;
    this.y = y;
    this.w = 150;
    this.h = 80;
    this.th = 20;

    this.in_links = [];
    this.out_links = [];
    this.in_points = [];
    this.out_points = [];
    
    this.draw = function() {
        var ctx = this.ctx;
        var x = this.x;
        var y = this.y;
        var w = this.w;
        var h = this.h;
        var th = this.th;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var r = 5;
        var arcs = [
            [x + w/2 - r, y + h/2 - r],
            [x - w/2 + r, y + h/2 - r],
            [x - w/2 + r, y - h/2 + r],
            [x + w/2 - r, y - h/2 + r]
        ];

        var pi2 = Math.PI/2;
        var i = 0;

        ctx.fillStyle = 'rgba(44, 48, 44, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x + w/2, y - h/2 + th);
        for(; i < 2; i++) {
            var arc = arcs[i];
            ctx.arc(arc[0], arc[1], r, pi2*i, pi2*(i+1));
        }
        ctx.lineTo(x - w/2, y - h/2 + th)
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(119, 216, 119, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x - w/2, y - h/2 + th);
        for(; i < arcs.length; i++) {
            var arc = arcs[i];
            ctx.arc(arc[0], arc[1], r, pi2*i, pi2*(i+1));
        }
        ctx.lineTo(x + w/2, y - h/2 + th)
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        for(var i = 0; i < arcs.length; i++) {
            ctx.arc(arcs[i][0], arcs[i][1], r, pi2*i, pi2*(i+1));
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = 'black';
        for(var i in this.in_points) {
            // points
            var point = this.in_points[i];
            ctx.beginPath();
            ctx.arc(x - w/2 + point[0], y - h/2 + point[1], 3, 0, Math.PI*2);
            ctx.fill();
            //links
            var link = this.in_links[i];
            link.calc('*', this.realInPoint(point), false);
            link.draw();
        }
        for(var i in this.out_points) {
            //point
            var point = this.out_points[i];
            ctx.beginPath();
            ctx.arc(x + w/2 - point[0], y - h/2 + point[1], 3, 0, Math.PI*2);
            ctx.fill();
            //links
            var links = this.out_links[i];
            for(var j = 0; j < links.length; j++) {
                var link = links[j];
                link.calc('*', false, this.realOutPoint(point));
                link.draw();
            }
        }

        return this;
    };
    this.crossByPoint = function(pos) {
        var bx = this.boundingBox();
        return bx[0] < pos[0] && bx[1] > pos[0] && bx[2] < pos[1] && bx[3] > pos[1];
    };
    this.crossMoverByPoint = function(pos) {
        var bx = this.boundingBoxMover();
        return bx[0] < pos[0] && bx[1] > pos[0] && bx[2] < pos[1] && bx[3] > pos[1];
    };
    this.realInPoint = function(i) {
        var x_step = this.x - this.w/2;
        var y_step = this.y - this.h/2;
        var point = (Array.isArray(i)) ? i : this.in_points[i];
        return [
            point[0] + x_step,
            point[1] + y_step
        ];
    };
    this.realOutPoint = function(i) {
        var x_step = this.x + this.w/2;
        var y_step = this.y - this.h/2;
        var point = (Array.isArray(i)) ? i : this.in_points[i];
        return [
            x_step - point[0],
            point[1] + y_step
        ];
    };
    this.crossInPoint = function(pos) {
        var x_step = this.x - this.w/2;
        var y_step = this.y - this.h/2;
        for(var i in this.in_points) {
            var point = this.in_points[i];
            var real_point = [point[0] + x_step, point[1] + y_step];
            if(real_point[0] + 5 > pos[0] && real_point[0] - 5 < pos[0] &&
               real_point[1] + 5 > pos[1] && real_point[1] - 5 < pos[1]) {
                return [real_point, this.in_links[i]];
            } 
        }
        return false;
    };
    this.crossOutPoint = function(pos) {
        var x_step = this.x + this.w/2;
        var y_step = this.y - this.h/2;
        for(var i in this.out_points) {
            var point = this.out_points[i];
            var real_point = [x_step - point[0], point[1] + y_step];
            if(real_point[0] + 5 > pos[0] && real_point[0] - 5 < pos[0] &&
               real_point[1] + 5 > pos[1] && real_point[1] - 5 < pos[1]) {
                return [real_point, this.out_links[i]];
            } 
        }
        return false;
    };
    this.boundingBox = function() {
        return [
            this.x - this.w/2, // min x
            this.x + this.w/2, // max x
            this.y - this.h/2, // min y
            this.y + this.h/2  // max y
        ]
    };
    this.boundingBoxMover = function() {
        return [
            this.x - this.w/2, // min x
            this.x + this.w/2, // max x
            this.y - this.h/2, // min y
            this.y - this.h/2 + this.th  // max y
        ]
    };
    this.addInPoint = function() {
        this.in_points.push([10, this.in_points.length * 13 + this.th + 10]);
        this.in_links[this.in_links.push(new Link()) - 1].setIn(this).id = this.in_links.length - 1;
        return this;
    };
    this.addOutPoint = function() {
        this.out_points.push([10, this.out_points.length * 13 + this.th + 10]);
        this.out_links.push([]);
        return this;
    };
    this.clone = function() {
        var res = new Block(this.x, this.y);
        // res.in_points = this.in_points;
        // res.out_points = this.out_points;
        // res.in_links = this.in_links;
        for(var i = 0; i < this.in_points.length; i++) {
            res.addInPoint();
        }
        for(var i = 0; i < this.out_points.length; i++) {
            res.addOutPoint();
        }
        return res;
    };
}

function Link() {
    this.i = 0;
    this._points = [];
    this.ctx = ctx.layer();
    this._in = false;
    this._out = [];

    this.addOut = function(out) {
        this._out.push(out);
        this._points.push([[0,0], [0,0]]);
        return this;
    };

    this.setOut = function(out) {
        this._out[this._out.length - 1] = out;
        return this._out.length - 1;
    };

    this.setIn = function(_in) {
        this._in = _in;
        return this;
    };

    this.calc = function(i, start, end) {
        if(i === 'last') {
            i = this._out.length - 1;
        }
        if(i === '*') {
            for(var i = 0; i < this._points.length; i++) {
                var points = this._points[i];
                if(!points.length) {
                    return;
                }
                if(points.length < 4) {
                    points.length = 4;
                }
                if(start) {
                    points[0] = start;
                }
                if(end) {
                    points[points.length - 1] = end;
                }
                points[1] = points[0];
                points[points.length - 2] = points[points.length - 1];

                var k1 = [
                    (points[2][0] - points[0][0]),
                    (points[2][1] - points[0][1])
                ];
        
                var k2 = [
                    (points[points.length - 3][0] - points[points.length - 1][0]),
                    (points[points.length - 3][1] - points[points.length - 1][1])
                ];
        
                var point1 = [
                    points[0][0]+k1[0]/4, 
                    points[0][1]+k1[1]/5
                ];
                var point2 = [
                    points[points.length - 1][0]+k2[0]/4, 
                    points[points.length - 1][1]+k2[1]/5
                ];
        
                points[1] = point1;
                points[points.length - 2] = point2;
            }
        } else {
            var points = this._points[i];
            if(points.length < 4) {
                points.length = 4;
            }
            if(start) {
                points[0] = start;
            }
            if(end) {
                points[points.length - 1] = end;
            }
            points[1] = points[0];
            points[points.length - 2] = points[points.length - 1];
    
            var k1 = [
                (points[2][0] - points[0][0]),
                (points[2][1] - points[0][1])
            ];
    
            var k2 = [
                (points[points.length - 3][0] - points[points.length - 1][0]),
                (points[points.length - 3][1] - points[points.length - 1][1])
            ];
    
            var point1 = [
                points[0][0]+k1[0]/4, 
                points[0][1]+k1[1]/5
            ];
            var point2 = [
                points[points.length - 1][0]+k2[0]/4, 
                points[points.length - 1][1]+k2[1]/5
            ];
    
            points[1] = point1;
            points[points.length - 2] = point2;
        }
    };

    this.draw = function() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for(var i in this._out) {
            var points = this._points[i];
            
            ctx.beginPath();
            ctx.spline(points);
            ctx.stroke();

            for(var i in points) {
                ctx.beginPath();
                ctx.arc(points[i][0], points[i][1], 3, 0, Math.PI*2);
                ctx.fill();
            }
        }
    };

    this.destroy = function() {
        // this.ctx.destroy(); TODO: realese in layers lib
        this.ctx.canvas.parentNode.removeChild(this.ctx.canvas);
        delete this
    };
}
