/**
 * The genome is the main neural network for the bots. It has many neurons and genes (links between
 * neurons). 
 * 
 * When the genome is saved to disk only the genes are saved, the neurons are ephemeral as they can be
 * easily created based on the gene information.  
 */
import {
    INPUT_NEURONS,
    OUTPUT_NEURONS,
    MAX_NEURONS
} from './constants'

import {
    sigmoid
} from './math'

import Innovation from './innovation'
const debug = require("debug")("eai:genome");

const INITIAL_MUTATION_RATE = 1;

const PARENT2_INNOVATION_GENE_CHANCE = 0.5;
const MUTATION_TYPES = ['connections', 'link', 'node', 'enable', 'disable'];

const MUTATE_CONNECTION_CHANCE = 0.25;
const PERTUBE_CHANCE = 0.9;
const MUTATE_LINK_CHANCE = 2;
const MUTATE_NODE_CHANCE = 0.5;
const MUTATE_BIAS_CHANCE = 0.4;
const MUTATE_DISABLE_CHANCE = 0.4;
const MUTATE_ENABLE_CHANCE = 0.2;
const STEP_SIZE = 0.1;

/**
 * A Gene is a link between two neurons. 
 */
class Gene {
    constructor() {
        /** The ID of the input neuron to this gene */
        this.from = null;
        /** The ID of the neuron this gene outputs to */
        this.to = null;
        /** The weight of this gene (multiplyer of the value passed in) */
        this.weight = 0;
        /** Whether this gene is enabled or not */
        this.enabled = true;
        /** The innovation number for this gene, see README for more details */
        this.innovation = 0;
    }

    clone() {
        const gene = new Gene();
        gene.from = this.from; 
        gene.to = this.to;
        gene.weight = this.weight;
        gene.enabled = this.enabled;
        gene.innovation = this.innovation;
        return gene;
    }

    serialize() {
        return {
            from: this.from,
            to: this.to,
            weight: this.weight,
            enabled: this.enabled,
            innovation: this.innovation
        };
    }
}

/**
 * A Neuron is a node in the brain. 
 */
class Neuron {
    constructor(id) {
        this.id = id;
        /** An array of all genes inputting to this neuron */
        this.incoming = [];
        /** The current value of the Neuron */
        this.value = 0;
    }
}

export default class Genome {
    constructor() {
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
        this.maxNeuron = INPUT_NEURONS;
        this.totalRounds = 0;
    }

    /** 
     * Load from an existing Genome object. 
     */
    load(genome) {
        this.genes = [];
        this.mutationRates = genome.getMutationRates()

        genome.genes.forEach((gene) => {
            this.genes.push(gene.clone());
        });
        this.initializeNeurons();
        this.maxNeuron = genome.maxNeuron;
    }

    /**
     * Creates a new Genome from a JS object (parsed from JSON)
     *  
     * @param {Object} data 
     */
    static loadFromJSON(data) {
        const genome = new Genome();
        genome.mutationRates = Object.assign({}, data.mutationRates);
        genome.maxNeuron = data.maxNeuron;
        genome.fitness = data.fitness;

        /** Load all the genes into the genome first */
        data.genes.forEach((geneData) => {
            Innovation.setHighestInnovation(geneData.innovation);
            const gene = new Gene();
            gene.from = geneData.from;
            gene.to = geneData.to;
            gene.weight = geneData.weight;
            gene.enabled = geneData.enabled;
            gene.innovation = geneData.innovation;
            genome.genes.push(gene);
        });

        /** Create the neurons based on the genes */
        genome.initializeNeurons();
        return genome;
    }

    /**
     * Returns an object representing this Genome  
     */
    serialize() {
        const genes = this.genes.map((gene) => {
            return gene.serialize();
        });
        return {
            genes: genes,
            mutationRates: Object.assign({}, this.mutationRates),
            maxNeuron: this.maxNeuron,
            fitness: this.fitness
        }
    }

    /** 
     * Create a new Genome that is an exact copy of this one
     */
    clone() {
        const clonedGenome = new Genome();
        this.genes.forEach(function (gene) {
            clonedGenome.genes.push(gene.clone());
        });

        clonedGenome.mutationRates = this.getMutationRates();

        return clonedGenome;
    }

