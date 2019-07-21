# Evolutionary AI Battle

A 2D battleground simulation where two evolutionary AI's fight each other and evolve over time to become better and better. 

## Overview

At Amazon we have a yearly battle bot competition for virtual AI's. Engineers from all over Amazon compete to create the best AI and battle it out in a single elimination round-robin tournament. 

The battle is played in 75ms ticks. Each tick each AI is given the following information:

```
xPos - int [0 - MAP_WIDTH] Your bots x (horizontal) coordinate, where 0 is the left hand most column and MAP_WIDTH the right hand most column.
yPos - int [0 - MAP_HEIGHT] - Your bots y (vertical) coordinate, where 0 is the top of the screen and 500 is the bottom.
rotation - int [0-360] - The angle your bot is facing in degrees, where 0 degrees is east, 90 degrees is north, 180 west, 270 south.
bullets - Array<Bullet> - Any of your bullets currently on the screen
otherPlayer - An object with the above properties for the other player
```

Each bullet is an object of `{xPos, yPos, rotation}`

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
npm start
```

## Usage

### Training

You can either train one game at a time in your browser, or run many games in parallel using NodeJS. NodeJS will get you semi-intelligent AI's much quicker however you won't be able to see the games being played. 

#### Browser Training

First run `npm start` to run babble and compile all the files.

#### NodeJS Training

This will run all battles for each generation in parallel.  
@TODO - Add a config option for max workers. 

```
node ./coordinator.js
```

### Watching

To watch a battle between two AI's you can do the following:



## License

MIT © [Tim Robinson](http://timjrobinson.com)






