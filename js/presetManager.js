export class PresetManager {

    constructor() {
        this.customPresets = this.loadCustomPresets();

    }

    //load presets form localStorage
    loadCustomPresets() {
        const storedPresets = localStorage.getItem('ambientSoundMixer');

        return storedPresets ? JSON.parse(storedPresets) : {};

    }

    //load preset by Id
    loadPreset(presetId) {
        return this.customPresets[presetId] || null;
    }

    //save custom preset to localStorage
    saveCustomPreset() {
        localStorage.setItem('ambientSoundMixer',
            JSON.stringify(this.customPresets));
    }

    //save current mix as preset
    savePreset(name, soundStates) {
        const presetId = `custom_${Date.now()}`;

        //creat preset object 
        const preset = {
            name, sounds: {}
        }

        for (const [soundId, volume] of Object.entries(soundStates)) {
            if (volume > 0) {
                preset.sounds[soundId] = volume;
            }
        }
        this.customPresets[presetId] = preset;
        this.saveCustomPreset();
        return presetId;
    }

    //check if preset name already exists
    presetNameExists(name) {
        if (!name) return false;
        return Object.values(this.customPresets).some(
            (preset) => preset.name.toLowerCase() == name.toLowerCase()
        );



    }

    //delete custom preset
    deletePreset(presetId) {
        if (!presetId || !this.customPresets[presetId]) {
            return false;
        }

        delete this.customPresets[presetId];
        this.saveCustomPreset();
        return true;
    }


}