import { PresetManager } from "./presetManager.js";
import { sounds, defaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";
import { UI } from "./ui.js";
import { Timer } from "./timer.js";


class AmbientSoundMixer {

    constructor() {
        this.soundManager = new SoundManager();
        this.ui = new UI();
        this.timer = new Timer(
            () => this.onTimerComplete(),
            (minutes, seconds) => this.ui.updateTimerDisplay(minutes, seconds)
        );
        this.presetManager = new PresetManager();
        this.currentSoundState = {};
        this.masterVolume = 50;
        this.isInitialized = false;
    }


    init() {
        try {
            //initialize UI
            this.ui.init();

            // Render sound cards using our sound data
            this.ui.renderSoundCards(sounds);

            //SetUp all events Listeners
            this.setupEventListeners();

            //load all sounds
            this.loadAllSounds();

            //load all preset custom
            this.loadCustomPresetsUI();

            //init sound states after loading sounds
            sounds.forEach(sound => {
                this.currentSoundState[sound.id] = 0
            });



            this.isInitialized = true;
        } catch (err) {
            console.error('Error initializing AmbientSoundMixer:', err);
        }
    }

    //SetUp all events Listeners
    setupEventListeners() {
        // handle all clicks with event delegation
        document.addEventListener('click', async event => {
            // check if a play button was clicked
            if (event.target.closest('.play-btn')) {
                const soundId = event.target.closest('.play-btn').dataset.sound;
                //console.log(soundId);
                await this.toggleSound(soundId);
            }

            //delete custom preset button click
            if (event.target.closest('.delete-preset')) {
                event.stopPropagation();
                const presetId = event.target.closest('.delete-preset').dataset.preset;
                this.deleteCustomPreset(presetId);
                return;
            }

            //handle preset button clicks
            if (event.target.closest('.preset-btn')) {
                const presetKey = event.target.closest('.preset-btn').dataset.preset;
                await this.loadPreset(presetKey);
            }

            //handle custom preset button clicks
            if (event.target.closest('.custom-preset-btn')) {
                const presetKey = event.target.closest('.custom-preset-btn').dataset.preset;
                await this.loadPreset(presetKey, true);
            }

        });

        // handle volume slider changes with event delegation
        document.addEventListener('input', async event => {
            // check if a volume slider was changed
            if (event.target.classList.contains('volume-slider')) {
                const soundId = event.target.dataset.sound;
                const volume = parseInt(event.target.value);
                this.setSoundVolume(soundId, volume);
                // console.log(`sound :${soundId}, volume : ${volume}`);

            }
        });

        //handle master volume slider changes
        const masterVolumeSlider = document.getElementById('masterVolume');
        if (masterVolumeSlider) {
            masterVolumeSlider.addEventListener('input', event => {
                const volume = parseInt(event.target.value);
                this.setMasterVolume(volume);
            });


        }


        // handle main play/pause button
        if (this.ui.playPauseButton) {
            this.ui.playPauseButton.addEventListener('click', () => {
                this.toggleAllSounds();
            });
        }


        //handle reset button
        if (this.ui.resetButton) {
            this.ui.resetButton.addEventListener('click', () => {
                this.resetToDefault();
            });
        }




        //Theme toggle button
        if (this.ui.themeToggle) {
            this.ui.themeToggle.addEventListener('click', () => {
                this.ui.toggleTheme();
            });

        }

        // save preset button
        const savePresetButton = document.getElementById('savePreset');
        if (savePresetButton) {
            savePresetButton.addEventListener('click', event => {
                this.showSavePresetModal();
            });
        }

        // cancel preset button
        const cancelPresetButton = document.getElementById('cancelSave');
        if (cancelPresetButton) {
            cancelPresetButton.addEventListener('click', event => {
                this.ui.hideModal();
            });
        }

        // close model if backfrop is clicked
        if (this.ui.modal) {
            this.ui.modal.addEventListener("click", (event) => {
                if (event.target === this.ui.modal) {
                    this.ui.hideModal();
                }
            });
        }

        // confirm save preset button
        const confirmPresetButton = document.getElementById('confirmSave');
        if (confirmPresetButton) {
            confirmPresetButton.addEventListener('click', event => {
                this.saveCurrentPreset();
            });
        }

        //timer select dropdown change
        const timerSelect = document.getElementById('timerSelect');
        if (timerSelect) {
            timerSelect.addEventListener('change', (event) => {
                const minutes = parseInt(event.target.value);
                if (minutes > 0) {
                    this.timer.start(minutes);
                    console.log(`timer started for ${minutes} minutes `);
                } else {
                    this.timer.stop();
                    console.log(`timer stoped `);

                }
            })
        }

    }


    // load all sounds and initialize the app
    loadAllSounds() {
        sounds.forEach(sound => {
            const audioPath = `audio/${sound.file}`;
            const success = this.soundManager.loadSound(sound.id, audioPath);
            if (!success) {
                console.warn(`could not load sound ${sound.name} form ${audioPath}`);

            }
        });
    }


    //toggle play/pause sound
    async toggleSound(soundId) {
        const audio = this.soundManager.audioElements.get(soundId);
        if (!audio) {
            console.error(`Audio element for sound ID ${soundId} not found.`);
            return false;
        }

        if (audio.paused) {
            // get current slider value
            const card = document.querySelector(`[data-sound="${soundId}"]`);
            const slider = card.querySelector('.volume-slider');
            let volume = parseInt(slider.value);

            // if slider is at 0, set to default 50
            if (volume === 0) {
                volume = 50;
                this.ui.updateVolumeDisplay(soundId, volume);
            }

            //set current sound state
            this.currentSoundState[soundId] = volume;

            this.soundManager.setVolume(soundId, volume);
            await this.soundManager.playSound(soundId);
            this.ui.updatePlayPauseButton(soundId, true);
        } else {
            this.soundManager.pauseSound(soundId);
            this.currentSoundState[soundId] = 0;
            console.log(`this current sound state : ${JSON.stringify(this.currentSoundState)}`);
            this.ui.updatePlayPauseButton(soundId, false);

            //set current sound state to 0 when paused            this.currentSoundState[soundId]=volume;
            this.currentSoundState[soundId] = 0;

        }


        //update main play button state
        this.updateMainPlayButtonState();

    }

    //Toggle all sounds play/pause
    toggleAllSounds() {
        if (this.soundManager.isPlaying) {
            // Pause all
            this.soundManager.pauseAllSounds();
            this.ui.updateMainPlayPauseButton(false);

            sounds.forEach(sound => {
                this.ui.updatePlayPauseButton(sound.id, false);
            });

        } else {
            // Play all
            for (const [soundId, audio] of this.soundManager.audioElements) {
                const card = document.querySelector(`[data-sound="${soundId}"]`);
                const slider = card?.querySelector('.volume-slider');

                if (slider) {
                    let volume = parseInt(slider.value);
                    if (volume === 0) {
                        volume = 50;
                        slider.value = 50;
                        this.ui.updateVolumeDisplay(soundId, 50);
                    }

                    const effectiveVolume = (volume * this.masterVolume) / 100;
                    audio.volume = effectiveVolume / 100;
                    this.ui.updatePlayPauseButton(soundId, true);
                }

                audio.play();
            }

            this.soundManager.isPlaying = true;
            this.ui.updateMainPlayPauseButton(true);
        }
    }


    //set sound volume
    setSoundVolume(soundId, volume) {

        //set sound volume in state
        this.currentSoundState[soundId] = volume;

        // set volume in sound manager
        //this.soundManager.setVolume(soundId, volume);

        //calculate effective volume considering master volume
        const adjustedVolume = (volume * this.masterVolume) / 100;


        // update the sound volume with the scaled volume
        const audio = this.soundManager.audioElements.get(soundId);
        if (audio) {
            audio.volume = adjustedVolume / 100;
        }


        //update volume UI
        this.ui.updateVolumeDisplay(soundId, volume);

        // Syns sounds
        this.updateMainPlayButtonState();
    }

    //set master volume
    setMasterVolume(volume) {
        this.masterVolume = volume;

        //update the display
        const masterVolumeValue = document.getElementById('masterVolumeValue');
        if (masterVolumeValue) {
            masterVolumeValue.textContent = `${volume}`;
        }

        // update volume for all sounds
        this.applyMasterVolumeToAllSounds();
    }


    //apply master volume to all sounds
    applyMasterVolumeToAllSounds() {
        for (const [soundId, audio] of this.soundManager.audioElements) { // Iterate through all audio elements this.soundManager.audioElements is a Map and we use destructuring to get key : soundId and value : audio
            if (!audio.paused) {
                const card = document.querySelector(`[data-sound="${soundId}"]`);
                const slider = card.querySelector('.volume-slider');
                if (slider) {
                    const individualVolume = parseInt(slider.value);
                    //calculate effective volume (INDIVIDUAL VOLUME * MASTER VOLUME) / 100
                    const adjustedVolume = (individualVolume * this.masterVolume) / 100;
                    audio.volume = adjustedVolume / 100; // set actual audio element volume (0.0 to 1.0)
                    //     this.soundManager.setVolume(soundId, adjustedVolume);
                    //     this.ui.updateVolumeDisplay(soundId, adjustedVolume);
                }
            }
        }
    }


    //Update main play button based on individual sounds playing
    updateMainPlayButtonState() {
        let anySoundPlaying = false;
        for (const [soundId, audio] of this.soundManager.audioElements) {
            if (!audio.paused) {
                anySoundPlaying = true;
                break;
            }
        }

        //update main play button UI
        this.soundManager.isPlaying = anySoundPlaying;
        this.ui.updateMainPlayPauseButton(anySoundPlaying);
    }



    //Reset everything to default
    resetToDefault() {
        // Pause all sounds
        this.soundManager.stopAllSounds();
        // Reset master volume
        this.masterVolume = 100;

        //reset timer 
        this.timer.stop();
        if(this.ui.timerSelect){
            this.ui.timerSelect.value='0';
        }

        //reset sound states
        sounds.forEach((sound) => {
            this.currentSoundState[sound.id] = 0;
        });

        //reset active preset UI
        this.ui.setActivePreset(null);

        // Reset all sound cards UI
        this.ui.resetAllSoundCards();

        //console.log("rest btn");

    }


    //Load preset configuration
    loadPreset(presetKey, custom = false) {
        let preset;

        if (custom) {
            preset = this.presetManager.loadPreset(presetKey); // presetKey is presetId
        } else {
            preset = defaultPresets[presetKey];
        }
        if (preset) {
            // stop all sound 
            this.soundManager.stopAllSounds();

            //Reset all sound volumes to 0
            sounds.forEach(sound => {
                this.setSoundVolume(sound.id, 0);
                this.ui.updateVolumeDisplay(sound.id, 0);
                this.ui.updatePlayPauseButton(sound.id, false);
            });

            //Set volumes from preset
            for (const [soundId, volume] of Object.entries(preset.sounds)) {
                //set sound volume in state
                this.currentSoundState[soundId] = volume;

                //update UI
                this.ui.updateVolumeDisplay(soundId, volume);

                //calculete effective volume
                const adjustedVolume = (volume * this.masterVolume) / 100;

                //get audio element and set volume
                const audio = this.soundManager.audioElements.get(soundId);

                if (audio) {
                    audio.volume = adjustedVolume / 100;

                    audio.play();
                    this.ui.updatePlayPauseButton(soundId, true);

                    // update main play button state
                    this.soundManager.isPlaying = true;
                    this.ui.updateMainPlayPauseButton(true)
                }
            }
        } else {
            console.error(`Preset ${presetKey} not found`);

        }
        // set active preset 
        if (presetKey) {
            this.ui.setActivePreset(presetKey);
        }
    }

    // show save preset modal
    showSavePresetModal() {
        //check if any sounds is playing
        const hasActiveSounds = Object
            .values(this.currentSoundState)
            .some(volume => volume > 0);

        if (!hasActiveSounds) {
            alert('No active sounds to save in preset');
            return 0;
        }

        this.ui.showModal();

    }


    // save current preset
    saveCurrentPreset() {
        const presetName = document.getElementById('presetName');
        const name = presetName.value.trim();
        const data = this.currentSoundState;

        if (!name) {
            alert('Please enter a name for your new  preset');
            return 0;
        }

        // check if name take or not
        if (this.presetManager.presetNameExists(name)) {
            alert(`Preset ${name} already exists`);
            return 0;
        }

        const presetId = this.presetManager.savePreset(name, data);

        //add custom preset(old one in localStorage) button to UI
        this.ui.addCustomPreset(name, presetId);

        this.ui.hideModal();

        //  console.log(`preset ${name} saved with id ${presetId}`);


    }


    //load custom preset butonns in UI
    loadCustomPresetsUI() {
        const customPresets = this.presetManager.customPresets;
        for (const [presetId, preset] of Object.entries(customPresets)) {
            this.ui.addCustomPreset(preset.name, presetId);
        }

    }

    //delete custom preset
    deleteCustomPreset(presetId) {
        if (this.presetManager.deletePreset(presetId)) {
            this.ui.removeCustomPreset(presetId);
        }
    }


    // timer complete callback
    onTimerComplete() {

        // stop all sounds 
        this.soundManager.pauseAllSounds();
        this.ui.updateMainPlayPauseButton(false);

        //update individual buttons
        sounds.forEach(sound => {
            this.ui.updatePlayPauseButton(sound.id, false);
        });

        //reset timer dropdown
        const timerSelect = document.getElementById('timerSelect');

        if (timerSelect) {
            timerSelect.value = '0';
        }

        //clear timer display
        if (this.ui.timerDisplay) {
            this.ui.timerDisplay.textContent = '';
            this.ui.timerDisplay.classList.add('hidden');
        }


    }
}


// initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AmbientSoundMixer();
    app.init();
});


