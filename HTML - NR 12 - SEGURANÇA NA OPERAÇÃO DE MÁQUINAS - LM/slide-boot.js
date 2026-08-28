(function () {
    var slides = document.querySelectorAll('#slides > .slide');
    var total = slides.length;
    if (!total) {
        document.documentElement.classList.add('slide-booted');
        return;
    }

    var idx = 0;
    try {
        var params = new URLSearchParams(window.location.search);
        if (params.has('restoreslide')) {
            idx = parseInt(params.get('restoreslide'), 10);
        } else if (params.get('last') === '1') {
            idx = total - 1;
        } else {
            var hash = (window.location.hash || '').replace(/^#/, '');
            if (hash) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i].id === hash) {
                        idx = i;
                        break;
                    }
                }
            }
        }
    } catch (e) { /* ignore */ }

    if (isNaN(idx) || idx < 0 || idx >= total) idx = 0;

    for (var j = 0; j < slides.length; j++) {
        if (j === idx) slides[j].classList.add('active');
        else slides[j].classList.remove('active');
    }

    document.documentElement.classList.add('slide-booted');
    document.documentElement.classList.remove('slide-boot-pending');
})();
