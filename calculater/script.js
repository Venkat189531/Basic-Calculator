document.addEventListener('DOMContentLoaded', () => {
    const previousOperandTextElement = document.getElementById('previous-operand');
    const currentOperandTextElement = document.getElementById('current-operand');
    const numberButtons = document.querySelectorAll('[data-number]');
    const operationButtons = document.querySelectorAll('[data-operation]');
    const equalsButton = document.getElementById('equals');
    const deleteButton = document.getElementById('delete');
    const allClearButton = document.getElementById('clear');
    let currentInput = '0';
    let expressionHistory = '';
    let shouldResetScreen = false;
    let hasError = false;
    function clear() {
        currentInput = '0';
        expressionHistory = '';
        shouldResetScreen = false;
        hasError = false;
        updateDisplay();
    }

    function deleteNumber() {
        if (hasError || shouldResetScreen) {
            clear();
            return;
        }
        if (currentInput.length === 1) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
        }
        updateDisplay();
    }

    function appendNumber(number) {
        if (hasError) clear();
        if (shouldResetScreen) {
            currentInput = '';
            shouldResetScreen = false;
        }
        if (number === '.' && currentInput.includes('.')) return;
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            currentInput += number;
        }
        updateDisplay();
    }

    function chooseOperation(operator) {
        if (hasError) return;
        if (shouldResetScreen) {
            // If we just finished a calculation, use the result as the start of the new expression
            expressionHistory = currentInput + ' ' + operator + ' ';
            shouldResetScreen = false;
        } else {
            // If we are typing a number, add it to history
            expressionHistory += currentInput + ' ' + operator + ' ';
        }
        currentInput = '0';
        shouldResetScreen = true; // Wait for next number
        updateDisplay();
    }

    function compute() {
        if (hasError) return;

        let fullExpression = expressionHistory;
        if (!shouldResetScreen || currentInput !== '0') {
            fullExpression += currentInput;
        } else {
            fullExpression = fullExpression.trim();
            const lastChar = fullExpression.slice(-1);
            if ('+ - * / %'.includes(lastChar)) {
                fullExpression = fullExpression.slice(0, -1);
            }
        }

        try {
            if (/\/ 0(?!\.)/.test(fullExpression) || /\/ 0$/.test(fullExpression)) {
                throw new Error("Division by Zero");
            }
            if (/[^0-9.+\-*/% ]/.test(fullExpression)) {
                throw new Error("Invalid Input");
            }

            const result = Function('"use strict";return (' + fullExpression + ')')();

            if (!isFinite(result) || isNaN(result)) {
                throw new Error("Error");
            }

            currentInput = result.toString();
            expressionHistory = '';
            shouldResetScreen = true;

        } catch (e) {
            currentInput = 'Error';
            hasError = true;
        }
        updateDisplay();
    }

    function getDisplayNumber(number) {
        if (number === 'Error' || hasError) return 'Error';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    function updateDisplay() {
        if (hasError) {
            currentOperandTextElement.innerText = 'Error';
            previousOperandTextElement.innerText = '';
            return;
        }

        currentOperandTextElement.innerText = getDisplayNumber(currentInput);
        previousOperandTextElement.innerText = expressionHistory;
    }

    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            appendNumber(button.innerText);
        });
    });

    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            chooseOperation(button.dataset.operation);
        });
    });

    equalsButton.addEventListener('click', button => {
        compute();
    });

    allClearButton.addEventListener('click', button => {
        clear();
    });

    deleteButton.addEventListener('click', button => {
        deleteNumber();
    });

    // Keyboard Support
    window.addEventListener('keydown', (e) => {
        if (e.key >= 0 && e.key <= 9 || e.key === '.') {
            appendNumber(e.key);
        }
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault();
            compute();
        }
        if (e.key === 'Backspace') {
            deleteNumber();
        }
        if (e.key === 'Escape') {
            clear();
        }
        if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            chooseOperation(e.key);
        }
        if (e.key === '%') {
            chooseOperation('%');
        }
    });

    // Initialize
    clear();
});

