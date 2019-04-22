
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
const MUTATION_TYPES = ['connections', 'link', 'node', 'enable', 'disable'];

const MUTATE_CONNECTION_CHANCE = 0.25;
const PERTUBE_CHANCE = 0.9;
const MUTATE_LINK_CHANCE = 2;
const MUTATE_NODE_CHANCE = 0.5;
const MUTATE_BIAS_CHANCE = 0.4;
const MUTATE_DISABLE_CHANCE = 0.4;
const MUTATE_ENABLE_CHANCE = 0.2;
const STEP_SIZE = 0.1;

class Gene {
    constructor() {
        this.from = null;
        this.to = null;
        this.weight = 0;
        this.enabled = true;
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
}

class Neuron {
    constructor(id) {
        this.id = id;
        this.incoming = [];
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

    load(genome) {
        this.genes = [];
        this.mutationRates = genome.getMutationRates()

        genome.genes.forEach((gene) => {
            this.genes.push(gene.clone());
        });
        this.initializeNeurons();
        this.maxNeuron = genome.maxNeuron;
    }

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
            let gene1 = parent1.genes[i];
            let gene2 = parent2Innovations[gene1.innovation];
            if (gene2 != null && Math.floor(Math.random() * 100) < PARENT2_INNOVATION_GENE_CHANCE && gene2.enabled) {
                this.genes.push(gene2.clone());
            } else {
                this.genes.push(gene1.clone())
            }
        }
        
        this.maxNeuron = Math.max(parent1.maxNeuron, parent2.maxNeuron);
        this.mutationRates = parent1.getMutationRates();
    }

    /* Chance of applying a random mutation to the child based on
    its mutation rate */
    mutate() {
        const mutationType = MUTATION_TYPES[Math.floor(Math.random() * MUTATION_TYPES.length)];
        const mutationFunctions = {
            connections: this.pointMutate,
            link: this.linkMutate,
            node: this.nodeMutate,
            enable: this.enableMutate,
            disable: this.disableMutate
        }

        mutationFunctions[mutationType].call(this);
    }

    getRandomNeuron(nonInput) {
        let startingId = nonInput ? INPUT_NEURONS : 0
        const pickableNeurons = this.neurons.map((neuron) => {
            if (neuron.id >= startingId) return neuron;
            return null;
        }).filter((n) => { return n != null });
        const neuronId = pickableNeurons[Math.floor(Math.random() * pickableNeurons.length)].id;
        return this.neurons[neuronId];
    }

    getRandomGene() {
        return this.genes[Math.floor(Math.random() * this.genes.length)];
    }

    hasSameGene(gene) {
        const hasGene = this.genes.some(function(g) {
            if (g.from === gene.from && g.to === gene.to) {
                return true
            }
            return false;
        });
        return hasGene;
    }

    pointMutate() {
        const step = this.mutationRates.step;

        this.genes = this.genes.map((gene) => {
            if (Math.random() < PERTUBE_CHANCE) {
                gene.weight = gene.weight + Math.random() * step*2 - step;
            } else {
                gene.weight = Math.random() * 4 - 2;
            }
            return gene;
        });
    }

    linkMutate() {
        // console.log("Performing link mutation");
        let neuron1 = this.getRandomNeuron(false)
        let neuron2 = this.getRandomNeuron(true)

        const gene = new Gene()
        if (neuron1.id < INPUT_NEURONS && neuron2.id < INPUT_NEURONS) {
            // Both input nodes, we can't link these
            return;
        }

        gene.from = neuron1.id;
        gene.to = neuron2.id;
        if (this.hasSameGene(gene)) {
            // Don't want two links betwen the same pair of neurons
            return;
        }

        gene.innovation = this.newInnovation()
        gene.weight = Math.random() * 4 - 2;

        // console.log("Inserting new gene: ", gene);
        this.genes.push(gene);
    }

    /* Takes a random gene, disables it, then creates a
    a new neuron with 2 new genes, one gene going to the old genes
    input and one to the old genes output. */
    nodeMutate() {
        // console.log("Performing node mutation");
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
        gene1.innovation = this.newInnovation()
        gene1.enabled = true;
        this.genes.push(gene1);

        const gene2 = gene.clone();
        gene2.from = neuronId;
        gene2.weight = 1;
        gene2.innovation = this.newInnovation()
        gene2.enabled = true;
        this.genes.push(gene2);

        // console.log("Inserting new gene1: ", gene1);
        // console.log("Inserting new gene2: ", gene2);
    }

    enableMutate() {
        // console.log("Performing enableMutate");
        if (this.genes.length == 0) return;
        const gene = this.getRandomGene();
        // console.log("Enabling gene: ", gene);
        gene.enabled = true;
    }

    disableMutate() {
        // console.log("Performing disableMutate");
        if (this.genes.length == 0) return;
        const gene = this.getRandomGene();
        // console.log("Disabling gene:", gene);
        gene.enabled = false;
    }

    calculateWeights() {
        // const neuronsWithValues = this.neurons.filter((n) => n.value != 0).map((n) => n.id);
        // console.log("Neurons with values: ", neuronsWithValues);
        for (let i = 0; i < this.neurons.length; i++) {
            let neuron = this.neurons[i];
            if (!neuron) continue;
            if (neuron.incoming.length > 0) {
                let sum = 0;
            // if (neuron.incoming.length > 0) {
            //     let incomingNeuronIds = neuron.incoming.map((i) => i.from); 
            //     console.log("Incoming neuron Ids: ", incomingNeuronIds);
            //     let matchingNeurons = incomingNeuronIds.filter((id) => neuronsWithValues.includes(id))
            //     if (matchingNeurons.length > 0) {
            //         console.log("Found matching ids: ", matchingNeurons);
            //     }
            // }
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