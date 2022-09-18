"use strict";

(function () {
    var longitude = 0;
    var begin = 0;
    var moonTime = new Date().getTime();
    var seasonTime = moonTime;
    var dayTime = moonTime;
    var yearTime = moonTime;
    var run = false;

    document.getElementById("start").onclick = function () {
        run = !run;
        if (run) {
            setTimeout(display, 10);
        }
    };

    function display() {
        longitude = (longitude + 0.5) % 360;
        moonTime += 1000000;
        seasonTime += 10000000;
        dayTime += 50000;
        yearTime += 600000000;

        setMoon(new Date(moonTime));
        setSeasons(new Date(seasonTime));
        setDay(new Date(dayTime));
        setYear(new Date(yearTime));

        if (run) {
            setTimeout(display, 10);
        }
    }

    function setMoon(date) {
        var now = date.getTime();
        var angle;

        var newMoon = Moon.new(date, false).getTime();
        var firstQuarter = Moon.firstQuarter(date, false).getTime();
        if (firstQuarter < newMoon) {
            var prevNewMoon = Moon.new(date, true).getTime();
            angle = (now - prevNewMoon) / (firstQuarter - prevNewMoon) * 90;
        } else {
            var fullMoon = Moon.full(date, false).getTime();
            if (fullMoon < firstQuarter) {
                var prevFirstQuarter = Moon.firstQuarter(date, true).getTime();
                angle = 90 + (now - prevFirstQuarter) / (fullMoon - prevFirstQuarter) * 90;
            } else {
                var lastQuarter = Moon.lastQuarter(date, false).getTime();
                if (lastQuarter < fullMoon) {
                    var prevFullMoon = Moon.full(date, true).getTime();
                    angle = 180 + (now - prevFullMoon) / (lastQuarter - prevFullMoon) * 90;
                } else {
                    var prevLastQuarter = Moon.lastQuarter(date, true).getTime();
                    angle = 270 + (now - prevLastQuarter) / (newMoon - prevLastQuarter) * 90;
                }
            }
        }

        var pointer = document.getElementById("moon").contentDocument.getElementById("pointer");
        pointer.setAttribute("transform", "rotate(" + angle + " 500 500)");
    }

    function setSeasons(date) {
        var now = date.getTime();
        var year = date.getFullYear();
        var angle;

        var marchTime = Equinox.march(year).getTime();
        if (now < marchTime) {
            var decemberTime = Equinox.december(year - 1).getTime();
            angle = (now - decemberTime) / (marchTime - decemberTime) * 90;
        } else {
            var juneTime = Equinox.june(year).getTime();
            if (now < juneTime) {
                angle = 90 + (now - marchTime) / (juneTime - marchTime) * 90;
            } else {
                var septemberTime = Equinox.september(year).getTime();
                if (now < septemberTime) {
                    angle = 180 + (now - juneTime) / (septemberTime - juneTime) * 90;
                } else {
                    var decemberTime = Equinox.december(year).getTime();
                    if (now < decemberTime) {
                        angle = 270 + (now - septemberTime) / (decemberTime - septemberTime) * 90;
                    } else {
                        var nextMarchTime = Equinox.march(year + 1).getTime();
                        angle = (now - decemberTime) / (nextMarchTime - decemberTime) * 90;
                    }
                }
            }
        }

        var pointer = document.getElementById("seasons").contentDocument.getElementById("pointer");
        pointer.setAttribute("transform", "rotate(" + angle + " 500 500)");
    }

    function setDay(date) {
        var dayN = date.getMonth() * 30 + date.getDate();
        var shift;
        if (dayN < 25) {
            shift = (21.83 * dayN + 190) * 1000;
        } else if (dayN < 61) {
            shift = 793500;
        } else if (dayN < 110) {
            shift = (-16.3 * dayN + 1727) * 1000;
        } else if (dayN < 157) {
            shift = -139000;
        } else if (dayN < 185) {
            shift = (12.29 * dayN - 1989) * 1000;
        } else if (dayN < 224) {
            shift = 340000;
        } else if (dayN < 285) {
            shift = (-18.69 * dayN + 4468) * 1000;
        } else if (dayN < 320) {
            shift = -925000;
        } else {
            shift = (26.15 * dayN - 9230) * 1000;
        }

        var dayLength = 86400000;
        var angle = longitude + (date.getTime() % dayLength - shift) / dayLength * 360;

        var face = document.getElementById("day").contentDocument.getElementById("face");
        var pointer = document.getElementById("day").contentDocument.getElementById("pointer");
        face.setAttribute("transform", "rotate(" + longitude + " 500 500)");
        pointer.setAttribute("transform", "rotate(" + angle + " 500 500)");
    }

    function setYear(date) {
        var now = date.getTime();
        var generationLength = 504930396216; // 16 sidereal years
        var generationN = Math.floor((date - begin) / generationLength).toString(16).toUpperCase();
        var angle = ((date - begin) % generationLength) / generationLength * 360;

        var generation = document.getElementById("year").contentDocument.getElementById("generation");
        var pointer = document.getElementById("year").contentDocument.getElementById("pointer");
        generation.innerHTML = generationN;
        pointer.setAttribute("transform", "rotate(" + angle + " 500 500)");
    }
})();