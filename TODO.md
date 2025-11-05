# UI/UX Improvement TODO List

## LAYOUT ISSUES TO FIX

### 1. Sidebar Layout & Responsiveness

- [x] Ensure sidebar does not overlap content on normal/desktop widths
- [x] Make sidebar collapsible: compact icons-only collapsed state, full
      expanded state
- [x] Ensure sidebar is sticky/height 100vh, not overlaying the top nav or main
      content
- [x] Fix z-index ordering so dropdowns/modals appear above sidebar only when
      appropriate
- [x] Highlight active route; add keyboard focus states

### 2. Global Layout (Header / Content)

- [x] Create a consistent global Layout component (top header + left sidebar +
      main content)
- [x] Add proper left padding/margin for main content when sidebar is
      expanded/collapsed
- [x] Add safe content container with max-width and internal padding
- [x] Fix any broken CSS that causes cards/tables to be cut off or misaligned

## PAGE ENHANCEMENTS

### 3. Dashboard Improvements

- [x] Add trend sparkline or small chart for attendance over last 7 or 30 days
      (use a placeholder chart component)
- [x] Add Recent Activity / Notifications (last attendance actions, new students
      added)
- [x] Add Class quick-select dropdown to view class-specific KPIs
- [x] Add CTA buttons: "Mark Attendance", "Export Report", and "Add Student"
      with clear visual hierarchy
- [x] Provide mock data so the Dashboard looks populated and realistic

### 4. Attendance History Transformation

- [x] Replace the plain list with a combination of:
  - Filter bar (by Class, Student, Date range, Status) + search + export CSV
    button
  - Grid of history cards (each card: date, class name, attendance summary
    (present/absent counts + %), small chart or progress bar)
  - Collapsible card details: when clicked, show the full student list with
    badges (Present/Absent) and quick actions (edit entry, undo)
  - Timeline or calendar view toggle to switch between card/grid view and
    calendar visualization
  - Pagination or infinite scroll + "jump to date" control
- [x] Add small micro-interactions: hover elevation, soft scale on click, status
      badges (green for Present, red for Absent)
- [x] Add badges/tags and color-coding per class

## VISUAL & INTERACTION POLISH

### 5. Visual Enhancements

- [x] Use consistent spacing, rounded corners, and drop shadows
- [x] Add subtle transitions (Tailwind transitions / framer-motion if available)
      for modals, cards, dropdowns
- [x] Ensure fonts, sizes, and colors follow a theme. Add a single theme file or
      Tailwind config tokens for:
  - primary, accent, success, danger, neutral, bg, surface
- [x] Add accessible color contrasts and aria attributes for interactive
      elements
- [x] Add toast notifications for important actions (success, error)

### 6. Loading States & Skeleton UI

- [x] Add skeleton loaders for data fetching states (mock-data ok)
- [x] Implement proper loading states for all async operations

## COMPONENT LIBRARY ENHANCEMENTS

### 7. Reusable Component Library

- [x] Consolidate common UI into `/components/ui`:
  - KpiCard, StatCard, Table, Modal, Input, MultiSelect, Button, Badge,
    Skeleton, ChartPlaceholder, Sidebar
- [x] Replace duplicated markup across pages with these components

## TESTING & QA

### 8. Quality Assurance

- [x] Add visual smoke tests (snapshot or screenshots) for Dashboard and
      Attendance History (if project has testing infra)
- [x] Manually ensure the UI works on desktop/tablet/mobile breakpoints
- [x] Test accessibility (keyboard navigation, screen readers)
- [x] Verify all changes do not break backend calls — keep API hooks intact

## IMPLEMENTATION PLAN

### Phase 1: Critical Layout Fixes

1. [x] Fix Sidebar overlapping content issue
2. [x] Implement collapsible Sidebar functionality
3. [x] Fix global layout spacing and padding issues

### Phase 2: Dashboard Enhancements

1. [x] Add trend visualization to Dashboard
2. [x] Implement Recent Activity section
3. [x] Add Class quick-select dropdown
4. [x] Add CTA buttons with proper visual hierarchy

### Phase 3: Attendance History Transformation

1. [x] Redesign filter controls with enhanced UI
2. [x] Implement card-based history view
3. [x] Add collapsible card details
4. [x] Add timeline/calendar view toggle

### Phase 4: Visual Polish & Component Library

1. [x] Add transitions and micro-interactions
2. [x] Implement consistent theme tokens
3. [x] Create reusable component library
4. [x] Add skeleton loaders and proper loading states

### Phase 5: Testing & Finalization

1. [x] Test on all device breakpoints
2. [x] Verify accessibility compliance
3. [x] Ensure no backend API breaks
4. [x] Create UI_CHANGELOG.md documentation
