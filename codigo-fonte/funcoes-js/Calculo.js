// Classe estática com retornos simples
class Calculo {

	// Método para cálculo de integração numérica de valores de Y em função de valores X, pela regra dos trapézios.
	// Parte do princípio de que as listas estão ordenadas no intervalo de integração
	static integrartrap(valoresX, valoresY) {
		if(valoresX.length != valoresY.length) {
			console.log("Lista com tamanhos diferentes, falha no cálculo");
			return;
		}
		if(valoresX.length < 2) {
			console.log("Não existem pontos suficientes para integração, falha no cálculo");
			return;
		}
		var soma = 0;
		for(var i = 0; i < valoresX.length - 1; i++) {
			soma += (valoresX[i + 1] - valoresX[i]) * (valoresY[i] + valoresY[i + 1]) / 2;
		}
		return soma;
	}

	// Método para cálculo de integração numérica de valores de Y em função de valores X, pela regra 1/3 de Simpson.
	// Parte do princípio de que as listas estão ordenadas no intervalo de integração
	static integrar3simpson(valoresX, valoresY) {
		if(valoresX.length != valoresY.length) {
			console.log("Listas com tamanhos diferentes, falha no cálculo");
			return;
		}
		if(valoresX.length < 3) {
			console.log("Não existem pontos suficientes para integração, falha no cálculo");
			return;
		}
		if(valoresX.length % 2 == 0) {
			console.log("Para realizar a integração pelo método 1/3 de Simpson é preciso que a quantidade de pontos seja ímpar.");
			return;
		}
		var soma = 0;
		for(var i = 0; i < valoresX.length - 2; i += 2) {
			var h1 = valoresX[i + 1] - valoresX[i];
			var h2 = valoresX[i + 2] - valoresX[i + 1];
			if(Math.abs(h1 - h2) / h1 > 0.01) {
				console.log("Erro, os subintervalos não são iguais.");
				return;
			}
			soma += (valoresX[i + 2] - valoresX[i]) * (valoresY[i] + 4 * valoresY[i + 1] + valoresY[i + 2]) / 6;
		}
		return soma;
	}

	// Método para cálculo de integração numérica de valores de Y em função de valores X, pela regra 3/8 de Simpson.
	// Parte do princípio de que as listas estão ordenadas no intervalo de integração
	static integrar8simpson(valoresX, valoresY) {
		if(valoresX.length != valoresY.length) {
			console.log("Listas com tamanhos diferentes, falha no cálculo");
			return;
		}
		if(valoresX.length < 4) {
			console.log("Não existem pontos suficientes para integração, falha no cálculo");
			return;
		}
		if((valoresX.length - 1) % 3 != 0) {
			console.log("Para realizar a integração pelo método 3/8 de Simpson é preciso que a quantidade subintervalos seja múltiplo de 3.");
			return;
		}
		var soma = 0;
		for(var i = 0; i < valoresX.length - 3; i += 3) {
			var h1 = valoresX[i + 1] - valoresX[i];
			var h2 = valoresX[i + 2] - valoresX[i + 1];
			var h3 = valoresX[i + 3] - valoresX[i + 2];
			if(Math.abs(h1 - h2) / h1 > 0.01 || Math.abs(h2 - h3) / h2 > 0.01) {
				console.log("Erro, os subintervalos não são iguais.");
				return;
			}
			soma += (valoresX[i + 3] - valoresX[i]) * (valoresY[i] + 3 * valoresY[i + 1] + 3 * valoresY[i + 2] + valoresY[i + 3]) / 8;
		}
		return soma;
	}

	// Método para soma de matrizes
	// Retorna uma matriz, sem alterar os valores das matrizes informadas
	static mtzsomar(matriz1, matriz2) {
		// Verifica se as matrizes são de mesma dimensão
		if(matriz1.length != matriz2.length) {
			console.log("Erro, matrizes de dimensões diferentes.");
			return;
		}
		for(var i = 0; i < matriz1.length; i++) {
			if(matriz1[i].length != matriz2[i].length) {
				console.log("Erro, matrizes de dimensões diferentes.");
				return;
			}
		}

		// Executa cálculos
		var matriz = [];
		for(var i = 0; i < matriz1.length; i++) {
			matriz[i] = [];
			for(var j = 0; j < matriz1[i].length; j++) {
				matriz[i][j] = matriz1[i][j] + matriz2[i][j];
			}
		}
		return matriz;
	}

