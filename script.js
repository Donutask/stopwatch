"use strict";
const timerText = document.getElementById("time");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const resetButton = document.getElementById("resetButton");
let timerRunning = false;
let currentMilliseconds = 0;
let startedDate = null;
let offset = 0;
let tickRate = 40;
const throttledRate = 1000;
let throttled;
let interval;
const startKey = "stopwatch_start";
const offsetKey = "stopwatch_offset";
const runningKey = "stopwatch_state";
function Start() {
    timerRunning = true;
    startedDate = new Date();
    currentMilliseconds = 0;
    offset = 0;
    Save();
    UpdateButtons();
}
function Pause() {
    timerRunning = false;
    offset = currentMilliseconds;
    startedDate = null;
    Save();
    UpdateButtons();
}
function Resume() {
    timerRunning = true;
    startedDate = new Date();
    offset = currentMilliseconds;
    Save();
    UpdateButtons();
}
function Reset() {
    timerRunning = false;
    currentMilliseconds = 0;
    startedDate = null;
    offset = 0;
    ShowTime();
    Save();
    UpdateButtons();
}
function UpdateButtons() {
    startButton.hidden = true;
    pauseButton.hidden = true;
    resumeButton.hidden = true;
    resetButton.hidden = true;
    if (timerRunning) {
        timerText.classList.remove("inactive");
        pauseButton.hidden = false;
        resetButton.hidden = false;
    }
    else {
        timerText.classList.add("inactive");
        if (currentMilliseconds > 0) {
            resumeButton.hidden = false;
            resetButton.hidden = false;
        }
        else {
            startButton.hidden = false;
            resumeButton.hidden = true;
        }
    }
}
function Tick() {
    if (timerRunning) {
        currentMilliseconds += throttled ? throttledRate : tickRate;
        ShowTime();
    }
}
function ShowTime() {
    const formatted = FormatTime(currentMilliseconds);
    timerText.textContent = formatted;
    if (currentMilliseconds <= 0) {
        document.title = "Just a Stopwatch";
    }
    else {
        document.title = formatted.slice(0, -3);
    }
}
function Resync() {
    if (startedDate == null) {
        currentMilliseconds = offset;
    }
    else {
        const now = new Date();
        const offlineElapsed = Math.round((now.getTime() - startedDate.getTime()));
        currentMilliseconds = offlineElapsed + offset;
    }
}
function Save() {
    localStorage.setItem(startKey, startedDate == null ? "" : startedDate.getTime().toString());
    localStorage.setItem(offsetKey, offset != 0 ? offset.toString() : "");
    localStorage.setItem(runningKey, timerRunning ? "RUNNING" : "");
}
function Load() {
    let offsetStr = localStorage.getItem(offsetKey);
    if (offsetStr != null) {
        let offsetInt = parseInt(offsetStr);
        if (!isNaN(offsetInt)) {
            offset = offsetInt;
        }
    }
    if (localStorage.getItem(runningKey) == "RUNNING") {
        timerRunning = true;
        let value = localStorage.getItem(startKey);
        if (value != null) {
            let number = parseInt(value);
            if (!isNaN(number)) {
                startedDate = new Date(number);
            }
        }
    }
    else {
        timerRunning = false;
    }
}
function FormatTime(totalMillis) {
    if (Number.isNaN(totalMillis) || !Number.isFinite(totalMillis)) {
        return "?";
    }
    const totalMinutes = Math.floor(totalMillis / 60000);
    const totalSeconds = Math.floor((totalMillis % 60000) / 1000);
    const milliseconds = totalMillis % 1000;
    let formattedMs = Math.floor(milliseconds / 10).toString();
    if (formattedMs.length < 2) {
        formattedMs = "0" + formattedMs;
    }
    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        let formattedMinutes = Math.round(minutes).toString();
        if (formattedMinutes.length < 2) {
            formattedMinutes = "0" + formattedMinutes;
        }
        let formattedSeconds = Math.round(totalSeconds).toString();
        if (formattedSeconds.length < 2) {
            formattedSeconds = "0" + formattedSeconds;
        }
        return Math.round(hours) + ":" + formattedMinutes + ":" + formattedSeconds + "." + formattedMs;
    }
    if (totalMinutes >= 1) {
        let formattedSeconds = Math.round(totalSeconds).toString();
        if (formattedSeconds.length < 2) {
            formattedSeconds = "0" + formattedSeconds;
        }
        return Math.round(totalMinutes) + ":" + formattedSeconds + "." + formattedMs;
    }
    return Math.round(totalSeconds) + "." + formattedMs;
}
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        clearInterval(interval);
        throttled = true;
        interval = setInterval(Tick, throttledRate);
    }
    else {
        clearInterval(interval);
        interval = setInterval(Tick, tickRate);
        throttled = false;
        Resync();
    }
});
document.addEventListener("DOMContentLoaded", function () {
    Load();
    Resync();
    UpdateButtons();
    ShowTime();
    interval = setInterval(Tick, tickRate);
});
