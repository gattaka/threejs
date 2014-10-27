var GAME = GAME || {};

GAME.Event = function(eventCode) {
    this.eventCode = eventCode; // typ události
    this.consumed = false; // byla již zpracována?
}

GAME.Event.CTRL_Z = new GAME.Event("ctrl+z");