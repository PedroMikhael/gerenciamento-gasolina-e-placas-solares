let dados = JSON.parse(localStorage.getItem("abastecimentos")) || { carro1: [], carro2: [] };
let grafico;

function salvar() {
    localStorage.setItem("abastecimentos", JSON.stringify(dados));
}

function atualizarTela(carro) {
    let listaDiv = document.getElementById(`lista${carro}`);
    let totalDiv = document.getElementById(`total${carro}`);
    listaDiv.innerHTML = "";
    let total = 0;

    dados[`carro${carro}`].forEach((item, index) => {
        listaDiv.innerHTML += `
            <div class="item">
                ${index + 1} - ${item.data} | R$ ${item.preco.toFixed(2)} | ${item.litros.toFixed(2)} L | R$ ${item.precoLitro.toFixed(2)}/L
            </div>
        `;
        total += item.preco;
    });

    totalDiv.textContent = `Total gasto: R$ ${total.toFixed(2)}`;
    atualizarGrafico();
}

function adicionarAbastecimento(carro) {
    let data = document.getElementById(`data${carro}`).value;
    let preco = parseFloat(document.getElementById(`preco${carro}`).value);
    let litros = parseFloat(document.getElementById(`litros${carro}`).value);
    let precoLitro = parseFloat(document.getElementById(`precoLitro${carro}`).value);

    if (!data || isNaN(preco) || isNaN(litros) || isNaN(precoLitro)) {
        alert("Preencha todos os campos!");
        return;
    }

    dados[`carro${carro}`].push({ data, preco, litros, precoLitro });
    salvar();
    atualizarTela(carro);

    document.getElementById(`data${carro}`).value = "";
    document.getElementById(`preco${carro}`).value = "";
    document.getElementById(`litros${carro}`).value = "";
    document.getElementById(`precoLitro${carro}`).value = "";
}

function atualizarGrafico() {
    let totalCarro1 = dados.carro1.reduce((acc, item) => acc + item.preco, 0);
    let totalCarro2 = dados.carro2.reduce((acc, item) => acc + item.preco, 0);

    let ctx = document.getElementById("graficoGastos").getContext("2d");

    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Carro 1", "Carro 2"],
            datasets: [{
                label: "Total Gasto (R$)",
                data: [totalCarro1, totalCarro2],
                backgroundColor: ["#3498db", "#e67e22"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

atualizarTela(1);
atualizarTela(2);
