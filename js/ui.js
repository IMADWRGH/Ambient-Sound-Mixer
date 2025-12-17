export class UI {
  constructor() {
    this.soundCartContainer = null;
    this.masterVolumeSlider = null;
    this.masterVolumeValue = null;
    this.playPauseButton = null;
    this.resetButton = null;
    this.customPresetsContainer = null;
    this.modal = null;
    this.timerDisplay = null;
    this.timerSelect = null;
    this.themeToggle = null;
  }


  init() {
    this.soundCartContainer = document.querySelector('.grid');
    this.masterVolumeSlider = document.getElementById('masterVolume');
    this.masterVolumeValue = document.getElementById('masterVolumeValue');
    this.playPauseButton = document.getElementById('playPauseAll');
    this.resetButton = document.getElementById('resetAll');
    this.modal = document.getElementById('savePresetModal');
    this.customPresetsContainer = document.getElementById('customPresets');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.timerSelect = document.getElementById('timerSelect');
    this.themeToggle = document.getElementById('themeToggle');
  }



  //create sound card element
  createSoundCard(sound) {
    const card = document.createElement('div');
    card.className = 'sound-card bg-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden transition-all duration-300';// hover:scale-[1.03] hover:shadow-lg';
    card.dataset.sound = sound.id;
    card.innerHTML =
      ` <div class="flex flex-col h-full">
      <!-- Sound Icon and Name -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="sound-icon-wrapper w-12 h-12 rounded-full bg-gradient-to-br ${sound.color} flex items-center justify-center">
            <i class="fas ${sound.icon} text-white text-xl"></i>
          </div>
          <div>
            <h3 class="font-semibold text-lg">${sound.name}</h3>
            <p class="text-xs opacity-70">${sound.description}</p>
          </div>
        </div>
        <button type="button" class="play-btn w-10
         h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center" data-sound="${sound.id}">
          <i class="fas fa-play text-sm"></i>
        </button>
      </div>

      <!-- Volume Control -->
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex items-center space-x-3">
          <i class="fas fa-volume-low opacity-50"></i>
          <input type="range" class="volume-slider flex-1" min="0" max="100" value="0" data-sound="${sound.id}">
          <span class="volume-value text-sm w-8 text-right">0</span>
        </div>

        <!-- Volume Bar Visualization -->
        <div class="volume-bar mt-3">
          <div class="volume-bar-fill " style="width: 0%"></div>
        </div>
      </div>
    </div>`;
    return card;
  }

  //create custom preset button
  createCustomPresetButton(name, presetId) {
    const button = document.createElement('button');
    button.className = 'custom-preset-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 relative group';
    button.dataset.preset = presetId;
    button.innerHTML = ` <i class="fas fa-star mr-2 text-yellow-400"></i>
    ${name}
    <button type="button" class="delete-preset absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-preset="${presetId}">
      <i class="fas fa-times text-xs text-white"></i>
    </button>`;
    return button;
  }

  //add custom preset to UI
  addCustomPreset(name, presetId) {
    const button = this.createCustomPresetButton(name, presetId);
    this.customPresetsContainer.appendChild(button);
  }

  //Render sound cards
  renderSoundCards(sounds) {
    this.soundCartContainer.innerHTML = '';
    sounds.forEach(sound => {
      const card = this.createSoundCard(sound);
      this.soundCartContainer.appendChild(card);
    });
  }

  //update play/pause button icon for a sound card
  updatePlayPauseButton(soundId, isPlaying) {
    const card = this.soundCartContainer.querySelector(`[data-sound="${soundId}"]`);
    if (!card) {
      console.error(`Sound card with ID ${soundId} not found.`);
      return false;
    }
    const playPauseButton = card.querySelector('.play-btn');
    const icon = playPauseButton.querySelector('i');
    if (isPlaying) {
      icon.classList.remove('fa-play');
      icon.classList.add('fa-pause');
      icon.classList.add('playing')
    } else {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
      icon.classList.remove('playing');
    }
  }

  //update volume UI for a sound card
  //update volume UI for a sound card
  updateVolumeDisplay(soundId, volume) {
    // Use this.soundCartContainer instead of document
    const card = this.soundCartContainer.querySelector(`[data-sound="${soundId}"]`);

    if (!card) {
      console.error(`Sound card with ID ${soundId} not found.`);
      //  console.log('Available cards:', Array.from(this.soundCartContainer.querySelectorAll('[data-sound]')).map(c => c.dataset.sound));
      return false;
    }

    // console.log(`Updating volume for ${soundId} to ${volume}`); // Debug log

    // Update number display
    const volumeValue = card.querySelector('.volume-value');
    if (volumeValue) {
      volumeValue.textContent = volume;
      // console.log('Updated volume value display'); // Debug log
    } else {
      console.warn('Volume value element not found in card');
    }

    // Update volume bar visualization
    const volumeBarFill = card.querySelector('.volume-bar-fill');
    if (volumeBarFill) {
      volumeBarFill.style.width = `${volume}%`;
      // console.log('Updated volume bar width'); // Debug log
    } else {
      console.warn('Volume bar fill element not found in card');
    }

    // Update slider position
    const slider = card.querySelector('.volume-slider');
    if (slider) {
      slider.value = volume;
      // console.log('Updated slider value'); // Debug log
    } else {
      console.warn('Volume slider element not found in card');
    }

    return true;
  }


  //Update main play /pause button
  updateMainPlayPauseButton(isPlaying) {
    const icon = this.playPauseButton.querySelector('i');
    const text = this.playPauseButton.querySelector('span');
    if (isPlaying) {
      icon.classList.remove('fa-play');
      icon.classList.add('fa-pause');
      text.innerHTML = 'Pause all';
    } else {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
      text.innerHTML = 'Play all';
    }
  }

  //Reset all sound cards UI to default
  resetAllSoundCards() {
    const sliderS = document.querySelectorAll('.volume-slider');
    sliderS.forEach(slider => {
      slider.value = 0;
      const soundId = slider.dataset.sound;
      this.updateVolumeDisplay(soundId, 0);
      this.updatePlayPauseButton(soundId, false);
    });

    // Reset all play buttons to play state
    const playButtons = document.querySelectorAll('.play-btn i');
    playButtons.forEach(icon => {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
    });

    //Remove playing class from all cards
    const soundCards = document.querySelectorAll('.sound-card');
    soundCards.forEach(card => {
      card.classList.remove('fa-playing');
    });

    //Reset main play button
    this.updateMainPlayPauseButton(false);

    // Reset master volume
    this.masterVolumeSlider.value = 100;
    this.masterVolumeValue.textContent = '100';
  }

  //show modal
  showModal() {
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    document.getElementById('presetName').focus();
  }

  //hide modal
  hideModal() {
    this.modal.classList.remove('flex');
    this.modal.classList.add('hidden');
    document.getElementById('presetName').value = '';

  }


  //Toggle theme
  toggleTheme() {
    const body = document.body;
    const icon = this.themeToggle.querySelector('i');

    // I can use function replace() to simplify 
    // this later instead of function add/remove
    if (body.classList.contains('light-theme')) {
      body.classList.remove('light-theme');
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    } else {
      body.classList.add('light-theme');
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }
  }

  //highlight active preset
  setActivePreset(presetKey) {
    document.querySelectorAll('.preset-btn, .custom-preset-btn')
      .forEach(btn => { btn.classList.remove('preset-active') });

    //add active class to selected preset

    const activeBtn = document.querySelector(`.preset-btn[data-preset="${presetKey}"], .custom-preset-btn[data-preset="${presetKey}"]`);

    if (activeBtn) {
      activeBtn.classList.add('preset-active');
    }
  }

  // remove custom preset from UI
  removeCustomPreset(presetId){
    const deleteBtn = document.querySelector(`.custom-preset-btn[data-preset="${presetId}"]`);
    
    if(deleteBtn){
      deleteBtn.remove();
    }
  }

  //update timer display
  updateTimerDisplay(minutes,seconds){
    if(minutes ===0 && seconds === 0){
      this.timerDisplay.classList.add('hidden');
      this.timerDisplay.textContent='';
    }

    const formattedTime= `${minutes.toString().padStart(2,'0')}: ${seconds.toString().padStart(2,'0')}`;
    this.timerDisplay.textContent=formattedTime;
    this.timerDisplay.classList.remove('hidden');


  }
}