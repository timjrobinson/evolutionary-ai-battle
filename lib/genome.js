'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('./constants');

var _math = require('./math');

var _innovation = require('./innovation');

var _innovation2 = _interopRequireDefault(_innovation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INITIAL_MUTATION_RATE = 1;

var PARENT2_INNOVATION_GENE_CHANCE = 0.5;
var MUTATION_TYPES = ['connections', 'link', 'node', 'enable', 'disable'];

var MUTATE_CONNECTION_CHANCE = 0.25;
var PERTUBE_CHANCE = 0.9;
var MUTATE_LINK_CHANCE = 2;
var MUTATE_NODE_CHANCE = 0.5;
var MUTATE_BIAS_CHANCE = 0.4;
var MUTATE_DISABLE_CHANCE = 0.4;
var MUTATE_ENABLE_CHANCE = 0.2;
var STEP_SIZE = 0.1;

var Gene = function () {
    function Gene() {
        _classCallCheck(this, Gene);

        this.from = null;
        this.to = null;
        this.weight = 0;
        this.enabled = true;
        this.innovation = 0;
    }

    _createClass(Gene, [{
        key: 'clone',
        value: function clone() {
            var gene = new Gene();
            gene.from = this.from;
            gene.to = this.to;
            gene.weight = this.weight;
            gene.enabled = this.enabled;
            gene.innovation = this.innovation;
            return gene;
        }
    }, {
        key: 'serialize',
        value: function serialize() {
            return {
                from: this.from,
                to: this.to,
                weight: this.weight,
                enabled: this.enabled,
                innovation: this.innovation
            };
        }
    }]);

    return Gene;
}();

var Neuron = function Neuron(id) {
    _classCallCheck(this, Neuron);

    this.id = id;
    this.incoming = [];
    this.value = 0;
};

var Genome = function () {
    function Genome() {
        _classCallCheck(this, Genome);

        this.genes = [];
        this.neurons = [];
        this.mutationRates = {
            connections: MUTATE_CONNECTION_CHANCE,
            link: MUTATE_LINK_CHANCE,
            node: MUTATE_NODE_CHANCE,
            enable: MUTATE_ENABLE_CHANCE,
            disable: MUTATE_DISABLE_CHANCE,
            step: STEP_SIZE
        };
        this.fitness = 0;
        this.globalRank = 0;
        this.initializeNeurons();
        this.maxNeuron = _constants.INPUT_NEURONS;
        this.totalRounds = 0;
    }

    _createClass(Genome, [{
        key: 'load',
        value: function load(genome) {
            var _this = this;

            this.genes = [];
            this.mutationRates = genome.getMutationRates();

            genome.genes.forEach(function (gene) {
                _this.genes.push(gene.clone());
            });
            this.initializeNeurons();
            this.maxNeuron = genome.maxNeuron;
        }
    }, {
        key: 'serialize',
        value: function serialize() {
            var genes = this.genes.map(function (gene) {
                return gene.serialize();
            });
            return {
                genes: genes,
                mutationRates: Object.assign({}, this.mutationRates),
                maxNeuron: this.maxNeuron
            };
        }
    }, {
        key: 'clone',
        value: function clone() {
            var clonedGenome = new Genome();
            this.genes.forEach(function (gene) {
                clonedGenome.genes.push(gene.clone());
            });

            clonedGenome.mutationRates = this.getMutationRates();

            return clonedGenome;
        }
    }, {
        key: 'addFitness',
        value: function addFitness(fitness) {
            this.fitness += fitness;
        }
    }, {
        key: 'getMutationRates',
        value: function getMutationRates() {
            return Object.assign({}, this.mutationRates);
        }
    }, {
        key: 'newInnovation',
        value: function newInnovation() {
            return 0;
        }
    }, {
        key: 'initializeNeurons',
        value: function initializeNeurons() {
            var _this2 = this;

            this.neurons = [];

            for (var i = 0; i < _constants.INPUT_NEURONS; i++) {
                this.neurons.push(this.createNeuron(i));
            }

            for (var _i = 0; _i < _constants.OUTPUT_NEURONS; _i++) {
                var id = _constants.MAX_NEURONS + _i;
                this.neurons[id] = this.createNeuron(id);
            }

            this.genes.forEach(function (gene) {
                if (!gene.enabled) return;

                if (_this2.neurons[gene.to] == null) {
                    _this2.neurons[gene.to] = new Neuron(gene.to);
                }
                _this2.neurons[gene.to].incoming.push(gene);

                if (_this2.neurons[gene.from] == null) {
                    _this2.neurons[gene.from] = new Neuron(gene.from);
                }
            });
        }
    }, {
        key: 'createNeuron',
        value: function createNeuron(id) {
            var neuron = new Neuron(id);
            return neuron;
        }

        /* Child gets most of its genes from parent1 which is the fittest 
        of the two parents */

    }, {
        key: 'inheritFromParents',
        value: function inheritFromParents(parent1, parent2) {
            var parent2Innovations = {};
            for (var i = 0; i < parent2.genes.length; i++) {
                var gene = parent2.genes[i];
                parent2Innovations[gene.innovation] = gene;
            }

            for (var _i2 = 0; _i2 < parent1.genes.length; _i2++) {
                var geneParent = parent1;
                var gene1 = parent1.genes[_i2];
                var gene2 = parent2Innovations[gene1.innovation];
                if (gene2 != null && Math.random() < PARENT2_INNOVATION_GENE_CHANCE && gene2.enabled) {
                    this.genes.push(gene2.clone());
                } else {
                    this.genes.push(gene1.clone());
                }
            }

            this.maxNeuron = Math.max(parent1.maxNeuron, parent2.maxNeuron);
            this.mutationRates = parent1.getMutationRates();
        }

        /* Chance of applying a random mutation to the child based on
        its mutation rate */

    }, {
        key: 'mutate',
        value: function mutate() {
            var _this3 = this;

            Object.keys(this.mutationRates).forEach(function (mutationType) {
                var currentRate = _this3.mutationRates[mutationType];
                if (Math.random() < 0.5) {
                    _this3.mutationRates[mutationType] = currentRate * 0.95;
                } else {
                    _this3.mutationRates[mutationType] = currentRate * (1 / 0.95);
                }
            });

            if (Math.random() < this.mutationRates['connections']) {
                this.pointMutate();
            }

            var linkMutations = this.mutationRates['link'];
            while (linkMutations > 0) {
                if (Math.random() < linkMutations) {
                    this.linkMutate();
                }
                linkMutations -= 1;
            }

            var nodeMutations = this.mutationRates['node'];
            while (nodeMutations > 0) {
                if (Math.random() < nodeMutations) {
                    this.nodeMutate();
                }
                nodeMutations -= 1;
            }

            var enableMutations = this.mutationRates['enable'];
            while (enableMutations > 0) {
                if (Math.random() < enableMutations) {
                    this.enableMutate();
                }
                enableMutations -= 1;
            }

            var disableMutations = this.mutationRates['disable'];
            while (disableMutations > 0) {
                if (Math.random() < disableMutations) {
                    this.disableMutate();
                }
                disableMutations -= 1;
            }
        }
    }, {
        key: 'getRandomNeuron',
        value: function getRandomNeuron(nonInput) {
            var startingId = nonInput ? _constants.INPUT_NEURONS : 0;
            var pickableNeurons = this.neurons.map(function (neuron) {
                if (neuron.id >= startingId) return neuron;
                return null;
            }).filter(function (n) {
                return n != null;
            });
            var neuronId = pickableNeurons[Math.floor(Math.random() * pickableNeurons.length)].id;
            return this.neurons[neuronId];
        }
    }, {
        key: 'getRandomGene',
        value: function getRandomGene() {
            return this.genes[Math.floor(Math.random() * this.genes.length)];
        }
    }, {
        key: 'hasSameGene',
        value: function hasSameGene(gene) {
            var hasGene = this.genes.some(function (g) {
                if (g.from === gene.from && g.to === gene.to) {
                    return true;
                }
                return false;
            });
            return hasGene;
        }
    }, {
        key: 'pointMutate',
        value: function pointMutate() {
            var step = this.mutationRates.step;

            this.genes = this.genes.map(function (gene) {
                if (Math.random() < PERTUBE_CHANCE) {
                    gene.weight = gene.weight + Math.random() * step * 2 - step;
                } else {
                    gene.weight = Math.random() * 4 - 2;
                }
                return gene;
            });
        }
    }, {
        key: 'linkMutate',
        value: function linkMutate() {
            // console.log("Performing link mutation");
            var neuron1 = this.getRandomNeuron(false);
            var neuron2 = this.getRandomNeuron(true);

            var gene = new Gene();
            if (neuron1.id < _constants.INPUT_NEURONS && neuron2.id < _constants.INPUT_NEURONS) {
                // Both input nodes, we can't link these
                return;
            }

            if (neuron1.id < neuron2.id) {
                gene.from = neuron1.id;
                gene.to = neuron2.id;
            } else {
                gene.from = neuron2.id;
                gene.to = neuron1.id;
            }

            if (this.hasSameGene(gene)) {
                // Don't want two links betwen the same pair of neurons
                return;
            }

            gene.innovation = _innovation2.default.getNext();
            gene.weight = Math.random() * 4 - 2;

            // console.log("Inserting new gene: ", gene);
            this.genes.push(gene);
        }

        /* Takes a random gene, disables it, then creates a
        a new neuron with 2 new genes, one gene going to the old genes
        input and one to the old genes output. */

    }, {
        key: 'nodeMutate',
        value: function nodeMutate() {
            // console.log("Performing node mutation");
            if (this.genes.length == 0) {
                return;
            }

            var gene = this.getRandomGene();
            if (!gene.enabled) {
                return;
            }
            gene.enabled = false;

            this.maxNeuron++;
            var neuronId = this.maxNeuron;

            var gene1 = gene.clone();
            gene1.to = neuronId;
            gene1.weight = 1;
            gene1.innovation = _innovation2.default.getNext();
            gene1.enabled = true;
            this.genes.push(gene1);

            var gene2 = gene.clone();
            gene2.from = neuronId;
            gene2.weight = 1;
            gene2.innovation = _innovation2.default.getNext();
            gene2.enabled = true;
            this.genes.push(gene2);

            // console.log("Inserting new gene1: ", gene1);
            // console.log("Inserting new gene2: ", gene2);
        }
    }, {
        key: 'enableMutate',
        value: function enableMutate() {
            // console.log("Performing enableMutate");
            if (this.genes.length == 0) return;
            var gene = this.getRandomGene();
            // console.log("Enabling gene: ", gene);
            gene.enabled = true;
        }
    }, {
        key: 'disableMutate',
        value: function disableMutate() {
            // console.log("Performing disableMutate");
            if (this.genes.length == 0) return;
            var gene = this.getRandomGene();
            // console.log("Disabling gene:", gene);
            gene.enabled = false;
        }
    }, {
        key: 'calculateWeights',
        value: function calculateWeights() {
            // const neuronsWithValues = this.neurons.filter((n) => n.value != 0).map((n) => n.id);
            // console.log("Neurons with values: ", neuronsWithValues);
            for (var i = 0; i < this.neurons.length; i++) {
                var neuron = this.neurons[i];
                if (!neuron) continue;
                if (neuron.incoming.length > 0) {
                    var sum = 0;
                    // if (neuron.incoming.length > 0) {
                    //     let incomingNeuronIds = neuron.incoming.map((i) => i.from); 
                    //     console.log("Incoming neuron Ids: ", incomingNeuronIds);
                    //     let matchingNeurons = incomingNeuronIds.filter((id) => neuronsWithValues.includes(id))
                    //     if (matchingNeurons.length > 0) {
                    //         console.log("Found matching ids: ", matchingNeurons);
                    //     }
                    // }
                    for (var j = 0; j < neuron.incoming.length; j++) {
                        var incoming = neuron.incoming[j];
                        var other = this.neurons[incoming.from];
                        sum += incoming.weight * other.value;
                    }
                    neuron.value = (0, _math.sigmoid)(sum);
                }
            }
        }
    }], [{
        key: 'loadFromJSON',
        value: function loadFromJSON(data) {
            var genome = new Genome();
            genome.mutationRates = Object.assign({}, data.mutationRates);
            genome.maxNeuron = data.maxNeuron;

            data.genes.forEach(function (geneData) {
                _innovation2.default.setHighestInnovation(geneData.innovation);
                var gene = new Gene();
                gene.from = geneData.from;
                gene.to = geneData.to;
                gene.weight = geneData.weight;
                gene.enabled = geneData.enabled;
                gene.innovation = geneData.innovation;
                genome.genes.push(gene);
            });

            genome.initializeNeurons();
            return genome;
        }
    }]);

    return Genome;
}();

exports.default = Genome;