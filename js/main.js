/**
 * Arquivo principal para controle da simulação do pêndulo invertido
 */

// Variáveis globais
let simulation;
let pendulumVisualization;
let performanceGraphs;
let fisSystem;
let geneticSystem;
let neuroSystem;
let currentSystem = 'fis';
let animationFrameId;
let simulationSpeed = 1.0;

// Visualizações das funções de pertinência
let angleMembershipVis;
let angularVelocityMembershipVis;
let positionMembershipVis;
let velocityMembershipVis;
let outputMembershipVis;

// Visualizações específicas
let fitnessEvolutionGraph;
let ruleVisualization;
let networkVisualization;
let trainingProgressGraph;
let performanceComparisonGraph;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar a simulação
    simulation = new PendulumSimulation();
    
    // Inicializar os sistemas de controle
    fisSystem = new FuzzyInferenceSystem();
    geneticSystem = new GeneticFuzzySystem();
    neuroSystem = new NeuroFuzzySystem();
    
    // Definir o sistema FIS como padrão
    simulation.setControlSystem(fisSystem);
    
    // Inicializar a visualização do pêndulo
    pendulumVisualization = new PendulumVisualization('pendulum-canvas');
    
    // Inicializar os gráficos de desempenho
    performanceGraphs = new PerformanceGraphs();
    
    // Inicializar as visualizações das funções de pertinência
    angleMembershipVis = new MembershipFunctionVisualization('angle-membership', 'Ângulo do Pêndulo', { min: -45, max: 45 });
    angularVelocityMembershipVis = new MembershipFunctionVisualization('angular-velocity-membership', 'Velocidade Angular', { min: -50, max: 50 });
    positionMembershipVis = new MembershipFunctionVisualization('position-membership', 'Posição do Carro', { min: -5, max: 5 });
    velocityMembershipVis = new MembershipFunctionVisualization('velocity-membership', 'Velocidade do Carro', { min: -5, max: 5 });
    outputMembershipVis = new MembershipFunctionVisualization('output-membership', 'Saída (Força)', { min: -30, max: 30 });
    
    // Inicializar visualizações específicas
    fitnessEvolutionGraph = new PerformanceGraph('fitness-evolution', 'Evolução do Fitness', 'Geração', 'Fitness');
    ruleVisualization = new RuleVisualization('rule-visualization');
    networkVisualization = new NeuralNetworkVisualization('network-visualization');
    trainingProgressGraph = new PerformanceGraph('training-progress', 'Progresso do Treinamento', 'Época', 'Erro');
    performanceComparisonGraph = new PerformanceGraph('performance-comparison', 'Comparação de Desempenho', 'Tempo (s)', 'Ângulo (°)');
    
    // Renderizar as funções de pertinência iniciais
    updateMembershipFunctionVisualizations();
    
    // Renderizar a rede neural
    networkVisualization.render(neuroSystem.getNetworkVisualization());
    
    // Configurar os controles da interface
    setupEventListeners();
    
    // Iniciar a simulação
    startSimulation();
});

