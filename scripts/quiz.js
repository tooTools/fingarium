document.addEventListener('DOMContentLoaded', () => {
  let pitanja = [];
  let trenutniIndex = 0;
  let poeni = 0;
  let timerInterval;
  let vrijeme = 10;

  const urlParams = new URLSearchParams(window.location.search);
  const kvizNaziv = urlParams.get("kviz");

  if (!kvizNaziv) {
    document.getElementById('category').textContent = "Kategorija nije odabrana.";
    return;
  }

  async function loadQuestions() {
    try {
      const res = await fetch(`/data/quiz-${kvizNaziv}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      pitanja = await res.json();
      prikaziPitanje();
    } catch (err) {
      const qc = document.getElementById('quiz-container');
      qc.innerHTML = `
        <p style="color:red;">Greška pri učitavanju kviza "<strong>${kvizNaziv}</strong>".</p>
        <p>${err.message}</p>
        <p><a href="/index.html">Vrati se na početnu</a></p>
      `;
    }
  }

  function prikaziPitanje() {
    if (trenutniIndex >= pitanja.length) {
      zavrsiKviz();
      return;
    }

    const p = pitanja[trenutniIndex];

    document.getElementById('category').textContent = `Kategorija: ${p.kategorija}`;
    document.getElementById('question').textContent = `${trenutniIndex + 1}. ${p.pitanje}`;
    document.getElementById('score').textContent = `Poeni: ${poeni}`;
    document.getElementById('result').textContent = '';

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    optionsDiv.classList.add('options');

    p.opcije.forEach((opcija) => {
      const dugme = document.createElement('button');
      dugme.type = 'button';
      dugme.textContent = opcija;
      dugme.classList.add('option-btn');
      dugme.onclick = () => {
        clearInterval(timerInterval);
        provjeriOdgovor(opcija);
      };
      optionsDiv.appendChild(dugme);
    });

    vrijeme = 10;
    updateTimer();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      vrijeme--;
      updateTimer();
      if (vrijeme <= 0) {
        clearInterval(timerInterval);
        provjeriOdgovor('');
      }
    }, 1000);
  }

  function updateTimer() {
    document.getElementById('timer').textContent = `Vrijeme: ${vrijeme}s`;
  }

  function provjeriOdgovor(izbor) {
    const tacno = pitanja[trenutniIndex].odgovor;
    const resultEl = document.getElementById('result');

    if (izbor === tacno) {
      poeni++;
      resultEl.textContent = '✅ Tačno!';
    } else if (izbor === '') {
      resultEl.textContent = `⏰ Vrijeme isteklo! Tačan odgovor: ${tacno}`;
    } else {
      resultEl.textContent = `❌ Netočno! Tačan odgovor: ${tacno}`;
    }

    document.getElementById('score').textContent = `Poeni: ${poeni}`;

    trenutniIndex++;
    setTimeout(prikaziPitanje, 1300);
  }

  function zavrsiKviz() {
    clearInterval(timerInterval);
    const qc = document.getElementById('quiz-container');
    qc.innerHTML = `
      <div class="final">
        <h2>Kviz završen!</h2>
        <p>Osvojili ste <strong>${poeni}</strong> poena od ukupno ${pitanja.length} pitanja.</p>
        <p><a href="/index.html">Vrati se na početnu</a></p>
      </div>
    `;
  }

  loadQuestions();
});
