/**
 * Classe para simulação do pêndulo invertido sobre um carro
 */
class PendulumSimulation {
    constructor(options = {}) {
        // Parâmetros físicos
        this.gravity = options.gravity || utils.GRAVITY;
        this.pendulumLength = options.pendulumLength || utils.PENDULUM_LENGTH;
        this.cartMass = options.cartMass || utils.CART_MASS;
        this.pendulumMass = options.pendulumMass || utils.PENDULUM_MASS;
        
        // Estado inicial
        this.angle = utils.degToRad(options.initialAngle || 5); // radianos
        this.angularVelocity = options.initialAngularVelocity || 0; // rad/s
        this.cartPosition = options.initialCartPosition || 0; // metros
        this.cartVelocity = options.initialCartVelocity || 0; // m/s
        
        // Limites
        this.cartPositionLimit = options.cartPositionLimit || 5; // metros
        
        // Parâmetros de simulação
        this.dt = options.timeStep || 0.01; // segundos
        this.time = 0;
        
        // Histórico para gráficos
        this.history = {
            time: [],
            angle: [],
            angularVelocity: [],
            cartPosition: [],
            cartVelocity: [],
            controlForce: []
        };
        
        // Estado da simulação
        this.running = false;
        this.controlSystem = null;
    }
    
    // Definir o sistema de controle
    setControlSystem(controlSystem) {
        this.controlSystem = controlSystem;
    }
    
    // Iniciar a simulação
    start() {
        this.running = true;
    }
    
    // Pausar a simulação
    pause() {
        this.running = false;
    }
    
    // Reiniciar a simulação
    reset(options = {}) {
        this.angle = utils.degToRad(options.initialAngle || 5);
        this.angularVelocity = options.initialAngularVelocity || 0;
        this.cartPosition = options.initialCartPosition || 0;
        this.cartVelocity = options.initialCartVelocity || 0;
        this.time = 0;
        
        // Limpar histórico
        this.history = {
            time: [],
            angle: [],
            angularVelocity: [],
            cartPosition: [],
            cartVelocity: [],
            controlForce: []
        };
    }
    
    // Atualizar a simulação por um passo de tempo
    update() {
        if (!this.running) return;
        
        // Calcular a força de controle usando o sistema de controle atual
        let controlForce = 0;
        if (this.controlSystem) {
            controlForce = this.controlSystem.calculateControlForce(
                utils.radToDeg(this.angle),
                utils.radToDeg(this.angularVelocity),
                this.cartPosition,
                this.cartVelocity
            );
        }
        
        // Equações de movimento para o pêndulo invertido
        // Baseadas nas equações diferenciais do sistema pêndulo-carro
        
        // Cálculo da aceleração angular do pêndulo
        const numerator = this.gravity * Math.sin(this.angle) + 
                          Math.cos(this.angle) * ((-controlForce - this.pendulumMass * this.pendulumLength * 
                          this.angularVelocity * this.angularVelocity * Math.sin(this.angle)) / 
                          (this.cartMass + this.pendulumMass));
        const denominator = this.pendulumLength * (4/3 - (this.pendulumMass * Math.cos(this.angle) * 
                           Math.cos(this.angle)) / (this.cartMass + this.pendulumMass));
        const angularAcceleration = numerator / denominator;
        
        // Cálculo da aceleração do carro
        const cartAcceleration = (controlForce + this.pendulumMass * this.pendulumLength * 
                                (this.angularVelocity * this.angularVelocity * Math.sin(this.angle) - 
                                angularAcceleration * Math.cos(this.angle))) / 
                                (this.cartMass + this.pendulumMass);
        
        // Atualizar velocidades usando o método de Euler
        this.angularVelocity += angularAcceleration * this.dt;
        this.cartVelocity += cartAcceleration * this.dt;
        
        // Atualizar posições
        this.angle += this.angularVelocity * this.dt;
        this.cartPosition += this.cartVelocity * this.dt;
        
        // Limitar a posição do carro
        this.cartPosition = utils.clamp(this.cartPosition, -this.cartPositionLimit, this.cartPositionLimit);
        
        // Se o carro atingir o limite, zerar a velocidade
        if (Math.abs(this.cartPosition) >= this.cartPositionLimit) {
            this.cartVelocity = 0;
        }
        
        // Normalizar o ângulo para o intervalo [-π, π]
        this.angle = ((this.angle + Math.PI) % (2 * Math.PI)) - Math.PI;
        
        // Atualizar o tempo
        this.time += this.dt;
        
        // Registrar no histórico
        this.history.time.push(this.time);
        this.history.angle.push(utils.radToDeg(this.angle));
        this.history.angularVelocity.push(utils.radToDeg(this.angularVelocity));
        this.history.cartPosition.push(this.cartPosition);
        this.history.cartVelocity.push(this.cartVelocity);
        this.history.controlForce.push(controlForce);
        
        // Limitar o tamanho do histórico para evitar uso excessivo de memória
        const maxHistoryLength = 1000;
        if (this.history.time.length > maxHistoryLength) {
            this.history.time.shift();
            this.history.angle.shift();
            this.history.angularVelocity.shift();
            this.history.cartPosition.shift();
            this.history.cartVelocity.shift();
            this.history.controlForce.shift();
        }
        
        return {
            angle: this.angle,
            angularVelocity: this.angularVelocity,
            cartPosition: this.cartPosition,
            cartVelocity: this.cartVelocity,
            controlForce: controlForce,
            time: this.time
        };
    }
    
