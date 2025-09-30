// Estat de la partida (objecte global)
let estatDeLaPartida = {
  contadorPreguntes: 0, // Nombre de preguntes contestades
  respostesUsuari: [],  // Array d'objectes {respostaId, correcta}
  totalPreguntes: 0     // Total de preguntes del quiz
}

const container = document.getElementById('quiz-container')
const marcador = document.getElementById('marcador')
const timerDiv = document.getElementById('timer')
let preguntas = []
let quizFinalizado = false
let timeLeft = 30
let interval
let current = 0

// Mostra el marcador (actualment sense puntuació, només placeholder)
function renderitzarMarcador () {
  marcador.textContent = ''
}

// Mostra la pregunta actual i les opcions
function mostrarPregunta (idx) {
  container.innerHTML = ''
  if (idx >= preguntas.length || quizFinalizado) {
    mostrarResultado()
    timerDiv.textContent = ''
    return
  }
  timerDiv.textContent = `Temps restant: ${timeLeft}s`
  const pregunta = preguntas[idx]
  const preguntaDiv = document.createElement('div')
  preguntaDiv.classList.add('pregunta')
  const preguntaTitulo = document.createElement('h3')
  preguntaTitulo.textContent = pregunta.pregunta
  preguntaDiv.appendChild(preguntaTitulo)
  const respostesGrid = document.createElement('div')
  respostesGrid.classList.add('respostes-grid')
  pregunta.respostes.forEach(resposta => {
    const respostaDiv = document.createElement('div')
    respostaDiv.classList.add('resposta')
    respostaDiv.setAttribute('data-resposta', resposta.id)
    const img = document.createElement('img')
    img.src = resposta.imatge
    img.alt = resposta.etiqueta
    const label = document.createElement('span')
    label.textContent = resposta.etiqueta
    respostaDiv.appendChild(img)
    respostaDiv.appendChild(label)
    respostesGrid.appendChild(respostaDiv)
  })
  preguntaDiv.appendChild(respostesGrid)
  container.appendChild(preguntaDiv)
}

// Mostra el resultat final i l'historial de respostes
function mostrarResultado () {
  timerDiv.textContent = ''
  // Historial detallat de respostes
  const respostesContestades = estatDeLaPartida.respostesUsuari.filter(r => r !== null).length
  let historialHtml = '<ul style="list-style:none;padding:0;">'
  estatDeLaPartida.respostesUsuari.forEach((r, idx) => {
    if (r === null) return
    const pregunta = preguntas[idx]
    const resposta = pregunta.respostes.find(res => res.id === r.respostaId)
    historialHtml += `<li style="margin-bottom:6px;">Pregunta ${idx + 1}: <b>${pregunta.pregunta}</b><br>
      La teva resposta: <span style="color:${r.correcta ? 'green' : 'red'};font-weight:bold;">${resposta ? resposta.etiqueta : ''}</span> ${r.correcta ? '✔️' : '❌'}</li>`
  })
  historialHtml += '</ul>'
  container.innerHTML = `<div class='pregunta'><h2>Temps acabat!</h2>
    <p>Preguntes contestades: ${respostesContestades} de ${estatDeLaPartida.totalPreguntes}</p>
    <h3>Historial:</h3>
    ${historialHtml}
    <button id="reiniciar-btn" style="margin-top:16px;padding:8px 18px;background:#1976d2;color:#fff;border:none;border-radius:5px;cursor:pointer;">Tornar a jugar</button>
  </div>`
  document.getElementById('reiniciar-btn').onclick = function () {
    localStorage.clear()
    window.location.href = '../index.html'
  }
}

// Inicialitza el quiz amb les preguntes rebudes
function iniciarQuiz (preguntasData) {
  preguntas = preguntasData
  estatDeLaPartida.totalPreguntes = preguntas.length
  estatDeLaPartida.contadorPreguntes = 0
  estatDeLaPartida.respostesUsuari = Array(preguntas.length).fill(null)
  quizFinalizado = false
  timeLeft = 30
  current = 0
  renderitzarMarcador()
  mostrarPregunta(current)
  timerDiv.textContent = `Temps restant: ${timeLeft}s`

  // Timer principal: resta 1 segon cada cop, mostra resultat si s'acaba
  interval = setInterval(() => {
    if (quizFinalizado) {
      clearInterval(interval)
      timerDiv.textContent = ''
      return
    }
    timeLeft--
    timerDiv.textContent = `Temps restant: ${timeLeft}s`
    if (timeLeft <= 0) {
      clearInterval(interval)
      quizFinalizado = true
      mostrarResultado()
    }
  }, 1000)

  // Tallafoc per si el timer no s'atura (seguretat)
  setTimeout(() => {
    quizFinalizado = true
    clearInterval(interval)
    mostrarResultado()
  }, 30000)
}

// Carrega de preguntes asíncrona des del backend
fetch('api/get_questions.php')
  .then(response => response.json())
  .then(data => {
    // Barregem les preguntes per a cada partida
    const preguntasAleatorias = data.preguntes.sort(() => Math.random() - 0.5)
    iniciarQuiz(preguntasAleatorias)
  })

// Delegació d'esdeveniments per a respostes (event delegation)
container.addEventListener('click', function (event) {
  if (quizFinalizado) return
  const target = event.target.closest('.resposta')
  if (!target) return
  if (estatDeLaPartida.respostesUsuari[current]) return // Ja contestada
  const respostaId = parseInt(target.getAttribute('data-resposta'))
  const pregunta = preguntas[current]

  // Comprova la resposta al backend (no exposa la correcta al client)
  fetch('api/check_answer.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: pregunta.id, resposta: respostaId })
  })
    .then(response => response.json())
    .then(result => {
      const correcta = result.correcta === true
      estatDeLaPartida.respostesUsuari[current] = { respostaId, correcta }
      estatDeLaPartida.contadorPreguntes = estatDeLaPartida.respostesUsuari.filter(r => r !== null).length
      renderitzarMarcador()
      target.classList.add('resposta-seleccionada')
      setTimeout(() => {
        current++
        mostrarPregunta(current)
      }, 500)
    })
})