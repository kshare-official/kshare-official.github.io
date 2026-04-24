// ============================================
// JEKYLL THEME - JAVASCRIPT
// ============================================

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function () {
    // Main menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
            const isExpanded = mobileMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when a regular link is clicked
        const navLinks = mobileMenu.querySelectorAll('a:not(.mobile-legal-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Mobile Legal submenu toggle
    const legalToggle = document.querySelector('.mobile-legal-toggle');
    const legalSubmenu = document.querySelector('.mobile-legal-submenu');
    const legalChevron = document.querySelector('.mobile-legal-chevron');

    if (legalToggle && legalSubmenu) {
        legalToggle.addEventListener('click', function (e) {
            e.preventDefault();
            const isOpen = legalSubmenu.style.maxHeight && legalSubmenu.style.maxHeight !== '0px';

            if (isOpen) {
                legalSubmenu.style.maxHeight = '0px';
                if (legalChevron) legalChevron.style.transform = 'rotate(0deg)';
            } else {
                legalSubmenu.style.maxHeight = legalSubmenu.scrollHeight + 'px';
                if (legalChevron) legalChevron.style.transform = 'rotate(180deg)';
            }
        });

        // Close submenu when a legal link is clicked
        const legalLinks = legalSubmenu.querySelectorAll('a');
        legalLinks.forEach(link => {
            link.addEventListener('click', function () {
                legalSubmenu.style.maxHeight = '0px';
                if (legalChevron) legalChevron.style.transform = 'rotate(0deg)';
                mobileMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
});

function smoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Reading time calculation
function calculateReadingTime() {
    const postContent = document.querySelector('.post-content');
    if (!postContent) return;

    const text = postContent.innerText;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    // Update reading time if element exists
    const readingTimeElement = document.querySelector('.reading-time');
    if (readingTimeElement && !readingTimeElement.textContent) {
        readingTimeElement.textContent = `${readingTime} min read`;
    }
}

// Lazy loading for images - Optimized with rootMargin for better UX
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px' // Start loading 50px before image enters viewport
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Copy code block functionality
function setupCodeBlocks() {
    document.querySelectorAll('pre').forEach(pre => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code');

        button.addEventListener('click', function () {
            const code = pre.querySelector('code');
            const text = code.innerText;

            navigator.clipboard.writeText(text).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        });

        pre.style.position = 'relative';
        pre.appendChild(button);
    });
}

// Newsletter form handling
function setupNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = form.querySelector('input[type="email"]').value;

        // Here you would typically send the email to your backend
        console.log('Newsletter signup:', email);

        // Show success message
        const message = document.createElement('p');
        message.className = 'success-message';
        message.textContent = 'Thank you for subscribing!';
        form.appendChild(message);

        // Reset form
        form.reset();

        // Remove message after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    });
}



// Search functionality - Optimized with debouncing to prevent forced reflows
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', function (e) {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase();
            const posts = document.querySelectorAll('.post-list-item');

            posts.forEach(post => {
                const title = post.querySelector('h2').textContent.toLowerCase();
                const excerpt = post.querySelector('.post-list-excerpt').textContent.toLowerCase();

                if (title.includes(query) || excerpt.includes(query)) {
                    post.classList.remove('hidden');
                } else {
                    post.classList.add('hidden');
                }
            });
        }, 300); // Debounce search by 300ms
    });
}

// Scroll to top button - Optimized to prevent forced reflows
function setupScrollToTop() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (!scrollButton) return;

    let isVisible = false;
    let ticking = false;

    function updateScrollButton() {
        const shouldBeVisible = window.pageYOffset > 300;
        if (shouldBeVisible !== isVisible) {
            isVisible = shouldBeVisible;
            scrollButton.classList.toggle('hidden', !isVisible);
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollButton);
            ticking = true;
        }
    }, { passive: true });

    scrollButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function skipToMain() {
    // Accessibility: Skip to main content
    document.addEventListener('DOMContentLoaded', function () {
        const skipLink = document.querySelector('.skip-to-main');
        if (skipLink) {
            skipLink.addEventListener('click', function (e) {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.focus();
                    main.scrollIntoView();
                }
            });
        }
    });
}

// Table of Contents Collapsible
function setupTableOfContents() {
    const tocHeading = document.getElementById('table-of-contents');

    if (tocHeading) {
        tocHeading.addEventListener('click', function (e) {
            e.preventDefault();
            tocHeading.classList.toggle('expanded');
        });
    }
}

// Initialize all functions
document.addEventListener('DOMContentLoaded', function () {
    calculateReadingTime();
    setupCodeBlocks();
    setupNewsletterForm();
    setupSearch();
    setupScrollToTop();
    smoothScroll();
    skipToMain();
    setupTableOfContents();
});
