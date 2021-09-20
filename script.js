let go = false;
let digitsCounter = 2;
let timePointer = 0;
let SeparatorPointer = 0;
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const timer = [
  document.getElementById('seconds-1'),
  document.getElementById('seconds-0'),
  document.getElementById('minutes-1'),
  document.getElementById('minutes-0'),
  document.getElementById('hours-1'),
  document.getElementById('hours-0'),
];

const separator = [
  document.getElementById('S-specifier'),
  document.getElementById('M-specifier'),
  document.getElementById('H-specifier'),
];

const goButton = document.getElementById('goButton');
goButton.addEventListener('click', (event) => {
  init();
});

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', (event) => {
  timer.forEach((tm) => (tm.textContent = ''));
  separator.forEach((sep) => (sep.hidden = true));
  go = false;
  digitsCounter = 2;
  timePointer = 0;
  SeparatorPointer = 0;
});

function init() {
  go = true;
  const convertedTimer = convertTimer(timer);
  initCountdown(convertedTimer);
}

// TODO: Escalar esse countdown pro padrão programado
function initCountdown(timerArr) {
  const interv = setInterval(() => {
    let hours = `${timerArr[5].textContent}${timerArr[4].textContent}`;
    let minutes = `${timerArr[3].textContent}${timerArr[2].textContent}`;
    let seconds = `${timerArr[1].textContent}${timerArr[0].textContent}`;
    seconds--;
    if (seconds == -1) {
      minutes--;
      seconds = 59;
    }
    // } else if (seconds == -1 && hours > 0) {
    // hours--;
    // minutes = 59;
    // seconds = 59;
    // }
    if (minutes == -1) {
      hours--;
      minutes = 59;
    }
    if (hours == -1) {
      const audio = new Audio('./Alarm-clock-bell-ringing-sound-effect.mp3');
      audio.play();
      const alarm = setInterval(() => {
        audio.play();
        document.addEventListener('keydown', () => {
          clearInterval(alarm);
        });
      }, 1000);
      clearInterval(interv);
    } else {
      seconds = seconds?.toString();
      minutes = minutes?.toString();
      hours = hours?.toString();

      if (hours) {
        timerArr[5].textContent = hours[0] || 0;
        timerArr[4].textContent = hours[1];
      }
      if (minutes) {
        timerArr[3].textContent = minutes[0] || 0;
        timerArr[2].textContent = minutes[1];
      }
      if (seconds) {
        timerArr[1].textContent = seconds[0] || 0;
        timerArr[0].textContent = seconds[1];
      }
    }
  }, 1000);
}

function convertTimer(timerArr) {
  let hours = `${timerArr[5].textContent}${timerArr[4].textContent}` || '';
  let minutes = `${timerArr[3].textContent}${timerArr[2].textContent}` || '';
  let seconds = `${timerArr[1].textContent}${timerArr[0].textContent}` || '';

  if (seconds > 60) {
    minutes++;
    if (minutes == 1) {
      separator[1].hidden = false;
      SeparatorPointer = 2;
      digitsCounter = 1;
      timePointer++;
    }
    seconds -= 60;
  }
  if (minutes > 60) {
    hours++;
    if (hours == 1) {
      separator[2].hidden = false;
      SeparatorPointer = 3;
      digitsCounter = 1;
      timePointer++;
    }
    minutes -= 60;
  }
  if (hours > 99) {
    //* Need to be 2 digits long
    hours = 99;
  }
  seconds = seconds.toString();
  minutes = minutes.toString();
  hours = hours.toString();

  timerArr[5].textContent = hours[0];
  timerArr[4].textContent = hours[1];
  timerArr[3].textContent = minutes[0];
  timerArr[2].textContent = minutes[1];
  timerArr[1].textContent = seconds[0];
  timerArr[0].textContent = seconds[1];
  return timerArr;
}

document.addEventListener('keydown', (event) => {
  // TODO: Dar uma refatorada
  if (numbers.includes(event.key) && timePointer < 6) {
    if (digitsCounter == 2) {
      separator[SeparatorPointer].hidden = false;
      SeparatorPointer++;
      digitsCounter = 0;
    }
    for (let i = timePointer; i > 0; i--) {
      timer[i].textContent = timer[i - 1].textContent;
    }
    timer[0].textContent = event.key;
    timePointer++;
    digitsCounter++;
  }

  // TODO: Deletar voltando inclusive os 2 pontos.
  if (event.key == 'Backspace' && timer[0].textContent != '' && !go) {
    for (let i = 0; i < timePointer; i++) {
      if (timer[i + 1] == undefined) timer[i].textContent = '';
      else timer[i].textContent = timer[i + 1].textContent;
    }
    if (digitsCounter == 1) {
      separator[SeparatorPointer - 1].hidden = true;
      digitsCounter = 2;
      SeparatorPointer--;
    } else {
      digitsCounter--;
    }
    timePointer--;
  }

  if (event.key == 'Enter' && !go) {
    init();
  }

  const synth = window.speechSynthesis;
  if (event.key == ' ' && !synth.pending && go) {
    // TODO: Escalar o speech pra caso haja horas dias e afins
    let output = '';
    if (timer[5].textContent || timer[4].textContent) {
      if (timer[5].textContent == 0 && timer[4].textContent == 1) {
        output += `${timer[4].textContent} hour,`;
      } else {
        output += `${timer[5].textContent}${timer[4].textContent} hours,`;
      }
    }
    if (timer[3].textContent || timer[2].textContent) {
      if (timer[3].textContent == 0 && timer[2].textContent == 1) {
        output += `${timer[2].textContent} minute and`;
      } else {
        output += `${timer[3].textContent}${timer[2].textContent} minutes and`;
      }
    }

    if (timer[1].textContent == 0 && timer[0].textContent == 1) {
      output += `${timer[0].textContent} second left.`;
    } else {
      output += `${timer[1].textContent}${timer[0].textContent} seconds left.`;
    }
    
    const speech = new SpeechSynthesisUtterance(output);
    const voices = synth.getVoices();
    speech.voice = voices[2];
    synth.speak(speech);
  }
  /* //Debug
  console.log(
    'digitsCounter',
    digitsCounter,
    'SeparatorPointer',
    SeparatorPointer,
    'timePointer',
    timePointer
  );
  */
});