// Configurar os event listeners
function setupEventListeners() {
    // Botões de controle da simulação
    document.getElementById('start-btn').addEventListener('click', () => {
        simulation.start();
    });
    
    document.getElementById('pause-btn').addEventListener('click', () => {
        simulation.pause();
    });
    
    document.getElementById('reset-btn').addEventListener('click', () => {
        resetSimulation();
    });
    
    // Controle de velocidade da simulação
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        simulationSpeed = parseFloat(e.target.value);
    });
    
    // Navegação entre sistemas
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const system = e.target.getAttribute('data-system');
            switchSystem(system);
        });
    });
    
    // Parâmetros do pêndulo
    document.getElementById('pendulum-angle').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = value + '°';
        resetSimulation();
    });
    
    document.getElementById('pendulum-angular-velocity').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = value + ' rad/s';
        resetSimulation();
    });
    
    // Parâmetros do carro
    document.getElementById('cart-position').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = value + ' m';
        resetSimulation();
    });
    
    document.getElementById('cart-velocity').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = value + ' m/s';
        resetSimulation();
    });
    
    // Parâmetros do sistema genético
    document.getElementById('population-size').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = value;
        geneticSystem.populationSize = value;
    });
    
    document.getElementById('mutation-rate').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = value;
        geneticSystem.mutationRate = value;
    });
    
    document.getElementById('crossover-rate').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = value;
        geneticSystem.crossoverRate = value;
    });
    
    document.getElementById('generations').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = value;
        geneticSystem.generations = value;
    });
    
    // Botão de treinamento do sistema genético
    document.getElementById('train-genetic').addEventListener('click', async () => {
        // Desabilitar o botão durante o treinamento
        const button = document.getElementById('train-genetic');
        button.disabled = true;
        button.textContent = 'Treinando...';
        
        // Limpar o histórico de fitness
        fitnessEvolutionGraph.setData([], 'x', 'y');
        fitnessEvolutionGraph.render();
        
        // Treinar o sistema genético
        await geneticSystem.train((progress) => {
            // Atualizar o gráfico de evolução do fitness
            const fitnessData = geneticSystem.getFitnessHistory().map(item => ({
                x: item.generation,
                y: item.bestFitness
            }));
            fitnessEvolutionGraph.setData(fitnessData, 'x', 'y');
            fitnessEvolutionGraph.render();
            
            // Atualizar a visualização das regras
            const ruleVis = geneticSystem.getRuleVisualization();
            ruleVisualization.render(ruleVis);
        });
        
        // Atualizar a simulação para usar o sistema treinado
        simulation.setControlSystem(geneticSystem);
        resetSimulation();
        
        // Reabilitar o botão
        button.disabled = false;
        button.textContent = 'Treinar Sistema Genético-Fuzzy';
    });
    
    // Parâmetros do sistema neural
    document.getElementById('hidden-layers').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = value;
        neuroSystem.hiddenLayers = value;
        networkVisualization.render(neuroSystem.getNetworkVisualization());
    });
    
    document.getElementById('neurons-per-layer').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = value;
        neuroSystem.neuronsPerLayer = value;
        networkVisualization.render(neuroSystem.getNetworkVisualization());
    });
    
    document.getElementById('learning-rate').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = value;
        neuroSystem.learningRate = value;
    });
    
    document.getElementById('epochs').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = value;
        neuroSystem.epochs = value;
    });
    
    // Botão de treinamento do sistema neural
    document.getElementById('train-neural').addEventListener('click', async () => {
        // Desabilitar o botão durante o treinamento
        const button = document.getElementById('train-neural');
        button.disabled = true;
        button.textContent = 'Treinando...';
        
        // Limpar o histórico de treinamento
        trainingProgressGraph.setData([], 'x', 'y');
        trainingProgressGraph.render();
        
        // Treinar o sistema neural
        await neuroSystem.train((progress) => {
            // Atualizar o gráfico de progresso do treinamento
            const trainingData = neuroSystem.getTrainingHistory().map(item => ({
                x: item.epoch,
                y: item.loss
            }));
            trainingProgressGraph.setData(trainingData, 'x', 'y');
            trainingProgressGraph.render();
        });
        
        // Atualizar a simulação para usar o sistema treinado
        simulation.setControlSystem(neuroSystem);
        resetSimulation();
        
        // Reabilitar o botão
        button.disabled = false;
        button.textContent = 'Treinar Sistema Neuro-Fuzzy';
    });
}

