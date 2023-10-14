import { WORDS } from "./words.js";

// Colours
let GREEN = "rgb(102, 222, 134)";
let YELLOW =  "rgb(253, 255, 161)";
let GREY = "rgb(132, 132, 132)"

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];

console.log(rightGuessString);

// Create the game board
function initBoard() {
    let board = document.getElementById("game-board");

    // Create one row for each guess we give the user
    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        // Create 5 boxes per row
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

// shadeKeyboard colours the keys of the on-screen keyboard
function shadeKeyBoard(letter, color) {
    // Find the key htat matches the given letter
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor;
            
            if (oldColor === GREEN) { // If key is already green, do nothing
                return;
            }

            if (oldColor === YELLOW && color !== GREEN) { // If key is yellow, only allow it to become green
                return;
            }

            // Otherwise shade the key passed to the function
            elem.style.backgroundColor = color;
            break;
        }
    }
}

// checkGuess ensures that the gu ess is 5 letters, is of hte valid list, checks each letter of the word
// and colours them, tells user about end of game
function checkGuess() {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let guessString = "";
    let rightGuess = Array.from(rightGuessString);

    for (const val of currentGuess) {
        guessString += val;
    }

    // Check if the guessed word is of length 5
    if (guessString.length != 5) {
        toastr.error("Not enough letters!");
        return;
    }

    // Check if the guessed word is in the list
    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!");
        return;
    }

    var letterColor = [GREY, GREY, GREY, GREY, GREY];

    //  If the letter is in the right position, shade the box to be green
    for (let i = 0; i < 5; i++) {
        if (rightGuess[i] == currentGuess[i]) {
        letterColor[i] = GREEN;
        rightGuess[i] = "#";
        }
    }

    // For each letter, if it's in teh right position then shade the box to be green
    // Else if it's in the word, shade it to be yellow
    //checking guess letters
    for (let i = 0; i < 5; i++) {
        if (letterColor[i] == GREEN) continue;

        // Checking for colours
        for (let j = 0; j < 5; j++) {
            if (rightGuess[j] == currentGuess[i]) {
                letterColor[i] = YELLOW;
                rightGuess[j] = "#";
            }
        }
    }

    for (let i = 0; i < 5; i++) {
        let box = row.children[i];
        let delay = 250 * i;
        setTimeout(() => {
            animateCSS(box, "flipInX"); // Animation - Flip the box vertically before changing the colour
            box.style.backgroundColor = letterColor[i]; // Shade the box
            shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
        }, delay);
    }

    // Check if guessed string is the correct word
    if (guessString === rightGuessString) { // If they match, the game is over
        toastr.success("You guessed right! Game over!");
        guessesRemaining = 0;
        return;
    } else { // If not, reduce the number of guesses remaining and move onto the next guess
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) { // If this was the final guess, then game over
            toastr.error("You've run out of guesses! Game over!");
            toastr.info(`The right word was: "${rightGuessString}"`);
        }
    }
}

// insertLetter(pressedKey) checks if htere's still space in the guess for the letter,
// find the appropriate row and puts the letter in the box
function insertLetter(pressedKey) {
    if (nextLetter === 5) {
        return;
    }
    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse"); // Animate the pulsing of a box before filling it with a letter
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

// deleteLetter() gets the correct row, finds the last box and empties it, and resets the nextLetter counter
function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;
}

// Allow animations
const animateCSS = (element, animation, prefix = "animate__") =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
        event.stopPropagation();
        node.classList.remove(`${prefix}animated`, animationName);
        resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

    // Accept User input
    document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) { // If there's no guesses remaining
        return;
    }

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && nextLetter !== 0) { // Delete the letter
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") { // Check the guess
        checkGuess();
        return;
    }

    let found = pressedKey.match(/[a-z]/gi);
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
});

// Listen for a click on the keyboard to allow on-screen keyboard to work
document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
        return;
    }
    let key = target.textContent;

    if (key === "Del") {
        key = "Backspace";
    }

    document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

initBoard();