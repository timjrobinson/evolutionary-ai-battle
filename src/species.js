import Genome from "./genome";


const MAX_STALE_CHECKS = 15;
const CROSSOVER_CHANCE = 75;

export default class Species {
    constructor() {
        this.genomes = [];
        this.staleness = 0;
        this.maxFitness = 0;
        this.averageGlobalRank = 0;
    }

    // Go through all genomes and remove the unfittest 50%
    cull() {

    }

    // Go through genomes and check if any have surpassed the 
    // last maxFitness, if none have for MAX_STALE_CHECKS then 
    // this species is stale and should be eliminated
    checkStale(overallMaxFitness) {
        let maxFitness = 0;

        this.genomes.forEach(function (genome) {
            maxFitness = Math.max(maxFitness, genome.maxFitness);
        });

        if (maxFitness <= this.maxFitness && maxFitness <= overallMaxFitness) {
            this.staleness++;
        } 

        this.maxFitness = Math.max(this.maxFitness, maxFitness);
        return this.staleness > MAX_STALE_CHECKS
    }

    calculateAverageGlobalRank() {
        let totalGlobalRank = 0;
        this.genomes.forEach(function (genome) {
            totalGlobalRank += genome.globalRank;
        });

        this.averageGlobalRank = totalGlobalRank / this.genomes.length;
    }

    createChildren() {
        const totalChildren = Math.floor(this.breed);
        for (var i = 0; i < totalChildren; i++) {
            this.createChild();
        }
    }

    createChild() {
        const shouldCreateCrossover = Math.floor(Math.random() * 100) < CROSSOVER_CHANCE;
        if (shouldCreateCrossover) {
            const parent1 = getRandomGenome();
            const parent2 = getRandomGenome();

            const child = new Genome();
            if (parent1.fitness > parent2.fitness) {
                child.inheritFromParents(parent1, parent2);
            } else {
                child.inheritFromParents(parent2, parent1);
            }

            child.mutate();


        } else {
            const child = cloneRandomGenome();
        }

        this.genomes.push(child);
    }

    getRandomGenome() {
        const choice = Math.floor(Math.random() * this.genomes.length);
        return this.genomes[choice];
    }

    cloneRandomGenome() {
        return this.getRandomGenome().clone();
    }
}