const counter = document.getElementById('counter');
const minus = document.getElementById('btn-minus');
const plus = document.getElementById('btn-plus');
const reset = document.getElementById('btn-reset');

let count = 0;

plus.addEventListener('click', () => {
    count++;
    updateDisplay();
});

minus.addEventListener('click', () => {
    count--;
    updateDisplay();
});

reset.addEventListener('click', () => {
    count = 0;
    updateDisplay();
});

function updateDisplay() {
    counter.textContent = count;
}

const mainTitle = document.getElementById('main-title');
const btnColor = document.getElementById('btn-color');

btnColor.addEventListener('click', () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);    
    const randomRGB = `rgb(${r}, ${g}, ${b})`;
    
    mainTitle.style.color = randomRGB;
});
