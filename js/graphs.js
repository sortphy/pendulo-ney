/**
 * Gráficos de desempenho para a simulação do pêndulo invertido
 */
class PerformanceGraphs {
    constructor() {
        // Gráficos
        this.angleGraph = new PerformanceGraph('angle-graph', 'Ângulo do Pêndulo', 'Tempo (s)', 'Ângulo (°)');
        this.positionGraph = new PerformanceGraph('position-graph', 'Posição do Carro', 'Tempo (s)', 'Posição (m)');
        this.controlForceGraph = new PerformanceGraph('control-force-graph', 'Força de Controle', 'Tempo (s)', 'Força (N)');
        
        // Dados
        this.data = {
            time: [],
            angle: [],
            position: [],
            controlForce: []
        };
    }
    
    // Limpar os dados
    clear() {
        this.data = {
            time: [],
            angle: [],
            position: [],
            controlForce: []
        };
    }
    
    // Adicionar dados
    addData(time, angle, position, controlForce) {
        this.data.time.push(time);
        this.data.angle.push(angle);
        this.data.position.push(position);
        this.data.controlForce.push(controlForce);
        
        // Limitar o tamanho dos dados para evitar problemas de desempenho
        const maxDataPoints = 500;
        if (this.data.time.length > maxDataPoints) {
            this.data.time.shift();
            this.data.angle.shift();
            this.data.position.shift();
            this.data.controlForce.shift();
        }
    }
    
    // Atualizar os gráficos com os dados atuais
    update() {
        // Preparar os dados para os gráficos
        const angleData = this.data.time.map((t, i) => ({ x: t, y: this.data.angle[i] }));
        const positionData = this.data.time.map((t, i) => ({ x: t, y: this.data.position[i] }));
        const controlForceData = this.data.time.map((t, i) => ({ x: t, y: this.data.controlForce[i] }));
        
        // Atualizar os gráficos
        this.angleGraph.setData(angleData, 'x', 'y');
        this.positionGraph.setData(positionData, 'x', 'y');
        this.controlForceGraph.setData(controlForceData, 'x', 'y');
        
        this.angleGraph.render();
        this.positionGraph.render();
        this.controlForceGraph.render();
    }
    
    // Atualizar os gráficos com dados da simulação
    updateFromSimulation(simulation) {
        const history = simulation.getHistory();
        
        // Verificar se há dados suficientes
        if (history.time.length === 0) return;
        
        // Limpar os dados anteriores
        this.clear();
        
        // Adicionar os dados da simulação
        for (let i = 0; i < history.time.length; i++) {
            this.addData(
                history.time[i],
                history.angle[i],
                history.cartPosition[i],
                history.controlForce[i]
            );
        }
        
        // Atualizar os gráficos
        this.update();
    }
}

// Exportar a classe
window.PerformanceGraphs = PerformanceGraphs;