// Iniciar a simulação
function startSimulation() {
    // Cancelar qualquer animação anterior
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Função de animação
    function animate() {
        // Atualizar a simulação várias vezes por frame para ajustar a velocidade
        for (let i = 0; i < simulationSpeed * 5; i++) {
            simulation.update();
        }
        
        // Renderizar a visualização
        pendulumVisualization.render(simulation);
        
        // Atualizar os gráficos a cada 5 frames para melhor desempenho
        if (Math.random() < 0.2) {
            performanceGraphs.updateFromSimulation(simulation);
            
            // Atualizar a tabela de métricas se estiver na aba de comparação
            if (currentSystem === 'comparison') {
                updateComparisonMetrics();
            }
        }
        
        // Continuar a animação
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Iniciar a animação
    animate();
}

// Reiniciar a simulação
function resetSimulation() {
    // Obter os valores dos controles
    const angle = parseInt(document.getElementById('pendulum-angle').value);
    const angularVelocity = parseFloat(document.getElementById('pendulum-angular-velocity').value);
    const position = parseFloat(document.getElementById('cart-position').value);
    const velocity = parseFloat(document.getElementById('cart-velocity').value);
    
    // Reiniciar a simulação com os novos valores
    simulation.reset({
        initialAngle: angle,
        initialAngularVelocity: angularVelocity,
        initialCartPosition: position,
        initialCartVelocity: velocity
    });
    
    // Limpar os gráficos
    performanceGraphs.clear();
    performanceGraphs.update();
}

// Alternar entre os sistemas
function switchSystem(system) {
    // Atualizar a navegação
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('data-system') === system) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Esconder todos os containers de sistema
    document.querySelectorAll('.system-container').forEach(container => {
        container.classList.add('hidden');
    });
    
    // Mostrar o container do sistema selecionado
    document.getElementById(`${system}-system`).classList.remove('hidden');
    
    // Atualizar o sistema de controle atual
    currentSystem = system;
    
    // Configurar o sistema de controle apropriado
    switch (system) {
        case 'fis':
            simulation.setControlSystem(fisSystem);
            break;
        case 'genetic':
            simulation.setControlSystem(geneticSystem);
            // Atualizar a visualização das regras
            const ruleVis = geneticSystem.getRuleVisualization();
            ruleVisualization.render(ruleVis);
            break;
        case 'neuro':
            simulation.setControlSystem(neuroSystem);
            break;
        case 'comparison':
            // Executar comparações
            runSystemComparisons();
            break;
    }
    
    // Reiniciar a simulação
    resetSimulation();
}

// Atualizar as visualizações das funções de pertinência
function updateMembershipFunctionVisualizations() {
    // Criar domínios para cada variável
    const angleDomain = utils.linspace(-45, 45, 100);
    const angularVelocityDomain = utils.linspace(-50, 50, 100);
    const positionDomain = utils.linspace(-5, 5, 100);
    const velocityDomain = utils.linspace(-5, 5, 100);
    const outputDomain = utils.linspace(-30, 30, 100);
    
    // Obter os valores das funções de pertinência
    const angleMFs = fisSystem.getMembershipFunctionValues('angle', angleDomain);
    const angularVelocityMFs = fisSystem.getMembershipFunctionValues('angularVelocity', angularVelocityDomain);
    const positionMFs = fisSystem.getMembershipFunctionValues('position', positionDomain);
    const velocityMFs = fisSystem.getMembershipFunctionValues('velocity', velocityDomain);
    const outputMFs = fisSystem.getMembershipFunctionValues('output', outputDomain);
    
    // Renderizar as visualizações
    angleMembershipVis.render(angleMFs);
    angularVelocityMembershipVis.render(angularVelocityMFs);
    positionMembershipVis.render(positionMFs);
    velocityMembershipVis.render(velocityMFs);
    outputMembershipVis.render(outputMFs);
}

