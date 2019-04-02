window.addEventListener("deviceorientation", handleOrientation)

let states = Object.freeze({ START: 0, DRAWING: 1, FINISH: 2, CORRECT: 3 }),
    actions = [],
    currentState = states.START;

var canvas,
    alpha = 0,
    beta = 0,
    gamma = 0,
    rValue = 0,
    gValue = 0,
    bValue = 0,
    mappedBeta = 0,
    mappedGamma = 0,
    rotationSpeed = 0.01,
    scalar = 0.01,
    startingX = -1,
    startingY = -1;

// Buttons
let startButton = { x: 0, y: 0, width: 200, height: 75, color: { r: 175, g: 26, b: 26, a: 1 }, textSize: 24, text: "Start", drawBox: true},
    startButtonClickedColor = {r: 26, g: 175, b: 88, a: 1 },
    startButtonYOffset = 100;

let tryGuessButton = { x: 0, y: 0, width: 200, height: 75, color: { r: 175, g: 26, b: 26, a: 1}, textSize: 24, text: "Guess", drawBox: true },
    tryGuessButtonYOffset = 100;

let resetButton = { x: 0, y: 0, width: 50, height: 25, color: { r: 25, g: 25, b: 135, a: 1 }, textSize: 24, text: "Reset", drawBox: false },
    resetButtonYOffest = 50;

// Timing
let drawingTime = 5000, // in milliseconds
    drawing = false,
    timerInterval;

// Picture
let points = [];

// Background
let backgroundColor = {r: 255, g: 255, b: 255, a: 1};

// Guess
let input, submitButton, guessLabel, feedbackLabel;

// Words
let pictionaryWords = ["Apple", "Teapot", "Dog", "Turtle", "Table", "Potato", "Pencil", "Sword", "Shield", "Bow", "Canada"],
    indexOfWord = 0;

// Fiesta colors
let fiestaBackgroundColor = {r: 0, g: 0, b: 100, a: 1},
    rMod = 1,
    gMod = 2,
    bMod = 3;
let fiestaText = { x: 0, y: 0, text: "Correct!", textSize: 32, color: {r: 0, g: 0, b: 0, a: 1} };

function handleOrientation(event) {
  alpha = event.alpha;
  beta = event.beta;
  gamma = event.gamma;
}

function init() {
  buildActions();
  buildWidgets();
  indexOfWord = getRandomIndex();
}

function buildActions() {
  actions.push("Choose a starting point!");
  actions.push("DRAW!");
  actions.push("Guess what it is!");
}

function buildWidgets() {
  tryGuessButton.x = width / 2;
  tryGuessButton.y = height - tryGuessButtonYOffset;

  fiestaText.x = width / 2;
  fiestaText.y = height / 2;

  resetButton.x = width / 2;
  resetButton.y = height - resetButtonYOffest;
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  init();
  startButton.x = width / 2;
  startButton.y = height - startButtonYOffset;
  background(backgroundColor.r, backgroundColor.g, backgroundColor.b);
  textAlign(CENTER, TOP);
}

function draw() {
  mappedBeta = map(beta, -180, 180, 0, 360);
  mappedGamma = map(gamma, -90, 90, 0, 180);
  rValue = map(alpha, 0, 360, 0, 255);
  gValue = map(beta, -180, 180, 0, 255);
  bValue = map(gamma, -90, 90, 0, 255);
  switch(currentState) {
    case states.START:
      drawStart();
      break;
    case states.DRAWING:
      drawPicture();
      break;
    case states.FINISH:
      drawFinished();
      break;
    case states.CORRECT:
      drawFiesta();
      break;
    default:
      noLoop()
      console.error("STATE: " + currentState + " not recogined!");
  }

}

function drawStart() {
  drawCurrentWord(width/2, 20);
  drawCurrentAction(width/2, 70);
  drawStartingPoint();
  drawButton(startButton);
}

function drawPicture() {
  if(!drawing) {
    timerInterval = setInterval(setTimer, 1000);
    drawing = true;
  }

  clear();
  drawCurrentWord(width/2, 20);
  drawCurrentAction(width/2, 70);
  controlCircle();
  drawPoints();
  drawTimer(width/2, 120);
}

function drawFinished() {
  drawCurrentAction(width/2, 20);
  drawPoints();
  drawInput();
  noLoop();
}

function drawFiesta() {
  drawFiestaBackground();
  drawFiestaText();
  drawButton(resetButton);
}

