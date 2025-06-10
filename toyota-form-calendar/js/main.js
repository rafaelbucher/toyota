/* SWIPER JS */
var init = false;
var swiper;
function swiperCard() {
if (window.innerWidth <= 991) {
    if (!init) {
    init = true;
    swiper = new Swiper(".n-swiper", {
        autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 18,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
    }
} else if (init) {
    swiper.destroy();
    init = false;
}
}
swiperCard();
window.addEventListener("resize", swiperCard);

/* SWIPER LIST */
var swiper = new Swiper(".n-swiper-list", {          
  slidesPerView: 1,
  spaceBetween: 18,   
  navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
  },
  breakpoints: {
      479: {
          slidesPerView: 3,
          spaceBetween: 18,
          pagination: {
              el: '.swiper-pagination',
              type: 'bullets',
          },  
          navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
          }, 
      },
  }
});


/* POPPER TOOLTIPS */
const buttons = document.querySelectorAll('.n-button-tooltip');

buttons.forEach(function(button, index){
    const tooltip = document.querySelector('.n-tooltip');

    const popperInstance = Popper.createPopper(button, tooltip, {
        modifiers: [
            {
                name: 'offset',
                options: {
                offset: [0, 8],
                },
            },
        ],
    });
    
    function show() {
        // Make the tooltip visible
        tooltip.setAttribute('data-show', '');
    
        // Enable the event listeners
        popperInstance.setOptions((options) => ({
        ...options,
        modifiers: [
            ...options.modifiers,
            { name: 'eventListeners', enabled: true },
        ],
        }));
    
        // Update its position
        popperInstance.update();
    }
    
    function hide() {
        // Hide the tooltip
        tooltip.removeAttribute('data-show');
    
        // Disable the event listeners
        popperInstance.setOptions((options) => ({
        ...options,
        modifiers: [
            ...options.modifiers,
            { name: 'eventListeners', enabled: false },
        ],
        }));
    }
    
    const showEvents = ['mouseenter', 'focus'];
    const hideEvents = ['mouseleave', 'blur'];
    
    showEvents.forEach((event) => {
        button.addEventListener(event, show);
    });
    
    hideEvents.forEach((event) => {
        button.addEventListener(event, hide);
    });

})


/* BEGIN - CODE TO INSERT */
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

