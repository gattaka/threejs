var GAME = GAME || {};

GAME.Events = function(eventCode) {
    this.eventCode = eventCode; // typ události
    this.consumed = false; // byla již zpracována?
}

GAME.Events.CTRL_Z = new GAME.Events("ctrl+z");