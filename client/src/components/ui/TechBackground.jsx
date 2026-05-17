import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCode, FiDatabase, FiCloud, FiCpu, FiGlobe, FiLock } from 'react-icons/fi';

const TechBackground = ({ 
  showBadges = true, 
  showCode = true, 
  transparent = false,
  isDashboard = false 
}) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, radius: isDashboard ? 140 : 180 });
  const [clickPulses, setClickPulses] = useState([]);
  
  // Real-time dark mode detection
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Code snippets related to software development, APIs, CRM, and servers
  const codeSnippets = [
    'const app = express();',
    'await mongoose.connect(MONGO_URI);',
    '[SUCCESS] Database connected successfully',
    'crm.deploy({ env: "production" });',
    'const token = jwt.sign({ id }, JWT_SECRET);',
    'api.post("/api/auth/login", credentials);',
    'res.status(200).json({ success: true });',
    'socket.on("connection", (socket) => { ... });',
    'npm run build --minify=true',
    'const leads = await Lead.find({ status: "new" });',
    'const client = new BoffinWebTechClient();',
    '[INFO] Worker thread #3 active',
    'const server = http.createServer(app);',
    'const io = new Server(server);',
    'const db = connectDB();',
    'await crm.deploy();',
  ];

  // Internal state for floating code lines to ensure React renders them dynamically
  const [floatingLines, setFloatingLines] = useState([]);

  useEffect(() => {
    if (!showCode) return;

    // Generate initial set of floating code streams
    const initialLines = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
      left: `${5 + Math.random() * 85}%`,
      delay: Math.random() * 15,
      duration: 15 + Math.random() * 15,
      fontSize: 10 + Math.floor(Math.random() * 4),
    }));
    setFloatingLines(initialLines);

    const handleSnippetCycle = setInterval(() => {
      setFloatingLines((prev) =>
        prev.map((line) => {
          if (Math.random() > 0.6) {
            return {
              ...line,
              text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
            };
          }
          return line;
        })
      );
    }, 8000);

    return () => clearInterval(handleSnippetCycle);
  }, [showCode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles system configuration
    const particles = [];
    const maxParticles = isDashboard ? 35 : 65;
    const divisor = isDashboard ? 45000 : 25000;
    const particleCount = Math.min(maxParticles, Math.floor((canvas.width * canvas.height) / divisor));

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = isDashboard ? Math.random() * 1.8 + 0.8 : Math.random() * 2.5 + 1;
        this.baseSpeedX = Math.random() * 0.3 - 0.15;
        this.baseSpeedY = Math.random() * 0.3 - 0.15;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.colorType = Math.floor(Math.random() * 3); // 0: Indigo, 1: Purple, 2: Cyan/Teal
        
        // Base alpha configuration
        this.alpha = isDashboard ? Math.random() * 0.3 + 0.15 : Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce back from boundaries
        if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

        // Interaction with mouse
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = mouseRef.current.x - this.x;
          const dy = mouseRef.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRef.current.radius) {
            const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
            // Attract slightly
            this.x += (dx / distance) * force * 0.4;
            this.y += (dy / distance) * force * 0.4;
          }
        }
      }

      draw(isDarkTheme) {
        // Dark theme neon colors vs Light theme highly readable, contrasted colors
        const colors = isDarkTheme ? [
          { r: 99, g: 102, b: 241 }, // Neon Indigo
          { r: 168, g: 85, b: 247 }, // Neon Purple
          { r: 6, g: 182, b: 212 },  // Neon Cyan
        ] : [
          { r: 79, g: 70, b: 229 },  // Indigo-600
          { r: 147, g: 51, b: 234 }, // Purple-600
          { r: 13, g: 148, b: 136 }, // Teal-600 (rich contrast on light bg)
        ];

        const colorPick = colors[this.colorType];
        this.r = colorPick.r;
        this.g = colorPick.g;
        this.b = colorPick.b;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Increase opacity in light mode for proper contrast
        const baseAlpha = isDarkTheme ? this.alpha : this.alpha * 1.35;
        const drawAlpha = isDashboard ? baseAlpha * 0.45 : baseAlpha;
        
        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${drawAlpha})`;
        ctx.shadowBlur = isDashboard ? (isDarkTheme ? 4 : 1) : (isDarkTheme ? 10 : 2);
        ctx.shadowColor = `rgb(${this.r}, ${this.g}, ${this.b})`;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for lines
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Draw network links
    const connectParticles = (isDarkTheme) => {
      const maxDistance = isDashboard ? 120 : 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            // Increased line opacity in light mode for proper visibility
            const baseOpacity = isDashboard 
              ? (isDarkTheme ? 0.08 : 0.16) 
              : (isDarkTheme ? 0.25 : 0.4);
            const opacity = (1 - distance / maxDistance) * baseOpacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Connected line color is a gradient blend between the two nodes
            const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            grad.addColorStop(0, `rgba(${particles[i].r}, ${particles[i].g}, ${particles[i].b}, ${opacity})`);
            grad.addColorStop(1, `rgba(${particles[j].r}, ${particles[j].g}, ${particles[j].b}, ${opacity})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = isDashboard ? 0.8 : 1;
            ctx.stroke();
          }
        }

        // Draw line from mouse to nearby particles
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = mouseRef.current.x - particles[i].x;
          const dy = mouseRef.current.y - particles[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRef.current.radius) {
            const baseMouseOpacity = isDashboard 
              ? (isDarkTheme ? 0.12 : 0.22) 
              : (isDarkTheme ? 0.35 : 0.5);
            const opacity = (1 - distance / mouseRef.current.radius) * baseMouseOpacity;
            ctx.beginPath();
            ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
            ctx.lineTo(particles[i].x, particles[i].y);
            ctx.strokeStyle = `rgba(${particles[i].r}, ${particles[i].g}, ${particles[i].b}, ${opacity})`;
            ctx.lineWidth = isDashboard ? 0.9 : 1.2;
            ctx.stroke();
          }
        }
      }
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDarkTheme = document.documentElement.classList.contains('dark');

      // Ambient radial lighting blooms adjusted by theme
      if (isDarkTheme) {
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.8, canvas.height * 0.2, 50,
          canvas.width * 0.8, canvas.height * 0.2, 500
        );
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.06)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient2 = ctx.createRadialGradient(
          canvas.width * 0.2, canvas.height * 0.8, 50,
          canvas.width * 0.2, canvas.height * 0.8, 500
        );
        gradient2.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
        gradient2.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Light mode extremely soft and elegant blooms
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.8, canvas.height * 0.2, 50,
          canvas.width * 0.8, canvas.height * 0.2, 500
        );
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.035)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.update();
        p.draw(isDarkTheme);
      });

      // Connect particles with neural net styling
      connectParticles(isDarkTheme);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDashboard]);

  // Handle click pulse effect
  const handleCanvasClick = (e) => {
    const newPulse = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setClickPulses((prev) => [...prev, newPulse]);
    setTimeout(() => {
      setClickPulses((prev) => prev.filter((p) => p.id !== newPulse.id));
    }, 1000);
  };

  // Software workflows floats
  const techBadges = [
    { icon: <FiCode className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />, text: 'DevOps & API', top: '15%', left: '10%' },
    { icon: <FiDatabase className="w-5 h-5 text-teal-600 dark:text-cyan-400" />, text: 'Data Architecture', top: '75%', left: '15%' },
    { icon: <FiCloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />, text: 'Cloud Serverless', top: '25%', right: '12%' },
    { icon: <FiCpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, text: 'AI Automation', top: '70%', right: '10%' },
  ];

  return (
    <div 
      className={`absolute inset-0 w-full h-full overflow-hidden select-none z-0 transition-colors duration-700 ${transparent ? 'bg-transparent' : (isDark ? 'bg-slate-950' : 'bg-slate-50')}`}
      onClick={handleCanvasClick}
    >
      {/* Dynamic Digital Dot Grid */}
      <div 
        className={`absolute inset-0 [background-size:24px_24px] pointer-events-none transition-opacity duration-700 bg-[radial-gradient(ellipse_at_center,#4f46e5_1px,transparent_1px)] dark:bg-[radial-gradient(ellipse_at_center,#ffffff_1px,transparent_1px)] ${isDark ? 'opacity-[0.06]' : 'opacity-[0.09]'}`}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Main constellation mesh canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block cursor-crosshair z-10" 
      />

      {/* Click feedback pulses */}
      <AnimatePresence>
        {clickPulses.map((pulse) => (
          <motion.div
            key={pulse.id}
            initial={{ opacity: 0.8, scale: 0, width: 2, height: 2 }}
            animate={{ opacity: 0, scale: 50, width: 2, height: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: pulse.x,
              top: pulse.y,
              borderRadius: '50%',
              border: isDark ? '2px solid rgba(6, 182, 212, 0.4)' : '2px solid rgba(79, 70, 229, 0.4)',
              boxShadow: isDark ? '0 0 20px rgba(99, 102, 241, 0.3)' : '0 0 15px rgba(79, 70, 229, 0.25)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 12,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Floating Transparent Code Streams */}
      {showCode && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {floatingLines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ y: '110vh', opacity: 0 }}
              animate={{ y: '-20vh', opacity: [0, 0.35, 0.35, 0] }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'linear',
              }}
              className={`absolute font-mono whitespace-nowrap text-left transition-colors duration-500 ${isDark ? 'text-cyan-500/30' : 'text-indigo-600/22'}`}
              style={{
                left: line.left,
                fontSize: `${line.fontSize}px`,
                textShadow: isDark ? '0 0 4px rgba(6, 182, 212, 0.2)' : 'none',
              }}
            >
              {line.text}
            </motion.div>
          ))}
        </div>
      )}

      {/* 3D Floating Technology badges */}
      {showBadges && (
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden hidden md:block">
          {techBadges.map((badge, idx) => {
            const position = badge.left 
              ? { left: badge.left, top: badge.top } 
              : { right: badge.right, top: badge.top };

            return (
              <motion.div
                key={idx}
                animate={{
                  y: [0, -15, 0],
                  rotate: idx % 2 === 0 ? [0, 2, -2, 0] : [0, -2, 2, 0],
                }}
                transition={{
                  duration: 6 + idx * 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  ...position,
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/75 dark:bg-slate-900/40 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:border-indigo-500/25 dark:hover:bg-slate-900/60 transition-all duration-500 cursor-default pointer-events-auto"
              >
                <div className="flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/30 dark:border-white/5 shadow-inner">
                  {badge.icon}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide font-sans">{badge.text}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TechBackground;
