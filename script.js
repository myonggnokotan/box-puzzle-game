const container = document.getElementById('puzzle-container');
const resetBtn = document.getElementById('reset-btn');
const CELL = 80;
const W = 4, H = 5;
const EXIT = { x: 2, y: 4 }; // ゴール位置

const initial = [
  { x: 1, y: 0, w: 2, h: 2, id: 'princess' },
  { x: 0, y: 2, w: 1, h: 2, id: 'family1' },
  { x: 3, y: 0, w: 1, h: 2, id: 'family2' },
  { x: 2, y: 2, w: 1, h: 2, id: 'family3' },
  { x: 0, y: 4, w: 2, h: 1, id: 'family4' },
];

let pieces;

function reset() {
  container.innerHTML = '';
  pieces = JSON.parse(JSON.stringify(initial));
  pieces.forEach(el => {
    const div = document.createElement('div');
    div.classList.add('block');
    div.classList.add(el.id === 'princess' ? 'princess' : 'family');
    div.style.width = (CELL * el.w) + 'px';
    div.style.height = (CELL * el.h) + 'px';
    div.style.left = (CELL * el.x) + 'px';
    div.style.top = (CELL * el.y) + 'px';
    div.id = el.id;
    container.appendChild(div);
    makeDraggable(div, el);
  });
}
resetBtn.addEventListener('click', reset);

function makeDraggable(div, piece) {
  let startX, startY, origX = piece.x, origY = piece.y;
  div.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
  });
  div.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > CELL || Math.abs(dy) > CELL) {
      const dir = Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? 'right' : 'left')
        : (dy > 0 ? 'down' : 'up');
      attemptMove(piece, dir);
      startX = t.clientX;
      startY = t.clientY;
    }
  });
}

function attemptMove(p, dir) {
  const nx = p.x + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0);
  const ny = p.y + (dir === 'down' ? 1 : dir === 'up' ? -1 : 0);
  if (canMove(p, nx, ny)) {
    p.x = nx; p.y = ny;
    const d = document.getElementById(p.id);
    d.style.left = (p.x * CELL) + 'px';
    d.style.top = (p.y * CELL) + 'px';
    checkWin();
  }
}

function canMove(p, nx, ny) {
  if (nx < 0 || ny < 0 || nx + p.w > W || ny + p.h > H) return false;
  for (let q of pieces) {
    if (q.id === p.id) continue;
    if (!(nx + p.w <= q.x || q.x + q.w <= nx || ny + p.h <= q.y || q.y + q.h <= ny)) {
      return false;
    }
  }
  return true;
}

function checkWin() {
  const princess = pieces.find(p => p.id === 'princess');
  if (princess.x === EXIT.x && princess.y + princess.h === H + 1) {
    setTimeout(() => alert('脱出成功！🎉'), 100);
  }
}

reset();