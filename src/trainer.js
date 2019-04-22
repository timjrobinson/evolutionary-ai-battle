/**
 * The trainer holds all the species and genomes inside those species. 
 * It handles keeping track of the fitnesses of each genome, eliminating those that 
 * are unfit, saving and loading genomes to disk etc. 
 */
import Species from './species'

const INITIAL_SPECIES = 10;
const INITIAL_GENOMES_PER_SPECIES = 10;
const POPULATION = 300;

const ROUNDS_PER_GENOME = 10;

export default class Trainer {
    constructor() {
        this.maxFitness = 0;
        this.species = []
    }

    initializeSpecies() {
        for (var i = 0; i < INITIAL_SPECIES; i++) {
            let species = new Species()
            this.species.push(species);
        }
    }

    /* Returns a random genome that hasn't had enough battles yet. 
    Genomes each do ROUNDS_PER_GENOME battles to determine their fitness
    */
    getRandomGenome() {

    }

    /* Go through each species, eliminate all below average genomes in the species */
    cullSpecies() {


    }

    rankGenomesGlobally() {
        const allGenomes = [];
        this.species.forEach(function (species) {
            species.genomes.forEach(function(genome) {
                allGenomes.push(genome);
            });
        });

        allGenomes.sort(function (genomeA, genomeB) {
            return genomeA.fitness < genomeB.fitness;
        });

        for (var i = 0; i < allGenomes.length; i++) {
            allGenomes[i].globalRank = i;
        }

    }

    removeStaleSpecies() {
        this.species = this.species.filter(function (species) {
            let isStale = species.checkStale(this.maxFitness);
            return !isStale;
        });
    }

    calculateSpeciesAverageGlobalRank() {
        this.species.forEach(function (species) {
            species.calculateAverageGlobalRank()
        });
    }

    removeWeakSpecies() {
        let totalAverageGlobalRank = 0;
        this.species.forEach(function (species) {
            totalAverageGlobalRank += species.averageGlobalRank;
        });

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
        this.rankGenomesGlobally();
        this.calculateSpeciesAverageGlobalRank();
        this.removeWeakSpecies();
        this.createChildren();
    }

}