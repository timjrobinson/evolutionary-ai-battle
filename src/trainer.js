/**
 * The trainer holds all the species and genomes inside those species. 
 * It handles keeping track of the fitnesses of each genome, eliminating those that 
 * are unfit, saving and loading genomes to disk etc. 
 */
import Species from './species'
import Genome from './genome';
import config from '../config/default.json';
import log from './logger'
import Debug from 'debug';
const debug = Debug("eai:trainer");

const DISJOINT_MULTIPLIER = config.disjointMultiplier;
const WEIGHT_MULTIPLIER = config.weightMultiplier;
const DELTA_THRESHOLD = config.deltaThreshold;
const INITIAL_SPECIES = config.initialSpecies;
const INITIAL_GENOMES_PER_SPECIES = config.initialGenomesPerSpecies;
const POPULATION = config.population;

export default class Trainer {
    constructor() {
        this.maxFitness = 0;
        this.totalGenerations = 1;
        this.species = [];
        this.children = [];
    }

    /**
     * Create randomized species and genomes
     */
    createInitialSpecies() {
        for (var i = 0; i < INITIAL_SPECIES; i++) {
            let species = new Species()
            for (var j = 0; j < INITIAL_GENOMES_PER_SPECIES; j++) {
                let genome = this.createNewGenome();
                species.genomes.push(genome);
            }
            this.species.push(species);
        }
    }

    /** 
     * Load Species from JSON data
     */
    loadSpeciesFromJSON(data) {
        if (!data.species || !Array.isArray(data.species)) {
            console.error("Could not load JSON file. data.species not found");
            return;
        }
        data.species.forEach((speciesData) => {
            const species = Species.loadFromJSON(speciesData);
            this.species.push(species);
        });
        this.totalGenerations = data.totalGenerations;
    }

    /**
     * Serialize all species into a JSON array for writing to disk
     * Also save out the totalGenerations for future reference
     */
    serializeSpecies() {
        const serializedData = {};
        serializedData.species = this.species.map((species) => {
            return species.serialize();
        });
        this.calculateGlobalMaxFitness();
        serializedData.maxFitness = this.maxFitness;
        serializedData.totalGenerations = this.totalGenerations;
        return JSON.stringify(serializedData);
    }

    /**
     * Create a new randomly mutated Genome and return it
     */
    createNewGenome() {
        const genome = new Genome();
        genome.mutate();
        genome.initializeNeurons();
        return genome;
    }

    /**
     * Retrieve a random Genome from a random species
     */
    getRandomGenome()  {
        const genome = this.getRandomSpecies().getRandomGenome();
        return genome;
    }

    /**
     * Retrieve a random Genome from the top 5 fittest genomes 
     */
    getTopGenome() {
        const allGenomes = [];
        this.species.forEach((species) => {
            species.genomes.forEach((genome) => {
                allGenomes.push(genome);
            });
        });

        allGenomes.sort((a, b) => {
            return b.fitness - a.fitness;
        });

        const randomChoice = Math.floor(Math.random() * 5);
        const genome = allGenomes[randomChoice]
        debug("Returning top genome: ", genome)
        return genome;
    }

    /** 
     * Get the total rounds that each Genome should fight in  
     */
    getRoundsPerGenome() {
        return Math.min(this.totalGenerations, 5);
    }

    /**
     * Returns a random genome that hasn't had enough battles yet. 
     * Genomes each do n battles to determine their fitness where n
     * is the generation that we're on now (so as genomes get better they fight longer)
    */
    getRandomAvailableGenome(callback) {
        let genome = null;
        const roundsPerGenome = this.getRoundsPerGenome();
        genome = this.getRandomSpecies().getRandomGenome();
        if (genome == null || genome.totalRounds >= roundsPerGenome) {
            return setTimeout(this.getRandomAvailableGenome.bind(this, callback));
        }
        return callback(genome);
    }

    getRandomSpecies() {
        return this.species[Math.floor(Math.random() * this.species.length)];
    }

