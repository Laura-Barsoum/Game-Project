
 /*

The Game Project

Part 8

*/


var gameChar_x;
var gameChar_y;
var floorPos_y;
var isLeft;
var isRight;
var isPlummeting;
var isFalling;
var isJumping;
var tree_x;
var treePos_y;
var size;
var mountains_x;
var cameraPosX;
var starrySky;
var starrySkySpeed;
var weather; // 0: sunny, 1: rainy
var isGameOver = false;
var score = 0;
var collectables;
var canyons = [];
var flagpole;
var lives;
var confetti = [];
var jumpSound
var winningSound
var hasPlayedWinningSound = false;
var collectableSound;
var fallingSound;
var backgroundMusic;
var startSound;
var platforms;
var canJump = true;
var enemies;
var characterOptions = [
    { id: 1, name: "Default Character", color: [255, 0, 0], jumpHeight: 300 },
    { id: 2, name: "Robot", color: [0, 255, 0], jumpHeight: 300 },
    // Add more character options as needed
];
var isInCharacterSelection = true;
var selectedCharacter;  // The player's selected character
var initialHeight = floorPos_y;
let heart =[ {
    x: 270,
    y: 400,
    size: 20,
    isFound: false
}];


function preload(){
    
    soundFormats("mp3", "wav");
    jumpSound = loadSound("assets/jump.wav")
    jumpSound.setVolume(0.3)
     winningSound = loadSound("assets/tadaa-47995.mp3")
    winningSound.setVolume(0.3)
     collectableSound = loadSound("assets/game-bonus.mp3")
    collectableSound.setVolume(1)
    fallingSound = loadSound("assets/falling-whistle.mp3")
    fallingSound.setVolume(0.3)
    backgroundMusic = loadSound("assets/game-music-loop.mp3");
    backgroundMusic.setVolume(0.02);
    startSound = loadSound("assets/game-start-6104.mp3");
    startSound.setVolume(0.02);
    
}
function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
    selectedCharacter = 0
	startGame();
    lives =3;
    
}
function draw() {
    if (isInCharacterSelection) {
      drawCharacterSelection();
        return;  // Skip the rest of the draw function
    }
   // Display character options with information
    for (var i = 0; i < characterOptions.length; i++) {
        // Highlight the selected character
        if (i === selectedCharacter) {
            strokeWeight(4);
            stroke(255); // White color for the outline of the selected character
        } else {
            noStroke();
        }
        fill(characterOptions[i].color[0], characterOptions[i].color[1], characterOptions[i].color[2]);
        ellipse((i + 1) * width / (characterOptions.length + 1), height / 2, 50, 50);
        textSize(16);
        textAlign(CENTER);
        text(characterOptions[i].name, (i + 1) * width / (characterOptions.length + 1), height / 2 + 60);
        text("Jump Height: " + characterOptions[i].jumpHeight, (i + 1) * width / (characterOptions.length + 1), height / 2 + 80);
        }
    startSound.play();
    backgroundMusic.loop();
  cameraPosX = gameChar_x - width / 2;
    
  ///////////DRAWING CODE//////////
 if (gameChar_x > width/2) {
        background(0, 0, 25); // Change to a dark color representing night
    } else {
        background(100, 155, 255); // Original day color
    }
  noStroke();
  fill(0, 155, 0);
  rect(0, floorPos_y, width, height - floorPos_y); //draw some green ground
  // Save the current drawing state
  push();
  drawWeather();
  drawScore();
  drawStarrySky();


  noStroke();
  fill(255);
  for (var i = 0; i < starrySky.length; i++) {
    ellipse(starrySky[i].x, starrySky[i].y, 2, 2);
  }

  // Move the origin of the canvas to simulate camera movement
  translate(-cameraPosX, 0);
  // Draw mountains
  drawMountains();
  //trees loop
  drawTrees();
  //clouds loop
  drawClouds();

  // draw the canyon
for (var i = 0; i < canyons.length; i++) {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }
  // collectable
    for (var i = 0; i < collectables.length; i++) {
        drawCollectable(collectables[i]);
        checkCollectable(collectables[i]);
    }
      drawHeart(heart[0]);
    checkHeart(heart[0]);


  noStroke();
    for (var i=0; i < platforms.length; i++){
        platforms[i].draw();
    }
 switch (selectedCharacter) {
        case 0: // Default Character
            drawDefaultCharacter();
            break;
        case 1: // Robot Character
            drawRobotCharacter(gameChar_x, gameChar_y);
            break;
        // Add more cases for additional characters
    }
  ///////////INTERACTION CODE//////////
  // Put conditional statements to move the game character below here
  if (isLeft == true) {
    gameChar_x -= 1;
  }
  if (isRight == true) {
    gameChar_x += 1;
  }
  if (isJumping && canJump) {
    gameChar_y -= 300; // Adjust the jump height as needed
    canJump = false;
}

if (gameChar_y <= floorPos_y) {
    var isContact = false;
    for (var i = 0; i < platforms.length; i++) {
        if (platforms[i].checkContact(gameChar_x, gameChar_y) == true) {
            isContact = true;
            break;
        }
    }
    if (isContact == false) {
        gameChar_y += 5; // Adjust the falling speed as needed
        isFalling = true;
    } else {
        isFalling = false;
        // Do not reset isJumping when landing on a platform
        canJump = true;
    }
}


  // Check if the character is over the canyon
 checkCanyon(canyons);
  if (checkGameOver()) {
    handleGameOver();
  }
 
 renderFlagpole();
    if (!flagpole.isReached) {
        checkFlagpole();
    }
      checkPlayerDie();
     for (var i = 0; i < lives; i++) {
         strokeWeight(2);
        fill(255, 0, 0); // Red color for life tokens
        ellipse(30 + i * 40, 30, 30, 30);
    }
    if (lives < 1) {
        handleGameOver()
    }
    for (var i = confetti.length - 1; i >= 0; i--) {
        fill(confetti[i].color);
        ellipse(confetti[i].x, confetti[i].y, confetti[i].size, confetti[i].size);

        confetti[i].x += confetti[i].drift;
        confetti[i].y += confetti[i].size / 2;

        confetti[i].lifespan--;

        if (confetti[i].lifespan <= 0 || confetti[i].y > height) {
            confetti.splice(i, 1);
        }
    }
    //to prevent double jump
    if (gameChar_y< floorPos_y && !isContact){
        canJump=false;
    }
    else {
        canJump=true;
    } 
  pop();
     if (areAllCollectablesFound() && flagpole.isReached) {
        levelComplete();
    }
}

