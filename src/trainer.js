/**
 * The trainer holds all the species and genomes inside those species. 
 * It handles keeping track of the fitnesses of each genome, eliminating those that 
 * are unfit, saving and loading genomes to disk etc. 
 */
import Species from './species'
import Genome from './genome';

import {
    INPUT_NEURONS,
    OUTPUT_NEURONS,
    MAX_NEURONS,
    DELTA_DISJOINT,
    DELTA_WEIGHTS,
    DELTA_THRESHOLD
} from './constants'

const INITIAL_SPECIES = 3;
const INITIAL_GENOMES_PER_SPECIES = 3;
const POPULATION = 100;

export default class Trainer {
    constructor() {
        this.maxFitness = 0;
        this.totalGenerations = 1;
        this.species = [];
        this.children = [];
    }

    initializeSpecies() {
        for (var i = 0; i < INITIAL_SPECIES; i++) {
            let species = new Species()
            for (var j = 0; j < INITIAL_GENOMES_PER_SPECIES; j++) {
                let genome = this.createNewGenome();
                species.genomes.push(genome);
            }
            this.species.push(species);
        }
    }

    loadSpeciesFromJSON(data) {
        const species = Species.loadFromJSON(data);
        this.species.push(species);
    }

    createNewGenome() {
        const genome = new Genome();
        genome.mutate();
        genome.initializeNeurons();
        return genome;
    }

    getRandomGenome()  {
        return this.getRandomSpecies().getRandomGenome();
    }

    getRoundsPerGenome() {
        return Math.min(this.totalGenerations, 5);
    }
    /* Returns a random genome that hasn't had enough battles yet. 
    Genomes each do n battles to determine their fitness where n
    is the generation that we're on now (so as genomes get better they fight longer)
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

    /* Go through each species, eliminate all below average genomes in the species */
    cullSpecies(allButOne) {
        this.species.forEach((species) => {
            species.cull(allButOne);
        });
    }

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

    removeStaleSpecies() {
        this.species = this.species.filter((species) => {
            let isStale = species.checkStale(this.maxFitness);
            return !isStale;
        });
    }

    calculateGlobalMaxFitness() {
        this.maxFitness = this.species.reduce((maxFitness, species) => {
            return Math.max(maxFitness, species.maxFitness || 0);
        }, this.maxFitness)
        console.log("Global max fitness is now: ", this.maxFitness);
    }

    calculateSpeciesAverageGlobalRank() {
        this.species.forEach((species) => {
            species.calculateAverageGlobalRank()
        });
    }

    removeWeakSpecies() {
        let totalAverageGlobalRank = 0;
        this.species.forEach((species) => {
            totalAverageGlobalRank += species.averageGlobalRank;
        });

        // console.log("Removing weak species. TAGR: ", totalAverageGlobalRank, " species: ", this.species);

        this.species = this.species.map(function(species) {
            species.breed = Math.floor((species.averageGlobalRank / totalAverageGlobalRank) * POPULATION) - 1;
            return species;
        }).filter(function (species) {
            return species.breed >= 1;
        });
    }

    createChildren() {
        this.children = [];
        this.species.forEach((species) => {
            const newChildren = species.createChildren();
            this.children = this.children.concat(newChildren);
        });
    }

    resetFitness() {
        this.species.forEach(function(species) {
            species.resetFitness();
        });
    }

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

    isSameSpecies(genome1, genome2) {
        const dd = DELTA_DISJOINT * this.disjoint(genome1.genes, genome2.genes);
        const dw = DELTA_WEIGHTS * this.weights(genome1.genes, genome2.genes);
        return dd + dw < DELTA_THRESHOLD
    }

    // Calculate the fraction of the number of genes that these two genepools don't have in common
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
        // console.log("On generation " + this.totalGenerations + " species is: ", this.species);
    }

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