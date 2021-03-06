(function($){
    var SlideAnimation = {

        init: function() {
            var module = this,
                roller = this.roller;

            roller.clearStylesAnimation = module.clearStylesAnimation.bind(module);
            roller.addStylesAnimation   = module.addStylesAnimation.bind(module);
            roller.selectTypeAnimation  = module.selectTypeAnimation.bind(module);
            roller.runFunctionAnimation = module.runFunctionAnimation.bind(module);

            module.addStylesAnimation();
            module.bindEventsBaseAnimation();
        },

        clearStylesAnimation: function() {
            var el = this.el,
                roller = this.roller,
                screens = roller.screens,
                axisMove = roller.options.axisMove;

            el.removeClass('base-animation');
            el.removeClass('axis-' + axisMove);
            el.attr('style', '');
            screens.css('left', 0);
        },

        addStylesAnimation: function() {
            var roller = this.roller,
                el     = this.el,
                screens = roller.screens,
                axisMove = roller.options.axisMove;

            el.addClass('base-animation');

            if(axisMove === 'x') {
                el.addClass('axis-x');
                screens.each(function(index) {
                    screens.eq(index).css({ left: 100 * index + '%' });
                });
            }

            if(axisMove === 'y') {
                el.addClass('axis-y');
            }
        },

        destruct: function(){
             //todo
        },

        bindEventsBaseAnimation: function() {
            var module = this,
                el = this.el;

            el.on('processTouchStart', function(e, data){
                module.touchStartHandler(data);
            });

            el.on('processTouchMove', function(e, data){
                module.touchMoveHandler(data);
            });

            el.on('processTouchEnd', function(e, data){
                module.touchEndHandler(data);
            });

            el.on('processTouchCancel', function(e, data){
                module.touchCancelHandler(data);
            });
        },

        touchStartHandler: function(data) {
            var module = this;

            module.saveStartTransform();
            module.setTransition(0);
            module.setTransform(module.startTranform);
        },

        touchMoveHandler: function(data) {
            var module = this,
                transformOffset = module.startTranform - data.offset;

            module.setTransform(transformOffset);
        },

        touchEndHandler: function(data) {
            var module = this,
                el     = module.el,
                roller = module.roller,

                currentScreen = roller.currentScreen,
                countScreens  = roller.countScreens - 1,
                speed         = roller.options.speedAnimation,

                animateDir     = data.animateDir,
                commonTouchDir = data.commonTouchDir,
                lastTouchDir   = data.lastTouchDir;

            if(commonTouchDir === lastTouchDir) {
                if(animateDir === 'prev' && currentScreen === 0) {
                    animateDir = currentScreen;
                }

                if(animateDir === 'next' && currentScreen === countScreens) {
                    animateDir = currentScreen;
                }
            } else {
                animateDir = currentScreen;
            }

            return el.moveTo(animateDir, speed);
        },

        touchCancelHandler: function() {
            var el     = this.el,
                roller = this.roller,
                speed  = roller.speedAnimation,
                currentScreen = roller.currentScreen;

            el.moveTo(currentScreen, speed);
        },

        baseAnimateTransform: function(index, speed) {
            var roller = this.roller,
                el = this.el,
                value = this.getTransitionByIndex(index);

            roller.beforeChangeSlide(index);

            el.css('transition-duration', speed / 1000 + 's');
            el.css('transform', value);

            el.off('transitionend webkitTransitionEnd');
            el.one('transitionend webkitTransitionEnd', function() {
                roller.afterChangeSlide(index);
            });
        },

        baseAnimateOffset: function(index, speed) {
            var roller = this.roller,
                el = this.el,
                value = this.getOffsetByIndex(index);

            roller.beforeChangeSlide(index);

            el.stop(false, false);
            el.animate(value, speed, function() {
                roller.afterChangeSlide(index);
            });
        },

        selectTypeAnimation: function(index, speed) {
            var roller = this.roller;

            if(roller.transition && roller.transform3d) {
                return this.baseAnimateTransform(index, speed);
            } else {
                return this.baseAnimateOffset(index, speed);
            }
        },

        runFunctionAnimation: function(index, speed) {
            return this.selectTypeAnimation(index, speed);
        },

        getTransitionByIndex: function(index) {
            var axisMove = this.roller.options.axisMove;

            if(axisMove === 'x') {
                return 'translate3d(' + index * -100 + '%, 0, 0)';
            }

            if(axisMove === 'y') {
                return 'translate3d(0, ' + index * -100 +'%, 0)';
            }
        },

        getOffsetByIndex: function(index) {
            var axisMove = this.roller.options.axisMove;

            if(axisMove === 'x') {
                return { left: index * -100 + '%' };
            }

            if(axisMove === 'y') {
                return { top: index * -100 + '%' };
            }
        },

        setTransform: function(value) {
            var axisMove = this.roller.options.axisMove,
                el = this.el;

            if(axisMove === 'x') {
                return el.css('transform', 'translate3d(' + value + 'px, 0, 0)');
            }

            if(axisMove === 'y') {
                return el.css('transform', 'translate3d(0,' + value +'px, 0)');
            }
        },

        setTransition: function(value) {
            this.el.css('transition', value + 's');
        },

        getTransform: function() {
            var module = this,
                roller = module.roller,
                value  = module.el.css('transform').split(', ');

            if(!value) {
                return 0;
            }

            if(roller.options.axisMove === 'x') {
                return parseInt(value[4]);
            } else {
                return parseInt(value[5]);
            }
        },

        saveStartTransform: function() {
            var module = this;

            module.startTranform = module.getTransform();
        }
    };

    $.fn['screenroller-slide-animation'] = function() {
        this.roller['module-slide-animation'] = $.extend({ el: this, roller: this.roller }, Object.create(SlideAnimation));
        this.roller['module-slide-animation'].init();

        return this;
    };
}(jQuery));