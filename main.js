const board = document.getElementById("game-board");
const moveCountDisplay = document.getElementById("move-count");
const messageDisplay = document.getElementById("message");

const CELL = 75; // 1マス=75px
let moveCount = 0;

const blocks = [
  { id: "mom", x: 1, y: 0, w: 2, h: 2, label: "娘", color: "#e91e63", isGoal: true },
  { id: "l1", x: 0, y: 0, w: 1, h: 2, label: "人", color: "#03a9f4" },
  { id: "r1", x: 3, y: 0, w: 1, h: 2, label: "人", color: "#03a9f4" },
  { id: "l2", x: 0, y: 2, w: 1, h: 2, label: "人", color: "#ff9800" },
  { id: "r2", x: 3, y: 2, w: 1, h: 2, label: "人", color: "#ff9800" },
  { id: "c1", x: 1, y: 2, w: 1, h: 1, label: "", color: "#9e9e9e" },
  { id: "c2", x: 2, y: 2, w: 1, h: 1, label: "", color: "#9e9e9e" },
  { id: "b1", x: 1, y: 3, w: 1, h: 2, label: "人", color: "#3f51b5" },
  { id: "b2", x: 2, y: 3, w: 1, h: 2, label: "人", color: "#3f51b5" },
];

function render() {
  board.innerHTML = "";
  for (let b of blocks) {
    const div = document.createElement("div");
    div.className = "block";
    div.style.width = `${b.w * CELL}px`;
    div.style.height = `${b.h * CELL}px`;
    div.style.left = `${b.x * CELL}px`;
    div.style.top = `${b.y * CELL}px`;
    div.style.backgroundColor = b.color;
    div.textContent = b.label;
    div.onclick = () => tryMove(b);
    board.appendChild(div);
  }
}

function tryMove(block) {
  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];
  for (let { dx, dy } of dirs) {
    const nx = block.x + dx;
    const ny = block.y + dy;
    if (!isFree(nx, ny, block.w, block.h, block.id)) continue;

    // 娘以外の駒が箱の外に出ないように制限
    if (!block.isGoal && (nx < 0 || nx + block.w > 4 || ny < 0 || ny + block.h > 5)) continue;

    block.x = nx;
    block.y = ny;
    moveCount++;
    moveCountDisplay.textContent = `手数: ${moveCount}`;
    render();
    checkGoal();
    return;
  }
}

function isFree(x, y, w, h, exceptId) {
  if (x < 0 || x + w > 4 || y < 0 || y + h > 5) return false;
  return !blocks.some(b =>
    b.id !== exceptId &&
    x < b.x + b.w &&
    x + w > b.x &&
    y < b.y + b.h &&
    y + h > b.y
  );
}

function checkGoal() {
  const mom = blocks.find(b => b.id === "mom");
  if (mom.x === 1 && mom.y === 3) {
    messageDisplay.textContent = "🎉 娘が脱出できました！おめでとう！";
  }
}

render();