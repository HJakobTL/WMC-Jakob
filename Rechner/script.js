let current = '0';
let previous = '';
let op = undefined;

// Initialisierung: Einmal mischen beim Start
window.onload = shuffleNumbers;

function shuffleNumbers() {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // Fisher-Yates Shuffle Algorithmus
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    // Alle Zahlen-Buttons finden und neu beschriften
    const buttons = document.querySelectorAll('.num-btn');
    buttons.forEach((btn, index) => {
        btn.innerText = numbers[index];
        // Wir speichern den Wert im Button, damit wir wissen, was er gerade ist
        btn.setAttribute('data-val', numbers[index]);
    });
}

// Wrapper-Funktion für den Klick
function handleInput(buttonElement) {
    const value = buttonElement.getAttribute('data-val');
    appendNumber(value);
    // NACH der Eingabe alles neu mischen!
    shuffleNumbers();
}

function appendNumber(num) {
    if (current === '0') current = num;
    else current += num;
    updateDisplay();
}

function chooseOperation(symbol) {
    if (current === '') return;
    if (previous !== '') compute();
    op = symbol;
    previous = current;
    current = '';
    updateDisplay();
    shuffleNumbers(); // Auch nach Operationen mischen
}

function compute() {
    let res;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    if (isNaN(a) || isNaN(b)) return;
    
    switch (op) {
        case '+': res = a + b; break;
        case '-': res = a - b; break;
        case '*': res = a * b; break;
        case '÷': res = a / b; break;
        default: return;
    }
    current = res.toString();
    op = undefined;
    previous = '';
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('current-operand').innerText = current;
    document.getElementById('previous-operand').innerText = previous + (op || '');
}

function clearDisplay() {
    current = '0';
    previous = '';
    op = undefined;
    updateDisplay();
    shuffleNumbers();
}

function deleteNumber() {
    current = current.toString().slice(0, -1);
    if (current === '') current = '0';
    updateDisplay();
    shuffleNumbers();
}