
import {
    INPUT_NEURONS,
    OUTPUT_NEURONS,
    MAX_NEURONS
} from './constants'

import {
    sigmoid
} from './math'

const INITIAL_MUTATION_RATE = 1;

const PARENT2_INNOVATION_GENE_CHANCE = 50;
const MUTATION_TYPES = ['connections', 'link', 'bias', 'node', 'enable', 'disable'];

const MUTATE_CONNECTION_CHANCE = 0.25;
const MUTATE_LINK_CHANCE = 2;
const MUTATE_NODE_CHANCE = 0.5;
const MUTATE_BIAS_CHANCE = 0.4;
const MUTATE_DISABLE_CHANCE = 0.4;
const MUTATE_ENABLE_CHANCE = 0.2;
const STEP_SIZE = 0.1;

class Gene {
    constructor() {
        this.into = null;
        this.out = null;
        this.weight = 0;
        this.enabled = true;
        this.innovation = 0;
    }

    clone() {
        const gene = new Gene();
        gene.into = this.into; 
        gene.out = this.out;
        gene.weight = this.weight;
        gene.enabled = this.enabled;
        gene.innovation = this.innovation;
        return gene;
    }
}

class Neuron {
    constructor(id) {
        this.id = id;
        this.incoming = [];
        this.outgoing = [];
        this.value = 0;
    }
}

export default class Genome {
    constructor() {
        this.genes = [];
        this.neurons = [];
        this.maxNeuron = 0;
        this.mutationRates = {
            connections: MUTATE_CONNECTION_CHANCE,
            link: MUTATE_LINK_CHANCE,
            bias: MUTATE_BIAS_CHANCE,
            node: MUTATE_NODE_CHANCE,
            enable: MUTATE_ENABLE_CHANCE,
            disable: MUTATE_DISABLE_CHANCE,
            step: STEP_SIZE
        };
        this.fitness = 0;
        this.globalRank = 0;
        this.initializeNeurons();
    }

    load(genome) {
        this.genes = [];
        this.mutationRates = genome.getMutationRates()

        genome.genes.forEach((gene) => {
            this.genes.push(gene.clone());
        });
        this.initializeNeurons();
    }

    clone() {
        const clonedGenome = new Genome();
        this.genes.forEach(function (gene) {
            clonedGenome.genes.push(gene.clone());
        });

        clonedGenome.mutationRates = this.getMutationRates();

        return clonedGenome;
    }

    getMutationRates() {
        return Object.assign({}, this.mutationRates);
    }

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

            if (this.neurons[gene.out] == null) {
                this.neurons[gene.out] = new Neuron(gene.out);
            }
            this.neurons[gene.out].incoming.push(gene);

            if (this.neurons[gene.into] == null) {
                this.neurons[gene.into] = new Neuron(gene.into);
            }
        });
    }

    createNeuron(id) {
        const neuron = new Neuron(id);
        return neuron;
    }

    /* Child gets most of its genes from parent1 which is the fittest 
    of the two parents */
    inheritFromParents(parent1, parent2) {
        const parent2Innovations = {};
        for (let i = 0; i < parent2.genes.length; i++) {
            let gene = parent2.genes[i];
            parent2Innovations[gene.innovation] = gene;
        }

        for (let i = 0; i < parent1.genes.length; i++) {
            let geneParent = parent1;
            if (parent2Innovations[parent1.genes[i].innovation] != null
                && Math.floor(Math.random() * 100) < PARENT2_INNOVATION_GENE_CHANCE
                && parent2.genes[i].enabled) {
                geneParent = parent2;
            }

            let gene = geneParent.genes[i].clone(); 
            this.genes.push(gene);
        }
        
        this.maxNeuron = Math.max(parent1.maxNeuron, parent2.maxNeuron);
        this.mutationRates = parent1.getMutationRates();
    }

    /* Chance of applying a random mutation to the child based on
    its mutation rate */
    mutate() {
        const mutationType = MUTATION_TYPES[Math.floor(Math.random() * MUTATION_TYPES.length)];
        const mutationFunctions = {
            link: this.linkMutate,
            node: this.nodeMutate,
            enable: this.enableMutate,
            disable: this.disableMutate
        }

        mutationFunctions[mutationType]();
    }

    getRandomNeuron(nonInput) {
        let startingId = nonInput ? INPUT_NEURONS : 0
    }

    linkMutate() {
        const neuron1 = this.getRandomNeuron(false)
        const neuron2 = this.getRandomNeuron(true)

        const gene = new Gene()

    }

    nodeMutate() {

    }

    enableMutate() {

    }

    disableMutate() {

    }

    calculateWeights() {
        for (let i = 0; i < this.neurons.length; i++) {
            let neuron = this.neurons[i];
            if (!neuron) continue;
            let sum = 0;
            for (let j = 0; j < neuron.incoming.length; j++) {
                let incoming = neuron.incoming[j];
                let other = this.neurons[incoming.into];
                sum += incoming.weight * other.value;  
            }
            neuron.value = sigmoid(sum);
        }
    }
}