function drawCharacterSelection() {
    background(200);  // Set a background color for the character selection screen

    // Display character options with information
    for (var i = 0; i < characterOptions.length; i++) {
        // Highlight the selected character
        if (i === selectedCharacter) {
            strokeWeight(4);
            stroke(255); // White color for the outline of the selected character
        } else {
            noStroke();
        }

        fill(characterOptions[i].color[0], characterOptions[i].color[1], characterOptions[i].color[2]);
        ellipse((i + 1) * width / (characterOptions.length + 1), height / 2, 50, 50);
        textSize(16);
        textAlign(CENTER);
        text(characterOptions[i].name, (i + 1) * width / (characterOptions.length + 1), height / 2 + 60);
        text("Jump Height: " + characterOptions[i].jumpHeight, (i + 1) * width / (characterOptions.length + 1), height / 2 + 80);
    }

    // Add logic for handling user input to select a character (e.g., using arrow keys)

    if (keyIsDown(LEFT_ARROW) && selectedCharacter > 0) {
        selectedCharacter--;
    }

    // Example: Move right in character selection
    if (keyIsDown(RIGHT_ARROW) && selectedCharacter < characterOptions.length - 1) {
        selectedCharacter++;
    }

    // Example: Press Enter to confirm the selected character and start the game
    if (keyIsDown(ENTER)) {
        isInCharacterSelection = false;
        startGame();
    }
}

