import './style.css';

const starsContainer = document.getElementById('stars-container');

function createStars() {
  const count = 200;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // Random size
    const size = Math.random() * 2 + 1;
    
    // Random animation duration
    const duration = Math.random() * 3 + 2;
    
    // Random delay
    const delay = Math.random() * 5;
    
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty('--duration', `${duration}s`);
    star.style.setProperty('--opacity', Math.random());
    star.style.animationDelay = `${delay}s`;
    
    starsContainer.appendChild(star);
  }
}

createStars();

// Simple smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
