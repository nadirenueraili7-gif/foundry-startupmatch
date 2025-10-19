# Foundry StartupMatch Design Guidelines

## Design Approach

**Reference-Based Hybrid**: Drawing inspiration from LinkedIn's professional credibility, AngelList's startup-focused aesthetics, Linear's clean dashboard design, and Notion's card-based organization. This creates a trustworthy yet modern platform that balances utility with visual appeal for university entrepreneurs.

**Core Principles**:
- Professional credibility for showcasing ventures
- Efficient browsing and discovery workflows
- Clean, dashboard-style information density
- Visual hierarchy that highlights opportunities

---

## Color Palette

### Light Mode
- **Primary Brand**: 245 70% 50% (vibrant blue - trust and innovation)
- **Secondary**: 220 15% 25% (dark slate for text/headings)
- **Background**: 0 0% 98% (off-white base)
- **Surface**: 0 0% 100% (card backgrounds)
- **Border**: 220 15% 90% (subtle dividers)
- **Accent**: 340 75% 55% (coral for CTAs - stands out without clashing)
- **Success**: 140 60% 45% (approval states)
- **Muted Text**: 220 10% 55%

### Dark Mode
- **Primary Brand**: 245 65% 60% (slightly lighter blue)
- **Secondary**: 0 0% 95% (light text)
- **Background**: 222 15% 10% (deep slate)
- **Surface**: 220 15% 14% (card backgrounds)
- **Border**: 220 10% 22% (subtle dividers)
- **Accent**: 340 70% 60% (coral adjusted)
- **Success**: 140 55% 50%
- **Muted Text**: 220 8% 65%

---

## Typography

**Font Stack**: 
- **Primary**: Inter (via Google Fonts) - for UI, body text, and general content
- **Display**: Cal Sans or similar (via CDN or fallback to Inter Bold) - for hero sections and startup names

**Hierarchy**:
- Hero Headings: text-5xl md:text-6xl font-bold tracking-tight
- Section Headings: text-3xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Metadata/Labels: text-sm font-medium text-muted
- Small Print: text-xs

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** for consistent rhythm (p-2, m-4, gap-8, py-12, etc.)

**Container Strategy**:
- Dashboard/Browse Views: max-w-7xl mx-auto px-4
- Content Pages: max-w-4xl mx-auto px-4
- Full-width Hero: w-full with inner max-w-6xl

**Grid Patterns**:
- Team Posts/Gigs: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Startup Showcase: grid-cols-1 lg:grid-cols-2 gap-8
- Filters Sidebar: Fixed left sidebar (w-64) + main content area

---

## Component Library

### Navigation
- **Header**: Sticky top nav with logo left, main links center, profile/CTA right
- Height: h-16, backdrop-blur, border-b
- **Sidebar**: Collapsible filter panel for browse pages (w-64 on desktop, drawer on mobile)

### Cards
- **Team/Gig Cards**: Rounded-xl, p-6, shadow-sm hover:shadow-md transition, border
  - Header with category badge + bookmark icon
  - Title (font-semibold text-xl)
  - Description preview (text-muted, line-clamp-3)
  - Skills tags (pill badges)
  - Footer with compensation + time commitment
  
- **Startup Showcase Cards**: Larger cards with hero image top, logo overlay
  - aspect-ratio-16/9 hero with gradient overlay
  - Logo positioned bottom-left (-translate-y-1/2)
  - Content: one-liner, stage badge, founder avatars
  - CTA button "View Startup"

### Forms & Inputs
- Input fields: rounded-lg, border-2, px-4 py-3, focus:ring-2 focus:ring-primary
- Dark mode: bg-surface text-secondary with proper contrast
- Textarea: min-h-32 for descriptions
- Select/Dropdown: Custom styled with Heroicons chevron
- Multi-select tags: Pill-based with × remove button

### Buttons
- **Primary CTA**: bg-primary text-white rounded-lg px-6 py-3 font-semibold hover:opacity-90
- **Secondary**: variant="outline" with border-2 border-primary text-primary
- **Outlined on Images**: Add backdrop-blur-sm bg-white/80 (light) or bg-black/60 (dark)
- Icon buttons: rounded-full p-2 hover:bg-surface

### Badges & Tags
- **Category badges**: rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary
- **Skill tags**: rounded-md px-2 py-1 text-xs bg-border text-secondary
- **Stage badges**: Seed/Early/Growth with color coding (neutral, blue, green)

### Messaging UI
- **Conversation List**: Left panel (w-80) with conversation cards
- **Chat View**: Right panel with message bubbles, timestamp grouping
- Message bubbles: rounded-2xl px-4 py-2, sender (bg-primary text-white) vs received (bg-surface)

### Admin Dashboard
- **Review Queue**: Table layout with expandable rows
- **Action Buttons**: Approve (green), Reject (red), inline in each row
- **Status badges**: Pending/Approved/Rejected with color coding

---

## Images

### Hero Section (Landing Page)
- **Large Hero Image**: Full-width, h-[500px], featuring diverse students collaborating in modern workspace
- Gradient overlay (from-black/60 to-black/30) for text contrast
- Hero content: centered, max-w-3xl, white text with CTA buttons (one primary, one outline with blur)

### Startup Showcase
- **Startup Hero Images**: aspect-ratio-16/9, object-cover for each startup card
- **Startup Logos**: Circular, w-24 h-24, border-4 border-surface, positioned overlapping hero

### Profile Images
- **User Avatars**: Circular, multiple sizes (w-8 for small, w-12 for medium, w-20 for large)
- Fallback: Colored background with initials

### Placeholder Strategy
- Use gradient placeholders (from-primary/20 to-accent/20) for missing images
- Icons from Heroicons for categories/skills

---

## Animations

Minimal, purposeful animations only:
- Card hover: shadow and slight scale (hover:scale-[1.02] transition-transform)
- Page transitions: Fade-in content on load
- **No** scroll-triggered animations or complex effects

---

## Key Screens Layout

**Dashboard/Browse**: Sidebar filters (categories, skills, compensation) + 3-column card grid + pagination

**Startup Showcase Page**: Hero with search bar → 2-column grid of startup cards → Load more

**Individual Startup Page**: Hero image full-width → Logo + Name + One-liner → Tabs (About, Team, Milestones, Contact) → Rich content sections

**Messaging**: Split view with conversation list left, active chat right (mobile: stack with back navigation)

**User Profile**: Header card with avatar + bio + CTA → Grid of "Looking For" and Skills → Activity feed (posts/startups)