
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
                            .addOutPoint().addOutPoint().addOutPoint().addOutPoint().draw()
];

for(var i = 0; i < 30; i++) {
    blocks.push(blocks[0].clone().draw());
}

var step = false;
var block = false;
ctx.handle('mousedown', function(e) {
    var pos = [e.layerX, e.layerY];
    for(var i in blocks) {
        if(blocks[i].crossMoverByPoint(pos)) {
            block = blocks[i];
            step = [block.x - e.layerX, block.y - e.layerY]
            return;
        }
    }
});
ctx.handle('mouseup',   function(e) {
    step = false;
    block = false;
});
ctx.handle('mousemove', function(e) {
    if(block && step) {
        block.x = e.layerX + step[0];
        block.y = e.layerY + step[1];
        block.draw();
    }
});

function Block(x, y) {
    this.ctx = ctx.layer();
    this.x = x;
    this.y = y;
    this.w = 150;
    this.h = 80;
    this.th = 20;

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
        var i = 0

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
        for(let i in this.in_points) {
            var point = this.in_points[i];
            ctx.beginPath();
            ctx.arc(x - w/2 + point[0], y - h/2 + point[1], 3, 0, Math.PI*2);
            ctx.fill();
        }
        for(let i in this.out_points) {
            var point = this.out_points[i];
            ctx.beginPath();
            ctx.arc(x + w/2 - point[0], y - h/2 + point[1], 3, 0, Math.PI*2);
            ctx.fill();
        }

        return this;
    };
    this.crossMoverByPoint = function(pos) {
        var bx = this.boundingBoxMover();
        return bx[0] < pos[0] && bx[1] > pos[0] && bx[2] < pos[1] && bx[3] > pos[1];
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
        return this;
    };
    this.addOutPoint = function() {
        this.out_points.push([10, this.out_points.length * 13 + this.th + 10]);
        return this;
    };
    this.clone = function() {
        var res = new Block(this.x, this.y);
        res.in_points = this.in_points;
        res.out_points = this.out_points;
        return res;
    };
}
