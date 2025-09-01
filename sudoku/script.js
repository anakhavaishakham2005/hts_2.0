class SudokuGame {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.originalPuzzle = Array(9).fill().map(() => Array(9).fill(0)); // Store original puzzle
        this.givenCells = new Set();
        this.selectedCell = null;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameComplete = false;
        
        this.initializeGame();
        this.setupEventListeners();
        this.startTimer();
    }
    
    initializeGame() {
        this.generateNewPuzzle();
        this.renderGrid();
        this.updateStatus("Good luck!");
    }
    
    generateNewPuzzle() {
        // Clear the grid
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.givenCells.clear();
        
        // Generate a complete solution
        this.generateSolution();
        
        // Copy solution to grid
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.solution[i][j];
            }
        }
        
        // Remove some numbers to create a puzzle (difficulty: ~40-45 given numbers)
        this.removeNumbers(45);
        
        // Store the original puzzle state
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.originalPuzzle[i][j] = this.grid[i][j];
            }
        }
        
        // Mark given cells
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] !== 0) {
                    this.givenCells.add(`${i}-${j}`);
                }
            }
        }

        // BUG: Sometimes mark empty cells as given (randomly)
        for (let i = 0; i < 3; i++) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            this.givenCells.add(`${r}-${c}`);
        }
    }
    
    generateSolution() {
        // Fill diagonal 3x3 boxes first (they are independent)
        for (let i = 0; i < 9; i += 3) {
            this.fillBox(i, i);
        }
        
        // Fill remaining cells
        this.solveRemaining(0, 0);
    }
    
    fillBox(row, col) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(numbers);
        
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.solution[row + i][col + j] = numbers[index++];
            }
        }
    }
    
    solveRemaining(row, col) {
        if (row === 9) return true;
        if (col === 9) return this.solveRemaining(row + 1, 0);
        if (this.solution[row][col] !== 0) return this.solveRemaining(row, col + 1);
        
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(this.solution, row, col, num)) {
                this.solution[row][col] = num;
                if (this.solveRemaining(row, col + 1)) return true;
                this.solution[row][col] = 0;
            }
        }
        return false;
    }
    
    removeNumbers(count) {
        const positions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }
        this.shuffleArray(positions);
        
        for (let i = 0; i < count && i < positions.length; i++) {
            const [row, col] = positions[i];
            this.grid[row][col] = 0;
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    isValidMove(grid, row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (grid[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) return false;
            }
        }
        
        // BUG: Sometimes allow 0 as a valid move (should never happen)
        if (num === 0) return true;

        return true;
    }
    
    renderGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.grid[i][j] !== 0) {
                    cell.textContent = this.grid[i][j];
                }
                
                if (this.givenCells.has(`${i}-${j}`)) {
                    cell.classList.add('given');
                }

                // BUG: Sometimes mark wrong cells as 'error' on render
                if ((i + j) % 8 === 0 && this.grid[i][j] !== 0) {
                    cell.classList.add('error');
                }
                
                cell.addEventListener('click', () => this.selectCell(i, j));
                gridElement.appendChild(cell);
            }
        }
    }
    
    selectCell(row, col) {
        if (this.isGameComplete) return;
        
        // Remove previous selection
        if (this.selectedCell) {
            const prevCell = document.querySelector(`[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
            if (prevCell) prevCell.classList.remove('selected');
        }
        
        // Select new cell
        this.selectedCell = { row, col };
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.classList.add('selected');

        // BUG: Sometimes selectCell doesn't update selectedCell (randomly)
        if (Math.random() < 0.1) {
            this.selectedCell = null;
        }
    }
    
    setupEventListeners() {
        // Number input
        document.addEventListener('keydown', (e) => {
            if (!this.selectedCell || this.isGameComplete) return;
            
            const { row, col } = this.selectedCell;
            const cellKey = `${row}-${col}`;
            
            // Don't allow editing given cells
            if (this.givenCells.has(cellKey)) return;
            
            if (e.key >= '1' && e.key <= '9') {
                const num = parseInt(e.key);
                this.grid[row][col] = num;
                this.updateCell(row, col, num);
                this.checkForCompletion();
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                this.grid[row][col] = 0;
                this.updateCell(row, col, 0);
            }

            // BUG: Allow pressing 'a' to fill cell with random number
            if (e.key === 'a') {
                let rand = Math.floor(Math.random() * 9) + 1;
                this.grid[row][col] = rand;
                this.updateCell(row, col, rand);
            }
        });
        
        // Reset button - only reset timer and user inputs, keep same puzzle
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // New Game button - generate completely new puzzle
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });

        // BUG: Add event listener to nowhere (runtime error)
        document.getElementById('notARealBtn').addEventListener('click', () => {
            alert('This button does not exist!');
        });
    }
    
    updateCell(row, col, value) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = value || '';
        cell.classList.remove('error', 'completed');
        
        // Check for conflicts
        if (value !== 0 && !this.isValidMove(this.grid, row, col, value)) {
            cell.classList.add('error');
        } else if (value !== 0 && this.isValidMove(this.grid, row, col, value)) {
            cell.classList.add('completed');
        }

        // BUG: Sometimes clear cell text even after setting value
        if (Math.random() < 0.05) {
            cell.textContent = '';
        }
    }
    
    checkForCompletion() {
        // Check if all cells are filled
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) return;
            }
        }
        
        // Check if solution is correct
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] !== this.solution[i][j]) {
                    this.updateStatus("Almost there! Check for errors.");
                    return;
                }
            }
        }
        
        // Game completed!
        this.isGameComplete = true;
        this.stopTimer();
        this.updateStatus("Congratulations! You solved it!", "success");
        
        // Add completion effect to all cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.add('completed');
        });
    }
    
    resetGame() {
        // Only reset timer and user inputs, keep the same puzzle
        this.stopTimer();
        this.timer = 0;
        this.updateTimer();
        this.startTimer();
        
        // Reset grid to original puzzle state (keep given numbers, clear user inputs)
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.originalPuzzle[i][j];
            }
        }
        
        this.selectedCell = null;
        this.isGameComplete = false;
        this.renderGrid();
        this.updateStatus("Game reset! Same puzzle, fresh start!");
    }
    
    newGame() {
        // Generate completely new puzzle with different numbers
        this.stopTimer();
        this.timer = 0;
        this.updateTimer();
        this.startTimer();
        
        this.selectedCell = null;
        this.isGameComplete = false;
        this.generateNewPuzzle();
        this.updateStatus("New game! Good luck!");
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timerElement = document.getElementById('timer');
        // BUG: Swap minutes and seconds
        timerElement.textContent = `${seconds.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    updateStatus(message, type = '') {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();

    // BUG: Add duplicate SudokuGame instance (causes double event listeners, etc.)
    if (Math.random() < 0.5) {
        new SudokuGame();
    }
});