// File#: _1_progress-bar
// Usage: codyhouse.co/license
(function() {	
  var ProgressBar = function(element) {
    this.element = element;
    this.fill = this.element.getElementsByClassName('progress-bar__fill')[0];
    this.label = this.element.getElementsByClassName('progress-bar__value');
    this.value = getProgressBarValue(this);
    // before checking if data-animation is set -> check for reduced motion
    updatedProgressBarForReducedMotion(this);
    this.animate = this.element.hasAttribute('data-animation') && this.element.getAttribute('data-animation') == 'on';
    this.animationDuration = this.element.hasAttribute('data-duration') ? this.element.getAttribute('data-duration') : 1000;
    // animation will run only on browsers supporting IntersectionObserver
    this.canAnimate = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
    // this element is used to announce the percentage value to SR
    this.ariaLabel = this.element.getElementsByClassName('js-progress-bar__aria-value');
    // check if we need to update the bar color
    this.changeColor =  Util.hasClass(this.element, 'progress-bar--color-update') && Util.cssSupports('color', 'var(--color-value)');
    if(this.changeColor) {
      this.colorThresholds = getProgressBarColorThresholds(this);
    }
    initProgressBar(this);
    // store id to reset animation
    this.animationId = false;
  }; 

  // public function
  ProgressBar.prototype.setProgressBarValue = function(value) {
    setProgressBarValue(this, value);
  };

  function getProgressBarValue(progressBar) { // get progress value
    // return (fill width/total width) * 100
    return parseFloat(progressBar.fill.offsetWidth*100/progressBar.element.getElementsByClassName('progress-bar__bg')[0].offsetWidth);
  };

  function getProgressBarColorThresholds(progressBar) {
    var thresholds = [];
    var i = 1;
    while (!isNaN(parseInt(getComputedStyle(progressBar.element).getPropertyValue('--progress-bar-color-'+i)))) {
      thresholds.push(parseInt(getComputedStyle(progressBar.element).getPropertyValue('--progress-bar-color-'+i)));
      i = i + 1;
    }
    return thresholds;
  };

  function updatedProgressBarForReducedMotion(progressBar) {
    // if reduced motion is supported and set to reduced -> remove animations
    if(osHasReducedMotion) progressBar.element.removeAttribute('data-animation');
  };

  function initProgressBar(progressBar) {
    // set initial bar color
    if(progressBar.changeColor) updateProgressBarColor(progressBar, progressBar.value);
    // if data-animation is on -> reset the progress bar and animate when entering the viewport
    if(progressBar.animate && progressBar.canAnimate) animateProgressBar(progressBar);
    // reveal fill and label -> --animate and --color-update variations only
    setTimeout(function(){Util.addClass(progressBar.element, 'progress-bar--init');}, 30);

    // dynamically update value of progress bar
    progressBar.element.addEventListener('updateProgress', function(event){
      // cancel request animation frame if it was animating
      if(progressBar.animationId) window.cancelAnimationFrame(progressBar.animationId);
      
      var final = event.detail.value,
        duration = (event.detail.duration) ? event.detail.duration : progressBar.animationDuration;
      var start = getProgressBarValue(progressBar);
      // trigger update animation
      updateProgressBar(progressBar, start, final, duration, function(){
        emitProgressBarEvents(progressBar, 'progressCompleted', progressBar.value+'%');
        // update value of label for SR
        if(progressBar.ariaLabel.length > 0) progressBar.ariaLabel[0].textContent = final+'%';
      });
    });
  };

  function animateProgressBar(progressBar) {
    // reset inital values
    setProgressBarValue(progressBar, 0);
    
    // listen for the element to enter the viewport -> start animation
    var observer = new IntersectionObserver(progressBarObserve.bind(progressBar), { threshold: [0, 0.1] });
    observer.observe(progressBar.element);
  };

  function progressBarObserve(entries, observer) { // observe progressBar position -> start animation when inside viewport
    var self = this;
    if(entries[0].intersectionRatio.toFixed(1) > 0 && !this.animationTriggered) {
      updateProgressBar(this, 0, this.value, this.animationDuration, function(){
        emitProgressBarEvents(self, 'progressCompleted', self.value+'%');
      });
    }
  };

  function updateProgressBar(progressBar, start, to, duration, cb) {
    var change = to - start,
      currentTime = null;

    var animateFill = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      var val = parseInt((progress/duration)*change + start);
      // make sure value is in correct range
      if(change > 0 && val > to) val = to;
      if(change < 0 && val < to) val = to;
      if(progress >= duration) val = to;

      setProgressBarValue(progressBar, val);
      if(progress < duration) {
        progressBar.animationId = window.requestAnimationFrame(animateFill);
      } else {
        progressBar.animationId = false;
        cb();
      }
    };
    if ( window.requestAnimationFrame && !osHasReducedMotion ) {
      progressBar.animationId = window.requestAnimationFrame(animateFill);
    } else {
      setProgressBarValue(progressBar, to);
      cb();
    }
  };

  function setProgressBarValue(progressBar, value) {
    progressBar.fill.style.width = value+'%';
    if(progressBar.label.length > 0 ) progressBar.label[0].textContent = value+'%';
    if(progressBar.changeColor) updateProgressBarColor(progressBar, value);
  };

  function updateProgressBarColor(progressBar, value) {
    var className = 'progress-bar--fill-color-'+ progressBar.colorThresholds.length;
    for(var i = progressBar.colorThresholds.length; i > 0; i--) {
      if( !isNaN(progressBar.colorThresholds[i - 1]) && value <= progressBar.colorThresholds[i - 1]) {
        className = 'progress-bar--fill-color-' + i;
      } 
    }
    
    removeProgressBarColorClasses(progressBar);
    Util.addClass(progressBar.element, className);
  };

  function removeProgressBarColorClasses(progressBar) {
    var classes = progressBar.element.className.split(" ").filter(function(c) {
      return c.lastIndexOf('progress-bar--fill-color-', 0) !== 0;
    });
    progressBar.element.className = classes.join(" ").trim();
  };

  function emitProgressBarEvents(progressBar, eventName, detail) {
    progressBar.element.dispatchEvent(new CustomEvent(eventName, {detail: detail}));
  };

  window.ProgressBar = ProgressBar;

  //initialize the ProgressBar objects
  var progressBars = document.getElementsByClassName('js-progress-bar');
  var osHasReducedMotion = Util.osHasReducedMotion();
  if( progressBars.length > 0 ) {
		for( var i = 0; i < progressBars.length; i++) {
			(function(i){new ProgressBar(progressBars[i]);})(i);
    }
	}
}());
/* END - CODE TO INSERT */

sKilometrage = true;

function toggleSwitch() {
    const background = document.getElementById('background');
    const kilometrageOption = document.getElementById('kilometrage');
    const ageOption = document.getElementById('age');

    if (isKilometrage) {
        // Basculer vers "Âge (mois)"
        background.className = 'switch-background right';
        kilometrageOption.classList.remove('active');
        ageOption.classList.add('active');
        isKilometrage = false;
    } else {
        // Basculer vers "Kilométrage (km)"
        background.className = 'switch-background left';
        ageOption.classList.remove('active');
        kilometrageOption.classList.add('active');
        isKilometrage = true;
    }
}