function mousePressed() {
  if(currentState === states.START) {
    if(isButtonPressed(startButton)) {
      if(startingX === -1 && startingY === -1) {
        startingX = width / 2;
        startingY = height / 2;
      }
      currentState = states.DRAWING;
      clear();
    }
    else {
      startingX = mouseX;
      startingY = mouseY;
      clear();
      console.log("Starting circle position: " + startingX + " " + startingY);
    }
  }
  else if(currentState === states.FINISH) {
    if(isButtonPressed(tryGuessButton)) {
      checkGuess();
    }
  }
  else if(currentState === states.CORRECT) {
    if(isButtonPressed(resetButton)) {
      reset();
    }
  }
}

function isButtonPressed(button) {
  if(mouseX >= button.x - (button.width / 2) &&
      mouseX <= button.x + (button.width / 2) &&
        mouseY >= button.y - (button.height / 2) &&
          mouseY <= button.y + (button.height /2)) {
        return true;
      }
      return false;
}

function drawCurrentWord(x, y) {
  fill(0)
  textSize(32);
  text(`Your word is: ${pictionaryWords[indexOfWord]}`, x, y);
}

function drawCurrentAction(x, y) {
  fill(0);
  textSize(20);
  text(actions[currentState], x, y);
}

function drawStartingPoint() {
  if(startingX !== -1 && startingY !== -1) {
    ellipse(startingX, startingY, 2);
  }
}

function drawButton(button) {
  if(button.drawBox) {
    fill(`rgba(${button.color.r}, ${button.color.g}, ${button.color.b}, ${button.color.a})`);
    rect(button.x - button.width / 2, button.y - button.height / 2 + 10, button.width, button.height);
  }
  fill(0);
  textSize(button.textSize);
  text(button.text, button.x, button.y);
}

function controlCircle() {
  clampCursor();
  fill(0);
  startingX += gamma / 18;
  startingY += beta / 36;
  points.push({x: startingX, y: startingY });
}

function clampCursor() {
  // Clamp x
  if(startingX > width)
    startingX = width - 1;
  else if(startingX <= 0)
    startingX = 1;

  // Clamp y
  if(startingY > height)
    startingY = height - 1;
  else if(startingY <= 0)
    startingY = 1;
}

function drawPoints() {
  fill(0);
  for(let i = 0; i < points.length; ++i) {
    ellipse(points[i].x, points[i].y, 2);
  }
}

function drawTimer(x, y) {
  fill(0);
  textSize(32);
  text((drawingTime / 1000).toString(), x, y);
  if(drawingTime === 0) {
    currentState = states.FINISH;
    clear();
    clearInterval(timerInterval);
  }
}

function setTimer() {
  drawingTime -= 1000;
}

function drawInput() {
  fill(0);
  textSize(20);
  text("Guess: ", (width / 2) - 50, height - 200);

  input = createInput();
  input.position((width / 2), height - 200);
  input.style("width", '100px');

  drawButton(tryGuessButton);
}

function drawFiestaBackground() {
  if(fiestaBackgroundColor.r < 0 || fiestaBackgroundColor .r> 255)
    rMod *= -1;
  fiestaBackgroundColor.r = (fiestaBackgroundColor.r + rMod);

  if(fiestaBackgroundColor.g < 0 || fiestaBackgroundColor.g > 255)
    gMod *= -1;
  fiestaBackgroundColor.g = (fiestaBackgroundColor.g + gMod);

  if(fiestaBackgroundColor.b < 0 || fiestaBackgroundColor.b > 255)
    bMod *= -1;
  fiestaBackgroundColor.b = (fiestaBackgroundColor.b + bMod);

  background(fiestaBackgroundColor.r, fiestaBackgroundColor.g, fiestaBackgroundColor.b);
}

function drawFiestaText() {
  fill(fiestaText.color.r, fiestaText.color.g, fiestaText.color.b);
  textSize(fiestaText.textSize);
  text(fiestaText.text, fiestaText.x, fiestaText.y);
}

function checkGuess() {
  const userGuess = input.value();
  let feedback = "";
  if(userGuess === pictionaryWords[indexOfWord]) {
    currentState = states.CORRECT;
    input.remove();
    loop();
    clear();
  }
  else {
    fill(255, 0, 0)
    text("Incorrect", (width/2), height - 30);
  }
}

function reset() {
  clear();
  background(backgroundColor.r, backgroundColor.g, backgroundColor.b);
  currentState = states.START;
  drawingTime = 30000;
  drawing = false;
  points = [];
  startingX = -1;
  startingY = -1;
  indexOfWord = getRandomIndex();
}

function getRandomIndex() {
  return Math.floor(Math.random() * pictionaryWords.length - 1)
}
