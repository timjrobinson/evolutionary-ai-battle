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
            return this.speciesData.species.reduce((currentMax, species) => {
                if (species.maxFitness > currentMax) {
                    return species.maxFitness;
                }
                return currentMax;
            }, 0);
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
        log.info("Battle results: ", results);

        const maxRoundTime = config.maxRoundTime;

        /* Give the bot an initial fitness of 20 points for each life it took off the opponent */
        let botFitness =  ((5 - bot2.lives) * 20);
        if (results.winner == 1) {
            /* If the bot won it gets bonus fitness the quicker it won */
            botFitness += maxRoundTime - Math.min(maxRoundTime, Math.floor(results.totalTime))
            /* The bot gets 10 fitness points for each life it had left at the end */
            botFitness += bot1.lives * 10;
            /* The bot gets bonus fitness for winning */
            botFitness += 150;
        } else {
            /* If the bot lost it gets bonus fitness for the longer it survived */
            botFitness += Math.min(maxRoundTime, Math.floor(results.totalTime))
        }
        log.debug("Bot fitness is: ", botFitness);

        /**
         * Add the fitness for this round to the bot. Then increase played rounds as each bot only 
         * plays config.roundsPerGenome rounds in each generation.
         */
        bot1.genome.addFitness(botFitness);
        bot1.genome.totalRounds++;

        const roundsRemaining = trainer.getTotalRoundsRemaining() 
        log.info("Round Complete, " + roundsRemaining + " rounds remaining");
        if (roundsRemaining <= 0) {
            trainer.newGeneration();
        }

        setTimeout(() => battle.call(this));
    });
}