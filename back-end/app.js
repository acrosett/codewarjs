

const assert = require('assert');
const {
  Worker, MessageChannel, MessagePort, isMainThread, parentPort
} = require('worker_threads');

PseudoEnvironment = function (order) {

  this.clusters = [];
  this.cells = [];
  this.leeches = [];
  this.order = order;

}

function getSum(total, num) {
  return total + num;
}


if (isMainThread) {

  let envs = [];
  const express = require('express')
  const app = express()

  const {  performance } = require('perf_hooks');

  app.use(express.static('public'));


  var moy = 0;
  var costs = [];
  app.get('/api/getSimulation', function (req, res) {
    let x = parseInt(req.query.x,10);
    let y = parseInt(req.query.y,10);
    let l = parseInt(req.query.l,10);

    let newenvs = [];
    let penv;

    //const before = performance.now();

    newenvs = envs.slice();
    for(let i=0; i < newenvs.length; i++){

      newenvs[i].clusters = newenvs[i].clusters.filter(insidewindow(x,y,l));

      newenvs[i].cells = newenvs[i].cells.filter(insidewindow(x,y,l));
  
      newenvs[i].leeches = newenvs[i].leeches.filter(insidewindow(x,y,l));

    }
    
    //const diff = performance.now() - before;
    //costs.push(diff/100);
    //let moy = costs.reduce(getSum)/costs.length;
    //console.log("moy="+moy);

    res.send(newenvs);

  })

  function insidewindow(x,y,l) {
return function(obj){


      if((obj.x+obj.r) < x){
          
        return false;
      }

      if((obj.y+obj.r) < y){
        return false;
      }

      if((obj.x-obj.r) > (x + l)){
        return false;
      }

      if((obj.y-obj.r) > (y + l)){
        return false;
      }

        return true;
      }
}
  
  app.get('/', function (req, res) {
    res.sendFile('public/html/index.html', {root: __dirname })
  })
  
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
  })

  const worker = new Worker(__filename);

  worker.on('message', (value) => {
    envs = value;
  });
  

} else {


    const simulation = require('./simulation')

    setInterval(simulation.run,20);

}

