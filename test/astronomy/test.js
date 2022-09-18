// Julian
(function () {
    var ok = true;

    function check(jd, year, month, day, hour = 0) {
        var actual = Julian.toDate(jd).getTime();

        hour += (day % 1) * 24;
        var minute = (hour % 1) * 60;
        var seconds = (minute % 1) * 60;
        day = Math.floor(day);
        hour = Math.floor(hour);
        minute = Math.floor(minute);
        second = Math.floor(seconds);
        var correct = new Date(Date.UTC(year, month - 1, day, hour, minute, second)).getTime();

        if (Math.abs(actual - correct) > 1000) {
            ok = false;
            var p = document.createElement("p");
            p.innerHTML = new Date(actual).toISOString() + " - actual";
            document.body.append(p);
            p = document.createElement("p");
            p.innerHTML = new Date(correct).toISOString() + " - correct";
            document.body.append(p);
        }
    }

    check(2443259.9, 1977, 4, 26.4);
    check(2436116.31, 1957, 10, 4.81);
    check(1842713, 333, 1, 27, 12);
    check(2451545, 2000, 1, 1.5);
    check(2451179.5, 1999, 1, 1);
    check(2446822.5, 1987, 1, 27);
    check(2446966, 1987, 6, 19.5);
    check(2447332, 1988, 6, 19.5);
    check(2415020.5, 1900, 1, 1);
    check(2305447.5, 1600, 1, 1);
    check(2305812.5, 1600, 12, 31);
    check(2026871.8, 837, 4, 10.3);
    check(1676496.5, -123, 12, 31);
    check(1676497.5, -122, 1, 1);
    check(1356001, -1000, 7, 12.5);
    check(1355866.5, -1000, 2, 29);
    check(1355671.4, -1001, 8, 17.9);
    check(0, -4712, 1, 1.5);
    check(1507900.13, -584, 5, 28.63);
    check(2418781.5, 1910, 4, 20);
    check(2446470.5, 1986, 2, 9);

    var p = document.createElement("p");
    p.innerHTML = "Julian: " + (ok ? "ok!" : "not ok...");
    document.body.append(p);
})();


// Equinox
(function () {
    var ok = true;

    function check(year, month, day, hour, minute, second, error = 50000) {
        var actual;
        if (month === 3) {
            actual = Equinox.march(year).getTime();
        } else if (month === 6) {
            actual = Equinox.june(year).getTime();
        } else if (month === 9) {
            actual = Equinox.september(year).getTime();
        } else if (month === 12) {
            actual = Equinox.december(year).getTime();
        }

        var correct = new Date(Date.UTC(year, month - 1, day, hour, minute, second)).getTime();

        if (Math.abs(actual - correct) > error) {
            ok = false;
            var p = document.createElement("p");
            p.innerHTML = new Date(actual).toISOString() + " - actual";
            document.body.append(p);
            p = document.createElement("p");
            p.innerHTML = new Date(correct).toISOString() + " - correct";
            document.body.append(p);
        }
    }

    check(1962, 6, 21, 21, 25, 08, 1000);
    check(1996, 3, 20, 8, 04, 07);
    check(1996, 6, 21, 2, 24, 46);
    check(1996, 9, 22, 18, 01, 08);
    check(1996, 12, 21, 14, 06, 56);
    check(1997, 3, 20, 13, 55, 42);
    check(1997, 6, 21, 8, 20, 59);
    check(1997, 9, 22, 23, 56, 49);
    check(1997, 12, 21, 20, 08, 05);
    check(1998, 3, 20, 19, 55, 35);
    check(1998, 6, 21, 14, 03, 38);
    check(1998, 9, 23, 5, 38, 15);
    check(1998, 12, 22, 1, 57, 31);
    check(1999, 3, 21, 1, 46, 53);
    check(1999, 6, 21, 19, 50, 11);
    check(1999, 9, 23, 11, 32, 34);
    check(1999, 12, 22, 7, 44, 52);
    check(2000, 3, 20, 7, 36, 19);
    check(2000, 6, 21, 1, 48, 46);
    check(2000, 9, 22, 17, 28, 40);
    check(2000, 12, 21, 13, 38, 30);
    check(2001, 3, 20, 13, 31, 47);
    check(2001, 6, 21, 7, 38, 48);
    check(2001, 9, 22, 23, 05, 32);
    check(2001, 12, 21, 19, 22, 34);
    check(2002, 3, 20, 19, 17, 13);
    check(2002, 6, 21, 13, 25, 29);
    check(2002, 9, 23, 4, 56, 28);
    check(2002, 12, 22, 1, 15, 26);
    check(2003, 3, 21, 1, 00, 50);
    check(2003, 6, 21, 19, 11, 32);
    check(2003, 9, 23, 10, 47, 53);
    check(2003, 12, 22, 7, 04, 53);
    check(2004, 3, 20, 6, 49, 42);
    check(2004, 6, 21, 0, 57, 57);
    check(2004, 9, 22, 16, 30, 54);
    check(2004, 12, 21, 12, 42, 40);
    check(2005, 3, 20, 12, 34, 29);
    check(2005, 6, 21, 6, 47, 12);
    check(2005, 9, 22, 22, 24, 14);
    check(2005, 12, 21, 18, 36, 01);
    check(2015, 3, 20, 22, 44, 53, 120000);
    check(2015, 6, 21, 16, 37, 33, 120000);
    check(2015, 9, 23, 08, 20, 6, 120000);
    check(2015, 12, 22, 4, 47, 53, 1200000);
    check(2020, 3, 20, 3, 49, 35, 120000);
    check(2020, 6, 20, 21, 43, 2, 120000);
    check(2020, 9, 22, 13, 30, 27, 120000);
    check(2020, 12, 21, 10, 02, 26, 120000);
    check(2025, 3, 20, 9, 02, 0, 300000);
    check(2025, 6, 21, 2, 42, 0, 300000);
    check(2025, 9, 22, 18, 20, 0, 300000);
    check(2025, 12, 21, 15, 0, 0, 300000);
    check(1800, 3, 20, 20, 12, 2);
    check(1800, 6, 21, 17, 51, 43);
    check(1800, 9, 23, 7, 25, 45);
    check(1800, 12, 22, 0, 16, 38);
    check(2200, 3, 20, 18, 48, 11);
    check(2200, 6, 21, 9, 23, 22);
    check(2200, 9, 23, 2, 48, 23);
    check(2200, 12, 22, 2, 34, 4);

    var p = document.createElement("p");
    p.innerHTML = "Equinox: " + (ok ? "ok!" : "not ok...");
    document.body.append(p);
})();


