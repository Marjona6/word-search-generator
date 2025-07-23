/**
 * Word Search Generator - Dynamic Module Loader
 * Loads modules dynamically without requiring a server
 */

class ModuleLoader {
  constructor() {
    this.modules = {};
    this.loadedModules = new Set();
  }

  async loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return this.modules[moduleName];
    }

    const moduleMap = {
      InputManager: () => this.createInputManager(),
      PuzzleEngine: () => this.createPuzzleEngine(),
      UIManager: () => this.createUIManager(),
      RenderingManager: () => this.createRenderingManager(),
      ExportManager: () => this.createExportManager(),
      DebugManager: () => this.createDebugManager(),
    };

    if (moduleMap[moduleName]) {
      const module = moduleMap[moduleName]();
      this.modules[moduleName] = module;
      this.loadedModules.add(moduleName);
      return module;
    }

    throw new Error(`Module ${moduleName} not found`);
  }

  // Module definitions
  createInputManager() {
    return {
      initialize() {
        this.elements = {
          puzzleName: document.getElementById("puzzleName"),
          wordList: document.getElementById("wordList"),
          puzzleSize: document.getElementById("puzzleSize"),
          horizontal: document.getElementById("horizontal"),
          vertical: document.getElementById("vertical"),
          diagonal: document.getElementById("diagonal"),
          reverse: document.getElementById("reverse"),
          showGridLines: document.getElementById("showGridLines"),
          showGridBorder: document.getElementById("showGridBorder"),
          outlineFoundWords: document.getElementById("outlineFoundWords"),
          colorFoundWords: document.getElementById("colorFoundWords"),
          hideOtherSolutionLetters: document.getElementById("hideOtherSolutionLetters"),
        };
      },

      getWordList() {
        const wordListText = this.elements.wordList.value.trim();
        if (!wordListText) return [];

        return wordListText
          .split("\n")
          .map((word) => word.trim())
          .filter((word) => word.length > 0)
          .map((word) => word.toUpperCase());
      },

      getPuzzleSize() {
        return this.elements.puzzleSize.value;
      },

      getSelectedDirections() {
        const directions = [];
        if (this.elements.horizontal.checked) directions.push("horizontal");
        if (this.elements.vertical.checked) directions.push("vertical");
        if (this.elements.diagonal.checked) directions.push("diagonal");
        if (this.elements.reverse.checked) directions.push("reverse");
        return directions;
      },

      getGridLinesPreference() {
        return this.elements.showGridLines.checked;
      },

      getOutlineWordsPreference() {
        return this.elements.outlineFoundWords.checked;
      },

      getSolutionDisplayOptions() {
        return {
          outlineWords: this.getOutlineWordsPreference(),
          colorWords: this.elements.colorFoundWords.checked,
          hideOtherLetters: this.elements.hideOtherSolutionLetters.checked,
        };
      },

      validateInput(words, size, directions) {
        if (!words || words.length === 0) {
          this.showError("Please enter at least one word.");
          return false;
        }

        const maxWordLength = Math.max(...words.map((word) => word.length));
        if (maxWordLength > size) {
          this.showError(`The longest word (${maxWordLength} letters) is longer than the grid size (${size}). Please increase the grid size or use shorter words.`);
          return false;
        }

        if (directions.length === 0) {
          this.showError("Please select at least one direction for word placement.");
          return false;
        }

        return true;
      },

      showError(message) {
        const errorElement = document.getElementById("errorMessage");
        if (errorElement) {
          errorElement.textContent = message;
          errorElement.style.display = "block";
        }
      },

      hideError() {
        const errorElement = document.getElementById("errorMessage");
        if (errorElement) {
          errorElement.style.display = "none";
        }
      },
    };
  }

  createPuzzleEngine() {
    return {
      createPuzzle(words, size, directions) {
        try {
          const result = this.createWordSearch(words, size, directions);

          if (result.success) {
            return {
              success: true,
              puzzle: result.puzzle,
              solution: result.solution,
              placedWordInfos: result.placedWordInfos,
            };
          } else {
            return {
              success: false,
              error: result.error,
            };
          }
        } catch (error) {
          console.error("Error creating puzzle:", error);
          return {
            success: false,
            error: "An unexpected error occurred while creating the puzzle",
          };
        }
      },

      createWordSearch(words, size, directions) {
        const directionVectors = this.getDirectionVectors(directions);

        if (directionVectors.length === 0) {
          return { success: false, error: "No valid directions selected" };
        }

        for (let attempt = 0; attempt < 1000; attempt++) {
          const grid = this.createEmptyGrid(size);
          const solution = this.createEmptyGrid(size);
          const placedWordInfos = [];
          let allWordsPlaced = true;

          const shuffledWords = this.shuffleArray([...words]);

          for (const word of shuffledWords) {
            const placementResult = this.placeWordSmart(grid, solution, word, directionVectors);

            if (placementResult.success) {
              placedWordInfos.push(placementResult.info);
            } else {
              allWordsPlaced = false;
              break;
            }
          }

          if (allWordsPlaced) {
            this.fillRemainingCells(grid);

            return {
              success: true,
              puzzle: grid,
              solution: solution,
              placedWordInfos: placedWordInfos,
            };
          }
        }

        return {
          success: false,
          error: `Could not place all words after 1000 attempts. Try increasing the grid size or reducing the number of words.`,
        };
      },

      createEmptyGrid(size) {
        const grid = [];
        for (let i = 0; i < size; i++) {
          grid[i] = [];
          for (let j = 0; j < size; j++) {
            grid[i][j] = "";
          }
        }
        return grid;
      },

      fillRemainingCells(grid) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === "") {
              grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
            }
          }
        }
      },

      placeWordSmart(grid, solution, word, directionVectors) {
        const size = grid.length;
        const bestPlacements = [];

        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            for (const direction of directionVectors) {
              if (this.canPlaceWord(grid, word, row, col, direction)) {
                const score = this.calculateSpacingScore(grid, word, row, col, direction);
                bestPlacements.push({ row, col, direction, score });
              }
            }
          }
        }

        if (bestPlacements.length === 0) {
          return { success: false };
        }

        bestPlacements.sort((a, b) => b.score - a.score);
        const best = bestPlacements[0];

        this.placeWordAt(grid, solution, word, best.row, best.col, best.direction);

        return {
          success: true,
          info: {
            word: word,
            startRow: best.row,
            startCol: best.col,
            dRow: best.direction[0],
            dCol: best.direction[1],
            length: word.length,
          },
        };
      },

      canPlaceWord(grid, word, startRow, startCol, direction) {
        const [dRow, dCol] = direction;
        const size = grid.length;

        const endRow = startRow + (word.length - 1) * dRow;
        const endCol = startCol + (word.length - 1) * dCol;

        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
          return false;
        }

        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * dRow;
          const col = startCol + i * dCol;
          const cell = grid[row][col];

          if (cell !== "" && cell !== word[i]) {
            return false;
          }
        }

        return true;
      },

      calculateSpacingScore(grid, word, startRow, startCol, direction) {
        const [dRow, dCol] = direction;
        let score = 0;

        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * dRow;
          const col = startCol + i * dCol;
          const cell = grid[row][col];

          if (cell === word[i]) {
            score += 10;
          } else if (cell === "") {
            score += 1;
          }
        }

        return score;
      },

      placeWordAt(grid, solution, word, startRow, startCol, direction) {
        const [dRow, dCol] = direction;

        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * dRow;
          const col = startCol + i * dCol;

          grid[row][col] = word[i];
          solution[row][col] = word[i];
        }
      },

      getDirectionVectors(directions) {
        const directionMap = {
          horizontal: [0, 1],
          vertical: [1, 0],
          diagonal: [1, 1],
          reverse: [-1, -1],
        };

        const vectors = [];

        for (const direction of directions) {
          if (directionMap[direction]) {
            vectors.push(directionMap[direction]);
          }
        }

        return vectors;
      },

      shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      },
    };
  }

  createUIManager() {
    return {
      initialize() {
        this.elements = {
          generateBtn: document.getElementById("generateBtn"),
          toggleSolutionBtn: document.getElementById("toggleSolution"),
          printBtn: document.getElementById("printBtn"),
          downloadBtn: document.getElementById("downloadBtn"),
          outputSection: document.getElementById("outputSection"),
          wordListDisplay: document.getElementById("wordListDisplay"),
          puzzleGrid: document.getElementById("puzzleGrid"),
          solutionGrid: document.getElementById("solutionGrid"),
          errorMessage: document.getElementById("errorMessage"),
        };
      },

      bindEvents(handlers) {
        this.eventHandlers = handlers;

        if (this.elements.generateBtn) {
          this.elements.generateBtn.addEventListener("click", handlers.generate);
        }

        if (this.elements.toggleSolutionBtn) {
          this.elements.toggleSolutionBtn.addEventListener("click", handlers.toggleSolution);
        }

        if (this.elements.printBtn) {
          this.elements.printBtn.addEventListener("click", handlers.print);
        }

        if (this.elements.downloadBtn) {
          this.elements.downloadBtn.addEventListener("click", handlers.download);
        }

        this.bindCheckboxEvents();
      },

      bindCheckboxEvents() {
        const outlineCheckbox = document.getElementById("outlineFoundWords");
        const colorCheckbox = document.getElementById("colorFoundWords");
        const hideOtherCheckbox = document.getElementById("hideOtherSolutionLetters");
        const gridBorderCheckbox = document.getElementById("showGridBorder");

        if (outlineCheckbox && this.eventHandlers.outlineWords) {
          outlineCheckbox.addEventListener("change", this.eventHandlers.outlineWords);
        }

        if (colorCheckbox && this.eventHandlers.colorWords) {
          colorCheckbox.addEventListener("change", this.eventHandlers.colorWords);
        }

        if (hideOtherCheckbox && this.eventHandlers.hideOtherLetters) {
          hideOtherCheckbox.addEventListener("change", this.eventHandlers.hideOtherLetters);
        }

        if (gridBorderCheckbox && this.eventHandlers.gridBorder) {
          gridBorderCheckbox.addEventListener("change", this.eventHandlers.gridBorder);
        }
      },

      showLoading() {
        if (this.elements.generateBtn) {
          this.elements.generateBtn.disabled = true;
          this.elements.generateBtn.textContent = "Generating...";
        }
      },

      hideLoading() {
        if (this.elements.generateBtn) {
          this.elements.generateBtn.disabled = false;
          this.elements.generateBtn.textContent = "Generate Puzzle";
        }
      },

      showOutput() {
        if (this.elements.outputSection) {
          this.elements.outputSection.style.display = "block";
        }
      },

      showError(message) {
        if (this.elements.errorMessage) {
          this.elements.errorMessage.textContent = message;
          this.elements.errorMessage.style.display = "block";
        }
      },

      hideError() {
        if (this.elements.errorMessage) {
          this.elements.errorMessage.style.display = "none";
        }
      },

      updateWordListDisplay(words) {
        if (this.elements.wordListDisplay) {
          this.elements.wordListDisplay.innerHTML = words.map((word) => `<span class="word-item">${word}</span>`).join("");
        }
      },

      toggleSolutionVisibility() {
        if (this.elements.solutionGrid) {
          const isHidden = this.elements.solutionGrid.classList.contains("hidden");

          if (isHidden) {
            this.elements.solutionGrid.classList.remove("hidden");
            if (this.elements.toggleSolutionBtn) {
              this.elements.toggleSolutionBtn.textContent = "Hide Solution";
            }
          } else {
            this.elements.solutionGrid.classList.add("hidden");
            if (this.elements.toggleSolutionBtn) {
              this.elements.toggleSolutionBtn.textContent = "Show Solution";
            }
          }
        }
      },
    };
  }

  createRenderingManager() {
    return {
      renderPuzzleGrid(grid, showGridLines) {
        const container = document.getElementById("puzzleGrid");
        if (container) {
          this.renderGrid(container, grid, "", false, showGridLines);
        }
      },

      renderSolutionGrid(solution, words, placedWordInfos, options) {
        const container = document.getElementById("solutionGrid");
        if (container) {
          this.renderGrid(container, solution, "", true, true);
          this.applySolutionDisplayOptions(container, solution, words, placedWordInfos, options);
        }
      },

      renderGrid(container, grid, cellClass = "", isSolution = false, showGridLines = true) {
        if (!container || !grid) return;

        container.innerHTML = "";

        const table = document.createElement("table");

        if (showGridLines) {
          table.style.borderCollapse = "collapse";
          table.style.border = "1px solid #ccc";
        } else {
          table.style.borderCollapse = "collapse";
          table.style.border = "none";
        }

        for (let row = 0; row < grid.length; row++) {
          const tr = document.createElement("tr");

          for (let col = 0; col < grid[row].length; col++) {
            const td = document.createElement("td");
            const cellContent = grid[row][col] || "&nbsp;";

            td.innerHTML = cellContent;
            td.className = cellClass;

            this.applyCellStyling(td, showGridLines, isSolution);

            tr.appendChild(td);
          }

          table.appendChild(tr);
        }

        container.appendChild(table);
      },

      applyCellStyling(cell, showGridLines, isSolution) {
        cell.style.padding = "8px";
        cell.style.textAlign = "center";
        cell.style.fontWeight = "bold";
        cell.style.fontSize = "16px";
        cell.style.minWidth = "30px";
        cell.style.minHeight = "30px";

        if (showGridLines) {
          cell.style.border = "1px solid #ccc";
        } else {
          cell.style.border = "none";
        }

        if (isSolution) {
          cell.style.backgroundColor = "#f9f9f9";
        }
      },

      applySolutionDisplayOptions(container, solution, words, placedWordInfos, options) {
        const table = container.querySelector("table");
        if (!table) return;

        this.clearOverlays(table);

        if (options.colorWords) {
          this.highlightFoundWords(table, placedWordInfos);
        }

        if (options.outlineWords) {
          this.renderAllCapsulesWithViewBox(container, table, placedWordInfos);
        }

        if (options.hideOtherLetters) {
          this.hideOtherLetters(table, placedWordInfos);
        }
      },

      renderAllCapsulesWithViewBox(container, table, placedWordInfos) {
        if (!container || !table || !placedWordInfos) return;

        const rect = table.getBoundingClientRect();
        const actualCellWidth = rect.width / table.rows[0].cells.length;
        const actualCellHeight = rect.height / table.rows.length;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", rect.width);
        svg.setAttribute("height", rect.height);
        svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.pointerEvents = "none";
        svg.classList.add("capsule-canvas-overlay");
        svg.style.zIndex = 10;

        console.log(`Processing ${placedWordInfos.length} words for capsules`);

        for (const info of placedWordInfos) {
          const { startRow, startCol, dRow, dCol, length } = info;
          const endRow = startRow + (length - 1) * dRow;
          const endCol = startCol + (length - 1) * dCol;

          const startX = startCol * actualCellWidth + actualCellWidth / 2;
          const startY = startRow * actualCellHeight + actualCellHeight / 2;
          const endX = endCol * actualCellWidth + actualCellWidth / 2;
          const endY = endRow * actualCellHeight + actualCellHeight / 2;

          const isHorizontal = dRow === 0 && dCol !== 0;
          const isVertical = dCol === 0 && dRow !== 0;
          const isDiagonal = Math.abs(dRow) === 1 && Math.abs(dCol) === 1;
          const wordType = isHorizontal ? "HORIZONTAL" : isVertical ? "VERTICAL" : isDiagonal ? "DIAGONAL" : "OTHER";

          console.log(`Word "${info.word}" (${wordType}): start(${startCol},${startRow}) end(${endCol},${endRow})`);

          const extension = actualCellHeight * 0.4;
          const dx = endX - startX;
          const dy = endY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const capsuleLength = dist + extension * 2;
          const capsuleWidth = actualCellHeight * 0.7;
          const radius = capsuleWidth / 2;

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

          const halfLength = capsuleLength / 2;
          const centerX = (startX + endX) / 2;
          const centerY = (startY + endY) / 2;

          const pathData = [`M ${centerX - halfLength + radius} ${centerY - radius}`, `L ${centerX + halfLength - radius} ${centerY - radius}`, `A ${radius} ${radius} 0 0 1 ${centerX + halfLength - radius} ${centerY + radius}`, `L ${centerX - halfLength + radius} ${centerY + radius}`, `A ${radius} ${radius} 0 0 1 ${centerX - halfLength + radius} ${centerY - radius}`, "Z"].join(" ");

          path.setAttribute("d", pathData);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", "#000");
          path.setAttribute("stroke-width", actualCellHeight * 0.15);
          path.setAttribute("opacity", "0.85");
          path.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);
          svg.appendChild(path);

          console.log(`  Added capsule for "${info.word}" (${wordType})`);
        }

        table.style.position = "relative";
        table.appendChild(svg);

        console.log("Added unified SVG with viewBox for ALL capsules");
      },

      clearOverlays(table) {
        const overlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
        overlays.forEach((overlay) => overlay.remove());
      },

      highlightFoundWords(table, placedWordInfos) {
        for (const info of placedWordInfos) {
          const { startRow, startCol, dRow, dCol, length } = info;

          for (let i = 0; i < length; i++) {
            const row = startRow + i * dRow;
            const col = startCol + i * dCol;

            const cell = table.rows[row]?.cells[col];
            if (cell) {
              cell.classList.add("found-word");
            }
          }
        }
      },

      hideOtherLetters(table, placedWordInfos) {
        const size = table.rows.length;
        const foundCells = new Set();

        for (const info of placedWordInfos) {
          const { startRow, startCol, dRow, dCol, length } = info;

          for (let i = 0; i < length; i++) {
            const row = startRow + i * dRow;
            const col = startCol + i * dCol;
            foundCells.add(`${row},${col}`);
          }
        }

        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            const cell = table.rows[row]?.cells[col];
            if (cell && !foundCells.has(`${row},${col}`)) {
              cell.style.color = "#ccc";
            }
          }
        }
      },

      updateSolutionDisplay(solution, placedWordInfos, options) {
        const container = document.getElementById("solutionGrid");
        if (container) {
          this.applySolutionDisplayOptions(container, solution, [], placedWordInfos, options);
        }
      },

      updateGridBorders(showBorder) {
        const puzzleTable = document.querySelector("#puzzleGrid table");
        const solutionTable = document.querySelector("#solutionGrid table");

        [puzzleTable, solutionTable].forEach((table) => {
          if (table) {
            if (showBorder) {
              table.style.border = "2px solid #333";
            } else {
              table.style.border = "none";
            }
          }
        });
      },

      renderAllCapsulesForPrint(placedWordInfos) {
        const container = document.getElementById("solutionGrid");
        const table = container?.querySelector("table");

        if (container && table) {
          this.clearOverlays(table);
          this.renderAllCapsulesWithViewBox(container, table, placedWordInfos);
        }
      },
    };
  }

  createExportManager() {
    return {
      printPuzzle(puzzle, solution, placedWordInfos, outlineWords) {
        console.log("printPuzzle called");

        if (!puzzle || !solution) {
          console.error("No puzzle or solution to print");
          return;
        }

        const solutionGrid = document.getElementById("solutionGrid");
        if (solutionGrid && solutionGrid.classList.contains("hidden")) {
          console.log("Solution was hidden, showing it for print");
          solutionGrid.classList.remove("hidden");
        }

        if (outlineWords) {
          console.log("Force rendering ALL capsules for print");

          const existingOverlays = solutionGrid.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
          existingOverlays.forEach((overlay) => overlay.remove());

          setTimeout(() => {
            const table = solutionGrid.querySelector("table");
            if (table) {
              console.log("Rendering ALL capsules with viewBox for print");
              this.renderAllCapsulesForPrint(placedWordInfos);

              setTimeout(() => {
                console.log("Calling window.print()");
                window.print();
              }, 500);
            } else {
              console.log("No table found for print");
              window.print();
            }
          }, 100);
        } else {
          console.log("Calling window.print()");
          window.print();
        }
      },

      downloadPDF(puzzle, solution, placedWordInfos, preferences) {
        console.log("Download button clicked");
        alert("PDF download functionality would be implemented here. This would use a library like jsPDF to generate a PDF with the puzzle and solution.");
      },

      handlePrintMode(outlineWords, renderCapsulesCallback) {
        console.log("Handling print mode");

        const mediaQuery = window.matchMedia("print");

        const handlePrintChange = (e) => {
          if (e.matches) {
            console.log("Print mode detected - ensuring ALL overlays are visible");
            if (outlineWords) {
              setTimeout(() => {
                const solutionGrid = document.getElementById("solutionGrid");
                const table = solutionGrid?.querySelector("table");
                if (table) {
                  renderCapsulesCallback();
                }
              }, 100);
            }
          }
        };

        mediaQuery.addListener(handlePrintChange);

        window.addEventListener("beforeprint", () => {
          console.log("beforeprint event fired - rendering ALL capsules");
          if (outlineWords) {
            setTimeout(() => {
              const solutionGrid = document.getElementById("solutionGrid");
              const table = solutionGrid?.querySelector("table");
              if (table) {
                renderCapsulesCallback();
              }
            }, 100);
          }
        });
      },

      renderAllCapsulesForPrint(placedWordInfos) {
        const solutionGrid = document.getElementById("solutionGrid");
        const table = solutionGrid?.querySelector("table");

        if (solutionGrid && table) {
          const existingOverlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
          existingOverlays.forEach((overlay) => overlay.remove());

          this.renderAllCapsulesWithViewBox(solutionGrid, table, placedWordInfos);
        }
      },

      renderAllCapsulesWithViewBox(container, table, placedWordInfos) {
        if (!container || !table || !placedWordInfos) return;

        const rect = table.getBoundingClientRect();
        const actualCellWidth = rect.width / table.rows[0].cells.length;
        const actualCellHeight = rect.height / table.rows.length;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", rect.width);
        svg.setAttribute("height", rect.height);
        svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.pointerEvents = "none";
        svg.classList.add("capsule-canvas-overlay");
        svg.style.zIndex = 10;

        for (const info of placedWordInfos) {
          const { startRow, startCol, dRow, dCol, length } = info;
          const endRow = startRow + (length - 1) * dRow;
          const endCol = startCol + (length - 1) * dCol;

          const startX = startCol * actualCellWidth + actualCellWidth / 2;
          const startY = startRow * actualCellHeight + actualCellHeight / 2;
          const endX = endCol * actualCellWidth + actualCellWidth / 2;
          const endY = endRow * actualCellHeight + actualCellHeight / 2;

          const extension = actualCellHeight * 0.4;
          const dx = endX - startX;
          const dy = endY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const capsuleLength = dist + extension * 2;
          const capsuleWidth = actualCellHeight * 0.7;
          const radius = capsuleWidth / 2;

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

          const halfLength = capsuleLength / 2;
          const centerX = (startX + endX) / 2;
          const centerY = (startY + endY) / 2;

          const pathData = [`M ${centerX - halfLength + radius} ${centerY - radius}`, `L ${centerX + halfLength - radius} ${centerY - radius}`, `A ${radius} ${radius} 0 0 1 ${centerX + halfLength - radius} ${centerY + radius}`, `L ${centerX - halfLength + radius} ${centerY + radius}`, `A ${radius} ${radius} 0 0 1 ${centerX - halfLength + radius} ${centerY - radius}`, "Z"].join(" ");

          path.setAttribute("d", pathData);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", "#000");
          path.setAttribute("stroke-width", actualCellHeight * 0.15);
          path.setAttribute("opacity", "0.85");
          path.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);
          svg.appendChild(path);
        }

        table.style.position = "relative";
        table.appendChild(svg);
      },
    };
  }

  createDebugManager() {
    return {
      initialize() {
        this.exposeDebugMethods();
      },

      exposeDebugMethods() {
        window.debugPrintCapsules = () => this.debugPrintCapsules();
        window.testAllCapsules = () => this.testAllCapsules();
        window.testPrintCapsules = () => this.testPrintCapsules();
        window.debugPositioning = () => this.debugPositioning();
        window.forceRenderCapsules = () => this.forceRenderCapsules();
      },

      debugPrintCapsules() {
        console.log("=== DEBUG PRINT CAPSULES ===");

        const outlineCheckbox = document.getElementById("outlineFoundWords");
        const solutionGrid = document.getElementById("solutionGrid");

        console.log("Outline checkbox checked:", outlineCheckbox?.checked);
        console.log("Solution grid hidden:", solutionGrid?.classList.contains("hidden"));

        if (window.generator) {
          console.log("Placed word infos:", window.generator.placedWordInfos);
        }

        const table = solutionGrid?.querySelector("table");
        console.log("Table found:", !!table);

        if (table) {
          console.log("Table dimensions:", table.offsetWidth, "x", table.offsetHeight);
          const overlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
          console.log("Existing overlays:", overlays.length);
        }

        if (solutionGrid?.classList.contains("hidden")) {
          solutionGrid.classList.remove("hidden");
        }

        if (table && window.generator) {
          console.log("Rendering ALL capsules...");
          window.generator.renderingManager.renderAllCapsulesForPrint(window.generator.placedWordInfos);

          setTimeout(() => {
            const newOverlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
            console.log("Overlays after rendering:", newOverlays.length);
            console.log("=== END DEBUG ===");
          }, 100);
        }
      },

      testAllCapsules() {
        if (!window.generator) {
          console.error("Generator not available");
          return;
        }

        console.log("Testing ALL capsule rendering...");
        console.log("Placed word infos:", window.generator.placedWordInfos);

        const horizontalWords = window.generator.placedWordInfos.filter((info) => info.dRow === 0 || info.dCol === 0);
        const diagonalWords = window.generator.placedWordInfos.filter((info) => Math.abs(info.dRow) === 1 && Math.abs(info.dCol) === 1);

        console.log("Horizontal/Vertical words:", horizontalWords.length);
        console.log("Diagonal words:", diagonalWords.length);
        console.log("Total words:", window.generator.placedWordInfos.length);

        const solutionGrid = document.getElementById("solutionGrid");
        if (solutionGrid?.style.display === "none") {
          window.generator.toggleSolution();
        }

        const table = solutionGrid?.querySelector("table");
        if (table) {
          window.generator.renderingManager.renderAllCapsulesForPrint(window.generator.placedWordInfos);
        }

        console.log("All capsules should now be visible!");
      },

      testPrintCapsules() {
        if (!window.generator) {
          console.error("Generator not available");
          return;
        }

        console.log("Testing print capsules...");

        const solutionGrid = document.getElementById("solutionGrid");
        if (solutionGrid?.classList.contains("hidden")) {
          solutionGrid.classList.remove("hidden");
        }

        const table = solutionGrid?.querySelector("table");
        if (table) {
          window.generator.renderingManager.renderAllCapsulesForPrint(window.generator.placedWordInfos);
        }

        console.log("Print capsules rendered!");
      },

      debugPositioning() {
        console.log("=== DEBUG POSITIONING ===");

        const solutionGrid = document.getElementById("solutionGrid");
        const table = solutionGrid?.querySelector("table");

        if (table) {
          const rect = table.getBoundingClientRect();
          console.log("Table bounding rect:", rect);
          console.log("Table offset dimensions:", table.offsetWidth, "x", table.offsetHeight);
          console.log("Table client dimensions:", table.clientWidth, "x", table.clientHeight);

          const cellWidth = rect.width / table.rows[0].cells.length;
          const cellHeight = rect.height / table.rows.length;
          console.log("Calculated cell dimensions:", cellWidth, "x", cellHeight);
        }

        console.log("=== END DEBUG ===");
      },

      forceRenderCapsules() {
        if (!window.generator) {
          console.error("Generator not available");
          return;
        }

        console.log("Force rendering capsules...");
        window.generator.renderingManager.forceRenderCapsules(window.generator.placedWordInfos);
        console.log("Capsules force rendered!");
      },
    };
  }
}

