/*
What this file is:
Minimal illustrative Button component showing how a package might consume CSS variables from tokens.

Who should edit it:
Component Owner (Button). Update when Button API or styles change.

When to update (example):
Add variants, accessibility props, or change className logic.

Approvals:
Component Owner & Eng Lead.
*/

function Button({ children, onClick, className = '', style = {} }) {
  const btn = document.createElement('button');
  btn.textContent = children || 'Button';
  btn.className = `ds-button ${className}`;
  btn.addEventListener('click', onClick || (() => {}));
  // Example inline style using CSS custom property
  btn.style.padding = 'var(--spacing-2, 8px)';
  return btn;
}

module.exports = Button;
