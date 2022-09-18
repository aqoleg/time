'use strict';

// converts julian day to Date object
// algorithm from Jean Meeus, astronomical algorithms, chapter 7
// Julian.toDate(jd)
// jd - julian day number, floating days from -004712-01-01T12:00:00, jd >= 0
// returns Date object
var Julian = (function () {

    function jdToDate(jd) {
        if (isNaN(jd) || jd < 0) {
            throw 'requires jd >= 0';
        }

        jd += 0.5;
        var z = Math.floor(jd);
        var f = jd % 1;

        var a = z;
        if (z >= 2291161) {
            var alpha = Math.floor((z * 100 - 186721625) / 3652425);
            a += 1 + alpha - Math.floor(alpha / 4);
        }
        var b = a + 1524;
        var c = Math.floor((b * 100 - 12210) / 36525);
        var d = Math.floor(36525 * c / 100);
        var e = Math.floor((b - d) * 10000 / 306001);

        var day = b - d - Math.floor(306001 * e / 10000);
        var month = e < 14 ? e - 1 : e - 13;
        var year = month > 2 ? c - 4716 : c - 4715;

        var hour = Math.floor(f * 24);
        var minute = Math.floor((f * 1440) % 60);
        var second = Math.round((f * 86400) % 60);
        return new Date(Date.UTC(year, month - 1, day, hour, minute, second)); // month from zero
    }

    return {
        toDate: function (jd) {
            return jdToDate(jd);
        }
    };
})();

// converts dynamical time to universal time
// algorithm from Jean Meeus, astronomical algorithms, chapter 10
// Dynamical.toUniversal(dt)
// dt - dynamical time, Date object
// returns Date object
var Dynamical = (function () {

    function dynamicalToUniversal(dt) {
        if (!(dt instanceof Date)) {
            throw 'requires Date object';
        }

        var deltaTMeasured = [121, 112, 103, 95, 88, 82, 77, 72, 68, 63,
                              60, 56, 53, 51, 48, 46, 44, 42, 40, 38,
                              35, 33, 31, 29, 26, 24, 22, 20, 18, 16,
                              14, 12, 11, 10, 9, 8, 7, 7, 7, 7,
                              7, 7, 8, 8, 9, 9, 9, 9, 9, 10,
                              10, 10, 10, 10, 10, 10, 10, 11, 11, 11,
                              11, 11, 12, 12, 12, 12, 13, 13, 13, 14,
                              14, 14, 14, 15, 15, 15, 15, 15, 16, 16,
                              16, 16, 16, 16, 16, 16, 15, 15, 14, 13,
                              13.1, 12.5, 12.2, 12, 12, 12, 12, 12, 12, 11.9,
                              11.6, 11, 10.2, 9.2, 8.2, 7.1, 6.2, 5.6, 5.4, 5.3,
                              5.4, 5.6, 5.9, 6.2, 6.5, 6.8, 7.1, 7.3, 7.5, 7.6,
                              7.7, 7.3, 6.2, 5.2, 2.7, 1.4, -1.2, -2.8, -3.8, -4.8,
                              -5.5, -5.3, -5.6, -5.7, -5.9, -6, -6.3, -6.5, -6.2, -4.7,
                              -2.8, -0.1, 2.6, 5.3, 7.7, 10.4, 13.3, 16, 18.2, 20.2,
                              21.1, 22.4, 23.5, 23.8, 24.3, 24, 23.9, 23.9, 23.7, 24,
                              24.3, 25.3, 26.2, 27.3, 28.2, 29.1, 30, 30.7, 31.4, 32.2,
                              33.1, 34, 35, 36.5, 38.3, 40.2, 42.2, 44.5, 46.5, 48.5,
                              50.5, 52.2, 53.8, 54.9, 55.8, 56.9, 58.3, 60, 61.6, 63];
        var year = dt.getUTCFullYear();
        var t = (year - 2000) / 100;
        var deltaT;
        if (year < 948) {
            deltaT = 2177 + t * (497 + (t * 44.1));
        } else if (year < 1620 || year >= 2000) {
            deltaT = 102 + t * (102 + (t * 25.3));
            if (year >= 2000 && year < 2100) {
                deltaT += 0.37 * (year - 2100);
            }
        } else {
            deltaT = deltaTMeasured[Math.floor((year - 1620) / 2)];
        }
        return new Date(dt.getTime() - deltaT * 1000);
    }

    return {
        toUniversal: function (dt) {
            return dynamicalToUniversal(dt);
        }
    };
})();

