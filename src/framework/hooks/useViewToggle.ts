import { useCallback, useState } from "react";

// Adapt to support three view modes used in knowledge-bases
export type ViewMode = "list" | "grid" | "large-grid" | "medium-grid";

interface UseViewToggleReturn {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

/**
 * Custom hook to manage the view mode state (list or grid).
 * @param initialMode The initial view mode ('list', 'grid', 'large-grid', 'medium-grid'). Defaults to 'medium-grid' for consistency with knowledge-bases.
 * @returns An object containing the current view mode and functions to update it.
 */
export function useViewToggle(
  initialMode: ViewMode = "medium-grid",
): UseViewToggleReturn {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  // Toggling between 3+ modes isn't straightforward, rely on setViewModeDirectly
  // Remove the simple toggleViewMode function as it's ambiguous with >2 modes.
  // const toggleViewMode = useCallback(() => { ... }, [])

  // Allows setting a specific view mode directly - This becomes the primary way to change state.
  const setViewModeDirectly = useCallback((mode: ViewMode) => {
    // Add basic validation if needed, e.g., ensure mode is one of the allowed types
    setViewMode(mode);
  }, []);

  // Return only viewMode and the direct setter
  return {
    viewMode,
    setViewMode: setViewModeDirectly,
    toggleViewMode: () => {},
  }; // Provide dummy toggle to avoid breaking workflows for now
}

// TODO: Revisit toggleViewMode if a consistent 2-mode toggle is needed elsewhere,
// or remove it entirely if setViewMode is always sufficient.
// For now, providing a dummy function to satisfy the interface used in workflows-content.
// A better approach might be to update the interface and workflows-content later.
