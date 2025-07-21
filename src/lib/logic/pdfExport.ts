import type { Grid } from "./types";

// Assumes jsPDF is available globally or imported in the Svelte app
export function exportPuzzleToPDF(puzzleName: string, puzzle: Grid, solution: Grid, options: { showSolution?: boolean } = {}) {
  // @ts-ignore
  const doc = new window.jspdf.jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  let y = 40;
  doc.setFontSize(20);
  doc.text(puzzleName, 40, y);
  y += 30;
  doc.setFontSize(12);
  doc.text("Puzzle:", 40, y);
  y += 20;
  // Draw puzzle grid as text
  for (let i = 0; i < puzzle.length; i++) {
    let row = "";
    for (let j = 0; j < puzzle[i].length; j++) {
      row += puzzle[i][j] + " ";
    }
    doc.text(row.trim(), 40, y);
    y += 16;
  }
  // TODO: Add solution grid and overlays if options.showSolution
  doc.save(`${puzzleName.replace(/\s+/g, "_") || "puzzle"}.pdf`);
}