	// Método para multiplicação de matriz por escalar
	// Copia a matriz original e não altera o valor da mesma ao final;
	static mtzmultiescalar(matriz, escalar) {
		var mtz = [];
		for(var i = 0; i < matriz.length; i++) {
			mtz[i] = matriz[i].slice();
			for(var j = 0; j < mtz[i].length; j++) {
				mtz[i][j] = escalar * mtz[i][j];
			}
		}
		return mtz;
	}

	// Método para transposição de matrizes
	// Retorna a transposta da matriz, com cópia dos valores da matriz informada
	// Não faz teste de validação do argumento
	static mtztranspor(matriz) {
		// Transposição
		var mtz = [];
		var nlinhas = matriz.length;
		var ncolunas = matriz[0].length;
		for(var i = 0; i < ncolunas; i++) {
			mtz[i] = [];
			for(var j = 0; j < nlinhas; j++) {
				mtz[i][j] = matriz[j][i];
			}
		}
		return mtz;
	}

	// Método de inversão de matrizes
	// Não modifica a matriz original, porém ocupa mais espaço de memória para fazer a cópia dos dados
	static mtzinverter(matriz) {
		// Testa se é uma matriz quadrada
		for(var i = 0; i < matriz.length; i++) {
			if(matriz.length != matriz[i].length) {
				console.log("Matriz não quadrada, inversão não executada.");
				return;
			}
		}
		// Cria matriz identidade e copia a matriz original para evitar a alteração do objeto original
		var mtz = [];
		var ident = [];
		var n = matriz.length;
		for(var i = 0; i < n; i++) {
			ident[i] = [];
			mtz[i] = [];
			for(var j = 0; j < n; j++) {
				if(i == j) ident[i][j] = 1;
				else ident[i][j] = 0;
				mtz[i][j] = matriz[i][j];
			}
		}
		// Inicia inversão pela eliminação de Gauss-Jordan
		for(var i = 0; i < n; i++) {
			var pivot = mtz[i][i];
			for(var j = 0; j < n; j++) {
				mtz[i][j] = mtz[i][j] / pivot;
				ident[i][j] = ident[i][j] / pivot;
			}
			for(var j = 0; j < n; j++) {
				if(j != i) {
					var mult = mtz[j][i];
					for(var k = 0; k < n; k++) {
						mtz[j][k] = mtz[j][k] - mult * mtz[i][k];
						ident[j][k] = ident[j][k] - mult * ident[i][k];
					}
				}
			}
		}
		return ident;
	}

	// Método de multiplicação de matrizes
	// Não modifica as matrizes originais
	static mtzmulti(matriz1, matriz2) {
		// Teste de consistência das matrizes
		for(var i = 0; i < matriz1.length - 1; i++) {
			if(matriz1[i].length != matriz1[i + 1].length) {
				console.log("Linhas da primeira matriz com dimensões diferentes.");
				return;
			}
		}
		for(var i = 0; i < matriz2.length - 1; i++) {
			if(matriz2[i].length != matriz2[i + 1].length) {
				console.log("Linhas da segunda matriz com dimensões diferentes.");
				return;
			}
		}
		if(matriz1[0].length != matriz2.length) {
			console.log("Colunas da primeira diferentes das linhas da segundo, não é possível realizar a multiplicação.");
			return;
		}

		// Cálculo da multiplicação da primeira matriz pela segunda
		var res = [];
		var nlinhas = matriz1.length;
		var ncolunas = matriz2[0].length;
		var nparcelas = matriz1[0].length;
		for(var i = 0; i < nlinhas; i++) {
			res[i] = [];
			for(var j = 0; j < ncolunas; j++) {
				var soma = 0;
				for(var k = 0; k < nparcelas; k++) {
					soma += matriz1[i][k] * matriz2[k][j];
				}
				res[i][j] = soma;
			}
		}
		return res;
	}

