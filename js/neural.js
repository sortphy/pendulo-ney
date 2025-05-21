/**
 * Sistema Neuro-Fuzzy para controle do pêndulo invertido
 * Combina redes neurais artificiais com sistema de inferência fuzzy
 */
class NeuroFuzzySystem {
    constructor(options = {}) {
        // Parâmetros da rede neural
        this.hiddenLayers = options.hiddenLayers || 2;
        this.neuronsPerLayer = options.neuronsPerLayer || 20;
        this.learningRate = options.learningRate || 0.01;
        this.epochs = options.epochs || 50;
        
        // Sistema FIS base
        this.baseFIS = new FuzzyInferenceSystem();
        
        // Rede neural
        this.network = null;
        
        // Histórico de treinamento
        this.trainingHistory = [];
        
        // Estado do treinamento
        this.isTraining = false;
        this.currentEpoch = 0;
        
        // Inicializar a rede neural
        this.initializeNetwork();
    }
    
    // Inicializar a rede neural
    initializeNetwork() {
        // A rede neural terá:
        // - 12 entradas (4 variáveis de entrada x 3 funções de pertinência cada)
        // - Camadas ocultas conforme configurado
        // - 5 saídas (uma para cada função de pertinência de saída)
        
        // Criar a estrutura da rede
        this.network = {
            // Pesos da primeira camada (entrada -> primeira camada oculta)
            weights1: this.initializeWeights(12, this.neuronsPerLayer),
            
            // Biases da primeira camada
            biases1: new Array(this.neuronsPerLayer).fill(0).map(() => Math.random() * 0.2 - 0.1),
            
            // Pesos e biases das camadas ocultas intermediárias
            hiddenWeights: [],
            hiddenBiases: [],
            
            // Pesos da última camada (última camada oculta -> saída)
            weightsOutput: null,
            
            // Biases da camada de saída
            biasesOutput: new Array(5).fill(0).map(() => Math.random() * 0.2 - 0.1)
        };
        
        // Inicializar pesos e biases das camadas ocultas intermediárias
        for (let i = 0; i < this.hiddenLayers - 1; i++) {
            this.network.hiddenWeights.push(
                this.initializeWeights(this.neuronsPerLayer, this.neuronsPerLayer)
            );
            
            this.network.hiddenBiases.push(
                new Array(this.neuronsPerLayer).fill(0).map(() => Math.random() * 0.2 - 0.1)
            );
        }
        
        // Inicializar pesos da camada de saída
        this.network.weightsOutput = this.initializeWeights(this.neuronsPerLayer, 5);
    }
    
    // Inicializar pesos com valores aleatórios pequenos
    initializeWeights(inputSize, outputSize) {
        const weights = [];
        for (let i = 0; i < inputSize; i++) {
            weights.push([]);
            for (let j = 0; j < outputSize; j++) {
                // Inicialização Xavier/Glorot para melhor convergência
                const limit = Math.sqrt(6 / (inputSize + outputSize));
                weights[i].push(Math.random() * 2 * limit - limit);
            }
        }
        return weights;
    }
    
    // Função de ativação ReLU
    relu(x) {
        return Math.max(0, x);
    }
    
