/* ==========================================
   THEME TOGGLE
   ========================================== */
(function initTheme() {
    const toggle = document.getElementById("themeToggle");
    const stored = localStorage.getItem("theme");

    if (stored === "light") {
        document.documentElement.setAttribute("data-theme", "light");
    }

    toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    });
})();

/* ==========================================
   HERO TYPING EFFECT
   ========================================== */
(function initHeroTyping() {
    const lines = document.querySelectorAll(".hero-line");

    // Hide all lines initially
    lines.forEach((line) => {
        line.style.opacity = "0";
        line.style.transition = "opacity 0.4s ease";
    });

    function typeText(el, text, speed) {
        return new Promise((resolve) => {
            el.classList.add("typing");
            let i = 0;
            el.textContent = "";
            function tick() {
                if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                    setTimeout(tick, speed);
                } else {
                    el.classList.remove("typing");
                    el.classList.add("typed");
                    resolve();
                }
            }
            tick();
        });
    }

    function typeRich(el, segments, speed) {
        return new Promise((resolve) => {
            el.classList.add("typing");
            el.innerHTML = "";
            let segIdx = 0;
            let charIdx = 0;
            let currentSpan = null;

            function tick() {
                if (segIdx >= segments.length) {
                    el.classList.remove("typing");
                    el.classList.add("typed");
                    resolve();
                    return;
                }
                const seg = segments[segIdx];
                if (charIdx === 0) {
                    currentSpan = document.createElement("span");
                    currentSpan.className = seg.c;
                    el.appendChild(currentSpan);
                }
                currentSpan.textContent += seg.t.charAt(charIdx);
                charIdx++;
                if (charIdx >= seg.t.length) {
                    segIdx++;
                    charIdx = 0;
                }
                setTimeout(tick, speed);
            }
            tick();
        });
    }

    async function runSequence() {
        for (const line of lines) {
            const delay = parseInt(line.dataset.delay, 10) || 0;
            await new Promise((r) => setTimeout(r, delay));

            line.style.opacity = "1";

            // Check for rich typed content (colored segments)
            const richEl = line.querySelector("[data-typerich]");
            if (richEl) {
                const segments = JSON.parse(richEl.dataset.typerich);
                await typeRich(richEl, segments, 45);
                continue;
            }

            // Check if this line has a typetext command
            const typeEl = line.querySelector("[data-typetext]");
            if (typeEl) {
                const text = typeEl.dataset.typetext;
                await typeText(typeEl, text, 45);
            }
        }
    }

    // Small initial delay before starting
    setTimeout(runSequence, 400);
})();

/* ==========================================
   RIBBON / CONFETTI BACKGROUND
   ========================================== */
