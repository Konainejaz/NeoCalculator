// State
let currentExpression = '';
let result = '';
let isDegree = true; // Default to Degrees for standard users
let history = [];
let isSecond = false; // Track 2nd button state

// DOM Elements
const currentDisplay = document.getElementById('current-operand');
const previousDisplay = document.getElementById('previous-operand');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const historyToggle = document.getElementById('history-toggle');
const closeHistoryBtn = document.getElementById('close-history');
const historyPanel = document.getElementById('history-panel');
const clearHistoryBtn = document.getElementById('clear-history');
const degRadBtn = document.getElementById('deg-rad');
const btn2nd = document.getElementById('btn-2nd');

// Sci & Tools Elements
const sciToggle = document.getElementById('sci-toggle');
const scientificKeys = document.getElementById('scientific-keys');
const toolsPanel = document.getElementById('tools-panel');
const closeToolsBtn = document.getElementById('close-tools');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadHistory();
    updateDisplay();
});

// Theme Handling
themeToggle.addEventListener('click', () => {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// Sci Mode Toggle
sciToggle.addEventListener('click', () => {
    scientificKeys.classList.toggle('show');
    sciToggle.classList.toggle('active');
});

// Tools Panel Handling
closeToolsBtn.addEventListener('click', () => {
    toolsPanel.classList.remove('open');
});

// History Handling
historyToggle.addEventListener('click', () => {
    historyPanel.classList.add('open');
});

closeHistoryBtn.addEventListener('click', () => {
    historyPanel.classList.remove('open');
});

// Close history when clicking outside (optional, but good UX)
document.addEventListener('click', (e) => {
    if (!historyPanel.contains(e.target) && !historyToggle.contains(e.target) && historyPanel.classList.contains('open')) {
        historyPanel.classList.remove('open');
    }
});

clearHistoryBtn.addEventListener('click', () => {
    history = [];
    saveHistory();
    renderHistory();
});

function addToHistory(expression, result, rawValue = null) {
    history.unshift({ 
        expression, 
        result, 
        rawValue: rawValue !== null ? rawValue : result 
    });
    if (history.length > 50) history.pop();
    saveHistory();
    renderHistory();
}

function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

function loadHistory() {
    const saved = localStorage.getItem('calcHistory');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
    }
}

function renderHistory() {
    historyList.innerHTML = history.map(item => {
        const valToLoad = item.rawValue !== undefined ? item.rawValue : item.result;
        // Escape quotes for the onclick handler
        const safeVal = String(valToLoad).replace(/'/g, "\\'");
        return `
        <div class="history-item" onclick="loadFromHistory('${safeVal}')">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        </div>
    `}).join('');
}

window.loadFromHistory = (val) => {
    currentExpression += val;
    updateDisplay();
    historyPanel.classList.remove('open');
};

// Tools Logic
function showResult(elementId, content) {
    const el = document.getElementById(elementId);
    el.innerHTML = content;
    el.classList.remove('show');
    // Trigger reflow
    void el.offsetWidth;
    el.classList.add('show');
}

window.solveCircle = () => {
    const r = parseFloat(document.getElementById('circle-r').value);
    if (isNaN(r)) return;
    const area = Math.PI * r * r;
    const circum = 2 * Math.PI * r;
    const resText = `Area: ${area.toFixed(4)}<br>Circum: ${circum.toFixed(4)}`;
    showResult('circle-result', resText);
    addToHistory(`Circle (r=${r})`, resText, area.toFixed(4));
};

window.solvePythagoras = () => {
    const a = parseFloat(document.getElementById('pyth-a').value);
    const b = parseFloat(document.getElementById('pyth-b').value);
    if (isNaN(a) || isNaN(b)) return;
    const c = Math.sqrt(a*a + b*b);
    showResult('pyth-result', `Hypotenuse (c): ${c.toFixed(4)}`);
    addToHistory(`Pyth (a=${a}, b=${b})`, `c = ${c.toFixed(4)}`, c.toFixed(4));
};

window.solveAlgebra = () => {
    const a = parseFloat(document.getElementById('alg-a').value);
    const b = parseFloat(document.getElementById('alg-b').value);
    const c = parseFloat(document.getElementById('alg-c').value);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return;
    if (a === 0) {
        showResult('alg-result', "Not a linear equation (a=0)");
        return;
    }
    const x = (c - b) / a;
    showResult('alg-result', `x = ${x.toFixed(4)}`);
    addToHistory(`${a}x + ${b} = ${c}`, `x = ${x.toFixed(4)}`, x.toFixed(4));
};

// Deg/Rad Toggle
degRadBtn.addEventListener('click', () => {
    isDegree = !isDegree;
    degRadBtn.textContent = isDegree ? 'DEG' : 'RAD';
});

// 2nd Button Toggle
btn2nd.addEventListener('click', () => {
    isSecond = !isSecond;
    btn2nd.classList.toggle('active');
    updateScientificKeys();
});

function updateScientificKeys() {
    document.querySelectorAll('.btn[data-alt]').forEach(btn => {
        const original = btn.dataset.action;
        const alt = btn.dataset.alt;
        
        if (isSecond) {
            // Update visual text
            if (original === 'sin') btn.textContent = 'sin⁻¹';
            if (original === 'cos') btn.textContent = 'cos⁻¹';
            if (original === 'tan') btn.textContent = 'tan⁻¹';
            if (original === 'log') btn.textContent = '10^x';
            if (original === 'ln') btn.textContent = 'e^x';
            if (original === 'sqrt') btn.textContent = 'x²';
        } else {
            // Restore visual text
            if (original === 'sin') btn.textContent = 'sin';
            if (original === 'cos') btn.textContent = 'cos';
            if (original === 'tan') btn.textContent = 'tan';
            if (original === 'log') btn.textContent = 'log';
            if (original === 'ln') btn.textContent = 'ln';
            if (original === 'sqrt') btn.textContent = '√';
        }
    });
}

// Button Click Handling
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const value = btn.dataset.value;

        if (value !== undefined) {
            handleNumber(value);
        } else if (action) {
            // Check if 2nd is active and if this button has an alternate action
            const alt = btn.dataset.alt;
            if (isSecond && alt) {
                handleAction(alt);
            } else {
                handleAction(action);
            }
        }
        
        // Add vibration for mobile feel
        if (navigator.vibrate) navigator.vibrate(5);
    });
});

