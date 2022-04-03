// -------------------
// Onur Ereren - April 2nd 2022
// 
// game.js - An exercise at creating a Phaser game with little to no javascript knowledge. The whole thing was created in about seven hours.
//
// -------------------

// All the variables are declared here. Because apparently they are too local when they are inside the class. Whatever works, I guess 

// --------
// GAME PARAMETERS: The parameters used in the game and their derived parameters
// --------

var spinStepLength = 250; // This is how many pixels the symbols are apart. Basically, every stopping step must be 250 pixels apart
var spinTweenLength = 1500; // Tween pushes 1500 pixels down during its lifetime
var spinRoundDuration = 750; // Tween completes in 750 miliseconds. 
var spinSpeed = spinTweenLength / spinRoundDuration; // Spin speed is 2 pixels / milisecond 
var spinStoppingDuration = 1500; // The spin will stop in 1500 miliseconds (everything is in miliseconds here!)
var spinSlowRate = spinSpeed / spinStoppingDuration; // Tween will slow by this amount per milisecond
var spinSlowRateNormalized = spinSlowRate / spinSpeed // how much the timeScale of the tween will decrease per milisecond

// -------
// GAME STATE VARIABLES: These are all booleans, because I don't know Javascript well enough to build a proper state machine :(
// -------
var spinButtonActive;

var spinning;

var leftSpinSlowing;
var centerSpinSlowing;
var rightSpinSlowing;

var leftSpinStopped;
var centerSpinStopped;
var rightSpinStopped;

var spinSlowing;
var spinStopped;


// -------
// Time-related variables
// -------

// Duration of each spin
var leftSpinDuration;
var centerSpinDuration;
var rightSpinDuration;

// Spin time counters for each spin
var leftSpinTimer;
var centerSpinTimer;
var rightSpinTimer;

// Variables that keep the various times, for processing in the update function
var startingTime;
var currentTime;
var previousFrameTime;
var elapsedTime;
var deltaTime;


// ------
// OTHER VARIABLES: Because when I put these inside the class, they somehow don't work in functions. I didn't have the time to figure out why, so here they are
// ------

// The spin tweens
var leftSpin;
var centerSpin;
var rightSpin;

// The spin button
var spinButton;