// Main WordSearchGenerator class
class WordSearchGenerator {
  constructor() {
    this.moduleLoader = new ModuleLoader();
    this.currentPuzzle = null;
    this.currentSolution = null;
    this.placedWordInfos = [];
  }

  async initialize() {
    // Load all modules
    this.inputManager = await this.moduleLoader.loadModule("InputManager");
    this.puzzleEngine = await this.moduleLoader.loadModule("PuzzleEngine");
    this.uiManager = await this.moduleLoader.loadModule("UIManager");
    this.renderingManager = await this.moduleLoader.loadModule("RenderingManager");
    this.exportManager = await this.moduleLoader.loadModule("ExportManager");
    this.debugManager = await this.moduleLoader.loadModule("DebugManager");

    // Initialize modules
    this.inputManager.initialize();
    this.uiManager.initialize();
    this.debugManager.initialize();

    this.bindEvents();
    this.handlePrintMode();
  }

  bindEvents() {
    this.uiManager.bindEvents({
      generate: () => this.generatePuzzle(),
      toggleSolution: () => this.toggleSolution(),
      print: () => this.printPuzzle(),
      download: () => this.downloadPDF(),
      outlineWords: () => this.updateSolutionDisplay(),
      colorWords: () => this.updateSolutionDisplay(),
      hideOtherLetters: () => this.updateSolutionDisplay(),
      gridBorder: () => this.updateGridBorders(),
    });
  }

