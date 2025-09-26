document.addEventListener('DOMContentLoaded', () => {
  const ctaButton = document.querySelector('.hero-content .cta-button');

  if (ctaButton) {
    ctaButton.addEventListener('click', (event) => {
      // Prevent the default link behavior
      event.preventDefault();

      // Example of adding interactivity: a simple alert
      alert('You clicked the "Learn More" button! Redirecting to about page.');

      // In a real application, you might do something more complex here
      // For instance, you could fade in a modal or an FAQ section.
      setTimeout(() => {
        window.location.href = event.target.href;
      }, 1000); 
    });
  }
});