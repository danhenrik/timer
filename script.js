// Encapsulation (take the 'global' variable out of window object)
(function () {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const timer = ['', '', '', '', '', ''];
  // TODO: Make the go button into a pause button during the timerOut and then:
  // TODO: Go button becomes ok (cancel the bell ringing) at the end of timerOut (do this in the same moment that you start refining the front)
  // TODO: No final substituir 00 s por um sino tocando ou algo do tipo (faz parte do embelezamento da página)
  let go = false,
    digitsCounter = 2,
    timePointer = 0,
    separatorPointer = 0,
    interv,
    ringing = false;
  const synth = window.speechSynthesis;

  const timerOut = [
    document.getElementById('hours-0'),
    document.getElementById('hours-1'),
    document.getElementById('minutes-0'),
    document.getElementById('minutes-1'),
    document.getElementById('seconds-0'),
    document.getElementById('seconds-1'),
  ];

  const separator = [
    document.getElementById('S-specifier'),
    document.getElementById('M-specifier'),
    document.getElementById('H-specifier'),
  ];

  // Buttons funcionalities
  document
    .getElementById('goButton')
    .addEventListener('click', () => init(timer));
  document
    .getElementById('resetButton')
    .addEventListener('click', () => reset(timer));

  // Plays tha alarm sound on the client browser.
  function playAlarm() {
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
  }

  // Converts the input into valid timer (in case someone placed 90 seconds or something like that)
  function convertTimer(timer) {
    let hours = `${timer[0]}${timer[1]}`;
    let minutes = `${timer[2]}${timer[3]}`;
    let seconds = `${timer[4]}${timer[5]}`;

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
      // TODO: Pop-up
      // ? window.alert(`The hours have to be 2 or 1 digits long;`);
    }

    timerTransform(hours, minutes, seconds);
    out(timer);
  }

  // Execute the countdown
  function initCountdown(timer) {
    interv = setInterval(() => {
      let hours = `${timer[0]}${timer[1]}`;
      let minutes = `${timer[2]}${timer[3]}`;
      let seconds = `${timer[4]}${timer[5]}`;

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
        playAlarm();
      } else {
        timerTransform(hours, minutes, seconds);
        out(timer);
      }
    }, 1000);
  }

  // Standardize the inputs, making easier to manipulate the timer data in the other functions
  function timerTransform(hours, minutes, seconds) {
    seconds = seconds?.toString();
    minutes = minutes?.toString();
    hours = hours?.toString();

    if (minutes < 10 && separatorPointer == 3) {
      minutes = `0${parseInt(minutes)}`;
    }
    if (seconds < 10) {
      seconds = `0${parseInt(seconds)}`;
    }
    // Remove hour and it separator
    if (hours == 0) {
      timer[0] = '';
      timer[1] = '';
      separator[2].hidden = true;
    } else if (hours < 10 && separatorPointer < 4) {
      timer[0] = '';
      timer[1] = hours[0];
    } else if (hours) {
      timer[0] = hours[0];
      timer[1] = hours[1];
    }
    // Remove minutes and it separator
    if (minutes == 0 && hours == 0) {
      timer[2] = '';
      timer[3] = '';
      separator[1].hidden = true;
    } else if (minutes < 10 && separatorPointer < 3) {
      timer[2] = '';
      timer[3] = minutes[0];
    } else if (minutes) {
      timer[2] = minutes[0];
      timer[3] = minutes[1];
    }

    timer[4] = seconds[0];
    timer[5] = seconds[1];
  }

  // Just put the intern state of the timer in the screen.
  function out(timer) {
    for (let i = 0; i < 6; i++) {
      timerOut[i].textContent = timer[i];
    }
  }

  // Centralized function that initializes the timer execution after the input is received
  function init(timer) {
    if (timer[5] != '' && !go) {
      go = true;
      convertTimer(timer);
      initCountdown(timer);
    }
  }

  // Resets the timer to the initial state
  function reset() {
    clearInterval(interv);
    for (let i = 0; i < 6; i++) timer[i] = '';
    separator.forEach((sep) => (sep.hidden = true));
    go = false;
    digitsCounter = 2;
    timePointer = 0;
    separatorPointer = 0;
    ringing = false;
    out(timer);
    // Main is needed to work on githubpages.
    main();
    // TODO: Final animation
  }

  // Play a sound in the user browser saying the current time left.
  function UseSynth() {
    if (
      !['Escape', 'Enter', ...numbers].includes(event.key) &&
      !synth.pending &&
      go &&
      !ringing
    ) {
      const hours = parseInt(`${timer[0]}${timer[1]}`);
      const minutes = parseInt(`${timer[2]}${timer[3]}`);
      const seconds = parseInt(`${timer[4]}${timer[5]}`);

      let output = '';
      if (hours) output += hours == 1 ? `${hours} hour` : `${hours} hours`;

      if (hours && minutes && !seconds) output += 'and';
      if (hours && minutes && seconds) output += ', ';

      if (minutes)
        output += minutes == 1 ? `${minutes} minute` : `${minutes} minutes`;

      if ((minutes && seconds) || (hours && seconds)) output += ' and';
      if ((minutes && !seconds) || (hours && !seconds)) output += ' left.';

      if (seconds)
        output +=
          seconds == 1 ? `${seconds} second left.` : `${seconds} seconds left.`;

      const speech = new SpeechSynthesisUtterance(output);
      const voices = synth.getVoices();
      speech.voice = voices[2];
      synth.speak(speech);
    }
  }

  // Responds to every key board input, store the inputs and triggers all the events (delete,init,reset e play voice)
  function main() {
    document.addEventListener('keydown', (event) => {
      if (numbers.includes(event.key) && timePointer < 6 && !go) {
        if (!(event.key == '0' && timePointer == 0)) {
          if (digitsCounter == 2) {
            separator[separatorPointer].hidden = false;
            separatorPointer++;
            digitsCounter = 0;
          }
          for (let i = 0; i < 6; i++) {
            timer[i] = timer[i + 1];
          }
          timer[5] = event.key;
          timePointer++;
          digitsCounter++;
          out(timer);
        }
      }

      if (event.key == 'Backspace' && timer[5] != '' && !go) {
        for (let i = 5; i > -1; i--) {
          if (i == 0) timer[i] = '';
          else timer[i] = timer[i - 1];
        }
        if (digitsCounter == 1) {
          separator[separatorPointer - 1].hidden = true;
          digitsCounter = 2;
          separatorPointer--;
        } else {
          digitsCounter--;
        }
        timePointer--;
        out(timer);
      }

      if (event.key == 'Enter') {
        init(timer);
      }

      if (event.key == 'Escape') {
        reset(timer);
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
  }
  main();
})();
