/**
 * Sistema de Inferência Fuzzy (FIS) para controle do pêndulo invertido
 */
class FuzzyInferenceSystem {
    constructor() {
        // Definir os conjuntos fuzzy para cada variável
        this.setupMembershipFunctions();
        
        // Definir as regras fuzzy
        this.setupRules();
    }
    
    // Configurar as funções de pertinência para cada variável
    setupMembershipFunctions() {
        // Funções de pertinência para o ângulo do pêndulo
        this.angleMF = {
            N: (x) => this.triangularMF(x, -45, -30, 0), // Negativo (inclinado para a esquerda)
            Z: (x) => this.triangularMF(x, -15, 0, 15),  // Zero (vertical)
            P: (x) => this.triangularMF(x, 0, 30, 45)    // Positivo (inclinado para a direita)
        };
        
        // Funções de pertinência para a velocidade angular do pêndulo
        this.angularVelocityMF = {
            N: (x) => this.triangularMF(x, -50, -25, 0), // Negativo (movendo-se para a esquerda)
            Z: (x) => this.triangularMF(x, -15, 0, 15),  // Zero (parado)
            P: (x) => this.triangularMF(x, 0, 25, 50)    // Positivo (movendo-se para a direita)
        };
        
        // Funções de pertinência para a posição do carro
        this.positionMF = {
            N: (x) => this.triangularMF(x, -5, -2.5, 0), // Negativo (à esquerda)
            Z: (x) => this.triangularMF(x, -2, 0, 2),    // Zero (centro)
            P: (x) => this.triangularMF(x, 0, 2.5, 5)    // Positivo (à direita)
        };
        
        // Funções de pertinência para a velocidade do carro
        this.velocityMF = {
            N: (x) => this.triangularMF(x, -5, -2.5, 0), // Negativo (movendo-se para a esquerda)
            Z: (x) => this.triangularMF(x, -1, 0, 1),    // Zero (parado)
            P: (x) => this.triangularMF(x, 0, 2.5, 5)    // Positivo (movendo-se para a direita)
        };
        
        // Funções de pertinência para a saída (força de controle)
        this.outputMF = {
            NB: (x) => this.triangularMF(x, -30, -20, -10), // Negativo Grande (empurrar fortemente para a esquerda)
            N: (x) => this.triangularMF(x, -15, -10, 0),    // Negativo (empurrar para a esquerda)
            Z: (x) => this.triangularMF(x, -5, 0, 5),       // Zero (não empurrar)
            P: (x) => this.triangularMF(x, 0, 10, 15),      // Positivo (empurrar para a direita)
            PB: (x) => this.triangularMF(x, 10, 20, 30)     // Positivo Grande (empurrar fortemente para a direita)
        };
        
        // Valores centrais para defuzzificação
        this.outputCenters = {
            NB: -20,
            N: -10,
            Z: 0,
            P: 10,
            PB: 20
        };
    }
    
    // Configurar as regras fuzzy
    setupRules() {
        // Regras para o pêndulo
        this.pendulumRules = [
            { angle: 'N', angularVelocity: 'N', output: 'NB' }, // Regra 1
            { angle: 'N', angularVelocity: 'Z', output: 'N' },  // Regra 2
            { angle: 'N', angularVelocity: 'P', output: 'Z' },  // Regra 3
            { angle: 'Z', angularVelocity: 'N', output: 'N' },  // Regra 4
            { angle: 'Z', angularVelocity: 'Z', output: 'Z' },  // Regra 5
            { angle: 'Z', angularVelocity: 'P', output: 'P' },  // Regra 6
            { angle: 'P', angularVelocity: 'N', output: 'Z' },  // Regra 7
            { angle: 'P', angularVelocity: 'Z', output: 'P' },  // Regra 8
            { angle: 'P', angularVelocity: 'P', output: 'PB' }  // Regra 9
        ];
        
        // Regras para o carro
        this.cartRules = [
            { position: 'N', velocity: 'N', output: 'PB' }, // Regra 1
            { position: 'N', velocity: 'Z', output: 'P' },  // Regra 2
            { position: 'N', velocity: 'P', output: 'Z' },  // Regra 3
            { position: 'Z', velocity: 'N', output: 'P' },  // Regra 4
            { position: 'Z', velocity: 'Z', output: 'Z' },  // Regra 5
            { position: 'Z', velocity: 'P', output: 'N' },  // Regra 6
            { position: 'P', velocity: 'N', output: 'Z' },  // Regra 7
            { position: 'P', velocity: 'Z', output: 'N' },  // Regra 8
            { position: 'P', velocity: 'P', output: 'NB' }  // Regra 9
        ];
    }
    
