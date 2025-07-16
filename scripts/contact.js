document.addEventListener('DOMContentLoaded', function() {
    function attachListener() {
        const form = document.getElementById('contact-form');
        if (form) {
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

    if (!attachListener()) {
        const observer = new MutationObserver(() => {
            if (attachListener()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});