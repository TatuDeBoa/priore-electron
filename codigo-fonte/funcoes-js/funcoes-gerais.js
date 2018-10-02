// Função para cálculo do erro relativo, para definir critério de parada. Retorna um valor em porcentagem.
function erroRelativo(valor, novoValor) {
	return Math.abs(valor - novoValor) * 100 / novoValor;
}

// Funções de ordenação
// Recebe vários arrays como argumento, ordenando o primeiro e os demais em função dele
// O algoritimo de ordenação é o quicksort
function ordenacaoCrescente() {
	var args = arguments;
	if (args.length == 0) {
		console.log("É preciso informar ao menos um array para ser ordenado");
		return;
	}
	quicksort(args, 0, args[0].length - 1, "crescente");
}
function ordenacaoDecrescente() {
	var args = arguments;
	if (args.length == 0) {
		console.log("É preciso informar ao menos um array para ser ordenado");
		return;
	}
	quicksort(args, 0, args[0].length - 1, "decrescente");
}

function quicksort(matriz, inicio, fim, tipoOrdenacao) {
	var i, j;
	var indices = particionar(matriz, inicio, fim, tipoOrdenacao);
	i = indices[0];
	j = indices[1]
	if (inicio < j) {
		quicksort(matriz, inicio, j, tipoOrdenacao);
	}
	if (i < fim) {
		quicksort(matriz, i, fim, tipoOrdenacao);
	}
}

function particionar(matriz, i, j, tipoOrdenacao) {
	var pivot = matriz[0][parseInt((i + j) / 2)];
	var criterio = true;
	while (criterio) {
		if (tipoOrdenacao == "crescente") {
			while (matriz[0][i] < pivot) {
				i++;
			}
			while (matriz[0][j] > pivot) {
				j--;
			}
		}
		if (tipoOrdenacao == "decrescente") {
			while (matriz[0][i] > pivot) {
				i++;
			}
			while (matriz[0][j] < pivot) {
				j--;
			}
		}
		if (i <= j) {
			for (var k = 0; k < matriz.length; k++) {
				var aux = matriz[k][i];
				matriz[k][i] = matriz[k][j];
				matriz[k][j] = aux;
			}
			i++;
			j--;
		} else {
			break;
		}
	}
	return [i, j];
}

// Bloco de estimadores dos parâmetros da regressão linear
function cdrl(arrayX, arrayY) {
	return Math.pow(spd(arrayX, arrayY), 2) / (sqd(arrayX) * sqd(arrayY));
}
function carl(arrayX, arrayY) {
	return spd(arrayX, arrayY) / sqd(arrayX);
}
function clrl(arrayX, arrayY) {
	return media(arrayY) - carl(arrayX, arrayY) * media(arrayX);
}

// Função que calcula a média de uma série de valores
function media(array) {
	var tamanho = array.length;
	var somatorio = 0
	for (var i = 0; i < tamanho; i++) {
		somatorio += array[i];
	}
	return somatorio / tamanho;
}

// Função que calcula a soma dos quadrados do desvio em relação à média
function sqd(array) {
	var tamanho = array.length;
	var somatorioX = 0;
	var somatorioXX = 0;
	for (var i = 0; i < tamanho; i++) {
		somatorioX += array[i];
		somatorioXX += Math.pow(array[i], 2);
	}
	return somatorioXX - somatorioX * somatorioX / tamanho;
}

// Função que calcula a soma dos produtos dos desvios
function spd(arrayX, arrayY) {
	var tamanho = arrayX.length;
	var somatorioX = 0;
	var somatorioY = 0;
	var somatorioXY = 0;
	for (var i = 0; i < tamanho; i++) {
		somatorioX += arrayX[i];
		somatorioY += arrayY[i];
		somatorioXY += arrayX[i] * arrayY[i];
	}
	return somatorioXY - somatorioX * somatorioY / tamanho;
}

