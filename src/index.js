// Encapsulation (take the 'global' variable out of window object)
(function () {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const timerArr = ['', '', '', '', '', ''];
  let go = false,
    digitsCounter = 2,
    timePointer = 0,
    separatorPointer = 0,
    ringing = false,
    interv;
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
    .addEventListener('click', () => init(timerArr));
  document
    .getElementById('okButton')
    .addEventListener('click', () => reset(timerArr));
  document
    .getElementById('resetButton')
    .addEventListener('click', () => reset(timerArr));

  // Plays tha alarm sound on the client browser.
  function playAlarm() {
    clearInterval(interv);
    ringing = true;
    let alarm;
    const audio = new Audio('./Alarm.mp3');
    audio.play();
    function stop() {
      audio.pause();
      clearInterval(alarm);
      document.removeEventListener('keydown', stop);
      reset();
    }
    document.getElementById('okButton').hidden = false;
    document.getElementById('pauseButton').hidden = true;
    document.getElementById('okButton').addEventListener('click', stop);
    document.addEventListener('keydown', stop);
    alarm = setInterval(() => {
      audio.play();
    }, 1000);
  }

  // Converts the input into valid timerArr (in case someone placed 90 seconds or something like that)
  function convertTimer(timerArr) {
    let hours = `${timerArr[0]}${timerArr[1]}`;
    let minutes = `${timerArr[2]}${timerArr[3]}`;
    let seconds = `${timerArr[4]}${timerArr[5]}`;

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
      hours = 99;
      // TODO: Pop-up
      window.alert(`The can have a maximum of 2 digits.`);
    }

    timerTransform(hours, minutes, seconds);
    out(timerArr);
  }

  // Handles pause & resume
  function pauseResume(event) {
    if (pauseButton.textContent == 'Resume') {
      pauseButton.textContent = 'Pause';
      go = true;
      initCountdown(timerArr);
    } else if (
      !(timerArr[3] == '' && timerArr[4] == '0' && timerArr[5] == '0')
    ) {
      pauseButton.textContent = 'Resume';
      go = false;
      document.title += ' - Pause';
      clearInterval(interv);
    }
  }

  // Take care of the timer counting
  function timer(timerArr) {
    let hours = `${timerArr[0]}${timerArr[1]}`;
    let minutes = `${timerArr[2]}${timerArr[3]}`;
    let seconds = `${timerArr[4]}${timerArr[5]}`;

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
      out(timerArr);
    }
  }

  // Execute the countdown
  function initCountdown(timerArr) {
    document.getElementById('goButton').hidden = true;
    const pauseButton = document.getElementById('pauseButton');
    pauseButton.hidden = false;
    pauseButton.removeEventListener('click', pauseResume);
    pauseButton.addEventListener('click', pauseResume);
    timer(timerArr);
    interv = setInterval(() => timer(timerArr), 1000);
  }

  // Standardize the inputs, making easier to manipulate the timerArr data in the other functions
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
      timerArr[0] = '';
      timerArr[1] = '';
      separator[2].hidden = true;
    } else if (hours < 10 && separatorPointer < 4) {
      timerArr[0] = '';
      timerArr[1] = hours[0];
    } else if (hours) {
      timerArr[0] = hours[0];
      timerArr[1] = hours[1];
    }
    // Remove minutes and it separator
    if (minutes == 0 && hours == 0) {
      timerArr[2] = '';
      timerArr[3] = '';
      separator[1].hidden = true;
    } else if (minutes < 10 && separatorPointer < 3) {
      timerArr[2] = '';
      timerArr[3] = minutes[0];
    } else if (minutes) {
      timerArr[2] = minutes[0];
      timerArr[3] = minutes[1];
    }

    timerArr[4] = seconds[0];
    timerArr[5] = seconds[1];
  }

  // Just put the intern state of the timerArr in the screen.
  function out(timerArr) {
    for (let i = 0; i < 6; i++) {
      timerOut[i].textContent = timerArr[i];
    }
    if (go) {
      if (timerArr[0] || timerArr[1])
        document.title = `Voice Timer - ${timerArr[0]}${timerArr[1]}:${timerArr[2]}${timerArr[3]}:${timerArr[4]}${timerArr[5]}`;
      else if (timerArr[2] || timerArr[3])
        document.title = `Voice Timer - ${timerArr[2]}${timerArr[3]}:${timerArr[4]}${timerArr[5]}`;
      else if (timerArr[4] || timerArr[5])
        document.title = `Voice Timer - ${timerArr[4]}${timerArr[5]}`;
    } else {
      document.title = 'Voice Timer';
    }
  }

  // Centralized function that initializes the timerArr execution after the input is received
  function init(timerArr) {
    if (timerArr[5] != '' && !go) {
      go = true;
      convertTimer(timerArr);
      initCountdown(timerArr);
    }
  }

  // Resets the timerArr to the initial state
  function reset() {
    clearInterval(interv);
    for (let i = 0; i < 6; i++) timerArr[i] = '';
    separator.forEach((sep) => (sep.hidden = true));
    go = false;
    digitsCounter = 2;
    timePointer = 0;
    separatorPointer = 0;
    ringing = false;
    document.getElementById('goButton').hidden = false;
    document.getElementById('okButton').hidden = true;
    document.getElementById('pauseButton').hidden = true;
    out(timerArr);
    // TODO: Final animation
  }

  // Play a sound in the user browser saying the current time left.
  function UseSynth() {
    const hours = parseInt(`${timerArr[0]}${timerArr[1]}`);
    const minutes = parseInt(`${timerArr[2]}${timerArr[3]}`);
    const seconds = parseInt(`${timerArr[4]}${timerArr[5]}`);

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

  // Handles the keydown event
  function handleKeyDown(event) {
    if (numbers.includes(event.key) && timePointer < 6 && !go) {
      if (!(event.key == '0' && timePointer == 0)) {
        if (digitsCounter == 2) {
          separator[separatorPointer].hidden = false;
          separatorPointer++;
          digitsCounter = 0;
        }
        for (let i = 0; i < 6; i++) {
          timerArr[i] = timerArr[i + 1];
        }
        timerArr[5] = event.key;
        timePointer++;
        digitsCounter++;
        out(timerArr);
      }
    }

    if (event.key == 'Backspace' && timerArr[5] != '' && !go) {
      for (let i = 5; i > -1; i--) {
        if (i == 0) timerArr[i] = '';
        else timerArr[i] = timerArr[i - 1];
      }
      if (digitsCounter == 1) {
        separator[separatorPointer - 1].hidden = true;
        digitsCounter = 2;
        separatorPointer--;
      } else {
        digitsCounter--;
      }
      timePointer--;
      out(timerArr);
    }

    if (
      !['Escape', 'Enter', ...numbers].includes(event.key) &&
      go &&
      !ringing &&
      !synth.speaking
    )
      UseSynth();

    if (event.key == 'Enter') {
      const pauseButton = document.getElementById('pauseButton');
      if (pauseButton.hidden == false) pauseResume();
      else init(timerArr);
    }

    if (event.key == 'Escape') reset(timerArr);
  }

  // Responds to every key board input, store the inputs and triggers all the events (delete,init,reset e play voice)
  function main() {
    document.addEventListener('keydown', handleKeyDown);
  }
  main();
})();
