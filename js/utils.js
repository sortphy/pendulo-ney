/**
 * Funções utilitárias para a simulação do pêndulo invertido
 */

// Constantes físicas
const GRAVITY = 9.81; // m/s²
const PENDULUM_LENGTH = 1.0; // m
const CART_MASS = 1.0; // kg
const PENDULUM_MASS = 0.1; // kg

// Funções matemáticas úteis
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

// Função para limitar um valor entre min e max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Função para mapear um valor de um intervalo para outro
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Função para calcular a distância entre dois pontos
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Função para gerar um número aleatório entre min e max
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Função para gerar um número inteiro aleatório entre min e max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para desenhar uma linha no canvas
function drawLine(ctx, x1, y1, x2, y2, color = 'black', width = 1) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

// Função para desenhar um círculo no canvas
function drawCircle(ctx, x, y, radius, color = 'black', fill = true) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

// Função para desenhar um retângulo no canvas
function drawRect(ctx, x, y, width, height, color = 'black', fill = true) {
    if (fill) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    } else {
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, width, height);
    }
}

// Função para desenhar texto no canvas
function drawText(ctx, text, x, y, color = 'black', font = '12px Arial', align = 'center') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

// Função para limpar o canvas
function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Função para calcular a média de um array
function mean(array) {
    return array.reduce((a, b) => a + b, 0) / array.length;
}

// Função para calcular o desvio padrão de um array
function standardDeviation(array) {
    const avg = mean(array);
    const squareDiffs = array.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(mean(squareDiffs));
}

// Função para normalizar um array (valores entre 0 e 1)
function normalize(array) {
    const min = Math.min(...array);
    const max = Math.max(...array);
    return array.map(value => (value - min) / (max - min));
}

// Função para criar um array com valores linearmente espaçados
function linspace(start, end, num) {
    const step = (end - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + step * i);
}

// Função para criar uma matriz preenchida com zeros
function zeros(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

// Função para criar uma matriz preenchida com um valor específico
function ones(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(1));
}

// Função para criar uma matriz identidade
function eye(size) {
    return Array.from({ length: size }, (_, i) => 
        Array.from({ length: size }, (_, j) => i === j ? 1 : 0)
    );
}

// Função para calcular a transposta de uma matriz
function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// Função para multiplicar duas matrizes
function matrixMultiply(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

// Função para adicionar duas matrizes
function matrixAdd(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < a[0].length; j++) {
            result[i][j] = a[i][j] + b[i][j];
        }
    }
    return result;
}

// Função para subtrair duas matrizes
function matrixSubtract(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < a[0].length; j++) {
            result[i][j] = a[i][j] - b[i][j];
        }
    }
    return result;
}

// Função para calcular a função sigmoide
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

// Função para calcular a derivada da função sigmoide
function sigmoidDerivative(x) {
    const s = sigmoid(x);
    return s * (1 - s);
}

// Função para calcular a função ReLU
function relu(x) {
    return Math.max(0, x);
}

// Função para calcular a derivada da função ReLU
function reluDerivative(x) {
    return x > 0 ? 1 : 0;
}

// Função para calcular a função tanh
function tanh(x) {
    return Math.tanh(x);
}

// Função para calcular a derivada da função tanh
function tanhDerivative(x) {
    const t = Math.tanh(x);
    return 1 - t * t;
}

// Exportar funções
window.utils = {
    GRAVITY,
    PENDULUM_LENGTH,
    CART_MASS,
    PENDULUM_MASS,
    degToRad,
    radToDeg,
    clamp,
    mapRange,
    distance,
    random,
    randomInt,
    drawLine,
    drawCircle,
    drawRect,
    drawText,
    clearCanvas,
    mean,
    standardDeviation,
    normalize,
    linspace,
    zeros,
    ones,
    eye,
    transpose,
    matrixMultiply,
    matrixAdd,
    matrixSubtract,
    sigmoid,
    sigmoidDerivative,
    relu,
    reluDerivative,
    tanh,
    tanhDerivative
};
