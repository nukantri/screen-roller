(function($){
    var InfluxAnimation = {

        init: function() {
            var module = this,
                roller = this.roller;

            roller.clearStylesAnimation = module.clearStylesAnimation.bind(module);
            roller.addStylesAnimation   = module.addStylesAnimation.bind(module);
            roller.selectTypeAnimation  = module.selectTypeAnimation.bind(module);
            roller.runFunctionAnimation = module.runFunctionAnimation.bind(module);

            module.options              = roller.options.modules['influx-animation'];

            module.options.axisMove     = module.setAxis();
            module.options.direction    = module.options['direction'] || 'from-right';
            module.listInitialPositions = module.getInitialPositions();
            module.reverseDirections    = module.getReverseDirections();
            module.cloneScreens         = [];

            module.addStylesAnimation();
            module.bindEventsInfluxAnimation();
            module.setDirection();
        },

        clearStylesAnimation: function() {
            var module = this,
                el = module.el,
                roller = module.roller,
                screens = roller.screens;

            el.removeClass('influx-animation');
            screens.attr('style', '');
            module.removeСlones();
        },

        addStylesAnimation: function() {
            var el = this.el;

            el.addClass('influx-animation');
        },

        getInitialPositions: function() {
            var transition  = this.roller.transition,
                transform3d = this.roller.transform3d;

            if(transition && transform3d) {
                return {
                    'from-bottom': 'translate3d(0, 100%, 0)',
                    'from-right':  'translate3d(100%, 0, 0)',
                    'from-left':   'translate3d(-100%, 0, 0)',
                    'from-top':    'translate3d(0, -100%, 0)'
                }
            } else {
                return {
                    'from-bottom': { top: '100%', left: 0 },
                    'from-right':  { top: 0, left: '100%' },
                    'from-left':   { top: 0, left: '-100%' },
                    'from-top':    { top: '-100%', left: 0 }
                }
            }
        },

        getReverseDirections: function() {
            return {
                'from-bottom': 'from-top',
                'from-right':  'from-left',
                'from-left':   'from-right',
                'from-top':    'from-bottom'
            }
        },

        setInitialPosition: function(direction) {
            var roller    = this.roller,
                positions = this.listInitialPositions,
                screens   = roller.screens;

            if(roller.transition && roller.transform3d) {
                screens.css('transform', positions[direction]);
            } else {
                screens.css(positions[direction]);
            }
        },

        bindEventsInfluxAnimation: function() {
            var module = this,
                el     = module.el;

            el.on('processTouchStart', function(e, data){

            });

            el.on('processTouchMove', function(e, data){

            });

            el.on('processTouchEnd', function(e, data){
                module.touchEndHandler(data);
            });

            el.on('processTouchCancel', function(e, data){

            });
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
                var direction = module.options.direction,
                    invertDir = { next: 'prev', prev: 'next' };

                if( direction === 'from-left' ||
                    direction === 'from-top'
                ) {
                    animateDir = invertDir[animateDir];
                }
                
                if(animateDir === 'prev' && currentScreen === 0) {
                    return;
                }

                if(animateDir === 'next' && currentScreen === countScreens) {
                    return;
                }

                return el.moveTo(animateDir, speed);
            }
        },

        removeСlones: function() {
            var module = this;

            $.each(module.cloneScreens, function(index, clone) {
                clone.remove();
            });

            module.cloneScreens = [];
        },

        setDirection: function(index) {
            var module  = this,
                roller  = module.roller,
                reverse = module.reverseDirections,
                direction = module.options.direction;

            if(index < roller.currentScreen) {
                direction = reverse[direction]
            }

            module.setInitialPosition(direction);
        },

        influxAnimateTransform: function(index, speed) {
            var module = this,
                roller = module.roller,
                el     = module.el;

            module.options.reverseAnimation && module.setDirection(index);

            if(speed === 0) {
                speed = 1;
            }

            var animateScreen = module.getCloneScreen(index);

            module.setClassClone(animateScreen);
            module.addCloneToRoller(animateScreen);
            module.addCloneToList(animateScreen);

            roller.beforeChangeSlide(index);

            module.setTransition(speed, animateScreen);

            setTimeout(function(){
                module.setTranform(animateScreen);
                module.offEndTransition();
                module.bindEndTransform(animateScreen, index);
            }, 50);
        },

        influxAnimateOffset: function(index, speed) {
            var module = this,
                roller = module.roller;

            module.options.reverseAnimation && module.setDirection(index);

            var animateScreen = module.getCloneScreen(index);

            module.setClassClone(animateScreen);
            module.addCloneToRoller(animateScreen);
            module.addCloneToList(animateScreen);

            roller.beforeChangeSlide(index);

            animateScreen.animate({ top: 0, left: 0 }, speed, function() {
                module.removeClone();
                roller.afterChangeSlide(index);
            });
        },

        getCloneScreen: function(index) {
            var roller = this.roller;

            return roller.screens.eq(index).clone();
        },

        addCloneToRoller: function(clone) {
            this.el.append(clone);
        },

        addCloneToList: function(target) {
            this.cloneScreens.push(target);
        },

        setClassClone: function(target) {
            target.addClass('clone');
        },

        setTransition: function(speed, target) {
            target.css('transition-duration', speed / 1000 + 's');
        },

        //todo -> core -> setTransform
        setTranform: function(target) {
            target.css('transform', 'translate3d(0, 0, 0)');
        },

        offEndTransition: function() {
            this.el.off('transitionend webkitTransitionEnd');
        },

        bindEndTransform: function(target, index) {
            var module = this,
                roller = module.roller;

            target.one('transitionend webkitTransitionEnd', function() {
                module.removeClone();
                roller.afterChangeSlide(index);
            });
        },

        removeClone: function() {
            var module = this,
                clones = module.cloneScreens;

            if(clones.length > 1) {
                clones[0].hide();

                // в webkit дергает экран при удалении нод
                // используем timeout для фикса этого бага
                setTimeout(function() {
                    clones[0] && clones[0].remove();
                    clones.shift();
                }, 1000);
            }
        },

        selectTypeAnimation: function(index, speed) {
            var module      = this,
                transition  = module.roller.transition,
                transform3d = module.roller.transform3d;

            if(transition && transform3d) {
                return module.influxAnimateTransform(index, speed);
            } else {
                return module.influxAnimateOffset(index, speed);
            }
        },

        runFunctionAnimation: function(index, speed) {
            return this.selectTypeAnimation(index, speed);
        },

        setAxis: function() {
            var direction = this.options.direction;

            if(direction === 'from-right' || direction === 'from-left') {
                return 'x';
            }

            if(direction === 'from-bottom' || direction === 'from-top') {
                return 'y';
            }
        }
    };

    $.fn['screenroller-influx-animation'] = function() {
        this.roller['module-influx-animation'] = $.extend({ el: this, roller: this.roller }, Object.create(InfluxAnimation));
        this.roller['module-influx-animation'].init();

        return this;
    };
}(jQuery));