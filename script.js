// TODO: Essa parada de reset no final ta bugando tudo (com o enter) possível solução permitir enter apenas se tivermos algum valor nas entradas

const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
let go = false;
let digitsCounter = 2;
let timePointer = 0;
let separatorPointer = 0;
let interv;

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

// Buttons funcionalities
document.getElementById('goButton').onclick = init;
document.getElementById('resetButton').onclick = reset;

function initCountdown(timer) {
  interv = setInterval(() => {
    let hours = `${timer[5].textContent}${timer[4].textContent}`;
    let minutes = `${timer[3].textContent}${timer[2].textContent}`;
    let seconds = `${timer[1].textContent}${timer[0].textContent}`;

    seconds--;

    if (seconds == -1) {
      minutes--;
      seconds = 59;
    }

    if (minutes == -1) {
      hours--;
      minutes = 59;
    }

    if (timePointer == 5 && minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (timePointer == 3 && seconds < 10) {
      seconds = `0${seconds}`;
    }

    if (minutes == 0) {
      console.log('entrou no if');
      timer[3].textContent = '';
      timer[2].textContent = '';
      separator[1].hidden = true;
    }
    if (hours == 0) {
      timer[5].textContent = '';
      timer[4].textContent = '';
      separator[2].hidden = true;
    }
    // TODO: Reset is triggering alarm, have a look at this.
    // TODO: Any key or mouse click triggers voice
    // TODO: Make the go button into a pause button during the timer and then:
    // TODO: Go button becomes ok (cancel the bell ringing) at the end of timer (do this in the same moment that you start refining the front)
    if (hours == -1) {
      const audio = new Audio('./Alarm-clock-bell-ringing-sound-effect.mp3');
      audio.play();
      const alarm = setInterval(() => {
        audio.play();
        document.addEventListener('keydown', () => {
          reset();
          clearInterval(alarm);
        });
      }, 1000);
      clearInterval(interv);
    } else {
      seconds = seconds?.toString();
      minutes = minutes?.toString();
      hours = hours?.toString();

      if (hours) {
        timer[5].textContent = hours[0];
        timer[4].textContent = hours[1];
      }
      if (minutes) {
        timer[3].textContent = minutes[0];
        timer[2].textContent = minutes[1];
      }
      if (seconds) {
        timer[1].textContent = seconds[0];
        timer[0].textContent = seconds[1];
      }
    }
  }, 1000);
}

function convertTimer(timer) {
  let hours = `${timer[5].textContent}${timer[4].textContent}` || '';
  let minutes = `${timer[3].textContent}${timer[2].textContent}` || '';
  let seconds = `${timer[1].textContent}${timer[0].textContent}` || '';

  if (seconds > 60) {
    minutes++;
    if (minutes == 1) {
      separator[1].hidden = false;
      separatorPointer = 2;
      digitsCounter = 1;
      timePointer++;
    }
    seconds -= 60;
  }
  if (minutes > 60) {
    hours++;
    if (hours == 1) {
      separator[2].hidden = false;
      separatorPointer = 3;
      digitsCounter = 1;
      timePointer++;
    }
    minutes -= 60;
  }
  if (hours > 99) {
    //* Need to be a max of 2 digits long
    hours = 99;
  }

  seconds = seconds.toString();
  minutes = minutes.toString();
  hours = hours.toString();

  timer[5].textContent = hours[0];
  timer[4].textContent = hours[1];
  timer[3].textContent = minutes[0];
  timer[2].textContent = minutes[1];
  timer[1].textContent = seconds[0];
  timer[0].textContent = seconds[1];
}

function init() {
  if (timer[0].textContent != '' && !go) {
    go = true;
    convertTimer(timer);
    initCountdown(timer);
  }
}

function reset() {
  // TODO: Reset is transforming everything in the entry
  clearInterval(interv);
  timer.forEach((tm) => (tm.textContent = ''));
  separator.forEach((sep) => (sep.hidden = true));
  go = false;
  digitsCounter = 2;
  timePointer = 0;
  separatorPointer = 0;
}

function main() {
  document.addEventListener('keydown', (event) => {
    // TODO: Refactor
    console.log(event.key);
    if (numbers.includes(event.key) && timePointer < 6) {
      console.log(
        `[go] ${go}\n[digitsCounter] ${digitsCounter}\n[timePointer] ${timePointer}\n[separatorPointer] ${separatorPointer}`
      );
      if (digitsCounter == 2) {
        separator[separatorPointer].hidden = false;
        separatorPointer++;
        digitsCounter = 0;
      }
      for (let i = timePointer; i > 0; i--) {
        timer[i].textContent = timer[i - 1].textContent;
      }
      timer[0].textContent = event.key;
      timePointer++;
      digitsCounter++;
    }

    if (event.key == 'Backspace' && timer[0].textContent != '' && !go) {
      for (let i = 0; i < timePointer; i++) {
        if (timer[i + 1] == undefined) timer[i].textContent = '';
        else timer[i].textContent = timer[i + 1].textContent;
      }
      if (digitsCounter == 1) {
        separator[separatorPointer - 1].hidden = true;
        digitsCounter = 2;
        separatorPointer--;
      } else {
        digitsCounter--;
      }
      timePointer--;
    }

    if (event.key == 'Enter') {
      init();
    }

    const synth = window.speechSynthesis;
    if (event.key == ' ' && !synth.pending && go) {
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
  });
}

document.onload = main();
