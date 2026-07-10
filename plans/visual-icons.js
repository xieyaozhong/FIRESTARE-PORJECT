(() => {
  const detailIcon = document.querySelector('#detailIcon');
  const buttons = document.querySelector('#planButtons');
  if (!detailIcon || !buttons) return;

  const syncDetailIcon = plan => {
    if (!plan) return;
    detailIcon.dataset.plan = plan;
    detailIcon.textContent = '';
  };

  buttons.addEventListener('click', event => {
    const button = event.target.closest('.plan');
    if (button) requestAnimationFrame(() => syncDetailIcon(button.dataset.plan));
  });

  new MutationObserver(() => {
    if (detailIcon.textContent) detailIcon.textContent = '';
  }).observe(detailIcon, { childList: true, characterData: true, subtree: true });

  const initialPlan = location.hash.slice(1);
  if (initialPlan) setTimeout(() => syncDetailIcon(initialPlan), 180);
})();
