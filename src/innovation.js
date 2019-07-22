/**
 * This is a singleton class that returns an innovation number for a new gene 
 * Innovation numbers are used to keep track of genes when they are passed from 
 * parent to child. When doing child creation only the genes with the same innovation 
 * number from each parent are swapped so that genes are not 'lost' in the creation 
 * of the child. See README for more information.
*/
class Innovation {
    constructor() {
        this.innovation = 0;
    }

    // Used when loading data from a file to set the innovation number to the current known max. 
    // Only increases it if it's higher than teh current innovation number. 
    setHighestInnovation(newInnovation) {
        this.innovation = Math.max(this.innovation, newInnovation);
    }

    getNext() {
        this.innovation++;
        return this.innovation;
    }

}

export default (new Innovation());