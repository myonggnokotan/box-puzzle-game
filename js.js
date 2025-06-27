document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const shuffleButton = document.getElementById('shuffle-button');

    const COLS = 4;
    const ROWS = 4;
    const TILE_SIZE_DESKTOP = 80; // CSSと同期
    const TILE_SIZE_MOBILE = 60; // CSSと同期
    let currentTileSize = TILE_SIZE_DESKTOP;

    // 初期配置の定義
    // 各マスにユニークなIDと、そのマスの色を割り当てる
    // 'empty' は空きマス
    const initialBoardColors = [
        'orange_A', 'red_A', 'red_A', 'lime_A',
        'pink_A', 'pink_A', 'purple_A', 'blue_A',
        'pink_A', 'lightgray_A', 'lightblue_A', 'green_A',
        'lightblue_A', 'green_A', 'lavender_A', 'empty'
    ];

    let boardState = []; // 現在のボードの状態（色のIDを保持）
    let tileElements = new Map(); // マスIDとDOM要素のマッピング
    let groupMap = new Map(); // 各マスが属するグループのIDを保持
    let groups = new Map(); // 各グループの構成マスと色を保持

    // ボードを初期化してレンダリングする関数
    function initializeBoard() {
        boardState = [...initialBoardColors];
        updateTileSize();
        updateGameBoardGrid();
        findAndDefineGroups(); // グループを初期化
        renderBoard();
    }

    // タイルサイズを更新
    function updateTileSize() {
        currentTileSize = window.innerWidth > 600 ? TILE_SIZE_DESKTOP : TILE_SIZE_MOBILE;
    }

    // game-boardのグリッドスタイルとサイズを更新
    function updateGameBoardGrid() {
        gameBoard.style.gridTemplateColumns = `repeat(${COLS}, ${currentTileSize}px)`;
        gameBoard.style.gridTemplateRows = `repeat(${ROWS}, ${currentTileSize}px)`;
        gameBoard.style.width = `${COLS * currentTileSize + COLS * 2}px`; // マスとボーダーを考慮
        gameBoard.style.height = `${ROWS * currentTileSize + ROWS * 2}px`; // マスとボーダーを考慮
    }

    // グループを探索し定義する関数
    function findAndDefineGroups() {
        groupMap.clear(); // クリア
        groups.clear();   // クリア

        let groupIdCounter = 0;
        let visited = new Set(); // 訪問済みのマスを記録

        for (let i = 0; i < COLS * ROWS; i++) {
            const colorId = boardState[i];
            if (colorId === 'empty' || visited.has(i)) {
                continue; // 空きマスか訪問済みならスキップ
            }

            // 新しいグループを見つけた
            const currentGroupId = `group_${groupIdCounter++}`;
            const groupTiles = [];
            const groupColor = colorId.split('_')[0]; // 色名だけ取得

            const queue = [i];
            visited.add(i);
            groupMap.set(i, currentGroupId);
            groupTiles.push(i);

            while (queue.length > 0) {
                const currentIndex = queue.shift();

                const neighbors = getNeighbors(currentIndex);
                for (const neighborIndex of neighbors) {
                    const neighborColorId = boardState[neighborIndex];
                    if (neighborColorId !== 'empty' &&
                        neighborColorId.split('_')[0] === groupColor && // 同じ色
                        !visited.has(neighborIndex)) {
                        visited.add(neighborIndex);
                        groupMap.set(neighborIndex, currentGroupId);
                        groupTiles.push(neighborIndex);
                        queue.push(neighborIndex);
                    }
                }
            }
            groups.set(currentGroupId, { color: groupColor, tiles: groupTiles });
        }
    }

    // 隣接するマスのインデックスを取得
    function getNeighbors(index) {
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        const neighbors = [];

        // 上
        if (row > 0) neighbors.push(index - COLS);
        // 下
        if (row < ROWS - 1) neighbors.push(index + COLS);
        // 左
        if (col > 0) neighbors.push(index - 1);
        // 右
        if (col < COLS - 1) neighbors.push(index + 1);

        return neighbors;
    }

    // ボードをHTMLにレンダリングする関数
    function renderBoard() {
        // 既存のタイル要素を更新または削除
        const existingTileElements = new Set(gameBoard.querySelectorAll('.tile:not(.empty-tile)'));
        tileElements.clear(); // マップをクリアして再構築

        // 空きマスの場所を可視化するため、グリッドをそのままレンダリング
        gameBoard.innerHTML = ''; // まず全てクリア
        for(let i = 0; i < COLS * ROWS; i++) {
            const emptyPlaceholder = document.createElement('div');
            emptyPlaceholder.classList.add('empty-tile-placeholder');
            emptyPlaceholder.style.width = `${currentTileSize}px`;
            emptyPlaceholder.style.height = `${currentTileSize}px`;
            emptyPlaceholder.style.border = '1px dashed #999';
            emptyPlaceholder.style.boxSizing = 'border-box';
            gameBoard.appendChild(emptyPlaceholder);
        }

        // グループに属するタイルを絶対配置でレンダリング
        groups.forEach((group, groupId) => {
            group.tiles.forEach(index => {
                let tile = document.getElementById(`tile-${index}`);
                if (!tile) {
                    tile = document.createElement('div');
                    tile.id = `tile-${index}`;
                    tile.classList.add('tile');
                    tile.addEventListener('click', handleTileClick);
                    gameBoard.appendChild(tile);
                }
                existingTileElements.delete(tile); // 既存要素としてマーク

                tile.dataset.index = index;
                tile.dataset.groupId = groupId;
                tile.className = 'tile'; // クラスをリセット
                tile.classList.add(`color-${group.color}`);

                // 位置を計算して設定
                const row = Math.floor(index / COLS);
                const col = index % COLS;
                tile.style.left = `${col * currentTileSize + col * 2}px`; // + col * 2 はボーダーの分
                tile.style.top = `${row * currentTileSize + row * 2}px`; // + row * 2 はボーダーの分

                tileElements.set(index, tile);
            });
        });

        // 存在しなくなったタイル要素を削除
        existingTileElements.forEach(tile => tile.remove());
    }

    // タイルがクリックされたときの処理
    function handleTileClick(event) {
        const clickedIndex = parseInt(event.target.dataset.index);
        const clickedGroupId = groupMap.get(clickedIndex);
        if (!clickedGroupId) return; // グループに属さないマス（ありえないはずだが念のため）

        const group = groups.get(clickedGroupId);
        if (!group) return; // グループが見つからない（ありえないはずだが念のため）

        const emptyIndex = boardState.findIndex(tile => tile === 'empty');
        if (emptyIndex === -1) return; // 空きマスがない場合は何もしない

        // グループ全体を動かす試み
        tryMoveGroup(group, emptyIndex);
    }

    // グループを移動させる試み
    function tryMoveGroup(group, emptyIndex) {
        const { tiles: groupTiles, color: groupColor } = group;

        // まず、空きマスが隣接しているグループ内のマスを探す
        let adjacentTileInGroup = -1;
        let moveDirection = null; // 'up', 'down', 'left', 'right'

        for (const tileIndex of groupTiles) {
            const row = Math.floor(tileIndex / COLS);
            const col = tileIndex % COLS;

            // 上のマスが空きか
            if (row > 0 && (tileIndex - COLS) === emptyIndex) {
                adjacentTileInGroup = tileIndex;
                moveDirection = 'up';
                break;
            }
            // 下のマスが空きか
            if (row < ROWS - 1 && (tileIndex + COLS) === emptyIndex) {
                adjacentTileInGroup = tileIndex;
                moveDirection = 'down';
                break;
            }
            // 左のマスが空きか
            if (col > 0 && (tileIndex - 1) === emptyIndex) {
                adjacentTileInGroup = tileIndex;
                moveDirection = 'left';
                break;
            }
            // 右のマスが空きか
            if (col < COLS - 1 && (tileIndex + 1) === emptyIndex) {
                adjacentTileInGroup = tileIndex;
                moveDirection = 'right';
                break;
            }
        }

        if (adjacentTileInGroup === -1) {
            return; // 空きマスと隣接しているグループのマスがない
        }

        // グループが移動する際に、他のグループと衝突しないか、またはボード外に出ないかをチェック
        const newPositions = groupTiles.map(index => {
            switch (moveDirection) {
                case 'up': return index - COLS;
                case 'down': return index + COLS;
                case 'left': return index - 1;
                case 'right': return index + 1;
                default: return index; // ありえない
            }
        });

        // 移動後の新しい位置が有効か（ボード内か、他のコマと重ならないか）をチェック
        // ただし、空きマスになる場所は除外する
        for (const newPos of newPositions) {
            if (newPos < 0 || newPos >= COLS * ROWS) {
                return; // ボード外に出てしまう
            }
            if (newPos !== emptyIndex && boardState[newPos] !== 'empty') {
                // 移動先が空きマスでもないのに他のコマがある場合は移動不可
                // ただし、同じグループの他のタイルが移動する場所は除く必要がある
                if (!groupTiles.includes(newPos)) { // 元々同じグループのタイルでない場合
                    return; // 他のコマと衝突する
                }
            }
        }

        // 全てのチェックをパスしたら、実際にボードの状態を更新
        // まず、現在のグループのマスをボードから削除（一時的に空きにする）
        groupTiles.forEach(index => {
            boardState[index] = 'empty';
        });

        // 空きマスだった場所をグループの色にする
        boardState[emptyIndex] = groupTiles[0]; // グループの色ID（代表）を入れる

        // グループの各タイルを新しい位置に移動
        const oldEmptyIndex = emptyIndex; // 移動前の空きマスの位置
        groupTiles.forEach((oldIndex, i) => {
            const newIndex = newPositions[i];
            boardState[newIndex] = initialBoardColors[oldIndex]; // 初期配置の色を新しい位置にコピー
            // groupMap も更新
            groupMap.set(newIndex, groupMap.get(oldIndex)); // 同じグループIDを保持
            groupMap.delete(oldIndex); // 古いインデックスを削除
        });

        // グループ内のタイルのインデックスを更新
        group.tiles = newPositions;

        // ボードの状態を完全に再計算し直す（重要！）
        // 特に複雑な形状のグループや、シャッフル後の移動で、
        // グループの形状や構成マスが動的に変わる可能性があるため。
        findAndDefineGroups();
        renderBoard(); // ボードを再描画
        // TODO: ゲームクリアの判定などをここに追加
    }

    // ボードをシャッフルする関数
    function shuffleBoard() {
        // グループ移動のシャッフルは非常に複雑になるため、ここでは単純なランダムシャッフルを行います。
        // 同じ色で隣接しているグループが崩れても良いと仮定します。
        // もしグループを維持したままシャッフルしたい場合は、
        // 複雑なアルゴリズム（空きマスとのスライド移動のみで到達可能な状態を維持しつつランダムに動かす）が必要です。
        let shuffledBoard = [...initialBoardColors];
        let emptyIndex = shuffledBoard.findIndex(tile => tile === 'empty');

        // Fisher-Yates shuffle (ただし空きマスは除く)
        for (let i = shuffledBoard.length - 1; i > 0; i--) {
            if (shuffledBoard[i] === 'empty') continue; // 空きマスはシャッフル対象外

            let j = Math.floor(Math.random() * (i + 1));
            while (shuffledBoard[j] === 'empty') { // シャッフル対象が空きマスなら再抽選
                j = Math.floor(Math.random() * (i + 1));
            }

            // スワップ
            [shuffledBoard[i], shuffledBoard[j]] = [shuffledBoard[j], shuffledBoard[i]];
        }
        
        // シャッフル後に空きマスの位置が変更されている可能性があるので再設定
        emptyIndex = shuffledBoard.findIndex(tile => tile === 'empty');
        if(emptyIndex === -1){ // もし空きマスが無くなっていたら（エラー回避）
            // ランダムに最後の要素を空きマスにするなど
            shuffledBoard[shuffledBoard.length - 1] = 'empty';
        }


        boardState = shuffledBoard;
        findAndDefineGroups(); // シャッフル後にグループを再定義
        renderBoard(); // ボードを再描画
    }

    // ウィンドウサイズ変更時にタイルサイズとボードサイズを更新
    window.addEventListener('resize', () => {
        updateTileSize();
        updateGameBoardGrid();
        renderBoard(); // 位置を再計算してレンダリング
    });

    // シャッフルボタンのイベントリスナー
    shuffleButton.addEventListener('click', shuffleBoard);

    // 最初にボードを初期化して表示
    initializeBoard();
});