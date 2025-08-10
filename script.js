// Tenta carregar os dados do localStorage ou inicializa um objeto vazio.
let dados = JSON.parse(localStorage.getItem("abastecimentos")) || { carro1: [], carro2: [] };
let grafico;

// Função para salvar os dados no localStorage
function salvar() {
    localStorage.setItem("abastecimentos", JSON.stringify(dados));
}

// Formata a data de YYYY-MM-DD para DD/MM/YYYY
function formatarData(dataString) {
    // Adiciona a anotação de fuso horário UTC para evitar problemas de fuso horário
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}

// Atualiza a lista de abastecimentos, o total gasto e o gráfico
function atualizarTela(carro) {
    const listaDiv = document.getElementById(`lista${carro}`);
    const totalDiv = document.getElementById(`total${carro}`);
    listaDiv.innerHTML = "";
    let total = 0;

    dados[`carro${carro}`].forEach((item, index) => {
        // Formata os valores para exibição
        const dataFormatada = formatarData(item.data);
        const precoFormatado = item.preco.toFixed(2).replace('.', ',');

        // Adiciona o item na lista com um botão de remoção
        listaDiv.innerHTML += `
            <div class="item">
                <span class="item-dados">
                    <strong>${dataFormatada}</strong> | R$ ${precoFormatado}
                </span>
                <button class="btn-remover" onclick="removerAbastecimento(${carro}, ${index})">✖</button>
            </div>
        `;
        total += item.preco;
    });

    totalDiv.textContent = `Total gasto: R$ ${total.toFixed(2).replace('.', ',')}`;
    atualizarGrafico();
}

// Adiciona um novo registro de abastecimento
function adicionarAbastecimento(carro) {
    const data = document.getElementById(`data${carro}`).value;
    const preco = parseFloat(document.getElementById(`preco${carro}`).value);

    if (!data || isNaN(preco)) {
        alert("🚨 Por favor, preencha a data e o valor total!");
        return;
    }

    dados[`carro${carro}`].push({ data, preco });
    dados[`carro${carro}`].sort((a, b) => new Date(b.data) - new Date(a.data)); // Ordena por data mais recente
    
    salvar();
    atualizarTela(carro);

    // Limpa os campos de input
    document.getElementById(`data${carro}`).value = "";
    document.getElementById(`preco${carro}`).value = "";
}

// Remove um abastecimento específico da lista
function removerAbastecimento(carro, index) {
    // Remove o item usando o índice
    dados[`carro${carro}`].splice(index, 1);
    salvar();
    atualizarTela(carro);
}

// Reinicia todos os dados de um carro específico
function reiniciarDados(carro) {
    const nomeCarro = document.querySelector(`#carro${carro} h2`).textContent;
    if (confirm(`Você tem certeza que deseja apagar todos os dados do ${nomeCarro}?`)) {
        dados[`carro${carro}`] = [];
        salvar();
        atualizarTela(carro);
    }
}

// Atualiza o gráfico de barras com os totais
function atualizarGrafico() {
    const totalCarro1 = dados.carro1.reduce((acc, item) => acc + item.preco, 0);
    const totalCarro2 = dados.carro2.reduce((acc, item) => acc + item.preco, 0);
    
    // Pega os nomes dos carros dinamicamente do HTML
    const nomeCarro1 = document.querySelector('#carro1 h2').textContent;
    const nomeCarro2 = document.querySelector('#carro2 h2').textContent;

    const ctx = document.getElementById("graficoGastos").getContext("2d");

    // Destrói o gráfico anterior se ele existir para evitar sobreposições
    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [nomeCarro1, nomeCarro2],
            datasets: [{
                label: "Total Gasto (R$)",
                data: [totalCarro1, totalCarro2],
                backgroundColor: ["#3498db", "#e74c3c"],
                borderColor: ["#2980b9", "#c0392b"],
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value;
                        }
                    }
                }
            }
        }
    });
}

// Inicializa a tela para ambos os carros ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    atualizarTela(1);
    atualizarTela(2);
});