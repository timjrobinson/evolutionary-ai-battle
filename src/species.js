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

    static loadFromJSON(data) {
        const species = new Species();
        const genomes = data.genomes;
        genomes.forEach((genomeData) => {
            const genome = Genome.loadFromJSON(genomeData);
            species.genomes.push(genome);
        })
        return species;
    }

    serialize() {
        const genomes = this.genomes.map((genome) => {
            return genome.serialize();
        })
        return {
            genomes: genomes,
            staleness: this.staleness,
            maxFitness: this.maxFitness
        }
    }

    // Go through all genomes and remove the unfittest 50%
    cull(allButOne) {
        this.genomes.sort((a, b) => {
            return b.fitness - a.fitness;
        });

        const remainingGenomes = allButOne ? 1 : Math.ceil(this.genomes.length / 2);
        // console.log("Genomes before the cull: ", this.genomes);

        this.genomes = this.genomes.slice(0, remainingGenomes)
        // console.log("Genomes after the cull: ", this.genomes);
    }

    // Go through genomes and check if any have surpassed the 
    // last maxFitness, if none have for MAX_STALE_CHECKS then 
    // this species is stale and should be eliminated
    checkStale(overallMaxFitness) {
        let maxFitness = 0;

        this.genomes.forEach(function (genome) {
            maxFitness = Math.max(maxFitness, genome.fitness);
        });

        if (maxFitness <= this.maxFitness && maxFitness <= (overallMaxFitness * 0.9)) {
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
        const children = [];
        const totalChildren = Math.floor(this.breed);
        for (var i = 0; i < totalChildren; i++) {
            let newChild = this.createChild();
            children.push(newChild);
        }
        return children;
    }

    createChild() {
        let child = null;
        const shouldCreateCrossover = Math.floor(Math.random() * 100) < CROSSOVER_CHANCE;
        if (shouldCreateCrossover) {
            const parent1 = this.getRandomGenome();
            const parent2 = this.getRandomGenome();

            child = new Genome();
            if (parent1.fitness > parent2.fitness) {
                child.inheritFromParents(parent1, parent2);
            } else {
                child.inheritFromParents(parent2, parent1);
            }

            child.mutate();
        } else {
            child = this.cloneRandomGenome();
        }

        child.initializeNeurons();
        return child;
    }

    resetFitness() {
        this.genomes.forEach((genome) => {
            genome.fitness = 0;
        });
    }

    getRandomGenome() {
        const choice = Math.floor(Math.random() * this.genomes.length);
        return this.genomes[choice];
    }

    cloneRandomGenome() {
        return this.getRandomGenome().clone();
    }
}
