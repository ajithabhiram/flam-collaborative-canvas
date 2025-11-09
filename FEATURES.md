# 🎨 Collaborative Canvas - Feature Guide

## 🎯 Quick Start

### Starting the Application
```bash
# Install dependencies (if not already done)
npm install

# Start the server
npm start

# Open browser to
http://localhost:3000
```

---

## 🖱️ User Interface Overview

### Toolbar (Top)
```
┌─────────────────────────────────────────────────────────────────┐
│ 🎨 Collaborative Canvas │ Tools │ Color │ Size │ Undo/Redo │ Room │
└─────────────────────────────────────────────────────────────────┘
```

**Sections:**
1. **Brand** - App logo and name
2. **Tools** - Brush/Eraser selection
3. **Color** - Color picker with live preview
4. **Size** - Brush size slider with visual preview
5. **Actions** - Undo/Redo buttons
6. **Room** - Room input and join button

### Sidebar (Left)
```
┌──────────────────┐
│ 👥 Online Users  │
│ ┌──────────────┐ │
│ │ 🔴 User 1    │ │
│ │ 🔵 User 2    │ │
│ │ 🟢 User 3    │ │
│ └──────────────┘ │
└──────────────────┘
```

### Canvas (Main Area)
- Large drawing area with subtle grid
- Gradient overlay for depth
- Crosshair cursor when drawing
- Real-time cursor indicators for other users

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `B` | Switch to Brush tool |
| `E` | Switch to Eraser tool |
| `Ctrl + Z` | Undo last action |
| `Ctrl + Y` | Redo action |
| `Ctrl + Shift + Z` | Redo action (alternative) |

---

## 🎨 Drawing Tools

### Brush Tool
- **Icon**: Paint brush
- **Shortcut**: Press `B`
- **Function**: Draw colored strokes
- **Features**:
  - Smooth quadratic curve interpolation
  - Anti-aliasing for soft edges
  - Adjustable size (1-40px)
  - Any color selection

### Eraser Tool
- **Icon**: Eraser
- **Shortcut**: Press `E`
- **Function**: Erase existing strokes
- **Features**:
  - Same smooth interpolation as brush
  - Adjustable size
  - Destination-out compositing

---

## 🎨 Color Selection