	// Método para cálculo do determinante de uma matriz
	static det(matriz) {
		// Teste de compatibilidade da matriz
		for(var i = 0; i < matriz.length; i++) {
			if(matriz[i].length != matriz.length) {
				console.log("O argumento não é uma matriz quadrada, procedimento não realizado.");
				return;
			}
		}
		// Cálculo do determinante
		var det = 1;
		var n = matriz.length;
		var cont = 0;
		for(var i = 0; i < n - 1; i++) {
			if(matriz[i][i] == 0) {
				for(var j = 0; j < n; j++) {
					if(matriz[j][i] != 0) {
						for(var k = 0; k < n; k++) {
							var aux = matriz[i][k];
							matriz[i][k] = matriz[j][k];
							matriz[j][k] = aux;
						}
						j = n;
					}
				}
				cont++;
			} else {
				for(var j = i + 1; j < n; j++) {
					var ft = -1 * matriz[j][i] / matriz[i][i];
					for(var k = 0; k < n; k++) {
						matriz[j][k] = matriz[j][k] + ft * matriz[i][k];
					}
				}
			}
		}
		for(var i = 0; i < n; i++) {
			det *= matriz[i][i];
		}
		return det;
	}

}

// Esta classe utiliza o polinômio interpolador de Newton nos cálculos
class PolinomioInterpolador {

	// Atributos da classe
	constructor() {
		this.valoresX = [];
		this.valoresY = [];
		this.difDiv = [];
		this.coeficientes = [];
		this.stringPolinomio;
	}

	// Métodos para obtenção dos valores armazenados na classe
	acessarString() {
		return this.stringPolinomio;
	}

	// Definição dos valores da função (y) nos pontos (x)
	// Ambos os argumentos são arrays js
	definirValores(x, y) {
		// Faz o teste de validação dos argumentos
		if(x.length < 2 || y.length < 2) {
			console.log("Arrays com tamanhos insuficientes, falha na definição.");
			return;
		}
		if(x.length != y.length) {
			console.log("Arrays com tamanhos diferentes, falha na definição.");
			return;
		}
		// Definição
		this.valoresX = x.slice();
		this.valoresY = y.slice();
	}

	// Método para cálculo dos coeficientes do polinômio, salvando-os na classe juntamente com uma string do polinômio
	montarPolinomio() {
		// Verifica se foram definidos os valores de x e y nos atributos da classe
		if(this.valoresX.length == 0 || this.valoresY.length == 0) {
			console.log("Não foram identificados valores de x e y definidos, falha no cálculo das diferenças divididas.");
			return;
		}

		// Cálculo e definição
		this.calcularDifDiv();
		this.calcularCoeficientes();
		this.estruturarEquacao();
	}

	// Método que pode ser chamado após o montarPolinomio()
	// Recebe como parâmetro um valor x e retorna o valor da função no ponto, via polinômio interpolador
	estimarValorEm(x) {
		// Testa se foram calculados os pré-requistitos do cálculo do polinômio interpolador
		if(this.coeficientes.length == 0) {
			console.log("É preciso montar o polinômio interpolador anter de executar o cálculo, falha na estimativa.");
			return;
		}

		// Cálculo
		var y = this.coeficientes[0];
		for(var i = 1; i < this.coeficientes.length; i++) {
			var produto = 1;
			for(var j = 0; j < i; j++) {
				produto *= (x - this.valoresX[j]);
			}
			y += this.coeficientes[i] * produto;
		}
		return y;
	}

	// Método que pode ser chamado após o montarPolinomio()
	// Recebe como parâmetro um valor x e retorna o valor da derivada da função no ponto dado, via derivação do polinômio interpolador
	estimarDerivadaEm(x) {
		// Testa se foram calculados os pré-requistitos do cálculo do polinômio interpolador
		if(this.coeficientes.length == 0) {
			console.log("É preciso montar o polinômio interpolador anter de executar o cálculo, falha na estimativa.");
			return;
		}

		// Cálculo da derivada
		var derivada = 0;
		for(var i = 1; i < this.coeficientes.length; i++) {
			var produto = 1;
			var soma = 0;
			for(var j = 0; j < i; j++) {
				for(var k = 0; k < i; k++) {
					if(k != j) {
						produto *= (x - this.valoresX[k]);
					}
				}
				soma += produto;
				produto = 1;
			}
			derivada += this.coeficientes[i] * soma;
		}
		return derivada;
	}

