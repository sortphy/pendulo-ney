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
        this.baseFIS = new FuzzyInferenceSystem(); // Assumes FuzzyInferenceSystem is defined elsewhere

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
        // hiddenWeights[k] connects hidden layer k to hidden layer k+1 (0-based index)
        // hiddenBiases[k] are biases for hidden layer k+1 (0-based index)
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
        const maxVal = Math.max(...arr); // Improve numerical stability
        const expValues = arr.map(val => Math.exp(val - maxVal));
        const sumExp = expValues.reduce((acc, val) => acc + val, 0);
        return expValues.map(val => val / sumExp);
    }

    // Forward pass da rede neural - MODIFIED
    forwardPass(inputs) {
        const activations = {
            input: inputs,
            hidden: [], // Stores post-activation outputs (a) for each hidden layer [0...hiddenLayers-1]
            preActivationHidden: [], // Stores pre-activation outputs (z) for each hidden layer [0...hiddenLayers-1]
            output: null, // Final output (post-softmax)
            preActivationOutput: null // Output layer pre-activation (z)
        };

        let currentLayerInput = inputs;
        let previousLayerSize = inputs.length;

        // Hidden Layers
        for (let layer = 0; layer < this.hiddenLayers; layer++) {
            const z_hidden = new Array(this.neuronsPerLayer).fill(0);
            const weights = (layer === 0) ? this.network.weights1 : this.network.hiddenWeights[layer - 1];
            const biases = (layer === 0) ? this.network.biases1 : this.network.hiddenBiases[layer - 1];

            for (let j = 0; j < this.neuronsPerLayer; j++) { // Neuron j in current layer
                for (let i = 0; i < previousLayerSize; i++) { // Neuron i in previous layer
                    z_hidden[j] += currentLayerInput[i] * weights[i][j];
                }
                z_hidden[j] += biases[j];
            }
            activations.preActivationHidden.push([...z_hidden]); // Store pre-activation (z)
            const a_hidden = z_hidden.map(this.relu);
            activations.hidden.push([...a_hidden]); // Store post-activation (a)

            currentLayerInput = a_hidden; // Output of this layer is input to the next
            previousLayerSize = this.neuronsPerLayer;
        }


        // Output layer
        const lastHiddenLayerOutput = activations.hidden[this.hiddenLayers - 1];
        let z_output = new Array(5).fill(0);
        for (let j = 0; j < 5; j++) { // Neuron j in output layer
            for (let i = 0; i < this.neuronsPerLayer; i++) { // Neuron i in last hidden layer
                z_output[j] += lastHiddenLayerOutput[i] * this.network.weightsOutput[i][j];
            }
            z_output[j] += this.network.biasesOutput[j];
        }
        activations.preActivationOutput = [...z_output]; // Store pre-activation (z)
        let a_output = this.softmax(z_output);
        activations.output = [...a_output]; // Store final output (a)

        return activations;
    }


    // Fuzzificar as entradas e preparar para a rede neural
    prepareInputs(angle, angularVelocity, position, velocity) {
        // Fuzzificar as entradas usando o FIS base
        const fuzzifiedAngle = this.baseFIS.fuzzify(angle, this.baseFIS.angleMF);
        const fuzzifiedAngularVelocity = this.baseFIS.fuzzify(angularVelocity, this.baseFIS.angularVelocityMF);
        const fuzzifiedPosition = this.baseFIS.fuzzify(position, this.baseFIS.positionMF);
        const fuzzifiedVelocity = this.baseFIS.fuzzify(velocity, this.baseFIS.velocityMF);

        // Converter os valores fuzzificados em um array para a rede neural
        // Order: Angle(N,Z,P), AngVel(N,Z,P), Pos(N,Z,P), Vel(N,Z,P)
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

        // Calcular a média ponderada (Centroid method)
        let weightedSum = 0;
        let sumOfWeights = 0;

        for (let i = 0; i < outputLayer.length; i++) {
            weightedSum += outputCenters[i] * outputLayer[i];
            sumOfWeights += outputLayer[i];
        }

        // Evitar divisão por zero
        if (sumOfWeights === 0) return 0;

        // Clamp output force to reasonable limits if necessary (e.g., -30 to 30)
        // const maxForce = 30;
        // return Math.max(-maxForce, Math.min(maxForce, weightedSum / sumOfWeights));
        return weightedSum / sumOfWeights;
    }

    // Gerar dados de treinamento usando simulações
    generateTrainingData(numSamples = 1000) {
        const trainingData = [];

        // Criar uma simulação com o FIS base para gerar dados
        // Assumes PendulumSimulation and utils are defined elsewhere
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

            // Encontrar os dois centros mais próximos e interpolar (linear interpolation)
            let minDist1 = Infinity;
            let minDist2 = Infinity;
            let minIndex1 = -1;
            let minIndex2 = -1;

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
            
            // Handle edge cases and calculate weights
            if (minIndex1 !== -1 && minIndex2 !== -1) {
                 const center1 = outputCenters[minIndex1];
                 const center2 = outputCenters[minIndex2];
                 const totalDist = Math.abs(center1 - center2);
                 if (totalDist > 1e-6) { // Avoid division by zero if centers are too close
                    // Ensure interpolation happens between the correct pair
                    const w1 = Math.abs(controlForce - center2) / totalDist;
                    const w2 = Math.abs(controlForce - center1) / totalDist;
                    desiredOutput[minIndex1] = w1;
                    desiredOutput[minIndex2] = w2;
                 } else {
                     desiredOutput[minIndex1] = 1.0; // If centers are the same, assign full weight
                 }
            } else if (minIndex1 !== -1) {
                 desiredOutput[minIndex1] = 1.0; // Only one center found (shouldn't happen with overlap)
            }
            // Normalize desired output to sum to 1 (like softmax output)
            const sumDesired = desiredOutput.reduce((a, b) => a + b, 0);
            if (sumDesired > 1e-6) {
                 for(let j=0; j<desiredOutput.length; ++j) desiredOutput[j] /= sumDesired;
            } else if (minIndex1 !== -1) {
                 desiredOutput[minIndex1] = 1.0; // Fallback if normalization failed
            }


            // Adicionar aos dados de treinamento
            trainingData.push({
                inputs: inputs,
                desiredOutput: desiredOutput
            });
        }

        return trainingData;
    }

    // Treinar a rede neural - MODIFIED with full backpropagation
    async train(onProgress = null) {
        this.isTraining = true;
        this.currentEpoch = 0;
        this.trainingHistory = [];

        // Gerar dados de treinamento
        const trainingData = this.generateTrainingData();
        if (!trainingData || trainingData.length === 0) {
             console.error("Failed to generate training data.");
             this.isTraining = false;
             return;
        }

        // Treinar por um número específico de épocas
        for (let epoch = 0; epoch < this.epochs && this.isTraining; epoch++) {
            this.currentEpoch = epoch;

            // Embaralhar os dados de treinamento
            const shuffledData = [...trainingData].sort(() => Math.random() - 0.5);

            let totalLoss = 0;

            // Processar cada amostra de treinamento
            for (const sample of shuffledData) {
                const { inputs, desiredOutput } = sample;

                // --- Forward pass ---
                const activations = this.forwardPass(inputs);
                const outputLayer = activations.output; // Final output (post-softmax)

                // Calcular o erro (MSE)
                let sampleLoss = 0;
                for (let i = 0; i < outputLayer.length; i++) {
                    sampleLoss += Math.pow(outputLayer[i] - desiredOutput[i], 2);
                }
                sampleLoss /= outputLayer.length;
                totalLoss += sampleLoss;

                // --- Backpropagation ---

                // 1. Calculate Output Layer Delta
                // Using (output - target) as the error signal for simplicity with MSE.
                // Note: For MSE + Softmax, the gradient w.r.t. pre-softmax (z_output) is more complex.
                // For Cross-Entropy + Softmax, delta is simply (output - target).
                const deltaOutput = new Array(5).fill(0);
                for (let i = 0; i < 5; i++) {
                    deltaOutput[i] = outputLayer[i] - desiredOutput[i];
                }

                // Store deltas for each layer, indexed [0...hiddenLayers]
                // deltas[hiddenLayers] = output layer delta
                // deltas[0...hiddenLayers-1] = hidden layer deltas
                const deltas = new Array(this.hiddenLayers + 1);
                deltas[this.hiddenLayers] = deltaOutput;

                // 2. Backpropagate Error to Hidden Layers (from last hidden to first)
                let nextLayerDelta = deltaOutput;

                for (let layer = this.hiddenLayers - 1; layer >= 0; layer--) {
                    const currentLayerPreActivation = activations.preActivationHidden[layer]; // z for this layer
                    const currentLayerDelta = new Array(this.neuronsPerLayer).fill(0);
                    const weightsFromCurrentToNext = (layer === this.hiddenLayers - 1)
                        ? this.network.weightsOutput // Weights from last hidden to output
                        : this.network.hiddenWeights[layer]; // Weights from hidden[layer] to hidden[layer+1]

                    const nextLayerSize = nextLayerDelta.length;

                    // Calculate delta for the current hidden layer (layer 'layer')
                    for (let j = 0; j < this.neuronsPerLayer; j++) { // Neuron j in current layer
                        let errorSum = 0;
                        for (let k = 0; k < nextLayerSize; k++) { // Neuron k in next layer
                            // Weight from neuron j (current) to neuron k (next)
                            errorSum += nextLayerDelta[k] * weightsFromCurrentToNext[j][k];
                        }
                        currentLayerDelta[j] = errorSum * this.reluDerivative(currentLayerPreActivation[j]);
                    }
                    deltas[layer] = currentLayerDelta; // Store delta for this layer

                    // Prepare for the next iteration (moving one layer back)
                    nextLayerDelta = currentLayerDelta; // This layer's delta is the next one for the previous layer
                }


                // --- Update Weights and Biases ---

                // Update Output Layer Weights & Biases (Last Hidden -> Output)
                const lastHiddenLayerOutput = activations.hidden[this.hiddenLayers - 1]; // Output 'a' of last hidden layer
                const outputDelta = deltas[this.hiddenLayers];
                for (let i = 0; i < this.neuronsPerLayer; i++) { // Neuron i in last hidden layer
                    for (let j = 0; j < 5; j++) { // Neuron j in output layer
                        this.network.weightsOutput[i][j] -= this.learningRate * outputDelta[j] * lastHiddenLayerOutput[i];
                    }
                }
                for (let j = 0; j < 5; j++) { // Bias j for output layer
                    this.network.biasesOutput[j] -= this.learningRate * outputDelta[j];
                }

                // Update Hidden Layer Weights & Biases (Iterate backwards from last hidden to first)
                for (let layer = this.hiddenLayers - 1; layer >= 0; layer--) {
                    const currentLayerDelta = deltas[layer]; // Delta for neurons in this layer (index 'layer')
                    const previousLayerOutput = (layer === 0) ? activations.input : activations.hidden[layer - 1]; // Output 'a' of the layer feeding into this one
                    const previousLayerSize = previousLayerOutput.length;

                    // Update weights feeding INTO the current layer and biases OF the current layer
                    if (layer === 0) { // Update weights1 (Input -> Hidden 0) & biases1
                        for (let i = 0; i < previousLayerSize; i++) { // Neuron i in input layer
                            for (let j = 0; j < this.neuronsPerLayer; j++) { // Neuron j in hidden layer 0
                                this.network.weights1[i][j] -= this.learningRate * currentLayerDelta[j] * previousLayerOutput[i];
                            }
                        }
                        for (let j = 0; j < this.neuronsPerLayer; j++) { // Bias j for hidden layer 0
                            this.network.biases1[j] -= this.learningRate * currentLayerDelta[j];
                        }
                    } else { // Update hiddenWeights[layer-1] (Hidden[layer-1] -> Hidden[layer]) & hiddenBiases[layer-1]
                        const weightsToUpdate = this.network.hiddenWeights[layer - 1];
                        const biasesToUpdate = this.network.hiddenBiases[layer - 1]; // Biases of hidden layer 'layer'
                        for (let i = 0; i < previousLayerSize; i++) { // Neuron i in hidden layer (layer-1)
                            for (let j = 0; j < this.neuronsPerLayer; j++) { // Neuron j in hidden layer (layer)
                                weightsToUpdate[i][j] -= this.learningRate * currentLayerDelta[j] * previousLayerOutput[i];
                            }
                        }
                        for (let j = 0; j < this.neuronsPerLayer; j++) { // Bias j for hidden layer 'layer'
                            biasesToUpdate[j] -= this.learningRate * currentLayerDelta[j];
                        }
                    }
                }
            } // End loop over samples

            // Calcular a perda média
            const averageLoss = totalLoss / shuffledData.length;

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
            await new Promise(resolve => setTimeout(resolve, 0)); // Yield to event loop
        } // End loop over epochs

        this.isTraining = false;
        console.log("Training finished. Final Loss:", this.trainingHistory[this.trainingHistory.length - 1]?.loss);
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
        const activations = this.forwardPass(inputs);
        const outputLayer = activations.output;

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

// Exportar a classe (assuming browser environment)
if (typeof window !== 'undefined') {
    window.NeuroFuzzySystem = NeuroFuzzySystem;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuroFuzzySystem; // For Node.js if needed
}

