const maxStringLength = 7;

let canvas;
let playerInfo = { username: null, room: null, index: null }
let roomInfo = { players: [], maxPlayers: -1 }
let textInput = '';
let isInputting = false;
let message;
let messageStartFrame;
let screen = "home"
const backgroundColor = '#8fd3f5'

let vtFont

function preload() {
    vtFont = loadFont('assets/VT323-Regular.ttf');
}

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight)
    canvas.position(0, 0)
}

function windowResized() {
    if (canvas != undefined) {
        resizeCanvas(window.innerWidth, window.innerHeight)
        // canvas.position(0, 0)
    }
}

function draw() {
    switch (screen) {
        case "home":
            drawHomePage();
            break;
        case "join":
            drawNamePage()
            break;
        case "lobby":
            drawLobbyPage()
            break;
        case "game":
            drawGamePage()
            break
        case "end":
            drawEndPage()
    }
    if (message) {
        showMessage()
    }
}

function textOptions(size) {
    textAlign(CENTER, CENTER);
    textFont(vtFont);
    textSize(size);
    fill(255)
    // strokeWeight(size / 15)
    // stroke('#ea966f')
}

function drawBackground() {
    background(51)
    // c1 = color(backgroundColor);
    // c2 = color(63, 191, 191);

    // for (let y = 0; y < height; y++) {
    //     n = map(y, 0, height, 0, 1);
    //     let newc = lerpColor(c1, c2, n);
    //     stroke(newc);
    //     line(0, y, width, y);
    // }
}

let startButtonY
let instructionsY
let isInstructions = false
function drawHomePage() {
    //background(backgroundColor)
    drawBackground()
    // noStroke()
    textOptions(width / 10)
    text("Grid Battle", width / 2, height / 4)

    button("Join Game!", width / 2, height * 3 / 4, width / 4, width / 20, () => {
        screen = "join"
    })
}

function drawNamePage() {
    //background(backgroundColor)
    drawBackground()
    textAlign(CENTER, CENTER);
    textSize(width / 15);
    fill(255);

    isInputting = true
    if (playerInfo.username == null) {
        text("Enter your name:", width / 2, height / 3);
        noStroke()
        fill(255)
        text(textInput, width / 2, height / 2);
        return;
    } else if (playerInfo.room == null) {
        text("Enter a room name:", width / 2, height / 3);
        noStroke()
        fill(255)
        text(textInput, width / 2, height / 2);
        return;
    }
    isInputting = false
    screen = "lobby"
}

function drawLobbyPage() {
    //background(backgroundColor)
    drawBackground()
    textAlign(CENTER, CENTER);
    textSize(width / 15);
    fill(255);
    text("Room " + playerInfo.room, width / 2, height / 8)
    textSize(width / 25);
    fill(255);
    noStroke()
    let txt = ""
    roomInfo.players.forEach((player, i) => {
        if (i == 0) {
            txt += player + " (host)"
        } else {
            txt += player
        }
        if (i < roomInfo.players.length - 1) {
            txt += ",  "
        }
    })
    text(txt, width / 2, height / 4)
    fill(255)
    if (roomInfo.players.length < roomInfo.maxPlayers) {
        text(`(${roomInfo.players.length}/4)`, width / 2, height * 3 / 4)
    } else {
        if (isHost()) {
            button("Start Game!", width / 2, height * 3 / 4, width / 4, width / 20, () => {
                socket.emit('start game', playerInfo.room)
            })
        } else {
            text("Waiting for host", width / 2, height * 3 / 4)
        }
    }
}

function drawGamePage() {
    //background(backgroundColor)
    drawBackground()
    textOptions(width / 10)
    text("Game Page", width / 2, height / 4)
}
function isHost() {
    return roomInfo.players[0] == playerInfo.username
}

function button(txt, x, y, w, h, onClick) {
    // rectMode(CENTER)
    // rect(x, y, w, h)
    textOptions((w + h) / 6)
    fill(255)
    text(txt, x, y)

    if (mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2) {

        if (mouseIsPressed) {
            onClick()
        }
    }
}

function imgButton(img, x, y, s, isHighlighted, onClick) {
    imageMode(CENTER)
    rectMode(CENTER)
    noFill()
    if (isHighlighted) {
        stroke(255, 150, 100)
        strokeWeight(s / 20)
    } else {
        stroke(0)
        strokeWeight(s / 150)
    }
    image(img, x, y, s, s)
    rect(x, y, s, s)
    if (mouseIsPressed && mouseX > x - s / 2 && mouseX < x + s / 2 && mouseY > y - s / 2 && mouseY < y + s / 2) {
        onClick()
    }
}

function newMessage(msg) {
    message = msg;
    messageStartFrame = frameCount;
}

function showMessage() {
    let n = frameCount - messageStartFrame;
    if (n > 255) {
        message = '';
    }
    push();
    textAlign(CENTER, CENTER);
    textSize(50);
    fill(255, 255 - n);
    noStroke()
    text(message, width / 2, height / 3 - n / 10);
    pop();
}

function keyPressed() {
    if (isInputting) {
        if (textInput.length < maxStringLength && key.length == 1) {
            textInput += key;
        }
        if (key == 'Backspace') {
            textInput = textInput.substring(0, textInput.length - 1);
        }
        if (playerInfo.username == null) {
            if (textInput.length > 0 && key == 'Enter') {
                playerInfo.username = textInput;
                socket.emit('new name', playerInfo.username);
                textInput = '';
                return false;
            }
        } else if (playerInfo.room == null) {
            if (textInput.length > 0 && key == 'Enter') {
                socket.emit('create or join', textInput);
                textInput = '';
            }
        }
    }
}

socket.on('start game', (initGrid) => {
    screen = "game"
    index = roomInfo.players.indexOf(playerInfo.username)
    // playerInfo.index = roomInfo.players.indexOf(playerInfo.username)
});

socket.on('end screen', (data) => {
    finalImages = []
    data[0].forEach((img) => {
        finalImages.push(loadImage(img))
    })
    finalClassifications = data[1]
    actual_prompts = data[2]
    screen = "end"
    lastChangedTime = millis();
});

socket.on('begin timer', (times) => {
    drawingStartTime = times[0]
    drawingEndTime = times[1]
    timerRunning = true
});

// Room stuff
socket.on('created', (room) => {
    console.log('created room', room);
    newMessage('created room ' + room);
    playerInfo.room = room;
    roomInfo.players = [playerInfo.username];
});

socket.on('joined', (room, others, maxPlayers) => {
    console.log('joined room', room);
    newMessage('joined room ' + room);
    playerInfo.room = room;
    roomInfo.players = others;
    roomInfo.maxPlayers = maxPlayers
});

socket.on('full', (room) => {
    console.log('room', room, 'is full');
    newMessage('room ' + room + ' is full');
});

socket.on('otherjoined', (name) => {
    if (name != playerInfo.name) {
        roomInfo.players.push(name);
    }
    console.log(name, 'joined the room');
    newMessage(name + ' joined room');
});

socket.on('otherleft', (name) => {
    let index = roomInfo.players.indexOf(name);
    if (index > -1) {
        roomInfo.players.splice(index, 1);
    }
    console.log(name, 'left the room');
    newMessage(name + ' left the room');
});
