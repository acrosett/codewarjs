const api = require('./api');
const {  performance } = require('perf_hooks');


var currentcellid;

exports.getCurrentCellId = function (){
    return currentcellid;
}

var context = {
    api: api
}



exports.run = function (self){
    

        currentcellid = self.id;

        const before = performance.now();
        (new Function("api",self.code))(api)
        //eval("(function () { "+self.code+"})()",context);
        //self.run(api);
        const diff = performance.now() - before;

        let cost = diff/100;

        if(global.test){
           
            global.testdata.codecost += cost;
            global.testdata.codecostnum++;
        }


        api.takedmg(cost);
 
    
    //console.log(cells.length);


}

function getSum(total, num) {
    return total + num;
}
