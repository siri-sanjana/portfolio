import { initBallpit } from './ballpit.js?v=13';
// Removed early init; will be called after preloader

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- PRELOADER ANIMATION ---
const preloaderTL = gsap.timeline();

preloaderTL.to(".preloader-text span", {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.2,
    ease: "power4.out"
})
.to(".preloader-text span", {
    y: -100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power4.in",
    delay: 0.5
})
.to(".preloader", {
    y: "-100%",
    duration: 1,
    ease: "power4.inOut"
})
.from(".navbar", {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: "power4.out"
}, "-=0.5")
.from(".greeting", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
}, "-=0.8")
.from(".name", {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power4.out"
}, "-=0.6")
.from(".typewriter-container", {
    opacity: 0,
    duration: 0.5
}, "-=0.3")
.from(".hero-desc", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
}, "-=0.5")
.from(".hero-btns", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
}, "-=0.6");

// --- INIT LOCOMOTIVE SCROLL ---
// Wait for preloader to finish before initializing scroll
preloaderTL.call(() => {
    const scroll = new LocomotiveScroll({
        el: document.querySelector('#main-container'),
        smooth: true,
        multiplier: 1.2,
        smartphone: { smooth: true },
        tablet: { smooth: true }
    });

    // Sync Locomotive Scroll with GSAP ScrollTrigger
    scroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy("#main-container", {
        scrollTop(value) {
            return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
        },
        pinType: document.querySelector("#main-container").style.transform ? "transform" : "fixed"
    });

    // --- VERTICAL REVEAL FOR PROJECTS ---
    const projectCards = document.querySelectorAll(".project-card");
    
    projectCards.forEach((card, index) => {
        gsap.from(card, {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                scroller: "#main-container",
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

// SplashCursor initialized after scroll setup (once)
    });

    // Refresh ScrollTrigger and LocomotiveScroll
    ScrollTrigger.addEventListener("refresh", () => scroll.update());
    ScrollTrigger.refresh();

    // Init Typed.js after preloader
    const typed = new Typed('.typed-text', {
        strings: [
            'AI &amp; CS Engineering Student',
            'Data Enthusiast',
            'Problem Solver',
            'Full Stack Developer'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
    
    // Initialize SplashCursor now that the canvas is sized and scroll is ready
    console.log('Initializing SplashCursor after preloader');
    try {
        initSplashCursor('fluid');
    } catch (err) {
        alert("SplashCursor init error: " + err);
        console.error(err);
    }
    
    console.log('Initializing TextPressure after preloader');
    try {
        new TextPressure('text-pressure-heading', {
            textColor: '#ffffff',
            flex: true,
            alpha: false,
            stroke: false,
            width: true,
            weight: true,
            italic: true,
            minFontSize: 36
        });
    } catch (err) {
        console.error("TextPressure init error: " + err);
    }

    initBallpit('ballpit-canvas', {
        count: 50,
        gravity: 0.05,
        friction: 0.998,
        wallBounce: 0.95,
        followCursor: false,
        colors: [0xfca311, 0x14213d, 0xe5e5e5]
    });
});
