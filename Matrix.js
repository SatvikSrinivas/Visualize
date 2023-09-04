export const apply = (matrix, vec) => { // 3x3 matrix on a 3D vector
    const x = vec[0], y = vec[1], z = vec[2];
    const output = [
        matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z,
        matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z,
        matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z
    ];
    return output;
}

export function matricesAreEqual(matrix1, matrix2) {
    if (matrix1 === null && matrix2 === null)
        return true;
    if (matrix1 === null || matrix2 === null)
        return false;
    if (matrix1.length !== matrix2.length) {
        return false; // Matrices have different number of rows
    }
    for (var i = 0; i < matrix1.length; i++) {
        if (matrix1[i].length !== matrix2[i].length) {
            return false; // Rows have different number of elements
        }
        for (var j = 0; j < matrix1[i].length; j++) {
            if (matrix1[i][j] !== matrix2[i][j]) {
                return false; // Elements at (i, j) are not equal
            }
        }
    }
    return true; // All elements are equal
}

export const projOnToLine = (dir, vec) => {
    let lineX = dir[0], lineY = dir[1], lineZ = dir[2];
    const dirNorm = Math.sqrt(lineX * lineX + lineY * lineY + lineZ * lineZ);
    lineX /= dirNorm;
    lineY /= dirNorm;
    lineZ /= dirNorm;
    const projMag = lineX * vec[0] + lineY * vec[1] + lineZ * vec[2];
    return [projMag * lineX, projMag * lineY, projMag * lineZ];
}

const add = (vec1, vec2) => {
    return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
}

export const projOnToPlane = (dir1, dir2, vec) => {
    return add(projOnToLine(dir1, vec), projOnToLine(dir2, vec));
}

export const IDENTITY = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
];