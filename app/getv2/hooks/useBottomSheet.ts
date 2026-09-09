import { useEffect, useRef, useState } from "react";
import {
  SHEET_OVERDRAG_LIMIT,
  SHEET_TOP_FULL,
  SHEET_TOP_PEEK,
  type SheetSnap,
} from "../types";

/**
 * Mengelola state dan interaksi drag bottom sheet pada Skenario 2.
 */
export function useBottomSheet(scenario: 1 | 2) {
  const [sheetTop, setSheetTop] = useState(SHEET_TOP_PEEK);
  const [sheetSnapped, setSheetSnapped] = useState<SheetSnap>("peek");
  const [isSheetTransitioning, setIsSheetTransitioning] = useState(true);

  const isDraggingSheetRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartTopRef = useRef(SHEET_TOP_PEEK);

  // Reset ke peek setiap kali masuk skenario 2
  useEffect(() => {
    if (scenario !== 2) return;

    const sheetTimer = window.setTimeout(() => {
      setIsSheetTransitioning(true);
      setSheetTop(SHEET_TOP_PEEK);
      setSheetSnapped("peek");
    }, 0);

    return () => window.clearTimeout(sheetTimer);
  }, [scenario]);

  const handleSheetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSheetRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartTopRef.current = sheetTop;
    setIsSheetTransitioning(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleSheetPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSheetRef.current) return;

    const deltaYPx = e.clientY - dragStartYRef.current;
    const deltaVh = (deltaYPx / window.innerHeight) * 100;
    let newTop = dragStartTopRef.current + deltaVh;
    newTop = Math.min(Math.max(newTop, SHEET_TOP_FULL), SHEET_OVERDRAG_LIMIT);
    setSheetTop(newTop);
  };

  const handleSheetPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSheetRef.current) return;

    isDraggingSheetRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setIsSheetTransitioning(true);

    const midpoint = (SHEET_TOP_PEEK + SHEET_TOP_FULL) / 2;

    if (sheetTop < midpoint) {
      setSheetTop(SHEET_TOP_FULL);
      setSheetSnapped("full");
    } else {
      setSheetTop(SHEET_TOP_PEEK);
      setSheetSnapped("peek");
    }
  };

  // Progress animasi top section (1 = terlihat penuh, 0 = tersembunyi)
  const topSectionProgress =
    scenario === 2
      ? Math.min(
          Math.max(
            (sheetTop - SHEET_TOP_FULL) / (SHEET_TOP_PEEK - SHEET_TOP_FULL),
            0,
          ),
          1,
        )
      : 1;

  return {
    sheetTop,
    sheetSnapped,
    isSheetTransitioning,
    topSectionProgress,
    handleSheetPointerDown,
    handleSheetPointerMove,
    handleSheetPointerUp,
  };
}
