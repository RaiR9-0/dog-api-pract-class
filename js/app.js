// 1. Configuracion del servicio REST
const DOG_API_URL = 'https://api.thedogapi.com/v1/breeds';
const DOG_API_KEY = 'live_FtBhFJ5hdJ227kK1YHZeUpk82WvWxmA1c2YZ8VgBa3Dg6c4CGY8kwvHzWMODxkiz';

const opciones = document.getElementById('opciones');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');

const RASGOS_AGRESIVOS = ['protective', 'fearless', 'tenacious', 'determined', 'aggressive', 'territorial'];
const RASGOS_SUMISOS = ['gentle', 'calm', 'docile', 'patient', 'easygoing', 'even-tempered', 'sweet-tempered', 'eager to please'];

let razas = [];

function pesoPromedio(raza) {
  const numeros = (raza.weight?.metric || '').match(/[\d.]+/g);
  if (!numeros) return null;
  return numeros.map(Number).reduce((a, b) => a + b) / numeros.length;
}
function tieneRasgo(raza, rasgos) {
  const temperamento = (raza.temperament || '').toLowerCase();
  return rasgos.some(rasgo => temperamento.includes(rasgo));
}

const FILTROS = {
  pequeno: raza => pesoPromedio(raza) !== null && pesoPromedio(raza) < 10,
  mediano: raza => pesoPromedio(raza) >= 10 && pesoPromedio(raza) < 25,
  grande: raza => pesoPromedio(raza) >= 25,
  agresivo: raza => tieneRasgo(raza, RASGOS_AGRESIVOS),
  sumiso: raza => tieneRasgo(raza, RASGOS_SUMISOS)
};

async function cargarRazas() {
  try {
    const response = await fetch(DOG_API_URL, { headers: { 'x-api-key': DOG_API_KEY } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    razas = await response.json();
    resultsCount.textContent = 'Seleccione un tipo de perro';
  } catch (error) {
    console.error('Error en la peticion HTTP:', error);
    resultsCount.textContent = 'Error';
    resultsGrid.innerHTML = `<p class="error">No se pudo consultar la API: ${escaparHtml(error.message)}</p>`;
  }
}

function mostrarPerros(filtro) {
  const lista = razas.filter(FILTROS[filtro]).filter(r => r.image?.url).slice(0, 24);
  resultsCount.textContent = `${lista.length} razas encontradas`;

  resultsGrid.innerHTML = lista.map(raza => `
    <article class="card-item">
      <img src="${escaparHtml(raza.image.url)}" alt="${escaparHtml(raza.name)}" loading="lazy">
      <div class="card-body">
        <h3>${escaparHtml(raza.name)}</h3>
        <p><strong>Peso:</strong> ${escaparHtml(raza.weight?.metric || '?')} kg</p>
        <p><strong>Temperamento:</strong> ${escaparHtml(raza.temperament || 'No especificado')}</p>
      </div>
    </article>
  `).join('');
}

opciones.addEventListener('click', (event) => {
  const button = event.target.closest('.btn-category');
  if (!button || razas.length === 0) return;

  document.querySelectorAll('.btn-category').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  mostrarPerros(button.dataset.filtro);
});

function escaparHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

cargarRazas();
