

export function distanceBetweenPoints(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a*a + b*b);
}

export function translateMatrix(matrix, point) {
    const resultX = matrix[0] + point[0];
    const resultY = matrix[1] + point[1];

    return [resultX, resultY];
}

export function rotateMatrix(matrix, point) {
    const resultX = matrix[0][0] * point[0] + matrix[0][1] * point[1];
    const resultY = matrix[1][0] * point[0] + matrix[1][1] * point[1];

    return [resultX, resultY];
}

export function rotateAroundPoint(pivotX, pivotY, angle, point) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    point[0] -= pivotX;
    point[1] -= pivotY;

    const rotatedX = point[0] * c - point[1] * s;
    const rotatedY = point[0] * s + point[1] * c;

    const resultX = rotatedX + pivotX;
    const resultY = rotatedY + pivotY;

    return [resultX, resultY];
}

export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180
}

export function multiplyMatrixAndPoint(matrix, point) {

    var x = point[0];
    var y = point[1];
    var w = 1;
    
    var resultX = (x * matrix[0][0]) + (y * matrix[0][1]) + (w * matrix[0][2]);
    var resultY = (x * matrix[1][0]) + (y * matrix[1][1]) + (w * matrix[1][2]);
    
    return [resultX, resultY];
}

export function sigmoid(value) {
    // return 1 / (1 + Math.pow(Math.E, -value));

    return 2 / (1 + Math.exp(-4.9 * value)) - 1;
}