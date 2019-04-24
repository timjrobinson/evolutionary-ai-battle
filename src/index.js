// The main file that will import the battleground and bot and play bots against each other

import Bot from './bot'
import Battleground from './battleground'
import Trainer from './trainer'
import species1 from '../species-1.json'
import species2 from '../species-2.json'
import species3 from '../species-3.json'
import species4 from '../species-4.json'

const trainer = new Trainer();
trainer.initializeSpecies();
// trainer.loadSpeciesFromJSON({genomes: species1});
// trainer.loadSpeciesFromJSON({genomes: species2});
// trainer.loadSpeciesFromJSON({genomes: species3});
// trainer.loadSpeciesFromJSON({genomes: species4});
battle();

function battle() {
    // Bot 1 is the one we're training
    const bot1 = new Bot(1);
    bot1.loadGenome(trainer.getRandomGenome());

    // Bot 2 just does random stuff
    const bot2 = new Bot(2);
    bot2.loadGenome(trainer.getRandomGenome());
    bot2.selectAIMethod();

    // const commands = bot.update(inputs);

    const battleground = new Battleground()
    battleground.addBots(bot1, bot2);
    battleground.start((results) => {
        console.log("Battle results: ", results);

        let botFitness = Math.floor(results.totalTime) + ((5 - bot2.lives) * 10)
        if (results.winner == 1) {
            botFitness += bot1.lives * 10;
            botFitness += 100;
        }
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

