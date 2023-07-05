"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionMaker = void 0;
class DecisionMaker {
    constructor(positionManager, totalRiskedCapital, initialRiskPerTrade, dcaFactor) {
        this.positionManager = positionManager;
        this.totalRiskedCapital = totalRiskedCapital;
        this.initialRiskPerTrade = initialRiskPerTrade;
        this.dcaCounter = {};
        this.dcaFactor = dcaFactor;
    }
    makeDecision(symbol, buySignal, sellSignal) {
        const currentRiskedCapital = this.getCurrentRiskedCapital();
        if (currentRiskedCapital >= this.totalRiskedCapital) {
            // console.log('Total risked capital has been invested, no new trades will be initiated.');
            return;
        }
        if (buySignal && this.positionManager.hasShortPosition(symbol)) {
            this.handleShortDCA(symbol);
        }
        else if (sellSignal && this.positionManager.hasLongPosition(symbol)) {
            this.handleLongDCA(symbol);
        }
        else if (buySignal) {
            this.positionManager.createLongPosition(symbol, this.initialRiskPerTrade);
            this.dcaCounter[symbol] = 0;
        }
        else if (sellSignal) {
            this.positionManager.createShortPosition(symbol, this.initialRiskPerTrade);
            this.dcaCounter[symbol] = 0;
        }
    }
    handleShortDCA(symbol) {
        if (this.dcaCounter[symbol] > 2) {
            // console.log('DCA limit reached, not buying more');
            return;
        }
        let riskPerTrade = this.initialRiskPerTrade * (this.dcaCounter[symbol] + 1) * this.dcaFactor;
        this.positionManager.createLongPosition(symbol, riskPerTrade);
        this.dcaCounter[symbol]++;
    }
    handleLongDCA(symbol) {
        if (this.dcaCounter[symbol] > 2) {
            // console.log('DCA limit reached, not selling more');
            return;
        }
        let riskPerTrade = this.initialRiskPerTrade * (this.dcaCounter[symbol] + 1) * this.dcaFactor;
        this.positionManager.createShortPosition(symbol, riskPerTrade);
        this.dcaCounter[symbol]++;
    }
    getCurrentRiskedCapital() {
        let currentRiskedCapital = 0;
        for (let position of this.positionManager.getOpenPositions()) {
            currentRiskedCapital += position.calculateRisk();
        }
        return currentRiskedCapital;
    }
}
exports.DecisionMaker = DecisionMaker;
