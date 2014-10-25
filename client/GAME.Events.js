var GAME = GAME || {};

GAME.Events = function(event) {
    this.event = event; // typ události
    this.consumed = false; // byla již zpracována?
}

GAME.Events.prototype = {
    constructor : GAME.Events,
    CTRL_Z : "ctrl+z",
};