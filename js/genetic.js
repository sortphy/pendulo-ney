/**
 * Sistema Genético-Fuzzy para controle do pêndulo invertido
 * Combina algoritmos genéticos com sistema de inferência fuzzy
 */
class GeneticFuzzySystem {
    constructor(options = {}) {
        // Parâmetros do algoritmo genético
        this.populationSize = options.populationSize || 50;
        this.mutationRate = options.mutationRate || 0.1;
        this.crossoverRate = options.crossoverRate || 0.8;
        this.generations = options.generations || 30;
        
        // Sistema FIS base
        this.baseFIS = new FuzzyInferenceSystem();
        
        // População atual
        this.population = [];
        
        // Melhor indivíduo encontrado
        this.bestIndividual = null;
        
        // Histórico de fitness
        this.fitnessHistory = [];
        
        // Estado do treinamento
        this.isTraining = false;
        this.currentGeneration = 0;
        
        // Inicializar população
        this.initializePopulation();
    }
    
    // Inicializar a população com indivíduos aleatórios
    initializePopulation() {
        this.population = [];
        
        for (let i = 0; i < this.populationSize; i++) {
            // Cada indivíduo é uma representação das regras fuzzy e parâmetros
            const individual = {
                // Regras do pêndulo (9 regras, cada uma com uma saída)
                pendulumRules: this.generateRandomRules(9),
                
                // Regras do carro (9 regras, cada uma com uma saída)
                cartRules: this.generateRandomRules(9),
                
                // Pesos para combinação das regras do pêndulo e do carro
                pendulumWeight: Math.random(),
                cartWeight: Math.random(),
                
                // Fitness (inicialmente 0)
                fitness: 0
            };
            
            this.population.push(individual);
        }
    }
    
    // Gerar regras aleatórias
    generateRandomRules(numRules) {
        const possibleOutputs = ['NB', 'N', 'Z', 'P', 'PB'];
        const rules = [];
        
        for (let i = 0; i < numRules; i++) {
            const randomOutputIndex = Math.floor(Math.random() * possibleOutputs.length);
            rules.push(possibleOutputs[randomOutputIndex]);
        }
        
        return rules;
    }
    
    // Avaliar o fitness de um indivíduo usando simulação
    evaluateIndividual(individual) {
        // Criar uma simulação para testar o indivíduo
        const simulation = new PendulumSimulation({
            initialAngle: 15, // Começar com um ângulo desafiador
            initialAngularVelocity: 0,
            initialCartPosition: 0,
            initialCartVelocity: 0,
            timeStep: 0.02
        });
        
        // Criar um sistema de controle baseado no indivíduo
        const controlSystem = {
            calculateControlForce: (angle, angularVelocity, position, velocity) => {
                return this.calculateControlForceFromIndividual(
                    individual, angle, angularVelocity, position, velocity
                );
            }
        };
        
        simulation.setControlSystem(controlSystem);
        simulation.start();
        
        // Executar a simulação por um número fixo de passos
        const maxSteps = 500; // 10 segundos com dt = 0.02
        for (let i = 0; i < maxSteps; i++) {
            simulation.update();
            
            // Se o pêndulo cair (ângulo > 45 graus), encerrar a simulação
            if (Math.abs(utils.radToDeg(simulation.angle)) > 45) {
                break;
            }
        }
        
        // Calcular o fitness com base no desempenho
        const metrics = simulation.calculatePerformanceMetrics();
        
        // Componentes do fitness:
        // 1. Erro do ângulo (menor é melhor)
        const angleError = metrics.rootMeanSquaredError || 45; // Se não conseguir calcular, usar o pior caso
        
        // 2. Consumo de energia (menor é melhor)
        const energyConsumption = metrics.energyConsumption || 1000; // Se não conseguir calcular, usar o pior caso
        
        // 3. Tempo de estabilização (menor é melhor)
        const stabilizationTime = metrics.stabilizationTime || 10; // Se não conseguir calcular, usar o pior caso
        
        // 4. Robustez (menor é melhor)
        const robustness = metrics.robustness || 10; // Se não conseguir calcular, usar o pior caso
        
        // Calcular o fitness (inversamente proporcional aos erros)
        // Normalizar cada componente para ter um peso adequado
        const angleErrorWeight = 10;
        const energyConsumptionWeight = 0.01;
        const stabilizationTimeWeight = 1;
        const robustnessWeight = 5;
        
        const fitness = 1000 / (
            angleErrorWeight * angleError +
            energyConsumptionWeight * energyConsumption +
            stabilizationTimeWeight * stabilizationTime +
            robustnessWeight * robustness + 
            0.001 // Evitar divisão por zero
        );
        
        return fitness;
    }
    