    addFitness(fitness) {
        this.fitness += fitness;
    }

    getMutationRates() {
        return Object.assign({}, this.mutationRates);
    }

    newInnovation() {
        return 0;
    }

    /**
     * Create all the neurons in this Genome based on the genes.
     */
    initializeNeurons() {
        this.neurons = [];

        for (let i = 0; i < INPUT_NEURONS; i++) {
            this.neurons.push(this.createNeuron(i))
        }

        for (let i = 0; i < OUTPUT_NEURONS; i++) {
            let id = MAX_NEURONS + i;
            this.neurons[id] = this.createNeuron(id);
        }

        this.genes.forEach((gene) => {
            if (!gene.enabled) return;

            if (this.neurons[gene.to] == null) {
                this.neurons[gene.to] = new Neuron(gene.to);
            }
            this.neurons[gene.to].incoming.push(gene);

            if (this.neurons[gene.from] == null) {
                this.neurons[gene.from] = new Neuron(gene.from);
            }
        });
    }

    createNeuron(id) {
        const neuron = new Neuron(id);
        return neuron;
    }

    /**
     * Take the genomes of two parents and return a child Genome. The child will have most of the genes
     * from the fittest parent, however any genes that have the same innovation number will be chosen
     * randomly from either parent. See the Innovation section of the README for more information. 
     */
    inheritFromParents(parent1, parent2) {
        const parent2Innovations = {};
        for (let i = 0; i < parent2.genes.length; i++) {
            let gene = parent2.genes[i];
            parent2Innovations[gene.innovation] = gene;
        }

        for (let i = 0; i < parent1.genes.length; i++) {
            let geneParent = parent1;
            let gene1 = parent1.genes[i];
            let gene2 = parent2Innovations[gene1.innovation];
            if (gene2 != null && Math.random() < PARENT2_INNOVATION_GENE_CHANCE && gene2.enabled) {
                this.genes.push(gene2.clone());
            } else {
                this.genes.push(gene1.clone())
            }
        }
        
        this.maxNeuron = Math.max(parent1.maxNeuron, parent2.maxNeuron);
        this.mutationRates = parent1.getMutationRates();
    }

    /** 
     * Each Genome has its own mutation rates to add variety to evolution. This function performs 
     * random mutations based on those different rates. Multiple mutations even of the same type
     * can occur at once. This changes the Genome in place.
     */
    mutate() {
        Object.keys(this.mutationRates).forEach((mutationType) => {
            const currentRate = this.mutationRates[mutationType];
            if (Math.random() < 0.5) {
                this.mutationRates[mutationType] = currentRate * 0.95;
            } else {
                this.mutationRates[mutationType] = currentRate * (1 / 0.95);
            }
        });

        if (Math.random() < this.mutationRates['connections']) {
            this.pointMutate();
        }

        let linkMutations = this.mutationRates['link'];
        while (linkMutations > 0) {
            if (Math.random() < linkMutations) {
                this.linkMutate();
            }
            linkMutations -= 1;
        }

        let nodeMutations = this.mutationRates['node'];
        while (nodeMutations > 0) {
            if (Math.random() < nodeMutations) {
                this.nodeMutate();
            }
            nodeMutations -= 1;
        }

        let enableMutations = this.mutationRates['enable'];
        while (enableMutations > 0) {
            if (Math.random() < enableMutations) {
                this.enableMutate();
            }
            enableMutations -= 1;
        }

        let disableMutations = this.mutationRates['disable'];
        while (disableMutations > 0) {
            if (Math.random() < disableMutations) {
                this.disableMutate();
            }
            disableMutations -= 1;
        }
    }

    /**
     * Pick a random Neuron from the Genome.  
     * @param {boolean} nonInput if true allow selecting one of the input neurons
     */
    getRandomNeuron(nonInput) {
        let startingId = nonInput ? INPUT_NEURONS : 0
        const pickableNeurons = this.neurons.map((neuron) => {
            if (neuron.id >= startingId) return neuron;
            return null;
        }).filter((n) => { return n != null });
        const neuronId = pickableNeurons[Math.floor(Math.random() * pickableNeurons.length)].id;
        return this.neurons[neuronId];
    }

