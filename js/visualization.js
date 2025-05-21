/**
 * Visualização da simulação do pêndulo invertido
 */
class PendulumVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensões do pêndulo e do carro
        this.pendulumLength = 150; // pixels
        this.cartWidth = 80;
        this.cartHeight = 40;
        this.pendulumRadius = 15;
        
        // Escala para converter metros em pixels
        this.scale = 50; // pixels por metro
        
        // Posição base do carro (centro vertical do canvas)
        this.baseY = this.canvas.height / 2 + 50;
        
        // Limites da trilha
        this.trackWidth = this.canvas.width - 100;
        
        // Cores
        this.colors = {
            background: '#f5f5f5',
            track: '#ddd',
            cart: '#3498db',
            pendulum: '#e74c3c',
            pendulumJoint: '#2c3e50',
            grid: '#eee',
            text: '#555'
        };
    }
    
    // Limpar o canvas
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Desenhar a grade de fundo
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        // Linhas horizontais
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Linhas verticais
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    // Desenhar a trilha do carro
    drawTrack() {
        const trackY = this.baseY + this.cartHeight / 2;
        const trackX = (this.canvas.width - this.trackWidth) / 2;
        
        // Trilha principal
        this.ctx.fillStyle = this.colors.track;
        this.ctx.fillRect(trackX, trackY - 5, this.trackWidth, 10);
        
        // Marcações da trilha
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        const centerX = this.canvas.width / 2;
        const markStep = this.scale; // 1 metro
        
        for (let x = centerX - 5 * markStep; x <= centerX + 5 * markStep; x += markStep) {
            // Marcação vertical
            this.ctx.fillStyle = this.colors.track;
            this.ctx.fillRect(x, trackY - 10, 2, 20);
            
            // Texto da posição
            const position = (x - centerX) / this.scale;
            this.ctx.fillStyle = this.colors.text;
            this.ctx.fillText(position.toFixed(0) + 'm', x, trackY + 25);
        }
    }
    
    // Desenhar o carro
    drawCart(position) {
        const cartX = this.canvas.width / 2 + position * this.scale - this.cartWidth / 2;
        const cartY = this.baseY - this.cartHeight / 2;
        
        // Corpo do carro
        this.ctx.fillStyle = this.colors.cart;
        this.ctx.fillRect(cartX, cartY, this.cartWidth, this.cartHeight);
        
        // Rodas
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(cartX + 20, cartY + this.cartHeight, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(cartX + this.cartWidth - 20, cartY + this.cartHeight, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ponto de articulação do pêndulo
        this.ctx.fillStyle = this.colors.pendulumJoint;
        this.ctx.beginPath();
        this.ctx.arc(cartX + this.cartWidth / 2, cartY, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Desenhar o pêndulo
    drawPendulum(position, angle) {
        const jointX = this.canvas.width / 2 + position * this.scale;
        const jointY = this.baseY - this.cartHeight / 2;
        
        // Calcular a posição da extremidade do pêndulo
        const pendulumEndX = jointX + Math.sin(angle) * this.pendulumLength;
        const pendulumEndY = jointY - Math.cos(angle) * this.pendulumLength;
        
        // Desenhar a haste do pêndulo
        this.ctx.strokeStyle = this.colors.pendulum;
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(jointX, jointY);
        this.ctx.lineTo(pendulumEndX, pendulumEndY);
        this.ctx.stroke();
        
        // Desenhar a massa do pêndulo
        this.ctx.fillStyle = this.colors.pendulum;
        this.ctx.beginPath();
        this.ctx.arc(pendulumEndX, pendulumEndY, this.pendulumRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Desenhar o ângulo
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Ângulo: ${utils.radToDeg(angle).toFixed(1)}°`, 20, 30);
        
        // Desenhar a posição do carro
        this.ctx.fillText(`Posição: ${position.toFixed(2)}m`, 20, 50);
    }
    
    // Desenhar informações de estado
    drawInfo(state, controlSystem) {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'right';
        
        const x = this.canvas.width - 20;
        let y = 30;
        
        // Tipo de sistema de controle
        let systemType = "Nenhum";
        if (controlSystem instanceof FuzzyInferenceSystem) {
            systemType = "Sistema FIS";
        } else if (controlSystem instanceof GeneticFuzzySystem) {
            systemType = "Sistema Genético-Fuzzy";
        } else if (controlSystem instanceof NeuroFuzzySystem) {
            systemType = "Sistema Neuro-Fuzzy";
        }
        
        this.ctx.fillText(`Sistema: ${systemType}`, x, y);
        y += 20;
        
        // Velocidade angular
        this.ctx.fillText(`Vel. Angular: ${utils.radToDeg(state.angularVelocity).toFixed(1)}°/s`, x, y);
        y += 20;
        
        // Velocidade do carro
        this.ctx.fillText(`Vel. Carro: ${state.cartVelocity.toFixed(2)}m/s`, x, y);
        y += 20;
        
        // Tempo de simulação
        this.ctx.fillText(`Tempo: ${state.time.toFixed(1)}s`, x, y);
    }
    
    // Renderizar a simulação
    render(simulation) {
        const state = simulation.getState();
        
        this.clear();
        this.drawGrid();
        this.drawTrack();
        this.drawCart(state.cartPosition);
        this.drawPendulum(state.cartPosition, state.angle);
        this.drawInfo(state, simulation.controlSystem);
    }
}

/**
 * Visualização das funções de pertinência fuzzy
 */
class MembershipFunctionVisualization {
    constructor(canvasId, title, range) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.title = title;
        this.range = range || { min: -50, max: 50 };
        
        // Margens
        this.margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        };
        
        // Área útil
        this.width = this.canvas.width - this.margin.left - this.margin.right;
        this.height = this.canvas.height - this.margin.top - this.margin.bottom;
        
        // Cores para cada função de pertinência
        this.colors = {
            N: '#e74c3c',  // Vermelho
            Z: '#2ecc71',  // Verde
            P: '#3498db',  // Azul
            NB: '#e67e22', // Laranja
            PB: '#9b59b6'  // Roxo
        };
    }
    
    // Converter valor do domínio para coordenada X
    scaleX(value) {
        return this.margin.left + (value - this.range.min) / (this.range.max - this.range.min) * this.width;
    }
    
    // Converter valor de pertinência para coordenada Y
    scaleY(value) {
        return this.margin.top + this.height - value * this.height;
    }
    
    // Limpar o canvas
    clear() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Desenhar os eixos
    drawAxes() {
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        
        // Eixo X
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top + this.height);
        this.ctx.lineTo(this.margin.left + this.width, this.margin.top + this.height);
        this.ctx.stroke();
        
        // Eixo Y
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top);
        this.ctx.lineTo(this.margin.left, this.margin.top + this.height);
        this.ctx.stroke();
        
        // Marcações no eixo X
        this.ctx.fillStyle = '#555';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        
        const step = (this.range.max - this.range.min) / 5;
        for (let i = 0; i <= 5; i++) {
            const value = this.range.min + i * step;
            const x = this.scaleX(value);
            
            // Linha de marcação
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.margin.top + this.height);
            this.ctx.lineTo(x, this.margin.top + this.height + 5);
            this.ctx.stroke();
            
            // Texto
            this.ctx.fillText(value.toFixed(0), x, this.margin.top + this.height + 15);
        }
        
        // Marcações no eixo Y
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = i / 5;
            const y = this.scaleY(value);
            
            // Linha de marcação
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left - 5, y);
            this.ctx.lineTo(this.margin.left, y);
            this.ctx.stroke();
            
            // Texto
            this.ctx.fillText(value.toFixed(1), this.margin.left - 8, y + 3);
        }
        
        // Título
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.title, this.canvas.width / 2, 12);
    }
    
    // Desenhar uma função de pertinência
    drawMembershipFunction(label, values, domain) {
        this.ctx.strokeStyle = this.colors[label];
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.scaleX(domain[0]), this.scaleY(values[0]));
        
        for (let i = 1; i < domain.length; i++) {
            this.ctx.lineTo(this.scaleX(domain[i]), this.scaleY(values[i]));
        }
        
        this.ctx.stroke();
        
        // Adicionar rótulo
        const lastIndex = values.length - 1;
        const midIndex = Math.floor(values.length / 2);
        let maxIndex = 0;
        let maxValue = values[0];
        
        for (let i = 1; i < values.length; i++) {
            if (values[i] > maxValue) {
                maxValue = values[i];
                maxIndex = i;
            }
        }
        
        if (maxValue > 0.5) {
            this.ctx.fillStyle = this.colors[label];
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(label, this.scaleX(domain[maxIndex]), this.scaleY(maxValue) - 10);
        }
    }
    
    // Renderizar as funções de pertinência
    render(membershipFunctions) {
        this.clear();
        this.drawAxes();
        
        // Criar um domínio de valores
        const domain = utils.linspace(this.range.min, this.range.max, 100);
        
        // Desenhar cada função de pertinência
        for (const [label, values] of Object.entries(membershipFunctions)) {
            this.drawMembershipFunction(label, values, domain);
        }
    }
}

/**
 * Visualização de gráficos de desempenho
 */
class PerformanceGraph {
    constructor(canvasId, title, xLabel, yLabel) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.title = title;
        this.xLabel = xLabel;
        this.yLabel = yLabel;
        
        // Margens
        this.margin = {
            top: 30,
            right: 30,
            bottom: 40,
            left: 60
        };
        
        // Área útil
        this.width = this.canvas.width - this.margin.left - this.margin.right;
        this.height = this.canvas.height - this.margin.top - this.margin.bottom;
        
        // Dados
        this.data = [];
        
        // Limites dos dados
        this.xMin = 0;
        this.xMax = 10;
        this.yMin = -50;
        this.yMax = 50;
        
        // Cores
        this.colors = {
            line: '#3498db',
            grid: '#eee',
            axis: '#999',
            text: '#555'
        };
    }
    
    // Atualizar os dados
    setData(data, xKey, yKey) {
        this.data = data.map(item => ({ x: item[xKey], y: item[yKey] }));
        
        // Atualizar limites
        if (this.data.length > 0) {
            this.xMin = Math.min(...this.data.map(d => d.x));
            this.xMax = Math.max(...this.data.map(d => d.x));
            this.yMin = Math.min(...this.data.map(d => d.y));
            this.yMax = Math.max(...this.data.map(d => d.y));
            
            // Adicionar margem aos limites
            const xMargin = (this.xMax - this.xMin) * 0.1 || 1;
            const yMargin = (this.yMax - this.yMin) * 0.1 || 5;
            
            this.xMin -= xMargin;
            this.xMax += xMargin;
            this.yMin -= yMargin;
            this.yMax += yMargin;
        }
    }
    
    // Converter valor X para coordenada X
    scaleX(value) {
        return this.margin.left + (value - this.xMin) / (this.xMax - this.xMin) * this.width;
    }
    
    // Converter valor Y para coordenada Y
    scaleY(value) {
        return this.margin.top + this.height - (value - this.yMin) / (this.yMax - this.yMin) * this.height;
    }
    
    // Limpar o canvas
    clear() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Desenhar a grade
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        // Linhas horizontais
        const yStep = (this.yMax - this.yMin) / 5;
        for (let i = 0; i <= 5; i++) {
            const y = this.yMin + i * yStep;
            const canvasY = this.scaleY(y);
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left, canvasY);
            this.ctx.lineTo(this.margin.left + this.width, canvasY);
            this.ctx.stroke();
        }
        
        // Linhas verticais
        const xStep = (this.xMax - this.xMin) / 5;
        for (let i = 0; i <= 5; i++) {
            const x = this.xMin + i * xStep;
            const canvasX = this.scaleX(x);
            
            this.ctx.beginPath();
            this.ctx.moveTo(canvasX, this.margin.top);
            this.ctx.lineTo(canvasX, this.margin.top + this.height);
            this.ctx.stroke();
        }
    }
    
    // Desenhar os eixos
    drawAxes() {
        this.ctx.strokeStyle = this.colors.axis;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        
        // Eixo X
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top + this.height);
        this.ctx.lineTo(this.margin.left + this.width, this.margin.top + this.height);
        this.ctx.stroke();
        
        // Marcações no eixo X
        this.ctx.textAlign = 'center';
        const xStep = (this.xMax - this.xMin) / 5;
        for (let i = 0; i <= 5; i++) {
            const x = this.xMin + i * xStep;
            const canvasX = this.scaleX(x);
            
            // Linha de marcação
            this.ctx.beginPath();
            this.ctx.moveTo(canvasX, this.margin.top + this.height);
            this.ctx.lineTo(canvasX, this.margin.top + this.height + 5);
            this.ctx.stroke();
            
            // Texto
            this.ctx.fillText(x.toFixed(1), canvasX, this.margin.top + this.height + 20);
        }
        
        // Rótulo do eixo X
        this.ctx.fillText(this.xLabel, this.margin.left + this.width / 2, this.canvas.height - 10);
        
        // Eixo Y
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top);
        this.ctx.lineTo(this.margin.left, this.margin.top + this.height);
        this.ctx.stroke();
        
        // Marcações no eixo Y
        this.ctx.textAlign = 'right';
        const yStep = (this.yMax - this.yMin) / 5;
        for (let i = 0; i <= 5; i++) {
            const y = this.yMin + i * yStep;
            const canvasY = this.scaleY(y);
            
            // Linha de marcação
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left - 5, canvasY);
            this.ctx.lineTo(this.margin.left, canvasY);
            this.ctx.stroke();
            
            // Texto
            this.ctx.fillText(y.toFixed(1), this.margin.left - 10, canvasY + 4);
        }
        
        // Rótulo do eixo Y
        this.ctx.save();
        this.ctx.translate(15, this.margin.top + this.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.yLabel, 0, 0);
        this.ctx.restore();
        
        // Título
        this.ctx.textAlign = 'center';
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText(this.title, this.canvas.width / 2, 15);
    }
    
    // Desenhar a linha de dados
    drawLine() {
        if (this.data.length === 0) return;
        
        this.ctx.strokeStyle = this.colors.line;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const firstPoint = this.data[0];
        this.ctx.moveTo(this.scaleX(firstPoint.x), this.scaleY(firstPoint.y));
        
        for (let i = 1; i < this.data.length; i++) {
            const point = this.data[i];
            this.ctx.lineTo(this.scaleX(point.x), this.scaleY(point.y));
        }
        
        this.ctx.stroke();
    }
    
    // Renderizar o gráfico
    render() {
        this.clear();
        this.drawGrid();
        this.drawAxes();
        this.drawLine();
    }
}

/**
 * Visualização da rede neural
 */
class NeuralNetworkVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Margens
        this.margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 30
        };
        
        // Área útil
        this.width = this.canvas.width - this.margin.left - this.margin.right;
        this.height = this.canvas.height - this.margin.top - this.margin.bottom;
        
        // Cores
        this.colors = {
            background: 'white',
            neuron: '#3498db',
            connection: '#bdc3c7',
            text: '#555'
        };
        
        // Tamanho dos neurônios
        this.neuronRadius = 10;
    }
    
    // Limpar o canvas
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Desenhar um neurônio
    drawNeuron(x, y, label = '') {
        this.ctx.fillStyle = this.colors.neuron;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.neuronRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        if (label) {
            this.ctx.fillStyle = this.colors.text;
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(label, x, y + this.neuronRadius + 12);
        }
    }
    
    // Desenhar uma conexão entre neurônios
    drawConnection(x1, y1, x2, y2) {
        this.ctx.strokeStyle = this.colors.connection;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    
    // Renderizar a rede neural
    render(networkStructure) {
        this.clear();
        
        const { inputSize, hiddenLayers, neuronsPerLayer, outputSize } = networkStructure;
        
        // Calcular o número total de camadas
        const totalLayers = 2 + hiddenLayers; // entrada + camadas ocultas + saída
        
        // Calcular o espaçamento horizontal entre camadas
        const layerSpacing = this.width / (totalLayers - 1);
        
        // Desenhar as camadas
        const layers = [
            inputSize,
            ...Array(hiddenLayers).fill(neuronsPerLayer),
            outputSize
        ];
        
        // Armazenar as posições dos neurônios para desenhar as conexões
        const neuronPositions = [];
        
        // Desenhar cada camada
        for (let l = 0; l < layers.length; l++) {
            const numNeurons = layers[l];
            const x = this.margin.left + l * layerSpacing;
            
            // Calcular o espaçamento vertical entre neurônios
            const maxNeurons = Math.max(...layers);
            const neuronSpacing = Math.min(this.height / (maxNeurons - 1), 30);
            const layerHeight = (numNeurons - 1) * neuronSpacing;
            const startY = this.margin.top + (this.height - layerHeight) / 2;
            
            neuronPositions[l] = [];
            
            // Desenhar os neurônios da camada
            for (let n = 0; n < numNeurons; n++) {
                const y = startY + n * neuronSpacing;
                neuronPositions[l][n] = { x, y };
                
                // Rótulo para a primeira e última camada
                let label = '';
                if (l === 0) {
                    if (n < 3) label = 'Ang ' + ['N', 'Z', 'P'][n];
                    else if (n < 6) label = 'AngV ' + ['N', 'Z', 'P'][n - 3];
                    else if (n < 9) label = 'Pos ' + ['N', 'Z', 'P'][n - 6];
                    else label = 'Vel ' + ['N', 'Z', 'P'][n - 9];
                } else if (l === layers.length - 1) {
                    label = ['NB', 'N', 'Z', 'P', 'PB'][n];
                }
                
                this.drawNeuron(x, y, label);
            }
        }
        
        // Desenhar as conexões entre camadas
        for (let l = 0; l < layers.length - 1; l++) {
            const fromLayer = neuronPositions[l];
            const toLayer = neuronPositions[l + 1];
            
            for (let from = 0; from < fromLayer.length; from++) {
                for (let to = 0; to < toLayer.length; to++) {
                    this.drawConnection(
                        fromLayer[from].x, fromLayer[from].y,
                        toLayer[to].x, toLayer[to].y
                    );
                }
            }
        }
        
        // Adicionar rótulos das camadas
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        
        this.ctx.fillText('Entrada', this.margin.left, this.canvas.height - 10);
        
        for (let l = 1; l < layers.length - 1; l++) {
            const x = this.margin.left + l * layerSpacing;
            this.ctx.fillText(`Oculta ${l}`, x, this.canvas.height - 10);
        }
        
        this.ctx.fillText('Saída', this.margin.left + (layers.length - 1) * layerSpacing, this.canvas.height - 10);
    }
}

/**
 * Visualização das regras fuzzy otimizadas
 */
class RuleVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Cores para as saídas
        this.colors = {
            NB: '#e74c3c', // Vermelho
            N: '#e67e22',  // Laranja
            Z: '#f1c40f',  // Amarelo
            P: '#2ecc71',  // Verde
            PB: '#3498db'  // Azul
        };
        
        // Tamanho das células
        this.cellSize = 40;
        
        // Margens
        this.margin = {
            top: 60,
            right: 20,
            bottom: 20,
            left: 60
        };
    }
    
    // Limpar o canvas
    clear() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Renderizar a visualização das regras
    render(ruleVisualization) {
        this.clear();
        
        if (!ruleVisualization) return;
        
        // Desenhar a tabela de regras do pêndulo
        this.drawRuleTable(
            ruleVisualization.pendulumRules,
            'Ângulo',
            'Velocidade Angular',
            this.margin.left,
            this.margin.top,
            'Regras do Pêndulo'
        );
        
        // Desenhar a tabela de regras do carro
        this.drawRuleTable(
            ruleVisualization.cartRules,
            'Posição',
            'Velocidade',
            this.margin.left,
            this.margin.top + 200,
            'Regras do Carro'
        );
        
        // Desenhar os pesos
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Peso do Pêndulo: ${ruleVisualization.pendulumWeight.toFixed(2)}`, this.margin.left, this.margin.top + 380);
        this.ctx.fillText(`Peso do Carro: ${ruleVisualization.cartWeight.toFixed(2)}`, this.margin.left, this.margin.top + 400);
    }
    
    // Desenhar uma tabela de regras
    drawRuleTable(rules, rowLabel, colLabel, x, y, title) {
        // Título
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, x + 150, y - 30);
        
        // Rótulos das colunas (N, Z, P)
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        
        const labels = ['N', 'Z', 'P'];
        for (let i = 0; i < 3; i++) {
            this.ctx.fillText(labels[i], x + (i + 1) * this.cellSize + this.cellSize / 2, y - 10);
        }
        
        // Rótulo das linhas
        this.ctx.textAlign = 'right';
        for (let i = 0; i < 3; i++) {
            this.ctx.fillText(labels[i], x - 10, y + (i + 1) * this.cellSize - this.cellSize / 2);
        }
        
        // Rótulos dos eixos
        this.ctx.textAlign = 'center';
        this.ctx.fillText(colLabel, x + 2 * this.cellSize, y - 40);
        
        this.ctx.save();
        this.ctx.translate(x - 40, y + 2 * this.cellSize);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(rowLabel, 0, 0);
        this.ctx.restore();
        
        // Desenhar as células com as regras
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                const rule = rules[index];
                
                // Célula
                const cellX = x + j * this.cellSize;
                const cellY = y + i * this.cellSize;
                
                // Fundo da célula
                this.ctx.fillStyle = this.colors[rule.optimizedOutput];
                this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Borda da célula
                this.ctx.strokeStyle = '#555';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Texto da regra
                this.ctx.fillStyle = 'black';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(rule.optimizedOutput, cellX + this.cellSize / 2, cellY + this.cellSize / 2);
                
                // Indicador de mudança
                if (rule.originalOutput !== rule.optimizedOutput) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.font = '10px Arial';
                    this.ctx.fillText(`(${rule.originalOutput})`, cellX + this.cellSize / 2, cellY + this.cellSize / 2 + 15);
                }
            }
        }
    }
}

// Exportar as classes
window.PendulumVisualization = PendulumVisualization;
window.MembershipFunctionVisualization = MembershipFunctionVisualization;
window.PerformanceGraph = PerformanceGraph;
window.NeuralNetworkVisualization = NeuralNetworkVisualization;
window.RuleVisualization = RuleVisualization;