// Realiza a interpolação de um valor y, dado um x, entre as posições i e i+1
// Recebe dois arrays como parâmetros e um valor contido no primeiro, para realizar a interpolação no segundo
// Pressupõe que o array que contêm o valor conhecido esteja ordenado em ordem crescente
// Esta função é frágil, pode não ser muito tolerante para erros
function interpolacao(arrayX, arrayY, x) {
	if (x > arrayX[arrayX.length - 1]) {
		return extrapolacao(arrayX, arrayY, x, "mais");
	} else if (x < arrayX[0]) {
		return extrapolacao(arrayX, arrayY, x, "menos");
	} else {
		for (var i = 0; i < arrayX.length - 1; i++) {
			if (x == arrayX[i]) {
				return arrayY[i];
			} else if (x == arrayX[i + 1]) {
				return arrayY[i + 1];
			} else if (x > arrayX[i] && x < arrayX[i + 1]) {
				return arrayY[i + 1] - (arrayX[i + 1] - x) * (arrayY[i + 1] - arrayY[i]) / (arrayX[i + 1] - arrayX[i]);
			}
		}
	}
}

// Realiza a extrapolação, para mais ou para menos, de um valor y, dado um x
function extrapolacao(arrayX, arrayY, x, tipo) {
	tipo = tipo.toLowerCase();
	if (tipo == "mais") {
		var i = arrayX.length - 2;
		return arrayY[i + 1] - (arrayX[i + 1] - x) * (arrayY[i + 1] - arrayY[i]) / (arrayX[i + 1] - arrayX[i]);
	}
	if (tipo == "menos") {
		return arrayY[1] - (arrayX[1] - x) * (arrayY[1] - arrayY[0]) / (arrayX[1] - arrayX[0])
	}
}

// Função parar recuperação de dados do handsontable
// Sempre recupera valores numéricos
// Quando há uma célula vazia ele ignora todo o conteúdo da linha, para evitar erros posteriores
function receberDados(matriz, handsontable) {
	var linhas = handsontable.countRows();
	var colunas = handsontable.countCols();
	// As variáveis a seguir são de auxílio para validação dos dados recebidos do handsontable
	var array = [];
	var ignorar = false;
	// Recebe os dados do handsontable
	for(var i = 0; i < linhas; i++) {
		for(var j = 0; j < colunas; j++) {
			array[j] = handsontable.getDataAtCell(i, j);
		}
		// Valida os dados recuperados
		for(var j = 0; j < array.length; j++) {
			if(array[j] == null || array[j] == "" || !valNum(array[j]))
				ignorar = true;
		}
		if(!ignorar) {
			matriz[i] = [];
			for(var j = 0; j < colunas; j++) {
				matriz[i][j] = parseFloat(array[j].replace(",", "."));
			}
		}
		ignorar = false;
	}
}

// Função que valida uma string, se ela é um número ou não
// Não reconhece o ponto como caracter válido, apenas números e a vírgula
function valNum(str) {
	if(str.length == 0)
		return false;
	for(var i = 0; i < str.length; i++) {
		if(str[i] != "0" && str[i] != "1" && str[i] != "2" && str[i] != "3" && str[i] != "4" && str[i] != "5" && str[i] != "6" && str[i] != "7" && str[i] != "8" && str[i] != "9" && str[i] != "," && str[i] != "-") {
			return false;
		}
	}
	return true;
}

// Função que valida uma string, se é um número positivo ou não
function valNumPos(str) {
	if(str.length == 0)
		return false;
	for(var i = 0; i < str.length; i++) {
		if(str[i] != "0" && str[i] != "1" && str[i] != "2" && str[i] != "3" && str[i] != "4" && str[i] != "5" && str[i] != "6" && str[i] != "7" && str[i] != "8" && str[i] != "9" && str[i] != ",") {
			return false;
		}
	}
	return true;
}

// Função que valida uma string, se é um número ou não
// Não reconhece a vírgula, ou seja, valida se é um valor inteiro e positivo
function valInt(str) {
	for(var i = 0; i < str.length; i++) {
		if(str[i] != "0" && str[i] != "1" && str[i] != "2" && str[i] != "3" && str[i] != "4" && str[i] != "5" && str[i] != "6" && str[i] != "7" && str[i] != "8" && str[i] != "9") {
			return false;
		}
	}
	return true;
}

// Valida se um valor informado é maior do que zero, não admitindo o valor nulo
function valPos(num) {
	if(num <= 0)
		return false;
	return true;
}