### Color Picker
- **Size**: 48x48px (large and accessible)
- **Features**:
  - Native browser color picker
  - Live preview indicator (small circle)
  - Hover scale effect
  - Smooth transitions
  - Default: Dark gray (#111827)

### How to Use
1. Click the color square
2. Select color from picker
3. See live preview update
4. Start drawing with new color

---

## 📏 Brush Size Control

### Size Slider
- **Range**: 1-40 pixels
- **Default**: 6 pixels
- **Features**:
  - Live visual preview (circle that grows/shrinks)
  - Numeric display
  - Smooth slider with custom styling
  - Grab cursor on thumb

### How to Use
1. Drag slider left/right
2. Watch preview circle change size
3. See numeric value update
4. Draw with new size

---

## 🔄 Undo/Redo System

### Undo
- **Button**: ↶ icon
- **Shortcut**: `Ctrl + Z`
- **Function**: Revert last drawing action
- **Tooltip**: "Undo (Ctrl+Z)"

### Redo
- **Button**: ↷ icon
- **Shortcut**: `Ctrl + Y` or `Ctrl + Shift + Z`
- **Function**: Restore undone action
- **Tooltip**: "Redo (Ctrl+Y)"

---

## 🚪 Room System

### Joining a Room
1. Enter room name in input field (default: "lobby")
2. Click "Join" button with → icon
3. Page reloads with room parameter
4. See welcome toast notification

### Room Features
- **Multiple Rooms**: Isolated drawing spaces
- **URL-based**: Room name in URL query parameter
- **Persistent**: Stays in URL for sharing
- **Default**: "lobby" if no room specified

---

## 👥 Online Users

### User List (Sidebar)
- **Header**: Shows total user count badge
- **User Cards**: Display for each online user
  - Color swatch (user's drawing color)
  - Username or "Anonymous"
  - Hover effect (slides right)
  - Smooth entrance animation

### User Count Badge
- **Location**: Top right of sidebar header
- **Display**: Number of online users
- **Style**: Primary color circle with white text
- **Updates**: Real-time as users join/leave

---

## 🎯 Cursor Tracking

### Your Cursor
- **Display**: Crosshair on canvas
- **Visibility**: Always visible when over canvas

### Other Users' Cursors
- **Display**: Colored dot + username label
- **Features**:
  - Smooth movement (50ms transition)
  - User's color on dot
  - Username in dark label
  - Entrance animation
  - Auto-hide when user leaves canvas

---

## 🔔 Toast Notifications

### Notification Types

#### Success (Green)
- **Icon**: Checkmark
- **Use**: User joined room
- **Example**: "User Joined - John joined the room"

#### Info (Blue)
- **Icon**: Info circle
- **Use**: General information, user left
- **Example**: "Welcome! - You joined room: lobby"

#### Warning (Orange)
- **Icon**: Warning triangle
- **Use**: Warnings and alerts
- **Example**: "Warning - Connection unstable"

#### Error (Red)
- **Icon**: X circle
- **Use**: Errors and failures
- **Example**: "Error - Failed to connect"

### Toast Features
- **Position**: Top right corner
- **Animation**: Slide in from right
- **Duration**: 3 seconds
- **Auto-dismiss**: Fades out and slides away
- **Stacking**: Multiple toasts stack vertically

---

## 📱 Responsive Design

### Desktop (> 1200px)
- Full toolbar with all labels
- Sidebar visible
- Large controls
- Optimal spacing

### Tablet (900px - 1200px)
- Tool labels hidden (icons only)
- Sidebar visible
- Compact toolbar
- Adjusted spacing

### Mobile (640px - 900px)
- Sidebar hidden
- Compact toolbar
- Smaller controls
- Touch-optimized
- Brand text hidden

### Small Mobile (< 640px)
- Ultra-compact layout
- Minimum viable controls
- Touch-friendly sizes
- Optimized for portrait

---

## 🎨 Visual Design Features

### Glassmorphism
- **Toolbar**: Frosted glass effect with backdrop blur
- **Toasts**: Semi-transparent with blur
- **Effect**: Modern, layered appearance

### Animations
- **Hover Effects**: Buttons lift on hover
- **Active States**: Tools highlight when selected
- **Entrance**: Users slide in, cursors appear
- **Transitions**: Smooth 200ms cubic-bezier

### Shadows
- **Elevation**: Multi-layer shadows for depth
- **Soft**: Subtle, natural-looking shadows
- **Responsive**: Shadows increase on hover

### Colors
- **Primary**: Indigo (#6366f1)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Text**: Dark gray (#111827)
- **Borders**: Light gray (#e5e7eb)

---

## 🔧 Technical Features

### Canvas Rendering
- **High DPI**: Pixel ratio support for retina displays
- **Smooth Strokes**: Quadratic curve interpolation
- **Anti-aliasing**: Soft edges on strokes
- **Compositing**: Proper eraser with destination-out

### Performance
- **Hardware Acceleration**: CSS transforms and opacity
- **Throttled Updates**: Cursor position throttled to 16ms
- **Efficient Rendering**: Only redraws when necessary
- **Optimized Animations**: 60fps smooth animations

### Touch Support
- **Touch Events**: Full touch drawing support
- **Touch Action**: Prevents default scrolling
- **Touch Targets**: Larger buttons on mobile
- **Gesture Support**: Optimized for touch gestures

---

## 💡 Pro Tips

1. **Quick Tool Switch**: Use `B` and `E` keys for instant tool switching
2. **Undo Mistakes**: Keep `Ctrl+Z` handy for quick corrections
3. **Size Preview**: Watch the preview circle to see exact brush size
4. **Color Indicator**: Check the small preview dot for current color
5. **User Count**: Glance at sidebar badge to see who's online
6. **Keyboard First**: Learn shortcuts for faster workflow
7. **Room Sharing**: Share the URL with room parameter for collaboration
8. **Mobile Drawing**: Works great on tablets and touch devices

---

## 🐛 Troubleshooting

### Drawing Not Working
- Check if tool is selected (brush should be highlighted)
- Ensure canvas has loaded (check for grid background)
- Try refreshing the page

### Users Not Showing
- Verify WebSocket connection (check browser console)
- Ensure server is running
- Check if in same room

### Notifications Not Appearing
- Check if toast container exists
- Verify JavaScript is enabled
- Look for console errors

### Responsive Issues
- Try refreshing at current screen size
- Check browser zoom level (should be 100%)
- Ensure viewport meta tag is present

---

## 🎉 Best Practices

### For Best Drawing Experience
1. Use appropriate brush sizes (3-10px for details, 15-30px for filling)
2. Switch tools with keyboard shortcuts
3. Undo frequently to experiment
4. Choose contrasting colors for visibility
5. Use eraser for corrections, not white brush

### For Collaboration
1. Use descriptive usernames
2. Stay in same room as teammates
3. Watch cursor indicators to avoid overlap
4. Use different colors for each user
5. Communicate via external chat if needed

### For Performance
1. Close unused browser tabs
2. Use modern browser (Chrome, Firefox, Safari)
3. Ensure stable internet connection
4. Avoid extremely large brush sizes
5. Refresh if canvas becomes sluggish

---

## 📚 Additional Resources

- **README.md**: Project overview and setup
- **ARCHITECTURE.md**: Technical architecture details
- **MODERNIZATION_SUMMARY.md**: Complete list of UI improvements
- **Source Code**: Well-commented for learning

---

**Enjoy your modern collaborative canvas experience! 🎨✨**
