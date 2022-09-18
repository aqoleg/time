'use strict';

(function () {
    var time = new Date(0);
    var step = 10000000;

    window.onload = function () {
        document.getElementById('slow').onclick = function () {
            step /= 2;
        };
        document.getElementById('fast').onclick = function () {
            step *= 2;
        };
        setInterval(function () {
            time = new Date(time.getTime() + step);
            setSeasons();
        }, 100);
    };

    function setSeasons() {
        var seasons = document.getElementById('seasons').contentDocument;
        if (seasons === null) {
            return setTimeout(setSeasons, 100);
        }
        var date = time ? time : new Date();
        var year = date.getUTCFullYear();
        var angle;
        var marchTime = Equinox.march(year).getTime();
        if (date.getTime() < marchTime) {
            var decemberTime = Equinox.december(year - 1).getTime();
            angle = (date.getTime() - decemberTime) / (marchTime - decemberTime) * 90;
        } else {
            var juneTime = Equinox.june(year).getTime();
            if (date.getTime() < juneTime) {
                angle = 90 + (date.getTime() - marchTime) / (juneTime - marchTime) * 90;
            } else {
                var septemberTime = Equinox.september(year).getTime();
                if (date.getTime() < septemberTime) {
                    angle = 180 + (date.getTime() - juneTime) / (septemberTime - juneTime) * 90;
                } else {
                    var decemberTime = Equinox.december(year).getTime();
                    if (date.getTime() < decemberTime) {
                        angle = 270 + (date.getTime() - septemberTime) / (decemberTime - septemberTime) * 90;
                    } else {
                        var nextMarchTime = Equinox.march(year + 1).getTime();
                        angle = (date.getTime() - decemberTime) / (nextMarchTime - decemberTime) * 90;
                    }
                }
            }
        }
        seasons.getElementById('pointer').setAttribute('transform', 'rotate(' + angle + ' 500 500)');
    }
})();