// Recebe valor na unidade °C
// Valida se é um valor válido, ou seja, se é maior do que o zero absoluto -273,15 °C
function valTemp(temperatura) {
	if(temperatura <= -273.15)
		return false;
	return true;
}

// Função para converter uma string para float, com troca da vírgula por ponto
function interpretar(str) {
	return parseFloat(str.replace(",", "."));
}

// Função de animação da progress bar
function animacao(idBarra) {
	//document.getElementById(idRes).innerHTML = "";
	var barra = document.getElementById(idBarra);
	var i = 0;
	var a = setInterval(function() {
		barra.style.width = i + "%";
		barra.innerHTML = i + "%";
		i++;
		if(i > 100) {
			clearInterval(a);
			//document.getElementById(idRes).innerHTML = "A rotina de cálculo foi finalizada com sucesso!";
		}
	}, 1);
}

// Função para preparar um número para exibição, no padrão brasileiros
// Recebe o número e a quantidade de casas decimais como parâmetro
// Retorna uma string, para ser utilizada em html
function padraoBr(num, cd) {
	var notEng = 0;
	if(num == 0)
		return num.toFixed(cd).replace('.', ',');
	while(Math.abs(parseFloat(num.toFixed(cd))) < 0.01) {
		num *= 1000;
		notEng += 3;
	}
	if(notEng == 0)
		return num.toFixed(cd).replace(".", ",");
	else
		return num.toFixed(cd).replace(".", ",") + ".10<sup>-" + notEng + "</sup>";
}

// Função para converter uma string no padrão br para o padrão de programação
// Retorna um número
function padraoProg(str) {
	return parseFloat(str.replace(",", "."));
}

// Procura o maior valor de uma lista informada como parâmetro
function maior(lista) {
	var maior = lista[0];
	for(var i = 1; i < lista.length; i++) {
		if(lista[i] > maior)
			maior = lista[i];
	}
	return maior;
}

// Procura o menor valor de uma lista informada
function menor(lista) {
	var menor = lista[0];
	for(var i = 1; i < lista.length; i++) {
		if(lista[i] < menor)
			menor = lista[i];
	}
	return menor;
}

// Função que recebe dois arrays como parâmetro, retornando a interceção
function inter(array1, array2) {
	var res = [];
	for(var i = 0; i < array1.length; i++) {
		for(var j = 0; j < array2.length; j++) {
			if(array1[i] == array2[j]) {
				res.push(array1[i]);
				break;
			}
		}
	}
	return res;
}

// Função para desenho de gráficos simples com o Chart.js
function graficoGeral(idCanvas, titulo, dados, mostrarLinha, legendaDados, stringCorLinha, stringCorPonto, tituloX, tituloY) {
	var dataset = gerarDados(dados, mostrarLinha, legendaDados, stringCorLinha, stringCorPonto);
	var contexto = document.getElementById(idCanvas).getContext('2d');
	var chart = new Chart(contexto, {
		type: 'line',
		data: {
			datasets: dataset
		},
		options: {
			title: {
				display: true,
				fontSize: 20,
				fontColor: '#000000',
				text: titulo
			},
			scales: {
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: tituloX
					},
					type: 'linear',
					position: 'bottom'
				}],
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: tituloY
					}
				}]
			}
		}

	});
}

// Monta o dataset para o Chart.js
// O argumento dados é um array de arrays
// Todos os outros argumentos são arrays, com a configuração de cada conjunto de dados
function gerarDados(dados, mostrarLinha, legendaDados, stringCorLinha, stringCorPonto) {
	var dataset = [];
	// Percorre a quantidade de dados
	for(var i = 0; i < dados.length; i++) {
		var objeto = {showLine: mostrarLinha[i], label: legendaDados[i], data: [], backgroundColor: stringCorLinha[i], pointBackgroundColor: stringCorPonto[i], borderColor: stringCorLinha[i], pointBorderColor: stringCorPonto[i], fill: false};
		for(var j = 0; j < dados[i].length; j++) {
			objeto.data.push({x: dados[i][j][0], y: dados[i][j][1]});
		}
		dataset.push(objeto);
	}
	return dataset
}
