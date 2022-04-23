const objs = require('./objects');
const virtualbox = require('./virtualbox')
const api = require('./api')
const sim = require('./simulation')
const {parentPort} = require('worker_threads');
const {  performance } = require('perf_hooks');

global.test = true;
if(global.test){
    global.testdata = {
        runs:0,
        codecost:0,
        codecostnum:0,
        splitcost:0,
        splitcostnum:0,
        movecost:0,
        movecostnum:0,
        scancost:0,
        scancostnum:0
     }
}


const ENV_SIZE = 12000/2;
const MAX_CLUSTERS = ENV_SIZE / 50;


var env = new objs.Environment(ENV_SIZE);

//Test
var fs = require('fs');

var code;

setTimeout(function(){ 
    
    fs.readFile('temp.js', 'utf8', function (err, data) {
        if (err) throw err;
        code = data;
        env.cells.push(new objs.Cell(300, 300, 80,70, "DemoCell", "DarkCyan", 1, "hello", code, env.newId()));
        env.cells.push(new objs.Cell(ENV_SIZE - 300, ENV_SIZE - 300, 80,70, "DemoCell", "Crimson", 1, "hello", code, env.newId()));
        env.cells.push(new objs.Cell(ENV_SIZE - 300, 300, 80,70, "DemoCell", "GoldenRod", 1, "hello", code, env.newId()));
        env.cells.push(new objs.Cell(300, ENV_SIZE - 300, 80,70, "DemoCell", "MediumSpringGreen", 1, "hello", code, env.newId()));
   
    });

}, 10000);



var pseudoenvs = [];

const MAX_PSEUDOENV = 1000/20;


var moy = 0;
var costs = [];

const ENERGY_BASIS = 50;
var bool = true;
var ultimatum = 0;

function getSum(total, num) {
    return total + num;
}

exports.run = function () {
    
    if(global.test){
        global.testdata.runs++;
        var before = performance.now();
    }

    transferenv();

    synchdeath();

    checkclusters();

    main();

    if(global.test){
        let diff = 20 - (performance.now() - before);
        costs.push(diff);
        let moy = costs.reduce(getSum)/costs.length;
        if(diff <0){
            diff = 0;
            ultimatum++;
            if(ultimatum > 100){
                if(bool){
                    console.log(ultimatum+ " /!\\ "+moy)
                    console.log(" ");
                    console.log("Number of cells:");
                    console.log(" "+env.cells.length);
                    console.log(" ");
                    console.log("Environement size:");
                    console.log(" "+ENV_SIZE);
                    console.log(" ");
                    console.log("Number of clusters:");
                    console.log(" "+MAX_CLUSTERS);
                    console.log(" ");
                    console.log("Data collected:");
                    console.log(global.testdata)
                    console.log(" ");
                    console.log("Energy costs:");
                    console.log("- code: "+global.testdata.codecost/global.testdata.codecostnum);
                    console.log("- scan: "+global.testdata.scancost/global.testdata.scancostnum);
                    console.log("- move: "+global.testdata.movecost/global.testdata.movecostnum);
                    console.log("- split: "+global.testdata.splitcost/global.testdata.splitcostnum);

                    bool = false;
                }
                return;
            }
        }
    }


}


exports.getEnv = function () {
    return env;
}

exports.setEnv = function (e) {
    env = e;
}

exports.getEnvSize = function () {
    return ENV_SIZE;
}

function checkclusters() {

    if (env.clusters.length < MAX_CLUSTERS) {
        if(Math.random()>0.1){
            let x = Math.round(Math.random() * ENV_SIZE);
            let y = Math.round(Math.random() * ENV_SIZE);
            let energy = Math.round((Math.random() * ENERGY_BASIS * 8 / 10) + (ENERGY_BASIS / 5));
    
            env.clusters.push(new objs.Cluster(x, y, energy));
        }

    }

}



function main() {

    //On parcour toutes les cells
    for (let j = 0; j < env.cells.length; j++) {
        let cell = env.cells[j];
        let cellx = cell.x;
        let celly = cell.y;
        let cellr = cell.r;

        //Cells growth  ----------------------------------------------------------
        if (cellr < (cell.energy + 10)) {
            cell.r+=0.2;
        } else if (cellr > (cell.energy + 10)) {
            cell.r-=0.2;
        }

        //Collisions  ------------------------------------------------------------
        //cells vs cells
        for (let i = 0; i < env.cells.length; i++) {
            let obj = env.cells[i];
            if (cell.id != obj.id) {
                if (api.ECI(obj.r, obj.x, obj.y, cellr, cellx, celly)) {
                    let [coefx, coefy] = api.GMC(cellx, celly, obj.x, obj.y);
                    cell.x -= coefx;
                    cell.y -= coefy;
                    break;
                }
            }
        }

        //clusters vs cells
        for (let i = 0; i < env.clusters.length; i++) {
            let cluster = env.clusters[i];
                b = api.ECI(cluster.r, cluster.x, cluster.y, cellr, cellx, celly);
                if (b) {
                    cell.heal(cluster.energy*2);
                    cluster.die();
                }
        }

        //Leeches vs Cells
        for (let i = 0; i < env.leeches.length; i++){
            let leech = env.leeches[i];
            leech.newpos();
                b = api.ECI(leech.r, leech.x, leech.y, cellr, cellx, celly);
                if (b) {

                    env.setCell(env.getCell(leech.owner).heal(leech.energy));
    
                    cell.takedmg(leech.energy);
    
                    leech.die();
                }
        }
        //  ----------------------------------------------------------------------


        virtualbox.run(cell);

    }
}





function synchdeath() {

    env.clusters = env.clusters.filter(aliveobjects);

    env.cells = env.cells.filter(aliveobjects);

    env.leeches = env.leeches.filter(aliveobjects);

}

function aliveobjects(obj) {
    return obj.bdead == false;
}

var before = performance.now();
var diff = performance.now() - before;
function transferenv(){
    pseudoenvs.push(convertenv(env));
    if (pseudoenvs.length > MAX_PSEUDOENV) {
        diff = performance.now() - before;
        //console.log("envrdy "+diff)
        parentPort.postMessage(pseudoenvs.slice());
        pseudoenvs = [];
        before = performance.now();

    }
}

function convertenv(env) {

    let pseudoenv = new objs.PseudoEnvironment(+ new Date());
    env.clusters.forEach(function (cluster) {
        pseudoenv.clusters.push(new objs.PseudoCluster(cluster.x,cluster.y, cluster.energy, cluster.bdead));
    });

    env.cells.forEach(function (cell) {
        pseudoenv.cells.push(new objs.PseudoCell(cell.x, cell.y, cell.r, cell.name, cell.color, cell.id));
    });

    env.leeches.forEach(function (leech) {
        pseudoenv.leeches.push(new objs.PseudoLeech(leech.x, leech.y, leech.energy));
    });

    return pseudoenv;

}