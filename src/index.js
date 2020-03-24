/**
 * This is the main file for the browser based trainer. It imports the battleground and bots and 
 * play bots against each other one round at a time. 
 **/
import Vue from 'vue/dist/vue.js'
import Bot from './bot'
import Battleground from './battleground'
import Trainer from './trainer'
import config from '../config/default.json'
import log from './logger'

const trainer = new Trainer();

var app = new Vue({
    el: '#evolutionary-ai-battle',
    data() {
        return {
            loading: true,
            species: [],
            speciesData: null,
            bot1Stats: {},
            bot2Stats: {}
        }
    },
    methods: {
        async selectSpecies(speciesId) {
            this.loading = true;
            const response = await fetch(`/species/${speciesId}/latest`);
            const speciesData = await response.json();
            this.speciesData = speciesData;
            this.loading = false;
            Vue.nextTick(() => {
                battle.call(this, speciesData);
            });
        },
    },
    computed: {
        generation() {
            return this.speciesData.totalGenerations;
        },
        maxFitness() {
            return this.speciesData.maxFitness;
        },
        bot1Info() {
            return {
                lastFitness: this.bot1Stats.lastFitness || "NEW",
                fitness: this.bot1Stats.fitness
            }
        },
        bot2Info() {
            return {
                lastFitness: this.bot2Stats.lastFitness || "NEW",
                fitness: this.bot2Stats.fitness
            }
        }
    },
    async mounted() {
        const response = await fetch('/species');
        const species = await response.json();
        this.species = formatSpecies(sortSpecies(species));
        this.loading = false;
    }
});

function sortSpecies(speciesData) {
    return speciesData.sort((a, b) => {
        const aLastUpdate = new Date(a.lastUpdate);
        const bLastUpdate = new Date(b.lastUpdate);
        return aLastUpdate.getTime() < bLastUpdate.getTime();
    });
}

function formatSpecies(speciesData) {
    return speciesData.map((species) => {
        console.log("LastUpdate: ", species.lastUpdate);
        console.log("LastUpdate Formatted: ", new Date(species.lastUpdate).toLocaleString("en-US"));
        return {
            id: species.id,
            lastUpdate: new Date(species.lastUpdate).toLocaleString(),
            latestGeneration: species.latestGeneration
        }
    });
}

function battle(existingSpecies) {
    if (existingSpecies != null) {
        trainer.loadSpeciesFromJSON(existingSpecies);
    } else {
        trainer.createInitialSpecies();
    }

    /* Bot 1 is the one we're training */
    const bot1 = new Bot(1);
    const bot1Genome = trainer.getTopGenome();
    bot1.loadGenome(bot1Genome);
    this.bot1Stats = bot1Genome.getStats();

    /**
     * Bot 2 picks a random algorithm initially, and after more rounds are completed
     * it starts using genomes for its movement. 
     **/
    const bot2 = new Bot(2);
    const bot2Genome = trainer.getTopGenome();
    bot2.loadGenome(bot2Genome);
    bot2.selectAIMethod(trainer.totalGenerations);
    this.bot2Stats = bot2Genome.getStats();

    const battleground = new Battleground()
    battleground.addBots(bot1, bot2);
    battleground.start((results) => {
        /* Calculate the bots fitness using the trainer method */
        const botFitness =  Trainer.calculateBotFitnessFromResults(results, trainer.totalGenerations);

        /**
         * Add the fitness for this round to the bot. Then increase played rounds as each bot only 
         * plays config.roundsPerGenome rounds in each generation.
         */
        bot1.genome.addFitness(botFitness);
        bot1.genome.totalRounds++;

        const roundsRemaining = trainer.getTotalRoundsRemaining() 
        if (roundsRemaining <= 0) {
            trainer.newGeneration();
        }

        setTimeout(() => battle.call(this));
    });
}