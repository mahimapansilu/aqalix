document.addEventListener("DOMContentLoaded", () => {
    
    const WEB3_KEY = "18c64af8-b95d-46a5-ab8b-08f2bef352ac";
    const scroller = document.getElementById('main-scroller');

    // Force scroll to top on reload
    window.scrollTo(0, 0);
    scroller.scrollTo(0, 0);

    // --- 1. STARFIELD LOADER ---
    const warpCanvas = document.getElementById('warp-canvas');
    const wCtx = warpCanvas.getContext('2d');
    warpCanvas.width = window.innerWidth;
    warpCanvas.height = window.innerHeight;
    let stars = [];
    let warpSpeed = 1;

    for(let i=0; i<300; i++) stars.push({ x: Math.random()*innerWidth - innerWidth/2, y: Math.random()*innerHeight - innerHeight/2, z: Math.random()*innerWidth });

    function animateWarp() {
        wCtx.fillStyle = "black";
        wCtx.fillRect(0,0,innerWidth,innerHeight);
        wCtx.translate(innerWidth/2, innerHeight/2);
        stars.forEach(s => {
            let x = s.x / (s.z / innerWidth);
            let y = s.y / (s.z / innerWidth);
            let r = 1.5 * (innerWidth / s.z);
            wCtx.beginPath();
            wCtx.fillStyle = `rgba(0, 240, 255, ${1 - s.z/innerWidth})`;
            wCtx.arc(x,y,r,0,Math.PI*2);
            wCtx.fill();
            s.z -= warpSpeed;
            if(s.z <= 0) s.z = innerWidth;
        });
        wCtx.translate(-innerWidth/2, -innerHeight/2);
        requestAnimationFrame(animateWarp);
    }
    animateWarp();

    async function initLoader() {
        let ip = "FETCHING...";
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ip = data.ip;
        } catch(e) {}

        const logs = [
            `> INITIALIZING AQALIX_V4_OS...`,
            `> NODE_IP: ${ip}`,
            `> SCANNING FOR HINTS...`,
            `> STATUS: ONLINE.`
        ];

        let logBox = document.getElementById('loader-log');
        let i = 0;
        let timer = setInterval(() => {
            if(i < logs.length) {
                let d = document.createElement('div');
                d.innerText = logs[i];
                logBox.appendChild(d);
                document.getElementById('progress-fill').style.width = `${(i+1)*25}%`;
                warpSpeed += 15;
                i++;
            } else {
                clearInterval(timer);
                setTimeout(() => document.getElementById('page-loader').classList.add('loader-hidden'), 800);
            }
        }, 600);
    }
    initLoader();

    // --- 2. MATRIX BG ---
    const mCanvas = document.getElementById('matrix-bg');
    const mCtx = mCanvas.getContext('2d');
    mCanvas.width = window.innerWidth; mCanvas.height = window.innerHeight;
    const chars = "AQALIX01";
    const drops = Array(Math.floor(mCanvas.width/20)).fill(1);
    function drawMatrix() {
        mCtx.fillStyle = "rgba(1, 1, 3, 0.08)";
        mCtx.fillRect(0,0,mCanvas.width, mCanvas.height);
        
        // Check if golden mode is active
        mCtx.fillStyle = document.body.classList.contains('golden-mode') ? "#ffcc00" : "#00ff41";
        mCtx.font = "15px monospace";
        
        drops.forEach((y, i) => {
            mCtx.fillText(chars[Math.floor(Math.random()*chars.length)], i*20, y*20);
            if(y*20 > mCanvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }
    setInterval(drawMatrix, 50);

    // --- 3. SCROLL & NAV ---
    const sections = document.querySelectorAll('.snap-section');
    const navBtns = document.querySelectorAll('.nav-btn');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if(e.isIntersecting) {
                e.target.classList.add('in-view');
                navBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.target === e.target.id);
                });
            }
        });
    }, { threshold: 0.5 });
    sections.forEach(s => observer.observe(s));

    // Global function for buttons
    window.scrollToSection = function(id) {
        const section = document.getElementById(id);
        scroller.scrollTo({
            top: section.offsetTop,
            behavior: 'smooth'
        });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.scrollToSection(btn.dataset.target);
        });
    });

    // --- 4. TERMINAL LOGIC & EASTER EGGS ---
    const cmdInput = document.getElementById('cmd-input');
    const history = document.getElementById('cmd-history');
    const termBody = document.getElementById('term-body');
    let step = 0;
    let contactData = { name: "", email: "", msg: "" };

    const easterEggs = {
        "whoami": "You are a guest visiting AQALIX NODE. Welcome.",
        "system_status": "All systems operational. Data Core stable at 100%.",
        "unlock_core": "SECURITY OVERRIDE. Type 'god_mode' to initiate Legendary Status.",
        "god_mode": "INITIATING GOLDEN OVERRIDE...",
        "clear": "CLEARING TERMINAL..."
    };

    if(cmdInput) {
        cmdInput.addEventListener('keypress', async (e) => {
            if(e.key === 'Enter') {
                let val = cmdInput.value.trim().toLowerCase();
                if(!val) return;

                history.innerHTML += `<div><span style="color:#fff">> ${val}</span></div>`;
                cmdInput.value = "";

                if(easterEggs[val]) {
                    if(val === 'clear') {
                        history.innerHTML = "<div>Terminal Cleared. Ready for input.</div>";
                    } else if (val === 'god_mode') {
                        triggerGoldenMode();
                    } else {
                        history.innerHTML += `<div style="color:var(--cyan)">[SYSTEM]: ${easterEggs[val]}</div>`;
                    }
                } else if(val === 'help') {
                    history.innerHTML += `<div>Commands: whoami, system_status, unlock_core, clear</div>`;
                } else {
                    handleContactFlow(val);
                }
                termBody.scrollTop = termBody.scrollHeight;
            }
        });
    }

    function handleContactFlow(val) {
        if(step === 0) {
            contactData.name = val;
            history.innerHTML += `<div>> Enter your Email Address:</div>`;
            step++;
        } else if(step === 1) {
            contactData.email = val;
            history.innerHTML += `<div>> Your Project Parameters (Message):</div>`;
            step++;
        } else if(step === 2) {
            contactData.msg = val;
            history.innerHTML += `<div>> INITIATING SECURE UPLINK TO CLOUD...</div>`;
            submitToWeb3(contactData);
            step++;
        }
    }

    function triggerGoldenMode() {
        document.body.classList.add('golden-mode');
        document.getElementById('main-title').innerText = "Legendary Status Active";
        history.innerHTML += `<div style="color:#ffcc00; font-weight:bold;">[!!!] REWARD UNLOCKED!</div>`;
        history.innerHTML += `<div style="color:#fff">You found the Aqalix Easter Egg.</div>`;
        history.innerHTML += `<div style="color:#ffcc00">Use Code: AQALIX_LEGEND_26 for a 20% discount.</div>`;
        
        // Speed up the cube
        const cube = document.getElementById('main-cube');
        if(cube) cube.style.animationDuration = '2s';
    }

    async function submitToWeb3(data) {
        const formData = new FormData();
        formData.append("access_key", WEB3_KEY);
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("message", data.msg);
        try {
            const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
            const result = await res.json();
            if(result.success) history.innerHTML += `<div style="color:var(--cyan)">> SUCCESS: Message Archieved. We will contact you soon.</div>`;
            else history.innerHTML += `<div style="color:red">> ERROR: Signal Loss. Try mobile form.</div>`;
        } catch(e) {
            history.innerHTML += `<div style="color:red">> FATAL ERROR: Check Connection.</div>`;
        }
    }

    // --- 5. MOBILE FORM SUBMISSION ---
    const mobileForm = document.getElementById('mobile-web3-form');
    if(mobileForm) {
        mobileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.innerText = "TRANSMITTING...";
            const fd = new FormData(e.target);
            fd.append("access_key", WEB3_KEY);
            try {
                const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
                const result = await res.json();
                btn.innerText = result.success ? "SENT SUCCESSFULLY!" : "FAILED. TRY AGAIN.";
            } catch(error) {
                btn.innerText = "ERROR. CHECK INTERNET.";
            }
        });
    }
});