(function initParticles() {
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");
    let ribbons = [];
    const RIBBON_COUNT = 55;
    const colors = [
        "#ff6b9d",
        "#c44dff",
        "#58a6ff",
        "#3fb950",
        "#39d2c0",
        "#ffd700",
        "#f0883e",
        "#ff5f57",
    ];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Ribbon {
        constructor(startFromTop) {
            this.reset(startFromTop);
        }

        reset(startFromTop) {
            this.x = Math.random() * canvas.width;
            this.y = startFromTop
                ? -Math.random() * canvas.height
                : Math.random() * canvas.height;
            this.width = Math.random() * 8 + 4;
            this.height = Math.random() * 12 + 6;
            this.speedY = Math.random() * 0.6 + 0.15;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.4 + 0.15;
            this.wobbleSpeed = Math.random() * 0.03 + 0.01;
            this.wobbleAmp = Math.random() * 1.5 + 0.5;
            this.wobbleOffset = Math.random() * Math.PI * 2;
            this.time = 0;
            // Shape type: 0 = rectangle ribbon, 1 = circle, 2 = thin strip
            this.shape = Math.floor(Math.random() * 3);
        }

        update() {
            this.time++;
            this.y += this.speedY;
            this.x +=
                this.speedX +
                Math.sin(this.time * this.wobbleSpeed + this.wobbleOffset) *
                    this.wobbleAmp;
            this.rotation += this.rotationSpeed;

            // Reset when off screen
            if (this.y > canvas.height + 20) {
                this.reset(true);
                this.y = -20;
            }
            if (this.x < -30) this.x = canvas.width + 30;
            if (this.x > canvas.width + 30) this.x = -30;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            if (this.shape === 0) {
                // Ribbon rectangle
                ctx.fillRect(
                    -this.width / 2,
                    -this.height / 2,
                    this.width,
                    this.height,
                );
            } else if (this.shape === 1) {
                // Circle confetti
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Thin curly strip
                ctx.beginPath();
                ctx.moveTo(-this.width / 2, 0);
                ctx.quadraticCurveTo(0, -this.height / 2, this.width / 2, 0);
                ctx.quadraticCurveTo(0, this.height / 2, -this.width / 2, 0);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    for (let i = 0; i < RIBBON_COUNT; i++) {
        ribbons.push(new Ribbon(false));
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ribbons.forEach((r) => {
            r.update();
            r.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
})();

/* ==========================================
   COUNTDOWN TIMER
   ========================================== */
(function initCountdown() {
    const weddingDate = new Date("April 12, 2026 09:00:00").getTime();

    // For progress bar: assume engagement announcement ~6 months before
    const announcementDate = new Date("2025-10-12").getTime();
    const totalDuration = weddingDate - announcementDate;

    function update() {
        const now = Date.now();
        const remaining = weddingDate - now;

        if (remaining <= 0) {
            document.getElementById("days").textContent = "000";
            document.getElementById("hours").textContent = "00";
            document.getElementById("minutes").textContent = "00";
            document.getElementById("seconds").textContent = "00";
            document.getElementById("progressFill").style.width = "100%";
            document.getElementById("progressPercent").textContent =
                "100% — DEPLOYED! 🎉";
            return;
        }

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
            (remaining % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        document.getElementById("days").textContent = String(days).padStart(
            3,
            "0",
        );
        document.getElementById("hours").textContent = String(hours).padStart(
            2,
            "0",
        );
        document.getElementById("minutes").textContent = String(
            minutes,
        ).padStart(2, "0");
        document.getElementById("seconds").textContent = String(
            seconds,
        ).padStart(2, "0");

        // Progress bar
        const elapsed = now - announcementDate;
        const progress = Math.min(
            Math.max((elapsed / totalDuration) * 100, 0),
            100,
        );
        document.getElementById("progressFill").style.width =
            progress.toFixed(1) + "%";
        document.getElementById("progressPercent").textContent =
            progress.toFixed(1) + "% compiled";
    }

    update();
    setInterval(update, 1000);
})();

/* ==========================================
   SCROLL REVEAL
   ========================================== */
(function initReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger animations
                    setTimeout(() => {
                        entry.target.classList.add("visible");
                    }, i * 100);
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px",
        },
    );

    revealElements.forEach((el) => observer.observe(el));
})();

/* ==========================================
   HEART SVG — FILL AFTER DRAW
   ========================================== */
(function initHeart() {
    const heartPath = document.querySelector(".heart-path");
    if (heartPath) {
        heartPath.addEventListener("animationend", () => {
            heartPath.classList.add("drawn");
        });
        // Fallback: fill after 6.5s regardless
        setTimeout(() => {
            heartPath.classList.add("drawn");
        }, 6500);
    }
})();

/* ==========================================
   RSVP RESPONSE
   ========================================== */
function rsvpResponse(type) {
    const output = document.getElementById("rsvpOutput");
    if (type === "accepted") {
        output.innerHTML = `
      <p style="color: var(--accent-green);">
        <span class="prompt">$</span> echo "Response saved!"<br/>
        <span style="padding-left:20px; display:inline-block;">
          🎉 Thank you! Your attendance has been <strong>committed</strong> to our hearts.<br/>
          See you at the wedding! <strong>git push origin happiness</strong>
        </span>
      </p>
    `;
        launchConfetti();
    } else {
        output.innerHTML = `
      <p style="color: var(--accent-pink);">
        <span class="prompt">$</span> echo "Response saved!"<br/>
        <span style="padding-left:20px; display:inline-block;">
          😢 We'll miss you! Your love is still <strong>merged</strong> with us.<br/>
          <strong>git stash pop</strong> anytime you change your mind! 💛
        </span>
      </p>
    `;
    }
}

/* ==========================================
   CONFETTI BURST
   ========================================== */
function launchConfetti() {
    const colors = [
        "#ff6b9d",
        "#c44dff",
        "#58a6ff",
        "#3fb950",
        "#ffd700",
        "#39d2c0",
        "#f0883e",
    ];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.style.cssText = `
      position: fixed;
      top: -10px;
      left: ${Math.random() * 100}vw;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
      z-index: 9999;
      pointer-events: none;
      animation: confettiFall ${Math.random() * 3 + 2}s ease-out forwards;
      animation-delay: ${Math.random() * 0.5}s;
      transform: rotate(${Math.random() * 360}deg);
    `;
        document.body.appendChild(confetti);

        // Clean up after animation
        setTimeout(() => confetti.remove(), 4000);
    }

    // Inject confetti keyframes if not already present
    if (!document.getElementById("confetti-style")) {
        const style = document.createElement("style");
        style.id = "confetti-style";
        style.textContent = `
      @keyframes confettiFall {
        0% {
          transform: translateY(0) rotate(0deg) scale(1);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(${720 + Math.random() * 360}deg) scale(0.3);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);
    }
}

/* ==========================================
   EASTER EGG — KONAMI CODE
   ========================================== */
(function initEasterEgg() {
    const konamiCode = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "b",
        "a",
    ];
    let konamiIndex = 0;

    document.addEventListener("keydown", (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                launchConfetti();
                // Show secret message
                const msg = document.createElement("div");
                msg.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--bg-card);
          border: 2px solid var(--accent-pink);
          border-radius: 16px;
          padding: 40px;
          z-index: 10000;
          text-align: center;
          font-family: 'Fira Code', monospace;
          box-shadow: var(--glow-pink);
          animation: fadeInUp 0.5s ease;
        `;
                msg.innerHTML = `
          <p style="font-size: 2rem; margin-bottom: 12px;">🎮 Achievement Unlocked!</p>
          <p style="color: var(--accent-cyan);">You found the easter egg!</p>
          <p style="color: var(--text-dim); margin-top: 8px;">console.log("G + V = ❤️ forever")</p>
          <button onclick="this.parentElement.remove()" style="
            margin-top: 20px;
            padding: 10px 24px;
            background: var(--accent-pink);
            border: none;
            border-radius: 8px;
            color: white;
            font-family: 'Fira Code', monospace;
            cursor: pointer;
          ">close()</button>
        `;
                document.body.appendChild(msg);
            }
        } else {
            konamiIndex = 0;
        }
    });
})();

/* ==========================================
   CONSOLE MESSAGE
   ========================================== */
console.log(
    "%c💍 Gnanasekaran & Vaibhava 💍",
    "font-size: 24px; color: #ff6b9d; font-weight: bold;",
);
console.log("%cApril 12, 2026", "font-size: 16px; color: #c44dff;");
console.log(
    "%cwhile(alive) { love++; }",
    "font-size: 14px; color: #3fb950; font-family: monospace;",
);
console.log(
    "%c// No bugs in this relationship!",
    "font-size: 12px; color: #8b949e; font-style: italic;",
);
