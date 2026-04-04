# 🎨 Shader System Integration Guide

## Overview

Your RailPool app now has **fluid dynamics shaders** powered by **WebGL/Three.js** with interactive effects throughout the UI. The shader system includes:

- **FluidCanvas** - Animated fluid background with particle-like behavior
- **ShaderBackground** - Page wrapper for shader effects
- **ShaderCard** - Interactive cards with glow effects
- **ParticleCanvas** - Particle system for advanced effects

---

## 🚀 Quick Start - 3 Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Update Pages with Shaders

#### **Login Page (Already Updated)**
Login page now has fluid shader background! The shader:
- Responds to mouse movement
- Animates with fluid dynamics
- Uses cyan and purple colors
- Blends with screen mode

#### **Add to Dashboard Page**
```jsx
import ShaderBackground from '../components/ShaderBackground';
import ShaderCard from '../components/ShaderCard';

// Wrap the page
<ShaderBackground intensity={0.5} opacity={0.1} blendMode="multiply">
  {/* Your dashboard content */}
</ShaderBackground>

// Wrap individual cards
<ShaderCard glowColor="from-primary-500 to-accent-500">
  <YourCardContent />
</ShaderCard>
```

#### **Add to Results Page**
```jsx
<ShaderBackground intensity={0.4} opacity={0.08} blendMode="overlay">
  {/* Match cards with ShaderCard wrapper */}
  <ShaderCard>
    <MatchCard {...match} />
  </ShaderCard>
</ShaderBackground>
```

#### **Add to Chat Page**
```jsx
<ShaderBackground intensity={0.3} opacity={0.12} blendMode="screen">
  {/* Chat content */}
</ShaderBackground>
```

### Step 3: Run Your App
```bash
npm start
```

---

## 📚 Component API Reference

### ShaderBackground

Wraps a section or page with fluid shader effects.

**Props:**
```jsx
<ShaderBackground
  intensity={0.6}        // Shader strength: 0-1 (default: 0.6)
  opacity={0.15}         // Background opacity: 0-1 (default: 0.15)
  blendMode="screen"     // CSS blend mode (screen, multiply, overlay, etc.)
  showDebug={false}      // Show debug info (default: false)
>
  {children}
</ShaderBackground>
```

**Blend Mode Options:**
- `"screen"` - Brightens background (good for dark themes)
- `"multiply"` - Darkens background
- `"overlay"` - Combines both
- `"color-dodge"` - Vibrant effect
- `"color-burn"` - Deep shadows

**Examples:**
```jsx
// Subtle effect
<ShaderBackground intensity={0.3} opacity={0.08}>

// Bold effect
<ShaderBackground intensity={0.9} opacity={0.3}>

// Minimal for content-heavy pages
<ShaderBackground intensity={0.4} opacity={0.05}>
```

---

### ShaderCard

Card component with interactive shader glow effects on hover.

**Props:**
```jsx
<ShaderCard
  glowColor="from-primary-500 to-accent-500"  // Gradient color
  hoverEffect={true}                            // Scale on hover
  interactive={true}                            // Mouse tracking
  className=""                                  // Additional classes
>
  {children}
</ShaderCard>
```

**Examples:**
```jsx
// With purchase button
<ShaderCard glowColor="from-green-500 to-emerald-500">
  <div className="p-6">
    <h3>Premium Features</h3>
    <button>Upgrade Now</button>
  </div>
</ShaderCard>

// With custom gradient
<ShaderCard glowColor="from-orange-500 to-pink-500">
  <div className="p-6">
    <h3>Special Offer</h3>
  </div>
</ShaderCard>
```

---

### FluidCanvas

Low-level Three.js fluid visualization component.

**Props:**
```jsx
<FluidCanvas
  className=""        // CSS classes
  intensity={1.0}     // Shader intensity
/>
```

---

### ParticleCanvas

Animated particle system with Three.js.

