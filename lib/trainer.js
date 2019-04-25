'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * The trainer holds all the species and genomes inside those species. 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * It handles keeping track of the fitnesses of each genome, eliminating those that 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * are unfit, saving and loading genomes to disk etc. 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _species = require('./species');

var _species2 = _interopRequireDefault(_species);

var _genome = require('./genome');

var _genome2 = _interopRequireDefault(_genome);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INITIAL_SPECIES = 3;
var INITIAL_GENOMES_PER_SPECIES = 3;
var POPULATION = 100;

var Trainer = function () {
    function Trainer() {
        _classCallCheck(this, Trainer);

        this.maxFitness = 0;
        this.totalGenerations = 1;
        this.species = [];
        this.children = [];
    }

    _createClass(Trainer, [{
        key: 'initializeSpecies',
        value: function initializeSpecies() {
            for (var i = 0; i < INITIAL_SPECIES; i++) {
                var species = new _species2.default();
                for (var j = 0; j < INITIAL_GENOMES_PER_SPECIES; j++) {
                    var genome = this.createNewGenome();
                    species.genomes.push(genome);
                }
                this.species.push(species);
            }
        }
    }, {
        key: 'loadSpeciesFromJSON',
        value: function loadSpeciesFromJSON(data) {
            var species = _species2.default.loadFromJSON(data);
            this.species.push(species);
        }
    }, {
        key: 'createNewGenome',
        value: function createNewGenome() {
            var genome = new _genome2.default();
            genome.mutate();
            genome.initializeNeurons();
            return genome;
        }
    }, {
        key: 'getRandomGenome',
        value: function getRandomGenome() {
            return this.getRandomSpecies().getRandomGenome();
        }
    }, {
        key: 'getRoundsPerGenome',
        value: function getRoundsPerGenome() {
            return Math.min(this.totalGenerations, 5);
        }
        /* Returns a random genome that hasn't had enough battles yet. 
        Genomes each do n battles to determine their fitness where n
        is the generation that we're on now (so as genomes get better they fight longer)
        */

    }, {
        key: 'getRandomAvailableGenome',
        value: function getRandomAvailableGenome(callback) {
            var genome = null;
            var roundsPerGenome = this.getRoundsPerGenome();
            genome = this.getRandomSpecies().getRandomGenome();
            if (genome == null || genome.totalRounds >= roundsPerGenome) {
                return setTimeout(this.getRandomAvailableGenome.bind(this, callback));
            }
            return callback(genome);
        }
    }, {
        key: 'getRandomSpecies',
        value: function getRandomSpecies() {
            return this.species[Math.floor(Math.random() * this.species.length)];
        }

        /* Go through each species, eliminate all below average genomes in the species */

    }, {
        key: 'cullSpecies',
        value: function cullSpecies(allButOne) {
            this.species.forEach(function (species) {
                species.cull(allButOne);
            });
        }
    }, {
        key: 'rankGenomesGlobally',
        value: function rankGenomesGlobally() {
            var allGenomes = [];
            this.species.forEach(function (species) {
                species.genomes.forEach(function (genome) {
                    allGenomes.push(genome);
                });
            });

            allGenomes.sort(function (a, b) {
                return a.fitness - b.fitness;
            });

            // Global rank is from 1 = worst to allGenomes.length = best
            for (var i = 0; i < allGenomes.length; i++) {
                allGenomes[i].globalRank = i;
            }
        }
    }, {
        key: 'removeStaleSpecies',
        value: function removeStaleSpecies() {
            var _this = this;

            this.species = this.species.filter(function (species) {
                var isStale = species.checkStale(_this.maxFitness);
                return !isStale;
            });
        }
    }, {
        key: 'calculateGlobalMaxFitness',
        value: function calculateGlobalMaxFitness() {
            this.maxFitness = this.species.reduce(function (maxFitness, species) {
                return Math.max(maxFitness, species.maxFitness || 0);
            }, this.maxFitness);
            console.log("Global max fitness is now: ", this.maxFitness);
        }
    }, {
        key: 'calculateSpeciesAverageGlobalRank',
        value: function calculateSpeciesAverageGlobalRank() {
            this.species.forEach(function (species) {
                species.calculateAverageGlobalRank();
            });
        }
    }, {
        key: 'removeWeakSpecies',
        value: function removeWeakSpecies() {
            var totalAverageGlobalRank = 0;
            this.species.forEach(function (species) {
                totalAverageGlobalRank += species.averageGlobalRank;
            });

            // console.log("Removing weak species. TAGR: ", totalAverageGlobalRank, " species: ", this.species);

            this.species = this.species.map(function (species) {
                species.breed = Math.floor(species.averageGlobalRank / totalAverageGlobalRank * POPULATION) - 1;
                return species;
            }).filter(function (species) {
                return species.breed >= 1;
            });
        }
    }, {
        key: 'createChildren',
        value: function createChildren() {
            var _this2 = this;

            this.children = [];
            this.species.forEach(function (species) {
                var newChildren = species.createChildren();
                _this2.children = _this2.children.concat(newChildren);
            });
        }
    }, {
        key: 'resetFitness',
        value: function resetFitness() {
            this.species.forEach(function (species) {
                species.resetFitness();
            });
        }
    }, {
        key: 'assignChildrenToSpecies',
        value: function assignChildrenToSpecies() {
            var _this3 = this;

            this.children.forEach(function (child) {
                var sameSpecies = _this3.species.find(function (species) {
                    return _this3.isSameSpecies(child, species.genomes[0]);
                });
                if (sameSpecies) {
                    return sameSpecies.genomes.push(child);
                }

                var newSpecies = new _species2.default();
                newSpecies.genomes.push(child);
                _this3.species.push(newSpecies);
            });
            this.children = [];
        }
    }, {
        key: 'isSameSpecies',
        value: function isSameSpecies(genome1, genome2) {
            var dd = _constants.DELTA_DISJOINT * this.disjoint(genome1.genes, genome2.genes);
            var dw = _constants.DELTA_WEIGHTS * this.weights(genome1.genes, genome2.genes);
            return dd + dw < _constants.DELTA_THRESHOLD;
        }

        // Calculate the fraction of the number of genes that these two genepools don't have in common

    }, {
        key: 'disjoint',
        value: function disjoint(genes1, genes2) {
            var gene1innovations = {};
            var gene2innovations = {};
            genes1.forEach(function (gene) {
                gene1innovations[gene.innovation] = true;
            });
            genes2.forEach(function (gene) {
                gene2innovations[gene.innovation] = true;
            });

            var disjointedGenes = 0;
            genes1.forEach(function (gene) {
                if (!gene2innovations[gene.innovation]) {
                    disjointedGenes++;
                }
            });
            genes2.forEach(function (gene) {
                if (!gene1innovations[gene.innovation]) {
                    disjointedGenes++;
                }
            });

            var maxTotalGenes = Math.max(genes1.length, genes2.length);
            return disjointedGenes / maxTotalGenes;
        }
    }, {
        key: 'weights',
        value: function weights(genes1, genes2) {
            var gene2innovations = {};
            genes2.forEach(function (gene) {
                gene2innovations[gene.innovation] = gene;
            });

            var sum = 0;
            var coincident = 0;
            genes1.forEach(function (gene) {
                if (gene2innovations[gene.innovation] != null) {
                    var gene2 = gene2innovations[gene.innovation];
                    sum = sum + Math.abs(gene.weight - gene2.weight);
                    coincident++;
                }
            });

            return sum / coincident;
        }
    }, {
        key: 'newGeneration',
        value: function newGeneration() {
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
    }, {
        key: 'getTotalRoundsRemaining',
        value: function getTotalRoundsRemaining() {
            var totalRoundsRemaining = 0;
            var roundsPerGenome = this.getRoundsPerGenome();
            this.species.forEach(function (species) {
                species.genomes.forEach(function (genome) {
                    totalRoundsRemaining += roundsPerGenome - genome.totalRounds;
                });
            });
            return totalRoundsRemaining;
        }
    }]);

    return Trainer;
}();

exports.default = Trainer;