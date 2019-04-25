"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _genome = require("./genome");

var _genome2 = _interopRequireDefault(_genome);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_STALE_CHECKS = 15;
var CROSSOVER_CHANCE = 75;

var Species = function () {
    function Species() {
        _classCallCheck(this, Species);

        this.genomes = [];
        this.staleness = 0;
        this.maxFitness = 0;
        this.averageGlobalRank = 0;
    }

    _createClass(Species, [{
        key: "serialize",
        value: function serialize() {
            var genomes = this.genomes.map(function (genome) {
                return genome.serialize();
            });
            return {
                genomes: genomes,
                staleness: this.staleness,
                maxFitness: this.maxFitness
            };
        }

        // Go through all genomes and remove the unfittest 50%

    }, {
        key: "cull",
        value: function cull(allButOne) {
            this.genomes.sort(function (a, b) {
                return b.fitness - a.fitness;
            });

            var remainingGenomes = allButOne ? 1 : Math.ceil(this.genomes.length / 2);
            // console.log("Genomes before the cull: ", this.genomes);

            this.genomes = this.genomes.slice(0, remainingGenomes);
            // console.log("Genomes after the cull: ", this.genomes);
        }

        // Go through genomes and check if any have surpassed the 
        // last maxFitness, if none have for MAX_STALE_CHECKS then 
        // this species is stale and should be eliminated

    }, {
        key: "checkStale",
        value: function checkStale(overallMaxFitness) {
            var maxFitness = 0;

            this.genomes.forEach(function (genome) {
                maxFitness = Math.max(maxFitness, genome.fitness);
            });

            if (maxFitness <= this.maxFitness && maxFitness <= overallMaxFitness * 0.9) {
                this.staleness++;
            }

            this.maxFitness = Math.max(this.maxFitness, maxFitness);
            return this.staleness > MAX_STALE_CHECKS;
        }
    }, {
        key: "calculateAverageGlobalRank",
        value: function calculateAverageGlobalRank() {
            var totalGlobalRank = 0;
            this.genomes.forEach(function (genome) {
                totalGlobalRank += genome.globalRank;
            });

            this.averageGlobalRank = totalGlobalRank / this.genomes.length;
        }
    }, {
        key: "createChildren",
        value: function createChildren() {
            var children = [];
            var totalChildren = Math.floor(this.breed);
            for (var i = 0; i < totalChildren; i++) {
                var newChild = this.createChild();
                children.push(newChild);
            }
            return children;
        }
    }, {
        key: "createChild",
        value: function createChild() {
            var child = null;
            var shouldCreateCrossover = Math.floor(Math.random() * 100) < CROSSOVER_CHANCE;
            if (shouldCreateCrossover) {
                var parent1 = this.getRandomGenome();
                var parent2 = this.getRandomGenome();

                child = new _genome2.default();
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
    }, {
        key: "resetFitness",
        value: function resetFitness() {
            this.genomes.forEach(function (genome) {
                genome.fitness = 0;
            });
        }
    }, {
        key: "getRandomGenome",
        value: function getRandomGenome() {
            var choice = Math.floor(Math.random() * this.genomes.length);
            return this.genomes[choice];
        }
    }, {
        key: "cloneRandomGenome",
        value: function cloneRandomGenome() {
            return this.getRandomGenome().clone();
        }
    }], [{
        key: "loadFromJSON",
        value: function loadFromJSON(data) {
            var species = new Species();
            var genomes = data.genomes;
            genomes.forEach(function (genomeData) {
                var genome = _genome2.default.loadFromJSON(genomeData);
                species.genomes.push(genome);
            });
            return species;
        }
    }]);

    return Species;
}();

exports.default = Species;