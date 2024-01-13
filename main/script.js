cardObjectsArray = [
  { id: 1, imgPath: "/assests/images/card-KingHearts.png" },
  { id: 2, imgPath: "/assests/images/card-JackClubs.png" },
  { id: 3, imgPath: "/assests/images/card-QueenDiamonds.png" },
  { id: 4, imgPath: "/assests/images/card-AceSpades.png" },
];

let shuffleSound = new Audio("124.mp3");
let cardPressSound = new Audio("click-button.mp3");
let gameOverSound = new Audio("gameover.mp3");
const scoreContainer = document.querySelector(".score-cont");
const scoreElem = document.querySelector(".score");
const roundContainer = document.querySelector(".round-cont");
const roundElem = document.querySelector(".round");

//Ace Card Id
const aceId = 4;

// Number of Cards

const numCards = cardObjectsArray.length;
// console.log(numCards)

const cardBackImgPath = "/assests/images/card-back-Blue.png";

const collGridAreaTemplates = '"a a" "a a"';

const cardCollectedClsName = ".card-pos-a";

const cardContElem = document.querySelector(".card-container");

const gamePlayButton = document.getElementById("playGame");

let cards = [];

// initializing array which basically holds the positions of the grid card

let cardPositions = [];

let gameInProgress = false;
let shufflingInProgress = false;
let cardRevealed = false;

const currentStatus = document.querySelector(".current-status");
const winColor = "green";
const loseColor = "red";
const colorBlack = "black";

let roundNum = 0;
let score = 0;
let maxRounds = 4;

// Initializing the game Object
let gameObj = {};

// Initializing the unique key to the object in Local Storage
const idGameLocalStorage = "HTA";

function gameOver() {
  updateStatElem(scoreContainer, "none");
  updateStatElem(roundContainer, "none");

  gameOverSound.play();

  const gameOverMsg = `Game Over! -- Final Score-<span class="spn">${score}</span>
                   Click on Play Game To Play Again`;

  updateStatElem(currentStatus, "block", colorBlack, gameOverMsg);
  gameInProgress = false;
  gamePlayButton.disabled = false;
  gamePlayButton.style.display="inline-block";
}

function endRound() {
  setTimeout(() => {
    if (roundNum == maxRounds) {
      gameOver();
      return;
    } else {
      startRound();
    }
  }, 3000);
}

function chooseCard(card) {
  if (canChooseCard()) {
    evaluateCardChoice(card);
    saveGameToLocalStorage(roundNum, score);
    flipCard(card, false);

    setTimeout(() => {
      flipCards(false);
      updateStatElem(
        currentStatus,
        "block",
        colorBlack,
        "All Cards Positions Revealed..."
      );

      endRound();
    }, 3000);
    cardRevealed = true;
  }
}

function calculateToAddScore(roundNumber) {
  if (roundNumber == 1) {
    return 100;
  } else if (roundNumber == 2) {
    return 50;
  } else if (roundNumber == 3) {
    return 25;
  } else {
    return 10;
  }
}

function calculateScore() {
  const scoreToAdd = calculateToAddScore(roundNum);
  score += scoreToAdd;
}

function updateScore() {
  calculateScore();
  updateStatElem(
    scoreElem,
    "block",
    colorBlack,
    `Score <span class="spn">${score}</span>`
  );
}

function updateStatElem(elem, display, color, innerHTML) {
  elem.style.display = display;

  if (arguments.length > 2) {
    elem.style.color = color;
    elem.innerHTML = innerHTML;
  }
}

function outputUserChoice(hit) {
  if (hit) {
    updateStatElem(currentStatus, "block", winColor, "Hit !!-Well Done!! :)");
  } else {
    updateStatElem(currentStatus, "block", loseColor, "Missed !! :(");
  }
}

function evaluateCardChoice(card) {
  if (card.id == aceId) {
    updateScore();
    outputUserChoice(true);
  } else {
    outputUserChoice(false);
  }
}

function canChooseCard() {
  return gameInProgress == true && !shufflingInProgress && !cardRevealed;
}

loadGame();

function loadGame() {
  createCards();
  cardFlyInEffect();
  // addIdToElem(cardContElem,"particles-js");
  cards = document.querySelectorAll(".card");
  // console.log(cards)

  gamePlayButton.addEventListener("click", function () {
    startGame();
  });
}

function startGame() {
  initializeNewGame();
  startRound();
}

function initializeNewGame() {
  score = 0;
  roundNum = 0;

  checkIncompleteGame();
  shufflingInProgress = false;

  updateStatElem(scoreContainer, "flex");
  updateStatElem(roundContainer, "flex");
  updateStatElem(
    scoreElem,
    "block",
    colorBlack,
    `Score <span class="spn">${score}</span`
  );
  updateStatElem(
    roundElem,
    "block",
    colorBlack,
    `Round <span class="spn">${roundNum}</span>`
  );
}

