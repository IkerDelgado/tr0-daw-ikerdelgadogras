// admin.js - Lògica de la pàgina d'administració CRUD
// Segueix JavaScript Standard Style i està documentat

// Helpers per gestionar preguntes
function fetchPreguntes () {
  fetch('api/get_questions.php')
    .then(r => r.json())
    .then(data => renderPreguntes(data.preguntes))
}

// Renderitza totes les preguntes i respostes
function renderPreguntes (preguntes) {
  const div = document.getElementById('preguntes')
  div.innerHTML = ''
  preguntes.forEach(p => {
    const col = document.createElement('div')
    col.className = 'col-12 col-md-6 col-lg-4'
    const card = document.createElement('div')
    card.className = 'card h-100'
    card.innerHTML = `<div class="card-body">
      <h5 class="card-title">${p.pregunta}</h5>
      <div class="resposta-list">
        ${p.respostes.map(r => `
          <div class='resposta-item d-flex align-items-center mb-2'>
            <img src="${r.imatge}" width="32" height="32" alt="img">
            <span class="ms-2 fw-semibold">${r.etiqueta}</span>
            ${r.correcta == 1 ? '<span class="correcta-label">(Correcta)</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>`
    // Accions
    const actions = document.createElement('div')
    actions.className = 'actions card-footer bg-white border-0'
    actions.innerHTML = `<button class="btn btn-outline-primary btn-sm" onclick="editPregunta(${p.id})">Editar</button><button class="btn btn-outline-danger btn-sm" onclick="deletePregunta(${p.id})">Eliminar</button>`
    card.appendChild(actions)
    col.appendChild(card)
    div.appendChild(col)
  })
}

// Crear nova pregunta (obre modal)
document.getElementById('crear-pregunta-btn').onclick = function () {
  document.getElementById('error-msg').textContent = ''
  const pregunta = document.getElementById('nova-pregunta').value.trim()
  if (!pregunta) {
    document.getElementById('error-msg').textContent = 'Escriu la pregunta abans de continuar.'
    return
  }
  // Inputs de respostes al modal
  let html = ''
  for (let i = 0; i < 4; i++) {
    html += `<div class='resposta-item d-flex align-items-center mb-3'>
      <input type='text' id='modal-etiqueta-${i}' placeholder='Etiqueta' class='form-control me-2' style='max-width:120px;'>
      <input type='file' id='modal-imatge-${i}' accept='image/*' class='form-control me-2' style='max-width:160px;'>
      <label class='ms-2'><input type='radio' name='modal-correcta' value='${i}' id='modal-correcta-${i}'> Correcta</label>
    </div>`
  }
  document.getElementById('modal-respostes').innerHTML = html
  document.getElementById('modal-error').textContent = ''
  // Mostra modal
  const modal = new bootstrap.Modal(document.getElementById('modalNovaPregunta'))
  modal.show()

  document.getElementById('modal-form').onsubmit = function (e) {
    e.preventDefault()
    // Validació
    const radioSeleccionado = document.querySelector('input[name="modal-correcta"]:checked')
    if (!radioSeleccionado) {
      document.getElementById('modal-error').textContent = 'Marca una resposta com a correcta.'
      return
    }
    const correctaIndex = parseInt(radioSeleccionado.value)
    let todasCompletas = true
    for (let i = 0; i < 4; i++) {
      let etiqueta = document.getElementById('modal-etiqueta-' + i).value.trim()
      if (!etiqueta) {
        todasCompletas = false
        break
      }
    }
    if (!todasCompletas) {
      document.getElementById('modal-error').textContent = 'Completa les 4 etiquetes.'
      return
    }
    // FormData
    const formData = new FormData()
    formData.append('pregunta', pregunta)
    for (let i = 0; i < 4; i++) {
      let etiqueta = document.getElementById('modal-etiqueta-' + i).value.trim()
      let imatgeFile = document.getElementById('modal-imatge-' + i).files[0]
      let correcta = (i === correctaIndex) ? 1 : 0
      formData.append(`respostes[${i}][etiqueta]`, etiqueta)
      formData.append(`respostes[${i}][correcta]`, correcta)
      if (imatgeFile) {
        formData.append(`respostes[${i}][imatge]`, imatgeFile)
      } else {
        formData.append(`respostes[${i}][imatge]`, '')
      }
    }
    fetch('api/create_question.php', {
      method: 'POST',
      body: formData
    })
      .then(r => r.json())
      .then((data) => {
        if (!data.success) {
          document.getElementById('modal-error').textContent = data.error || 'Error desconegut.'
          return
        }
        document.getElementById('nova-pregunta').value = ''
        bootstrap.Modal.getInstance(document.getElementById('modalNovaPregunta')).hide()
        fetchPreguntes()
      })
      .catch(error => {
        document.getElementById('modal-error').textContent = 'Error de connexió: ' + error.message
      })
  }
}

// Eliminar pregunta
window.deletePregunta = function (id) {
  if (!confirm('Segur que vols eliminar aquesta pregunta?')) return
  fetch('api/delete_question.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  }).then(r => r.json()).then(() => fetchPreguntes())
}

// Editar pregunta (modal Bootstrap)
window.editPregunta = function (id) {
  fetch('api/get_questions.php')
    .then(r => r.json())
    .then(data => {
      const p = data.preguntes.find(q => q.id == id)
      if (!p) return
      document.getElementById('modal-edit-pregunta').value = p.pregunta
      let html = ''
      p.respostes.forEach((r, i) => {
        html += `<div class='resposta-item d-flex align-items-center mb-3'>
          <input type='text' id='edit-etiqueta-${i}' value='${r.etiqueta}' class='form-control me-2' style='max-width:120px;'>
          <img id='edit-preview-${i}' src='${r.imatge}' width='32' height='32' alt='img' class='me-2'>
          <input type='file' id='edit-imatge-${i}' accept='image/*' class='form-control me-2' style='max-width:160px;'>
          <label class='ms-2'><input type='radio' name='edit-correcta' value='${i}' ${r.correcta == 1 ? 'checked' : ''}> Correcta</label>
        </div>`
      })
      document.getElementById('modal-edit-respostes').innerHTML = html
      document.getElementById('modal-edit-error').textContent = ''
      // Preview d'imatge al seleccionar arxiu
      p.respostes.forEach((r, i) => {
        document.getElementById('edit-imatge-' + i).addEventListener('change', function (e) {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = function (ev) {
              document.getElementById('edit-preview-' + i).src = ev.target.result
            }
            reader.readAsDataURL(file)
          } else {
            document.getElementById('edit-preview-' + i).src = r.imatge
          }
        })
      })
      // Mostra modal
      const modal = new bootstrap.Modal(document.getElementById('modalEditPregunta'))
      modal.show()
      document.getElementById('modal-edit-form').onsubmit = function (e) {
        e.preventDefault()
        const preguntaEditada = document.getElementById('modal-edit-pregunta').value.trim()
        if (!preguntaEditada) {
          document.getElementById('modal-edit-error').textContent = 'Escriu la pregunta.'
          return
        }
        const radioSeleccionado = document.querySelector('input[name="edit-correcta"]:checked')
        if (!radioSeleccionado) {
          document.getElementById('modal-edit-error').textContent = 'Marca una resposta com a correcta.'
          return
        }
        const correctaIndex = parseInt(radioSeleccionado.value)
        // FormData per editar
        const formData = new FormData()
        formData.append('id', id)
        formData.append('pregunta', preguntaEditada)
        for (let i = 0; i < 4; i++) {
          let etiqueta = document.getElementById('edit-etiqueta-' + i).value
          let imatgeFile = document.getElementById('edit-imatge-' + i).files[0]
          let correcta = (i === correctaIndex) ? 1 : 0
          formData.append(`respostes[${i}][etiqueta]`, etiqueta)
          formData.append(`respostes[${i}][correcta]`, correcta)
          if (imatgeFile) {
            formData.append(`respostes[${i}][imatge]`, imatgeFile)
          } else {
            formData.append(`respostes[${i}][imatge]`, p.respostes[i].imatge)
          }
        }
        fetch('api/update_question.php', {
          method: 'POST',
          body: formData
        }).then(r => r.json()).then(() => {
          bootstrap.Modal.getInstance(document.getElementById('modalEditPregunta')).hide()
          fetchPreguntes()
        })
      }
    })
}

// Inicialitza la llista de preguntes
fetchPreguntes()
