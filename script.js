(function () {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // TODO: Mouse click also triggers voice
  // TODO: Make the go button into a pause button during the timer and then:
  // TODO: Go button becomes ok (cancel the bell ringing) at the end of timer (do this in the same moment that you start refining the front)
  // TODO: Tirar essas variáveis do escopo global
  // TODO: No final substituir 00 s por um sino tocando ou algo do tipo (faz parte do embelezamento da página)
  // TODO: Abstrair um pouco mais as ideias e organizar melhor as funções
  let go = false;
  let digitsCounter = 2;
  let timePointer = 0;
  let separatorPointer = 0;
  let interv;
  let ringing = false;
  const synth = window.speechSynthesis;

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
      let hours =
        parseInt(`${timer[5].textContent}${timer[4].textContent}`) || '';
      let minutes =
        parseInt(`${timer[3].textContent}${timer[2].textContent}`) || '';
      let seconds = parseInt(`${timer[1].textContent}${timer[0].textContent}`);

      seconds--;

      if (seconds == -1) {
        minutes--;
        seconds = 59;
      }

      if (minutes == -1) {
        hours--;
        minutes = 59;
      }

      if (hours == -1) {
        ringing = true;
        const audio = new Audio('./Alarm.mp3');
        audio.play();
        const alarm = setInterval(() => {
          audio.play();
          document.addEventListener('keydown', () => {
            reset();
            clearInterval(alarm);
          });
          document.addEventListener('click', () => {
            reset();
            clearInterval(alarm);
          });
        }, 1000);
        clearInterval(interv);
      } else {
        seconds = seconds?.toString();
        minutes = minutes?.toString();
        hours = hours?.toString();

        out(hours, minutes, seconds);
      }
    }, 1000);
  }

  function UseSynth() {
    if (
      !['Escape', 'Enter', ...numbers].includes(event.key) &&
      !synth.pending &&
      go &&
      !ringing
    ) {
      const hours = parseInt(`${timer[5].textContent}${timer[4].textContent}`);
      const minutes = parseInt(
        `${timer[3].textContent}${timer[2].textContent}`
      );
      const seconds = parseInt(
        `${timer[1].textContent}${timer[0].textContent}`
      );

      let output = '';
      if (hours) {
        if (hours == 1) {
          output += `${hours} hour`;
        } else {
          output += `${hours} hours`;
        }
      }
      if (hours && minutes) {
        output += ', ';
      }
      if (minutes) {
        if (minutes == 1) {
          output += `${minutes} minute`;
        } else if (minutes != 0) {
          output += `${minutes} minutes`;
        }
      }
      if (minutes && seconds) {
        output += ' and ';
      }
      if (seconds == 0) {
        output += ' left.';
      } else {
        if (seconds == 1) {
          output += `${seconds} second left.`;
        } else {
          output += `${seconds} seconds left.`;
        }
      }

      const speech = new SpeechSynthesisUtterance(output);
      const voices = synth.getVoices();
      speech.voice = voices[2];
      synth.speak(speech);
    }
  }
  function out(hours, minutes, seconds) {
    if (separatorPointer == 3 && minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    // Remove hour and it separator
    if (hours == 0) {
      timer[5].textContent = '';
      timer[4].textContent = '';
      separator[2].hidden = true;
    } else if (hours) {
      console.log('hours captured');
      console.log(hours);
      timer[5].textContent = hours[0];
      timer[4].textContent = hours[1];
    }
    // Remove minutes and it separator
    if (minutes == 0 && hours == 0) {
      timer[3].textContent = '';
      timer[2].textContent = '';
      separator[1].hidden = true;
    } else if (minutes < 10 && timePointer < 5) {
      timer[2].textContent = minutes[0];
    } else if (minutes) {
      timer[3].textContent = minutes[0];
      timer[2].textContent = minutes[1];
    }
    timer[1].textContent = seconds[0];
    timer[0].textContent = seconds[1];
    console.log(`[hours] ${hours}\n[minutes] ${minutes}\n[seconds] ${seconds}`);
  }

  function convertTimer(timer) {
    let hours =
      parseInt(`${timer[5].textContent}${timer[4].textContent}`) || '';
    let minutes =
      parseInt(`${timer[3].textContent}${timer[2].textContent}`) || '';
    let seconds =
      parseInt(`${timer[1].textContent}${timer[0].textContent}`) || '';

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

    out(hours, minutes, seconds);
  }

  function init() {
    if (timer[0].textContent != '' && !go) {
      go = true;
      convertTimer(timer);
      initCountdown(timer);
    }
  }

  function reset() {
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
      console.log(
        `[go] ${go}\n[digitsCounter] ${digitsCounter}\n[timePointer] ${timePointer}\n[separatorPointer] ${separatorPointer}`
      );
      console.log(event.key);
      if (numbers.includes(event.key) && timePointer < 6 && !go) {
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

      if (event.key == 'Escape') {
        reset();
      }

      if (
        !['Escape', 'Enter', ...numbers].includes(event.key) &&
        !synth.pending &&
        go &&
        !ringing
      ) {
        UseSynth();
      }
    });
    document.addEventListener('click', () => {
      if (!synth.pending && go && !ringing) {
        UseSynth();
      }
    });
  }
  main();
})();
