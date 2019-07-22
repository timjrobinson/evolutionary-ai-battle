/**
 * A species is a group of somewhat related Genomes. When it comes time to cull and produce children
 * at the end of each generation all AI's only cull and reproduce within their Species. 
 */
import Genome from "./genome";
import { debug } from "winston";

const MAX_STALE_CHECKS = 15;
const CROSSOVER_CHANCE = 75;

export default class Species {
    constructor() {
        this.genomes = [];
        this.staleness = 0;
        this.maxFitness = 0;
        this.averageGlobalRank = 0;
    }

    /**
     * Loads a species from JSON data (already parsed). 
     * @param {Object} data 
     */
    static loadFromJSON(data) {
        const species = new Species();
        const genomes = data.genomes;
        genomes.forEach((genomeData) => {
            const genome = Genome.loadFromJSON(genomeData);
            species.genomes.push(genome);
        })
        return species;
    }

    /**
     * Serialize this species to an object. 
     */
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

    /**
     * Go through all Genomes and cull the bottom 50%, or if allButOne is set, cull all but the 
     * most fit Genome.  
     * @param {boolean} allButOne if true, cull all genomes except the most fit one. 
     */
    cull(allButOne) {
        this.genomes.sort((a, b) => {
            return b.fitness - a.fitness;
        });

        debug("Culling Genomes")
        const remainingGenomes = allButOne ? 1 : Math.ceil(this.genomes.length / 2);
        debug("Genomes before the cull: ", this.genomes);
        this.genomes = this.genomes.slice(0, remainingGenomes)
        debug("Genomes after the cull: ", this.genomes);
    }

    /**
     * Go through genomes and check if any have reached at least 90% of the  last maxFitness. If 
     * none have for MAX_STALE_CHECKS then this species is stale (no longer evolving to be fitter)
     * and should be eliminated.
     */
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

    /** 
     * This calculates the average global rank of all the Genomes in the species to determine how
     * fit this species is compared to ther species'. 
     * The global rank of each Genome is it's fitness relative to all other genomes in all other 
     * species where 1 is the worst genome out there and allGenomes.length is the best.
    */
    calculateAverageGlobalRank() {
        let totalGlobalRank = 0;
        this.genomes.forEach(function (genome) {
            totalGlobalRank += genome.globalRank;
        });

        this.averageGlobalRank = totalGlobalRank / this.genomes.length;
    }

    /**
     * Create this.breed total new children in this species. 
     */
    createChildren() {
        const children = [];
        const totalChildren = Math.floor(this.breed);
        for (var i = 0; i < totalChildren; i++) {
            let newChild = this.createChild();
            children.push(newChild);
        }
        return children;
    }

    /** 
     * Create a child genome from two random parent genomes in this species. The child inherits
     * most of it's genes from the fittest parent, and then has some random mutations applied to it.
     */
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

    /**
     * Reset the fitness of every genome in this species
     */
    resetFitness() {
        this.genomes.forEach((genome) => {
            genome.fitness = 0;
        });
        this.maxFitness = 0;
    }

    /**
     * Return a random genome from this species
     */
    getRandomGenome() {
        const choice = Math.floor(Math.random() * this.genomes.length);
        return this.genomes[choice];
    }

    /**
     * Clone a random genome in this species
     */
    cloneRandomGenome() {
        return this.getRandomGenome().clone();
    }
}
