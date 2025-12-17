export class SoundManager {

    constructor() {
        // i use map to store audio elements
        // key:soundID value:audio element
        this.audioElements = new Map();
        this.isPlaying = false;
        //console.log('sound manager created');

    }

    loadSound(soundID, filePath) {
        try {
           // console.log(`loading sound ${soundID} from ${filePath}`);
            const audio = new Audio();
            audio.src = filePath;
            audio.loop = true;
            audio.preload = 'metadata';

            // add sound to map elements
            this.audioElements.set(soundID, audio);
            return true;
        } catch (error) {
            console.error(`Error loading sound ${soundID}:`, error);
            return false;

        }
    }

    // play a sound by its ID
    async playSound(soundId) {
        const audio = this.audioElements.get(soundId);
        if (audio) {
            try {
                await audio.play()
               // console.log(`Playing : ${soundId}`);
                return true;
            } catch (error) {
                //console.warn(`sound ${soundId} failed to play:`, error);
                return false;
            }
        }
    }

    // stop a sound by its ID
    pauseSound(soundId) {
        const audio = this.audioElements.get(soundId);
        if (audio && !audio.paused) {
            try {
                audio.pause();
                //console.log(`stop sound id: ${soundId}`);
                return true;
            } catch (error) {
               // console.warn(`sound ${soundId} failed to stop:`, error);
                return false;
            }
        }
    }

    // set volume for a sound by its ID (0-100)
    setVolume(soundId, volume) {
        const audio = this.audioElements.get(soundId);
        if (audio) {
            //convert 0-100 to 0-1
            audio.volume = volume / 100;
           // console.log(`set volume for sound id: ${soundId} to ${volume}`);
            return true;
        }
        console.warn(`sound ${soundId} not found`);
        return false;
    }

    // Play all sounds
    playAllSounds() {
        for(const [soundId, audio] of this.audioElements) {
           if (audio.paused) {
            audio.play();
           }
            
        }
        this.isPlaying = true;
    
    }

    // Pause all sounds
    pauseAllSounds() {
        for (const [soundId, audio] of this.audioElements) {
            if (!audio.paused) {
                audio.pause();
            }
        }
        this.isPlaying = false;

    }

    //Stop and reset all sounds
    stopAllSounds() {
        for (const [soundId, audio] of this.audioElements) {
            if (!audio.paused) {
                audio.pause();
            }
            audio.currentTime = 0;
        }
        this.isPlaying = false;

    }
}