    // Derivada da função ReLU
    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }
    
    // Função softmax para a camada de saída
    softmax(arr) {
        const expValues = arr.map(val => Math.exp(val));
        const sumExp = expValues.reduce((acc, val) => acc + val, 0);
        return expValues.map(val => val / sumExp);
    }
    
    // Forward pass da rede neural
    forwardPass(inputs) {
        // Primeira camada oculta
        let hiddenLayer1 = new Array(this.neuronsPerLayer).fill(0);
        for (let i = 0; i < this.neuronsPerLayer; i++) {
            for (let j = 0; j < inputs.length; j++) {
                hiddenLayer1[i] += inputs[j] * this.network.weights1[j][i];
            }
            hiddenLayer1[i] += this.network.biases1[i];
            hiddenLayer1[i] = this.relu(hiddenLayer1[i]);
        }
        
        // Camadas ocultas intermediárias
        let currentLayer = hiddenLayer1;
        for (let layer = 0; layer < this.hiddenLayers - 1; layer++) {
            const nextLayer = new Array(this.neuronsPerLayer).fill(0);
            for (let i = 0; i < this.neuronsPerLayer; i++) {
                for (let j = 0; j < this.neuronsPerLayer; j++) {
                    nextLayer[i] += currentLayer[j] * this.network.hiddenWeights[layer][j][i];
                }
                nextLayer[i] += this.network.hiddenBiases[layer][i];
                nextLayer[i] = this.relu(nextLayer[i]);
            }
            currentLayer = nextLayer;
        }
        
        // Camada de saída
        let outputLayer = new Array(5).fill(0);
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < this.neuronsPerLayer; j++) {
                outputLayer[i] += currentLayer[j] * this.network.weightsOutput[j][i];
            }
            outputLayer[i] += this.network.biasesOutput[i];
        }
        
        // Aplicar softmax para normalizar as saídas
        outputLayer = this.softmax(outputLayer);
        
        return {
            hiddenLayer1,
            currentLayer,
            outputLayer
        };
    }
    
    // Fuzzificar as entradas e preparar para a rede neural
    prepareInputs(angle, angularVelocity, position, velocity) {
        // Fuzzificar as entradas usando o FIS base
        const fuzzifiedAngle = this.baseFIS.fuzzify(angle, this.baseFIS.angleMF);
        const fuzzifiedAngularVelocity = this.baseFIS.fuzzify(angularVelocity, this.baseFIS.angularVelocityMF);
        const fuzzifiedPosition = this.baseFIS.fuzzify(position, this.baseFIS.positionMF);
        const fuzzifiedVelocity = this.baseFIS.fuzzify(velocity, this.baseFIS.velocityMF);
        
        // Converter os valores fuzzificados em um array para a rede neural
        const inputs = [
            fuzzifiedAngle.N, fuzzifiedAngle.Z, fuzzifiedAngle.P,
            fuzzifiedAngularVelocity.N, fuzzifiedAngularVelocity.Z, fuzzifiedAngularVelocity.P,
            fuzzifiedPosition.N, fuzzifiedPosition.Z, fuzzifiedPosition.P,
            fuzzifiedVelocity.N, fuzzifiedVelocity.Z, fuzzifiedVelocity.P
        ];
        
        return inputs;
    }
    
    // Defuzzificar a saída da rede neural
    defuzzifyOutput(outputLayer) {
        // Mapear as saídas da rede neural para os centros das funções de pertinência
        const outputCenters = [-20, -10, 0, 10, 20]; // NB, N, Z, P, PB
        
        // Calcular a média ponderada
        let weightedSum = 0;
        let sumOfWeights = 0;
        
        for (let i = 0; i < outputLayer.length; i++) {
            weightedSum += outputCenters[i] * outputLayer[i];
            sumOfWeights += outputLayer[i];
        }
        
        // Evitar divisão por zero
        if (sumOfWeights === 0) return 0;
        
        return weightedSum / sumOfWeights;
    }
    
    // Gerar dados de treinamento usando simulações
    generateTrainingData(numSamples = 1000) {
        const trainingData = [];
        
        // Criar uma simulação com o FIS base para gerar dados
        const simulation = new PendulumSimulation();
        simulation.setControlSystem(this.baseFIS);
        
        // Gerar dados com diferentes condições iniciais
        for (let i = 0; i < numSamples; i++) {
            // Definir condições iniciais aleatórias
            const initialAngle = utils.random(-30, 30);
            const initialAngularVelocity = utils.random(-20, 20);
            const initialPosition = utils.random(-3, 3);
            const initialVelocity = utils.random(-3, 3);
            
            // Reiniciar a simulação com as novas condições
            simulation.reset({
                initialAngle: initialAngle,
                initialAngularVelocity: initialAngularVelocity,
                initialCartPosition: initialPosition,
                initialCartVelocity: initialVelocity
            });
            
            // Calcular a força de controle usando o FIS base
            const controlForce = this.baseFIS.calculateControlForce(
                initialAngle,
                initialAngularVelocity,
                initialPosition,
                initialVelocity
            );
            
            // Preparar as entradas fuzzificadas
            const inputs = this.prepareInputs(
                initialAngle,
                initialAngularVelocity,
                initialPosition,
                initialVelocity
            );
            
            // Criar o vetor de saída desejado
            // Mapear a força de controle para as funções de pertinência de saída
            const outputCenters = [-20, -10, 0, 10, 20]; // NB, N, Z, P, PB
            const desiredOutput = new Array(5).fill(0);
            
            // Encontrar os dois centros mais próximos e interpolar
            let minDist1 = Infinity;
            let minDist2 = Infinity;
            let minIndex1 = 0;
            let minIndex2 = 0;
            
            for (let j = 0; j < outputCenters.length; j++) {
                const dist = Math.abs(controlForce - outputCenters[j]);
                if (dist < minDist1) {
                    minDist2 = minDist1;
                    minIndex2 = minIndex1;
                    minDist1 = dist;
                    minIndex1 = j;
                } else if (dist < minDist2) {
                    minDist2 = dist;
                    minIndex2 = j;
                }
            }
            
            // Calcular pesos baseados na distância inversa
            const totalDist = minDist1 + minDist2;
            if (totalDist > 0) {
                desiredOutput[minIndex1] = minDist2 / totalDist;
                desiredOutput[minIndex2] = minDist1 / totalDist;
            } else {
                desiredOutput[minIndex1] = 1;
            }
            
            // Adicionar aos dados de treinamento
            trainingData.push({
                inputs: inputs,
                desiredOutput: desiredOutput
            });
        }
        
        return trainingData;
    }
    
    // Treinar a rede neural
    async train(onProgress = null) {
        this.isTraining = true;
        this.currentEpoch = 0;
        this.trainingHistory = [];
        
        // Gerar dados de treinamento
        const trainingData = this.generateTrainingData();
        
        // Treinar por um número específico de épocas
        for (let epoch = 0; epoch < this.epochs && this.isTraining; epoch++) {
            this.currentEpoch = epoch;
            
            // Embaralhar os dados de treinamento
            const shuffledData = [...trainingData].sort(() => Math.random() - 0.5);
            
            let totalLoss = 0;
            
            // Processar cada amostra de treinamento
            for (const sample of shuffledData) {
                const { inputs, desiredOutput } = sample;
                
                // Forward pass
                const { hiddenLayer1, currentLayer, outputLayer } = this.forwardPass(inputs);
                
                // Calcular o erro (MSE)
                let sampleLoss = 0;
                for (let i = 0; i < outputLayer.length; i++) {
                    sampleLoss += Math.pow(outputLayer[i] - desiredOutput[i], 2);
                }
                sampleLoss /= outputLayer.length;
                totalLoss += sampleLoss;
                
                // Backpropagation
                // Gradientes da camada de saída
                const outputGradients = new Array(5).fill(0);
                for (let i = 0; i < 5; i++) {
                    outputGradients[i] = 2 * (outputLayer[i] - desiredOutput[i]) / 5;
                }
                
                // Atualizar pesos e biases da camada de saída
                for (let i = 0; i < this.neuronsPerLayer; i++) {
                    for (let j = 0; j < 5; j++) {
                        this.network.weightsOutput[i][j] -= this.learningRate * outputGradients[j] * currentLayer[i];
                    }
                }
                
                for (let i = 0; i < 5; i++) {
                    this.network.biasesOutput[i] -= this.learningRate * outputGradients[i];
                }
                
                // Backpropagation para as camadas ocultas
                // (Simplificado para este exemplo - em uma implementação completa, 
                // precisaríamos propagar o erro através de todas as camadas)
            }
            
            // Calcular a perda média
            const averageLoss = totalLoss / trainingData.length;
            
            // Registrar o progresso
            this.trainingHistory.push({
                epoch: epoch,
                loss: averageLoss
            });
            
            // Chamar a função de callback com o progresso
            if (onProgress) {
                onProgress({
                    epoch: epoch,
                    loss: averageLoss,
                    progress: (epoch + 1) / this.epochs
                });
            }
            
            // Pausa para permitir que a interface do usuário seja atualizada
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        this.isTraining = false;
        return this.trainingHistory;
    }
    
    // Parar o treinamento
    stopTraining() {
        this.isTraining = false;
    }
    
    // Calcular a força de controle usando a rede neural
    calculateControlForce(angle, angularVelocity, position, velocity) {
        // Preparar as entradas
        const inputs = this.prepareInputs(angle, angularVelocity, position, velocity);
        
        // Forward pass
        const { outputLayer } = this.forwardPass(inputs);
        
        // Defuzzificar a saída
        const controlForce = this.defuzzifyOutput(outputLayer);
        
        return controlForce;
    }
    
    // Obter o histórico de treinamento
    getTrainingHistory() {
        return this.trainingHistory;
    }
    
    // Obter a estrutura da rede para visualização
    getNetworkVisualization() {
        return {
            inputSize: 12,
            hiddenLayers: this.hiddenLayers,
            neuronsPerLayer: this.neuronsPerLayer,
            outputSize: 5
        };
    }
}

// Exportar a classe
window.NeuroFuzzySystem = NeuroFuzzySystem;