function startRound() {
  initializeNewRound();
  collectCards();
  flipCards(true);
  shuffleCards();
}

function initializeNewRound() {
  roundNum++;
 gamePlayButton.disabled=true;
 gamePlayButton.style.display="none";

  // gamePlayButton.style.hover="disabled";

  gameInProgress = true;
  shufflingInProgress = true;
  cardRevealed = false;

  updateStatElem(currentStatus, "block", colorBlack, "Shuffling Cards");
  updateStatElem(
    roundElem,
    "block",
    colorBlack,
    `Round <span class="spn">${roundNum}</span>`
  );
}

// Check for the Incomplete Cards
function checkIncompleteGame() {
  const gameObjLocalStorage = getItemLocalStorage(idGameLocalStorage);

  if (gameObjLocalStorage) {
    gameObj = backToObject(gameObjLocalStorage);

    if (gameObj.round >= maxRounds) {
      removeItemLocalStorage(idGameLocalStorage);
    } else {
      if (confirm("Do You Want To Resume Your Last Game?") == true) {
        score = gameObj.score;
        roundNum = gameObj.round;
      }
    }
  }
}

function cardFlyInEffect() {
  const id = setInterval(flyIn, 5);
  let count = 0;
  let cardCount = 0;

  function flyIn() {
    count++;

    if (cardCount == numCards) {
      clearInterval(id);
    }
    else if (count == 1 || count == 250 || count == 500 || count == 750) {
      cardCount++;
      let card1 = document.getElementById(cardCount);
      card1.classList.remove("card-fly-in");
    }
  }
}

function collectCards() {
  transformGridArea(collGridAreaTemplates);
  addCardToGridAreaCell(cardCollectedClsName);
}

function transformGridArea(areas) {
  cardContElem.style.gridTemplateAreas = areas;
}

function addCardToGridAreaCell(divClassName) {
  const cardPosA = document.querySelector(divClassName);

  cards.forEach((card, index) => {
    addChildElement(cardPosA, card);
  });
}

function flipCard(card, flipToBack) {
  const innerCardElem = card.firstChild;

  if (flipToBack && !innerCardElem.classList.contains("flip-it")) {
    innerCardElem.classList.add("flip-it");
  } else if (innerCardElem.classList.contains("flip-it")) {
    innerCardElem.classList.remove("flip-it");
  }
}

function flipCards(flipToBack) {
  cards.forEach((card, index) => {
    setTimeout(() => {
      flipCard(card, flipToBack);
    }, index * 100);
  });
}

function animateShuffle(shuffleCount) {
  const random1 = Math.floor(Math.random() * numCards) + 1;
  const random2 = Math.floor(Math.random() * numCards) + 1;

  let card1 = document.getElementById(random1);
  let card2 = document.getElementById(random2);

  if (shuffleCount % 4 == 0) {
    card1.classList.toggle("card-shuffle-right");
    card1.style.zIndex = 100;
  }
  if (shuffleCount % 10 == 0) {
    card2.classList.toggle("card-shuffle-left");
    card2.style.zIndex = 200;
  }
}

function removeShuffle() {
  cards.forEach((card) => {
    card.classList.remove("card-shuffle-right");
    card.classList.remove("card-shuffle-left");
  });
}

function shuffleCards() {
  const id = setInterval(shuffle, 12);
  let shuffCount = 0;

  function shuffle() {
    animateShuffle(shuffCount);
    randomizeCardPositions();

    if (shuffCount < 500) {
      shuffCount++;
      shuffleSound.play();
    } else {
      clearInterval(id);
      dealCards();
      shufflingInProgress = false;
      updateStatElem(
        currentStatus,
        "block",
        colorBlack,
        "Choose The Card You Think is Ace of Spade"
      );
      removeShuffle();
    }
  }
}

function randomizeCardPositions() {
  const random1 = Math.floor(Math.random() * numCards) + 1;

  const random2 = Math.floor(Math.random() * numCards) + 1;
  const temp = cardPositions[random1 - 1];
  cardPositions[random1 - 1] = cardPositions[random2 - 1];

  cardPositions[random2 - 1] = temp;
}

function dealCards() {
  addCardToAppropiateCell();
  const templateArea = returnGridAreaMappedToCardPos();

  transformGridArea(templateArea);
}

// console.log(cards);
// console.log(cardPositions);

