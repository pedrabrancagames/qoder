/**
 * Sistema de Efeitos Visuais - Ghostbusters AR
 * Implementa partículas, animações e efeitos especiais para o jogo
 */

class VisualEffectsSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.effects = [];
        this.animationId = null;
        this.isRunning = false;
        
        // Configurações
        this.config = {
            maxParticles: 500,
            ghostCaptureParticles: 100,
            suctionParticles: 50,
            celebrationParticles: 150,
            protonBeamWidth: 8,
            effectDuration: 3000
        };
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupCanvas();
        this.start();
        console.log('🎨 Sistema de Efeitos Visuais inicializado');
    }
    
    createCanvas() {
        // Remove canvas existente se houver
        const existingCanvas = document.getElementById('effects-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Cria novo canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'effects-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.style.background = 'transparent';
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }
    
    setupCanvas() {
        const updateSize = () => {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            this.ctx.scale(dpr, dpr);
        };
        
        updateSize();
        window.addEventListener('resize', updateSize);
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Atualizar e renderizar partículas
        this.updateParticles();
        this.renderParticles();
        
        // Atualizar efeitos especiais
        this.updateEffects();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
    }
    
    updateEffects() {
        this.effects = this.effects.filter(effect => {
            effect.update();
            effect.render(this.ctx);
            return effect.active;
        });
    }
    
    // Efeito de celebração ao capturar fantasma
    showCelebrationEffect(x, y, type = 'ghost_captured') {
        const colors = this.getCelebrationColors(type);
        const particleCount = type === 'ecto1_unlocked' ? 200 : this.config.celebrationParticles;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new CelebrationParticle(x, y, colors);
            this.particles.push(particle);
        }
        
        // Efeito de explosão circular
        const explosion = new ExplosionEffect(x, y, colors, type);
        this.effects.push(explosion);
        
        // Feedback tátil se disponível
        this.triggerHapticFeedback();
        
        console.log(`🎉 Efeito de celebração: ${type} em (${x}, ${y})`);
    }
    
    // Efeito de sucção do fantasma para a proton pack
    showSuctionEffect(fromX, fromY, toX, toY) {
        // Partículas de sucção
        for (let i = 0; i < this.config.suctionParticles; i++) {
            const particle = new SuctionParticle(fromX, fromY, toX, toY);
            this.particles.push(particle);
        }
        
        // Linha de conexão energética
        const connection = new EnergyConnection(fromX, fromY, toX, toY);
        this.effects.push(connection);
        
        console.log(`🌪️ Efeito de sucção de (${fromX}, ${fromY}) para (${toX}, ${toY})`);
    }
    
    // Efeito do feixe de prótons
    startProtonBeamEffect() {
        // Remove feixe anterior se existir
        this.stopProtonBeamEffect();
        
        // Cria novo feixe
        const beam = new ProtonBeamEffect();
        this.effects.push(beam);
        
        console.log('⚡ Feixe de prótons iniciado');
    }
    
    stopProtonBeamEffect() {
        this.effects = this.effects.filter(effect => effect.type !== 'proton_beam');
        console.log('⚡ Feixe de prótons parado');
    }
    
    // Efeito de falha na captura
    showCaptureFailEffect(x, y) {
        const colors = ['#FF4444', '#FF6666', '#FF8888'];
        
        for (let i = 0; i < 30; i++) {
            const particle = new FailureParticle(x, y, colors);
            this.particles.push(particle);
        }
        
        // Efeito de "X" vermelho
        const failureX = new FailureXEffect(x, y);
        this.effects.push(failureX);
        
        console.log(`❌ Efeito de falha em (${x}, ${y})`);
    }
    
    // Limpar todos os efeitos
    clearAllEffects() {
        this.particles = [];
        this.effects = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('🧹 Todos os efeitos limpos');
    }
    
    getCelebrationColors(type) {
        switch (type) {
            case 'ghost_captured':
                return ['#92F428', '#CDDC39', '#8BC34A', '#4CAF50'];
            case 'ecto1_unlocked':
                return ['#FFD700', '#FF6347', '#FFA500', '#FF4500'];
            case 'inventory_full':
                return ['#2196F3', '#03DAC6', '#00BCD4', '#0097A7'];
            default:
                return ['#92F428', '#CDDC39', '#8BC34A'];
        }
    }
    
    triggerHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
}

// Classe base para partículas
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.size = 2;
        this.color = '#FFFFFF';
        this.alpha = 1.0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.016; // ~60fps
        this.alpha = this.life / this.maxLife;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Partícula de celebração
