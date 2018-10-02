// Recebe como parâmetro um array, que receberá os dados lidos no arquivo
// Cuidado com o local do arquivo
function lerDadosAntoine(dados) {
	$.ajax({
		url: "funcoes-js/dados-antoine.txt",
		async: false,
		cache: false,
		dataType: "text",
		success: function(data) {
			var linhas = data.split("\n");
			for (var i = 0; i < linhas.length; i++) {
				dados[i] = linhas[i].split("/");
			}
		}
	});
}

// Esta função recebe um array como parâmetro, que receberá os dados lidos no arquivo
// Cuidado com o local do arquivo
function lerDadosConstanteHenry(dados) {
	$.ajax({
		url: "funcoes-js/dados-henry.txt",
		async: false,
		cache: false,
		dataType: "text",
		success: function(data) {
			var linhas = data.split("\n");
			for (var i = 0; i < linhas.length; i++) {
				dados[i] = linhas[i].split("/");
			}
		}
	});
}

// Recebe temperatura em °C, o tratamento é feito de acordo com os dados da função de Antoine
// A unidade da pressão retornada pela função é kPa
// O parâmetro dados é uma matriz, em que cada linha são os valores de um componente
function calculaPressaoSaturacao(dados, nome, temperatura) {
    for (var i = 0; i < dados.length; i++) {
        if (dados[i][0] == nome) {
            if (dados[i][2] == "°C") {
                var A = parseFloat(dados[i][3]);
                var B = parseFloat(dados[i][4]);
                var C = parseFloat(dados[i][5]);
                return Math.exp(A - B / (temperatura + C));
            }
        }
    }
}

// Recebe pressão em kPa, o tratamento é feito de acordo com os dados da função de Antoine
// A unidade da temperatura retornada pela função é °C
function calculaTemperaturaSaturacao(dados, nome, pressao) {
    for (var i = 0; i < dados.length; i++) {
        if (dados[i][0] == nome) {
            if (dados[i][1] == "kPa") {
                var A = parseFloat(dados[i][3]);
                var B = parseFloat(dados[i][4]);
                var C = parseFloat(dados[i][5]);
                return B / (A - Math.log(pressao)) - C;
            }
        }
    }
}

function buscarConstanteHenry(dados, nome, temperatura, pressao) {}