function handleNumber(num) {
    // Prevent multiple decimals in the same number segment
    if (num === '.') {
        const lastNumber = currentExpression.split(/[\+\-\*\/%^()]/).pop();
        if (lastNumber.includes('.')) return;
    }
    currentExpression += num;
    updateDisplay();
}

function handleAction(action) {
    switch (action) {
        case 'tools':
            toolsPanel.classList.add('open');
            break;
        case 'clear':
            currentExpression = '';
            result = '';
            previousDisplay.textContent = '';
            break;
        case 'delete':
            currentExpression = currentExpression.toString().slice(0, -1);
            break;
        case 'calculate':
            calculate();
            break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'log':
        case 'ln': // log natural
        case 'sqrt':
        case 'asin':
        case 'acos':
        case 'atan':
        case 'abs':
            currentExpression += action + '(';
            break;
        case 'factorial':
            currentExpression += '!';
            break;
        case 'inv':
            currentExpression += '1/';
            break;
        case 'sqr':
            currentExpression += '^2';
            break;
        case 'pow10':
            currentExpression += '10^';
            break;
        case 'exp':
            currentExpression += 'e^';
            break;
        case 'pow':
            currentExpression += '^';
            break;
        case 'pi':
            currentExpression += 'pi';
            break;
        case 'e':
            currentExpression += 'e';
            break;
        default:
            // Operators: +, -, *, /, %, (, )
            // Avoid double operators
            const lastChar = currentExpression.slice(-1);
            if (['+', '-', '*', '/', '%', '^'].includes(action)) {
                if (['+', '-', '*', '/', '%', '^'].includes(lastChar)) {
                    currentExpression = currentExpression.slice(0, -1) + action;
                } else {
                    currentExpression += action;
                }
            } else {
                currentExpression += action;
            }
    }
    updateDisplay();
}

