# 🎨 Shader Components Quick Reference

## Component: ShaderBackground

**Purpose**: Add animated fluid shader background to pages

**Location**: `src/components/ShaderBackground.jsx`

**Basic Usage**:
```jsx
import ShaderBackground from '../components/ShaderBackground';

<ShaderBackground>
  <YourContent />
</ShaderBackground>
```

**Full Example**:
```jsx
<ShaderBackground 
  intensity={0.6}      // 0-1: Shader strength
  opacity={0.15}       // 0-1: Background opacity  
  blendMode="screen"   // CSS blend mode
  showDebug={false}    // Show debug overlay
>
  <div>Your content here</div>
</ShaderBackground>
```

**Blend Modes**:
| Mode | Effect | Best For |
|------|--------|----------|
| `screen` | Brightens | Dark backgrounds |
| `multiply` | Darkens | Light backgrounds |
| `overlay` | Both | Balanced blend |
| `color-dodge` | Vibrant | Hero sections |
| `hard-light` | Strong | Premium feel |
| `soft-light` | Gentle | Subtle integration |

**Intensity Recommendations**:
| Page Type | Intensity | Opacity | 
|-----------|-----------|---------|
| Hero/Landing | 0.8 | 0.20 |
| Dashboard | 0.5 | 0.12 |
| Content-Heavy | 0.3 | 0.08 |
| Minimal | 0.2 | 0.05 |

---

## Component: ShaderCard

**Purpose**: Interactive card with shader glow effects

**Location**: `src/components/ShaderCard.jsx`

**Basic Usage**:
```jsx
import ShaderCard from '../components/ShaderCard';

<ShaderCard>
  <div className="card p-6">
    <h3>Card Content</h3>
  </div>
</ShaderCard>
```

**Full Example**:
```jsx
<ShaderCard
  glowColor="from-primary-500 to-accent-500"  // Gradient colors
  hoverEffect={true}                            // Scale on hover
  interactive={true}                            // Mouse tracking
  className="custom-class"
>
  <YourCardContent />
</ShaderCard>
```

**Glow Color Presets**:
```jsx
// Cyan to Purple
from-primary-500 to-accent-500

// Blue to Pink
from-blue-500 to-pink-500

// Green to Blue
from-green-500 to-blue-500

// Orange to Red
from-orange-500 to-red-500

// Emerald
from-emerald-500 to-teal-500
```

---

## Component: FluidCanvas

**Purpose**: Low-level animated fluid background

**Location**: `src/components/FluidCanvas.jsx`

**Basic Usage**:
```jsx
import FluidCanvas from '../components/FluidCanvas';

<FluidCanvas />
```

**With Props**:
```jsx
<FluidCanvas 
  className="w-full h-full"
  intensity={1.0}  // 0.1-2.0
/>
```

---

## Component: ParticleCanvas

**Purpose**: Animated particle system

**Location**: `src/components/ParticleCanvas.jsx`

**Basic Usage**:
```jsx
import ParticleCanvas from '../components/ParticleCanvas';

<ParticleCanvas colors={['#0ea5e9', '#8b5cf6']} />
```

---

## File Structure

```
frontend/src/
├── components/
│   ├── FluidCanvas.jsx           (Fluid shader visualization)
│   ├── ShaderBackground.jsx      (Page wrapper with shader)
│   ├── ShaderCard.jsx            (Interactive card with glow)
│   └── ParticleCanvas.jsx        (Particle system)
├── shaders/
│   ├── fluidVertex.glsl          (Vertex shader code)
│   └── fluidFragment.glsl        (Fragment shader code)
└── pages/
    ├── Login.js                  (Already integrated ✅)
    ├── Dashboard.js
    ├── Search.js
    ├── Results.js
    ├── Chat.js
    └── Signup.js
```

---

## Integration Checklist for Each Page

```
✅ Login         - ShaderBackground added
⬜ Dashboard  - Add ShaderBackground + ShaderCard
⬜ Search     - Add ShaderBackground
⬜ Results    - Add ShaderBackground + ShaderCard
⬜ Chat       - Add ShaderBackground
⬜ Signup     - Add ShaderBackground (optional)
```

---

## Common Integration Patterns

### Pattern 1: Full Page Shader
```jsx
import ShaderBackground from '../components/ShaderBackground';

function MyPage() {
  return (
    <ShaderBackground intensity={0.5} opacity={0.1}>
      <div className="min-h-screen bg-dark-950">
        {/* Page content */}
      </div>
    </ShaderBackground>
  );
}
```

### Pattern 2: Grid with Shader Cards
```jsx
import ShaderCard from '../components/ShaderCard';

function MyGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <ShaderCard key={item.id}>
          <div className="card p-6">
            {/* Card content */}
          </div>
        </ShaderCard>
      ))}
    </div>
  );
}
```

### Pattern 3: Both Page + Cards
```jsx
import ShaderBackground from '../components/ShaderBackground';
import ShaderCard from '../components/ShaderCard';

function CombinedPage() {
  return (
    <ShaderBackground intensity={0.4} opacity={0.08}>
      <div className="min-h-screen bg-dark-950 p-6">
        <div className="grid gap-6">
          {items.map(item => (
            <ShaderCard key={item.id}>
              <ItemContent item={item} />
            </ShaderCard>
          ))}
        </div>
      </div>
    </ShaderBackground>
  );
}
```

---

## Performance Settings by Device

### High-End (Desktop)
```jsx
<ShaderBackground intensity={0.8} opacity={0.2} />
```

### Mid-Range (Laptop)
```jsx
<ShaderBackground intensity={0.5} opacity={0.12} />
```

### Mobile
```jsx
<ShaderBackground intensity={0.3} opacity={0.08} />
```

### Low-End (Very Old)
```jsx
<ShaderBackground intensity={0.2} opacity={0.05} />
```

---

## CSS Classes You Can Use

```jsx
// Combine with Tailwind
<ShaderCard className="max-w-md mx-auto">
  
// With responsive
<ShaderCard className="w-full md:w-1/2 lg:w-1/3">

// With spacing
<ShaderCard className="mb-6 p-2">
```

---

## Debugging

### Show Debug Info
```jsx
<ShaderBackground showDebug={true}>
  {/* Shows overlay with shader stats */}
</ShaderBackground>
```

### Check Canvas
```jsx
// In browser console
console.log('WebGL version:', gl.getParameter(gl.VERSION));
```

### Performance Check
1. Press F12 (DevTools)
2. Go to Performance tab
3. Record page interaction
4. Look for frame rate (target: 60 FPS)

---

## Next Steps

1. **Add to Dashboard**: Wrap with `ShaderBackground`, add `ShaderCard` to ride cards
2. **Add to Results**: Similar to Dashboard
3. **Add to Chat**: Subtle shader with low intensity
4. **Customize**: Change colors to match your brand
5. **Optimize**: Test on mobile, adjust intensity

---

**Quick Tip**: Start with `intensity={0.5} opacity={0.1}` on most pages, then adjust based on how it looks!