    /**
     * Go through each species, eliminate all below average genomes in the species 
     * @param allButOne if this is true eliminate all but the most fit genome in the species 
     */
    cullSpecies(allButOne) {
        this.species.forEach((species) => {
            species.cull(allButOne);
        });
    }

    /** 
     * Get all Genomes from all species and rank them globally, where 1 is the least fit and 
     * genomes.length is the most fit.  
     */
    rankGenomesGlobally() {
        const allGenomes = [];
        this.species.forEach((species) => {
            species.genomes.forEach((genome) => {
                allGenomes.push(genome);
            });
        });

        allGenomes.sort((a, b) => {
            return a.fitness - b.fitness;
        });

        // Global rank is from 1 = worst to allGenomes.length = best
        for (var i = 0; i < allGenomes.length; i++) {
            allGenomes[i].globalRank = i;
        }
    }

    /**
     * Check if any Species have become stale (have not improved in a while) and remove them
     */
    removeStaleSpecies() {
        this.species = this.species.filter((species) => {
            let isStale = species.checkStale(this.maxFitness);
            return !isStale;
        });
    }

    /** 
     * Find the highest fitness value amongst all species. Save that to this.maxFitness.
     */
    calculateGlobalMaxFitness() {
        this.maxFitness = this.species.reduce((maxFitness, species) => {
            return Math.max(maxFitness, species.maxFitness || 0);
        }, this.maxFitness);
        debug("Global max fitness is now: ", this.maxFitness);
    }

    /**
     * For each species calculate the average global rank of all its genomes
     */
    calculateSpeciesAverageGlobalRank() {
        this.species.forEach((species) => {
            species.calculateAverageGlobalRank()
        });
    }

    /**
     * Remove all species that have been deemed to weak to continue. This keeps the population around
     * the POPULATION value, as when it gets higher than that the weaker species will be killed off
     * more quickly. 
     */
    removeWeakSpecies() {
        let totalAverageGlobalRank = 0;
        this.species.forEach((species) => {
            totalAverageGlobalRank += species.averageGlobalRank;
        });

        this.species = this.species.map(function(species) {
            species.breed = Math.floor((species.averageGlobalRank / totalAverageGlobalRank) * POPULATION) - 1;
            return species;
        }).filter(function (species) {
            return species.breed >= 1;
        });
    }

    /**
     * Go through each Species and create children, then add them to the children array
     */
    createChildren() {
        this.children = [];
        this.species.forEach((species) => {
            const newChildren = species.createChildren();
            this.children = this.children.concat(newChildren);
        });
    }
    
    /**
     * Reset the fitness of every species
     */
    resetFitness() {
        this.species.forEach(function(species) {
            species.resetFitness();
        });
    }

    /** 
     * For each child figure out if it has similar genes to an existing species, if it does then add
     * it to that species. If it does not then create a new species of just that child. 
     */
    assignChildrenToSpecies() {
        this.children.forEach((child) => {
            const sameSpecies = this.species.find((species) => {
                return this.isSameSpecies(child, species.genomes[0]);
            });
            if (sameSpecies) {
                return sameSpecies.genomes.push(child);
            }

            const newSpecies = new Species();
            newSpecies.genomes.push(child);
            this.species.push(newSpecies);
        });
        this.children = [];
    }

    /**
     * Check if two genomes should belong to the same species by comparing how many genes they have 
     * in common and how similar the weights are of those Genes.  
     * 
     * @param {Genome} genome1 
     * @param {Genome} genome2 
     */
    isSameSpecies(genome1, genome2) {
        const dd = DISJOINT_MULTIPLIER * this.disjoint(genome1.genes, genome2.genes);
        const dw = WEIGHT_MULTIPLIER * this.weights(genome1.genes, genome2.genes);
        return dd + dw < DELTA_THRESHOLD
    }

