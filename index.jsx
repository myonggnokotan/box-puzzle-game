import React, { useState } from "react";

const CELL_SIZE = 40; // 画像の1マスのサイズ(px)

// 箱の初期配置（x,yはマスの座標、width/heightはマスの大きさ）
const initialBoxes = [
  { id: 1, x: 0, y: 0, width: 2, height: 2 },
  { id: 2, x: 2, y: 0, width: 1, height: 2 },
  { id: 3, x: 3, y: 0, width: 1, height: 1 },
  { id: 4, x: 3, y: 1, width: 1, height: 1 },
  { id: 5, x: 0, y: 2, width: 1, height: 2 },
  { id: 6, x: 1, y: 2, width: 1, height: 1 },
  { id: 7, x: 1, y: 3, width: 1, height: 1 },
  { id: 8, x: 2, y: 2, width: 2, height: 1 },
  { id: 9, x: 2, y: 3, width: 1, height: 1 },
  { id: 10, x: 3, y: 3, width: 1, height: 1 },
];

function Box({ box, onDrag }) {
  const [dragStart, setDragStart] = useState(null);

  const handleMouseDown = (e) => {
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!dragStart) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    if (Math.abs(deltaX) > CELL_SIZE || Math.abs(deltaY) > CELL_SIZE) {
      const moveX = Math.round(deltaX / CELL_SIZE);
      const moveY = Math.round(deltaY / CELL_SIZE);
      if (moveX !== 0 || moveY !== 0) {
        onDrag(box.id, moveX, moveY);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: "absolute",
        left: box.x * CELL_SIZE,
        top: box.y * CELL_SIZE,
        width: box.width * CELL_SIZE,
        height: box.height * CELL_SIZE,
        backgroundColor: "orange",
        border: "2px solid #b35300",
        boxSizing: "border-box",
        cursor: "grab",
        userSelect: "none",
      }}
    />
  );
}

export default function Puzzle() {
  const [boxes, setBoxes] = useState(initialBoxes);

  const moveBox = (id, dx, dy) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((b) =>
        b.id === id
          ? { ...b, x: b.x + dx, y: b.y + dy }
          : b
      )
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: 4 * CELL_SIZE,
        height: 5 * CELL_SIZE,
        border: "2px solid #999",
        margin: "20px auto",
        backgroundColor: "#f0f0f0",
      }}
    >
      {boxes.map((box) => (
        <Box key={box.id} box={box} onDrag={moveBox} />
      ))}
    </div>
  );
}