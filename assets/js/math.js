// FUNCTIONS

// DATA LOADING
async function load() {
    const rand = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const path = `assets/data/bank_${rand}.json`;

    try {
        const resp = await fetch(path);
        if (!resp.ok) throw new Error(`${resp.status}`);

        const bank = await resp.json();

        // RANDOM SEQUENCE
        const sqnc = Array.from({ length: 1000 }, (_, i) => i);

        // Fisher-Yates shuffle
        for (let i = sqnc.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sqnc[i], sqnc[j]] = [sqnc[j], sqnc[i]];
        }

        return [`bank_${rand}.json`, bank, sqnc]

    } catch (error) {
        console.error(path, error);
        throw error;
    }
}

// STRATEGY GENERATION
async function strategy() {

    let sign;
    let cond;
    const num = 30;
    const among = [-1, 0, 2, 4, 6, 8, 10]; //
    const fake = among[Math.floor(Math.random() * among.length)] * 3;

    if (fake < 0) {
        sign = new Array(num).fill('mute'); // no signals
        cond = 'mute';

    } else if (fake == 0) {
        sign = new Array(num).fill('rand'); // random signals
        cond = 'rand';

    } else {
        let one = new Array(fake).fill('fake');
        let two = new Array(num - fake).fill('true');
        sign = one.concat(two);
        cond = `${Math.round(((num - fake) / num) * 100)}%`;

        // Fisher-Yates shuffle
        for (let i = sign.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sign[i], sign[j]] = [sign[j], sign[i]];
        }
    }
    return [sign, cond]
}

// USER INFORMATION
async function getUserInfo() {
    // 1. Device and Browser (userAgent)
    const userAgent = navigator.userAgent;
    // OS
    let os = "Unknown OS";
    if (/windows/i.test(userAgent)) os = "Windows";
    else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
    else if (/android/i.test(userAgent)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";
    else if (/linux/i.test(userAgent)) os = "Linux";

    // Browser
    let browser = "Unknown Browser";
    if (/edg/i.test(userAgent)) browser = "Microsoft Edge";
    else if (/opr|opera/i.test(userAgent)) browser = "Opera";
    else if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
    else if (/safari/i.test(userAgent)) browser = "Safari";
    else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
    else if (/trident|msie/i.test(userAgent)) browser = "Internet Explorer";

    // 2. Screen & Viewport
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 3. Access Time
    const now = Date.now();
    const hexTime = now.toString(16).toUpperCase();
    const randHex = Math.floor(Math.random() * 0xFFFFF).toString(16).padStart(5, '0').toUpperCase();

    // 4. IP Address and Country
    let ip = 'Unknown';
    let country = 'Unknown';
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        ip = data.ip;
        country = data.country_name;
    } catch (e) {
        console.log('Failed to get IP Address');
    }

    // 5. Aggregate
    const userInfo = {
        "userID": `${hexTime}-${randHex}`,
        "ip": ip,
        "country": country,
        "accessTime": now,
        "userAgent": `${os} / ${browser}`,
        "screen": `${screenWidth} x ${screenHeight}`,
        "viewport": `${viewportWidth} x ${viewportHeight}`
    };

    return userInfo
};

