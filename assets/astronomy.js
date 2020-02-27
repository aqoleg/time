"use strict";

// convert julian date to Date object
// algorithm from Jean Meeus, astronomical algorithms, chapter 7
// Julian.toDate(jd)
// jd - julian day number, floating days from -004712-01-01T12:00:00, jd >= 0
// returns Date object
var Julian = (function () {

    function jdToDate(jd) {
        if (isNaN(jd) || jd < 0) {
            throw "requires jd >= 0";
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


// calculate equinoxes and solistices
// algorithm from Jean Meeus, astronomical algorithms, chapter 27
// Equinox.december(year), Equinox.march(year), Equinox.june(year), Equinox.september(year)
// year - full year number, integer
// returns Date object, error < 60 seconds for years from 1000 till 3000
var Equinox = (function () {
    const march = 0;
    const june = 1;
    const september = 2;
    const december = 3;
    // jde0 = cJde0[month][0] + cJde0[month][1]*y + cJde0[month][2]*y^2 + cJde0[month][3]*y^3 + cJde0[month][4]*y^4
    const cJde0 = [
        [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
        [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.0003],
        [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
        [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032]
    ];
    // s = sum( cS[i][0] * cos(cS[i][1] + cS[i][2] * t) )
    const cS = [
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
        var i = 4; // i = 1, almost the same result...
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
        return Julian.toDate(jde);
    }

    return {
        march: function (year) {
            return calculate(year, march);
        },
        june: function (year) {
            return calculate(year, june);
        },
        september: function (year) {
            return calculate(year, september);
        },
        december: function (year) {
            return calculate(year, december);
        }
    };
})();


// calculate new moon, first quarter moon, full moon and last quarter moon
// algorithm from Jean Meeus, astronomical algorithms, chapter 49
// Moon.new(date, before), Moon.firstQuarter(date, before), Moon.full(date, before), Moon.lastQuarter(date, before)
// date - Date object
// before - true (return < date) or false (default, return >= date)
// returns Date object, error < 60 seconds
var Moon = (function () {
    const newMoon = 0;
    const firstQuater = 1;
    const fullMoon = 2;
    const lastQuarter = 3;
    const kDelta = [0, 0.25, 0.5, 0.75]; // k += kDelta[phase]
    // correction0 = sum( c0[i][0] * e^c0[i][1] * sin(c0[i][2]*m + c0[i][3]*m1 + c0[i][4]*f + c0[i][5]*om) )
    const c0new = [
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
    const c0full = [
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
    const c0quarters = [
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
    const c1 = [
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
        if (phase === newMoon) {
            c0 = c0new;
        } else if (phase === fullMoon) {
            c0 = c0full;
        } else {
            c0 = c0quarters;
            var w = 0.00306 - 0.00038 * e * Math.cos(m / 180 * Math.PI);
            w += 0.00026 * Math.cos(m1 / 180 * Math.PI);
            w += -0.00002 * Math.cos((m1 - m) / 180 * Math.PI);
            w += 0.00002 * Math.cos((m1 + m) / 180 * Math.PI);
            w += 0.00002 * Math.cos(2 * f / 180 * Math.PI);
            if (phase === firstQuater) {
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

        var result = Julian.toDate(jde);
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
            return calculate(date, 0, before, newMoon);
        },
        firstQuarter: function (date, before) {
            return calculate(date, 0, before, firstQuater);
        },
        full: function (date, before) {
            return calculate(date, 0, before, fullMoon);
        },
        lastQuarter: function (date, before) {
            return calculate(date, 0, before, lastQuarter);
        }
    };
})();