const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};
const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];
//控制器
const controller = {
  //初始狀態
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  //判斷卡片狀態
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        //判斷第二次是否配對成功
        if (model.isRevealedCardsMatched()) {
          //正確
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairedCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //不正確
          controller.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(controller.resetCards, 1000);
          controller.currentState = GAME_STATE.FirstCardAwaits;
        }
        break;
    }
    console.log("this.currentState", this.currentState);
    console.log(
      "revealedCards",
      model.revealedCards.map((card) => card.dataset.index)
    );
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    // console.log(controller.currentState);
  },
};
//集中管理資料地方
const model = {
  //暫存第一二次的翻牌紀錄
  revealedCards: [],
  //判斷有沒有相同
  isRevealedCardsMatched() {
    const revealedCardOne = this.revealedCards[0].dataset.index % 13;
    const revealedCardTwo = this.revealedCards[1].dataset.index % 13;
    return revealedCardOne === revealedCardTwo;
  },
  //分數和次數
  score: 0,
  triedTimes: 0,
};
//跟卡牌任何顯示畫面相關
const view = {
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    /*
    1.Array.from(Array(52).keys()) => ES6用法，將array中52個key迭代後，再用array.form()建立一個新的array => 後續移到getRandomNumberArray裡面
    2.透過map迭代index陣列到getCardElement(map不修改原本陣列)
    3.最後加上.join("")合併成HTML格式
    */
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },
  //初始化得到背面
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`;
  },
  //翻正時會呼叫卡片內容
  getCardContent(index) {
    // 0-51分持四組(1~13-黑桃/ 14~26-愛心/ 27~39-菱形/ 40~52梅花)
    //數字運算
    const number = this.transformNumber((index % 13) + 1);
    //判斷圖案要甚麼
    const symbol = Symbols[Math.floor(index / 13)];
    return `
    <p>${number}</p>
    <img
      src="${symbol}"
      alt=""
    />
    <p>${number}</p>`;
  },
  //字型轉換
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  //翻牌判斷
  flipCards(...cards) {
    cards.map((card) => {
      //背面
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
      } else {
        //正面
        card.classList.add("back");
        card.innerHTML = null;
      }
    });
  },
  //配對成功樣式
  pairedCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  //運算分數
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  //運算次數加總
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  //加入配對錯誤動畫
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      //addEventListener中的 animationend是指綁定動畫結束後的事件，而once: true是指事件執行一次後就刪除這個監聽器，不浪費效能
      card.addEventListener("animationend", (event) => {
        card.classList.remove("wrong"), { once: true };
      });
    });
  },
  //結束畫面
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
    <p> Congratulation!! </p>
    <p> You've tried: ${model.triedTimes} times </p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },
};

//洗牌函式
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    const n = number.length;
    for (let i = 0; i < n; i++) {
      const randomNumber = Math.floor(Math.random() * (n - i)) + i;
      [number[i], number[randomNumber]] = [number[randomNumber], number[i]];
    }
    return number;
  },
};

controller.generateCards();

//綁定事件設定
const allCard = document.querySelectorAll(".card");
allCard.forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
