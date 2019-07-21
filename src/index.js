// The main file that will import the battleground and bot and play bots against each other

import Bot from './bot'
import Battleground from './battleground'
import Trainer from './trainer'
import species1 from '../species/a6771530-generation-1179-species.json'
import species2 from '../species-2.json'
import species3 from '../species-3.json'
import species4 from '../species-4.json'

const trainer = new Trainer();
// trainer.initializeSpecies();
// trainer.loadSpeciesFromJSON({genomes: species1});
// trainer.loadSpeciesFromJSON({genomes: species2});
// trainer.loadSpeciesFromJSON({genomes: species3});
// trainer.loadSpeciesFromJSON({genomes: species4});
species1.forEach(function(species) {
    trainer.loadSpeciesFromJSON(species);
});
const topGenome = trainer.getTopGenome();
console.log(JSON.stringify(topGenome.serialize()));
battle();

function battle() {
    // Bot 1 is the one we're training
    const bot1 = new Bot(1);
    bot1.loadGenome(trainer.getTopGenome());

    // Bot 2 just does random stuff
    const bot2 = new Bot(2);
    bot2.loadGenome(trainer.getTopGenome());
    // bot2.selectAIMethod();

    // const commands = bot.update(inputs);

    const battleground = new Battleground()
    battleground.addBots(bot1, bot2);
    battleground.start((results) => {
        console.log("Battle results: ", results);

        let botFitness = Math.min(60, Math.floor(results.totalTime)) + ((5 - bot2.lives) * 20)
        if (results.winner == 1) {
            botFitness += bot1.lives * 10;
            botFitness += 150;
        }
        console.log("Bot fitness is: ", botFitness);
        // bot1.genome.addFitness(botFitness);
        // bot1.genome.totalRounds++;

        const roundsRemaining = trainer.getTotalRoundsRemaining() 
        console.log("Round Complete, " + roundsRemaining + " rounds remaining");
        if (roundsRemaining <= 0) {
            trainer.newGeneration();
        }

        setTimeout(battle);
    });
}