**Props:**
```jsx
<ParticleCanvas
  className=""
  colors={['#0ea5e9', '#8b5cf6']}  // Particle colors
/>
```

---

## 🎯 Integration Examples

### Example 1: Full Page with Shader

**Search.js**
```jsx
import ShaderBackground from '../components/ShaderBackground';

function Search() {
  return (
    <ShaderBackground intensity={0.5} opacity={0.12}>
      <div className="min-h-screen bg-dark-950">
        {/* Existing search content */}
      </div>
    </ShaderBackground>
  );
}
```

### Example 2: Dashboard with Shader Cards

**Dashboard.js**
```jsx
import ShaderCard from '../components/ShaderCard';

function Dashboard() {
  return (
    <ShaderBackground intensity={0.4} opacity={0.08}>
      <div className="min-h-screen bg-dark-950 p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rides.map((ride) => (
            <ShaderCard key={ride.id}>
              <div className="card p-6">
                <h3>{ride.destination_name}</h3>
                {/* Ride content */}
              </div>
            </ShaderCard>
          ))}
        </div>
      </div>
    </ShaderBackground>
  );
}
```

### Example 3: Chat with Subtle Shader

**Chat.js**
```jsx
import ShaderBackground from '../components/ShaderBackground';

function Chat() {
  return (
    <ShaderBackground intensity={0.2} opacity={0.05} blendMode="overlay">
      <div className="flex flex-col h-screen">
        {/* Existing chat content */}
      </div>
    </ShaderBackground>
  );
}
```

### Example 4: Results with Interactive Shader Cards

**Results.js**
```jsx
import ShaderBackground from '../components/ShaderBackground';
import ShaderCard from '../components/ShaderCard';

function Results() {
  return (
    <ShaderBackground intensity={0.5} opacity={0.1}>
      <div className="min-h-screen bg-dark-950 p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <ShaderCard
              key={match.ride_intent.id}
              glowColor="from-blue-500 to-purple-500"
            >
              <div className="card-hover p-6">
                <h4>{match.user.name}</h4>
                {/* Match details */}
              </div>
            </ShaderCard>
          ))}
        </div>
      </div>
    </ShaderBackground>
  );
}
```

---

## ⚙️ Shader Customization

### Change Shader Colors

Edit `FluidCanvas.jsx` and modify the color values in the fragment shader:

```javascript
// Around line 100 in fluidFragment.glsl
vec3 colorA = vec3(0.0, 0.74, 0.93);   // Cyan - change these RGB values
vec3 colorB = vec3(0.55, 0.36, 0.96);  // Purple
vec3 colorC = vec3(0.2, 0.2, 0.4);     // Dark blue
```

**Common Colors (RGB):**
```
Red:      (1.0, 0.0, 0.0)
Green:    (0.0, 1.0, 0.0)
Blue:     (0.0, 0.0, 1.0)
Magenta:  (1.0, 0.0, 1.0)
Yellow:   (1.0, 1.0, 0.0)
Cyan:     (0.0, 1.0, 1.0)
```

### Adjust Animation Speed

In `FluidCanvas.jsx`, modify time multipliers:

```javascript
// Slower animation (multiply by smaller number)
uv += vec2(sin(uTime * 0.1) * 0.1, cos(uTime * 0.05) * 0.1);

// Faster animation
uv += vec2(sin(uTime * 0.5) * 0.1, cos(uTime * 0.7) * 0.1);
```

### Add Mouse Interactivity

Already implemented! Mouse position updates the shader in real-time.

To increase mouse effect strength:
```javascript
vec2 mousePos = vec2(uMouseX, uMouseY);
uv += (mousePos - 0.5) * 0.5;  // Increase multiplier (0.2 → 0.5)
```

---

## 🎨 Design Guidelines

### Background Intensity by Page Type

**Content-Heavy Pages** (Search, Results)
```jsx
<ShaderBackground intensity={0.3} opacity={0.08}>
```

