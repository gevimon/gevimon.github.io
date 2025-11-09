
document.addEventListener('DOMContentLoaded', function() {
    // Mobile contact modal functionality
    function initMobileContactModal() {
        const triggerBtn = document.getElementById('mobile-contact-trigger');
        const closeBtn = document.getElementById('contact-modal-close');
        const modalOverlay = document.getElementById('contact-modal-overlay');
        const modalContent = document.querySelector('.contact-modal-content');
        const contactForm = document.getElementById('contact-form');
        const section = document.getElementById('contact');

        if (!triggerBtn || !closeBtn || !modalOverlay || !contactForm) {
            return false;
        }

        function openModal() {
            const isMobile = window.matchMedia('(max-width: 767.98px)').matches;
            if (!isMobile) return;

            // Move form into modal
            modalContent.appendChild(contactForm);
            
            // Show modal
            modalOverlay.classList.add('is-open');
            modalOverlay.setAttribute('aria-hidden', 'false');
            
            // Lock body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = contactForm.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }

        function closeModal() {
            const isMobile = window.matchMedia('(max-width: 767.98px)').matches;
            if (!isMobile) return;

            // Move form back to original location
            const hero = document.querySelector('#contact .hero');
            if (hero) {
                hero.appendChild(contactForm);
            }
            
            // Hide modal
            modalOverlay.classList.remove('is-open');
            modalOverlay.setAttribute('aria-hidden', 'true');
            
            // Unlock body scroll
            document.body.style.overflow = '';
            
            // Return focus to trigger button
            triggerBtn.focus();
        }

        // Event listeners
        triggerBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        
        // Close on backdrop click
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
                closeModal();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            const isMobile = window.matchMedia('(max-width: 767.98px)').matches;
            if (!isMobile && modalOverlay.classList.contains('is-open')) {
                closeModal();
            }
        });

        return true;
    }

    // dynamically generate interest checkboxes
    const interestOptions = [
        'Option First',
        'Option Second',
        'Option Third',
        'Option #4',
        'Option #6'
    ];

    function attachListener() {
        const form = document.getElementById('contact-form');
        const container = document.querySelector('.checkbox-group');
        if (form && container) {
            // generate interest checkboxes
            container.innerHTML = '';
            interestOptions.forEach(option => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = 'interest';
                input.value = option;
                label.appendChild(input);
                label.append(` ${option}`);
                container.appendChild(label);
            });
            const messageDiv = document.getElementById('form-message');

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const nameCompany = document.getElementById('name-company').value.trim();
                const email       = document.getElementById('email').value.trim();
                const phone       = document.getElementById('phone').value.trim();
                const message     = document.getElementById('message').value.trim();
                const interests   = Array.from(
                    document.querySelectorAll('input[name="interest"]:checked')
                ).map(cb => cb.value);

                const messagelines = [
                    `Name/Company: ${nameCompany}`,
                    `Email: ${email}`,
                    `Phone: ${phone}`,
                    `Interested in: ${interests.join(', ')}`
                ];
                if (message) {
                    messagelines.push(`Message: ${message}`);
                }
                const combinedBody = messagelines.join('\n');

                const formData = new FormData();
                formData.append('subject', `Contact form from ${nameCompany}`);
                formData.append('body', combinedBody);

                try {
                    const res = await fetch('https://factoryfunctions.azurewebsites.net/api/SendEmailFunction?code=Bf-jCZu3gse08jleLLz2jgI7Lm1yrY1_z0hhZ_5pPMKLAzFueG16VQ==', {
                        method: 'POST',
                        body: formData
                    });
                    const text = await res.text();
                    if (!res.ok) throw text;
                    if (messageDiv) {
                        messageDiv.textContent = text;
                        messageDiv.style.color = 'green';
                    }
                    // disable the button to prevent resubmission
                    const submitButton = document.getElementById('submit-button');
                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                } catch (err) {
                    console.error(err);
                    if (messageDiv) {
                        messageDiv.textContent = '❌ ' + err;
                        messageDiv.style.color = 'red';
                    }
                }
            });
            return true;
        }
        return false;
    }

    // Initialize modal first
    if (!initMobileContactModal()) {
        const modalObserver = new MutationObserver(() => {
            if (initMobileContactModal()) modalObserver.disconnect();
        });
        modalObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Initialize form listener
    if (!attachListener()) {
        const observer = new MutationObserver(() => {
            if (attachListener()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});