    /** 
     * Pick a random gene from the Genome
     * @returns Gene
     */
    getRandomGene() {
        return this.genes[Math.floor(Math.random() * this.genes.length)];
    }

    /**
     * Checks if this Genome has the specified gene 
     * @param {Gene} gene 
     * @returns boolean - true if this Genome has the Gene
     */
    hasSameGene(gene) {
        const hasGene = this.genes.some(function(g) {
            if (g.from === gene.from && g.to === gene.to) {
                return true
            }
            return false;
        });
        return hasGene;
    }

    /**
     * Mutate the weights of all genes in the Genome.
     */
    pointMutate() {
        const step = this.mutationRates.step;

        this.genes = this.genes.map((gene) => {
            if (Math.random() < PERTUBE_CHANCE) {
                gene.weight = gene.weight + Math.random() * step * 2 - step;
            } else {
                gene.weight = Math.random() * 4 - 2;
            }
            return gene;
        });
    }

    /**
     * Takes two random neurons and creates a new Gene linking them. The gene always goes from
     * the lower ID neuron to the higher ID one, as information should only flow forwards through
     * the neural network. 
     */
    linkMutate() {
        debug("Performing link mutation");
        let neuron1 = this.getRandomNeuron(false);
        let neuron2 = this.getRandomNeuron(true);

        const gene = new Gene()
        if (neuron1.id < INPUT_NEURONS && neuron2.id < INPUT_NEURONS) {
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

        gene.innovation = Innovation.getNext();
        gene.weight = Math.random() * 4 - 2;

        debug("Inserting new gene: ", gene);
        this.genes.push(gene);
    }

    /**
     * Takes a random gene, disables it, then creates a new neuron with 2 new genes, one gene going 
     * from the old genes input to the new neuron, and one going from the new neuron to the old 
     * genes output. 
     */
    nodeMutate() {
        debug("Performing node mutation");
        if (this.genes.length == 0) {
            return;
        }

        const gene = this.getRandomGene();
        if (!gene.enabled) {
            return;
        }
        gene.enabled = false;

        this.maxNeuron++;
        const neuronId = this.maxNeuron;

        const gene1 = gene.clone();
        gene1.to = neuronId;
        gene1.weight = 1;
        gene1.innovation = Innovation.getNext();
        gene1.enabled = true;
        this.genes.push(gene1);

        const gene2 = gene.clone();
        gene2.from = neuronId;
        gene2.weight = 1;
        gene2.innovation = Innovation.getNext();
        gene2.enabled = true;
        this.genes.push(gene2);

        debug("Inserting new gene1: ", gene1);
        debug("Inserting new gene2: ", gene2);
    }

    /**
     * Enables a random Gene (even if it is already enabled) 
     */
    enableMutate() {
        debug("Performing enableMutate");
        if (this.genes.length == 0) return;
        const gene = this.getRandomGene();
        debug("Enabling gene:", gene);
        gene.enabled = true;
    }

    /**
     * Disables a random Gene (even if it is already disabled)
     */
    disableMutate() {
        debug("Performing disableMutate");
        if (this.genes.length == 0) return;
        const gene = this.getRandomGene();
        debug("Disabling gene:", gene);
        gene.enabled = false;
    }

    /**
     * Runs the neural network. Takes the input neurons and flows that information along the Genes
     * to other Neurons and eventually to the output Neurons. 
     */
    calculateWeights() {
        for (let i = 0; i < this.neurons.length; i++) {
            let neuron = this.neurons[i];
            if (!neuron) continue;
            if (neuron.incoming.length > 0) {
                let sum = 0;
                for (let j = 0; j < neuron.incoming.length; j++) {
                    let incoming = neuron.incoming[j];
                    let other = this.neurons[incoming.from];
                    sum += incoming.weight * other.value;  
                }
                neuron.value = sigmoid(sum);
            }
        }
    }
}