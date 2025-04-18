// visualizer.js 内容
class AudioVisualizer {
    constructor(config) {
        this.config = {
            audioElement: '#backgroundMusic',
            canvasElement: '#audioCanvas',
            fftSize: 512,
            ...config
        };

        this.initDom();
        this.initEvents();
    }

    initDom() {
        this.audio = document.querySelector(this.config.audioElement);
        this.canvas = document.querySelector(this.config.canvasElement);
        this.ctx = this.canvas.getContext('2d');
        this.statusElement = document.querySelector('.visualizer-status');
        
        this.resizeCanvas();
        this.drawInitialLine();
    }

    initEvents() {
        // 点击容器初始化
        this.canvas.addEventListener('click', () => {
            if (!this.audioContext) this.initAudio();
            this.togglePlay();
        });

        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (!this.isPlaying) this.drawInitialLine();
        });
    }

    initAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.config.fftSize;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const source = this.audioContext.createMediaElementSource(this.audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * devicePixelRatio;
        this.canvas.height = rect.height * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    drawInitialLine() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height/2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height/2);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            this.isPlaying = true;
            this.statusElement.style.display = 'none';
            this.animate();
        } else {
            this.audio.pause();
            this.isPlaying = false;
            this.statusElement.style.display = 'block';
            this.drawInitialLine();
        }
    }

    animate() {
        if (!this.isPlaying) return;

        this.analyser.getByteFrequencyData(this.dataArray);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const center = this.dataArray.length / 2;
        const maxHeight = this.canvas.height * 0.8;
        const barWidth = this.canvas.width / this.dataArray.length;

        for (let i = 0; i < this.dataArray.length; i++) {
            const distance = Math.abs(i - center);
            const weight = 1 - (distance / center);
            const height = (this.dataArray[i] / 255) * maxHeight * weight * 1.5;

            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(
                i * barWidth,
                this.canvas.height - height,
                barWidth,
                height
            );
        }

        requestAnimationFrame(() => this.animate());
    }
}

// 初始化可视化实例
const visualizer = new AudioVisualizer({
    audioElement: '#backgroundMusic',  // 与页面中的audio元素ID对应
    canvasElement: '#audioCanvas',     // 可视化canvas的ID
    fftSize: 1024                      // 可调节频谱分辨率
});