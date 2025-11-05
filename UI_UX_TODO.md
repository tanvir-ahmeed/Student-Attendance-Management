# UI/UX Improvement TODO List

## LAYOUT
- [x] Create a consistent app layout: top navigation + left sidebar
- [x] Sidebar should highlight active page
- [x] Use proper spacing, typography, and color hierarchy
- [x] Add hover states, focus states, and transitions

## COLOR + THEME
- [x] Use a clean light base theme with soft neutral backgrounds
- [x] Use accent colors for highlights, call-to-actions, and buttons
- [x] Ensure good visual contrast and accessibility

## COMPONENTS (rebuild or refactor)
- [x] Buttons (primary, secondary, outline)
- [x] Inputs with labels + validation states
- [x] Modal components with smooth fade-in scale animations
- [x] Tables with zebra rows + hover highlight
- [x] Dropdowns and Multi-select menus
- [x] Toast notifications for success + error (React Hot Toast)

## PAGES TO IMPROVE
- [x] Login Page → hero text + brand identity + centered card
- [x] Dashboard → clean analytics cards + chart placeholders
- [x] Class Management → neatly spaced table + create class modal
- [x] Student List → show class names beside students + clean table UI
- [x] Attendance Page → class selector + date selector at top + neat toggles
- [x] Attendance History Page → filters + meaningful layout

## INTERACTIVITY
- [ ] Add subtle animations (Tailwind transitions + framer-motion if available)
- [ ] Add loading states + skeleton UI when fetching data

## CONSISTENCY
- [ ] Replace duplicated markup with reusable components
- [ ] Standardize typography sizes and spacing units

## COMPONENT LIBRARY
- [x] Create centralized component library (e.g., /components/ui)
- [ ] Ensure all components are well-documented and reusable

## IMPLEMENTATION PLAN

### Phase 1: Core Components
1. [x] Create enhanced Button component with variants
2. [x] Create enhanced Input component with labels and validation
3. [x] Create enhanced Modal component with animations
4. [x] Create Table component with zebra rows and hover states
5. [x] Create Toast notification system

### Phase 2: Layout Components
1. [x] Redesign Header with modern styling
2. [x] Redesign Sidebar with active state highlighting
3. [x] Create consistent page layout structure

### Phase 3: Page Redesigns
1. [x] Redesign Login Page
2. [x] Redesign Dashboard Page
3. [x] Redesign Classes Page
4. [x] Redesign Students Page
5. [x] Redesign Mark Attendance Page
6. [x] Redesign Attendance History Page

### Phase 4: Polish and Refinement
1. [ ] Add animations and transitions
2. [ ] Implement loading states and skeleton UI
3. [ ] Ensure responsive design works on all devices
4. [ ] Test accessibility and contrast ratios