  async generatePuzzle() {
    try {
      this.uiManager.hideError();
      this.uiManager.showLoading();

      const words = this.inputManager.getWordList();
      const size = parseInt(this.inputManager.getPuzzleSize());
      const directions = this.inputManager.getSelectedDirections();

      if (!this.inputManager.validateInput(words, size, directions)) {
        return;
      }

      const result = this.puzzleEngine.createPuzzle(words, size, directions);

      if (result.success) {
        this.currentPuzzle = result.puzzle;
        this.currentSolution = result.solution;
        this.placedWordInfos = result.placedWordInfos;

        this.displayPuzzle(result.puzzle, result.solution, words);
        this.uiManager.showOutput();
      } else {
        this.uiManager.showError(result.error || "Failed to generate puzzle");
      }
    } catch (error) {
      console.error("Error generating puzzle:", error);
      this.uiManager.showError("An unexpected error occurred while generating the puzzle");
    } finally {
      this.uiManager.hideLoading();
    }
  }

  displayPuzzle(puzzle, solution, words) {
    this.uiManager.updateWordListDisplay(words);
    this.renderingManager.renderPuzzleGrid(puzzle, this.inputManager.getGridLinesPreference());
    this.renderingManager.renderSolutionGrid(solution, words, this.placedWordInfos, this.inputManager.getSolutionDisplayOptions());
    this.updateGridBorders();
  }

