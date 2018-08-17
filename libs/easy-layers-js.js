
(function() {
    this.handles = [];
    this.layers = [];
    this.ctxes = [];

    this.addHandler = function(ctx) {
        var id = this.ctxes.push(ctx) - 1;
        ctx.canvas.parentNode.style.position = 'relative';

        var handler = document.createElement('div');
        handler.style['position'] = 'absolute';
        handler.style['left']     = ctx.canvas.offsetLeft + 'px';
        handler.style['top']      = ctx.canvas.offsetTop + 'px';
        handler.style['width']    = ctx.canvas.width + 'px';
        handler.style['height']   = ctx.canvas.height + 'px';
        this.handles.push(handler)
        if(ctx.canvas.nextSibling) {
            ctx.canvas.parentNode.insertBefore(handler, ctx.canvas.nextSibling);
        } else {
            ctx.canvas.parentNode.appendChild(handler);
        }

        return id;
    };

    var self = this;

    CanvasRenderingContext2D.prototype.layer = function() {
        var id = self.ctxes.indexOf(this);

        if(id === -1) {
            id = self.addHandler(this);
        }

        var res = document.createElement('canvas');
        res.width = this.canvas.width;
        res.height = this.canvas.height;
    
        res.style['position'] = 'absolute';
        res.style['left']     = this.canvas.offsetLeft + 'px';
        res.style['top']      = this.canvas.offsetTop + 'px';
    
        this.canvas.parentNode.insertBefore(res, self.handles[id]);
    
        return res.getContext('2d');
    };

    CanvasRenderingContext2D.prototype.handle = function(type, event) {
        var id = self.ctxes.indexOf(this);
        if(id === -1) {
            id = self.addHandler(this);
        }
        self.handles[id]['on' + type] = event;
    };
})();
