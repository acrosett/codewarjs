const sim = require('./simulation')
const virtualbox = require('./virtualbox')
const api = require('./api')
const objs = require('./objects')

exports.scan = function (radius){

    let cellId = virtualbox.getCurrentCellId();

    let env = sim.getEnv();
    let cell = env.getCell(cellId);

    let cellr = cell.r;
    let cellx = cell.x;
    let celly = cell.y;

    //TODO: better formula
    let cost = radius/200000;
    
    if(global.test){
        global.testdata.scancost += cost;
        global.testdata.scancostnum++;
    }

    let nearbyClusters = [];
    let nearbyCells = [];
    let nearbyLeeches = [];


    if(cell.energy >= cost){

        
        for (let i = 0; i < env.clusters.length; i++) {
            let obj = env.clusters[i];
            if(api.ECI(obj.r, obj.x, obj.y, cellr + radius, cellx,celly)){
                nearbyClusters.push(obj);
            }
        }
    
        for (let i = 0; i < env.cells.length; i++) {
            let obj = env.cells[i];
            if(api.ECI(obj.r, obj.x, obj.y, cellr + radius, cellx,celly)){
                nearbyCells.push(obj);
            }
        }
    
        for (let i = 0; i < env.leeches.length; i++) {
            let obj = env.leeches[i];
            if(api.ECI(obj.r, obj.x, obj.y, cellr + radius, cellx,celly)){
                nearbyLeeches.push(obj);
            }
        }
    }else{
        cell.addlog("Cannot perform scan, energy too low");
    }

    cell.takedmg(cost);

        env.setCell(cell);
    

    sim.setEnv(env);

    return [nearbyClusters, nearbyCells, nearbyLeeches];
}


exports.move = function (x,y){

    let cellId = virtualbox.getCurrentCellId();
    let env = sim.getEnv();
    let cell = env.getCell(cellId);


    let cost = (x*x+y*y)/(2000);

    if(global.test){
        global.testdata.movecost += cost;
        global.testdata.movecostnum++;
    }

    if(cell.energy >= cost){

        let envsize = env.size;

        let cellr = cell.r;
        let cellx = cell.x;
        let celly = cell.y;
        let celli = cell.id;

        let newx = cellx + x;
        let newy = celly + y;

    
 
            if(newx < envsize &&  (newx > 0)){
                let bool = true;
                for (let i = 0; i < env.cells.length; i++) {
                    let obj = env.cells[i];
                    if(celli != obj.id){
                        if(api.ECI(obj.r, obj.x, obj.y, cellr, newx,celly)){          
                            cell.addlog("Cannot perform move x, cell colision");
                            bool = false;
                            break;
                        }
                    }
                }
                if(bool){
                    cell.x = newx;
                }

            }else{
                cell.addlog("Cannot perform move x, cell out of boundaries");
            }

            if(newy < envsize &&  (newy > 0)){
                let bool = true;
                for (let i = 0; i < env.cells.length; i++) {
                    let obj = env.cells[i];
                    if(celli != obj.id){
                        if(api.ECI(obj.r, obj.x, obj.y, cellr, cellx, newy)){
                            cell.addlog("Cannot perform move y, cell colision");
                            bool = false;
                            break;
                        }
                    }
                }
                if(bool){
                    cell.y = newy;
                }
            }else{
                cell.addlog("Cannot perform move y, cell out of boundaries");
            }

        
        


    }else{
        cell.addlog("Cannot perform move, energy too low");
    }



    cell.takedmg(cost);
    env.setCell(cell);


    sim.setEnv(env);

}

