const sim = require('./simulation')

exports.Environment = function (size) {

    this.size = size;
    
    this.currentID = 0;
    this.teamID = 0;
    this.clusters = [];
    this.cells = [];
    this.leeches = [];

    this.getCell = function(id) {
        let found;
        this.cells.forEach(function(element){
            if(element.id == id){
                found = element;
            }
        });
        return found;
    }

    this.setCell = function(cell) {
        this.cells.forEach(function(element){
            if(element.id == cell.id){
                element = cell;
            }
        });
    }

    this.addCell = function(cell) {
        cell.run = new Function("api",cell.code);
        this.cells.push(cell);
    }

    this.addLeech= function(leech) {
        this.leeches.push(leech);
    }


    this.newId = function() {
        this.currentID++;
        return this.currentID;
    }

    this.newTeamId= function() {
        this.teamID++;
        return this.teamID;
    }
}


exports.Cluster = function (x,y,energy) {

    this.bdead = false;
    this.r = energy;
    this.x = x;
    this.y = y;
    this.energy = energy;

    this.die = function() {
        this.bdead = true;
    }

}

exports.Cell = function (x, y,r, energy, name, color, number, comment, code, teamid, id) {

    this.bdead = false;
    this.lastscan = 0;
    this.r = r;
    this.x = x;
    this.y = y;
    this.energy = energy;
    this.name = name;
    this.color = color;
    this.number = number;
    this.comment = comment;
    this.code = code;
    this.teamid = teamid;
    this.id = id;
    this.memory = -1;
    this.logs = [];
    this.run = null;


    this.heal = function(amount) {
        let divider = ((this.energy*this.energy)/3000);
        if(divider >= 1){
            this.energy += amount/divider;
        }else{
            this.energy += amount;
        }
        //this.addlog("Cell gained "+amount+" energy points",true)
    }

    this.addlog = function(log, detailled = false) {
        let date = new Date();
        this.logs.push(date.toLocaleTimeString()+" "+log);
    }

    this.takedmg = function(amount) {
        this.energy -= amount;

        if(this.energy <= 0){
            this.die();
        }
        //this.addlog("Cell lost "+amount+" energy points",true);
    }

    this.die = function() {
        this.bdead = true;
        this.addlog("Cell died");
    }

}

exports.Leech = function (x, y, energy, speedx, speedy, owner) {

    this.r = energy;
    this.bdead = false;
    this.x = x;
    this.y = y;
    this.energy = energy;
    this.speedx = speedx;
    this.speedy = speedy;
    this.owner = owner;

    this.newpos = function() {
        this.x += this.speedx;
        this.y += this.speedy;

        if(this.x > sim.getEnvSize() || this.y > sim.getEnvSize() || this.x < 0 || this.y < 0){
            this.die();
        }

    }

    this.die = function() {
        this.bdead = true;
    }

}

//PseudoObjects to be send to UI

exports.PseudoEnvironment = function (order) {

    this.clusters = [];
    this.cells = [];
    this.leeches = [];
    this.order = order;

}


exports.PseudoCluster = function (x,y,energy,bdead) {
    this.b = bdead;
    this.r = energy;
    this.x = x;
    this.y = y;
}

exports.PseudoCell = function (x, y, r, name, color, number, id) {

    this.bdead = false;
    this.lastscan = 0;
    this.r = r;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = color;
    this.number = number;
    this.id = id;


}

exports.PseudoLeech = function (x, y, energy, bdead) {

    this.r = energy;
    this.b = bdead;
    this.x = x;
    this.y = y;
    this.energy = energy;

}