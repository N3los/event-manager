# POOR DECISIONS - Event Calculator Design System

## Core Brand Tokens
- **Primary**: `#013695` (Deep Royal / Midnight Blue)
- **Primary Dark**: `#002466`
- **Primary Light**: `#024ec4`
- **Accent**: `#FC661B` (Vibrant Neon Party Coral / Orange)
- **Accent Glow**: `rgba(252, 102, 27, 0.25)`
- **Success / Check-in**: `#10b981` (Vibrant Emerald)
- **Warning / Pending**: `#f59e0b` (Warm Amber)
- **Danger / Debt**: `#ef4444` (Crimson Red)
- **Background**: `#0a0e17` (Deep dark slate)
- **Surface**: `#111827` (Card background)
- **Surface Highlight**: `#1f293d` (Elevated card)
- **Border**: `#1e293b` (Subtle divider)
- **Text Primary**: `#f8fafc` (Crisp White)
- **Text Secondary**: `#94a3b8` (Muted Slate)
- **Text Muted**: `#64748b`

## UX Principles
1. **Speed First**: Door check-in takes < 1 second per guest.
2. **Compact & High-Density**:
   - Clean, professional typography (no oversized fonts).
   - Card rows are dense but comfortable (height ~56-64px).
   - Touch targets are strictly at least 48px × 48px for thumb tapping on mobile.
3. **Instant Visual Status**:
   - Unchecked Paid: Vibrant CTA `[ 39 € • NAPLATI ]`
   - Unchecked Free: Blue CTA `[ GRATIS • ULAZ ]`
   - Checked In: Subdued emerald badge with timestamp + subtle undo button.
4. **Instant Context**:
   - Guest name prominent.
   - Assigned table badge (e.g. `Stol 2`) clearly highlighted.
   - Team origin (`Ela`, `Joe`, `Dupli`, `Silvaši`) in discrete badge.
   - Urgent notes (`💬 Fotograf`, `💬 Popust na hordu`) displayed in high-contrast callout.
