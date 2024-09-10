
let gridSize; // Number of squares per side
let grid = [];
let squareSize; // Size of each square
let pixl_squares=25;
// Synthesizer variables
let noiseGenerators = [];
let filters = [];
let delays = [];
let numSources = 4;
let reverb;
let soundStarted = false; // Flag to check if sound has started
let factor_difusion=0.2;
let oscilacion_factor=15;

function setup() {
  createCanvas(windowWidth, windowHeight);
  adjustGridSize(); // Initialize grid size based on the window dimensions

  // Initialize grid with random heights
  for (let x = 0; x < gridSize; x++) {
    grid[x] = [];
    for (let y = 0; y < gridSize; y++) {
      grid[x][y] = {
        baseHeight: random(155, 200), // Initial height
        azulidad: random(0, 255), // Current height
        angle: random(TWO_PI), // Initial angle for oscillation
        speed: random(0.1, 0.5) // Speed of oscillation
      };
    }
  }

  // Display the start screen
  displayStartScreen();
}

function draw() {
  if (soundStarted) {
    background(0);
    frameRate(15);
    noStroke();

    // Update grid heights based on diffusion and oscillation
    let newGrid = [];
    for (let x = 0; x < gridSize; x++) {
      newGrid[x] = [];
      for (let y = 0; y < gridSize; y++) {
        let square = grid[x][y];
        
        // Compute average height of neighbors
        let sumHeight = 0;
        let count = 0;
        
        // Check all four neighbors (left, right, top, bottom)
        if (x > 0) { sumHeight += grid[x - 1][y].azulidad; count++; }
        if (x < gridSize - 1) { sumHeight += grid[x + 1][y].azulidad; count++; }
        if (y > 0) { sumHeight += grid[x][y - 1].azulidad; count++; }
        if (y < gridSize - 1) { sumHeight += grid[x][y + 1].azulidad; count++; }

        // Compute new height based on average of neighbors with smoothing factor
        let averageHeight = (sumHeight / count);
        let diffusionFactor = factor_difusion; // More gradual diffusion
        square.azulidad = lerp(square.azulidad, averageHeight, diffusionFactor);

        // Oscillate heights with reduced amplitude
        square.azulidad += oscilacion_factor * sin(square.angle); // Reduced amplitude
        square.angle += square.speed;

        // Map height to color
        let col = color(0, 0, square.azulidad);
        fill(col);

        // Draw the square
        rect(x * squareSize, y * squareSize, squareSize, squareSize);

        // Save new grid values
        newGrid[x][y] = square;
      }
    }

    // Update the grid with new heights
    grid = newGrid;

    // Update synthesizer parameters based on grid state
    updateSynthesizer();
  }
}

function mousePressed() {
  if (!soundStarted) {
    startSound();
    soundStarted = true;
    clear();
  }
}

function windowResized() {
  // Adjust canvas size and grid size when window is resized
  resizeCanvas(windowWidth, windowHeight);
  adjustGridSize();
}

function adjustGridSize() {
  gridSize = int(width / pixl_squares); // Number of squares per side (40 pixels per square)
  squareSize = width / gridSize;
  
  // Reinitialize grid with random heights
  grid = [];
  for (let x = 0; x < gridSize; x++) {
    grid[x] = [];
    for (let y = 0; y < gridSize; y++) {
      grid[x][y] = {
        baseHeight: random(0, 255), // Initial height
        azulidad: random(0, 255), // Current height
        angle: random(TWO_PI), // Initial angle for oscillation
        speed: random(0.2, 0.5) // Speed of oscillation
      };
    }
  }
}

function updateSynthesizer() {
  for (let i = 0; i < numSources; i++) {
    let freq = map(sin(frameCount * 0.01 + i), -1, 1, 200, 1000); // Map frequency to a more bass-like range
    filters[i].freq(freq);

    let res = map(cos(frameCount * 0.01 + i), -1, 1, 5, 15); // Lower resonance for more subdued effect
    filters[i].res(res);
  }
}

function startSound() {
  // Initialize synthesizer
  for (let i = 0; i < numSources; i++) {
    let noise = new p5.Noise();
    noise.amp(0.01); // Volume reduced to 1/8
    noise.start();

    let filter = new p5.LowPass(); // Using a low-pass filter
    noise.disconnect();
    noise.connect(filter);
    filter.freq(random(200, 1000)); // Lower cutoff frequency range for a more bass-like sound
    filter.res(random(5, 15)); // Lower resonance for a more subdued effect

    let delay = new p5.Delay();
    let delayTime = random(0.2, 0.4); // Shorter delay time
    let feedback = random(0.1, 0.3); // Lower feedback amount
    delay.process(noise, delayTime, delayTime * 0.5, feedback); // Adjusted delay times and feedback

    noiseGenerators.push(noise);
    filters.push(filter);
    delays.push(delay);
  }

  // Initialize reverb
  reverb = new p5.Reverb();
  reverb.process(noiseGenerators[0], 3, 2); // General reverb with a long decay time
}

function displayStartScreen() {
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Haz clic para comenzar", width / 2, height / 2);
}