// DATA TRANSMISSION
async function sendResult(data) {
    const maxRetries = 3
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx93FuG_FNzjqatXdu_bCRFvBpPAa-AldywWxnxK-o4FaR6IbaAVBjeK8pyazF87Mmv/exec";

    data.game.solved = data.hist.length - 3;
    data.game.gain = gain;

    // Attempt the request up to maxRetries times
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(WEB_APP_URL, {
                method: "POST",
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // If server returns success, exit the function
            if (result.status === "success") {
                console.log("Server response:", result);
                return true;
            } else {
                throw new Error(result.message || "Unknown server error");
            }

        } catch (error) {
            console.warn(`Attempt ${attempt} failed: ${error.message}`);

            // If all retries are exhausted, throw the error to be handled outside
            if (attempt === maxRetries) {
                console.error("All retry attempts failed.");
                throw error;
            }

            // Wait for a short moment (e.g., 1 second) before the next retry
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}


function question() {

    quiz.inert = false;
    quiz.style.opacity = 1;

    mainBtn.value = 'submit';
    mainBtn.disabled = true;
    mainBtn.textContent = 'SUBMIT';
    mainBtn.style.backgroundColor = '';

    document.querySelectorAll('input[name="qns"]').forEach((el) => {
        el.checked = false;
    });
    document.querySelectorAll('label').forEach(label => {
        label.classList.remove('hint');
    });

    let [q0, q1, q2, q3] = bank[qid].qns;
    document.querySelector('label[for="A"]').innerHTML = q0;
    document.querySelector('label[for="B"]').innerHTML = q1;
    document.querySelector('label[for="C"]').innerHTML = q2;
    document.querySelector('label[for="D"]').innerHTML = q3;
    read.innerHTML = 'Which one yields the <b>LARGEST</b> value?';

    if (rnd >= 0) {
        let hint = bank[qid][sign[rnd]] ?? "X"
        const label = document.querySelector(`label[for="${hint}"]`);
        if (label) {
            label.classList.add('hint');
        }
    }
    t0 = Date.now();
}

function answer() {

    quiz.inert = true;
    quiz.style.opacity = .75;
    mainBtn.disabled = true;

    mainBtn.value = 'next';
    mainBtn.textContent = 'NEXT';
    mainBtn.style.backgroundColor = '#2ca02c';

    // let out
    let [a0, a1, a2, a3] = bank[qid].ans
    let [m0, m1, m2, m3] = bank[qid].mark

    document.querySelector('label[for="A"]').innerHTML += ` = ${a0} ${m0}`;
    document.querySelector('label[for="B"]').innerHTML += ` = ${a1} ${m1}`;
    document.querySelector('label[for="C"]').innerHTML += ` = ${a2} ${m2}`;
    document.querySelector('label[for="D"]').innerHTML += ` = ${a3} ${m3}`;

    setTimeout(function () {
        mainBtn.disabled = false;
        mainBtn.classList.remove('btnloading')
    }, 500)

    const pick = document.querySelector('input[name="qns"]:checked')?.value;

    if (pick == bank[qid].true) {
        read.innerHTML = 'Excellent, you are <b id="correct">CORRECT</b>.'
        gain += (rnd < 0) ? 0 : 1;

    } else {
        read.innerHTML = 'Sorry, you are <b id="wrong">WRONG</b>.'
        lose += (rnd < 0) ? 0 : 1;
    }

    // SAVE RESPONSE
    let today = [rnd, qid,
        bank[qid].true,
        bank[qid][sign[rnd]] ?? "X", sign[rnd] ?? '----',
        pick,
        (bank[qid].true == pick) ? 1 : 0,
        (Date.now() - t0),
        (end_at - Date.now()) / 1000
    ]
    data.hist.push(today)
    // console.log(data)

    // MOVE ON TO THE NEXT QUESTION
    rnd += 1
    qid = sqnc.at(rnd)
    document.getElementById('round_sample').innerHTML = rnd + 4;
    document.getElementById('round_main').innerHTML = rnd;
    document.getElementById('gain').innerHTML = gain;
    document.getElementById('lose').innerHTML = lose;
}


function mmss(secs) { // max. = 1800
    if (secs > 1800) { secs = 1800 }
    const ss = Math.floor(secs % 60).toString().padStart(2, '0');
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    return [mm, ss].join(':')
}


function tick_tock() {
    const left = Math.round((end_at - Date.now()) / 1000);
    clock.innerHTML = mmss(left)

    // 180 and 60
    if (left > 180) {
        clock.style.color = '';
        document.getElementById('note').style.color = '';
    } else if (left > 60) {
        clock.style.color = 'orange';
        document.getElementById('note').style.color = '#d97706';
    } else if (left > 0) {
        clock.style.color = '#cc0000';
        document.getElementById('note').style.color = '#cc0000';
    } else {
        // SAD ENDING
        clearInterval(countdown);
        clock.classList.add('timer-blink');
        document.getElementById('end_sad').style.display = 'flex';
        sadBtn.style.opacity = .25;

        // Execute asynchronous data transmission immediately
        (async function () {
            try {
                await sendResult(data);
                console.log("Result data successfully sent due to timeout.");
            } catch (error) {
                console.error("Failed to send data:", error);
            }
        })();
        sadBtn.disabled = false;
        sadBtn.style.opacity = 1;
    }
}

// --------------------------------------------------------------- //
// INITIAL SETTING
// --------------------------------------------------------------- //
// EMPTY VARIABLES
let end_at, countdown, t0;

const quiz = document.getElementById('quiz');
const read = document.getElementById('read');
const clock = document.getElementById('clock');

// BUTTONS
const mainBtn = document.getElementById('mainBtn');
const playBtn = document.getElementById('playBtn');
const replayBtn = document.getElementById('replayBtn');
const happyBtn = document.getElementById('happyBtn');
const exitBtn = document.getElementById('exitBtn');
const sadBtn = document.getElementById('sadBtn');

// HASIN!
const [file, bank, sqnc] = await load();
const [sign, cond] = await strategy();
const userInfo = await getUserInfo()

let [rnd, lose, gain] = [-4, 0, 0];
let qid = sqnc.at(rnd);

const data = {
    'user': userInfo,
    'game': {
        'bank': file,
        'cond': cond,
        'solved': 0,
        'gain': 0,
        'played': false,
    },
    'hist': []
}

question();

// --------------------------------------------------------------- //
// ACTION
// --------------------------------------------------------------- //
quiz.onchange = () => { mainBtn.disabled = false; };

// --------------------------------------------------------------- //
mainBtn.addEventListener('click', async function () {

    if (rnd == -1) {
        document.getElementById('start').style.display = 'flex';

    } else if (rnd >= 30) { // DOUBLE-CHEKC: should be 30
        // Happy Ending
        clearInterval(countdown);
        document.getElementById('end_happy').style.display = 'flex';
        document.getElementById('gain_r').innerHTML = gain;
        document.getElementById('lose_r').innerHTML = lose;
        happyBtn.style.opacity = .25;

        // DATA TRANSMISSION
        await sendResult(data);
        document.getElementById('wait').innerHTML = 'Successfully submitted!'
        happyBtn.disabled = false;
        happyBtn.style.opacity = 1;

    } else {
        if (mainBtn.value == 'submit') {
            mainBtn.classList.add('btnloading')
            answer()
        } else {
            question()
        }
    }
});

// --------------------------------------------------------------- //
playBtn.addEventListener('click', function () {

    let left = 2;
    const startMsg = document.getElementById('startMsg');
    startMsg.innerHTML = `<h1>${left + 1}</h1>`;

    const readyIn = setInterval(function () {
        if (left > 0) {
            startMsg.innerHTML = `<h1>${left}</h1>`;
            left--;
        } else if (left === 0) {
            startMsg.innerHTML = `<h1>START</h1>`;
            left--;
        } else {
            clearInterval(readyIn);
            document.getElementById('start').style.display = 'none';
            document.getElementById('how_to').style.display = 'none';
            document.getElementById('note_sample').style.display = 'none';

            document.getElementById('board').style.display = 'block';
            document.getElementById('note_main').style.display = 'block';
            document.getElementById('round_main').innerHTML = 0;
            rnd += 1

            // DOUBLE-CHECK
            end_at = Math.round(Date.now() + (10 * 60 + 1) * 1000)
            countdown = setInterval(tick_tock, 1000)
            playedAt()
            question()
        }
    }, 1000);
});

replayBtn.addEventListener('click', function () {
    document.getElementById('replay').style.display = 'none';
});


// ENDING
const endMsg = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; text-align: center;"><h3>Thank you for your participation</h3></div>`

happyBtn.addEventListener('click', function () {
    document.body.innerHTML = endMsg;
});

exitBtn.addEventListener('click', function () {
    document.body.innerHTML = endMsg;
});

sadBtn.addEventListener('click', function () {
    document.body.innerHTML = endMsg;
});
// --------------------------------------------------------------- //
// PREVENTING CHEATING
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


const cheatMsg = `<div style="display: flex; justify-content: center; flex-direction: column; gap: 10px;height: 100vh; font-family: sans-serif; text-align: center;"><p>An unexpected error occurred, and this session has been ended for security reasons.</p><h3>Thank you for your understanding</h3></div>`

// Reload or Back
window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    // event.returnValue = '';
});

// Detect when the user returns to the page
window.addEventListener('focus', () => {
    cheating()
});

const cheat = document.getElementById('cheatMsg');

function cheating() {
    document.getElementById('cheat').style.display = 'flex';
    let count = 0;
    const timer = setInterval(() => {

        const r1 = Math.floor(Math.random() * 1000);
        cheat.innerHTML += bank[r1].qns.join('\t')
        count++;
        if (count >= 200) {
            clearInterval(timer);
            document.body.innerHTML = cheatMsg;
        }
    }, 20);
}

// --------------------------------------------------------------- //
// RECORD lastPlay
function playedAt() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const lastPlay = formatter.format(now);
    localStorage.setItem('lastPlay', lastPlay);
}


// Would You Like to Play AGAIN?
let played = localStorage.getItem('lastPlay');

if (played) {
    data.game.played = true;
    document.getElementById('replay').style.display = 'flex';
    document.getElementById('lastPlay').innerHTML = played;
}