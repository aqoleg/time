'use strict';

(function () {
    var time = new Date(0);
    var step = 1000000;

    window.onload = function () {
        document.getElementById('slow').onclick = function () {
            step /= 2;
        };
        document.getElementById('fast').onclick = function () {
            step *= 2;
        };
        setInterval(function () {
            time = new Date(time.getTime() + step);
            setMoon();
        }, 100);
    };

    function setMoon() {
        var moon = document.getElementById('moon').contentDocument;
        if (moon === null) {
            return setTimeout(setMoon, 100);
        }
        var date = time ? time : new Date();
        var newMoon = Moon.new(date, false).getTime();
        var firstQuarter = Moon.firstQuarter(date, false).getTime();
        var angle;
        if (firstQuarter < newMoon) {
            var prevNewMoon = Moon.new(date, true).getTime();
            angle = (date.getTime() - prevNewMoon) / (firstQuarter - prevNewMoon) * 90;
        } else {
            var fullMoon = Moon.full(date, false).getTime();
            if (fullMoon < firstQuarter) {
                var prevFirstQuarter = Moon.firstQuarter(date, true).getTime();
                angle = 90 + (date.getTime() - prevFirstQuarter) / (fullMoon - prevFirstQuarter) * 90;
            } else {
                var lastQuarter = Moon.lastQuarter(date, false).getTime();
                if (lastQuarter < fullMoon) {
                    var prevFullMoon = Moon.full(date, true).getTime();
                    angle = 180 + (date.getTime() - prevFullMoon) / (lastQuarter - prevFullMoon) * 90;
                } else {
                    var prevLastQuarter = Moon.lastQuarter(date, true).getTime();
                    angle = 270 + (date.getTime() - prevLastQuarter) / (newMoon - prevLastQuarter) * 90;
                }
            }
        }
        moon.getElementById('pointer').setAttribute('transform', 'rotate(' + angle + ' 500 500)');

        var hourAngle = 15 * date.getUTCHours() + 0.25 * date.getUTCMinutes();
        hourAngle = angle - hourAngle - 180;
        moon.getElementById('earth').setAttribute('transform', 'rotate(' + hourAngle + ' 500 330)');
    }
})();