	// Os demais métodos da classe são auxiliares aos métodos anteriores
	calcularDifDiv() {
		// Inicia o cálculo com a definição trivial: diferença dividida de ordem zero
		this.difDiv[0] = this.valoresY.slice();
		// Percorre a quantidade de pontos, que é a dimensão do array de diferenças divididas
		for(var i = 1; i < this.valoresX.length; i++) {
			this.difDiv[i] = [];
			// Definição recorrente para diferenças divididas
			for(var j = 0; j < this.difDiv[i - 1].length - 1; j++) {
				this.difDiv[i].push((this.difDiv[i - 1][j + 1] - this.difDiv[i - 1][j]) / (this.valoresX[i + j] - this.valoresX[j]));
			}
		}
	}

	calcularCoeficientes() {
		for(var i = 0; i < this.difDiv.length; i++) {
			this.coeficientes[i] = this.difDiv[i][0];
		}
	}

	estruturarEquacao() {
		this.stringPolinomio = "" + this.coeficientes[0].toString().replace(".", ",");
		for(var i = 1; i < this.coeficientes.length; i++) {
			var str = "";
			for(var j = 0; j < i; j++) {
				str += "(x-(" + this.valoresX[j].toString().replace(".", ",") + "))";
			}
			this.stringPolinomio += "+" + this.coeficientes[i].toString().replace(".", ",") + str;
		}
	}

}

// Classe que pode ser utilizada para regressão linear e regressão linear múltipla
// Forma padrão: y = a0 + a1*x1 + a2*x2 + ...
// TODO: implementar regressão não linear com alguns modelos
class Regressor {

	constructor() {
		// Atributos da classe
		this.x = [];
		this.y = [];
		this.residuos = [];
		this.sqreg;
		this.sqres;
		this.estimadores = [];
		this.intervalo = [];
		this.tipo;
		this.r2;
	}

	// Define os valores para regressão
	// O argumento y é sempre um array, porém x pode ser um array simples no caso da regressão linear, ou uma matria no caso da
	// regressão linear múltipla
	definirValores(x, y) {
		// Testes de validação dos argumentos
		if(x.length == 0 || y.length == 0) {
			console.log("Não é possível iniciar os atributos com arrays vazios, falha na definição.");
			return;
		}
		if(x.length != y.length) {
			console.log("O tamanho do array com valores das variáveis é diferente do tamanho do array com as respostas, falha na definição.");
			return;
		}

		// Definição, com cópia dos valores
		if(typeof(x[0]) == "object") {
			// Trata-se de uma matriz, então é preciso copiar cada array
			for(var i = 0; i < x.length; i++) {
				this.x[i] = x[i].slice();
				this.y[i] = [y[i]];
			}
		} else {
			// Apenas um array de x, regressão linear
			this.x = x.slice();
			this.y = y.slice();
		}
	}

	// Métodos para acesso de valores na classe
	acessarEstimadores() {
		return this.estimadores;
	}

	acessarR2() {
		return this.r2;
	}

	acessarResiduos() {
		return this.residuos;
	}

	acessarIntervalo() {
		return this.intervalo;
	}