function returnGridAreaMappedToCardPos() {
  let fstPrt = "";
  let scdPrt = "";
  let areas = "";

  cards.forEach((card, index) => {
    if (cardPositions[index] == 1) {
      areas = areas + "a ";
    } else if (cardPositions[index] == 2) {
      areas = areas + "b ";
    } else if (cardPositions[index] == 3) {
      areas = areas + "c ";
    } else if (cardPositions[index] == 4) {
      areas = areas + "d ";
    }
    if (index == 1) {
      fstPrt = areas.substring(0, areas.length - 1);
      areas = "";
    } else if (index == 3) {
      scdPrt = areas.substring(0, areas.length - 1);
    }
  });

  return `"${fstPrt}" "${scdPrt}"`;
}

function addCardToAppropiateCell() {
  cards.forEach((card) => {
    addCardToGridCell(card);
  });
}

function createCards() {
  cardObjectsArray.forEach((cardItem) => {
    createCard(cardItem);
  });
}

{
  /* <div class="card">
<div class="card-inner">
<div class="card-front">
 <img  class="card-img" src="./assests/images/card-JackClubs.png" alt="Error Loading Image">
</div>
<div class="card-back">
 <img  class="card-img" src="./assests/images/card-back-Blue.png" alt="Error Loading Image">
</div>
</div>
 </div> */
}

function createCard(cardItem) {
  // Creating div elements through JS
  const cardElem = createElement("div");
  const cardInnerElem = createElement("div");
  const cardFrontElem = createElement("div");
  const cardBackElem = createElement("div");

  // Creating img elements through JS
  const cardFrontImg = createElement("img");
  const cardBackImg = createElement("img");

  // Adding class to Elements
  addClassToElem(cardElem, "card");

  // Adding id to Elements
  addIdToElem(cardElem, cardItem.id);

  // Adding class to cardInnerElem
  addClassToElem(cardInnerElem, "card-inner");

  // Adding class to cardFrontElem
  addClassToElem(cardFrontElem, "card-front");

  // Adding class to cardBackElem
  addClassToElem(cardBackElem, "card-back");

  //  Adding src to BackImgElem
  addImgSrcToElem(cardBackImg, cardBackImgPath);

  // Adding src to FrontImgElem
  addImgSrcToElem(cardFrontImg, cardItem.imgPath);

  // Adding class to img front Elem
  addClassToElem(cardFrontImg, "card-img");

  // Adding class to img back Elem
  addClassToElem(cardBackImg, "card-img");

  //Adding Flying Class To The Element
  addClassToElem(cardElem, "card-fly-in");


  // Adding cardFrontImg in cardFrontElem
  addChildElement(cardFrontElem, cardFrontImg);

  // Adding cardBackImg in cardBackElem
  addChildElement(cardBackElem, cardBackImg);

  // Adding cardFrontElem to cardInnerElem
  addChildElement(cardInnerElem, cardFrontElem);

  // Adding cardBackElem to cardInnerElem
  addChildElement(cardInnerElem, cardBackElem);

  // Adding cardInnerElem to cardElem
  addChildElement(cardElem, cardInnerElem);

  //   Adding card to Grid Cell
  addCardToGridCell(cardElem);

  // Initializing the card positions value
  initializeCardPositions(cardElem);

  //  Adding the Event Listener on the Card
  cardClickHandler(cardElem);
}

function cardClickHandler(card) {
  card.addEventListener("click", () => {
    cardPressSound.play();
    chooseCard(card);
  });
}

function initializeCardPositions(card) {
  cardPositions.push(card.id);
}

function createElement(elemType) {
  return document.createElement(elemType);
}

function addClassToElem(elem, className) {
  elem.classList.add(className);
}

function addIdToElem(elem, id) {
  elem.id = id;
}

function addImgSrcToElem(imgElem, src) {
  imgElem.src = src;
}

function addChildElement(parentElem, childElem) {
  parentElem.appendChild(childElem);
}

function addCardToGridCell(card) {
  const cardDivClassName = mapCardToGridCell(card);

  const cardPosElem = document.querySelector(cardDivClassName);

  addChildElement(cardPosElem, card);
}

function mapCardToGridCell(card) {
  if (card.id == 1) {
    return ".card-pos-a";
  } else if (card.id == 2) {
    return ".card-pos-b";
  } else if (card.id == 3) {
    return ".card-pos-c";
  } else if (card.id == 4) {
    return ".card-pos-d";
  }
}

// Local Storage Logic
function stringifyObject(obj) {
  return JSON.stringify(obj);
}

function backToObject(stringy) {
  return JSON.parse(stringy);
}

function setItemLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function removeItemLocalStorage(key) {
  localStorage.removeItem(key);
}

function getItemLocalStorage(key) {
  return localStorage.getItem(key);
}

function updateGameScore(round, score) {
  gameObj.round = round;
  gameObj.score = score;
}

function saveGameToLocalStorage(round, score) {
  updateGameScore(round, score);
  setItemLocalStorage(idGameLocalStorage, stringifyObject(gameObj));
}