const MAX_CELLS = 99999;
exports.split = function (){
    return;
    let env = sim.getEnv();
   
    if(env.cells.length >= MAX_CELLS){
        return;
    }
    let cellId = virtualbox.getCurrentCellId();

    let cell = env.getCell(cellId);

    let cellenergy = cell.energy;

    var copy = new objs.Cell(cell.x,cell.y,cell.r, cellenergy,cell.name,cell.color,cell.number,cell.comment,cell.code,cell.teamid,env.newId());

    let cost = cellenergy*0.6;

    if(global.test){
        global.testdata.splitcost += cost;
        global.testdata.splitcostnum++;
    }

    copy.takedmg(cost);
    cell.takedmg(cost);

    copy.x += Math.random()*2 -1;
    copy.y += Math.random()*2 -1;
    copy.number++;

    env.setCell(cell);
    env.addCell(copy);

    sim.setEnv(env);

}

exports.spawnleech = function(speedx, speedy, energy){

    
    if(energy <=0){
        return;
    }

    let cellId = virtualbox.getCurrentCellId();
    let env = sim.getEnv();
    let cell = env.getCell(cellId);


    let cost = api.gcspawnleech(speedx, speedy, energy);

    if(cell.energy >= cost){

        let leech = new objs.Leech(cell.x,cell.y, energy, speedx,speedy, cell.id);

        env.addLeech(leech);
    
        cell.takedmg(cost);
        env.setCell(cell);
        sim.setEnv(env);
    }

}

exports.gcspawnleech = function(speedx, speedy, energy){
    return (Math.abs(speedx)*5 + Math.abs(speedy)*5 + energy);
}


exports.takedmg = function(dmg){
    let cellId = virtualbox.getCurrentCellId();
    let env = sim.getEnv();
    let cell = env.getCell(cellId);

    cell.takedmg(dmg);
    env.setCell(cell);
    sim.setEnv(env);
}

exports.getMemory = function(){
    let cellId = virtualbox.getCurrentCellId();
    let env = sim.getEnv();
    let cell = env.getCell(cellId);

    return cell.memory;
}

exports.setMemory = function(memory){
    let cellId = virtualbox.getCurrentCellId();
    let env = sim.getEnv();
    let cell = env.getCell(cellId);

    cell.memory = memory;
    env.setCell(cell);

    sim.setEnv(env);
}

exports.addlog = function(log){
    let cellId = virtualbox.getCurrentCellId();
    let env = sim.getEnv();
    let cell = env.getCell(cellId);

    cell.addlog(log);
    env.setCell(cell);

    sim.setEnv(env);
}

exports.getEnvSize = function(){
    return sim.getEnvSize();
}

//Renvoie true si les cercles 1 et 2 on une intersection non nulle
exports.ECI = function (R1,x1,y1,R2,x2,y2){
    //Calcul la distance entre les deux centres et la compare aux rayons
    let dx = (x1 - x2);
    let dy = (y1 - y2); 

    let D = Math.sqrt((dx*dx)+(dy*dy));

    return ((R1+R2)>=D);
}

//Get distance
exports.GDB = function (x1,y1,x2,y2){
    //Calcul la distance entre les deux centres et la compare aux rayons
    let dx = (x1 - x2);
    let dy = (y1 - y2); 
    let D = Math.sqrt((dx*dx)+(dy*dy));
    return D;
}

//Get move coefs
exports.GMC = function(xo, yo, xd, yd) {

    let angle = (api.GAR(xo, yo, xd, yd) * Math.PI / 180);

    let coefx;
    let coefy;

    coefy = -Math.cos(angle);
    coefx = Math.sin(angle);

    return [coefx, coefy];
}

exports.getSelf = function (){
    let env = sim.getEnv();
    return env.getCell(virtualbox.getCurrentCellId());
}

//Retourne l'angle de rotation a appliquer à l'arme du joueur pour qu'elle pointe vers la souris 
exports.GAR = function(xo, yo, xd, yd) {
    let oppose = xo - xd;
    let adjacent = yo - yd;

    let angle = Math.atan(oppose / adjacent) * 180 / Math.PI;
    if (yo < yd) {
        angle = 180 - angle;
    } else {
        if (xo < xd) {
            angle = -angle;
        } else {
            angle = (90 - angle) + 270;
        }
    }
    return angle;
}