// Executar comparações entre os sistemas
function runSystemComparisons() {
    // Configurações para as comparações
    const initialConditions = [
        { angle: 15, angularVelocity: 0, position: 0, velocity: 0 },
        { angle: -15, angularVelocity: 0, position: 0, velocity: 0 },
        { angle: 5, angularVelocity: 10, position: 0, velocity: 0 },
        { angle: 0, angularVelocity: 0, position: 2, velocity: 0 }
    ];
    
    // Resultados das comparações
    const results = {
        fis: { stabilizationTime: 0, error: 0, energy: 0, robustness: 0 },
        genetic: { stabilizationTime: 0, error: 0, energy: 0, robustness: 0 },
        neuro: { stabilizationTime: 0, error: 0, energy: 0, robustness: 0 }
    };
    
    // Executar simulações para cada sistema e condição inicial
    for (const condition of initialConditions) {
        // Sistema FIS
        const fisSimulation = new PendulumSimulation();
        fisSimulation.setControlSystem(fisSystem);
        runComparisonSimulation(fisSimulation, condition);
        const fisMetrics = fisSimulation.calculatePerformanceMetrics();
        
        // Sistema Genético-Fuzzy
        const geneticSimulation = new PendulumSimulation();
        geneticSimulation.setControlSystem(geneticSystem);
        runComparisonSimulation(geneticSimulation, condition);
        const geneticMetrics = geneticSimulation.calculatePerformanceMetrics();
        
        // Sistema Neuro-Fuzzy
        const neuroSimulation = new PendulumSimulation();
        neuroSimulation.setControlSystem(neuroSystem);
        runComparisonSimulation(neuroSimulation, condition);
        const neuroMetrics = neuroSimulation.calculatePerformanceMetrics();
        
        // Acumular resultados
        results.fis.stabilizationTime += fisMetrics.stabilizationTime || 10;
        results.fis.error += fisMetrics.rootMeanSquaredError || 45;
        results.fis.energy += fisMetrics.energyConsumption || 1000;
        results.fis.robustness += fisMetrics.robustness || 10;
        
        results.genetic.stabilizationTime += geneticMetrics.stabilizationTime || 10;
        results.genetic.error += geneticMetrics.rootMeanSquaredError || 45;
        results.genetic.energy += geneticMetrics.energyConsumption || 1000;
        results.genetic.robustness += geneticMetrics.robustness || 10;
        
        results.neuro.stabilizationTime += neuroMetrics.stabilizationTime || 10;
        results.neuro.error += neuroMetrics.rootMeanSquaredError || 45;
        results.neuro.energy += neuroMetrics.energyConsumption || 1000;
        results.neuro.robustness += neuroMetrics.robustness || 10;
    }
    
    // Calcular médias
    const numConditions = initialConditions.length;
    results.fis.stabilizationTime /= numConditions;
    results.fis.error /= numConditions;
    results.fis.energy /= numConditions;
    results.fis.robustness /= numConditions;
    
    results.genetic.stabilizationTime /= numConditions;
    results.genetic.error /= numConditions;
    results.genetic.energy /= numConditions;
    results.genetic.robustness /= numConditions;
    
    results.neuro.stabilizationTime /= numConditions;
    results.neuro.error /= numConditions;
    results.neuro.energy /= numConditions;
    results.neuro.robustness /= numConditions;
    
    // Atualizar a tabela de métricas
    updateMetricsTable(results);
    
    // Atualizar o gráfico de comparação
    updateComparisonGraph();
}

// Executar uma simulação para comparação
function runComparisonSimulation(simulation, condition) {
    simulation.reset({
        initialAngle: condition.angle,
        initialAngularVelocity: condition.angularVelocity,
        initialCartPosition: condition.position,
        initialCartVelocity: condition.velocity
    });
    
    simulation.start();
    
    // Executar a simulação por um número fixo de passos
    const maxSteps = 500; // 10 segundos com dt = 0.02
    for (let i = 0; i < maxSteps; i++) {
        simulation.update();
    }
}

