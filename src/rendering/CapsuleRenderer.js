/**
 * Capsule Renderer
 * Handles rendering of word outline capsules (the complex overlay logic)
 */

export class CapsuleRenderer {
  /**
   * Render all capsules with viewBox (the main method we debugged)
   */
  renderAllCapsulesWithViewBox(container, table, placedWordInfos) {
    if (!container || !table || !placedWordInfos) return;

    // Get actual rendered dimensions
    const rect = table.getBoundingClientRect();
    const actualCellWidth = rect.width / table.rows[0].cells.length;
    const actualCellHeight = rect.height / table.rows.length;

    // Create SVG overlay
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

    // Process ALL words (horizontal, vertical, and diagonal)
    console.log(`Processing ${placedWordInfos.length} words for capsules`);

    for (const info of placedWordInfos) {
      const { startRow, startCol, dRow, dCol, length } = info;
      const endRow = startRow + (length - 1) * dRow;
      const endCol = startCol + (length - 1) * dCol;

      // Calculate positions in the SVG coordinate system
      const startX = startCol * actualCellWidth + actualCellWidth / 2;
      const startY = startRow * actualCellHeight + actualCellHeight / 2;
      const endX = endCol * actualCellWidth + actualCellWidth / 2;
      const endY = endRow * actualCellHeight + actualCellHeight / 2;

      // Determine word type for debugging
      const isHorizontal = dRow === 0 && dCol !== 0;
      const isVertical = dCol === 0 && dRow !== 0;
      const isDiagonal = Math.abs(dRow) === 1 && Math.abs(dCol) === 1;
      const wordType = isHorizontal ? "HORIZONTAL" : isVertical ? "VERTICAL" : isDiagonal ? "DIAGONAL" : "OTHER";

      console.log(`Word "${info.word}" (${wordType}): start(${startCol},${startRow}) end(${endCol},${endRow})`);
      console.log(`  SVG coordinates: start(${startX},${startY}) end(${endX},${endY})`);

      // Capsule parameters
      const extension = actualCellHeight * 0.4;
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const capsuleLength = dist + extension * 2;
      const capsuleWidth = actualCellHeight * 0.7;
      const radius = capsuleWidth / 2;

      console.log(`  Capsule: length=${capsuleLength}, width=${capsuleWidth}, angle=${angle}°`);

      // Create proper capsule shape using SVG path
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

      // Calculate capsule path
      const halfLength = capsuleLength / 2;
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;

      // Create capsule path: rectangle with rounded ends
      const pathData = [
        // Start at left side of capsule
        `M ${centerX - halfLength + radius} ${centerY - radius}`,
        // Top line
        `L ${centerX + halfLength - radius} ${centerY - radius}`,
        // Top right arc
        `A ${radius} ${radius} 0 0 1 ${centerX + halfLength - radius} ${centerY + radius}`,
        // Bottom line
        `L ${centerX - halfLength + radius} ${centerY + radius}`,
        // Bottom left arc
        `A ${radius} ${radius} 0 0 1 ${centerX - halfLength + radius} ${centerY - radius}`,
        // Close path
        "Z",
      ].join(" ");

      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#000");
      path.setAttribute("stroke-width", actualCellHeight * 0.15);
      path.setAttribute("opacity", "0.85");
      path.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);
      svg.appendChild(path);

      // Debug word type
      console.log(`  Added capsule for "${info.word}" (${wordType})`);
    }

    table.style.position = "relative";
    table.appendChild(svg);

    console.log("Added unified SVG with viewBox for ALL capsules");
  }

  /**
   * Render diagonal capsules only (legacy method)
   */
  renderDiagonalCapsules(container, table, diagonalCapsules) {
    if (!container || !table || !diagonalCapsules) return;

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
    svg.classList.add("diagonal-capsule-overlay");
    svg.style.zIndex = 10;

    for (const info of diagonalCapsules) {
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
  }

  /**
   * Clear all capsule overlays
   */
  clearCapsules(table) {
    if (!table) return;

    const overlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
    overlays.forEach((overlay) => overlay.remove());
  }

  /**
   * Get capsule dimensions for a word
   */
  getCapsuleDimensions(startX, startY, endX, endY, cellHeight) {
    const extension = cellHeight * 0.4;
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const capsuleLength = dist + extension * 2;
    const capsuleWidth = cellHeight * 0.7;
    const radius = capsuleWidth / 2;

    return {
      length: capsuleLength,
      width: capsuleWidth,
      radius: radius,
      angle: angle,
      centerX: (startX + endX) / 2,
      centerY: (startY + endY) / 2,
    };
  }

  /**
   * Create capsule path data
   */
  createCapsulePath(centerX, centerY, halfLength, radius) {
    return [`M ${centerX - halfLength + radius} ${centerY - radius}`, `L ${centerX + halfLength - radius} ${centerY - radius}`, `A ${radius} ${radius} 0 0 1 ${centerX + halfLength - radius} ${centerY + radius}`, `L ${centerX - halfLength + radius} ${centerY + radius}`, `A ${radius} ${radius} 0 0 1 ${centerX - halfLength + radius} ${centerY - radius}`, "Z"].join(" ");
  }
}
