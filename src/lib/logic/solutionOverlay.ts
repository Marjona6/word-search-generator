import type { PlacedWordInfo } from "./types";

export interface CapsuleOverlay {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  cx: number;
  cy: number;
  angle: number;
  capsuleLength: number;
  capsuleWidth: number;
}

export function getCapsuleOverlays(placedWordInfos: PlacedWordInfo[], cellSize: number): CapsuleOverlay[] {
  return placedWordInfos.map((info) => {
    const { startRow, startCol, dRow, dCol, length } = info;
    const endRow = startRow + (length - 1) * dRow;
    const endCol = startCol + (length - 1) * dCol;
    const startX = startCol * cellSize + cellSize / 2;
    const startY = startRow * cellSize + cellSize / 2;
    const endX = endCol * cellSize + cellSize / 2;
    const endY = endRow * cellSize + cellSize / 2;
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const extension = cellSize * 0.7;
    const capsuleLength = dist + extension * 2;
    const capsuleWidth = cellSize * 0.7;
    const cx = (startX + endX) / 2;
    const cy = (startY + endY) / 2;
    return {
      startRow,
      startCol,
      endRow,
      endCol,
      cx,
      cy,
      angle,
      capsuleLength,
      capsuleWidth,
    };
  });
}
