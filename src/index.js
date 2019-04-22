// The main file that will import the battleground and bot and play bots against each other

import Bot from './bot'
import Battleground from './battleground'
import Trainer from './trainer'

const trainer = new Trainer();
battle();

function battle() {
    // Bot 1 is the one we're training
    const bot1 = new Bot(1);
    bot1.loadGenome(trainer.getRandomGenome());

    // Bot 2 just does random stuff
    const bot2 = new Bot(2);

    // const commands = bot.update(inputs);

    const battleground = new Battleground()
    battleground.addBots(bot1, bot2);
    battleground.start((results) => {
        console.log("Battle results: ", results);

        const botFitness = bot1.lives * 10 + (5 - bot2.lives) * 10 + Math.floor(results.totalTime)
        console.log("Bot fitness is: ", botFitness);
        bot1.genome.addFitness(botFitness);
        bot1.genome.totalRounds++;

        const roundsRemaining = trainer.getTotalRoundsRemaining() 
        console.log("Round Complete, " + roundsRemaining + " rounds remaining");
        if (roundsRemaining <= 0) {
            trainer.newGeneration();
        }

        setTimeout(battle);
    });
}