// calculates equinoxes and solstices
// algorithm from Jean Meeus, astronomical algorithms, chapter 27
// Equinox.december(year), Equinox.march(year), Equinox.june(year), Equinox.september(year)
// year - full year number, integer, the best accuracy for years 1000 to 3000
// returns Date object
var Equinox = (function () {
    // m - month, 0 - mar, 1 - jun, 2 - sep, 3 - dec
    // jde0 = cJde0[m][0] + cJde0[m][1]*y + cJde0[m][2]*y^2 + cJde0[m][3]*y^3 + cJde0[m][4]*y^4
    var cJde0 = [
        [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
        [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.0003],
        [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
        [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032]
    ];
    // s = sum( cS[i][0] * cos(cS[i][1] + cS[i][2] * t) )
    var cS = [
        [485, 324.96, 1934.136],
        [203, 337.23, 32964.467],
        [199, 342.08, 20.186],
        [182, 27.85, 445267.112],
        [156, 73.14, 45036.886],
        [136, 171.52, 22518.443],
        [77, 222.54, 65928.934],
        [74, 296.72, 3034.906],
        [70, 243.58, 9037.513],
        [58, 119.81, 33718.147],
        [52, 297.17, 150.678],
        [50, 21.02, 2281.226],
        [45, 247.54, 29929.562],
        [44, 325.15, 31555.956],
        [29, 60.93, 4443.417],
        [18, 155.12, 67555.328],
        [17, 288.79, 4562.452],
        [16, 198.04, 62894.029],
        [14, 199.76, 31436.921],
        [12, 95.39, 14577.848],
        [12, 287.11, 31931.756],
        [12, 320.81, 34777.259],
        [9, 227.73, 1222.114],
        [8, 15.45, 16859.074]
    ];

    function calculate(year, month) {
        var y = (Math.floor(year) - 2000) / 1000;

        // horner's method
        var i = 4;
        var jde0 = cJde0[month][i];
        while (--i >= 0) {
            jde0 = jde0 * y + cJde0[month][i];
        }

        var t = (jde0 - 2451545) / 36525;
        var w = (35999.373 * t - 2.47) / 180 * Math.PI; // radians
        var dLong = 1 + 0.0334 * Math.cos(w) + 0.0007 * Math.cos(2 * w);

        var s = 0;
        for (var i = cS.length - 1; i >= 0; i--) {
            var cSRow = cS[i];
            s += cSRow[0] * Math.cos((cSRow[1] + cSRow[2] * t) / 180 * Math.PI);
        }

        var jde = jde0 + (0.00001 * s / dLong);
        return Dynamical.toUniversal(Julian.toDate(jde));
    }

    return {
        march: function (year) {
            return calculate(year, 0);
        },
        june: function (year) {
            return calculate(year, 1);
        },
        september: function (year) {
            return calculate(year, 2);
        },
        december: function (year) {
            return calculate(year, 3);
        }
    };
})();

// calculates new moon, first quarter moon, full moon and last quarter moon
// algorithm from Jean Meeus, astronomical algorithms, chapter 49
// Moon.new(date, before), Moon.firstQuarter(date, before), Moon.full(date, before),
//  Moon.lastQuarter(date, before)
// date - Date object
// before - true (return < date) or false (default, return >= date)
// returns Date object, error < 60 seconds
var Moon = (function () {
    // phase: newMoon - 0, firstQuarter - 1, full - 2, lastQuarter - 3
    var kDelta = [0, 0.25, 0.5, 0.75]; // k += kDelta[phase]
    // correction0 = sum( c0[i][0] * e^c0[i][1] * sin(c0[i][2]*m + c0[i][3]*m1 + c0[i][4]*f + c0[i][5]*om) )
    var c0new = [
        [-0.4072, 0, 0, 1, 0, 0],
        [0.17241, 1, 1, 0, 0, 0],
        [0.01608, 0, 0, 2, 0, 0],
        [0.01039, 0, 0, 0, 2, 0],
        [0.00739, 1, -1, 1, 0, 0],
        [-0.00514, 1, 1, 1, 0, 0],
        [0.00208, 2, 2, 0, 0, 0],
        [-0.00111, 0, 0, 1, -2, 0],
        [-0.00057, 0, 0, 1, 2, 0],
        [0.00056, 1, 1, 2, 0, 0],
        [-0.00042, 0, 0, 3, 0, 0],
        [0.00042, 1, 1, 0, 2, 0],
        [0.00038, 1, 1, 0, -2, 0],
        [-0.00024, 1, -1, 2, 0, 0],
        [-0.00017, 0, 0, 0, 0, 1],
        [-0.00007, 0, 2, 1, 0, 0],
        [0.00004, 0, 0, 2, -2, 0],
        [0.00004, 0, 3, 0, 0, 0],
        [0.00003, 0, 1, 1, -2, 0],
        [0.00003, 0, 0, 2, 2, 0],
        [-0.00003, 0, 1, 1, 2, 0],
        [0.00003, 0, -1, 1, 2, 0],
        [-0.00002, 0, -1, 1, -2, 0],
        [-0.00002, 0, 1, 3, 0, 0],
        [0.00002, 0, 0, 4, 0, 0]
    ];
    var c0full = [
        [-0.40614, 0, 0, 1, 0, 0],
        [0.17302, 1, 1, 0, 0, 0],
        [0.01614, 0, 0, 2, 0, 0],
        [0.01043, 0, 0, 0, 2, 0],
        [0.00734, 1, -1, 1, 0, 0],
        [-0.00515, 1, 1, 1, 0, 0],
        [0.00209, 2, 2, 0, 0, 0],
        [-0.00111, 0, 0, 1, -2, 0],
        [-0.00057, 0, 0, 1, 2, 0],
        [0.00056, 1, 1, 2, 0, 0],
        [-0.00042, 0, 0, 3, 0, 0],
        [0.00042, 1, 1, 0, 2, 0],
        [0.00038, 1, 1, 0, -2, 0],
        [-0.00024, 1, -1, 2, 0, 0],
        [-0.00017, 0, 0, 0, 0, 1],
        [-0.00007, 0, 2, 1, 0, 0],
        [0.00004, 0, 0, 2, -2, 0],
        [0.00004, 0, 3, 0, 0, 0],
        [0.00003, 0, 1, 1, -2, 0],
        [0.00003, 0, 0, 2, 2, 0],
        [-0.00003, 0, 1, 1, 2, 0],
        [0.00003, 0, -1, 1, 2, 0],
        [-0.00002, 0, -1, 1, -2, 0],
        [-0.00002, 0, 1, 3, 0, 0],
        [0.00002, 0, 0, 4, 0, 0]
    ];
    var c0quarters = [
        [-0.62801, 0, 0, 1, 0, 0],
        [0.17172, 1, 1, 0, 0, 0],
        [-0.01183, 1, 1, 1, 0, 0],
        [0.00862, 0, 0, 2, 0, 0],
        [0.00804, 0, 0, 0, 2, 0],
        [0.00454, 1, -1, 1, 0, 0],
        [0.00204, 2, 2, 0, 0, 0],
        [-0.0018, 0, 0, 1, -2, 0],
        [-0.0007, 0, 0, 1, 2, 0],
        [-0.0004, 0, 0, 3, 0, 0],
        [-0.00034, 1, -1, 2, 0, 0],
        [0.00032, 1, 1, 0, 2, 0],
        [0.00032, 1, 1, 0, -2, 0],
        [-0.00028, 2, 2, 1, 0, 0],
        [0.00027, 1, 1, 2, 0, 0],
        [-0.00017, 0, 0, 0, 0, 1],
        [-0.00005, 0, -1, 1, -2, 0],
        [0.00004, 0, 0, 2, 2, 0],
        [-0.00004, 0, 1, 1, 2, 0],
        [0.00004, 0, -2, 1, 0, 0],
        [0.00003, 0, 1, 1, -2, 0],
        [0.00003, 0, 3, 0, 0, 0],
        [0.00002, 0, 0, 2, -2, 0],
        [0.00002, 0, -1, 1, 2, 0],
        [-0.00002, 0, 1, 3, 0, 0]
    ];
    // correction1 = sum( c1[i][0] * sin(c1[i][1] + c1[i][2]*k + c1[i][3]*t^2) )
    var c1 = [
        [0.000325, 299.77, 0.107408, -0.009173],
        [0.000165, 251.88, 0.016321],
        [0.000164, 251.83, 26.651886],
        [0.000126, 349.42, 36.412478],
        [0.00011, 84.66, 18.206239],
        [0.000062, 141.74, 53.303771],
        [0.00006, 207.14, 2.453732],
        [0.000056, 154.84, 7.30686],
        [0.000047, 34.52, 27.261239],
        [0.000042, 207.19, 0.121824],
        [0.00004, 291.34, 1.844379],
        [0.000037, 161.72, 24.198154],
        [0.000035, 239.56, 25.513099],
        [0.000023, 331.55, 3.592518]
    ];

    function calculate(date, offset, before, phase) {
        var year = date.getFullYear() + date.getMonth() / 12 + date.getDate() / 360;

        var approximateK = (year - 2000) * 12.3685;
        var k;
        if (before) {
            k = Math.ceil(approximateK - kDelta[phase]) + offset + kDelta[phase];
        } else {
            k = Math.floor(approximateK - kDelta[phase]) + offset + kDelta[phase];
        }

        var t = k / 1236.85;
        var jde = polynom(k, t, [2451550.09766, 29.530588861, 0.00015437, 0.00000015, 0.00000000073]);
        var e = polynom(t, t, [1, -0.002516, -0.0000074]);
        var m = polynom(k, t, [2.5534, 29.1053567, -0.0000014, -0.00000011]);
        var m1 = polynom(k, t, [201.5643, 385.81693528, 0.0107582, 0.00001238, -0.000000058]);
        var f = polynom(k, t, [160.7108, 390.67050284, -0.0016118, -0.00000227, 0.000000011]);
        var om = polynom(k, t, [124.7746, -1.56375588, 0.0020672, 0.00000215]);

        var c0;
        if (phase === 0) {
            c0 = c0new;
        } else if (phase === 2) {
            c0 = c0full;
        } else {
            c0 = c0quarters;
            var w = 0.00306 - 0.00038 * e * Math.cos(m / 180 * Math.PI);
            w += 0.00026 * Math.cos(m1 / 180 * Math.PI);
            w += -0.00002 * Math.cos((m1 - m) / 180 * Math.PI);
            w += 0.00002 * Math.cos((m1 + m) / 180 * Math.PI);
            w += 0.00002 * Math.cos(2 * f / 180 * Math.PI);
            if (phase === 1) {
                jde += w;
            } else {
                jde -= w;
            }
        }
        for (var i = c0.length - 1; i >= 0; i--) {
            var c0Row = c0[i];
            var x = c0Row[2] * m + c0Row[3] * m1 + c0Row[4] * f + c0Row[5] * om;
            x = c0Row[0] * Math.sin(x / 180 * Math.PI);
            if (c0Row[1] > 0) {
                x *= e;
                if (c0Row[1] === 2) {
                    x *= e;
                }
            }
            jde += x;
        }
        for (var i = c1.length - 1; i >= 0; i--) {
            var c1Row = c1[i];
            var a = c1Row[1] + c1Row[2] * k;
            if (c1Row.length === 4) {
                a += c1Row[3] * t * t;
            }
            jde += c1Row[0] * Math.sin(a / 180 * Math.PI);
        }

        var result = Dynamical.toUniversal(Julian.toDate(jde));
        if (before) {
            if (result.getTime() >= date.getTime()) {
                return calculate(date, offset - 1, before, phase);
            }
        } else if (result.getTime() < date.getTime()) {
            return calculate(date, offset + 1, before, phase);
        }
        return result;
    }

    // horner's method, returns c0 + c1*k + c2*x^2 + ...
    function polynom(k, x, c) {
        var i = c.length - 1;
        var y = c[i];
        while (--i >= 2) {
            y = y * x + c[i];
        }
        y = y * x * x;
		return y + c[1] * k + c[0];
	}

    return {
        new: function (date, before) {
            return calculate(date, 0, before, 0);
        },
        firstQuarter: function (date, before) {
            return calculate(date, 0, before, 1);
        },
        full: function (date, before) {
            return calculate(date, 0, before, 2);
        },
        lastQuarter: function (date, before) {
            return calculate(date, 0, before, 3);
        }
    };
})();