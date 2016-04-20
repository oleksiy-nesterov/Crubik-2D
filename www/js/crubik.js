Crubik = function(options){
    var
    self      = this,
    isInit    = false,
    isShuffle = false,
    magnetic  = null,
    swipeData = null,
    refresh   = true,
    jsSufix   = (/webkit/i).test(navigator.appVersion) ? 'webkit' : (/firefox/i).test(navigator.userAgent) ? 'Moz' : (/msie/i).test(navigator.userAgent) ? 'ms' : 'opera' in window ? 'O' : '',
    isMobile  = navigator.userAgent.match(/iphone|ipad|ipod|android|blackberry|opera mini|iemobile|mobile/i),
    colors    = [
        '#F21634', '#F21634', '#F21634',    '#01C117', '#01C117', '#01C117',    '#DF6F1D', '#DF6F1D', '#DF6F1D',
        '#F21634', '#F21634', '#F21634',    '#01C117', '#01C117', '#01C117',    '#DF6F1D', '#DF6F1D', '#DF6F1D',
        '#F21634', '#F21634', '#F21634',    '#01C117', '#01C117', '#01C117',    '#DF6F1D', '#DF6F1D', '#DF6F1D',

        '#0E64D0', '#0E64D0', '#0E64D0',    '#FFFE01', '#FFFE01', '#FFFE01',    '#FFFFFF', '#FFFFFF', '#FFFFFF',
        '#0E64D0', '#0E64D0', '#0E64D0',    '#FFFE01', '#FFFE01', '#FFFE01',    '#FFFFFF', '#FFFFFF', '#FFFFFF',
        '#0E64D0', '#0E64D0', '#0E64D0',    '#FFFE01', '#FFFE01', '#FFFE01',    '#FFFFFF', '#FFFFFF', '#FFFFFF'
    ];

    self.options       = options;
    self.stage         = {};
    self.stage.canvas  = document.createElement('canvas');
    self.stage.context = self.stage.canvas.getContext('2d');
    self.cols          = self.options.cols || 9;
    self.rows          = self.options.rows || 6;
    self.size          = {width:0, height:0};
    self.sectors       = [];
    document.body.appendChild(self.stage.canvas);

    self.storage = {
        is: function(){
            return Boolean(window['localStorage'] || false);
        },
        save: function(key, value){
            if(!this.is){return false;};
            try{
                localStorage.setItem(key, value);
            }catch(e){
                // 5 MB quota
            };
        },
        load: function(key){
            if(!this.is){return null;};
            return localStorage.getItem(key);
        }
    };
    self.artists = {
        basic: function(context, isSwipe, transform){
            if(!this.stage.isRendered){
                var c = this.stage.context;
                c.save();
                c.globalAlpha = 0.5;
                c.lineWidth = 1;
                c.strokeStyle = c.fillStyle = isSwipe ? 'red' : 'lime';
                c.textAlign = 'center';
                c.textBaseline = 'middle';
                c.font = 'bold ' + Math.min(this.widthDiv2, this.heightDiv2) + 'px sans-serif';
                c.clearRect(0, 0, this.width, this.height);
                c.beginPath();
                c.rect(0, 0, this.width, this.height);
                c.stroke();
                c.fillText(this.index, this.widthDiv2, this.heightDiv2);
                c.restore();
                this.stage.isRendered = true;
            };
        },
        crubik: function(context, isSwipe, transform){
            if(!this.stage.isRendered){
                var c = this.stage.context;
                c.save();
                c.lineWidth = Math.max(this.width, this.height) / 12;
                c.strokeStyle = c.fillStyle = 'black';
                c.clearRect(0, 0, this.width, this.height);
                c.fillStyle = colors[this.index];
                c.fillRect(0, 0, this.width, this.height);
                c.beginPath();
                c.rect(0, 0, this.width, this.height);
                c.stroke();
                c.restore();
                this.stage.isRendered = true;
            };
        },
        crubik2: function(context, isSwipe, transform){
            var colorLuminance = function(h, l){
                l = l || 0;
                h = String(h).replace(/[^0-9a-f]/gi, '');
                h.length < 6 && (h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]);
                var rgb = '#', c, i;
                for(i = 0; i < 3; i++){
                    c = parseInt(h.substr(i * 2, 2), 16);
                    c = Math.round(Math.min(Math.max(0, c + (c * l)), 255)).toString(16);
                    rgb += ('00' + c).substr(c.length);
                };
                return rgb;
            };
            var roundRect = function(c, x, y, w, h, r){
                if (w < 2 * r) r = w / 2;
                if (h < 2 * r) r = h / 2;
                c.beginPath();
                c.moveTo(x + r, y);
                c.arcTo(x + w, y, x + w, y + h, r);
                c.arcTo(x + w, y+h, x, y + h, r);
                c.arcTo(x, y + h, x, y, r);
                c.arcTo(x, y, x + w, y, r);
                c.stroke();
            };

            if(!this.stage.isRendered){
                var g, c = this.stage.context;
                c.save();
                c.lineWidth = Math.max(this.width, this.height) / 12;
                c.clearRect(0, 0, this.width, this.height);
                c.fillStyle = colors[this.index];
                c.fillRect(0, 0, this.width, this.height);

                //var g = c.createLinearGradient(0, 0, 0, this.height);
                //g.addColorStop(0.5, 'transparent');
                //g.addColorStop(0.5, colorLuminance(colors[this.index], -0.1));
                //g.addColorStop(1, colorLuminance(colors[this.index], 0.2));

                g = c.createRadialGradient(this.width / 2, 0, 0, this.width / 2, 0, this.width * 2);
                g.addColorStop(0, colorLuminance(colors[this.index], 0.3));
                g.addColorStop(1, 'transparent');
                c.fillStyle = g;
                c.fillRect(0, 0, this.width, this.height);

                c.lineWidth += 2;

                var g = c.createLinearGradient(0, 0, 0, this.height);
                g.addColorStop(0, colorLuminance(colors[this.index], 0.7));
                g.addColorStop(1, 'transparent');
                c.strokeStyle = g;
                roundRect(c, 0, 0, this.width, this.height, c.lineWidth);

                var g = c.createLinearGradient(0, 0, 0, this.height);
                g.addColorStop(0.5, 'transparent');
                g.addColorStop(1, colorLuminance(colors[this.index], -0.8));
                c.strokeStyle = g;
                roundRect(c, 0, 0, this.width, this.height, c.lineWidth);

                c.lineWidth -= 2;

                c.strokeStyle = '#242424';
                roundRect(c, 0, 0, this.width, this.height, c.lineWidth);
                c.restore();
                this.stage.isRendered = true;
            };
        }
    };
    self.info = function(x, y){
        var r = {col:0, row:0, colSectors:[], rowSectors:[]};
        r.col = Math.ceil(x / self.size.width) - 1;
        r.row = Math.ceil(y / self.size.height) - 1;
        for(var y = 0; y < self.rows; y++){
            r.colSectors.push(self.sectors[y * self.cols + r.col]);
        };
        for(var x = 0; x < self.cols; x++){
            r.rowSectors.push(self.sectors[r.row * self.cols + x]);
        };
        return r;
    };
    self.render = function(){
        var easeOutBack = function(t, b, c, d, s){
            s = s == undefined ? 1.70158 : s;
            return c * ((t = t / d - 1) * t * (( s + 1) * t + s) + 1) + b;
        };
        if(swipeData || refresh){
            refresh = false;
            var s, t = {x:0, y:0, xTrans:0, yTrans:0};
            if(swipeData){
                if(swipeData.swipe.direction == 'horisontal'){
                    t.x = -swipeData.swipe.offset;
                    t.xTrans = self.stage.canvas.width;
                    s = swipeData.info.rowSectors;
                }else{
                    t.y = -swipeData.swipe.offset;
                    t.yTrans = self.stage.canvas.height;
                    s = swipeData.info.colSectors;
                };
            }else{
                s = self.sectors;
            };
            for(var i in s){s[i].render.call(s[i], self.stage.context, !!swipeData, t);};
            if(magnetic){
                magnetic.moveTime++;
                swipeData.swipe.offset = magnetic.moveFrom + easeOutBack(magnetic.moveTime, 0, magnetic.moveOffset, magnetic.moveDuration) * magnetic.moveDir;
                (magnetic.moveTime >= magnetic.moveDuration) && magnetic.call();
            };
        };
        window.requestAnimFrame(self.render, self.stage.canvas);
        return self;
    };
    self.resize = function(){
        self.init();
        document.body.scrollX = document.body.scrollY = document.body.scrollLeft = document.body.scrollTop = 0;
        self.stage.canvas.style.margin = '0 auto';
        self.stage.canvas.style.top = '50%';
        self.stage.canvas.style.marginTop = -(self.stage.canvas.height / 2 >> 0) + 'px';
        return self;
    };
    self.save = function(){
        self.storage.save('Crubik2D', self.sectors.toString());
        return self;
    };
    self.check = function(){
        var tmp0 = '', tmp1, tmp2;
        for(var i in self.sectors){tmp0 += colors[self.sectors[i].index];};
        tmp0 = tmp0.match(/.{1,63}/g);
        tmp1 = tmp0[0].match(/.{1,7}/g);
        tmp2 = tmp0[3].match(/.{1,7}/g);
        return (
            (tmp0[0] == tmp0[1] && tmp0[1] == tmp0[2] && tmp0[3] == tmp0[4] && tmp0[4] == tmp0[5]) &&
            (tmp1[0] == tmp1[1] && tmp1[1] == tmp1[2]) &&
            (tmp2[0] == tmp2[1] && tmp2[1] == tmp2[2])
        );
    };
    self.load = function(data){
        data = data || self.storage.load('Crubik2D');
        if(!data){return self;};
        data = data.split(/,/g);
        for(var i in self.sectors){self.sectors[i].index = data[i] != undefined ? data[i] : self.sectors[i].i;};
        return self;
    };
    self.reset = function(){
        for(var i in self.sectors){
            self.sectors[i].index = self.sectors[i].i;
            self.sectors[i].stage.isRendered = false;
        };
        self.save();
        refresh = true;
        self.options.onReset && self.options.onReset();
        return self;
    };
    self.shuffle = function(iterations){
        if(isShuffle){return;};
        iterations = iterations || 10;
        var nextIteration = function(){
            var data = {
                x: Math.random() * self.stage.canvas.width >> 0,
                y: Math.random() * self.stage.canvas.height >> 0,
                onSwipe: function(){
                    --iterations;
                    isShuffle = false;
                    iterations ? nextIteration() : (self.options.onEndShuffle && self.options.onEndShuffle());
                }
            };
            if(Math.random() > 0.5){
                data.direction = 'horisontal';
                data.offset = Math.random() * (self.stage.canvas.width - self.size.width * 2) + self.size.width * 2;
            }else{
                data.direction = 'vertical';
                data.offset = Math.random() * (self.stage.canvas.height - self.size.height * 2) + self.size.height * 2;
            };
            data.velocity = data.offset / 250 + 0.5;
            data.offset *= Math.random() > 0.5 ? -1 : 1;
            var f = document.createEvent('Events');
            f.initEvent('swipeend', true, true);
            f.swipe = data;
            isShuffle = true;
            self.stage.canvas.dispatchEvent(f);
        };
        self.options.onStartShuffle && self.options.onStartShuffle();
        nextIteration();
        return self;
    };
    self.swipe = function(e){
        if(magnetic){return;};
        swipeData = swipeData || {info: self.info(e.swipe.x, e.swipe.y)};
        swipeData.swipe = e.swipe;
        var s = swipeData.info[e.swipe.direction == 'horisontal' ? 'rowSectors' : 'colSectors'];
        switch(e.type){
            case 'swipestart':
                for(var i in s){s[i].stage.isRendered = false;};
            break;
            case 'swipemove':

            break;
            case 'swipeend':
                var v = swipeData.swipe.velocity > 1 ? swipeData.swipe.velocity : 1;
                var d = swipeData.swipe.direction == 'horisontal' ? self.size.width : self.size.height;
                var c = Math.abs(swipeData.swipe.offset / d * v);
                c = v > 1 ? Math.ceil(c) : Math.round(c);
                c = Math.min(swipeData.swipe.direction == 'horisontal' ? self.cols * 2 - 1 : self.rows * 2 - 1, c);
                c *= (swipeData.swipe.offset > 0 ? 1 : -1);
                magnetic = {
                    moveFrom: swipeData.swipe.offset,
                    moveDelta: c,
                    moveTo: c * d,
                    moveDuration: Math.round(20 * v),
                    moveTime: 0,
                    call: function(){
                        var dump = [].concat(s, s, s, s, s).map(function(e){return e.index});
                        for(var i = 0, l = s.length; i < l; i++){
                            s[i].stage.isRendered = false;
                            s[i].index = dump[l * 2 + i + c];
                        };
                        self.save();
                        refresh = true;
                        magnetic = null;
                        swipeData = null;
                        !isShuffle && self.options.onTurn && self.options.onTurn();
                        setTimeout(function(){
                            e.swipe.onSwipe && e.swipe.onSwipe();
                            e.swipe = null;
                        }, 1);
                    }
                };
                magnetic.moveDir = magnetic.moveTo > magnetic.moveFrom ? 1 : -1;
                magnetic.moveOffset = Math.abs(magnetic.moveTo - magnetic.moveFrom);
            break;
        };
        return self;
    };
    self.init = function(){
        self.size = {};
        self.stage.canvas.width = self.options.width || 900; //isMobile ? window.innerWidth : self.options.width || 900;
        self.size.width = self.stage.canvas.width / self.cols;
        self.stage.canvas.height = self.size.width * self.rows;
        self.size.height = self.stage.canvas.height / self.rows;

        var sector = function(x, y, w, h){
            var s = this;
            s.x             = x;
            s.y             = y;
            s.i             = y * self.cols + x;
            s.index         = s.i;
            s.artist        = self.artists.crubik2;
            s.stage         = {};
            s.stage.canvas  = document.createElement('canvas');
            s.stage.context = s.stage.canvas.getContext('2d');
            s.render = function(context, isSwipe, transform){
                var x = s.left + transform.x, y = s.top + transform.y;
                s.artist.call(s, context, isSwipe, transform);
                context.clearRect(x, y, s.width, s.height);
                context.drawImage(s.stage.canvas, x, y);
                if(isSwipe){
                    x += transform.xTrans; y += transform.yTrans;
                    context.clearRect(x, y, s.width, s.height);
                    context.drawImage(s.stage.canvas, x, y);
                    x += transform.xTrans; y += transform.yTrans;
                    context.clearRect(x, y, s.width, s.height);
                    context.drawImage(s.stage.canvas, x, y);
                    x -= transform.xTrans * 3; y -= transform.yTrans * 3;
                    context.clearRect(x, y, s.width, s.height);
                    context.drawImage(s.stage.canvas, x, y);
                    x -= transform.xTrans; y -= transform.yTrans;
                    context.clearRect(x, y, s.width, s.height);
                    context.drawImage(s.stage.canvas, x, y);
                };
            };
            s.setup = function(w, h){
                s.stage.isRendered    = false;
                s.left                = s.x * w;
                s.top                 = s.y * h;
                s.width               = w;
                s.height              = h;
                s.widthDiv2           = w / 2;
                s.heightDiv2          = h / 2;
                s.stage.canvas.width  = s.width;
                s.stage.canvas.height = s.height;
            };
            s.toString = function(){
                return s.index;
            };
            s.setup(w, h);
        };
        if(!isInit){
            var data = null;
            var traceEvent = function(e){
                if(e.layerX != undefined){
                    return {x:e.layerX, y:e.layerY};
                };
                var m, x = 0, y = 0, el = self.stage.canvas;
                do{
                    m = getComputedStyle(el, null)[jsSufix + 'Transform'].replace(/[^0-9-.,]/g, '').split(',');
                    x += (m[4] ? parseInt(m[4], 10) : 0) + el.offsetLeft;
                    y += (m[5] ? parseInt(m[5], 10) : 0) + el.offsetTop;
                }while(
                    el = el.offsetParent
                );
                return {x:e.pageX - x, y:e.pageY - y};
            };
            var menu = function(e){
                if(e.type == 'dblclick' || (e.touches || e.targetTouches || e.changedTouches || []).length == 2){
                    self.options.onMenu && self.options.onMenu();
                    e.stopPropagation && e.stopPropagation();
                    e.preventDefault && e.preventDefault();
                    e.cancelBubble = true;
                    e.returnValue = false;
                    return false;
                };
            };
            var touch = function(e){
                if(isShuffle){return;}
                var
                dx = dy = 0,
                f  = document.createEvent('Events'),
                t  = e.touches || e.targetTouches || e.changedTouches; t = t && t.length ? t[0] : e,
                xy = traceEvent(t);
                switch(e.type){
                    case 'mousedown':
                    case 'touchstart':
                        data = {
                            x         : xy.x,
                            y         : xy.y,
                            offset    : 0,
                            direction : '',
                            velocity  : 0,
                            time      : new Date().getTime()
                        };
                    break;
                    case 'mousemove':
                    case 'touchmove':
                        if(!data){return;};
                        dx = data.x - xy.x;
                        dy = data.y - xy.y;
                        if(!data.direction){
                            if(Math.sqrt(Math.pow(dx - dy, 2)) > 5){
                                data.direction = Math.abs(dx) > Math.abs(dy) ? 'horisontal' : 'vertical';
                                f.initEvent('swipestart', true, true);
                            }else{
                                return;
                            };
                        }else{
                            f.initEvent('swipemove', true, true);
                        };
                        data.offset = data.direction == 'horisontal' ? dx : dy;
                        data.velocity =  Math.abs(data.offset) / (new Date().getTime() - data.time);
                        f.swipe = data;
                        e.target.dispatchEvent(f);
                    break;
                    case 'mouseup':
                    case 'touchcancel':
                    case 'touchend':
                        if(!data || !data.direction || data.offset == 0){
                            data = null;
                            return;
                        };
                        data.velocity = Math.abs(data.offset) / (new Date().getTime() - data.time);
                        f.initEvent('swipeend', true, true);
                        f.swipe = data;
                        self.stage.canvas.dispatchEvent(f);
                        data = null;
                    break;
                };
            };
            if(isMobile){
                window.addEventListener('touchstart', menu, false);
                window.addEventListener('touchend', touch, false);
                window.addEventListener('touchcancel', touch, false);
                self.stage.canvas.addEventListener('touchstart', touch, false);
                self.stage.canvas.addEventListener('touchmove', touch, false);
                window.addEventListener('touchmove', function(e){
                    if(e.target.tagName != 'CANVAS'){return;};
                    e.stopPropagation && e.stopPropagation();
                    e.preventDefault && e.preventDefault();
                    e.cancelBubble = true;
                    e.returnValue = false;
                    return false;
                });
                //window.addEventListener('resize', self.resize, false);
            }else{
                window.addEventListener('dblclick', menu, false);
                window.addEventListener('mouseup', touch, false);
                self.stage.canvas.addEventListener('mousedown', touch, false);
                self.stage.canvas.addEventListener('mousemove', touch, false);
            };
            self.stage.canvas.addEventListener('swipestart', self.swipe, false);
            self.stage.canvas.addEventListener('swipemove', self.swipe, false);
            self.stage.canvas.addEventListener('swipeend', self.swipe, false);

            self.sectors = [];
            for(var y = 0; y < self.rows; y++){
                for(var x = 0; x < self.cols; x++){
                    self.sectors.push(new sector(x, y, self.size.width, self.size.height));
                };
            };

            window.requestAnimFrame = (function(){
                return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback, element){window.setTimeout(callback, 1000 / 60);};
            })();

            document.body.classList.add(isMobile ? 'mobile' : 'desktop');
            isInit = true;
        }else{
            for(var i in self.sectors){
                self.sectors[i].setup(self.size.width, self.size.height);
            };
        };

        self.stage.canvas.style.margin = '0 auto';
        self.stage.canvas.style.top = '50%';
        self.stage.canvas.style.marginTop = -(self.stage.canvas.height / 2 >> 0) + 'px';

        self.load();
        refresh = true;
        return self;
    };
    self.init().render();
    return self;
};