const uuid = require("uuid");
const cluster = require('cluster');
const async = require("async");
const fs = require("fs");

import Bot from './bot'
import Battleground from './battleground'
import Trainer from './trainer'
import Genome from './genome'

// import species1 from '../51746690-generation-108-species.json'

if (cluster.isMaster) {
    trainerProcess();
} else {
    battleProcess();
}


function trainerProcess() {
    const runId = uuid.v1().toString().slice(0, 8);
    console.log("Run ID: " + runId);
    const workers = [];

    const trainer = new Trainer();
    trainer.initializeSpecies();
    // species1.forEach(function(species) {
    //     trainer.loadSpeciesFromJSON(species);
    // });
    // trainer.totalGenerations = 108;

    startBattle(runId, trainer);
}

function startBattle(runId, trainer) {
    let roundsRemaining = trainer.getTotalRoundsRemaining();
    async.timesSeries(roundsRemaining, (i, next) => {
        console.log(`Starting round ${i}...`);
        trainer.getRandomAvailableGenome((genome1) => {
            genome1.totalRounds++;
            const genome2 = trainer.getRandomGenome();
            startRound(trainer.totalGenerations, genome1, genome2, (results) => {
                roundsRemaining--;
                console.log(`${roundsRemaining} rounds remaining`);
                if (roundsRemaining <= 0) {
                    console.log("Saving current generation of species to disk");
                    const serializedSpecies = JSON.stringify(trainer.species.map((species) => species.serialize()));
                    fs.writeFile(`${runId}-generation-${trainer.totalGenerations}-species.json`, serializedSpecies, (err, result) => {
                        console.log("Creating new generation")
                        trainer.newGeneration();
                        setTimeout(startBattle.bind(this, runId, trainer));
                    });
                }
            });
            next();
        });
    }, (err, result) => {
        console.log("Finished starting rounds");
    });

}

function startRound(totalGenerations, genome1, genome2, callback) {
    const worker = cluster.fork();
    worker.on('message', (msg) => {
        if (msg.type == 'results') {
            handleResults(msg.data);
        }
    });
    worker.send({
        totalGenerations,
        genomes: [
            genome1.serialize(),
            genome2.serialize()
        ]
    });

    function handleResults(results) {
        // console.log("Battle results: ", results);

        let botFitness = Math.min(60, Math.floor(results.totalTime)) + ((5 - results.bot2.lives) * 20)
        if (results.winner == 1) {
            botFitness += results.bot1.lives * 10;
            botFitness += 150;
        }
        console.log("Bot fitness is: ", botFitness);
        genome1.addFitness(botFitness);
        worker.kill();
        return callback(results);
    }
}

function battleProcess() {
    process.on('message', (msg) => {
        const bot1 = new Bot(1);
        const genome1 = Genome.loadFromJSON(msg.genomes[0]);
        bot1.loadGenome(genome1);

        // Bot 2 just does random stuff
        const bot2 = new Bot(2);
        const genome2 = Genome.loadFromJSON(msg.genomes[1]);
        bot2.loadGenome(genome2);
        bot2.selectAIMethod(msg.totalGenerations);

        const battleground = new Battleground()
        battleground.addBots(bot1, bot2);
        battleground.start((results) => {
            process.send({
                type: 'results',
                data: results
            });
        });
    });
}

