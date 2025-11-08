// Tab switching logic extracted from inline script to satisfy MV3 CSP
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    // Main tab switching
    const buttons = document.querySelectorAll('.tabs button');
    const tabs = {};
    document.querySelectorAll('.tab').forEach(t => { tabs[t.id.replace('tab-','')] = t; });
    buttons.forEach(b => b.addEventListener('click', () => {
      buttons.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      Object.values(tabs).forEach(t => t.classList.remove('active'));
      const target = tabs[b.dataset.tab];
      if (target) target.classList.add('active');
    }));

    // Help section navigation
    const helpNavItems = document.querySelectorAll('.help-nav-item');
    const helpSections = document.querySelectorAll('.help-section');

    helpNavItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove active class from all nav items
        helpNavItems.forEach(navItem => navItem.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');

        // Hide all help sections
        helpSections.forEach(section => section.classList.remove('active'));
        // Show the corresponding section
        const targetId = 'help-' + item.dataset.help;
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add('active');
        }
      });
    });
  });
})();