    /**
     * Calculate the percent of genes that these two genepools don't have in common
     * 
     * @param {Array} genes1 an array of genes from the first genome
     * @param {Array} genes2 an array of genes from the second genome
     */
    disjoint(genes1, genes2) {
        const gene1innovations = {};
        const gene2innovations = {};
        genes1.forEach((gene) => {
            gene1innovations[gene.innovation] = true;
        });
        genes2.forEach((gene) => {
            gene2innovations[gene.innovation] = true;
        });

        let disjointedGenes = 0;
        genes1.forEach((gene) => {
            if (!gene2innovations[gene.innovation]) {
                disjointedGenes++;
            }
        });
        genes2.forEach((gene) => {
            if (!gene1innovations[gene.innovation]) {
                disjointedGenes++;
            }
        });

        const maxTotalGenes = Math.max(genes1.length, genes2.length);
        return disjointedGenes / maxTotalGenes;
    }

    /**
     * For each gene that the Genomes have in common, calculate how close their weights are to 
     * determine if even if one Genome has many similar genes if those genes have vastly different
     * weights it may no longer belong to the same species.  
     * 
     * @param {Array} genes1 
     * @param {Array} genes2 
     */
    weights(genes1, genes2) {
        const gene2innovations = {};
        genes2.forEach((gene) => {
            gene2innovations[gene.innovation] = gene;
        });

        let sum = 0;
        let coincident = 0;
        genes1.forEach((gene) => {
            if (gene2innovations[gene.innovation] != null) {
                const gene2 = gene2innovations[gene.innovation];
                sum = sum + Math.abs(gene.weight - gene2.weight);
                coincident++;
            }
        });

        return sum / coincident;
    }

    /**
     * Calculate the bots fitness in a round based on the results it achieved during that round
     * @param {Object} results - Battle results in an object
     * @param {int} totalGenerations - 
     * @returns {Object} botFitness - The fitness of each bot based on the results
     */
    static calculateBotFitnessFromResults(results, totalGenerations)  {
        const maxRoundTime = config.maxRoundTime;
        log.debug("Calculating bot fitness from results: ", results, " total generations: ", totalGenerations);
        /* Set the bots initial fitness to the generation it's in, as battles are tougher later */
        let botFitness = totalGenerations;
        /* Give the bot 20 points of fitness for each life it took off the opponent */
        botFitness +=  ((5 - results.bot2.lives) * 20);
        if (results.winner == 1) {
            /* If the bot won it gets bonus fitness the quicker it won */
            botFitness += maxRoundTime - Math.min(maxRoundTime, Math.floor(results.totalTime));
            /* The bot gets 10 fitness points for each life it had left at the end */
            botFitness += results.bot1.lives * 10;
            /* The bot gets bonus fitness for winning */
            botFitness += 100;
        } else {
            /* If the bot lost it gets bonus fitness for the longer it survived */
            botFitness += Math.min(maxRoundTime, Math.floor(results.totalTime));
        }
        log.debug("Bot fitness is: ", botFitness);
        return botFitness;
    }

    /** 
     * The main function run after all battles for one generation have ended. It does the following:
     *  - Culls the 50% least fit genomes in every species 
     *  - Removes species that are stale (haven't improved in many generations)
     *  - Removes the weakest species with the worst average genomes
     *  - Creates children from the survivors
     *  - Culls all but the number 1 genome from each species
     *  - Assigns children to species based on what species they're most similar to (or creates new
     *    species if the child doesn't match any)
     */
    newGeneration() {
        this.cullSpecies();
        this.rankGenomesGlobally();
        this.removeStaleSpecies();
        this.calculateGlobalMaxFitness();
        this.rankGenomesGlobally();
        this.calculateSpeciesAverageGlobalRank();
        this.removeWeakSpecies();
        this.createChildren();
        this.cullSpecies(true);
        this.resetFitness();
        this.assignChildrenToSpecies();
        this.totalGenerations++;
    }

    /** 
     * Returns the total rounds remaining based on the expected rounds (total genomes * rounds per genome)
     * minus how many rounds have occured so far. 
     */
    getTotalRoundsRemaining() {
        let totalRoundsRemaining = 0;
        const roundsPerGenome = this.getRoundsPerGenome();
        this.species.forEach(function(species) {
            species.genomes.forEach(function(genome) {
                totalRoundsRemaining += roundsPerGenome - genome.totalRounds;
            })
        });
        return totalRoundsRemaining;
    }

}