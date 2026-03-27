document.addEventListener('DOMContentLoaded', () => {
    const chars = "!<>-_\\/[]{}—=+*^?#________诶比西迪가나다라अआकखঅআকখАБВГДｱｲｳｴｵｶｷｸｹｺαβγδεζηθابتثجحخאבגדה";

    function decipherText(element) {
        const targetText = element.getAttribute('data-value') || element.innerText;
        // Store original text in data attribute if not present
        if (!element.getAttribute('data-value')) {
            element.setAttribute('data-value', targetText);
        }

        // --- DISABLE ANIMATION IN SIMPLE MODE ---
        if (document.body.classList.contains('theme-simple')) {
            element.innerText = targetText;
            element.classList.add('deciphered');
            return; // Exit function immediately
        }

        // Clear existing interval if present
        if (element.dataset.intervalId) {
            clearInterval(Number(element.dataset.intervalId));
        }

        // Initial State Capture & Disable Glitch
        const hasGlitch = element.classList.contains('glitch');
        const hasLayers = element.classList.contains('layers');
        if (hasGlitch) element.classList.remove('glitch');
        if (hasLayers) element.classList.remove('layers');

        // Adjusted duration to be faster than original but slower than previous attempt
        const totalDuration = 700 + Math.random() * 600; // Medium-fast duration
        const frameRate = 30;
        const totalFrames = (totalDuration / 1000) * frameRate;

        let frame = 0;

        // Preserve dimensions to prevent layout shifts
        const originalWidth = element.offsetWidth;
        const originalHeight = element.offsetHeight;
        const computedStyle = window.getComputedStyle(element);
        const originalDisplay = computedStyle.display;

        element.style.width = `${originalWidth}px`;
        element.style.height = `${originalHeight}px`; // Restored to prevent jumping

        // Only force inline-block if it was inline to allow width setting
        if (originalDisplay === 'inline') {
            element.style.display = 'inline-block';
        } else {
            element.style.display = originalDisplay;
        }

        element.style.overflow = 'visible'; // Visible to prevent clipping
        element.style.verticalAlign = 'top'; // Restored to align

        const counter = setInterval(() => {
            const progress = frame / totalFrames;
            const revealIndex = Math.floor(progress * targetText.length);

            let output = "";
            for (let i = 0; i < targetText.length; i++) {
                if (i <= revealIndex) {
                    output += targetText[i];
                } else {
                    output += chars[Math.floor(Math.random() * chars.length)];
                }
            }

            element.innerText = output;

            // Sync data-text for glitch effects
            if (element.hasAttribute('data-text')) {
                element.setAttribute('data-text', output);
            }

            frame++;
            if (frame > totalFrames) {
                clearInterval(counter);
                element.innerText = targetText;
                if (element.hasAttribute('data-text')) {
                    element.setAttribute('data-text', targetText);
                }
                // Cleanup styles
                element.style.width = '';
                element.style.height = '';
                element.style.display = '';
                element.style.overflow = '';
                element.style.verticalAlign = '';

                // Restore Glitch
                if (hasGlitch) element.classList.add('glitch');
                if (hasLayers) element.classList.add('layers');

                delete element.dataset.intervalId;
            }
        }, 1000 / frameRate);

        element.dataset.intervalId = counter;
    }

    // Prepare Buttons for Glitch Effect (Layers)
    document.querySelectorAll('.btn').forEach(btn => {
        const text = btn.innerText;
        btn.setAttribute('data-text', text);
        // Ensure content is wrapped in span if not already
        if (!btn.querySelector('span')) {
            btn.innerHTML = `<span>${text}</span>`;
        }
    });

    // specific handling for the intro text to ensure it runs
    const typingElement = document.querySelector('.typing-effect');
    if (typingElement) {
        if (window.innerWidth <= 768) {
            // No typing animation on mobile, just remove cursor border
            typingElement.style.borderRight = 'none';
        } else {
            decipherText(typingElement);
            // Add cursor effect after animation
            setTimeout(() => {
                typingElement.style.borderRight = '2px solid var(--neon-pink)';
                setInterval(() => {
                    typingElement.style.borderColor =
                        typingElement.style.borderColor === 'transparent'
                            ? 'var(--neon-pink)'
                            : 'transparent';
                }, 500);
            }, 2500); // Default timeout
        }
    }


    // Global Text Observer
    // Select ALL text-containing elements, including glitch titles, logo, nav links
    // Scroll Jacking Logic
    let currentSection = 0;
    const sections = document.querySelectorAll('section');
    const mainContainer = document.querySelector('main');
    // Ensure styles are set for transform
    if (mainContainer) {
        mainContainer.style.transition = 'transform 0.5s cubic-bezier(0.645, 0.045, 0.355, 1.000)';
    }

    const totalSections = sections.length;
    let isScrolling = false;

    // Force scroll to top on reload to prevent browser scroll restoration issues
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Initial Setup
    if (mainContainer) {
        mainContainer.style.transform = 'translateY(0)';
    }

    // Trigger initial animation
    triggerSectionAnimation(0);
    updateNav(0);

    // Wheel Event
    window.addEventListener('wheel', (e) => {
        if (document.getElementById('spa-detail-view')?.style.display !== 'none') return; // Allow normal scroll on detail page
        if (window.innerWidth <= 768) return; // Disable on mobile
        if (isScrolling) return;

        // Add threshold to prevent sensitive touchpads from triggering on tiny movements
        if (Math.abs(e.deltaY) < 30) return;

        if (e.deltaY > 0) {
            // Scroll Down
            if (currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            }
        } else {
            // Scroll Up
            if (currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }
    }, { passive: false });

    // Keyboard Event
    window.addEventListener('keydown', (e) => {
        if (document.getElementById('spa-detail-view')?.style.display !== 'none') return; // Allow normal keys on detail page
        if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(e.key)) {
            if (window.innerWidth > 768) e.preventDefault(); // Only block default on desktop
        }

        if (window.innerWidth <= 768) return; // Disable on mobile
        if (isScrolling) return;

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            if (currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1, 500); // Faster cooldown for keys
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            if (currentSection > 0) {
                scrollToSection(currentSection - 1, 500); // Faster cooldown for keys
            }
        }
    });

    function scrollToSection(index, cooldown = 600) {
        if (!mainContainer) return;
        isScrolling = true;
        currentSection = index;

        // Move container
        mainContainer.style.transform = `translateY(-${index * 100}vh)`;

        // Trigger animations
        triggerSectionAnimation(index);

        // Update Nav
        updateNav(index);

        setTimeout(() => {
            isScrolling = false;
        }, cooldown);
    }

    function triggerSectionAnimation(index) {
        // Skip on mobile — mobile uses its own IntersectionObserver system
        if (window.innerWidth <= 768) return;

        const section = sections[index];
        if (!section) return;

        // Animate Timeline if Education Section
        if (section.id === 'education' && !section.classList.contains('section-animated')) {
            const line = section.querySelector('.timeline-line');
            const items = section.querySelectorAll('.timeline-item');

            // Mark as animated so it doesn't run again or reset
            section.classList.add('section-animated');

            // Expand Line
            setTimeout(() => {
                if (line) line.style.width = '100%';
            }, 500);

            // Pop items sequentially
            items.forEach((item, i) => {
                setTimeout(() => {
                    item.classList.add('show-item');
                    // Decipher text inside item
                    const textEls = item.querySelectorAll('h3, .date, .school, .grade');
                    textEls.forEach(el => {
                        el.classList.add('deciphered');
                        decipherText(el);
                    });
                }, 1500 + (i * 800));
            });
        }

        // Animate About Terminal
        if (section.id === 'about' && !section.classList.contains('terminal-animated')) {
            section.classList.add('terminal-animated');
            initAboutTerminalAnimation();
        }

        // Reset and animate text
        // Reset and animate text - apply to essentially all text holding elements
        const textElements = section.querySelectorAll('h1, h2, h3, h4, p, li, a, label, span, button, .logo, .glitch, .project-tag, .achievement-num, .achievement-desc');
        textElements.forEach(el => {
            // Skip: already deciphered, typing-effect, terminal dots, timeline items
            // Skip icon labels and FontAwesome/Devicon icons
            const isLangLabel = el.closest('.lang-card') && el.tagName === 'SPAN';
            const isIcon = el.tagName === 'I' || el.tagName === 'IMG' || el.tagName === 'SVG';
            const isNavIndicator = el.classList.contains('nav-indicator');
            const isCertLink = el.classList.contains('cert-link');
            const isInNav = el.closest('header');
            const isAboutTerminal = el.closest('#about-terminal');

            if (
                !el.classList.contains('deciphered') &&
                !el.classList.contains('typing-effect') &&
                !el.classList.contains('dot') &&
                !el.closest('.timeline-item') &&
                !isLangLabel &&
                !isIcon &&
                !isNavIndicator &&
                !isCertLink &&
                !isInNav &&
                !isAboutTerminal &&
                el.innerText.trim() !== ''
            ) {
                el.classList.add('deciphered');
                decipherText(el);
            }
        });
    }

    function updateNav(index) {
        const section = sections[index];
        if (!section) return;
        const activeId = section.getAttribute('id');
        const activeLink = document.querySelector(`nav a[href="#${activeId}"]`);
        const indicator = document.querySelector('.nav-indicator');

        document.querySelectorAll('nav a').forEach(link => {
            // Reset styles and class
            link.classList.remove('glitch-active');
            link.style.color = 'var(--text-color)';
            link.style.textShadow = 'none';

            if (link === activeLink) {
                // Add Glitch Effect class
                link.classList.add('glitch-active');
                link.style.color = 'var(--neon-cyan)';
                link.style.textShadow = '0 0 10px var(--neon-cyan)';
            }
        });

        // Move Indicator
        if (activeLink && indicator) {
            const navUl = document.querySelector('nav ul');
            // robust calculation usinggetBoundingClientRect
            const linkRect = activeLink.getBoundingClientRect();
            const listRect = navUl.getBoundingClientRect();

            const left = linkRect.left - listRect.left;
            const width = linkRect.width;

            // Check if position changed to trigger glitch
            if (indicator.style.left !== `${left}px`) {
                indicator.classList.add('glitching');

                // Remove glitch after transition
                clearTimeout(indicator.dataset.glitchTimeout);
                indicator.dataset.glitchTimeout = setTimeout(() => {
                    indicator.classList.remove('glitching');
                }, 300); // Match CSS transition duration
            }

            indicator.style.left = `${left}px`;
            indicator.style.width = `${width}px`;
        }
    }


    // Override Nav Links - only intercept internal hash links
    document.querySelectorAll('nav a, .btn').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Skip external links, download links, and non-hash links
            if (!href || !href.startsWith('#')) return;
            if (link.classList.contains('btn-download-cv')) return;
            if (link.classList.contains('cert-link')) return;

            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                if (window.innerWidth <= 768) {
                    // Mobile: use native smooth scroll
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    // Desktop: use scroll-jacking
                    const index = Array.from(sections).indexOf(targetSection);
                    scrollToSection(index);
                }
            }

            // Close mobile menu if open
            const nav = document.querySelector('nav');
            const hamburger = document.getElementById('hamburger-menu');
            if (nav && nav.classList.contains('nav-open')) {
                nav.classList.remove('nav-open');
                hamburger.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });

    // Mobile: track active section on scroll for nav highlighting
    if (window.innerWidth <= 768) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(sections).indexOf(entry.target);
                    if (index !== -1) {
                        updateNav(index);
                    }
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger-menu');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const nav = document.querySelector('nav');
            nav.classList.toggle('nav-open');
            hamburger.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Simple Contact Form Handling
    const form = document.querySelector('#contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'TRANSMITTING...';
            setTimeout(() => {
                btn.innerText = 'DATA_SENT';
                btn.style.backgroundColor = 'var(--neon-green)';
                btn.style.color = 'black';
                form.reset();
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                }, 3000);
            }, 1500);
        });
    }

    // Mobile Scroll Animation Logic
    function initMobileAnimations() {
        if (window.innerWidth > 768) return;

        // Decipher standard text elements IMMEDIATELY instead of on scroll
        const textElements = document.querySelectorAll('h1, h2.section-title, p, h3, h4, li, a.btn, label, span.glitch, .project-tag, .achievement-num, .achievement-desc');
        textElements.forEach(el => {
            const isLangLabel = el.closest('.lang-card') && el.tagName === 'SPAN';
            const isIcon = el.tagName === 'I' || el.tagName === 'IMG' || el.tagName === 'SVG';
            const isNavIndicator = el.classList.contains('nav-indicator');
            const isCertLink = el.classList.contains('cert-link');
            const isInNav = el.closest('header');
            const isAboutTerminal = el.closest('#about-terminal');

            // Avoid re-triggering or conflicting with specific effects
            if (
                !el.classList.contains('deciphered') &&
                !el.classList.contains('typing-effect') &&
                !el.classList.contains('dot') &&
                !el.closest('.timeline-item') &&
                !isLangLabel &&
                !isIcon &&
                !isNavIndicator &&
                !isCertLink &&
                !isInNav &&
                !isAboutTerminal &&
                el.innerText.trim() !== ''
            ) {
                el.classList.add('deciphered');
                decipherText(el);
            }
        });

        // Decipher Timeline Items IMMEDIATELY
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.classList.add('show-item');

            // Decipher content inside
            const textEls = item.querySelectorAll('h3, .date, .school, .grade');
            textEls.forEach(t => {
                if (!t.classList.contains('deciphered')) {
                    t.classList.add('deciphered');
                    decipherText(t);
                }
            });
        });

        // Expand Timeline Line IMMEDIATELY
        const line = document.querySelector('.timeline-line');
        if (line) {
            line.style.height = '100%';
        }

        // Disable typing animation for About Terminal on mobile (show text instantly)
        const aboutTerminal = document.getElementById('about-terminal');
        if (aboutTerminal) {
            aboutTerminal.classList.add('terminal-animated'); // Prevents desktop observer from triggering it
            const lines = aboutTerminal.querySelectorAll('.terminal-line');
            lines.forEach(line => {
                line.style.display = 'block';
            });
        }
    }

    // Call on load
    initMobileAnimations();

    // Track initialization to prevent duplicate observers
    let mobileAnimationsInitialized = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && !mobileAnimationsInitialized) {
            initMobileAnimations();
            mobileAnimationsInitialized = true;
        } else if (window.innerWidth > 768) {
            mobileAnimationsInitialized = false;
        }
    });

    // Matrix Background Effect Removed

    // Hacker Terminal Animation
    function initHackerAnimation() {
        const log = document.querySelector('.code-log');
        const alert = document.querySelector('.breach-alert');
        if (!log || !alert) return;

        const commands = [
            "CONNECTING TO PORT 8080...",
            "BYPASSING FIREWALL...",
            "DECRYPTING ROOT ACCESS...",
            "INJECTING PAYLOAD...",
            "DOWNLOADING DATABASE...",
            "ACCESSING MAINFRAME...",
            "01001011 01101100 01100001",
            "CRACKING HASH..."
        ];

        let isBreached = false;

        function runSequence() {
            if (isBreached) return;

            // Reset
            log.innerHTML = '';
            alert.classList.add('hidden');

            let lineCount = 0;
            const interval = setInterval(() => {
                const line = document.createElement('div');
                line.className = 'code-line';
                const cmd = `> ${commands[Math.floor(Math.random() * commands.length)]}`;
                line.setAttribute('data-value', cmd); // Set for decipher
                line.innerText = cmd; // Initial set
                log.appendChild(line);

                decipherText(line); // Trigger effect

                log.scrollTop = log.scrollHeight; // Auto-scroll

                lineCount++;
                if (lineCount > 6) { // Reduced count from 10 to 6 for faster loop
                    clearInterval(interval);
                    // Wait for last line to decipher (800ms)
                    setTimeout(triggerBreach, 800);
                }
            }, 100); // Super fast typing (was 250ms)
        }

        function triggerBreach() {
            isBreached = true;
            alert.classList.remove('hidden');

            // Decipher Alert Text
            const h1 = alert.querySelector('h1');
            const p = alert.querySelector('p');
            if (h1) decipherText(h1);
            if (p) decipherText(p);

            // Wait then reset with Tubelight Out effect
            setTimeout(() => {
                alert.classList.add('tubelight-exit');

                // Wait for animation (400ms) then start Chaos Mode
                setTimeout(() => {
                    alert.classList.remove('tubelight-exit');
                    alert.classList.add('hidden'); // Hide alert forever
                    startChaosMode(); // Infinite scrolling
                }, 400);
            }, 1500); // Reduced delay before hiding alert (was 4000ms)
        }

        function startChaosMode() {
            log.innerHTML = '';
            log.classList.add('chaos');

            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&あいうえおカキクケコサシスセソБГДЖИЛПФЦЧШЩЪЫЭЮЯΩΔΣΠΨ";

            setInterval(() => {
                const line = document.createElement('div');
                line.className = 'code-line';

                // Generate random chaotic string
                let chaosText = "";
                for (let i = 0; i < 30; i++) {
                    chaosText += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                line.textContent = chaosText;
                log.appendChild(line);
                log.scrollTop = log.scrollHeight;

                // Limit DOM size
                if (log.childNodes.length > 50) {
                    log.removeChild(log.firstChild);
                }
            }, 50); // Ultra fast scroll
        }

        runSequence();
    }

    // About Me Terminal Typewriter Animation
    function initAboutTerminalAnimation() {
        const terminal = document.getElementById('about-terminal');
        if (!terminal) return;

        const lines = terminal.querySelectorAll('.terminal-line');
        // Hide all initially
        lines.forEach(line => {
            line.style.display = 'none';
        });

        let currentLine = 0;

        function processNextLine() {
            if (currentLine >= lines.length) return;

            const line = lines[currentLine];
            line.style.display = 'block';

            if (line.classList.contains('command-line')) {
                const cmdTextSpan = line.querySelector('.cmd-text');
                const fullText = cmdTextSpan.innerText;
                cmdTextSpan.innerText = '';

                // Add caret
                const caret = document.createElement('span');
                caret.className = 'terminal-caret';
                cmdTextSpan.parentNode.insertBefore(caret, cmdTextSpan.nextSibling);

                let charIndex = 0;
                const typeInterval = setInterval(() => {
                    cmdTextSpan.innerText += fullText.charAt(charIndex);
                    charIndex++;
                    if (charIndex >= fullText.length) {
                        clearInterval(typeInterval);
                        setTimeout(() => {
                            caret.remove(); // Remove caret when done typing
                            currentLine++;
                            processNextLine();
                        }, 400); // Pause after typing before response
                    }
                }, 80); // Typing speed (slowed down from 50ms)
            } else if (line.classList.contains('response')) {
                // Instantly show response, then wait before next command
                setTimeout(() => {
                    currentLine++;
                    processNextLine();
                }, 600); // Pause to read response before next command
            }
        }

        // Slight initial delay before starting to type
        setTimeout(processNextLine, 500);
    }

    // Modal Logic
    function initSkillModals() {
        const skillCards = document.querySelectorAll('.lang-card.has-tooltip');
        const modalOverlay = document.getElementById('skill-modal');
        const modalCloseBtn = document.querySelector('.skill-modal-close');

        const modalLogoContainer = document.querySelector('.skill-modal-logo');
        const modalTitleEl = document.querySelector('.skill-modal-title');
        const modalTitleSpan = document.querySelector('.skill-modal-title span');
        const modalDescEl = document.querySelector('.skill-modal-desc');

        if (!modalOverlay) return;

        skillCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Prevent event from bubbling up unexpectedly
                e.stopPropagation();

                // Extract data from the clicked card
                const logoNode = card.querySelector('i, img').cloneNode(true);
                logoNode.classList.add('glitch', 'layers', 'svg-glitch-hack');

                const titleText = card.querySelector('span:not(.tool-tooltip)').innerText;
                const descText = card.querySelector('.tool-tooltip').innerText;

                // Add data-text to logo so the ::before/::after glitch layers have content
                logoNode.setAttribute('data-text', titleText);

                // Populate modal
                modalLogoContainer.innerHTML = '';
                modalLogoContainer.appendChild(logoNode);

                modalTitleSpan.innerText = titleText;
                modalTitleSpan.setAttribute('data-value', titleText); // ensure decipher uses this
                modalTitleEl.setAttribute('data-text', titleText); // sync glitch overlay

                modalDescEl.innerText = descText;
                modalDescEl.setAttribute('data-value', descText); // ensure decipher uses this

                // Show modal
                modalOverlay.classList.add('active');
            });
        });

        // Close logic
        function closeModal() {
            modalOverlay.classList.remove('active');
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeModal);
        }

        // Close on clicking outside the content box
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Close on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    initSkillModals();
    initHackerAnimation();

    // ==========================================
    // THEME TOGGLE LOGIC
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');

    // Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme === 'simple') {
        document.body.classList.add('theme-simple');
        themeIcon.className = 'devicon-apple-original'; // Representing simple/clean
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('theme-simple');
        const isSimple = document.body.classList.contains('theme-simple');

        if (isSimple) {
            localStorage.setItem('portfolioTheme', 'simple');
            themeIcon.className = 'devicon-apple-original'; // Swaps to apple icon for simple mode
        } else {
            localStorage.setItem('portfolioTheme', 'cyberpunk');
            themeIcon.className = 'devicon-chrome-plain'; // Swaps back to normal icon
        }
    });

    // ==========================================
    // SPA NAVIGATION FOR TRAINING DETAILS
    // ==========================================
    const spaContainer = document.createElement('div');
    spaContainer.id = 'spa-detail-view';
    spaContainer.style.display = 'none';
    document.body.appendChild(spaContainer);

    function showDetailPage(html) {
        // Parse fetched HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract <style> and body content
        const styleEl = doc.querySelector('style');
        const bodyContent = doc.querySelector('.container');

        if (!bodyContent) return;

        // Build the SPA view
        spaContainer.innerHTML = '';

        // Add a back button
        const backBtn = document.createElement('button');
        backBtn.className = 'btn-small special spa-back-btn';
        backBtn.innerText = '← Back to Portfolio';
        backBtn.style.cssText = `
            position: fixed; top: 20px; left: 20px; z-index: 10000;
            cursor: pointer; font-family: 'Orbitron', monospace;
            font-size: 12px; letter-spacing: 1px; padding: 10px 20px;
            background: rgba(10, 21, 32, 0.9); color: #00ffe7;
            border: 1px solid #00ffe7; backdrop-filter: blur(8px);
            transition: all 0.3s ease;
        `;
        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.background = 'rgba(0, 255, 231, 0.15)';
            backBtn.style.boxShadow = '0 0 12px rgba(0,255,231,0.4)';
        });
        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.background = 'rgba(10, 21, 32, 0.9)';
            backBtn.style.boxShadow = 'none';
        });
        backBtn.addEventListener('click', () => hideDetailPage());

        // Inject scoped styles
        if (styleEl) {
            const scopedStyle = document.createElement('style');
            scopedStyle.id = 'spa-detail-styles';
            // Scope all styles to #spa-detail-view
            let css = styleEl.textContent;
            // Replace body rules to target the container instead
            css = css.replace(/body\s*\{/g, '#spa-detail-view {');
            // Wrap other selectors
            css = css.replace(/(^|\})\s*(\.[a-zA-Z])/gm, '$1 #spa-detail-view $2');
            scopedStyle.textContent = css;
            spaContainer.appendChild(scopedStyle);
        }

        spaContainer.appendChild(backBtn);
        spaContainer.appendChild(bodyContent);

        // Hide main page elements
        document.querySelector('header').style.display = 'none';
        document.querySelector('main').style.display = 'none';
        const modal = document.getElementById('skill-modal');
        if (modal) modal.style.display = 'none';

        // Show detail view — override body overflow so page can scroll
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.height = 'auto';
        spaContainer.style.display = 'block';
        window.scrollTo(0, 0);

        // Push state so browser back button works
        history.pushState({ spaDetail: true }, '', '#training-details');
    }

    function hideDetailPage() {
        spaContainer.style.display = 'none';
        spaContainer.innerHTML = '';

        // Restore body overflow for scroll-jacking
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';

        // Restore main page elements
        document.querySelector('header').style.display = '';
        document.querySelector('main').style.display = '';
        const modal = document.getElementById('skill-modal');
        if (modal) modal.style.display = '';

        // Restore scroll position to training section
        if (history.state && history.state.spaDetail) {
            history.back();
        }

        // Re-scroll to training section on desktop
        if (window.innerWidth > 768 && mainContainer) {
            const trainingIndex = Array.from(sections).findIndex(s => s.id === 'training');
            if (trainingIndex !== -1) {
                scrollToSection(trainingIndex);
            }
        } else {
            const trainingSection = document.getElementById('training');
            if (trainingSection) {
                trainingSection.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
        }
    }

    // Listen for browser back button
    window.addEventListener('popstate', (e) => {
        if (spaContainer.style.display !== 'none') {
            spaContainer.style.display = 'none';
            spaContainer.innerHTML = '';
            document.querySelector('header').style.display = '';
            document.querySelector('main').style.display = '';
            const modal = document.getElementById('skill-modal');
            if (modal) modal.style.display = '';

            // Restore body overflow for scroll-jacking
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';

            if (window.innerWidth > 768 && mainContainer) {
                const trainingIndex = Array.from(sections).findIndex(s => s.id === 'training');
                if (trainingIndex !== -1) {
                    mainContainer.style.transform = `translateY(-${trainingIndex * 100}vh)`;
                    currentSection = trainingIndex;
                    updateNav(trainingIndex);
                }
            }
        }
    });

    // Intercept "More Details" link clicks
    document.querySelectorAll('a[href="summer_training_section.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            fetch('summer_training_section.html')
                .then(res => res.text())
                .then(html => showDetailPage(html))
                .catch(err => {
                    console.error('Failed to load training details:', err);
                    window.location.href = 'summer_training_section.html';
                });
        });
    });

});
