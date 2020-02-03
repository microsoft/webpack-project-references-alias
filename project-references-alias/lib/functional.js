"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
function flatten(array) {
    return array.reduce(function (prev, cur) { return __spreadArrays(prev, cur); }, []);
}
exports.flatten = flatten;
function flattenObject(array) {
    return array.reduce(function (prev, cur) { return (__assign(__assign({}, prev), cur)); });
}
exports.flattenObject = flattenObject;
function dedupe(array) {
    return array.filter(function (value, index, array) { return index === array.indexOf(value); });
}
exports.dedupe = dedupe;
