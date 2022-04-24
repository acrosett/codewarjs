let slf = api.getSelf();
let mem = api.getMemory();


if(slf.energy > 100 && mem > 10){

    api.split();
}

if (mem <= 2) {

    let [nearbyClusters, nearbyCells, nearbyLeeches] = api.scan(1200);
    let cls;

    if (nearbyClusters.length > 0 ) {

        cls = nearbyClusters.sort(function (a, b) {
            let d1 = api.GDB(slf.x, slf.y, a.x, a.y);
            let d2 = api.GDB(slf.x, slf.y, b.x, b.y);
            return (d1 - d2)
        });

        let cl = cls[0];
        let [coefx, coefy] = api.GMC(slf.x, slf.y, cl.x, cl.y);

        api.move(coefx *3, coefy*3);
    }

    
    if (nearbyCells.length > 1 ) {

        cls = nearbyCells.sort(function (a, b) {
            let d1 = api.GDB(slf.x, slf.y, a.x, a.y);
            let d2 = api.GDB(slf.x, slf.y, b.x, b.y);
            return (d1 - d2)
        });

        cls = cls.filter(diffcolor);

        let cl = cls[1];
        let [coefx, coefy] = api.GMC(slf.x, slf.y, cl.x, cl.y);

        if(Math.random()>0.99){
                api.spawnleech(coefx*3, coefy*3,slf.energy*0.2);
        }
    }
    
    api.setMemory(nearbyClusters.length);
} else {

    let [nearbyClusters, nearbyCells, nearbyLeeches] = api.scan(100);

    
    let cls;

    if (nearbyClusters.length > 0 ) {

        cls = nearbyClusters.sort(function (a, b) {
            let d1 = api.GDB(slf.x, slf.y, a.x, a.y);
            let d2 = api.GDB(slf.x, slf.y, b.x, b.y);
            return (d1 - d2)
        });

        let cl = cls[0];
        let [coefx, coefy] = api.GMC(slf.x, slf.y, cl.x, cl.y);

        api.move(coefx*3, coefy*3);
    }

    
    api.setMemory(nearbyClusters.length);


}

function diffcolor(color) {
    return function(obj) {
        return obj.color != color;
    }
}

