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
    neuroSystem = new NeuroFuzzySystem(); // Initialize with default parameters (e.g., 2 hidden layers)
    
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
    
    // Renderizar a rede neural initial state
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
        // *** FIX: Re-initialize the network when parameters change ***
        neuroSystem.initializeNetwork(); 
        networkVisualization.render(neuroSystem.getNetworkVisualization());
    });
    
    document.getElementById('neurons-per-layer').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = value;
        neuroSystem.neuronsPerLayer = value;
        // *** FIX: Re-initialize the network when parameters change ***
        neuroSystem.initializeNetwork(); 
        networkVisualization.render(neuroSystem.getNetworkVisualization());
    });
    
    document.getElementById('learning-rate').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = value;
        neuroSystem.learningRate = value;
        // Note: Changing learning rate doesn't require re-initialization
    });
    
    document.getElementById('epochs').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = value;
        neuroSystem.epochs = value;
        // Note: Changing epochs doesn't require re-initialization
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
        
        // Ensure the network is initialized with current parameters before training
        // This is a safety measure in case the 'input' event didn't fire correctly
        // or if parameters were changed programmatically elsewhere.
        neuroSystem.initializeNetwork();
        networkVisualization.render(neuroSystem.getNetworkVisualization());

        // Treinar o sistema neural
        try {
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
        } catch (error) {
            console.error("Error during Neuro-Fuzzy training:", error);
            alert("An error occurred during training. Check the console for details.");
        }

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
            // Ensure network is initialized with current params when switching to neuro tab
            neuroSystem.initializeNetwork();
            networkVisualization.render(neuroSystem.getNetworkVisualization());
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
async function runSystemComparisons() {
    // Configurações para as comparações
    const initialConditions = [
        { angle: 15, angularVelocity: 0, position: 0, velocity: 0 },
        { angle: -15, angularVelocity: 0, position: 0, velocity: 0 },
        { angle: 5, angularVelocity: 10, position: 0, velocity: 0 },
        { angle: 0, angularVelocity: 0, position: 2, velocity: 0 }
    ];
    
    // Resultados das comparações
    const results = {
        fis: { stabilizationTime: [], error: [], energy: [], robustness: [] },
        genetic: { stabilizationTime: [], error: [], energy: [], robustness: [] },
        neuro: { stabilizationTime: [], error: [], energy: [], robustness: [] }
    };
    
    const systems = { fis: fisSystem, genetic: geneticSystem, neuro: neuroSystem };
    const systemNames = ['fis', 'genetic', 'neuro'];

    // Show a loading indicator
    const comparisonTableBody = document.getElementById('comparison-table-body');
    comparisonTableBody.innerHTML = '<tr><td colspan="5">Running comparisons...</td></tr>';

    // Use setTimeout to allow the UI to update before blocking with simulations
    await new Promise(resolve => setTimeout(resolve, 50)); 

    for (const condition of initialConditions) {
        for (const name of systemNames) {
            const system = systems[name];
            const sim = new PendulumSimulation();
            sim.setControlSystem(system);
            runComparisonSimulation(sim, condition); // This is synchronous
            const metrics = sim.calculatePerformanceMetrics();
            
            results[name].stabilizationTime.push(metrics.stabilizationTime || 10);
            results[name].error.push(metrics.rootMeanSquaredError || 45);
            results[name].energy.push(metrics.energyConsumption || 1000);
            results[name].robustness.push(metrics.robustness || 10);
        }
    }

    // Calculate average results
    const averageResults = {};
    for (const name of systemNames) {
        averageResults[name] = {
            stabilizationTime: results[name].stabilizationTime.reduce((a, b) => a + b, 0) / results[name].stabilizationTime.length,
            error: results[name].error.reduce((a, b) => a + b, 0) / results[name].error.length,
            energy: results[name].energy.reduce((a, b) => a + b, 0) / results[name].energy.length,
            robustness: results[name].robustness.reduce((a, b) => a + b, 0) / results[name].robustness.length
        };
    }
    
    // Atualizar a tabela de comparação
    updateComparisonTable(averageResults);
    
    // Atualizar o gráfico de comparação (exemplo: erro ao longo do tempo)
    // Note: This requires running simulations and storing time series data, which is more complex
    // For now, we just update the table.
}

// Executar uma simulação para comparação
function runComparisonSimulation(simulationInstance, initialCondition) {
    simulationInstance.reset({
        initialAngle: initialCondition.angle,
        initialAngularVelocity: initialCondition.angularVelocity,
        initialCartPosition: initialCondition.position,
        initialCartVelocity: initialCondition.velocity
    });
    
    // Executar a simulação por um tempo fixo (e.g., 30 segundos)
    const maxSteps = 30 / simulationInstance.timeStep; // 30 seconds
    for (let i = 0; i < maxSteps; i++) {
        simulationInstance.update();
        // Stop if pendulum falls
        if (Math.abs(utils.radToDeg(simulationInstance.angle)) > 45) {
            break;
        }
    }
}

// Atualizar a tabela de comparação
function updateComparisonTable(averageResults) {
    const tableBody = document.getElementById('comparison-table-body');
    tableBody.innerHTML = ''; // Clear previous results
    
    const systems = ['fis', 'genetic', 'neuro'];
    const systemLabels = {
        fis: 'Sistema FIS',
        genetic: 'Sistema Genético-Fuzzy',
        neuro: 'Sistema Neuro-Fuzzy'
    };

    systems.forEach(system => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = systemLabels[system];
        row.insertCell().textContent = averageResults[system].stabilizationTime.toFixed(2) + ' s';
        row.insertCell().textContent = averageResults[system].error.toFixed(2) + ' °';
        row.insertCell().textContent = averageResults[system].energy.toFixed(2);
        row.insertCell().textContent = averageResults[system].robustness.toFixed(2);
    });
}

// Atualizar a tabela de métricas na aba de comparação (chamada no loop de animação)
function updateComparisonMetrics() {
    // This function might be redundant if runSystemComparisons calculates averages.
    // If real-time updates are needed, this would fetch metrics from ongoing comparison simulations.
    // For simplicity, we rely on the average results calculated by runSystemComparisons.
}

