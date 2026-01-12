
let dadosSolar = JSON.parse(localStorage.getItem("solar")) || [];
let graficoSolarRef = null;
let periodoGrafico = 'dia'; 

const cores = [
    '#e67e22', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
    '#f1c40f', '#e74c3c', '#1abc9c', '#7f8c8d'
];

function salvarSolar() {
    localStorage.setItem("solar", JSON.stringify(dadosSolar));
}

function formatarData(dataString) {
    if (!dataString) return '-';
    const partes = dataString.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function criarPlaca() {
    const nomeInput = document.getElementById('novoNomePlaca');
    const capInput = document.getElementById('novaCapacidadePlaca');

    const nome = nomeInput.value.trim();
    const capacidade = capInput.value;

    if (!nome) {
        alert("Digite um nome para a placa!");
        return;
    }

    const novaPlaca = {
        id: Date.now(),
        nome: nome,
        capacidade: capacidade,
        leituras: []
    };

    dadosSolar.push(novaPlaca);
    salvarSolar();
    renderizarPlacas();

    nomeInput.value = '';
    capInput.value = '';
}

function adicionarLeitura(idPlaca) {
    const dataInput = document.getElementById(`data-${idPlaca}`);
    const kwhInput = document.getElementById(`kwh-${idPlaca}`);

    const data = dataInput.value;
    const kwh = parseFloat(kwhInput.value);

    if (!data || isNaN(kwh)) {
        alert("Preencha a data e a geração (kWh)!");
        return;
    }

    const placa = dadosSolar.find(p => p.id === idPlaca);
    if (placa) {
        placa.leituras.push({ data, kwh });

        placa.leituras.sort((a, b) => new Date(b.data) - new Date(a.data));

        salvarSolar();
        renderizarPlacas();
    }
}

function removerLeitura(idPlaca, indexLeitura) {
    const placa = dadosSolar.find(p => p.id === idPlaca);
    if (placa) {
        placa.leituras.splice(indexLeitura, 1);
        salvarSolar();
        renderizarPlacas();
    }
}

function resetarPlaca(idPlaca) {
    if (confirm("Tem certeza que deseja apagar todo o histórico desta placa?")) {
        const placa = dadosSolar.find(p => p.id === idPlaca);
        if (placa) {
            placa.leituras = [];
            salvarSolar();
            renderizarPlacas();
        }
    }
}

function excluirPlaca(idPlaca) {
    if (confirm("ATENÇÃO: Isso excluirá a placa e todos os dados dela permanentemente.")) {
        dadosSolar = dadosSolar.filter(p => p.id !== idPlaca);
        salvarSolar();
        renderizarPlacas();
    }
}

function renderizarPlacas() {
    const container = document.getElementById('placasContainer');
    container.innerHTML = "";

    dadosSolar.forEach((placa, index) => {
        const totalGerado = placa.leituras.reduce((acc, l) => acc + l.kwh, 0);

        
        const card = document.createElement('div');
        card.className = 'carro'; 
        card.style.borderLeft = `5px solid ${cores[index % cores.length]}`;

        let listaHTML = '';
        placa.leituras.forEach((l, i) => {
            listaHTML += `
                <div class="item">
                    <span class="item-dados">
                        <strong>${formatarData(l.data)}</strong> | ${l.kwh.toFixed(2)} kWh
                    </span>
                    <button class="btn-remover" onclick="removerLeitura(${placa.id}, ${i})">✖</button>
                </div>
            `;
        });

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>${placa.nome} <span style="font-size:0.8rem; color:#7f8c8d;">(${placa.capacidade || '?'} W)</span></h2>
                <button onclick="excluirPlaca(${placa.id})" style="background:none; border:none; color:#ccc; cursor:pointer;" title="Excluir Painel">🚫</button>
            </div>
            
            <div class="inputs-grid">
                <div>
                    <label>Data:</label>
                    <input type="date" id="data-${placa.id}">
                </div>
                <div>
                    <label>Geração (kWh):</label>
                    <input type="number" step="0.01" id="kwh-${placa.id}" placeholder="Ex: 12.5">
                </div>
            </div>

            <div class="botoes-container">
                <button class="btn btn-primary" onclick="adicionarLeitura(${placa.id})" style="background-color: ${cores[index % cores.length]};">➕ Adicionar Leitura</button>
                <button class="btn btn-danger" onclick="resetarPlaca(${placa.id})">🗑️ Limpar Dados</button>
            </div>

            <div class="lista">
                ${listaHTML}
            </div>
            <div class="total">Total Gerado: ${totalGerado.toFixed(2)} kWh</div>
        `;

        container.appendChild(card);
    });

    
    const totalGeral = dadosSolar.reduce((acc, placa) => {
        return acc + placa.leituras.reduce((sum, l) => sum + l.kwh, 0);
    }, 0);

    document.getElementById('totalGeralDisplay').textContent = `${totalGeral.toFixed(2)} kWh`;

    atualizarGrafico();
}

function mudarPeriodo(p) {
    periodoGrafico = p;
    document.getElementById('btnDia').style.background = p === 'dia' ? '#3498db' : '#ecf0f1';
    document.getElementById('btnDia').style.color = p === 'dia' ? 'white' : '#333';
    document.getElementById('btnMes').style.background = p === 'mes' ? '#3498db' : '#ecf0f1';
    document.getElementById('btnMes').style.color = p === 'mes' ? 'white' : '#333';
    atualizarGrafico();
}

function atualizarGrafico() {
    const ctx = document.getElementById('graficoSolar').getContext('2d');

    if (graficoSolarRef) {
        graficoSolarRef.destroy();
    }

    let labels = new Set();
    let datasets = [];

    dadosSolar.forEach((placa, index) => {
        let dadosAgrupados = {};

        placa.leituras.forEach(l => {
            let chave;
            if (periodoGrafico === 'dia') {
                chave = l.data; 
            } else {
                chave = l.data.substring(0, 7); 
            }

            dadosAgrupados[chave] = (dadosAgrupados[chave] || 0) + l.kwh;
            labels.add(chave);
        });

        datasets.push({
            label: placa.nome,
            data: dadosAgrupados, 
            borderColor: cores[index % cores.length],
            backgroundColor: cores[index % cores.length],
            tension: 0.3,
            fill: false
        });
    });

    
    let labelsArray = Array.from(labels).sort();

    datasets.forEach(ds => {
        ds.data = labelsArray.map(label => ds.data[label] || 0);
    });

    let labelsFormatadas = labelsArray.map(l => {
        if (periodoGrafico === 'dia') return formatarData(l);
        else {
            const [ano, mes] = l.split('-');
            return `${mes}/${ano}`;
        }
    });

    graficoSolarRef = new Chart(ctx, {
        type: periodoGrafico === 'dia' ? 'line' : 'bar',
        data: {
            labels: labelsFormatadas,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Geração (kWh)' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' kWh';
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', renderizarPlacas);
