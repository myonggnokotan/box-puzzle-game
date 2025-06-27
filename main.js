const board = document.getElementById("game-board");
const moveCountDisplay = document.getElementById("move-count");

const cellSize = 75; // 4列×5行で300x375
let moveCount = 0;

const blocks = [
  // あのツイートの配置を元にした配置（箱入り娘は "mom"）
  { id: "mom", x: 1, y: 0, w: 2, h: 2, color: "#e91e63", label: "母" },
  { id: "child1", x: 0, y: 0, w: 1, h: 2, color: "#2196f3", label: "子1" },
  { id: "child2", x: 3, y: 0, w: 1, h: 2, color: "#2196f3", label: "子2" },
  { id: "dad1", x: 0, y: 2, w: 1, h: 2, color: "#ff9800", label: "父1" },
  { id: "dad2", x: 3, y: 2, w: 1, h: 2, color: "#ff9800", label: "父2" },
  { id: "empty1", x: 1, y: 2, w: 1, h: 1, color: "#9e9e9e", label: "" },
  { id: "empty2", x: 2, y: 2, w: 1, h: 1, color: "#9e9e9e", label: "" },
  { id: "aunt1", x: 1, y: 3, w: 1, h: 2, color: "#3f51b5", label: "叔1" },
  { id: "aunt2", x: 2, y: 3, w: 1, h: 2, color: "#3f51b5", label: "叔2" }
];

// 描画と操作

function renderBlocks() {
  board.innerHTML = "";
  blocks.forEach(block => {
    const div = document.createElement("div");
    div.className = "block";
    div.id = block.id;
    div.style.width = `${block.w * cellSize}px`;
    div.style.height = `${block.h * cellSize}px`;
    div.style.left = `${block.x * cellSize}px`;
    div.style.top = `${block.y * cellSize}px`;
    div.style.backgroundColor = block.color;
    div.textContent = block.label;

    div.addEventListener("click", () => tryMove(block));
    board.appendChild(div);
  });
}

function isFree(x, y, w, h, exceptId = null) {
  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      if (x + dx < 0 || x + dx >= 4 || y + dy < 0 || y + dy >= 5) return false;
      const occupied = blocks.find(b =>
        b.id !== exceptId &&
        b.x <= x + dx - 1 && x + dx < b.x + b.w &&
        b.y <= y + dy - 1 && y + dy < b.y + b.h
      );
      if (occupied) return false;
    }
  }
  return true;
}

function tryMove(block) {
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ];
  for (const dir of directions) {
    const newX = block.x + dir.dx;
    const newY = block.y + dir.dy;
    if (isFree(newX, newY, block.w, block.h, block.id)) {
      block.x = newX;
      block.y = newY;
      moveCount++;
      moveCountDisplay.textContent = `手数: ${moveCount}`;
      renderBlocks();
      checkClear();
      return;
    }
  }
}

function checkClear() {
  // 母（mom）が右端の2列(2,3)の下段(3 or 4行目)にいるとクリア
  const mom = blocks.find(b => b.id === "mom");
  if (
    mom.x === 1 && (mom.y === 3) ||
    mom.x === 1 && (mom.y === 4)
  ) {
    alert(`クリア！ お疲れさま！ 手数：${moveCount}`);
  }
}

renderBlocks();