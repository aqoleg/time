"use strict";

(function () {
    var longitude = 0; // degrees from -180 till 180 for day clock
    var begin = 945848719000; // unix time for year clock

    window.onload = function () {
        document.getElementById("longitude_button").onclick = setLongitude;
        document.getElementById("begin_button").onclick = setBegin;

        var date = new Date();
        setMoon(date);
        setSeasons(date);
        setDay(date);
        setYear(date);
    };

    function setLongitude() {
        var input = document.getElementById("longitude_input").value;
        if (input === "") {
            document.getElementById("longitude_input").value = longitude;
            return;
        }
        input = Math.round(input) % 360;
        if (isNaN(input)) {
            document.getElementById("longitude_input").value = longitude;
            return;
        }

        longitude = input > 180 ? input - 360 : input;
        setDay(new Date());
    }

    function setBegin() {
        var input = new Date(document.getElementById("begin_input").value).getTime();
        if (isNaN(input)) {
            document.getElementById("begin_input").value = new Date(begin).toISOString().substring(0, 10);
            return;
        }

        begin = input;
        setYear(new Date());
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
        if (pointer === null) {
            document.getElementById("moon_time").innerHTML = angle.toFixed(2);
        } else {
            pointer.setAttribute("transform", "rotate(" + angle + " 500 500)");
        }
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
        if (pointer === null) {
            document.getElementById("seasons_time").innerHTML = angle.toFixed(2);
        } else {
            pointer.setAttribute("transform", "rotate(" + angle + " 500 500)");
        }
    }

    function setDay(date) {
        document.getElementById("longitude_input").value = longitude;

        // Set noon time
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
        if (face === null || pointer === null) {
            document.getElementById("day_time").innerHTML = angle.toFixed(2);
        } else {
            face.setAttribute("transform", "rotate(" + longitude + " 500 500)");
            pointer.setAttribute("transform", "rotate(" + angle + " 500 500)");
        }
    }

    function setYear(date) {
        document.getElementById("begin_input").value = new Date(begin).toISOString().substring(0, 10);

        var now = date.getTime();
        var generationLength = 504930396216; // 16 sidereal years
        var generationN = Math.floor((date - begin) / generationLength).toString(16).toUpperCase();
        var angle = ((date - begin) % generationLength) / generationLength * 360;

        var generation = document.getElementById("year").contentDocument.getElementById("generation");
        var pointer = document.getElementById("year").contentDocument.getElementById("pointer");
        if (generation === null || pointer === null) {
            document.getElementById("year_time").innerHTML = generationN +": " + angle.toFixed(2);
        } else {
            generation.innerHTML = generationN;
            pointer.setAttribute("transform", "rotate(" + angle + " 500 500)");
        }
    }
})();