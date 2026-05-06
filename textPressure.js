// Vanilla JS port of TextPressure component from React Bits
// Original font used - https://compressa.preusstype.com/

class TextPressure {
    constructor(elementId, options = {}) {
        this.container = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
        if (!this.container) {
            console.error('TextPressure: container not found');
            return;
        }

        this.options = {
            text: options.text || this.container.innerText || 'Compressa',
            fontFamily: options.fontFamily || 'Compressa VF',
            fontUrl: options.fontUrl || 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
            width: options.width !== undefined ? options.width : true,
            weight: options.weight !== undefined ? options.weight : true,
            italic: options.italic !== undefined ? options.italic : true,
            alpha: options.alpha !== undefined ? options.alpha : false,
            flex: options.flex !== undefined ? options.flex : true,
            stroke: options.stroke !== undefined ? options.stroke : false,
            scale: options.scale !== undefined ? options.scale : false,
            textColor: options.textColor || '#FFFFFF',
            strokeColor: options.strokeColor || '#FF0000',
            minFontSize: options.minFontSize || 24,
            ...options
        };

        this.chars = this.options.text.split('');
        this.spans = [];
        this.mouse = { x: 0, y: 0 };
        this.cursor = { x: 0, y: 0 };
        this.rafId = null;

        this.init();
    }

    init() {
        this.injectStyles();
        this.renderCharacters();
        this.setupEvents();
        this.setSize();
        
        // Start animation loop
        this.animate();
    }

    injectStyles() {
        const styleId = 'text-pressure-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @font-face {
                    font-family: '${this.options.fontFamily}';
                    src: url('${this.options.fontUrl}');
                    font-style: normal;
                }
                .text-pressure-flex {
                    display: flex;
                    justify-content: space-between;
                }
                .text-pressure-stroke span {
                    position: relative;
                    color: ${this.options.textColor};
                }
                .text-pressure-stroke span::after {
                    content: attr(data-char);
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: transparent;
                    z-index: -1;
                    -webkit-text-stroke-width: 3px;
                    -webkit-text-stroke-color: ${this.options.strokeColor};
                }
            `;
            document.head.appendChild(style);
        }
    }

    renderCharacters() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.width = '100%';
        this.container.style.fontFamily = this.options.fontFamily;
        this.container.style.textTransform = 'uppercase';
        this.container.style.textAlign = 'center';
        this.container.style.userSelect = 'none';
        this.container.style.whiteSpace = 'nowrap';
        this.container.style.fontWeight = '100';
        this.container.style.color = this.options.textColor;
        this.container.style.transformOrigin = 'center top';
        this.container.style.margin = '0';

        if (this.options.flex) this.container.classList.add('text-pressure-flex');
        if (this.options.stroke) this.container.classList.add('text-pressure-stroke');

        this.chars.forEach((char) => {
            const span = document.createElement('span');
            span.setAttribute('data-char', char);
            span.textContent = char;
            span.style.display = 'inline-block';
            if (!this.options.stroke) {
                span.style.color = this.options.textColor;
            }
            this.container.appendChild(span);
            this.spans.push(span);
        });
    }

    setupEvents() {
        this.handleMouseMove = (e) => {
            this.cursor.x = e.clientX;
            this.cursor.y = e.clientY;
        };
        this.handleTouchMove = (e) => {
            const t = e.touches[0];
            this.cursor.x = t.clientX;
            this.cursor.y = t.clientY;
        };

        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('touchmove', this.handleTouchMove, { passive: true });

        const rect = this.container.getBoundingClientRect();
        this.mouse.x = rect.left + rect.width / 2;
        this.mouse.y = rect.top + rect.height / 2;
        this.cursor.x = this.mouse.x;
        this.cursor.y = this.mouse.y;

        this.debouncedSetSize = this.debounce(() => this.setSize(), 100);
        window.addEventListener('resize', this.debouncedSetSize);
    }

    setSize() {
        if (!this.container) return;

        // In a typical layout, the parent provides width.
        const parentW = this.container.parentElement ? this.container.parentElement.getBoundingClientRect().width : window.innerWidth;
        const containerH = this.container.parentElement ? this.container.parentElement.getBoundingClientRect().height : window.innerHeight;

        let newFontSize = parentW / (this.chars.length / 2);
        newFontSize = Math.max(newFontSize, this.options.minFontSize);

        this.container.style.fontSize = `${newFontSize}px`;
        
        requestAnimationFrame(() => {
            const textRect = this.container.getBoundingClientRect();
            if (this.options.scale && textRect.height > 0) {
                const yRatio = containerH / textRect.height;
                this.container.style.transform = `scale(1, ${yRatio})`;
                this.container.style.lineHeight = `${yRatio}`;
            } else {
                this.container.style.transform = `scale(1, 1)`;
                this.container.style.lineHeight = '1';
            }
        });
    }

    animate() {
        this.mouse.x += (this.cursor.x - this.mouse.x) / 15;
        this.mouse.y += (this.cursor.y - this.mouse.y) / 15;

        const titleRect = this.container.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        this.spans.forEach((span) => {
            const rect = span.getBoundingClientRect();
            const charCenter = {
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2
            };

            const d = this.dist(this.mouse, charCenter);

            const wdth = this.options.width ? Math.floor(this.getAttr(d, maxDist, 5, 200)) : 100;
            const wght = this.options.weight ? Math.floor(this.getAttr(d, maxDist, 100, 900)) : 400;
            const italVal = this.options.italic ? this.getAttr(d, maxDist, 0, 1).toFixed(2) : 0;
            const alphaVal = this.options.alpha ? this.getAttr(d, maxDist, 0, 1).toFixed(2) : 1;

            const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

            if (span.style.fontVariationSettings !== newFontVariationSettings) {
                span.style.fontVariationSettings = newFontVariationSettings;
            }
            if (this.options.alpha && span.style.opacity !== alphaVal) {
                span.style.opacity = alphaVal;
            }
        });

        this.rafId = requestAnimationFrame(() => this.animate());
    }

    dist(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getAttr(distance, maxDist, minVal, maxVal) {
        const val = maxVal - Math.abs((maxVal * distance) / maxDist);
        return Math.max(minVal, val + minVal);
    }

    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    destroy() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('resize', this.debouncedSetSize);
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }
}

// Export for module usage or attach to window
if (typeof window !== 'undefined') {
    window.TextPressure = TextPressure;
}