**Medium Content** (Dashboard, Chat)
```jsx
<ShaderBackground intensity={0.5} opacity={0.12}>
```

**Hero/Landing Pages** (Login, Signup)
```jsx
<ShaderBackground intensity={0.8} opacity={0.2}>
```

### Blend Modes by Effect

**Bright/Energetic**
- `"screen"` - Best for dark backgrounds
- `"color-dodge"` - Vibrant highlights

**Subtle/Professional**
- `"multiply"` - Deep integration
- `"overlay"` - Balanced blend

**Premium Feel**
- `"hard-light"` - Strong definition
- `"soft-light"` - Gentle blend

---

## 🔍 Performance Optimization

Shaders use WebGL which is GPU-accelerated and performant. However, for maximum performance:

1. **Reduce intensity on old devices**
```jsx
const isOldDevice = navigator.hardwareConcurrency <= 2;
<ShaderBackground intensity={isOldDevice ? 0.2 : 0.6}>
```

2. **Disable shaders on mobile** (optional)
```jsx
const isMobile = window.innerWidth < 768;
{!isMobile && <ShaderBackground>...</ShaderBackground>}
```

3. **Lazy load canvas**
```jsx
const [showShader, setShowShader] = useState(false);
useEffect(() => {
  setShowShader(true);
}, []);

{showShader && <ShaderBackground>...</ShaderBackground>}
```

---

## 🧪 Testing Shaders

### Enable Debug Mode

```jsx
<ShaderBackground intensity={0.6} showDebug={true}>
  {/* Shows console overlay */}
</ShaderBackground>
```

### Check Canvas Rendering

Open browser DevTools (F12) → Go to Three.js examples to verify WebGL support.

### Performance Monitoring

Use Chrome DevTools → Performance tab to check frame rates:
- Target: 60 FPS
- Accept: 30+ FPS
- Problematic: < 30 FPS

---

## 📋 Quick Integration Checklist

After adding shaders to a page:

- [ ] Import `ShaderBackground` from `../components/ShaderBackground`
- [ ] Import `ShaderCard` from `../components/ShaderCard` (if needed)
- [ ] Wrap main content with `<ShaderBackground>`
- [ ] Set appropriate `intensity` prop for page type
- [ ] Set `opacity` to balance with content
- [ ] Choose appropriate `blendMode`
- [ ] Test hover effects on `ShaderCard` components
- [ ] Check performance in DevTools
- [ ] Test on mobile devices
- [ ] Verify colors match brand palette

---

## 🐛 Troubleshooting

### Shaders not showing?
1. Ensure Three.js is installed: `npm list three`
2. Check browser console for WebGL errors
3. Verify `<Canvas>` is rendering (check DevTools)

### Performance issues?
1. Reduce `intensity` value
2. Reduce `opacity` value
3. Disable on mobile devices
4. Check GPU usage in DevTools

### Colors look wrong?
1. Verify RGB values in shader (0-1 range)
2. Check `blendMode` prop
3. Ensure dark background for visibility

### Mouse tracking not working?
1. Verify `interactive={true}` on `ShaderCard`
2. Check browser DevTools for JavaScript errors
3. Test on non-iOS devices first

---

## 🚀 Next Steps

1. **Update Pages**: Add shaders to Dashboard, Results, and Chat pages
2. **Customize Colors**: Match your brand colors
3. **Adjust Intensity**: Fine-tune for each page
4. **Mobile Optimization**: Test and adjust for mobile displays
5. **Analytics**: Track shader rendering performance

---

## 📚 Resources

- **Three.js Documentation**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmndrs.com/react-three-fiber/
- **WebGL Shaders**: https://learnopengl.com/
- **Shadertoy**: https://www.shadertoy.com/ (shader inspiration)

---

**Version**: 1.0  
**Last Updated**: April 4, 2026  
**Status**: Ready for Integration ✅
