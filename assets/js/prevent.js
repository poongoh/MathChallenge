// ---------------------------------------- //
// PREVENT LOOKING INTO
// ---------------------------------------- //
// 1. right-click
document.addEventListener('contextmenu', e => e.preventDefault());

// 2. shortcut
document.addEventListener('keydown', e => {
    if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')
    ) {
        e.preventDefault();
    }
});

// 3. debugger
setInterval(() => {
    (function () { return false; }).constructor('debugger')();
}, 100);


// Reload or Back
window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    // event.returnValue = '';
});

// Detect when the user leaves the tab or window (e.g., switches tabs or minimizes)
window.addEventListener('blur', () => {
    console.log("The user has left the page.");
    // Example: Increment a warning counter or pause a timer
});

// Detect when the user returns to the page
window.addEventListener('focus', () => {
    console.log("The user has returned to the page.");
});


// A fatal error has been detected, and the session has been terminated to prevent further issues.