function calculate() {
    if (!currentExpression) return;

    let evalExpression = currentExpression;

    // Handle Degree/Radian conversion for trig functions
    // We replace sin(x) with sin(x deg) if in degree mode
    // Regex to find trig functions and append ' deg' to the argument if it's just a number
    // This is complex with nested brackets, so a simpler approach is:
    // math.js supports 'sin(45 deg)'. 
    // We can try to inject ' deg' or configure math.js context.
    
    // Better approach: Create a custom scope or transform the string.
    // For simplicity and robustness, let's use math.js unit system if possible, 
    // OR just multiply arguments by pi/180 if in DEG mode. 
    // BUT parsing the argument is hard.
    
    // Simplest working solution for "Modern Calculator":
    // If DEG mode is on, replace 'sin(', 'cos(', 'tan(' with 'sin(deg * ' etc. 
    // math.js has `sin(90 deg)` support.
    
    if (isDegree) {
        // This regex looks for sin/cos/tan followed by a number or expression
        // It's safer to let math.js handle units if the user types them, 
        // but users won't type 'deg'.
        // Let's use a replacer that wraps the content in a unit conversion if simple.
        // Actually, let's just use math.evaluate with a scope that overrides trig functions?
        // No, overriding functions is recursive.
        
        // Let's use the replacement strategy: 
        // "sin(90)" -> "sin(90 deg)"
        // This is tricky if it's "sin(45 + 5)".
        
        // Alternative: define `sin` in scope to convert args.
        const trigScope = {
            sin: x => math.sin(math.unit(x, 'deg')),
            cos: x => math.cos(math.unit(x, 'deg')),
            tan: x => math.tan(math.unit(x, 'deg'))
        };
        
        // Only use trigScope if isDegree is true.
        // BUT `math.evaluate` with scope doesn't override built-ins easily in all versions.
        // Let's try to pass it as scope.
        
        try {
             // Replace standard functions with degree-aware versions in the string
             // This is hacky. 
             // Correct way: use math.evaluate(expr, scope) where scope has the functions.
        } catch (e) {}
    }

    try {
        let finalExpression = evalExpression;
        
        // Handle visual operators
        // The user sees 'log(', math.js needs 'log10(' for base 10 usually? 
        // math.js: log(x) is natural log (base e), log(x, base) is arbitrary. 
        // User expects log to be base 10? usually. ln is base e.
        // Let's map 'ln' to 'log' (base e) and 'log' to 'log10'.
        
        finalExpression = finalExpression.replace(/\bln\(/g, 'log('); 
        finalExpression = finalExpression.replace(/\blog\(/g, 'log10(');
        
        // Handle percent: 50% -> 0.5, 100+50% -> 150? Standard calculators: 100+50% = 150. 
        // math.js: 50% is 0.5. 100+50% is 100.5. 
        // We'll stick to math.js default (percentage as fraction) for now as it's less ambiguous mathematically.
        
        let resultValue;
        
        if (isDegree) {
             // Create a scope with overridden trig functions
             // Note: math.sin takes radians. 
             const scope = {
                 sin: (x) => math.sin(math.unit(x, 'deg')),
                 cos: (x) => math.cos(math.unit(x, 'deg')),
                 tan: (x) => math.tan(math.unit(x, 'deg')),
             };
             resultValue = math.evaluate(finalExpression, scope);
        } else {
             resultValue = math.evaluate(finalExpression);
        }

        // Format result
        // Precision handling
        const formattedResult = math.format(resultValue, { precision: 14 });
        
        previousDisplay.textContent = currentExpression + ' =';
        result = formattedResult;
        currentExpression = formattedResult.toString();
        
        addToHistory(previousDisplay.textContent.slice(0, -2), result);
        
        // Update display
        const currentDisplayElem = document.getElementById('current-operand');
        currentDisplayElem.textContent = currentExpression;
        
        // Animate result
        currentDisplayElem.style.transform = 'scale(1.1)';
        setTimeout(() => currentDisplayElem.style.transform = 'scale(1)', 150);
        
    } catch (error) {
        currentDisplay.textContent = "Error";
        setTimeout(() => {
            currentDisplay.textContent = currentExpression;
        }, 1500);
    }
}

function updateDisplay() {
    const display = document.getElementById('current-operand');
    display.textContent = currentExpression || '0';
    
    // Auto-scroll to end
    display.scrollLeft = display.scrollWidth;
    
    // Dynamic font size for long numbers
    if (display.textContent.length > 12) {
        display.classList.add('long');
    } else {
        display.classList.remove('long');
    }
}
