# Evolutionary AI Battle

A 2D battleground simulation where AI's fight each other and evolve over time to become better and better. 

## Overview

Many colleges and companies hold virtual AI battles for their engineers. You are given a sandbox environment with a few 
simple rules and must produce an AI algorithm that can beat all others. For a battle this year I decided to build an evolutionary
algorithm based off the [Evolving Neural Networks through Augmenting Topologies (NEAT) paper](http://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf)
and heavily inspired by the [Mar/IO project](https://www.youtube.com/watch?v=qv6UVOQ0F44).

The system initially creates 100 random genomes, then makes them fight each other, each AI playing 5 battles per round. At
the end of each round the weakest bots are culled, and the strongest bots go on to have children, which inherit their parents
genes plus get some random mutations of their own. The remaining parents and all the children then play each other in the next round. 
Over time this leads to more and more intelligent AI's battling each other. 

### How battles work

The battle is played in 75ms ticks. Each tick each AI is given the following information:

```
xPos - int [0 - MAP_WIDTH] Your bots x (horizontal) coordinate, where 0 is the left hand most column and MAP_WIDTH the right hand most column.
yPos - int [0 - MAP_HEIGHT] - Your bots y (vertical) coordinate, where 0 is the top of the screen and MAP_HEIGHT is the bottom.
rotation - int [0 - 360] - The angle your bot is facing in degrees, where 0 degrees is east, 90 degrees is north, 180 west, 270 south.
bullets - Array<Bullet> - Any of your bullets currently on the screen. Each bullet is an object of {xPos, yPos, rotation}.
otherPlayer - An object with the above properties for the other player
```

This object is sent to the bot each tick and the bot uses that to make it's next decision. Then it must return an object containing the following:

```
ds - boolean - Is the bot shooting or not
dx - int [-15 - 15] - The x-speed of the bot, from -15 (west) to 15 (east)
dy - int [-15 - 15] - The y-speed of the bot, from -15 (north) to 15 (south)
dh - int [-15 - 15] - The rotation speed of the bot, where -15 is counterclockwise and 15 is clockwise
```

You can only have a maximum of 5 bullets on the screen at once and they are destroyed when they hit the opponent or wall. Each player has 5 lives. 


## Setup

```
npm install
```

## Usage

### Training

You can either train one game at a time in your browser, or run many games in parallel using NodeJS. NodeJS will get you semi-intelligent AI's much quicker however you won't be able to see the games being played. 

#### Browser Training

- `npm run compile-browser` to run webpack and compile all the files. 
- Open `dist/index.html` in your browser. 

You should see the red bot chilling out not doing much, while the blue bot does something randomly. In the initial stages of training
only the red bot is trained, while the blue bot has a random move / shoot algorithm to give some variety to the battles. Because
it's the very beginning the red bot doesn't do much because it doesn't know what to do yet, this will change after a few generations. 

#### NodeJS Training

This will run all battles for each generation in parallel.  

```
npm run train
```

This will compile all the src files into `dist/nodejs/` then run `node dist/nodejs/coordinator.js` to start the training. 

### Watching

To watch a battle between two AI's you can do the following:

## Definitions

- Species - A species is a distinct set of AI's that inherit genes from each other. Each species contains many genomes. 
- Genome - A genome is a collection of genes which define how an bot acts. Each bot has one genome. 
- Gene - A gene describes a link between two neurons in the AI's brain. Each gene belongs to one genome and a genome has many genes. 
- Innovation - An innovation number is given to each gene upon creation. If a gene is passed to a child it is given the same innovation number. When two parents create children all genes come from the strongest parent, except those genes with the same innovation number, they are picked from one parent at random. 

### Innovation Numbers

The reason genes have innovation numbers is because if you picked genes randomly the children of even smart parents would
be pretty stupid. 

For example uou could have a parent that is good at shooting and a parent that is good at moving, and if they have a child 
you'd expect it would take one 'shooting' gene, and one 'moving' gene from each parent. If you picked genes randomly the 
child may instead get a 'moving' gene from each parent and no gene for shooting, and it would be significantly worse than 
the previous generation.

By giving an innovation number to each gene, and genes keep that innovation number when passing to children, you can make 
children only swap out genes that have the same genesis, so they are likely to be doing roughtly the same thing. This way
all children of the above parents should have at least one shooting gene, and one moving gene, and if they're lucky they'll
get the best genes from each parent (but that part is random, it is evolution after all).

## Configuration Options

All config options are stored in the file `config/default.json`

```
maxWorkers - int - The total worker threads to spawn when training in NodeJS mode. 
initialSpecies - int - The total species created at the beginning
initialGenomesPerSpecies - int - The total genomes in each species
```


## License

MIT © [Tim Robinson](http://timjrobinson.com)