// Moon
(function () {
    var ok = true;

    function check(inYear, inMonth, inDay, inHour, inMinute, inSecond, before, phase, outYear, outMonth, outDay, outHour, outMinute, outSecond, error = 180000) {
        var date = new Date(Date.UTC(inYear, inMonth - 1, inDay, inHour, inMinute, inSecond));
        var actual;
        if (phase === 0) {
            actual = Moon.new(date, before).getTime();
        } else if (phase === 1) {
            actual = Moon.firstQuarter(date, before).getTime();
        } else if (phase === 2) {
            actual = Moon.full(date, before).getTime();
        } else if (phase === 3) {
            actual = Moon.lastQuarter(date, before).getTime();
        }

        var correct = new Date(Date.UTC(outYear, outMonth - 1, outDay, outHour, outMinute, outSecond)).getTime();

        if (Math.abs(actual - correct) > error) {
            ok = false;
            var p = document.createElement("p");
            p.innerHTML = new Date(actual).toISOString() + " - actual";
            document.body.append(p);
            p = document.createElement("p");
            p.innerHTML = new Date(correct).toISOString() + " - correct";
            document.body.append(p);
        }
    }

    check(1977, 1, 26, 0, 0, 0, false, 0, 1977, 2, 18, 3, 37, 42, 1000);
    check(1977, 2, 18, 3, 37, 41, false, 0, 1977, 2, 18, 3, 37, 42, 1000);
    check(1977, 2, 18, 3, 37, 42, false, 0, 1977, 2, 18, 3, 37, 42, 1000);
    check(1977, 2, 18, 3, 37, 43, true, 0, 1977, 2, 18, 3, 37, 42, 1000);
    check(1977, 3, 10, 3, 37, 43, true, 0, 1977, 2, 18, 3, 37, 42, 1000);
    check(2043, 12, 28, 0, 0, 0, false, 3, 2044, 1, 21, 23, 48, 17, 1000);
    check(2044, 1, 21, 0, 0, 0, false, 3, 2044, 1, 21, 23, 48, 17, 1000);
    check(2044, 1, 21, 23, 48, 17, false, 3, 2044, 1, 21, 23, 48, 17, 1000);
    check(2044, 2, 16, 0, 0, 0, true, 3, 2044, 1, 21, 23, 48, 17, 1000);
    check(2044, 1, 21, 23, 48, 18, true, 3, 2044, 1, 21, 23, 48, 17, 1000);
    check(2020, 2, 5, 2, 0 , 0, false, 0, 2020, 2, 23, 15, 32, 34);
    check(2020, 2, 5, 2, 0 , 0, false, 1, 2020, 3, 2, 19, 57, 0);
    check(2020, 3, 5, 2, 0 , 0, false, 2, 2020, 3, 9, 17, 47, 0);
    check(2020, 3, 5, 2, 0 , 0, false, 3, 2020, 3, 16, 9, 34, 0);
    check(2040, 5, 1, 2, 0 , 0, false, 0, 2040, 5, 11, 3, 29, 0);
    check(1850, 6, 1, 0, 0, 0, false, 0, 1850, 6, 10, 7, 20, 8);
    check(1850, 6, 1, 0, 0, 0, false, 2, 1850, 6, 24, 14, 12, 15);
    check(2021, 1, 1, 0, 0, 0, true, 0, 2020, 12, 14, 16, 16, 0);
    check(2021, 1, 1, 0, 0, 0, true, 1, 2020, 12, 21, 23, 41, 0);
    check(2021, 1, 1, 0, 0, 0, true, 2, 2020, 12, 30, 3, 28, 0);
    check(2021, 1, 1, 0, 0, 0, true, 3, 2020, 12, 8, 0, 36, 0);

    var p = document.createElement("p");
    p.innerHTML = "Moon: " + (ok ? "ok!" : "not ok...");
    document.body.append(p);
})();


var p = document.createElement("p");
p.innerHTML = "end";
document.body.append(p);