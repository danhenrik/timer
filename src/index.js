// TODO: Migrate clock to react app (good oportunity to pratice)
// TODO: At the end of startTimer keep counting negatively

// Encapsulation (take the 'global' variable out of window object)
(function () {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const timerArr = ['', '', '', '', '', ''];
  let go = false,
    started = false,
    ringing = false,
    digitsCounter = 2,
    timePointer = 0,
    separatorPointer = 0,
    interv,
    alarm;

  const synth = window.speechSynthesis,
    audio = new Audio('./Alarm.mp3');

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

  // Listeners used to interact with the clock
  document.addEventListener('keydown', handleKeyDown);

  const button1 = document.getElementById('button-1');
  button1.addEventListener('click', contextChecker);

  const button2 = document.getElementById('button-2');
  button2.addEventListener('click', () => reset(timerArr));

  function contextChecker(event) {
    // Finishied - Reset
    if (ringing) reset();
    // First start - Start
    else if (!go && !started) start();
    // Running - Pause
    else if (go && started) pause();
    // Paused - Resume
    else if (!go && started) resume();
  }

  // Handles the keydown event
  function handleKeyDown(event) {
    if (numbers.includes(event.key) && timePointer < 6 && !started) {
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

    if (event.key == 'Enter') contextChecker(event);

    if (event.key == 'Escape') reset(timerArr);
  }

  // Converts the input into valid timerArr (in case someone placed 90 seconds or something like that)
  function normalizeTimer(timerArr) {
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

  // Execute the countdown
  function startCountdown(timerArr) {
    button1.classList.remove('glyphicon-play');
    button1.classList.add('glyphicon-pause');
    countdown(timerArr);
  }

  // Take care of the timer counting
  function countdown(timerArr) {
    interv = setInterval(() => {
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
    }, 1000);
  }

  // Plays tha alarm sound on the client browser.
  function playAlarm() {
    clearInterval(interv);
    ringing = true;
    audio.currentTime = 0;
    audio.play();
    button1.classList.remove('glyphicon-pause');
    button1.classList.add('glyphicon-ok');
    document.addEventListener('keydown', stopAlarm);
    alarm = setInterval(() => {
      audio.play();
    }, 1000);
  }

  function stopAlarm() {
    audio.pause();
    clearInterval(alarm);
    reset();
    document.removeEventListener('keydown', stopAlarm);
  }

  // Centralized function that initializes the timerArr execution after the input is received
  function start() {
    if (timerArr[5] != '' && !go) {
      go = true;
      started = true;
      normalizeTimer(timerArr);
      startCountdown(timerArr);
    }
  }

  // Pause the clock
  function pause() {
    if (!(timerArr[3] == '' && timerArr[4] == '0' && timerArr[5] == '0')) {
      button1.classList.remove('glyphicon-pause');
      button1.classList.add('glyphicon-play');
      go = false;
      document.title += ' - Pause';
      clearInterval(interv);
      console.log('Pause');
    }
  }

  // Resume the clock
  function resume() {
    go = true;
    button1.classList.remove('glyphicon-play');
    button1.classList.add('glyphicon-pause');
    startCountdown(timerArr);
  }

  // Resets the clock to the initial state
  function reset() {
    clearInterval(interv);
    for (let i = 0; i < 6; i++) timerArr[i] = '';
    separator.forEach((sep) => (sep.hidden = true));
    go = false;
    started = false;
    digitsCounter = 2;
    timePointer = 0;
    separatorPointer = 0;
    ringing = false;
    button1.classList.remove('glyphicon-pause');
    button1.classList.remove('glyphicon-ok');
    button1.classList.add('glyphicon-play');
    out(timerArr);
    // TODO: Final animation
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
})();
