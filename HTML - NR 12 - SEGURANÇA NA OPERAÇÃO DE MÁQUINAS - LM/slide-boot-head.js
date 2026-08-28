(function () {
    var need = false;
    try {
        var params = new URLSearchParams(window.location.search);
        if (params.get('last') === '1') need = true;
        if (params.has('restoreslide') && params.get('restoreslide') !== '0') need = true;
        if ((window.location.hash || '').replace(/^#/, '')) need = true;
    } catch (e) { /* ignore */ }
    if (need) document.documentElement.classList.add('slide-boot-pending');
})();
