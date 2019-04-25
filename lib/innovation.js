"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* This is a singleton class that returns an innovation number for a new gene
Innovation numbers are used to keep track of genes when they are passed from
parent to child. When doing child creation only the genes with the same innovation
number from each parent are swapped so that genes are not 'lost' in the creation
of the child */

var Innovation = function () {
    function Innovation() {
        _classCallCheck(this, Innovation);

        this.innovation = 0;
    }

    // Used when loading data from a file to set the innovation number to the current known max. 
    // Only increases it if it's higher than teh current innovation number. 


    _createClass(Innovation, [{
        key: "setHighestInnovation",
        value: function setHighestInnovation(newInnovation) {
            this.innovation = Math.max(this.innovation, newInnovation);
        }
    }, {
        key: "getNext",
        value: function getNext() {
            this.innovation++;
            return this.innovation;
        }
    }]);

    return Innovation;
}();

exports.default = new Innovation();