    // Calcular a força de controle a partir de um indivíduo
    calculateControlForceFromIndividual(individual, angle, angularVelocity, position, velocity) {
        // Fuzzificar as entradas usando o FIS base
        const fuzzifiedAngle = this.baseFIS.fuzzify(angle, this.baseFIS.angleMF);
        const fuzzifiedAngularVelocity = this.baseFIS.fuzzify(angularVelocity, this.baseFIS.angularVelocityMF);
        const fuzzifiedPosition = this.baseFIS.fuzzify(position, this.baseFIS.positionMF);
        const fuzzifiedVelocity = this.baseFIS.fuzzify(velocity, this.baseFIS.velocityMF);
        
        // Aplicar as regras do pêndulo
        const pendulumRuleStrengths = {};
        for (let i = 0; i < this.baseFIS.pendulumRules.length; i++) {
            const rule = this.baseFIS.pendulumRules[i];
            const angleStrength = fuzzifiedAngle[rule.angle];
            const angularVelocityStrength = fuzzifiedAngularVelocity[rule.angularVelocity];
            
            // Usar o operador AND (mínimo)
            const ruleStrength = Math.min(angleStrength, angularVelocityStrength);
            
            // Usar a saída otimizada pelo algoritmo genético
            const output = individual.pendulumRules[i];
            
            // Acumular a força da regra para cada saída (máximo)
            if (!pendulumRuleStrengths[output] || ruleStrength > pendulumRuleStrengths[output]) {
                pendulumRuleStrengths[output] = ruleStrength;
            }
        }
        
        // Aplicar as regras do carro
        const cartRuleStrengths = {};
        for (let i = 0; i < this.baseFIS.cartRules.length; i++) {
            const rule = this.baseFIS.cartRules[i];
            const positionStrength = fuzzifiedPosition[rule.position];
            const velocityStrength = fuzzifiedVelocity[rule.velocity];
            
            // Usar o operador AND (mínimo)
            const ruleStrength = Math.min(positionStrength, velocityStrength);
            
            // Usar a saída otimizada pelo algoritmo genético
            const output = individual.cartRules[i];
            
            // Acumular a força da regra para cada saída (máximo)
            if (!cartRuleStrengths[output] || ruleStrength > cartRuleStrengths[output]) {
                cartRuleStrengths[output] = ruleStrength;
            }
        }
        
        // Defuzzificar usando os pesos otimizados
        const controlForce = this.baseFIS.defuzzify(
            pendulumRuleStrengths, 
            cartRuleStrengths, 
            individual.pendulumWeight, 
            individual.cartWeight
        );
        
        return controlForce;
    }
    
    // Selecionar indivíduos para reprodução usando seleção por torneio
    selectIndividual() {
        // Selecionar aleatoriamente dois indivíduos e escolher o melhor
        const index1 = Math.floor(Math.random() * this.population.length);
        const index2 = Math.floor(Math.random() * this.population.length);
        
        if (this.population[index1].fitness > this.population[index2].fitness) {
            return this.population[index1];
        } else {
            return this.population[index2];
        }
    }
    
    // Cruzar dois indivíduos para gerar descendentes
    crossover(parent1, parent2) {
        // Se não ocorrer crossover, retornar uma cópia do primeiro pai
        if (Math.random() > this.crossoverRate) {
            return this.cloneIndividual(parent1);
        }
        
        // Criar um novo indivíduo
        const child = {
            pendulumRules: [],
            cartRules: [],
            pendulumWeight: 0,
            cartWeight: 0,
            fitness: 0
        };
        
        // Crossover de ponto único para as regras do pêndulo
        const pendulumCrossoverPoint = Math.floor(Math.random() * parent1.pendulumRules.length);
        for (let i = 0; i < parent1.pendulumRules.length; i++) {
            if (i < pendulumCrossoverPoint) {
                child.pendulumRules.push(parent1.pendulumRules[i]);
            } else {
                child.pendulumRules.push(parent2.pendulumRules[i]);
            }
        }
        
        // Crossover de ponto único para as regras do carro
        const cartCrossoverPoint = Math.floor(Math.random() * parent1.cartRules.length);
        for (let i = 0; i < parent1.cartRules.length; i++) {
            if (i < cartCrossoverPoint) {
                child.cartRules.push(parent1.cartRules[i]);
            } else {
                child.cartRules.push(parent2.cartRules[i]);
            }
        }
        
        // Crossover aritmético para os pesos
        child.pendulumWeight = (parent1.pendulumWeight + parent2.pendulumWeight) / 2;
        child.cartWeight = (parent1.cartWeight + parent2.cartWeight) / 2;
        
        return child;
    }
    
    // Aplicar mutação a um indivíduo
    mutate(individual) {
        const mutatedIndividual = this.cloneIndividual(individual);
        const possibleOutputs = ['NB', 'N', 'Z', 'P', 'PB'];
        
        // Mutação nas regras do pêndulo
        for (let i = 0; i < mutatedIndividual.pendulumRules.length; i++) {
            if (Math.random() < this.mutationRate) {
                const randomOutputIndex = Math.floor(Math.random() * possibleOutputs.length);
                mutatedIndividual.pendulumRules[i] = possibleOutputs[randomOutputIndex];
            }
        }
        
        // Mutação nas regras do carro
        for (let i = 0; i < mutatedIndividual.cartRules.length; i++) {
            if (Math.random() < this.mutationRate) {
                const randomOutputIndex = Math.floor(Math.random() * possibleOutputs.length);
                mutatedIndividual.cartRules[i] = possibleOutputs[randomOutputIndex];
            }
        }
        
        // Mutação nos pesos
        if (Math.random() < this.mutationRate) {
            mutatedIndividual.pendulumWeight = Math.random();
        }
        
        if (Math.random() < this.mutationRate) {
            mutatedIndividual.cartWeight = Math.random();
        }
        
        return mutatedIndividual;
    }
    