function areAllCollectablesFound() {
    for (var i = 0; i < collectables.length; i++) {
        if (!collectables[i].isFound) {
            return false; // Return false if any collectable is not found
        }
    }
    return true; // All collectables are found
}
function levelComplete() {
    fill(255, 0, 255);
    textSize(50);
    textAlign(CENTER);
    text("Level Complete!", width / 2, height / 2);
     if (!hasPlayedWinningSound) {
        winningSound.play();
        hasPlayedWinningSound = true;
    }
}
  function drawStarrySky() {
    fill(255);
    for (var i = 0; i < starrySky.length; i++) {
        ellipse(starrySky[i].x, starrySky[i].y, 2, 2);
    }
}
   function drawHeart(t_heart) {
       if (!t_heart.isFound) { 
fill(255,0,0)
  beginShape();
  vertex(t_heart.x, t_heart.y);
  bezierVertex(t_heart.x - t_heart.size / 2, t_heart.y - t_heart.size / 2, t_heart.x - t_heart.size, t_heart.y + t_heart.size / 3, t_heart.x, t_heart.y +t_heart.size);
  bezierVertex(t_heart.x + t_heart.size, t_heart.y + t_heart.size / 3, t_heart.x + t_heart.size / 2, t_heart.y - t_heart.size / 2, t_heart.x, t_heart.y);
  endShape(CLOSE);
}
   }

function checkHeart(t_heart) {
    if (!t_heart.isFound && dist(gameChar_x, gameChar_y, t_heart.x, t_heart.y) < 20) {
        t_heart.isFound = true;
        lives += 1; // Increment the lives by 1
        celebratoryAnimation();
        collectableSound.play()
    }
}

 function celebratoryAnimation() {
    for (var i = 0; i < 100; i++) {
        confetti.push({
            x: random(width),
            y: random(height),
            color: color(random(255), random(255), random(255)),
            size: random(5, 15),
            drift: random(-1, 1),
            lifespan: 100 // Set the lifespan to 100 frames
        });
    }
}

function drawWeather() {
    // Implement dynamic weather changes here
    if (frameCount % 300 == 0) {
        // Change weather every 300 frames
        weather = (weather + 1) % 2; // Toggle between 0 and 1 (sunny and rainy)
    }

    // Draw weather conditions
    if (weather === 1) {
        drawRain();
    }
    // Add more weather conditions as needed
}

function drawRain() {
    // Implement rain drawing logic here
    // For example, draw semi-transparent blue lines falling down the screen
    stroke(100, 100, 255, 100);
    for (var i = 0; i < width; i += 5) {
        line(i, 0, i, height);
        textSize(50);
        textAlign(CENTER);
        text("it is raining", 200,100)
    }
}
function checkGameOver() {
    return isGameOver;
}

function handleGameOver() {
  isGameOver = true; // Fix the variable name to match your global variable
  fill(255, 0, 0);
  textSize(50);
  textAlign(CENTER);
  text("Game Over", width / 2, height / 2);
    backgroundMusic.stop()
  noLoop(); // Stop the game loop when the game is over
}



function drawScore() {
    // Draw the score on the screen
    fill(255);
    textSize(20);
    textAlign(RIGHT);
    text("Score: " + score, width - 20, 30);
}
function drawClouds(){
    for (var i = 0; i < clouds.length; i++) {
    fill(255, 255, 255);
    ellipse(clouds[i].x, clouds[i].y, 50 * clouds[i].size, 50 * clouds[i].size);
    ellipse(
      clouds[i].x - 20 * clouds[i].size,
      clouds[i].y,
      (50 - 20) * clouds[i].size,
      (50 - 20) * clouds[i].size
    );
    ellipse(
      clouds[i].x + 20 * clouds[i].size,
      clouds[i].y,
      (50 - 10) * clouds[i].size,
      (50 - 10) * clouds[i].size
    );
  }
}
function drawMountains(){
    for (var i = 0; i < mountains.length; i++) {
    fill(155, 155, 155);
    triangle(
      mountains[i].x - 50,
      mountains[i].y,
      mountains[i].x + 100,
      mountains[i].y,
      mountains[i].x,
      mountains[i].y - mountains[i].height
    );
  }
}
function drawTrees(){
    for (var i = 0; i < tree_x.length; i++) {
    fill(120, 100, 40);
    rect(tree_x[i] - 25, -150 + treePos_y, 60, 150);
    fill(0, 155, 0);
    triangle(
      tree_x[i] - 100,
      treePos_y - 75,
      tree_x[i],
      treePos_y - 225,
      tree_x[i] + 100,
      treePos_y - 75
    );
    triangle(
      tree_x[i] - 75,
      treePos_y - 150,
      tree_x[i],
      treePos_y - 300,
      tree_x[i] + 75,
      treePos_y - 150
    );
  }
}
function drawCollectable(t_collectable) {
    if (!t_collectable.isFound) {
        fill(255, 200, 0);
        stroke(214, 148, 4);
        strokeWeight(t_collectable.size * 0.06);
        
        // Draw a star shape
        beginShape();
        for (let i = 0; i < TWO_PI; i += PI / 5) {
            let x = t_collectable.x_pos + cos(i) * t_collectable.size / 2;
            let y = t_collectable.y_pos + sin(i) * t_collectable.size / 2;
            vertex(x, y);
            x = t_collectable.x_pos + cos(i + PI / 10) * t_collectable.size / 4;
            y = t_collectable.y_pos + sin(i + PI / 10) * t_collectable.size / 4;
            vertex(x, y);
        }
        endShape(CLOSE);
    }
}