// Atualizar a tabela de métricas
function updateMetricsTable(results) {
    // Tempo de estabilização
    document.getElementById('fis-stabilization').textContent = results.fis.stabilizationTime.toFixed(2) + 's';
    document.getElementById('genetic-stabilization').textContent = results.genetic.stabilizationTime.toFixed(2) + 's';
    document.getElementById('neuro-stabilization').textContent = results.neuro.stabilizationTime.toFixed(2) + 's';
    
    // Erro médio
    document.getElementById('fis-error').textContent = results.fis.error.toFixed(2) + '°';
    document.getElementById('genetic-error').textContent = results.genetic.error.toFixed(2) + '°';
    document.getElementById('neuro-error').textContent = results.neuro.error.toFixed(2) + '°';
    
    // Consumo de energia
    document.getElementById('fis-energy').textContent = results.fis.energy.toFixed(2);
    document.getElementById('genetic-energy').textContent = results.genetic.energy.toFixed(2);
    document.getElementById('neuro-energy').textContent = results.neuro.energy.toFixed(2);
    
    // Robustez
    document.getElementById('fis-robustness').textContent = results.fis.robustness.toFixed(2) + '°';
    document.getElementById('genetic-robustness').textContent = results.genetic.robustness.toFixed(2) + '°';
    document.getElementById('neuro-robustness').textContent = results.neuro.robustness.toFixed(2) + '°';
}

// Atualizar o gráfico de comparação
function updateComparisonGraph() {
    // Executar uma simulação com cada sistema para a mesma condição inicial
    const condition = { angle: 15, angularVelocity: 0, position: 0, velocity: 0 };
    
    // Sistema FIS
    const fisSimulation = new PendulumSimulation();
    fisSimulation.setControlSystem(fisSystem);
    runComparisonSimulation(fisSimulation, condition);
    
    // Sistema Genético-Fuzzy
    const geneticSimulation = new PendulumSimulation();
    geneticSimulation.setControlSystem(geneticSystem);
    runComparisonSimulation(geneticSimulation, condition);
    
    // Sistema Neuro-Fuzzy
    const neuroSimulation = new PendulumSimulation();
    neuroSimulation.setControlSystem(neuroSystem);
    runComparisonSimulation(neuroSimulation, condition);
    
    // Preparar os dados para o gráfico
    const fisHistory = fisSimulation.getHistory();
    const geneticHistory = geneticSimulation.getHistory();
    const neuroHistory = neuroSimulation.getHistory();
    
    // Limitar o número de pontos para melhor desempenho
    const step = Math.max(1, Math.floor(fisHistory.time.length / 100));
    
    const comparisonData = [];
    
    for (let i = 0; i < fisHistory.time.length; i += step) {
        comparisonData.push({
            x: fisHistory.time[i],
            y1: fisHistory.angle[i],
            y2: geneticHistory.angle[i],
            y3: neuroHistory.angle[i]
        });
    }
    
    // Atualizar o gráfico
    performanceComparisonGraph.setData(comparisonData, 'x', 'y1');
    performanceComparisonGraph.render();
}

// Atualizar as métricas de comparação durante a simulação
function updateComparisonMetrics() {
    // Calcular métricas para o sistema atual
    const metrics = simulation.calculatePerformanceMetrics();
    
    // Atualizar a tabela de métricas para o sistema atual
    let systemPrefix;
    if (simulation.controlSystem instanceof FuzzyInferenceSystem) {
        systemPrefix = 'fis';
    } else if (simulation.controlSystem instanceof GeneticFuzzySystem) {
        systemPrefix = 'genetic';
    } else if (simulation.controlSystem instanceof NeuroFuzzySystem) {
        systemPrefix = 'neuro';
    } else {
        return;
    }
    
    // Atualizar os valores na tabela
    document.getElementById(`${systemPrefix}-stabilization`).textContent = 
        metrics.stabilizationTime ? metrics.stabilizationTime.toFixed(2) + 's' : '-';
    
    document.getElementById(`${systemPrefix}-error`).textContent = 
        metrics.rootMeanSquaredError ? metrics.rootMeanSquaredError.toFixed(2) + '°' : '-';
    
    document.getElementById(`${systemPrefix}-energy`).textContent = 
        metrics.energyConsumption ? metrics.energyConsumption.toFixed(2) : '-';
    
    document.getElementById(`${systemPrefix}-robustness`).textContent = 
        metrics.robustness ? metrics.robustness.toFixed(2) + '°' : '-';
}
