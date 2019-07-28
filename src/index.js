/**
 * This is the main file for the browser based trainer. It imports the battleground and bots and 
 * play bots against each other one round at a time. 
 **/

import Bot from './bot'
import Battleground from './battleground'
import Trainer from './trainer'
import config from '../config/default.json'
import log from './logger'
const trainer = new Trainer();

/**
 * If you have a file containing species that you've trained previously you can
 * uncomment these lines to load all the genomes from each species and continue 
 * training with them.  
 */

// import existingSpecies from "../species/SPECIESID/SPECIESID-generation-GENERATION-species.json";
// trainer.loadSpeciesFromJSON(existingSpecies);

if (!trainer.species.length) {
    trainer.createInitialSpecies();
}

battle();

function battle() {
    /* Bot 1 is the one we're training */
    const bot1 = new Bot(1);
    bot1.loadGenome(trainer.getTopGenome());

    /**
     * Bot 2 picks a random algorithm initially, and after more rounds are completed
     * it starts using genomes for its movement. 
     **/
    const bot2 = new Bot(2);
    bot2.loadGenome(trainer.getTopGenome());
    bot2.selectAIMethod(trainer.totalGenerations);

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

        setTimeout(battle);
    });
}

