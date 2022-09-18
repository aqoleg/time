'use strict';

(function () {
    var time; // null for the current time

    window.onload = function () {
        time = parseTime('time');
        log();
        setMoon();
        setSeasons();
        if (time === null) {
            setInterval(setMoon, 60000);
            setInterval(setSeasons, 600000);
        }
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

    function log() {
        var user = 'aqoleg.github.io/time';
        if (time) {
            user += '#' + time.toISOString().substr(0, 10) + 'Z';
        }
        var language = null;
        if (typeof navigator.language === 'string') {
            language = navigator.language.substr(0, 2);
        }
        fetch('https://aqoleg.com/log', {
            method: 'POST',
            body: JSON.stringify({
                user: user,
                language: language,
                timeZone: new Date().getTimezoneOffset() / (-60)
            })
        }).catch(console.error);
    }

    function parseTime(query) {
        var startIndex = window.location.search.indexOf(query + '=');
        if (startIndex < 0) {
            return null;
        }
        startIndex = startIndex + query.length + 1;
        var stopIndex = window.location.search.indexOf('&', startIndex);
        var time;
        if (stopIndex < 0) {
            time = window.location.search.substring(startIndex);
        } else {
            time = window.location.search.substring(startIndex, stopIndex);
        }
        if (Number(time) > 0) {
            time = new Date(time * 1000);
        } else {
            time = new Date(time);
        }
        if (time.toString() === 'Invalid Date') {
            return null;
        }
        return time;
    }
})();
