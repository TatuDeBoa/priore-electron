// Objeto responsável por controlar como gráficos são exibidos em tela
// As funções deste arquivo interagem com as do arquivo auxiliares.js
var GraficoCanvas = function() {
	this.funcoes = [];
	this.limMaxX = 0;
	this.limMinX = 0;
	this.limMaxY = 0;
	this.limMinY = 0;
	this.id = "";
	this.largura = 300;
	this.altura = 300;
	this.fex = 0;
	this.fey = 0;
	this.zeroX = 0;
	this.zeroY = 0;
	this.marcarNegX = true;
	this.marcarNegY = true;
	this.marcarPosX = true;
	this.marcarPosY = true;
	this.cores = [];
	this.valoresX = [];
	this.valoresY = [];
	this.cd = 2;
}

// Bloco de funções que definem as características do GraficoCanvas
GraficoCanvas.prototype.limitesPorPontos = function() {
	this.limMaxX = maiorValor(this.valoresX);
	this.limMinX = menorValor(this.valoresX);
	this.limMaxY = maiorValor(this.valoresY);
	this.limMinY = menorValor(this.valoresY);
	this.definirEscala(this.limMaxX, this.limMinX, this.limMaxY, this.limMinY);
}

GraficoCanvas.prototype.limitesFixos = function(limMaxX, limMinX, limMaxY, limMinY) {
	this.limMaxX = limMaxX;
	this.limMinX = limMinX;
	this.limMaxY = limMaxY;
	this.limMinY = limMinY;
	this.definirEscala(this.limMaxX, this.limMinX, this.limMaxY, this.limMinY);
}

GraficoCanvas.prototype.definirElemento = function(str) {
	this.id = str;
}

GraficoCanvas.prototype.definirPontos = function(arrayX, arrayY) {
	this.valoresX = arrayX.slice();
	this.valoresY = arrayY.slice();
	ordenacaoCrescente(this.valoresX, this.valoresY);
}

GraficoCanvas.prototype.definirDimensoes = function(larg, alt) {
	this.largura = larg;
	this.altura = alt;
}

GraficoCanvas.prototype.alteraMarcacoes = function(posX, posY, negX, negY) {
	this.marcarPosX = posX;
	this.marcarPosY = posY;
	this.marcarNegX = negX;
	this.marcarNegY = negY;
}

GraficoCanvas.prototype.definirFuncoes = function(func, cor) {
	this.funcoes = func.slice();
	this.cores = cor.slice();
}

GraficoCanvas.prototype.apagar = function() {
	var canvas = document.getElementById(this.id);
	if (canvas.getContext) {
		var des = canvas.getContext('2d');
		des.clearRect(0, 0, canvas.width, canvas.height)
	}
}

GraficoCanvas.prototype.alteraCasasDecimais = function(a) {
	this.cd = a;
}

GraficoCanvas.prototype.rotularEixoX = function(str) {
	// Inicia o canvas responsável por desenhar o texto na tela
	var canvas = document.getElementById(this.id);
	if (canvas.getContext) {
		var des = canvas.getContext('2d');
		des.save();
		des.strokeStyle = "#000000";
		des.fillStyle = "#000000";
		des.font = '23px serif';
		// Escreve o texto na tela
		des.beginPath();
		des.fillText(str, this.largura * 0.4, this.altura - 25);
		des.restore();
	}
}

GraficoCanvas.prototype.rotularGrafico = function(str, posicao) {
	// Inicia o canvas responsável por desenhar o texto na tela
	var canvas = document.getElementById(this.id);
	if (canvas.getContext) {
		var des = canvas.getContext('2d');
		des.save();
		des.strokeStyle = "#000000";
		des.fillStyle = "#000000";
		des.font = '28px serif';
		// Escreve o texto na tela
		des.beginPath();
		des.fillText(str, this.largura * posicao, 25);
		des.restore();
	}
}