class CelebrationParticle extends Particle {
    constructor(x, y, colors) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.gravity = 0.1;
        this.life = 2.0 + Math.random();
        this.maxLife = this.life;
        this.size = 2 + Math.random() * 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.spin = Math.random() * 0.2;
        this.angle = 0;
    }
    
    update() {
        super.update();
        this.vy += this.gravity;
        this.angle += this.spin;
        this.size *= 0.99;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// Partícula de sucção
class SuctionParticle extends Particle {
    constructor(fromX, fromY, toX, toY) {
        super(fromX, fromY);
        this.startX = fromX;
        this.startY = fromY;
        this.targetX = toX;
        this.targetY = toY;
        this.progress = 0;
        this.speed = 0.02 + Math.random() * 0.03;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.size = 1 + Math.random() * 3;
        this.color = '#00FFFF';
        this.trail = [];
    }
    
    update() {
        this.progress += this.speed;
        
        // Movimento suave com curva
        const curve = Math.sin(this.progress * Math.PI) * 0.5;
        this.x = this.startX + (this.targetX - this.startX) * this.progress;
        this.y = this.startY + (this.targetY - this.startY) * this.progress + curve * 20;
        
        // Adicionar à trilha
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) {
            this.trail.shift();
        }
        
        if (this.progress >= 1.0) {
            this.life = 0;
        }
    }
    
    render(ctx) {
        // Renderizar trilha
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        this.trail.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        ctx.restore();
        
        // Renderizar partícula
        super.render(ctx);
    }
}

// Partícula de falha
class FailureParticle extends Particle {
    constructor(x, y, colors) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1.0 + Math.random() * 0.5;
        this.maxLife = this.life;
        this.size = 2 + Math.random() * 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        super.update();
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
}

// Efeito de explosão
class ExplosionEffect {
    constructor(x, y, colors, type) {
        this.x = x;
        this.y = y;
        this.colors = colors;
        this.type = type;
        this.radius = 0;
        this.maxRadius = type === 'ecto1_unlocked' ? 100 : 50;
        this.life = 1.0;
        this.active = true;
        this.rings = 3;
    }
    
    update() {
        this.radius += 2;
        this.life -= 0.02;
        
        if (this.radius > this.maxRadius || this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.3;
        
        for (let i = 0; i < this.rings; i++) {
            const ringRadius = this.radius - (i * 15);
            if (ringRadius > 0) {
                ctx.strokeStyle = this.colors[i % this.colors.length];
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
}

// Efeito de conexão energética
class EnergyConnection {
    constructor(fromX, fromY, toX, toY) {
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.life = 1.0;
        this.active = true;
        this.lightning = [];
        this.generateLightning();
    }
    
    generateLightning() {
        const segments = 10;
        const dx = (this.toX - this.fromX) / segments;
        const dy = (this.toY - this.fromY) / segments;
        
        this.lightning = [{ x: this.fromX, y: this.fromY }];
        
        for (let i = 1; i < segments; i++) {
            const x = this.fromX + dx * i + (Math.random() - 0.5) * 20;
            const y = this.fromY + dy * i + (Math.random() - 0.5) * 20;
            this.lightning.push({ x, y });
        }
        
        this.lightning.push({ x: this.toX, y: this.toY });
    }
    
    update() {
        this.life -= 0.05;
        if (this.life <= 0) {
            this.active = false;
        }
        
        // Regenerar raio ocasionalmente
        if (Math.random() < 0.3) {
            this.generateLightning();
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        this.lightning.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        
        ctx.restore();
    }
}

// Efeito do feixe de prótons
class ProtonBeamEffect {
    constructor() {
        this.type = 'proton_beam';
        this.active = true;
        this.intensity = 1.0;
        this.particles = [];
    }
    
    update() {
        // Adicionar partículas do feixe
        for (let i = 0; i < 5; i++) {
            const particle = new ProtonParticle();
            this.particles.push(particle);
        }
        
        // Atualizar partículas existentes
        this.particles = this.particles.filter(p => {
            p.update();
            return p.life > 0;
        });
    }
    
    render(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }
}

// Partícula do feixe de prótons
class ProtonParticle extends Particle {
    constructor() {
        const centerX = window.innerWidth / 2;
        const bottomY = window.innerHeight - 100;
        
        super(centerX + (Math.random() - 0.5) * 20, bottomY);
        this.vy = -5 - Math.random() * 3;
        this.vx = (Math.random() - 0.5) * 2;
        this.life = 0.5 + Math.random() * 0.5;
        this.maxLife = this.life;
        this.size = 2 + Math.random() * 3;
        this.color = '#92F428';
    }
}

// Efeito de X vermelho para falhas
class FailureXEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = 40;
        this.life = 1.0;
        this.active = true;
    }
    
    update() {
        if (this.size < this.maxSize) {
            this.size += 2;
        } else {
            this.life -= 0.03;
        }
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // Desenhar X
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2, this.y - this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
        ctx.moveTo(this.x + this.size/2, this.y - this.size/2);
        ctx.lineTo(this.x - this.size/2, this.y + this.size/2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Inicializar sistema globalmente
window.visualEffectsSystem = new VisualEffectsSystem();

console.log('🎨 Sistema de Efeitos Visuais carregado com sucesso!');