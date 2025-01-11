import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { init, createDatabase, saveDatabase, loadDatabase } from './vault.js';

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello kxdb!</h1>
    <div class="card">
      <ul id="status"></ul>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

const statusUpdate = (message) => {
  const status = document.getElementById('status');
  const li = document.createElement('li');
  li.textContent = message;
  status.appendChild(li);
}

const password = 'password';
await init();
let db = await createDatabase(password);
console.log(db);
statusUpdate('Database created');
let arrayBuffer = await saveDatabase(db);
console.log(arrayBuffer);
statusUpdate('Database saved');
let loadedDb = await loadDatabase(arrayBuffer, 'test');
console.log(loadedDb);
statusUpdate('Database loaded');