    // Obter o estado atual da simulação
    getState() {
        return {
            angle: this.angle,
            angularVelocity: this.angularVelocity,
            cartPosition: this.cartPosition,
            cartVelocity: this.cartVelocity,
            time: this.time,
            running: this.running
        };
    }
    
    // Obter o histórico da simulação
    getHistory() {
        return this.history;
    }
    
    // Verificar se o pêndulo está estabilizado
    isStabilized(angleThreshold = 5, timeWindow = 3) {
        if (this.history.time.length < timeWindow / this.dt) return false;
        
        // Verificar se o ângulo permaneceu dentro do limiar nos últimos timeWindow segundos
        const recentAngles = this.history.angle.slice(-Math.floor(timeWindow / this.dt));
        return recentAngles.every(angle => Math.abs(angle) < angleThreshold);
    }
    
    // Calcular métricas de desempenho
    calculatePerformanceMetrics() {
        // Tempo de estabilização
        let stabilizationTime = null;
        for (let i = 0; i < this.history.time.length; i++) {
            if (Math.abs(this.history.angle[i]) < 5) {
                // Verificar se permanece estável por pelo menos 3 segundos
                let stable = true;
                for (let j = i; j < Math.min(i + 300, this.history.time.length); j++) {
                    if (Math.abs(this.history.angle[j]) > 5) {
                        stable = false;
                        break;
                    }
                }
                if (stable) {
                    stabilizationTime = this.history.time[i];
                    break;
                }
            }
        }
        
        // Erro médio (RMSE do ângulo)
        const squaredErrors = this.history.angle.map(angle => angle * angle);
        const meanSquaredError = utils.mean(squaredErrors);
        const rootMeanSquaredError = Math.sqrt(meanSquaredError);
        
        // Consumo de energia (integral do quadrado da força de controle)
        const squaredForces = this.history.controlForce.map(force => force * force);
        const energyConsumption = utils.mean(squaredForces) * this.time;
        
        // Robustez (desvio padrão do ângulo após estabilização)
        let robustness = null;
        if (stabilizationTime !== null) {
            const stabilizationIndex = this.history.time.findIndex(t => t >= stabilizationTime);
            if (stabilizationIndex !== -1) {
                const anglesAfterStabilization = this.history.angle.slice(stabilizationIndex);
                robustness = utils.standardDeviation(anglesAfterStabilization);
            }
        }
        
        return {
            stabilizationTime,
            rootMeanSquaredError,
            energyConsumption,
            robustness
        };
    }
}

// Exportar a classe
window.PendulumSimulation = PendulumSimulation;
