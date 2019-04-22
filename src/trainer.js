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
    MAX_NEURONS
} from './constants'

const INITIAL_SPECIES = 3;
const INITIAL_GENOMES_PER_SPECIES = 3;
const POPULATION = 100;

const ROUNDS_PER_GENOME = 1;

export default class Trainer {
    constructor() {
        this.maxFitness = 0;
        this.species = []
        this.initializeSpecies();
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

    createNewGenome() {
        const genome = new Genome();
        genome.mutate();
        genome.initializeNeurons();
        return genome;
    }

    /* Returns a random genome that hasn't had enough battles yet. 
    Genomes each do ROUNDS_PER_GENOME battles to determine their fitness
    */
    getRandomGenome() {
        let genome = null;
        while (genome == null || genome.totalRounds >= ROUNDS_PER_GENOME) {
            genome = this.getRandomSpecies().getRandomGenome();
        }
        console.log("New Genome genes: ", genome.genes);
        return genome;
    }

    getRandomSpecies() {
        return this.species[Math.floor(Math.random() * this.species.length)];
    }

    /* Go through each species, eliminate all below average genomes in the species */
    cullSpecies() {
        this.species.forEach((species) => {
            species.cull();
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

        console.log("Removing weak species. TAGR: ", totalAverageGlobalRank, " species: ", this.species);

        this.species = this.species.map(function(species) {
            species.breed = Math.floor((species.averageGlobalRank / totalAverageGlobalRank) * POPULATION);
            return species;
        }).filter(function (species) {
            return species.breed >= 1;
        });
    }

    createChildren() {
        this.species.forEach(function (species) {
            species.createChildren();
        });
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
        console.log("New generation is: ", this.species);
    }

    getTotalRoundsRemaining() {
        let totalRoundsRemaining = 0;
        this.species.forEach(function(species) {
            species.genomes.forEach(function(genome) {
                totalRoundsRemaining += ROUNDS_PER_GENOME - genome.totalRounds;
            })
        });
        return totalRoundsRemaining;
    }

}