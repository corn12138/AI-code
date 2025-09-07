'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
}

export const StarryBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 设置canvas尺寸
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 生成星星
        const generateStars = () => {
            const stars: Star[] = [];
            const numStars = Math.floor((canvas.width * canvas.height) / 20000); // 根据屏幕大小调整星星数量

            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.8 + 0.2,
                    speed: Math.random() * 0.5 + 0.1,
                });
            }
            return stars;
        };

        starsRef.current = generateStars();

        // 动画循环
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制星星
            starsRef.current.forEach((star) => {
                ctx.save();
                ctx.globalAlpha = star.opacity;
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#6366ff';
                ctx.shadowBlur = star.size * 2;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // 更新星星位置
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div
            data-testid="starry-background"
            className="relative min-h-screen bg-gradient-to-br from-space-950 via-space-900 to-space-800 overflow-hidden"
        >
            {/* 星空背景 */}
            <canvas
                ref={canvasRef}
                data-testid="starry-canvas"
                className="fixed inset-0 pointer-events-none z-0"
                style={{ background: 'transparent' }}
            />

            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-900/50 to-space-950/80 pointer-events-none z-10" />

            {/* 内容 */}
            <div
                data-testid="starry-content"
                className="relative z-20"
            >
                {children}
            </div>
        </div>
    );
};

// 星空粒子效果组件
export const StarryParticles: React.FC = () => {
    return (
        <div
            data-testid="starry-particles"
            className="fixed inset-0 pointer-events-none z-0"
        >
            {/* 大星星 */}
            <div
                data-testid="particle-0"
                className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full animate-pulse-slow shadow-cosmic transform-gpu"
            />
            <div
                data-testid="particle-1"
                className="absolute top-40 right-32 w-1.5 h-1.5 bg-nebula-400 rounded-full animate-float shadow-nebula transform-gpu"
            />
            <div
                data-testid="particle-2"
                className="absolute top-60 left-1/3 w-1 h-1 bg-stardust-300 rounded-full animate-glow shadow-stardust transform-gpu"
            />

            {/* 中星星 */}
            <div
                data-testid="particle-3"
                className="absolute top-80 right-20 w-0.5 h-0.5 bg-white rounded-full animate-pulse-slow transform-gpu"
            />
            <div
                data-testid="particle-4"
                className="absolute top-96 left-1/4 w-0.5 h-0.5 bg-nebula-300 rounded-full animate-float transform-gpu"
            />

            {/* 小星星 */}
            <div
                data-testid="particle-5"
                className="absolute top-32 left-1/2 w-0.5 h-0.5 bg-stardust-200 rounded-full animate-pulse-slow transform-gpu"
            />
            <div
                data-testid="particle-6"
                className="absolute top-48 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-float transform-gpu"
            />
            <div
                data-testid="particle-7"
                className="absolute top-64 left-2/3 w-0.5 h-0.5 bg-nebula-200 rounded-full animate-glow transform-gpu"
            />
        </div>
    );
};