class game extends Phaser.Scene {
    constructor(){
        super();
    }

preload(){

  // Load the images
  this.load.image('arrow', 'assets/Arrow.png');
  this.load.image('background', 'assets/Background.png');
  this.load.image('banana', 'assets/Banana.png');
  this.load.image('blackberry', 'assets/Blackberry.png');
  this.load.image('cheatBackground', 'assets/CheatToolBackground.png');
  this.load.image('cheatInput', 'assets/CheatToolInput.png');
  this.load.image('cherry', 'assets/Cherry.png');
  this.load.image('spinButton', 'assets/Spin.png');
  this.load.image('winImage', 'assets/Win.png');
}

create(){
  // create the background;
  this.bg = this.add.sprite(960, 540, 'background');

  // create the spin button
  spinButton = this.add.sprite(960, 920, 'spinButton').setInteractive();
  
  // create the container for the lane masks
  this.laneContainer = this.add.container(0,0);

  // create lane containers
  this.laneLeft = this.add.container(570, 540);
  this.laneCenter = this.add.container(960, 540);
  this.laneRight = this.add.container(1350, 540);

  // create the three sets inside each lane (this wasn't actually necessary, but I realized that after I worked out the tween movement. So they stay. They are cool.)
  this.laneLeftOne = this.add.container(0,-1500);
  this.laneLeftTwo = this.add.container(0, -750);
  this.laneLeftThree = this.add.container(0, 0);

  this.laneCenterOne = this.add.container(0,-1500);
  this.laneCenterTwo = this.add.container(0, -750);
  this.laneCenterThree = this.add.container(0, 0);

  this.laneRightOne = this.add.container(0,-1500);
  this.laneRightTwo = this.add.container(0, -750);
  this.laneRightThree = this.add.container(0, 0);

  // create the sprites for the containers (in order of appeareance)
  // There are actually two sets of three images. The third set is the repetition of the first,
  // so when the tween starts over the teleportation is not noticeable (to human eye. Flash would probably notice. Just kidding, he would not. It's teleportation, happens over frame).
  
  var leftBananaOne = this.add.sprite(0, -250, 'banana');
  var leftCherryOne = this.add.sprite(0, 0, 'cherry');
  var leftBlackberryOne = this.add.sprite(0, 250, 'blackberry');
  var leftCherryTwo = this.add.sprite(0, -250, 'cherry');
  var leftBlackberryTwo = this.add.sprite(0, 250, 'blackberry');
  var leftBananaTwo = this.add.sprite(0, 0, 'banana');
  var leftBlackberryThree = this.add.sprite(0,250, 'blackberry');
  var leftBananaThree = this.add.sprite(0, -250, 'banana');
  var leftCherryThree = this.add.sprite(0, 0, 'cherry');

  var centerCherryOne = this.add.sprite(0, -250, 'cherry');
  var centerBlackberryOne = this.add.sprite(0, 0, 'blackberry');
  var centerBananaOne = this.add.sprite(0, 250, 'banana');
  var centerBlackberryTwo = this.add.sprite(0, -250, 'blackberry');
  var centerBananaTwo = this.add.sprite(0, 0, 'banana');
  var centerCherryTwo = this.add.sprite(0, 250, 'cherry');
  var centerCherryThree = this.add.sprite(0, -250, 'cherry');
  var centerBlackberryThree = this.add.sprite(0, 0, 'blackberry');
  var centerBananaThree = this.add.sprite(0, 250, 'banana');

  var rightBlackberryOne = this.add.sprite(0, -250, 'blackberry');
  var rightBananaOne = this.add.sprite(0, 0, 'banana');
  var rightCherryOne = this.add.sprite(0, 250, 'cherry');
  var rightBlackberryTwo = this.add.sprite(0, -250, 'blackberry');
  var rightCherryTwo = this.add.sprite(0, 0, 'cherry');
  var rightBananaTwo = this.add.sprite(0, 250, 'banana');
  var rightBlackberryThree = this.add.sprite(0, -250, 'blackberry');
  var rightBananaThree = this.add.sprite(0, 0, 'banana');
  var rightCherryThree = this.add.sprite(0, 250, 'cherry');

  // add the lane parts to the containers
  this.laneLeftOne.add([leftBananaOne, leftCherryOne, leftBlackberryOne]);
  this.laneLeftTwo.add([leftCherryTwo, leftBlackberryTwo, leftBananaTwo]);
  this.laneLeftThree.add([leftBlackberryThree, leftBananaThree, leftCherryThree]);

  this.laneCenterOne.add([centerCherryOne, centerBlackberryOne, centerBananaOne]);
  this.laneCenterTwo.add([centerBlackberryTwo, centerBananaTwo, centerCherryTwo]);
  this.laneCenterThree.add([centerBananaThree, centerCherryThree, centerBlackberryThree]);

  this.laneRightOne.add([rightBlackberryOne, rightBananaOne, rightCherryOne]);
  this.laneRightTwo.add([rightBlackberryTwo, rightCherryTwo, rightBananaTwo]);
  this.laneRightThree.add([rightCherryThree, rightBlackberryThree, rightBananaThree]);

  this.laneLeft.add([this.laneLeftOne, this.laneLeftTwo, this.laneLeftThree]);
  this.laneCenter.add([this.laneCenterOne, this.laneCenterTwo, this.laneCenterThree]);
  this.laneRight.add([this.laneRightOne, this.laneRightTwo, this.laneRightThree]);

  this.laneContainer.add([this.laneLeft, this.laneCenter, this.laneRight]);


  // Create the tweens and then pause them.
  leftSpin = this.tweens.add({
      targets: this.laneLeft,
      y: {value: this.laneLeft.y + spinTweenLength, duration: spinRoundDuration, yoyo: false},
      repeat: -1
  });
  leftSpin.timeScale = 0;

  centerSpin = this.tweens.add({
    targets: this.laneCenter,
    y: {value: this.laneCenter.y + spinTweenLength, duration: spinRoundDuration, yoyo: false},
    repeat: -1
  });
  centerSpin.timeScale = 0;

  rightSpin = this.tweens.add({
    targets: this.laneRight,
    y: {value: this.laneRight.y + spinTweenLength, duration: spinRoundDuration, yoyo: false},
    repeat: -1
  })
  rightSpin.timeScale = 0;

  // Create the mask for the lanes

  const maskShape = this.make.graphics();
  maskShape.fillStyle(0xffffff);
  maskShape.beginPath();
  maskShape.fillRect(400, 290, 340, 455);
  maskShape.fillRect(790, 290, 340, 455);
  maskShape.fillRect(1180, 290, 340, 455);

  const mask = maskShape.createGeometryMask();

  // Apply the mask to the topmost container
  this.laneContainer.setMask(mask);

  // Activate the spin button
  spinButtonActive = true;
  
  // This magical function processes clicks on the screen in a syntax totally alien to C# programmers.
  // I don't know if that "pointer" there is strictly necessary though. I got the script from the Phaser examples at Phaser.io
  this.input.on('gameobjectdown', function(pointer, gameobject){

    if (gameobject == spinButton){
      if (spinButtonActive){
        startTheSpins();
        greyOutSpinButton();
      }
    }
    
  });

  // This function grays out the spin button and deactivates it. 
  // There was one exactly like this right below it, reactivating the button. But it didn't work. I don't know why. Bummer.
  function greyOutSpinButton(){
    spinButtonActive = false;
    spinButton.setTint(0x666666);
  }

  // Randomize the spin durations
  function determineSpinDurations(){
    leftSpinDuration = 1000 + Math.round((10 * Math.random())) * spinStepLength;  // creating a spin randomization between 0 to 2500 miliseconds 
    centerSpinDuration = leftSpinDuration + (Math.round((5 * Math.random())) +1 ) * spinStepLength;  // make sure the center stops *after* left
    rightSpinDuration = centerSpinDuration + (Math.round((5 * Math.random())) + 1) * spinStepLength;  // likewise

  }

  // 
  function startTheSpins(){

    determineSpinDurations();

    //console.log('spin started');

    startingTime = new Date();  // Get the exact 'date' the spin started. Overkill, but it's the time function I could find on short notice.

    // Set the tweens into motion
    leftSpin.timeScale = 1;
    centerSpin.timeScale = 1;
    rightSpin.timeScale = 1;

    // Set the state to spinning for update function (I remember my Fortran days whenever I call update a function. Feels more appropriately named than "method", to be honest :) )
    spinning = true;
  }

}



update(){
  // Time management
 
  if (spinning){
    currentTime = new Date();
    elapsedTime = currentTime - startingTime;  // I substract two dates, and it gives me miliseconds. It's MAGIC!

    deltaTime = currentTime - previousFrameTime;

    if (elapsedTime >= leftSpinDuration){
      leftSpinSlowing = true;
    }

    if (elapsedTime >= centerSpinDuration){
      centerSpinSlowing = true;
    }

    if (elapsedTime >= rightSpinDuration){
      rightSpinSlowing = true;
    }
  }


  // Spin management

  if (leftSpinSlowing){
    leftSpin.timeScale -= spinSlowRateNormalized * deltaTime;

    if (leftSpin.timeScale <= 0){
      leftSpin.timeScale = 0;
      leftSpinStopped = true;
    }
  }

  if (centerSpinSlowing){
    centerSpin.timeScale -= spinSlowRateNormalized * deltaTime;

    if (centerSpin.timeScale <= 0){
      centerSpin.timeScale = 0;
      centerSpinStopped = true;
    }
  } 

  if (rightSpinSlowing){
    rightSpin.timeScale -= spinSlowRateNormalized * deltaTime;

    if (rightSpin.timeScale <= 0){   
      rightSpin.timeScale = 0;
      rightSpinStopped = true;
    }
  }

  // Check if spins stopped

  if (leftSpinStopped && centerSpinStopped && rightSpinStopped){

    // I had a separate function that did all these. But I couldn't run the function from within this if statement. 
    // I put it outside the class, I put it above the update, I put it below the update. Didn't work. I still don't know why to this hour.
    // It was going to be very elegant. I miss that function.
    spinButtonActive = true;
    spinButton.setTint(0xffffff);

    leftSpinSlowing = false;
    centerSpinSlowing = false;
    rightSpinSlowing = false;
    
  }

  // record the previous time to calculate deltaTime
  previousFrameTime = currentTime;
}

}

