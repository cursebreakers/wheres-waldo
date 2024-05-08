// Client-side scripts

import { saveHighScore } from "./usermod.js";

function popMenu(type, x, y) {

    if (document.querySelector(`#${type}-dropdown`)) {
        return; 
    }

    const dropDown = document.createElement('div');
    dropDown.className = 'dropdown-menu';
    dropDown.id = `${type}-dropdown`;
    dropDown.innerHTML = `
      <select id="${type}-select">
        <option value="guess" disabled selected>Name:</option>
        <option value="water">Vaporeon</option>
        <option value="electric">Jolteon</option>
        <option value="normal">Eevee</option>
        <option value="fire">Flareon</option>
      </select>
    `;

    dropDown.style.position = 'absolute';
    dropDown.style.top = '8%';
    dropDown.style.right = '4%';

    const hitbox = document.querySelector(`.hitbox[data-type="${type}"]`);
    hitbox.classList.add('active');

    hitbox.parentNode.insertBefore(dropDown, hitbox.nextSibling);

    document.addEventListener('click', closeDropdownMenu);

    const dropdownSelect = document.getElementById(`${type}-select`);
    dropdownSelect.addEventListener('change', function(event) {
        const selectedOption = dropdownSelect.options[dropdownSelect.selectedIndex];
        const selectedName = selectedOption.text;
        const selectedType = selectedOption.value;
        const hitboxType = type;
        // Send the selected values as answer to be checked
        checkAnswer(hitbox, hitboxType, selectedName, selectedType)
    });
    
}

function closeDropdownMenu(event) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target) && !event.target.classList.contains('hitbox')) {
            dropdown.remove();
            const activeHitbox = document.querySelector('.hitbox.active');
            if (activeHitbox) {
                activeHitbox.classList.remove('active');
            }
        }
    });
}
  
function hitboxMenu(event) {
    event.preventDefault();
  
    const type = event.target.dataset.type;
    const hitboxRect = event.target.getBoundingClientRect();
  
    console.log('Hit on box:', type);

    const existingDropdown = document.querySelector('.dropdown-menu');
    if (existingDropdown) {
        existingDropdown.remove();
        const activeHitbox = document.querySelector('.hitbox.active');
        if (activeHitbox) {
            activeHitbox.classList.remove('active');
            activeHitbox.classList.remove('bad');
        }
    }

    popMenu(type, hitboxRect.left, hitboxRect.bottom);
}
  
document.querySelectorAll('.hitbox').forEach(hitbox => {
    hitbox.addEventListener('click', hitboxMenu);
});

async function checkAnswer(hitbox, hitboxType, selectedName) {
    console.log('checking:', hitboxType, selectedName);

    const CHECK_API = '/check'

    const response = await fetch(CHECK_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            hitboxType,
            selectedName,
        }),
    });

    const data = await response.json();
    console.log('Response:', data);

    const totalElement = document.getElementById('total'); 

    if (data.message === 'Incorrect guess') {
        // Change hitbox class to 'bad' for incorrect guess
        hitbox.classList.add('bad');
    } else {
        // Change hitbox class to 'good' for correct guess
        hitbox.classList.add('good');
        matches++;
        totalElement.textContent = `Score: ${matches}`;
        console.log('Checking answer:', hitboxType, matches)

        if (matches === 4 && document.querySelectorAll('.hitbox.good').length === 4) {
            clearInterval(stopwatchInterval);
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000); 
            console.log('Elapsed time:', elapsedTime, 'sec');     
          
            // Save elapsedTime to MongoDB or perform other actions as needed
            endGame(elapsedTime)
        }
    }
}

async function endGame(elapsedTime) {
    console.log('Game Over!')

    const gameBoard = document.getElementById('gameBoard')
    gameBoard.innerHTML = `
        <div class="winBox">
        <h2>You did it!</h2>
        <img class="victory-gif" src="./images/JTIA.gif">
        <h3>Time: ${elapsedTime} seconds<h3>
        <form class="score-form" id="usernameForm">
            <label for="username">Save your score:</label>
            <input type="text" id="username" name="username" required>
            <button type="submit">Save Score</button>
        </form>
        </div>
    `;

    const usernameForm = document.getElementById('usernameForm');
    usernameForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        
        await saveHighScore(username, elapsedTime);

        // handle end game behavior further
        renderEnd()
    });
}

async function renderEnd() {
    console.log('Showing roster and reset button...')

    const gameBoard = document.getElementById('gameBoard')
    gameBoard.innerHTML = `<p>Score recorded!</p>`;

    const rosterDiv = document.getElementById('roster')
    const resetButton = document.createElement('button')
    resetButton.innerText = 'Play Again'
    resetButton.addEventListener('click', () => {
        location.reload(); 
    });

    await getRoster();
        
    rosterDiv.appendChild(resetButton)

}

async function getRoster() {
    const SCORE_API = '/roster';
    const response = await fetch(SCORE_API)
    const data = await response.json();

    const rosterDiv = document.getElementById('roster')
    rosterDiv.innerHTML = `
        <h2>High Scores:</h2>
        <ol id="scoreList"></ol>
    `;

    if (Array.isArray(data.score)) {

        const sortedRoster = data.score.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));

        const scoreList = document.getElementById('scoreList');
        data.score.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.username}: ${player.score}s`;
            scoreList.appendChild(li);
        });
    } else {
        console.error('Score data is not an array:', data.score);
    }
}


// On page load:

getRoster()

let matches = 0;

console.log('Start!')

const startTime = Date.now();

const timerElement = document.getElementById('timer');
const totalElement = document.getElementById('total'); 

const stopwatchInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = `Time: ${elapsedTime}s`;
}, 1000);

totalElement.textContent = `Score: ${matches}`;
