/***************************************************************************************
*    Title: Perlin Noise Flow Field - P5.js
*    Author: Alison Galindo
*    Date: n.d.
*    Code version: 1.0
*    Availability: https://codepen.io/AlisonGalindo/pen/QWVPBjB?editors=1000
*
***************************************************************************************/

//variables
let nine;
const inc = 0.1;
const incStart = 0.005;
const magInc = 0.0005;
const scl = 10;
const numParticles = 500;
let start = 0;
let cols, rows;
let zoff = 0;
let fps;
let particles = [];
let flowfield;
let flowcolorfield;
let magOff = 0;
let showField = false;
let timer = 5;
let button;

//animation for visual
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 1;
    this.prevPos = this.pos.copy();
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  show(colorfield) {
    strokeWeight(1);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }

  inverseConstrain(pos, key, f, t) {
    if (pos[key] < f) {
      pos[key] = t;
      this.updatePrev();
    }
    if (pos[key] > t) {
      pos[key] = f;
      this.updatePrev();
    }
  }

  updatePrev() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  edges() {
    this.inverseConstrain(this.pos, "x", 0, width);
    this.inverseConstrain(this.pos, "y", 0, height);
  }

  follow(vectors, colorfield) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y * cols;
    let force = vectors[index];
    this.applyForce(force);
    let c = colorfield[index];
    if (c) {
      stroke(color(c[0], c[1], c[2]));
    }
  }
}

function preload() {
  // LOAD SOUND
  nine = loadSound("NINE.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  cols = Math.floor(width / scl);
  rows = Math.floor(height / scl);
  background(0);

  for (let i = 0; i < numParticles; i++) {
    particles[i] = new Particle();
  }

  flowfield = new Array(rows * cols);
  flowcolorfield = new Array(rows * cols);
  nine.play();
  nine.loop();
}

function draw() {
  if (showField) {
    background(0);
  } else {
    background(color(0, 0, 0, 5));
  }
  let yoff = start;
  for (let y = 0; y < rows; y++) {
    let xoff = start;
    for (let x = 0; x < cols; x++) {
      const index = x + y * cols;
      const r = noise(xoff, yoff, zoff) * 500;
      const g = noise(xoff + 0, yoff + 0, zoff) * 0;
      const b = noise(xoff + 200, yoff + 200, zoff) * 500;
      const angle = noise(xoff, yoff, zoff) * TWO_PI;
      const v = p5.Vector.fromAngle(angle);
      const m = map(noise(xoff, yoff, magOff), 0, 8, -5, 5);

      v.setMag(m);
      if (showField) {
        push(50);
        stroke(0);
        translate(x * scl, y * scl);
        rotate(v.heading());
        const endpoint = Math.abs(m) * scl;
        line(0, 0, endpoint, 0);
        if (m < 0) {
          stroke("red");
        } else {
          stroke("green");
        }
        line(endpoint - 60, 0, endpoint, 0);
        pop();
      }
      flowfield[index] = v;
      flowcolorfield[index] = [r, g, b];
      xoff += inc;
    }
    yoff += inc;
  }
  magOff += magInc;
  zoff += incStart;
  start -= magInc;

  if (!showField) {
    for (let i = 0; i < particles.length; i++) {
      particles[i].follow(flowfield, flowcolorfield);
      particles[i].update();
      particles[i].edges();
      particles[i].show();
    }

    if (random(10) > 5 && particles.length < 3500) {
      const rnd = Math.floor(noise(zoff) * 30);
      for (let i = 0; i < rnd; i++) {
        particles.push(new Particle());
      }
    } else if (particles.length > 3000) {
      const rnd = Math.floor(random(20));
      for (let i = 0; i < rnd; i++) {
        particles.shift();
      }
      //timer
      if (frameCount % 60 == 0 && timer > 0) {
        
        timer--;
      }
      //  console.log(timer);
      if (timer == 0) {
        button = createButton("Carry on Listening");
        button.position(200, height/2);
        button.mousePressed(function goToAnotherPage() {
          window.location.href =
            "https://editor.p5js.org/natashatan/sketches/ukTQvyosH";
        });
        button = createButton("Let's Breath");
        button.position(425, height/2);
        button.mousePressed(function goToAnotherPage() {
          window.location.href =
            "https://tashatan1.github.io/let-s-breath/";
        });
      }
    }
  }
}
