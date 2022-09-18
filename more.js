'use strict';

(function () {
    window.onload = function () {
        var time = parseTime('time');
        log(time);
        if (time === null) {
            time = new Date();
        }
        document.getElementById('time').value = toLocalIso(time);
        print(time);

        document.getElementById('time').oninput = function () {
            var input = new Date(document.getElementById('time').value);
            if (input.toString() !== 'Invalid Date') {
                print(input);
            }
        };
    };

    function print(time) {
        var link = 'aqoleg.github.io/time?time=' + toLocalIso(time);
        document.getElementById('index').href = 'https://' + link;
        document.getElementById('index').innerHTML = link;
        document.getElementById('fullMoon').innerHTML = toLocalIso(Moon.full(time, false));
        document.getElementById('newMoon').innerHTML = toLocalIso(Moon.new(time, false));
        document.getElementById('firstMoon').innerHTML = toLocalIso(Moon.firstQuarter(time, false));
        document.getElementById('lastMoon').innerHTML = toLocalIso(Moon.lastQuarter(time, false));
        var year = time.getUTCFullYear();
        var equinox = Equinox.june(year);
        if (equinox.getTime() < time.getTime()) {
            equinox = Equinox.june(year + 1);
        }
        document.getElementById('june').innerHTML = toLocalIso(equinox);
        equinox = Equinox.december(year);
        if (equinox.getTime() < time.getTime()) {
            equinox = Equinox.december(year + 1);
        }
        document.getElementById('december').innerHTML = toLocalIso(equinox);
        equinox = Equinox.march(year);
        if (equinox.getTime() < time.getTime()) {
            equinox = Equinox.march(year + 1);
        }
        document.getElementById('march').innerHTML = toLocalIso(equinox);
        equinox = Equinox.september(year);
        if (equinox.getTime() < time.getTime()) {
            equinox = Equinox.september(year + 1);
        }
        document.getElementById('september').innerHTML = toLocalIso(equinox);
        document.getElementById('more').href = '?time=' + toLocalIso(time);
    }

    function log(time) {
        var user = 'aqoleg.github.io/time/more';
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

    function toLocalIso(date) {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().substr(0, 19);
    }
})();