GraficoCanvas.prototype.rotularEixoY = function(str) {
	// Inicia o canvas responsável por desenhar o texto na tela
	var canvas = document.getElementById(this.id);
	if (canvas.getContext) {
		var des = canvas.getContext('2d');
		des.save();
		des.strokeStyle = "#000000";
		des.fillStyle = "#000000";
		des.font = '23px serif';
		// Escreve o texto na tela
		des.beginPath();
		des.translate(25, this.altura * 0.6);
		des.rotate(Math.PI / 2);
		des.rotate(Math.PI);
		des.fillText(str, 0, 0);
		des.restore();
	}
}

GraficoCanvas.prototype.definirEscala = function(limMaxX, limMinX, limMaxY, limMinY) {
	// Define os limites
	this.limMaxX = limMaxX;
	this.limMinX = limMinX;
	this.limMaxY = limMaxY;
	this.limMinY = limMinY;

	// Calcula as margems e limites dos eixos
	var limX = this.largura - 100;
	var limY = this.altura - 100;
	var margem = 40;

	// Encontra as escalas em cada eixo
	var fatorEscalaX = (limX - 2 * margem) / (this.limMaxX - this.limMinX);
	var fatorEscalaY = (limY - 2 * margem) / (this.limMaxY - this.limMinY);
	var fracaoPositivaX = this.limMaxX / (this.limMaxX - this.limMinX);
	var fracaoPositivaY = this.limMaxY / (this.limMaxY - this.limMinY);
	this.fex = fatorEscalaX;
	this.fey = fatorEscalaY;

	// Calcula a posição do zero de cada eixo
	var zeroX = (limX - 2 * margem) * (1 - fracaoPositivaX) + margem + (this.largura - limX) / 2;
	var zeroY = (limY - 2 * margem) * fracaoPositivaY + margem + (this.altura - limY) / 2;
	this.zeroX = zeroX;
	this.zeroY = zeroY;
}