function checkCollectable(t_collectable) {
    if (!t_collectable.isFound && dist(gameChar_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 20) {
        t_collectable.isFound = true;
        score += 1; // Increment the score by 1
      celebratoryAnimation();
        collectableSound.play()
    }

    if (t_collectable.isFound === false) {
       drawCollectable(collectables);
    }
}
function drawCanyon(t_canyon) {
    fill(116, 204, 244);
    rect(t_canyon.x_pos, floorPos_y, t_canyon.size, height - floorPos_y);
}

function checkCanyon(t_canyon) {
    if (
        gameChar_x > t_canyon.x_pos &&
        gameChar_x < t_canyon.x_pos + t_canyon.size && // Change from t_canyon.width to t_canyon.size
        !isJumping &&
        !isPlummeting
    ) {
        if (gameChar_y >= floorPos_y) {
            isPlummeting = true;
        }
    }

    if (isPlummeting === true) {
        gameChar_y += 5;
        fallingSound.play()
    }
    if (gameChar_x < t_canyon.x_pos || gameChar_x > t_canyon.x_pos + t_canyon.size) {
        isPlummeting = false;
    }
}

function renderFlagpole(){
    push();
    strokeWeight(7);
   stroke(180); line(flagpole.x_pos,floorPos_y,flagpole.x_pos,floorPos_y-250);
    fill(255,0,255)
    noStroke();
    if (flagpole.isReached)
    {
    rect(flagpole.x_pos,floorPos_y-250,50,50)
    }
    else {
        rect(flagpole.x_pos,floorPos_y-50,50,50)
    }
    for (var i=0;i<enemies.length;i++){
        enemies[i].draw();
        var inContact = enemies[i].checkContact(gameChar_x,gameChar_y)
        if (inContact){
            if(lives>0){ 
                lives-=1
                startGame();
                break;
            }
        }
    }
    pop();
}
function checkFlagpole(){
    var d = abs(gameChar_x - flagpole.x_pos)
    if (d < 15){
        flagpole.isReached = true
    }
}
function startGame() {
    if (isInCharacterSelection) {
        selectedCharacter = 0;
    }
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    
    isLeft= false;
    isRight=false;
    isFalling=false;
    isPlummeting=false;
    isJumping= false;

    tree_x =[
        300,
        550,
        900,
        1150
    ];
    
    treePos_y = floorPos_y;
    
    clouds = [
    { x: 300, y: 100, size: 1.2 },
    { x: 550, y: 100, size: 1.2 },
    { x: 800, y: 100, size: 1.2 },
    { x: 1150, y: 100, size: 1.2 }
  ];

  mountains = [
    { x: 400, y: floorPos_y, height: 350 },
    { x: 650, y: floorPos_y, height: 300 },
    { x: 1000, y: floorPos_y, height: 320 },
  ];
    cameraPosX = 0;
    starrySky = [];
  starrySkySpeed = 0.5;
 for (var i = 0; i < 100; i++) {
    starrySky.push({
      x: random(width),
      y: random(height/2),
    });
  }
     weather = 0; // Start with sunny weather

    
    collectables = [
        { x_pos: 200, y_pos: floorPos_y, size: 50, isFound: false },
        { x_pos: 400, y_pos: floorPos_y, size: 50, isFound: false },
        { x_pos: 600, y_pos: floorPos_y, size: 50, isFound: false },
    ];
     canyons = [
    { x_pos: 300, size: 70 },
    { x_pos: 700, size: 70 },
    { x_pos: 1000, size: 100 },
];
     flagpole={isReached: false, x_pos:1500}
     hasPlayedWinningSound = false;
    platforms=[];
    platforms.push(createPlatforms(100,floorPos_y-100,100))
    platforms.push(createPlatforms(500,floorPos_y-100,150))
    platforms.push(createPlatforms(900,floorPos_y-100,200))
    
    enemies=[];
    enemies.push(new enemy(100,floorPos_y-10,100))
    enemies.push(new enemy(800,floorPos_y-10,200))
}

function checkPlayerDie() {
    if (gameChar_y > height) {
        lives--; // Decrement lives when the character falls below the bottom of the canvas
        if (lives <= 0) {
            startGame(); // Reset the game if no lives remaining
        } else {
            gameChar_x = width / 2;
            gameChar_y = floorPos_y;
            isPlummeting = false;
        }
    }
}
function createPlatforms(x,y,length){
    var p = {
        x:x,
        y:y,
        length:length,
        draw:function(){
            fill(100);
            rect(this.x,this.y, this.length,20)
        },
        checkContact: function(gc_x, gc_y) {
    if (gc_x > this.x && gc_x < this.x + this.length) {
        var d = this.y - gc_y;
        if (d >= 0 && d < 5) {
            return true;
        }
    }
    return false;
}

    }
    return p
}
function enemy(x, y, range) {
    this.x = x;
    this.y = y;
    this.range = range;

    this.currentX = x;
    this.inc = 1;

    this.update = function () {
        this.currentX += this.inc;

        if (this.currentX >= this.x + this.range) {
            this.inc = -1;
        } else if (this.currentX < this.x) {
            this.inc = 1;
        }
    };

    this.draw = function () {
    this.update();

    // Body
    fill(255, 0, 0);
    ellipse(this.currentX, this.y - 10, 40, 40);

    // Head
    fill(0, 255, 0);
    ellipse(this.currentX, this.y - 40, 30, 30);

    // Eyes
    fill(255, 255, 0);
    ellipse(this.currentX - 8, this.y - 45, 8, 8); // Left eye
    ellipse(this.currentX + 8, this.y - 45, 8, 8); // Right eye

    // Mouth
    fill(0);
    rect(this.currentX - 5, this.y - 35, 10, 5);

};


    this.checkContact = function (gc_x, gc_y) {
        var d = dist(gc_x, gc_y, this.currentX, this.y);
        return d < 30;
    };
}
function drawRobotCharacter(x, y) {
 if (isLeft) {
    // Small rectangular body
fill("#2e75b6");
rect(x+10, y - 102, 15, 20.75);
    rect(x, y-80, 40, 40);

// One eye
fill("black");
ellipse(x +15, y - 88.25, 2.25);

// One leg
fill("#1f4e79");
rect(x + 10, y - 35, 9, 31);

// One hand
fill("#1f4e79");
rect(x + 10, y - 73.5, 4, 29.5);
    }

    else if (isRight) {
    // Small rectangular body
fill("#2e75b6");
rect(x+10, y - 102, 15, 20.75);
    rect(x, y-80, 40, 40);

// One eye
fill("black");
ellipse(x +20, y - 88.25, 2.25);

// One leg
fill("#1f4e79");
rect(x + 20, y - 35, 9, 31);

// One hand
fill("#1f4e79");
rect(x + 20, y - 73.5, 4, 29.5);
    }
   else if (isLeft && isFalling) {
         // Small rectangular body
fill("#2e75b6");
rect(x+10, y - 102, 15, 20.75);
    rect(x, y-80, 40, 40);

// One eye
fill("black");
ellipse(x +15, y - 88.25, 2.25);

// One leg
fill("#1f4e79");
rect(x + 10, y - 35, 9, 31);

// One hand
fill("#1f4e79");
rect(x + 5, y - 95, 4, 29.5);
    }
    else if (isRight && isFalling){
         // Small rectangular body
fill("#2e75b6");
rect(x+10, y - 102, 15, 20.75);
    rect(x, y-80, 40, 40);

// One eye
fill("black");
ellipse(x +20, y - 88.25, 2.25);

// One leg
fill("#1f4e79");
rect(x + 20, y - 35, 9, 31);

// One hand
fill("#1f4e79");
rect(x + 26, y - 95, 4, 29.5);
    }
        
        
        
    else {
    
    // Head and body
    fill("#2e75b6");
    rect(x - 17, y - 102, 30.5, 20.75);
    rect(x - 26.5, y - 80.5, 50, 22.5);
    rect(x - 26.5, y-56, 50, 22.5);
    // Legs
    rect(x - 20, y - 25.75, 9, 31);
    rect(x + 15, y - 25.75, 9, 31);
    // Arms
    rect(x - 32.5, y - 73.5, 4, 29.5);
    rect(x + 28.5, y - 79.75, 29.5, 4);
    // Feet and hands
    fill("#1f4e79");
    rect(x - 24.5, y, 13.75, 6.25);
    rect(x + 11.75, y, 13.75, 6.25);
    ellipse(x - 30.5, y -43, 3.75);
    ellipse(x + 60.25, y - 77.5, 3.75);
    // Eyes
    fill("white");
    ellipse(x - 13.5, y - 88.25, 3.5);
    ellipse(x + 3.75, y - 88.25, 3.5);
    fill("black");
    ellipse(x - 11.75, y - 88.25, 2.25);
    ellipse(x + 5.25, y - 88.25, 2.25);
    // Mouth
    fill("#d8d8d8");
    rect(x - 11.75, y - 80.75, 13.25, 3.25);
    // Decorations
    fill("#fff2cc");
    ellipse(x - 18, y - 61.75, 3);
    ellipse(x - 1.75, y - 61.75, 3);
    ellipse(x + 14.5, y - 61.75, 3);
    fill("#ffe699");
    rect(x - 22, y - 47.25, 41.25, 16.25);
}}
function drawDefaultCharacter(){
    // the game character
  if (isLeft && isFalling) {
    // add your jumping-left code
    // Body
    fill(255, 0, 0);
    rect(gameChar_x - 10, gameChar_y - 55, 25, 30);

    // Head
    fill(232, 190, 172);
    ellipse(gameChar_x, gameChar_y - 65, 30, 20);

    // Arms
    fill(232, 190, 172);
    rect(gameChar_x, gameChar_y - 55, 10, 20);

    // Legs
    fill(0);
    rect(gameChar_x - 10, gameChar_y - 30, 10);
    // mouth
    stroke(0); // Black color
    line(gameChar_x - 10, gameChar_y - 60, gameChar_x + 3, gameChar_y - 60);
    ellipse(gameChar_x - 4, gameChar_y - 70, 5, 5);
  } else if (isRight && isFalling) {
    // add your jumping-right code
    fill(255, 0, 0);
    rect(gameChar_x - 10, gameChar_y - 55, 25, 30);

    // Head
    fill(232, 190, 172);
    ellipse(gameChar_x, gameChar_y - 65, 30, 20);

    // Arms
    fill(232, 190, 172);
    rect(gameChar_x - 5, gameChar_y - 55, 10, 20);

    // Legs
    fill(0);
    rect(gameChar_x + 5, gameChar_y - 30, 10, 10);
    // mouth
    stroke(0); // Black color
    line(gameChar_x + 12, gameChar_y - 60, gameChar_x + 3, gameChar_y - 60);
    ellipse(gameChar_x + 3, gameChar_y - 70, 5, 5);
  } else if (isLeft) {
    // add your walking left code
    // Body
    fill(255, 0, 0);
    rect(gameChar_x - 10, gameChar_y - 55, 25, 50);

    // Head
    fill(232, 190, 172);
    ellipse(gameChar_x, gameChar_y - 65, 30, 20);

    // Arms
    fill(232, 190, 172);
    rect(gameChar_x, gameChar_y - 55, 10, 40);

    // Legs
    fill(0);
    rect(gameChar_x - 10, gameChar_y - 10, 15, 10);
    // mouth
    stroke(0); // Black color
    line(gameChar_x - 10, gameChar_y - 60, gameChar_x + 3, gameChar_y - 60);
    ellipse(gameChar_x - 4, gameChar_y - 70, 5, 5);
  } else if (isRight) {
    // add your walking right code
    // Body
    fill(255, 0, 0);
    rect(gameChar_x - 10, gameChar_y - 55, 25, 50);

    // Head
    fill(232, 190, 172);
    ellipse(gameChar_x, gameChar_y - 65, 30, 20);

    // Arms
    fill(232, 190, 172);
    rect(gameChar_x - 5, gameChar_y - 55, 10, 40);

    // Legs
    fill(0);
    rect(gameChar_x, gameChar_y - 10, 15, 10);
    // mouth
    stroke(0); // Black color
    line(gameChar_x + 12, gameChar_y - 60, gameChar_x + 3, gameChar_y - 60);
    ellipse(gameChar_x + 3, gameChar_y - 70, 5, 5);
  } else if (isFalling || isPlummeting) {
    // add your jumping facing forwards code
    // Draw the body
    fill(255, 0, 0);
    rect(gameChar_x - 13, gameChar_y - 47, 25, 25);

    // Draw the head
    fill(232, 190, 172);
    ellipse(gameChar_x, gameChar_y - 60, 30);
    // arms
    rect(gameChar_x - 20, gameChar_y - 50, 10, 25);
    rect(gameChar_x + 10, gameChar_y - 50, 10, 25);
    // legs
    fill(0);
    rect(gameChar_x - 10, gameChar_y - 25, 10);
    rect(gameChar_x + 3, gameChar_y - 25, 10);
    fill(0); // Black color
    ellipse(gameChar_x - 7, gameChar_y - 60, 5, 5);
    ellipse(gameChar_x + 3, gameChar_y - 60, 5, 5);

    // Draw the mouth (line)
    stroke(0); // Black color
    line(gameChar_x - 6, gameChar_y - 50, gameChar_x + 5, gameChar_y - 50);
  } else {
    // add your standing front
    // Draw the body
    fill(255, 0, 0);
    rect(gameChar_x - 13, gameChar_y - 47, 25, 25);

    // Draw the head
    fill(232, 190, 172);
    ellipse(gameChar_x, gameChar_y - 60, 30);
    // arms
    rect(gameChar_x - 20, gameChar_y - 50, 10, 25);
    rect(gameChar_x + 10, gameChar_y - 50, 10, 25);
    // legs
    fill(0);
    rect(gameChar_x - 10, gameChar_y - 25, 10);
    rect(gameChar_x + 3, gameChar_y - 25, 10);
    fill(0); // Black color
    ellipse(gameChar_x - 7, gameChar_y - 60, 5, 5);
    ellipse(gameChar_x + 3, gameChar_y - 60, 5, 5);

    // Draw the mouth (line)
    stroke(0); // Black color
    line(gameChar_x - 6, gameChar_y - 50, gameChar_x + 5, gameChar_y - 50);
  }
}
function keyPressed()
{
	// if statements to control the animation of the character when
	// keys are pressed.
   if (isInCharacterSelection) {
        if (keyCode === ENTER) {
            // Confirm the selected character and start the game
            isInCharacterSelection = false;
            startGame();
        } else if (keyCode === LEFT_ARROW && selectedCharacter > 0) {
            selectedCharacter--;
        } else if (keyCode === RIGHT_ARROW && selectedCharacter < characterOptions.length - 1) {
            selectedCharacter++;
        }
    } else {
    if (keyCode==65){
    
        isLeft=true;
}
    else if (keyCode==83) {
    
        isRight=true;
                        }
     // Spacebar is pressed, and the character is not already jumping
   if (keyCode == 87 && !isPlummeting && canJump || isContact) {
       
        isJumping = true;
        isFalling = false;
       canJump = false;
       jumpSound.play()
   }
}}

function keyReleased()
{
	// if statements to control the animation of the character when
	// keys are released.
    if (keyCode==65)
    {

        isLeft=false;
                    }
    else if (keyCode==83)
    {
        isRight=false;
    }
    if (keyCode==87){
        isJumping=false;
        isFalling = true;
        canJump = true;
                    }
}
