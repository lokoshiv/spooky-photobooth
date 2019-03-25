//photobooth variables
var captureW = 600;
var captureH = 450;
var webcam;
var nameInput;
var darkness; //sound
var spirits = []; //array of spirits filter:
var i = 0; //to generate a random spirit from []
var ghost;
var demon;
var clown;
let save; //FOR SAVE BUTTON
let msg = 0; //to generate a random message from messages[]
let messages = [
  "You will be haunted by ghosts of pcomp past",
  "You will be haunted by arduino ghost",
  "You will not fail your pcomp final...probably",
  "You will have 7 years of okay luck",
  "Your next 70 LEDs will explode",
  "An army of jumper wires will jump to you in your sleep",
  "You will forget to plug in your arduino next 50 times when you run your code",
  "You will solder your next 10 sensor pins together",
  "Your USB port will never show up",
  "You will lost your toolbox next week",
  "Your computer will crash before you save your code"
];
var hatOnMoment; //returns millis() when hat is on(touch sensor)
var hatOnSeconds; //stores seconds elapsed after hat is on
var active = true; // to detect camera on and off
var countDown = false;
var count //stores countdown numbers  

//serial variables:
var serial;
var portName = '/dev/cu.usbmodem1411'; //!!!change to your port
var x, y; //accelerometer axis x y moves spirits
var touch; //capacitive sensor controls touch, 1 or 0
var lastTouch; //detect touch state

function preload() {
  darkness = loadSound('Darkness.mp3');
  scaryFont = loadFont('font.ttf');
}


function setup() {
  //serial communication:
  serial = new p5.SerialPort();
  serial.on('connected', serverConnected);
  serial.on('open', portOpen);
  serial.on('data', serialEvent);
  serial.on('error', serialError);
  serial.on('close', portClose);
  serial.list();
  serial.open(portName);

  //photobooth:
  if (darkness.isLoaded) {
    darkness.loop();
  }
  ghost = loadImage('ghost720p.png');
  demon = loadImage('demon720p.png');
  clown = loadImage('it.png');
  spirits = [ghost, demon, clown];

  cnv = createCanvas(captureW, captureH);
  cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  save = createButton('save');
  save.mousePressed(savePic);

  background(20);
  imageMode(CENTER);
  //WEBCAM SETUP
  webcam = createCapture(VIDEO);
  webcam.size(captureW, captureH);
  webcam.hide();

  //TEXTBOX FOR NAME
  nameInput = createInput('type your name');
  nameInput.position((windowWidth) / 2, (windowHeight + height) / 2);

  //   //BUTTON THAT TAKES PHOTO
  //   boo = createButton("say BOO");
  //   boo.mousePressed(takePic);
  //   boo.position((windowWidth - width) / 2, (windowHeight + height) / 2);

  //   //BUTTON THAT RESETS CAMERA
  //   button = createButton("reset");
  //   button.mousePressed(reset);
  //   button.position((windowWidth - width) / 2 + 100, (windowHeight + height) / 2);
}


function draw() {
  //happens the instant hat is put on(touch changes from 0 to 1),
  if (touch !== lastTouch && touch == 1) {
    hatOnMoment = millis(); //snap hat on moment
    countDown = true; //start countdown
  }

  //happens continuously since countdown is started
  if (countDown == true) {
    //stores count seconds elapsed since hatOnMoment 0,1,2,3,4,5
    hatOnSeconds = floor((millis() - hatOnMoment) / 1000);
    //stores count down numbers from 5 since hatOnMoment 5,4,3,2,1,0
    count = 5 - hatOnSeconds;
    if (count > 0) { //if count is 5,4,3,2,1, display count
      fill(255, 0, 0);
      console.log(count);
      displayCount();
    } else if (count == 0) { //when count is 0, take pic
      takePic(); //if (active=true) take pic, set (active=false) 
      hatOnSeconds = 0;
      countDown = false;
    }
  }

  //happens the instant when hat is off (touch changes from 1 to 0)
  if (touch !== lastTouch && touch == 0) {
    reset(); //active == true, generate random message and spirit for next pic
  }

  //happens continuously when webcam is active
  if (active == true) {
    image(webcam, width / 2, height / 2);
    filter('INVERT');
    moveSpirits();
  }

  lastTouch = touch; //saves last touch state
}



function moveSpirits() {
  tint(255, 127);
  //change random(-5,5) to accelerometer x,y readings
  image(spirits[i], (width / 2) + x * 30, (height / 2) + y * 30);
  filter('INVERT');
}

function takePic() {
  if (active == true) {
    image(webcam, captureW / 2, captureH / 2);
    filter('INVERT');
    displayName();
  }
  active = false;
}


function reset() {
  active = true;
  //generate random spirit and message for next pic
  i = floor(random(spirits.length));
  msg = floor(random(messages.length));
}


function displayName() {
  textSize(20);
  fill('#EB0000');
  textFont(scaryFont);
  text(nameInput.value() + ', ' + "\n" + messages[msg], 20, 350);
}

function displayCount() {
  textSize(200);
  textFont(scaryFont);
  text(count, width / 2 - 50, height / 2 + 50);
}

function savePic() {
    saveCanvas(cnv, 'myCanvas', 'png');
}



//serial communication:
function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialError(err) {
  console.log('Something went wrong with the serial port.' + err);
}

function portClose() {
  console.log('The serial port closed.');
}

function serialEvent() {
  var inString = serial.readStringUntil('\r\n');
  if (inString.length > 0) { //check to see that there's actually a string there:
    if (inString !== 'hello') { // if you get hello, ignore it  var sensors = split(inString, ",");
      var sensors = split(inString, ','); // split the string on the commas
      if (sensors.length > 2) {
        x = sensors[0];
        y = sensors[1];
        touch = sensors[2]; //touch state 1 or 0 
      }
    }
    serial.write('bye'); // send a byte requesting more serial data 
  }
}