  toggleSolution() {
    this.uiManager.toggleSolutionVisibility();
    this.updateSolutionDisplay();
  }

  updateSolutionDisplay() {
    if (this.currentSolution) {
      this.renderingManager.updateSolutionDisplay(this.currentSolution, this.placedWordInfos, this.inputManager.getSolutionDisplayOptions());
    }
  }

  updateGridBorders() {
    this.renderingManager.updateGridBorders(this.inputManager.getGridBorderPreference());
  }

  printPuzzle() {
    this.exportManager.printPuzzle(this.currentPuzzle, this.currentSolution, this.placedWordInfos, this.inputManager.getOutlineWordsPreference());
  }

  downloadPDF() {
    this.exportManager.downloadPDF(this.currentPuzzle, this.currentSolution, this.placedWordInfos, this.inputManager.getAllPreferences());
  }

  handlePrintMode() {
    this.exportManager.handlePrintMode(this.inputManager.getOutlineWordsPreference(), () => this.renderingManager.renderAllCapsulesForPrint(this.placedWordInfos));
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing Word Search Generator...");

  try {
    const generator = new WordSearchGenerator();
    await generator.initialize();

    window.generator = generator;

    console.log("Word Search Generator initialized successfully!");

    console.log("Available debug methods:");
    console.log("- debugPrintCapsules()");
    console.log("- testAllCapsules()");
    console.log("- testPrintCapsules()");
    console.log("- debugPositioning()");
    console.log("- forceRenderCapsules()");
  } catch (error) {
    console.error("Failed to initialize Word Search Generator:", error);

    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.textContent = "Failed to initialize the application. Please refresh the page.";
      errorElement.style.display = "block";
    }
  }
});