	// Método de regressão linear
	// Não possui retorno, altera os valores dos atributos da classe
	reglin() {
		// Testa se foram inicializados os atributos da classe
		if(this.x.length == 0 || this.y.length == 0) {
			console.log("Não foram inicializados os valores de x e y na classe, falha no cálculo.");
			return;
		}

		// Cálculo dos estimadores do modelo
		var carl = this.spd(this.x, this.y) / this.sqd(this.x);
		var clrl = this.media(this.y) - carl * this.media(this.x);
		this.estimadores = [clrl, carl];
		// Cálculo da soma dos quadrados da regressão e da soma dos quadrados dos resíduos
		var media = this.media(this.y);
		var soma1 = 0;
		var soma2 = 0;
		for(var i = 0; i < this.y.length; i++) {
			var yest = this.estimadores[0] + this.estimadores[1] * this.x[i];
			this.residuos[i] = this.y[i] - yest;
			soma1 += Math.pow(this.residuos[i], 2);
			soma2 += Math.pow(yest - media, 2);
		}
		this.sqres = soma1;
		this.sqreg = soma2;
		// Cálculo do coeficiente de determinação
		this.r2 = this.sqreg / (this.sqreg + this.sqres);
		// Cálculo da variância
		var variancia = this.sqres / (this.y.length - 2);
		// Cálculo do erro padrão dos estimadores
		this.intervalo[0] = Math.sqrt(variancia * (1 / this.y.length + Math.pow(this.media(this.x), 2) / this.sqd(this.x)));
		this.intervalo[1] = Math.sqrt(variancia / this.sqd(this.x));
	}

	// Método da regressão linear
	// Não possui retorno, altera valores dos atributos da classe
	reglm() {
		// Testa se foram inicializados os atributos da classe
		if(this.x.length == 0 || this.y.length == 0) {
			console.log("Não foram inicializados os valores de x e y na classe, falha no cálculo.");
			return;
		}

		// Cálculo dos estimadores da regressão linear múltipla
		for(var i = 0; i < this.x.length; i++) {
			this.x[i].unshift(1);
		}
		var xtransposta = Calculo.mtztranspor(this.x);
		var xinversa = Calculo.mtzinverter(Calculo.mtzmulti(xtransposta, this.x));
		this.estimadores = Calculo.mtzmulti(Calculo.mtzmulti(xinversa, xtransposta), this.y);

		// Cálculo da soma dos quadrados da regressão e dos resíduos
		var y = [];
		for(var i = 0; i < this.y.length; i++) {
			y[i] = this.y[i][0];
		}
		var media = this.media(y);
		var soma1 = 0;
		var soma2 = 0;
		for(var i = 0; i < y.length; i++) {
			var yest = 0;
			for(var j = 0; j < this.x[i].length; j++) {
				yest += this.x[i][j] * this.estimadores[j];
			}
			this.residuos[i] = y[i] - yest;
			soma1 += Math.pow(this.residuos[i], 2);
			soma2 += Math.pow(yest - media, 2);
		}
		this.sqres = soma1;
		this.sqreg = soma2;
		// Cálculo da variância
		var variancia = soma1 / (y.length - this.x[0].length);
		// Cálculo do erro padrão dos estimadores
		for(var i = 0; i < this.estimadores.length; i++) {
			this.intervalo[i] = Math.sqrt(variancia * xinversa[i][i]);
		}
		// Cálculo do coeficiente de determinação da regressão
		this.r2 = this.sqreg / (this.sqreg + this.sqres);
	}

	// Os seguintes métodos são auxiliares no cálculo da regressão
	// Método para cálculo da média
	media(array) {
		var tamanho = array.length;
		var somatorio = 0
		for(var i = 0; i < tamanho; i++) {
			somatorio += array[i];
		}
		return somatorio / tamanho;
	}

	// Método para cálculo da soma dos quadrados dos desvios em relação a média
	sqd(array) {
		var tamanho = array.length;
		var somatorioX = 0;
		var somatorioXX = 0;
		for(var i = 0; i < tamanho; i++) {
			somatorioX += array[i];
			somatorioXX += Math.pow(array[i], 2);
		}
		return somatorioXX - somatorioX * somatorioX / tamanho;
	}

	// Método para cálculo da soma dos quadrados dos produtos dos desvios
	spd(arrayX, arrayY) {
		var tamanho = arrayX.length;
		var somatorioX = 0;
		var somatorioY = 0;
		var somatorioXY = 0;
		for(var i = 0; i < tamanho; i++) {
			somatorioX += arrayX[i];
			somatorioY += arrayY[i];
			somatorioXY += arrayX[i] * arrayY[i];
		}
		return somatorioXY - somatorioX * somatorioY / tamanho;
	}

}
