let slf = api.getSelf();
let mem = api.getMemory();


if(slf.energy > 100 && mem > 20){

    api.split();
}

if (mem <= 2) {

    let [nearbyClusters, nearbyCells, nearbyLeeches] = api.scan(1200);
    

    if (nearbyClusters.length > 0 ) {
        let cls;
        cls = nearbyClusters.sort(function (a, b) {
            let d1 = api.GDB(slf.x, slf.y, a.x, a.y);
            let d2 = api.GDB(slf.x, slf.y, b.x, b.y);
            return (d1 - d2)
        });

        let cl = cls[0];
        let [coefx, coefy] = api.GMC(slf.x, slf.y, cl.x, cl.y);
        //console.log([coefx, coefy]);
        api.move(coefx *3, coefy*3);
    }
    
    api.setMemory(nearbyClusters.length);
} else {

    let [nearbyClusters, nearbyCells, nearbyLeeches] = api.scan(100);

    
    if (nearbyClusters.length > 0 ) {

        let cls;
        cls = nearbyClusters.sort(function (a, b) {
            let d1 = api.GDB(slf.x, slf.y, a.x, a.y);
            let d2 = api.GDB(slf.x, slf.y, b.x, b.y);
            return (d1 - d2)
        });

        let cl = cls[0];
        let [coefx, coefy] = api.GMC(slf.x, slf.y, cl.x, cl.y);
        //console.log([coefx, coefy]);
        api.move(coefx*3, coefy*3);
    }

    api.setMemory(nearbyClusters.length);


}