    // Clonar um indivíduo
    cloneIndividual(individual) {
        return {
            pendulumRules: [...individual.pendulumRules],
            cartRules: [...individual.cartRules],
            pendulumWeight: individual.pendulumWeight,
            cartWeight: individual.cartWeight,
            fitness: individual.fitness
        };
    }
    
    // Executar uma geração do algoritmo genético
    runGeneration() {
        // Avaliar o fitness de cada indivíduo
        for (const individual of this.population) {
            if (individual.fitness === 0) { // Só avaliar se ainda não foi avaliado
                individual.fitness = this.evaluateIndividual(individual);
            }
        }
        
        // Ordenar a população pelo fitness (decrescente)
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Armazenar o melhor indivíduo
        this.bestIndividual = this.cloneIndividual(this.population[0]);
        
        // Registrar o fitness médio e o melhor fitness
        const averageFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length;
        this.fitnessHistory.push({
            generation: this.currentGeneration,
            bestFitness: this.bestIndividual.fitness,
            averageFitness: averageFitness
        });
        
        // Criar a nova população
        const newPopulation = [];
        
        // Elitismo: manter o melhor indivíduo
        newPopulation.push(this.cloneIndividual(this.bestIndividual));
        
        // Gerar o resto da população através de seleção, crossover e mutação
        while (newPopulation.length < this.populationSize) {
            const parent1 = this.selectIndividual();
            const parent2 = this.selectIndividual();
            
            let child = this.crossover(parent1, parent2);
            child = this.mutate(child);
            
            newPopulation.push(child);
        }
        
        // Substituir a população antiga pela nova
        this.population = newPopulation;
        
        // Incrementar o contador de gerações
        this.currentGeneration++;
        
        // Retornar informações sobre a geração atual
        return {
            generation: this.currentGeneration,
            bestFitness: this.bestIndividual.fitness,
            averageFitness: averageFitness
        };
    }
    
    // Treinar o sistema por um número específico de gerações
    async train(onProgress = null) {
        this.isTraining = true;
        this.currentGeneration = 0;
        this.fitnessHistory = [];
        
        // Inicializar a população
        this.initializePopulation();
        
        // Executar o algoritmo genético por um número específico de gerações
        for (let i = 0; i < this.generations && this.isTraining; i++) {
            const result = this.runGeneration();
            
            // Chamar a função de callback com o progresso
            if (onProgress) {
                onProgress(result);
            }
            
            // Pausa para permitir que a interface do usuário seja atualizada
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        this.isTraining = false;
        return this.bestIndividual;
    }
    
    // Parar o treinamento
    stopTraining() {
        this.isTraining = false;
    }
    
    // Calcular a força de controle usando o melhor indivíduo encontrado
    calculateControlForce(angle, angularVelocity, position, velocity) {
        if (!this.bestIndividual) {
            // Se não houver um melhor indivíduo, usar o FIS base
            return this.baseFIS.calculateControlForce(angle, angularVelocity, position, velocity);
        }
        
        return this.calculateControlForceFromIndividual(
            this.bestIndividual, angle, angularVelocity, position, velocity
        );
    }
    
    // Obter o histórico de fitness
    getFitnessHistory() {
        return this.fitnessHistory;
    }
    
    // Obter o melhor indivíduo
    getBestIndividual() {
        return this.bestIndividual;
    }
    
    // Obter a visualização das regras otimizadas
    getRuleVisualization() {
        if (!this.bestIndividual) return null;
        
        // Mapear as regras originais para as regras otimizadas
        const pendulumRuleMapping = [];
        for (let i = 0; i < this.baseFIS.pendulumRules.length; i++) {
            const originalRule = this.baseFIS.pendulumRules[i];
            const optimizedOutput = this.bestIndividual.pendulumRules[i];
            
            pendulumRuleMapping.push({
                angle: originalRule.angle,
                angularVelocity: originalRule.angularVelocity,
                originalOutput: originalRule.output,
                optimizedOutput: optimizedOutput
            });
        }
        
        const cartRuleMapping = [];
        for (let i = 0; i < this.baseFIS.cartRules.length; i++) {
            const originalRule = this.baseFIS.cartRules[i];
            const optimizedOutput = this.bestIndividual.cartRules[i];
            
            cartRuleMapping.push({
                position: originalRule.position,
                velocity: originalRule.velocity,
                originalOutput: originalRule.output,
                optimizedOutput: optimizedOutput
            });
        }
        
        return {
            pendulumRules: pendulumRuleMapping,
            cartRules: cartRuleMapping,
            pendulumWeight: this.bestIndividual.pendulumWeight,
            cartWeight: this.bestIndividual.cartWeight
        };
    }
}

// Exportar a classe
window.GeneticFuzzySystem = GeneticFuzzySystem;
