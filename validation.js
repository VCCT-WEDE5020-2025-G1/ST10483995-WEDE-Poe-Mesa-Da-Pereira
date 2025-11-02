// Lightweight client-side form validation for any form with class="validate-form"
(function () {
    'use strict';

    function createErrorEl(msg, id) {
        const d = document.createElement('div');
        d.className = 'error-message';
        if (id) d.id = id;
        d.textContent = msg;
        return d;
    }

    function removeError(input) {
        input.classList.remove('input-error');
        input.setAttribute('aria-invalid', 'false');
        const described = input.getAttribute('aria-describedby');
        if (described) {
            const el = document.getElementById(described);
            if (el && el.classList.contains('error-message')) el.remove();
            input.removeAttribute('aria-describedby');
        }
    }

    function showError(input, msg) {
        removeError(input);
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
        const id = input.name ? ('err-' + input.name) : ('err-' + Math.random().toString(36).slice(2,8));
        const err = createErrorEl(msg, id);
        input.setAttribute('aria-describedby', id);
        // insert after input
        if (input.nextSibling) input.parentNode.insertBefore(err, input.nextSibling);
        else input.parentNode.appendChild(err);
    }

    function isEmail(val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    function isPhone(val) {
        // Accept digits, spaces, +, -, parentheses; enforce at least 7 digits
        const digits = (val.match(/\d/g) || []).length;
        return digits >= 7;
    }

    function validateField(input) {
        const val = (input.value || '').trim();
        if (input.hasAttribute('required') && !val) {
            showError(input, 'This field is required.');
            return false;
        }
        const type = input.getAttribute('type');
        if (type === 'email' && val && !isEmail(val)) {
            showError(input, 'Please enter a valid email address.');
            return false;
        }
        if ((input.name && /phone|tel/i.test(input.name) || type === 'tel') && val && !isPhone(val)) {
            showError(input, 'Please enter a valid phone number.');
            return false;
        }
        if (input.hasAttribute('pattern') && val) {
            const pattern = new RegExp(input.getAttribute('pattern'));
            if (!pattern.test(val)) {
                showError(input, 'Value does not match expected format.');
                return false;
            }
        }
        // custom minlength/maxlength checks
        const min = input.getAttribute('minlength');
        if (min && val.length < parseInt(min, 10)) {
            showError(input, `Please enter at least ${min} characters.`);
            return false;
        }
        const max = input.getAttribute('maxlength');
        if (max && val.length > parseInt(max, 10)) {
            showError(input, `Please enter no more than ${max} characters.`);
            return false;
        }
        removeError(input);
        return true;
    }

    document.addEventListener('DOMContentLoaded', function () {
        const forms = document.querySelectorAll('form.validate-form');
        forms.forEach(form => {
            // live validation clearance
            form.querySelectorAll('input, textarea, select').forEach(input => {
                input.addEventListener('input', () => { removeError(input); });
                input.addEventListener('blur', () => { validateField(input); });
            });

            form.addEventListener('submit', (e) => {
                const fields = Array.from(form.querySelectorAll('input, textarea, select'));
                let ok = true;
                for (const f of fields) {
                    const valid = validateField(f);
                    if (!valid && ok) {
                        ok = false;
                        // focus first invalid
                        f.focus();
                    }
                }
                if (!ok) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        });
    });
})();