GraficoCanvas.prototype.desenharEixos = function() {
	// Calcula as margems e limites dos eixos
	var limX = this.largura - 100;
	var limY = this.altura - 100;
	var margem = 40;

	// Desenha os eixos na tela, juntamente com as escalas
	var canvas = document.getElementById(this.id);
	if (canvas.getContext) {
		var des = canvas.getContext('2d');
		des.strokeStyle = "#000000";
		des.strokeRect(0, 0, this.largura, this.altura);
		
		// Desenha o eixo x
		des.beginPath();
		des.moveTo((this.largura - limX) / 2, this.zeroY);
		des.lineTo(limX + (this.largura - limX) / 2, this.zeroY);
		des.stroke();

		// Desenha o eixo y
		des.moveTo(this.zeroX, (this.altura - limY) / 2);
		des.lineTo(this.zeroX, limY + (this.altura - limY) / 2);
		des.stroke();

		// Termina os desenhos de eixo
		des.closePath();

		// Define as marcações e textos numéricos nos eixos
		var maxX = this.limMaxX;
		var minX = this.limMinX;
		var maxY = this.limMaxY;
		var minY = this.limMinY;
		var marcacoesX = [];
		var marcacoesY = [];
		var textosX = [];
		var textosY = [];

		// Testa se o usuário deseja desativar as marcações intermediárias positivas do eixo x
		if (this.marcarPosX) {
			marcacoesX.push(maxX, 0.75 * maxX, 0.5 * maxX, 0.25 * maxX);
			textosX.push(padraoDecimal(arredonda(maxX, this.cd)), padraoDecimal(arredonda(0.75 * maxX, this.cd)), padraoDecimal(arredonda(0.5 * maxX, this.cd)), padraoDecimal(arredonda(0.25 * maxX, this.cd)));
		} else {
			marcacoesX.push(maxX);
			textosX.push(padraoDecimal(arredonda(maxX, this.cd)));
		}
		// Testa se o usuário deseja desativar as marcações intermediárias negativas do eixo x
		if (this.marcarNegX) {
			marcacoesX.push(minX, 0.75 * minX, 0.5 * minX, 0.25 * minX);
			textosX.push(padraoDecimal(arredonda(minX, this.cd)), padraoDecimal(arredonda(0.75 * minX, this.cd)), padraoDecimal(arredonda(0.5 * minX, this.cd)), padraoDecimal(arredonda(0.25 * minX, this.cd)));
		} else {
			marcacoesX.push(minX);
			textosX.push(padraoDecimal(arredonda(minX, this.cd)));
		}
		// Testa se o usuário deseja desativar as marcações intermediárias positivas do eixo y
		if (this.marcarPosY) {
			marcacoesY.push(maxY, 0.75 * maxY, 0.5 * maxY, 0.25 * maxY);
			textosY.push(padraoDecimal(arredonda(maxY, this.cd)), padraoDecimal(arredonda(0.75 * maxY, this.cd)), padraoDecimal(arredonda(0.5 * maxY, this.cd)), padraoDecimal(arredonda(0.25 * maxY, this.cd)));
		} else {
			marcacoesY.push(maxY);
			textosY.push(padraoDecimal(arredonda(maxY, this.cd)));
		}
		// Testa se o usuário deseja desativas as marcações intermediárias negativas do eixo y
		if (this.marcarNegY) {
			marcacoesY.push(minY, 0.75 * minY, 0.5 * minY, 0.25 * minY);
			textosY.push(padraoDecimal(arredonda(minY, this.cd)), padraoDecimal(arredonda(0.75 * minY, this.cd)), padraoDecimal(arredonda(0.5 * minY, this.cd)), padraoDecimal(arredonda(0.25 * minY, this.cd)));
		} else {
			marcacoesY.push(minY);
			textosY.push(padraoDecimal(arredonda(minY, this.cd)));
		}

		// Converte os valores de acordo com a escala
		for (var i = 0; i < marcacoesX.length; i++) {
			marcacoesX[i] = marcacoesX[i] * this.fex + this.zeroX;
			marcacoesY[i] = this.zeroY - marcacoesY[i] * this.fey;
		}

		// Desenha as marcações e textos na tela
		for (var i = 0; i < marcacoesX.length; i++) {
			des.beginPath();
			if (marcacoesX[i] != this.zeroX) {
				des.moveTo(marcacoesX[i], (this.zeroY + 3));
				des.lineTo(marcacoesX[i], (this.zeroY - 3));
				des.stroke();
			}
			if (marcacoesY[i] != this.zeroY) {
				des.moveTo(this.zeroX + 3, (marcacoesY[i]));
				des.lineTo(this.zeroX - 3, (marcacoesY[i]));
				des.stroke();
			}
			des.closePath();
		}
		for (var i = 0; i < textosX.length; i++) {
			des.beginPath();
			if (textosX[i] != 0) {
				des.strokeText(textosX[i], marcacoesX[i], this.zeroY + 15);
			}
			if (textosY[i] != 0) {
				des.strokeText(textosY[i], this.zeroX - 50, marcacoesY[i]);
			}
			des.closePath();
		}
	}
}

GraficoCanvas.prototype.ajusta = function() {
	// Verifica se existem pontos menores do que o limite mínimo em x
	var i = 0;
	while (i == 0) {
		if (this.valoresX[i] < this.limMinX) {
			this.valoresX.splice(i, 1);
			this.valoresY.splice(i, 1);
		} else {
			break;
		}
	}

	// Verifica se existem pontos menores do que o limite máximo em x
	while (i < this.valoresX.length) {
		if (this.valoresX[i] > this.limMaxX) {
			this.valoresX.splice(i, 1);
			this.valoresY.splice(i, 1);
		} else {
			i++;
		}
	}
}

