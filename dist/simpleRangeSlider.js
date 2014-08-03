;(function($, window, document){

    "use strict";

    var $document = $(document),
        instanceCounter = 0,
        isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints,
        pointerDown = isTouch ? 'touchstart' : 'mousedown',
        pointerUp = isTouch ? 'touchend' : 'mouseup',
        pointerMove = isTouch ? 'touchmove' : 'mousemove';

    var paddNum = function(num, padsize){

        if ( num.toString().length > padsize ) { return num; }
        else { return new Array(padsize - num.toString().length + 1 ).join('0') + num; }

    };

    function SimpleRangeSlider(input, options){

        this.$input = $(input);
        this.options = $.extend({}, $.simpleRangeSlider.defaults, options);
        this.init();

    }

   $.extend(SimpleRangeSlider.prototype, {

        init: function(){

            this.maxVal = parseFloat(this.$input.attr('max')) || this.options.maxVal;
            this.minVal = parseFloat(this.$input.attr('min')) || this.options.minVal;
            this.currentVal = parseFloat(this.$input.val()) || this.options.minVal;
            this.step = parseFloat(this.$input.attr('step')) || this.options.step;
            this.labelSufix = this.$input.data('label-sufix') || this.options.labelSufix;
            this.ens = '.simpleRangeSlider' + ( ++instanceCounter );

            this.currentPercentage = this.currentVal === 0 ? 0 : (this.currentVal - this.minVal + 1) / (this.maxVal - this.minVal + 1);

            this.$input.val(this.currentVal);

            this.generateHtml();
            this.updateView();
            this.events();

        },

        generateHtml: function(){

            var options = this.options;

            this.$el = $('<div>').addClass(options.wrapClass);
            this.$track = $('<div>').addClass(options.trackClass).appendTo(this.$el);
            this.$handle = $('<div>').addClass(options.handleClass).appendTo(this.$track);

            this.$minEndpoint = $('<div>').html(this.minVal + this.labelSufix).addClass(options.minEndPointClass).appendTo(this.$el);
            this.$maxEndpoint = $('<div>').html(this.maxVal + this.labelSufix).addClass(options.maxEndPointClass).appendTo(this.$el);

            this.$valueLabel = $('<div>').addClass(options.handleLabelClass);
            options.labelDetached ? this.$valueLabel.appendTo(this.$el) : this.$valueLabel.appendTo(this.$handle);

            this.$el.insertAfter(this.$input);
            this.$input.detach().appendTo(this.$el);

            return this;

        },

        events: function(){

            var self = this;

            this.$handle.on(pointerDown, function(){

                self.$el.addClass(self.options.activeClass);
                self.oldVal = parseFloat(self.$input.val());
                self.getDimensions();

                $document.on(pointerMove + self.ens, function(e){

                    e.preventDefault();
                    self.getViewVars( e.pageX || e.originalEvent.touches[0].pageX  ).updateView();

                }).one(pointerUp + self.ens, function(){

                    $document.off(pointerMove + self.ens);
                    self.$el.removeClass(self.options.activeClass);

                    if (self.oldVal !== self.currentVal){

                        self.$input.trigger('change');

                    }

                });

            });

            this.$input.on('keyup'+this.ens, function(){

                self.setValue(self.$input.val());

            });

        },

        getDimensions: function(){

            this.trackOffsetX = this.$track.offset().left;
            this.trackSize = this.$track.outerWidth();

        },

        getViewVars: function(pageX){

            var val = pageX - this.trackOffsetX,
                offsetPercentage = 0;

            if ( val > this.trackSize ) { offsetPercentage = 1; }
            else if ( val < 0 ) { offsetPercentage = 0; }
            else { offsetPercentage = val / this.trackSize; }

            var temp = Math.round((this.maxVal - this.minVal) * offsetPercentage);

            this.currentVal = (temp - temp % this.step) + parseInt(this.minVal);
            this.currentPercentage = offsetPercentage;

            return this;

        },

        updateView: function(){

            var val = this.options.paddval ? paddNum(this.currentVal, this.maxVal.toString().length ) : this.currentVal;

            this.$handle.css({'left': (this.currentPercentage * 100) + '%'});
            this.$input.val(val);
            this.$valueLabel.html(val + this.labelSufix);
            this.options.onUpdateView && this.options.onUpdateView(val, this);

            return this;

        },

        setValue: function(value){

            this.currentVal = value;
            this.currentPercentage = this.currentVal / this.maxVal;
            this.updateView();

            return this;

        }

    });

    $.simpleRangeSlider = SimpleRangeSlider;

    $.simpleRangeSlider.defaults = {
        'activeClass': 'active',
        'wrapClass': 'srsWrap',
        'trackClass': 'srsTrack',
        'handleClass': 'srsHandle',
        'handleLabelClass': 'srsHandleLabel',
        'minEndPointClass': 'srsEndpoint srsMin',
        'maxEndPointClass': 'srsEndpoint srsMax',

        'minVal': 0,
        'maxVal': 100,
        'step': 1,

        'labelSufix': '',
        'labelDetached': false,

        'paddval': true

    };

    $.fn.simpleRangeSlider = function(options){
        return this.each(function () {
            if (!$.data(this, 'simpleRangeSlider')) {
                $.data(this, 'simpleRangeSlider', new SimpleRangeSlider(this, options));
            }
        });
    };

})( window.jQuery || window.Zepto, window, document);