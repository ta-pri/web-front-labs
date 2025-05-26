let currentRate = 1;
let chart, selectedIndex = null;

// Получить актуальный курс UZS
async function loadCurrentRate() {
  const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
  const data = await res.json();
  const rate = data.Valute.UZS?.Value;
  currentRate = rate;

  document.getElementById('result').textContent = `Курс UZS сегодня: ${rate.toFixed(2)} ₽`;
  setupConverter(rate);
}

// Установить события конвертера
function setupConverter(rate) {
  const rubInput = document.getElementById('rub');
  const uzsInput = document.getElementById('uzs');

  rubInput.addEventListener('input', () => {
    if (rubInput.value)
      uzsInput.value = (parseFloat(rubInput.value) / rate).toFixed(2);
    else uzsInput.value = '';
  });

  uzsInput.addEventListener('input', () => {
    if (uzsInput.value)
      rubInput.value = (parseFloat(uzsInput.value) * rate).toFixed(2);
    else rubInput.value = '';
  });
}

// Загрузить данные за последние 31 день
async function loadMonthlyRates() {
  const today = new Date();
  const labels = [];
  const rates = [];

  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    const label = `${dd}.${mm}`;
    const url = `https://www.cbr-xml-daily.ru/archive/${yyyy}/${mm}/${dd}/daily_json.js`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const rate = data.Valute?.UZS?.Value;
      if (rate) {
        labels.push(label);
        rates.push(rate.toFixed(2));
      }
    } catch (e) {
      // Ошибка игнорируется
    }
  }

  drawChart(labels, rates);
}

function drawChart(labels, rates) {
  const ctx = document.getElementById('rateChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Курс UZS (₽)',
        data: rates,
        backgroundColor: labels.map(() => '#007bff')
      }]
    },
    options: {
      responsive: true,
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          highlightBar(index, labels[index], rates[index]);
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `₽ ${ctx.raw}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function highlightBar(index, date, rate) {
  if (selectedIndex !== null) {
    chart.data.datasets[0].backgroundColor[selectedIndex] = '#007bff';
  }

  chart.data.datasets[0].backgroundColor[index] = '#ff5733';
  chart.update();
  selectedIndex = index;

  const info = document.getElementById('info');
  info.innerHTML = `<strong>Дата:</strong> ${date} &nbsp;&nbsp; <strong>Курс:</strong> ₽ ${rate}`;
  info.style.display = 'block';
}

loadCurrentRate();
loadMonthlyRates();
