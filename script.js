
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.querySelector('.progress-bar');
        this.progress = document.getElementById('progress');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.trackTitle = document.getElementById('trackTitle');
        this.trackArtist = document.getElementById('trackArtist');
        this.albumArt = document.getElementById('albumArt');
        this.audioUpload = document.getElementById('audioUpload');
        this.playlistContainer = document.querySelector('.playlist-container');
        
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isDragging = false;
        this.lastProgressUpdate = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setVolume(50);
        this.loadSampleTrack();
    }
    
    setupEventListeners() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Previous/Next buttons
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.setProgress(e));
        this.progressHandle.addEventListener('mousedown', () => this.startDragging());
        document.addEventListener('mousemove', (e) => this.handleDragging(e));
        document.addEventListener('mouseup', () => this.stopDragging());
        
        // Volume control
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextTrack());
        
        // File upload
        this.audioUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    loadSampleTrack() {
        const sampleTrack = {
            title: 'Sample Track 1',
            artist: 'Demo Artist',
            src: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            albumArt: './attached_assets/icon_1753919744489.png'
        };
        
        this.playlist = [sampleTrack];
        this.loadTrack(0);
    }
    
    togglePlayPause() {
        if (this.playlist.length === 0) return;
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        this.audio.play();
        this.isPlaying = true;
        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        document.body.classList.add('playing');
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        document.body.classList.remove('playing');
    }
    
    previousTrack() {
        if (this.playlist.length === 0) return;
        
        this.currentTrackIndex = this.currentTrackIndex === 0 
            ? this.playlist.length - 1 
            : this.currentTrackIndex - 1;
        
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) this.play();
    }
    
    nextTrack() {
        if (this.playlist.length === 0) return;
        
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) this.play();
    }
    
    loadTrack(index) {
        if (!this.playlist[index]) return;
        
        const track = this.playlist[index];
        this.audio.src = track.src;
        this.trackTitle.textContent = track.title;
        this.trackArtist.textContent = track.artist;
        this.albumArt.src = track.albumArt || './attached_assets/icon_1753919744489.png';
        
        this.updatePlaylistDisplay();
        this.resetProgress();
    }
    
    setProgress(e) {
        if (this.audio.duration) {
            const rect = this.progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = percent * this.audio.duration;
            this.audio.currentTime = newTime;
        }
    }
    
    startDragging() {
        this.isDragging = true;
    }
    
    handleDragging(e) {
        if (!this.isDragging || !this.audio.duration) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = percent * this.audio.duration;
        this.audio.currentTime = newTime;
    }
    
    stopDragging() {
        this.isDragging = false;
    }
    
    updateProgress() {
        const now = Date.now();
        if (!this.isDragging && this.audio.duration && (now - this.lastProgressUpdate > 100)) {
            this.lastProgressUpdate = now;
            requestAnimationFrame(() => {
                const percent = (this.audio.currentTime / this.audio.duration) * 100;
                this.progress.style.width = percent + '%';
                this.progressHandle.style.left = percent + '%';
                this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
            });
        }
    }
    
    updateDuration() {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
    }
    
    resetProgress() {
        this.progress.style.width = '0%';
        this.progressHandle.style.left = '0%';
        this.currentTimeEl.textContent = '0:00';
        this.durationEl.textContent = '0:00';
    }
    
    setVolume(value) {
        this.audio.volume = value / 100;
        this.volumeSlider.value = value;
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    handleFileUpload(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                const url = URL.createObjectURL(file);
                const track = {
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    artist: 'Unknown Artist',
                    src: url,
                    albumArt: './attached_assets/icon_1753919744489.png'
                };
                
                this.playlist.push(track);
                this.updatePlaylistDisplay();
                
                // If no track is loaded, load the first uploaded track
                if (this.playlist.length === 1) {
                    this.loadTrack(0);
                }
            }
        });
        
        // Clear the file input
        e.target.value = '';
    }
    
    updatePlaylistDisplay() {
        const playlistItems = this.playlistContainer.querySelectorAll('.playlist-item:not(.upload-section)');
        playlistItems.forEach(item => item.remove());
        
        this.playlist.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = `playlist-item ${index === this.currentTrackIndex ? 'active' : ''}`;
            item.innerHTML = `
                <i class="fas fa-music"></i>
                <div class="track-details">
                    <span class="track-name">${track.title}</span>
                    <span class="track-artist">${track.artist}</span>
                </div>
                <span class="track-duration">--:--</span>
            `;
            
            item.addEventListener('click', () => {
                this.currentTrackIndex = index;
                this.loadTrack(index);
                if (this.isPlaying) this.play();
            });
            
            this.playlistContainer.insertBefore(item, this.playlistContainer.lastElementChild);
        });
    }
    
    handleKeyboard(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.previousTrack();
                }
                break;
            case 'ArrowRight':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.nextTrack();
                }
                break;
            case 'ArrowUp':
                if (e.ctrlKey) {
                    e.preventDefault();
                    const newVolume = Math.min(100, parseInt(this.volumeSlider.value) + 10);
                    this.setVolume(newVolume);
                }
                break;
            case 'ArrowDown':
                if (e.ctrlKey) {
                    e.preventDefault();
                    const newVolume = Math.max(0, parseInt(this.volumeSlider.value) - 10);
                    this.setVolume(newVolume);
                }
                break;
        }
    }
}

// Initialize the music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});