GraficoCanvas.prototype.desenharGraficoLinhas = function() {
	// Declara o elemento canvas
	var canvas = document.getElementById(this.id);
	if (canvas.getContext) {
		var des = canvas.getContext('2d');
		// Esta função pode receber como argumento a cor a ser utilizada no desenho.
		// No caso de omissão, a cor padrão é o preto.
		var args = arguments;
		if (args.length == 0) {
			des.strokeStyle = "#000000";
			des.fillStyle = "#000000";
		} else {
			des.strokeStyle = args[0];
			des.fillStyle = args[0];
		}
		
		// Realiza o desenho das linhas, testando se os pontos estão dentro dos limites.
		// Parte-se do princípio de que os pontos estão ordenados em função de X.
		this.ajusta();
		var plotX = this.valoresX.slice();
		var plotY = this.valoresY.slice();
		var descontinuidade = false;
		plotX[0] = plotX[0] * this.fex + this.zeroX;
		plotY[0] = this.zeroY - plotY[0] * this.fey;
		des.beginPath();
		des.moveTo(plotX[0], plotY[0]);
		for (var i = 1; i < this.valoresX.length; i++) {
			// Testa se o ponto pode ser desenhado nos limites em y
			if (!descontinuidade) {
				if (plotY[i] >= this.limMinY && plotY[i] <= this.limMaxY) {
					plotX[i] = plotX[i] * this.fex + this.zeroX;
					plotY[i] = this.zeroY - plotY[i] * this.fey;
					des.lineTo(plotX[i], plotY[i]);
				} else {
					descontinuidade = true;
					des.stroke();
				}
			} else {
				if (plotY[i] >= this.limMinY && plotY[i] <= this.limMaxY) {
					plotX[i] = plotX[i] * this.fex + this.zeroX;
					plotY[i] = this.zeroY - plotY[i] * this.fey;
					descontinuidade = false;
					des.moveTo(plotX[i], plotY[i]);
				}
			}
		}
		des.stroke();
		des.closePath();
	}
}

GraficoCanvas.prototype.desenharGraficoPontos = function() {
	// Declara o elemento canvas
	var canvas = document.getElementById(this.id);
	if (canvas.getContext) {
		var des = canvas.getContext('2d');

		// Esta função pode receber como argumento a cor a ser utilizada no desenho.
		// No caso de omissão, a cor padrão é o preto.
		var args = arguments;
		if (args.length == 0) {
			des.strokeStyle = "#000000";
			des.fillStyle = "#000000";
		} else {
			des.strokeStyle = args[0];
			des.fillStyle = args[0];
		}
		
		// Realiza o desenho das linhas, testando se os pontos estão dentro dos limites.
		// Parte-se do princípio de que os pontos estão ordenados em função de X.
		this.ajusta();
		var plotX = this.valoresX.slice();
		var plotY = this.valoresY.slice();
		
		// Desenha os pontos na tela
		for (var i = 0; i <this.valoresX.length; i++) {
			if (plotY[i] >= this.limMinY && plotY[i] <= this.limMaxY) {
				// Ajusta a escala
				plotX[i] = plotX[i] * this.fex + this.zeroX;
				plotY[i] = this.zeroY - plotY[i] * this.fey;
				// Realiza o desenho em si
				des.beginPath();
				des.arc(plotX[i], plotY[i], 3, 0, 2 * Math.PI);
				des.fill();
				des.closePath();
			}
		}
	}
}

// Funções auxiliares
function maiorValor(array) {
	var maior = 0;
	for(var i = 0; i < array.length; i++) {
		if(array[i] > maior)
			maior = array[i];
	}
	return maior;
}

function menorValor(array) {
	var menor = 0;
	for(var i = 0; i < array.length; i++) {
		if(array[i] < menor)
			menor = array[i];
	}
	return menor;
}

// Faz o arredondamento de um número
function arredonda(num, casas) {
	var str = num.toFixed(casas);
	return parseFloat(str);
}

// Função para converter o separador decimal pelo padrão brasileiro
function padraoDecimal(num) {
	var str = num.toString();
	str = str.replace(".", ",");
	return str;
}