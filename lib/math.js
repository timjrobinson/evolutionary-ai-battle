"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.distanceBetweenPoints = distanceBetweenPoints;
exports.translateMatrix = translateMatrix;
exports.rotateMatrix = rotateMatrix;
exports.rotateAroundPoint = rotateAroundPoint;
exports.degreesToRadians = degreesToRadians;
exports.multiplyMatrixAndPoint = multiplyMatrixAndPoint;
exports.sigmoid = sigmoid;
function distanceBetweenPoints(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

function translateMatrix(matrix, point) {
    var resultX = matrix[0] + point[0];
    var resultY = matrix[1] + point[1];

    return [resultX, resultY];
}

function rotateMatrix(matrix, point) {
    var resultX = matrix[0][0] * point[0] + matrix[0][1] * point[1];
    var resultY = matrix[1][0] * point[0] + matrix[1][1] * point[1];

    return [resultX, resultY];
}

function rotateAroundPoint(pivotX, pivotY, angle, point) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    point[0] -= pivotX;
    point[1] -= pivotY;

    var rotatedX = point[0] * c - point[1] * s;
    var rotatedY = point[0] * s + point[1] * c;

    var resultX = rotatedX + pivotX;
    var resultY = rotatedY + pivotY;

    return [resultX, resultY];
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function multiplyMatrixAndPoint(matrix, point) {

    var x = point[0];
    var y = point[1];
    var w = 1;

    var resultX = x * matrix[0][0] + y * matrix[0][1] + w * matrix[0][2];
    var resultY = x * matrix[1][0] + y * matrix[1][1] + w * matrix[1][2];

    return [resultX, resultY];
}

function sigmoid(value) {
    // return 1 / (1 + Math.pow(Math.E, -value));

    return 2 / (1 + Math.exp(-4.9 * value)) - 1;
}