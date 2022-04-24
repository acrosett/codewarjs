<template>
  <div id="screen">
    <h1>{{ title }}</h1>
    <div>
      <canvas class="canvas" id="screen-canvas"></canvas>
    </div>
  </div>
</template>


<script>
//import { setTimeout } from "timers";

const axios = require("axios");

let DISPLAYINTERVAL = 25;
const FETCHINTERVAL = 1000;

const ENV_SIZE = 12000 / 4;

let dataLenHist = []

let drawarea;
let xview = ENV_SIZE / 2;
let yview = ENV_SIZE / 2;
let zoom = 1;
let oldx = 0;
let oldy = 0;

var vm;

export default {
  name: "screen",
  props: {
    title: String,
  },
  data: function () {
    return {
      width: Number,
      height: Number,
      data: Array,
      nextdata: Array,
      zoom: Number,
      flag: Boolean,
      focus: Boolean,
      state: Boolean,
    };
  },
  methods: {
    resize(e) {
      // your code for handling resize...
      let i = window.innerWidth * 0.9;

      if (window.innerWidth > 992) {
        i = i / 2;
      }

      while (i > window.innerHeight * 0.65) {
        i--;
      }

      vm.width = i;
      vm.height = i;

      if (e.target) {
        drawarea.start();
      }
    },
    run: function () {
      if (!vm.bool) {
        vm.fetchdata();
      } else {
        vm.updatedata();
      }
      vm.bool = !vm.bool;
    },

    fetchdata: function () {
      // eslint-disable-next-line
      //console.log(zoom);
      axios
        .get("http://127.0.0.1:3000/api/getSimulation", {
          params: {
            x: xview,
            y: yview,
            l: drawarea.canvas.width / zoom,
          },
        })
        .then((response) => vm.preparedata(response.data));
    },

    preparedata: function (newdata) {
      var i;
      // eslint-disable-next-line
      //console.log("update " + newdata.length);

      if (vm.data == 0) {
        vm.data = [];
      }

      for (i = 0; i < newdata.length; i++) {
        if (
          (newdata[i].clusters.length > 0 ||
            newdata[i].cells.length > 0 ||
            newdata[i].leeches.length > 0) &&
          (vm.data.length == 0 ||
            (newdata[i].order > vm.data[vm.data.length - 1].order &&
              (vm.nextdata.length == 0 ||
                newdata[i].order > vm.nextdata[vm.nextdata.length - 1].order)))
        ) {
          //Keep data
          vm.nextdata.push(newdata[i]);
        }
      }
    },

    updatedata: function () {
      // if (this.data.length > (3 * FETCHINTERVAL) / 20) {
      //   this.data = this.data.splice(
      //     Math.ceil(this.data.length / 2),
      //     this.data.length - 1
      //   );
      // }

      for (let i = 0; i < vm.nextdata.length; i++) {
        this.data.push(vm.nextdata.shift());
      }
    },

    draw: function () {

      if(this.data.length){
        if(dataLenHist.length < 100){
          dataLenHist.push(this.data.length);
        }else{
          let avg = dataLenHist.reduce( ( p, c ) => p + c, 0 )/ dataLenHist.length;
          if(avg < 50){
            DISPLAYINTERVAL++;
          }else if(avg > 60) {
            DISPLAYINTERVAL--;
          }
          dataLenHist = [];
        }
      }

      if (this.data.length == 1 || this.data == 0) {
        setTimeout(vm.draw, DISPLAYINTERVAL);
        return;
      }
      let model = this.data.shift();

      drawarea.clear();
      let ctx;

      model.clusters.forEach((cluster) => {
        if (cluster.x + cluster.r < xview) {
          return;
        }

        if (cluster.y + cluster.r < yview) {
          return;
        }

        if (cluster.x - cluster.r > xview + drawarea.canvas.width / zoom) {
          return;
        }

        if (cluster.y - cluster.r > yview + drawarea.canvas.height / zoom) {
          return;
        }
        // eslint-disable-next-line
        //console.log(cluster.b);
        if (cluster.b) {
          vm.explosions.push(
            new Explosion(
              cluster.r,
              cluster.x,
              cluster.y,
              "white",
              cluster.r / 3
            )
          );
        } else {
          ctx = drawarea.context;
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(
            (cluster.x - xview) * zoom,
            (cluster.y - yview) * zoom,
            cluster.r * zoom,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.fillStyle = "LimeGreen";
          ctx.beginPath();
          ctx.arc(
            (cluster.x - xview) * zoom,
            (cluster.y - yview) * zoom,
            (cluster.r / 2) * zoom,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });

      model.leeches.forEach((leech) => {
        if (leech.x + leech.r < xview) {
          return;
        }

        if (leech.y + leech.r < yview) {
          return;
        }

        if (leech.x - leech.r > xview + drawarea.canvas.width / zoom) {
          return;
        }

        if (leech.y - leech.r > yview + drawarea.canvas.height / zoom) {
          return;
        }

        if (leech.b) {
          vm.explosions.push(
            new Explosion(
              leech.r * 1.5,
              leech.x,
              leech.y,
              "purple",
              leech.r / 3
            )
          );
        } else {
          ctx = drawarea.context;
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(
            (leech.x - xview) * zoom,
            (leech.y - yview) * zoom,
            leech.r * zoom,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.fillStyle = "purple";
          ctx.beginPath();
          ctx.arc(
            (leech.x - xview) * zoom,
            (leech.y - yview) * zoom,
            (leech.r / 2) * zoom,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });

      model.cells.forEach((cell) => {
        if (cell.x + cell.r < xview) {
          return;
        }

        if (cell.y + cell.r < yview) {
          return;
        }

        if (cell.x - cell.r > xview + drawarea.canvas.width / zoom) {
          return;
        }

        if (cell.y - cell.r > yview + drawarea.canvas.height / zoom) {
          return;
        }

        if (cell.r > 0) {
          ctx = drawarea.context;
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(
            (cell.x - xview) * zoom,
            (cell.y - yview) * zoom,
            (cell.r + 5) * zoom,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.fillStyle = cell.color;
          ctx.beginPath();
          ctx.arc(
            (cell.x - xview) * zoom,
            (cell.y - yview) * zoom,
            cell.r * zoom,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });
      vm.explosions.forEach((exp) => {
        // eslint-disable-next-line

        exp.update();
      });

      setTimeout(vm.draw, DISPLAYINTERVAL);

    },

    pause() {
      clearInterval(this.interval);
    },
  },
  created() {
    window.addEventListener("resize", this.resize);
  },
  destroyed() {
    window.removeEventListener("resize", this.resize);
  },
  mounted: function () {
    vm = this;
    vm.data = 0;
    vm.nextdata = [];
    zoom = 1;
    vm.explosions = [];
    vm.xview = 0;
    vm.yview = 0;

    vm.bool = false;
    vm.flag = false;
    vm.focus = true;

    vm.resize(0);

    drawarea = {
      canvas: document.getElementById("screen-canvas"),
      start: function () {
        //this.canvas.classList.add("canvas");
        this.canvas.width = vm.width;
        this.canvas.height = vm.height;
        this.context = this.canvas.getContext("2d");
      },
      clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      },
    };

    drawarea.start();

    window.onfocus = function () {};

    window.onblur = function () {};

    drawarea.canvas.addEventListener("mousewheel", function (e) {
      let delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail)) / 10;
      if (delta < 0) {
        if (zoom <= 0.25) {
          return;
        }
      } else {
        if (zoom >= 4) {
          return;
        }
      }

      zoom += delta;
      // eslint-disable-next-line
      //console.log("zoom" + zoom);
    });

    drawarea.canvas.addEventListener(
      "mousedown",
      function () {
        vm.flag = 1;
      },
      false
    );
    drawarea.canvas.addEventListener(
      "mousemove",
      function (e) {
        if (vm.flag) {
          let coefzoom = (10 * 1) / zoom;
          let [coefx, coefy] = GMC(oldx, oldy, e.pageX, e.pageY);
          if (coefx >= 0) {
            if (xview > 0) {
              xview -= coefx * coefzoom;
            }
          } else {
            if (xview + drawarea.canvas.width / zoom < ENV_SIZE) {
              xview -= coefx * coefzoom;
            }
          }

          if (coefy >= 0) {
            if (yview > 0) {
              yview -= coefy * coefzoom;
            }
          } else {
            if (yview + drawarea.canvas.height / zoom < ENV_SIZE) {
              yview -= coefy * coefzoom;
            }
          }

          oldx = e.pageX;
          oldy = e.pageY;
        }
      },
      false
    );
    drawarea.canvas.addEventListener(
      "mouseup",
      function () {
        vm.flag = 0;
      },
      false
    );

    setInterval(vm.run, FETCHINTERVAL / 2);
    setTimeout(vm.draw, DISPLAYINTERVAL);
  },
};

//OBJECTS

/** Objet Explosion => Purement graphique
 *
 * @constructor
 */
function Explosion(R, x, y, color, lifetime) {
  this.R = R;
  this.LIFETIME = lifetime;
  this.lifetime = lifetime;
  this.x = x;
  this.y = y;
  this.bdead = false;
  this.color = color;

  this.update = function () {
    // eslint-disable-next-line
    //Dessine l'objet
    this.lifetime -= 1;
    if (this.lifetime <= 0) {
      this.die();
    }
    let ctx = drawarea.context;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    //La taille de l'explosion dépent de sa durée de vie restante
    if (this.R * (Math.round(this.lifetime) / this.LIFETIME) < 0) {
      ctx.arc(
        (this.x - xview) * zoom,
        (this.y - yview) * zoom,
        0,
        0,
        2 * Math.PI
      );
    } else {
      ctx.arc(
        (this.x - xview) * zoom,
        (this.y - yview) * zoom,
        this.R * (Math.round(this.lifetime) / this.LIFETIME) * zoom,
        0,
        2 * Math.PI
      );
    }
    ctx.fill();
  };

  this.die = function () {
    this.bdead = true;
  };
}

//Get move coefs
function GMC(xo, yo, xd, yd) {
  let angle = (GAR(xo, yo, xd, yd) * Math.PI) / 180;
  let coefx;
  let coefy;

  coefy = -Math.cos(angle);
  coefx = Math.sin(angle);

  return [coefx, coefy];
}

//Retourne l'angle de rotation a appliquer à l'arme du joueur pour qu'elle pointe vers la souris
function GAR(xo, yo, xd, yd) {
  let oppose = xo - xd;
  let adjacent = yo - yd;
  let angle;
  if (adjacent == 0) {
    angle = 0;
  } else {
    angle = (Math.atan(oppose / adjacent) * 180) / Math.PI;
  }
  if (yo < yd) {
    angle = 180 - angle;
  } else {
    if (xo < xd) {
      angle = -angle;
    } else {
      angle = 90 - angle + 270;
    }
  }
  return angle;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#screen-canvas {
  border-color: #d2eddd;
  border-style: inset;
  border-width: 15px;
  background-color: rgb(0, 29, 29);
}

.canvas:hover {
  cursor: grab;
}
</style>