    // Função de pertinência triangular
    triangularMF(x, a, b, c) {
        if (x <= a) return 0;
        if (x <= b) return (x - a) / (b - a);
        if (x <= c) return (c - x) / (c - b);
        return 0;
    }
    
    // Fuzzificar um valor de entrada usando um conjunto de funções de pertinência
    fuzzify(value, membershipFunctions) {
        const result = {};
        for (const [label, mf] of Object.entries(membershipFunctions)) {
            result[label] = mf(value);
        }
        return result;
    }
    
    // Aplicar as regras fuzzy e calcular os graus de ativação
    applyRules(fuzzifiedAngle, fuzzifiedAngularVelocity, fuzzifiedPosition, fuzzifiedVelocity) {
        const pendulumRuleStrengths = {};
        const cartRuleStrengths = {};
        
        // Aplicar regras do pêndulo
        for (const rule of this.pendulumRules) {
            const angleStrength = fuzzifiedAngle[rule.angle];
            const angularVelocityStrength = fuzzifiedAngularVelocity[rule.angularVelocity];
            
            // Usar o operador AND (mínimo)
            const ruleStrength = Math.min(angleStrength, angularVelocityStrength);
            
            // Acumular a força da regra para cada saída (máximo)
            if (!pendulumRuleStrengths[rule.output] || ruleStrength > pendulumRuleStrengths[rule.output]) {
                pendulumRuleStrengths[rule.output] = ruleStrength;
            }
        }
        
        // Aplicar regras do carro
        for (const rule of this.cartRules) {
            const positionStrength = fuzzifiedPosition[rule.position];
            const velocityStrength = fuzzifiedVelocity[rule.velocity];
            
            // Usar o operador AND (mínimo)
            const ruleStrength = Math.min(positionStrength, velocityStrength);
            
            // Acumular a força da regra para cada saída (máximo)
            if (!cartRuleStrengths[rule.output] || ruleStrength > cartRuleStrengths[rule.output]) {
                cartRuleStrengths[rule.output] = ruleStrength;
            }
        }
        
        return { pendulumRuleStrengths, cartRuleStrengths };
    }
    
    // Defuzzificar usando o método da média ponderada
    defuzzify(pendulumRuleStrengths, cartRuleStrengths, pendulumWeight = 0.7, cartWeight = 0.3) {
        let weightedSum = 0;
        let sumOfWeights = 0;
        
        // Combinar as forças das regras do pêndulo e do carro
        for (const [output, strength] of Object.entries(pendulumRuleStrengths)) {
            weightedSum += this.outputCenters[output] * strength * pendulumWeight;
            sumOfWeights += strength * pendulumWeight;
        }
        
        for (const [output, strength] of Object.entries(cartRuleStrengths)) {
            weightedSum += this.outputCenters[output] * strength * cartWeight;
            sumOfWeights += strength * cartWeight;
        }
        
        // Evitar divisão por zero
        if (sumOfWeights === 0) return 0;
        
        return weightedSum / sumOfWeights;
    }
    
    // Calcular a força de controle com base nas entradas
    calculateControlForce(angle, angularVelocity, position, velocity) {
        // Fuzzificar as entradas
        const fuzzifiedAngle = this.fuzzify(angle, this.angleMF);
        const fuzzifiedAngularVelocity = this.fuzzify(angularVelocity, this.angularVelocityMF);
        const fuzzifiedPosition = this.fuzzify(position, this.positionMF);
        const fuzzifiedVelocity = this.fuzzify(velocity, this.velocityMF);
        
        // Aplicar as regras fuzzy
        const { pendulumRuleStrengths, cartRuleStrengths } = this.applyRules(
            fuzzifiedAngle, 
            fuzzifiedAngularVelocity, 
            fuzzifiedPosition, 
            fuzzifiedVelocity
        );
        
        // Defuzzificar para obter a força de controle
        const controlForce = this.defuzzify(pendulumRuleStrengths, cartRuleStrengths);
        
        return controlForce;
    }
    
    // Obter os valores das funções de pertinência para visualização
    getMembershipFunctionValues(type, range) {
        const values = {};
        const membershipFunctions = this[`${type}MF`];
        
        for (const [label, mf] of Object.entries(membershipFunctions)) {
            values[label] = range.map(x => mf(x));
        }
        
        return values;
    }
}

// Exportar a classe
window.FuzzyInferenceSystem = FuzzyInferenceSystem;
