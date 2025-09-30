// index.js - Lògica de la pàgina d'inici del Quiz
// Segueix JavaScript Standard Style i està documentat

const main = document.getElementById('main')

// Mostra el formulari per introduir el nom d'usuari
function renderForm () {
  main.innerHTML = `<div class='form-container'>
    <h2 class="mb-3">Introdueix el teu nom per començar</h2>
    <form id='userForm'>
      <input type='text' id='nomUsuari' placeholder='Nom' required class="form-control mb-3" />
      <button type='submit' class="btn btn-primary w-100">Entrar</button>
    </form>
  </div>`
  document.getElementById('userForm').onsubmit = function (e) {
    e.preventDefault()
    const nom = document.getElementById('nomUsuari').value.trim()
    if (nom) {
      localStorage.setItem('nomUsuari', nom)
      renderSalutacio(nom)
    }
  }
}

// Mostra la salutació i accés al quiz
function renderSalutacio (nom) {
  main.innerHTML = `<div class='salut-container'>
    <h2 class="mb-3">Hola, ${nom}!</h2>
    <p>Benvingut al Quiz de Marques.</p>
    <button id='esborrarNom' class="btn btn-outline-danger w-100 mb-2">Esborrar nom</button>
    <a href='default.html' class="btn btn-success w-100">Començar Quiz</a>
  </div>`
  document.getElementById('esborrarNom').onclick = function () {
    localStorage.removeItem('nomUsuari')
    renderForm()
  }
}

// Inicialització: mostra el formulari o la salutació segons si hi ha nom guardat
const nomGuardat = localStorage.getItem('nomUsuari')
if (nomGuardat) {
  renderSalutacio(nomGuardat)
} else {
  renderForm()
}
