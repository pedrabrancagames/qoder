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
        this.isInitialized = false;
        
        // Configurações
        this.config = {
            maxParticles: 500,
            ghostCaptureParticles: 100,
            suctionParticles: 50,
            celebrationParticles: 150,
            protonBeamWidth: 8,
            effectDuration: 3000
        };
        
        // Aguardar carregamento da página antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // Se já carregou, aguardar um pouco para garantir que body existe
            setTimeout(() => this.init(), 100);
        }
    }
    
    init() {
        if (!document.body) {
            console.warn('⚠️ document.body não disponível, tentando novamente em 200ms...');
            setTimeout(() => this.init(), 200);
            return;
        }
        
        try {
            this.createCanvas();
            this.setupCanvas();
            this.start();
            this.isInitialized = true;
            console.log('🎨 Sistema de Efeitos Visuais inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar Sistema de Efeitos Visuais:', error);
            // Tentar novamente em 500ms
            setTimeout(() => this.init(), 500);
        }
    }
    
    createCanvas() {
        console.log('🖼️ Criando canvas para efeitos visuais...');
        
        // Remove canvas existente se houver
        const existingCanvas = document.getElementById('effects-canvas');
        if (existingCanvas) {
            console.log('🖼️ Removendo canvas existente');
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
        
        console.log('🖼️ Canvas criado com sucesso:', {
            width: this.canvas.width,
            height: this.canvas.height,
            context: !!this.ctx,
            parent: this.canvas.parentElement?.tagName
        });
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
        
        // Verificar se o canvas ainda existe
        if (!this.canvas || !this.canvas.parentElement) {
            console.warn('⚠️ Canvas perdido, recriando...');
            this.createCanvas();
            this.setupCanvas();
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Debug: desenhar fundo semi-transparente ocasionalmente para verificar se canvas funciona
        if (this.particles.length > 0 || this.effects.length > 0) {
            // Pequeno indicador visual no canto para confirmar que o canvas está funcionando
            this.ctx.fillStyle = 'rgba(146, 244, 40, 0.1)';
            this.ctx.fillRect(0, 0, 50, 50);
        }
        
        // Atualizar e renderizar partículas
        this.updateParticles();
        this.renderParticles();
        
        // Atualizar efeitos especiais
        this.updateEffects();
        
        // Debug info
        if (this.particles.length > 0 || this.effects.length > 0) {
            console.log(`🎨 Renderizando: ${this.particles.length} partículas, ${this.effects.length} efeitos`);
        }
        
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
        if (!this.isInitialized) {
            console.warn('⚠️ Sistema de efeitos não inicializado ainda');
            return;
        }
        
        // Se as coordenadas não foram fornecidas, usar centro da tela
        if (!x || !y) {
            x = window.innerWidth / 2;
            y = window.innerHeight / 2;
        }
        
        const colors = this.getCelebrationColors(type);
        const particleCount = type === 'ecto1_unlocked' ? 400 : 300; // Ainda mais partículas
        
        // Partículas principais
        for (let i = 0; i < particleCount; i++) {
            const particle = new CelebrationParticle(x, y, colors);
            this.particles.push(particle);
        }
        
        // Efeito de explosão circular mais intenso
        const explosion = new ExplosionEffect(x, y, colors, type);
        this.effects.push(explosion);
        
        // Partículas extras em múltiplos círculos
        for (let ring = 1; ring <= 3; ring++) {
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const radius = ring * 40 + Math.random() * 30;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                const particle = new CelebrationParticle(px, py, colors);
                particle.life *= (1.5 - ring * 0.2); // Círculos externos duram menos
                this.particles.push(particle);
            }
        }
        
        // Partículas em estrela
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            for (let j = 0; j < 15; j++) {
                const radius = j * 10 + Math.random() * 20;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                const particle = new CelebrationParticle(px, py, colors);
                particle.size *= 1.5; // Partículas maiores
                this.particles.push(particle);
            }
        }
        
        // Feedback tátil se disponível
        this.triggerHapticFeedback();
        
        console.log(`🎉 Efeito de celebração INTENSO: ${type} em (${x}, ${y}) com ${this.particles.length} partículas`);
    }
    
    // Efeito de sucção do fantasma para a proton pack
    showSuctionEffect(fromX, fromY, toX, toY) {
        // Partículas de sucção MUITO mais intensas
        for (let i = 0; i < this.config.suctionParticles * 4; i++) { // Quadruplicar partículas
            const particle = new SuctionParticle(fromX, fromY, toX, toY);
            this.particles.push(particle);
        }
        
        // Múltiplas linhas de conexão energética
        for (let i = 0; i < 3; i++) {
            const connection = new EnergyConnection(
                fromX + (Math.random() - 0.5) * 20,
                fromY + (Math.random() - 0.5) * 20,
                toX + (Math.random() - 0.5) * 20,
                toY + (Math.random() - 0.5) * 20
            );
            this.effects.push(connection);
        }
        
        // Partículas em espiral ao redor do ponto de origem
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI * 4; // Espiral dupla
            const radius = 20 + (i / 60) * 50;
            const px = fromX + Math.cos(angle) * radius;
            const py = fromY + Math.sin(angle) * radius;
            const particle = new SuctionParticle(px, py, toX, toY);
            particle.speed *= 0.7 + (i / 60) * 0.6; // Velocidade variável
            this.particles.push(particle);
        }
        
        // Partículas de borda do fantasma
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const radius = 40 + Math.random() * 20;
            const px = fromX + Math.cos(angle) * radius;
            const py = fromY + Math.sin(angle) * radius;
            const particle = new SuctionParticle(px, py, toX, toY);
            particle.color = '#00FFFF';
            particle.size *= 1.5;
            this.particles.push(particle);
        }
        
        console.log(`🌪️ Efeito de sucção DRAMATIZADO de (${fromX}, ${fromY}) para (${toX}, ${toY}) com ${this.particles.length} partículas`);
    }
    
    // Efeito do feixe de prótons
    startProtonBeamEffect() {
        console.log('⚡ Iniciando feixe de prótons - sistema inicializado:', this.isInitialized);
        
        if (!this.isInitialized) {
            console.warn('⚠️ Sistema não inicializado, tentando novamente em 500ms...');
            setTimeout(() => this.startProtonBeamEffect(), 500);
            return;
        }
        
        // Remove feixe anterior se existir
        this.stopProtonBeamEffect();
        
        // Cria novo feixe
        const beam = new ProtonBeamEffect();
        this.effects.push(beam);
        
        console.log('⚡ Feixe de prótons criado - total de efeitos:', this.effects.length);
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
    
    // Função de teste visual
    testVisualEffects() {
        console.log('📝 TESTE VISUAL DE EFEITOS INICIADO');
        console.log('Sistema inicializado:', this.isInitialized);
        console.log('Canvas:', this.canvas);
        console.log('Context:', this.ctx);
        console.log('Dimensões:', this.canvas?.width, 'x', this.canvas?.height);
        
        if (!this.isInitialized) {
            console.error('❌ Sistema não inicializado!');
            return;
        }
        
        // Teste 1: Desenhar retângulo vermelho
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(100, 100, 100, 100);
        console.log('🔴 Retângulo vermelho desenhado');
        
        // Teste 2: Celebração no centro
        setTimeout(() => {
            this.showCelebrationEffect(window.innerWidth / 2, window.innerHeight / 2, 'ghost_captured');
            console.log('🎉 Celebração ativada');
        }, 1000);
        
        // Teste 3: Feixe de prótons
        setTimeout(() => {
            this.startProtonBeamEffect();
            console.log('⚡ Feixe de prótons ativado');
        }, 2000);
        
        // Teste 4: Sucção
        setTimeout(() => {
            this.showSuctionEffect(
                window.innerWidth / 2 - 100, 
                window.innerHeight / 2 - 100,
                window.innerWidth / 2 + 100, 
                window.innerHeight / 2 + 100
            );
            console.log('🌪️ Sucção ativada');
        }, 3000);
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
        this.vx = (Math.random() - 0.5) * 12; // Velocidade mais alta
        this.vy = (Math.random() - 0.5) * 12 - 3;
        this.gravity = 0.08;
        this.life = 3.0 + Math.random() * 2; // Vida mais longa
        this.maxLife = this.life;
        this.size = 4 + Math.random() * 8; // Partículas maiores
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.spin = Math.random() * 0.3;
        this.angle = 0;
        this.glow = 20 + Math.random() * 20; // Muito brilho
        this.sparkle = Math.random() < 0.3; // 30% são estrelas
    }
    
    update() {
        super.update();
        this.vy += this.gravity;
        this.angle += this.spin;
        this.size *= 0.995; // Diminui mais devagar
        
        // Efeito de cintilação
        if (this.sparkle && Math.random() < 0.1) {
            this.size *= 1.5;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.sparkle) {
            // Desenhar estrela
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 144) * Math.PI / 180;
                const x = Math.cos(angle) * this.size;
                const y = Math.sin(angle) * this.size;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // Desenhar retângulo brilhante
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        }
        
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
        this.speed = 0.015 + Math.random() * 0.025; // Velocidade mais variada
        this.life = 1.0;
        this.maxLife = 1.0;
        this.size = 2 + Math.random() * 5; // Partículas maiores
        this.color = ['#00FFFF', '#40E0D0', '#00CED1', '#5F9EA0'][Math.floor(Math.random() * 4)];
        this.trail = [];
        this.glow = 15 + Math.random() * 15;
        this.curve = (Math.random() - 0.5) * 60; // Curva mais pronunciada
    }
    
    update() {
        this.progress += this.speed;
        
        // Movimento suave com curva mais dramática
        const curve = Math.sin(this.progress * Math.PI) * this.curve;
        const easeProgress = this.easeInOut(this.progress);
        
        this.x = this.startX + (this.targetX - this.startX) * easeProgress;
        this.y = this.startY + (this.targetY - this.startY) * easeProgress + curve;
        
        // Adicionar à trilha
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > 15) { // Trilha mais longa
            this.trail.shift();
        }
        
        // Acelerar conforme se aproxima do alvo
        this.speed *= 1.02;
        
        if (this.progress >= 1.0) {
            this.life = 0;
        }
    }
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    render(ctx) {
        // Renderizar trilha com gradiente
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow * 0.5;
        
        ctx.beginPath();
        this.trail.forEach((point, index) => {
            const alpha = (index / this.trail.length) * 0.6;
            ctx.globalAlpha = alpha;
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        ctx.restore();
        
        // Renderizar partícula principal com brilho
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Anel externo
        ctx.globalAlpha = this.alpha * 0.3;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
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
        this.maxRadius = type === 'ecto1_unlocked' ? 150 : 100; // Explosão maior
        this.life = 1.0;
        this.active = true;
        this.rings = 5; // Mais anéis
        this.pulseIntensity = 1.0;
    }
    
    update() {
        this.radius += 3; // Crescimento mais rápido
        this.life -= 0.015; // Dura mais tempo
        this.pulseIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2; // Pulsação
        
        if (this.radius > this.maxRadius || this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        for (let i = 0; i < this.rings; i++) {
            const ringRadius = this.radius - (i * 20);
            if (ringRadius > 0) {
                const alpha = (this.life * 0.5 * this.pulseIntensity) * (1 - i * 0.15);
                
                // Anel principal
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = this.colors[i % this.colors.length];
                ctx.lineWidth = 4 + (this.rings - i);
                ctx.shadowColor = this.colors[i % this.colors.length];
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Anel interno brilhante
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = this.colors[i % this.colors.length];
                ctx.beginPath();
                ctx.arc(this.x, this.y, ringRadius * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Centro brilhante
        if (this.radius < this.maxRadius * 0.5) {
            ctx.globalAlpha = this.life * 0.8;
            ctx.fillStyle = this.colors[0];
            ctx.shadowColor = this.colors[0];
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15 * this.pulseIntensity, 0, Math.PI * 2);
            ctx.fill();
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
        this.particleTimer = 0;
    }
    
    update() {
        // Adicionar partículas do feixe mais frequentemente
        this.particleTimer++;
        if (this.particleTimer % 2 === 0) { // A cada 2 frames
            for (let i = 0; i < 8; i++) { // Mais partículas
                const particle = new ProtonParticle();
                this.particles.push(particle);
            }
        }
        
        // Atualizar partículas existentes
        this.particles = this.particles.filter(p => {
            p.update();
            return p.life > 0;
        });
    }
    
    render(ctx) {
        // Renderizar linha central do feixe
        ctx.save();
        ctx.strokeStyle = '#92F428';
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = '#92F428';
        ctx.shadowBlur = 20;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const protonX = window.innerWidth - 60;
        const protonY = window.innerHeight - 60;
        
        // Linha principal do feixe
        ctx.beginPath();
        ctx.moveTo(protonX, protonY);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
        
        // Linha secundária para mais espessura
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#CDDC39';
        ctx.beginPath();
        ctx.moveTo(protonX + 5, protonY);
        ctx.lineTo(centerX + 5, centerY);
        ctx.stroke();
        
        ctx.restore();
        
        // Renderizar partículas
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }
}

// Partícula do feixe de prótons
class ProtonParticle extends Particle {
    constructor() {
        // Posicão inicial: perto da proton pack (canto inferior direito)
        const startX = window.innerWidth - 80 + (Math.random() - 0.5) * 40;
        const startY = window.innerHeight - 80 + (Math.random() - 0.5) * 40;
        
        super(startX, startY);
        
        // Direção para o centro da tela (onde está o fantasma)
        const targetX = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
        const targetY = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const speed = 12 + Math.random() * 8; // Velocidade mais alta
        this.vx = (dx / distance) * speed;
        this.vy = (dy / distance) * speed;
        
        this.life = 0.6 + Math.random() * 0.6;
        this.maxLife = this.life;
        this.size = 4 + Math.random() * 6; // Partículas maiores
        this.color = ['#92F428', '#CDDC39', '#8BC34A', '#00FF00'][Math.floor(Math.random() * 4)];
        this.glow = 15 + Math.random() * 15; // Mais brilho
        this.trail = [];
    }
    
    update() {
        super.update();
        
        // Adicionar rastro
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > 8) {
            this.trail.shift();
        }
    }
    
    render(ctx) {
        // Renderizar rastro
        ctx.save();
        this.trail.forEach((point, index) => {
            const trailAlpha = (index / this.trail.length) * this.alpha * 0.3;
            ctx.globalAlpha = trailAlpha;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.glow * 0.5;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        
        // Renderizar partícula principal
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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

// Inicializar sistema globalmente quando a página estiver pronta
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.visualEffectsSystem = new VisualEffectsSystem();
        });
    } else {
        window.visualEffectsSystem = new VisualEffectsSystem();
    }
}

console.log('🎨 Sistema de Efeitos Visuais carregado com sucesso!');