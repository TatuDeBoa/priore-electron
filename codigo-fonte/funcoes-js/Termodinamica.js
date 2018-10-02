// As unidades desta classe são as do sistema internacional, salvo em situações comentadas
// Temperatura: Kelvin (K)
// Pressão: Pascal (Pa)

/* ---------------------------------------------------------------------------------------------------------- */
/* ------------------- BLOCO COM FUNÇÕES RELACIONADAS AO CÁLCULO COM A EQUAÇÃO DE ANTOINE ------------------- */
/* ---------------------------------------------------------------------------------------------------------- */
// ln(Psat) = A - B / (C + T)
// Pressão em kPa e Temperatura em °C

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
			for(var i = 0; i < linhas.length; i++) {
				dados[i] = linhas[i].split("/");
			}
		}
	});
}
function lerSubstanciasCadastradasAntoine(dados) {
	$.ajax({
		url: "funcoes-js/dados-antoine.txt",
		async: false,
		cache: false,
		dataType: "text",
		success: function(data) {
			var linhas = data.split("\n");
			for(var i = 0; i < linhas.length; i++) {
				dados.push(linhas[i].split("/")[0]);
			}
		}
	});
}

// Classe para armazenar os dados e métodos de cálculo
var Antoine = function() {
	this.dados = [];
	this.substanciasCadastradas = [];
	this.nome;
	this.pressao;
	this.temperatura;
}

// Métodos de acesso às características da classe
Antoine.prototype.acessarCadastradas = function() {
	return this.substanciasCadastradas;
}

// Método para carregar os dados a partir dos arquivos
Antoine.prototype.carregarDados = function() {
	this.dados = [];
	this.substanciasCadastradas = [];
	lerDadosAntoine(this.dados);
	lerSubstanciasCadastradasAntoine(this.substanciasCadastradas);
	for(var i = 0; i < this.dados.length; i++) {
		for(var j = 3; j < this.dados[i].length; j++) {
			this.dados[i][j] = parseFloat(this.dados[i][j]);
		}
	}
}

// Métodos de definição de atributos
Antoine.prototype.definirComponente = function(nome) {
	var contem = false;
	for(var i = 0; i < this.dados.length; i++) {
		if(this.dados[i][0] == nome) {
			contem = true;
		}
	}
	if(!contem) {
		console.log("Componente não cadastrado, falha na definição.");
		return;
	}
	// Definição
	this.nome = nome;
}
// Unidade de temperatura: Kelvin (K)
Antoine.prototype.definirTemperatura = function(temperatura) {
	if(temperatura <= 0) {
		console.log("Valor inválido para temperatura, falha na definição.");
		return;
	}
	// Definição
	this.temperatura = temperatura;
}
// Unidade de pressão: quilo Pascal(kPa)
Antoine.prototype.definirPressao = function(pressao) {
	if(pressao <= 0) {
		console.log("Valor inválido para pressão, falha na definição.");
		return;
	}
	// Definição
	this.pressao = pressao;
}

// Recebe temperatura em K, o tratamento é feito de acordo com os dados da função de Antoine
// A unidade da pressão retornada pela função é kPa
Antoine.prototype.calcularPressaoSaturacao = function() {
    for(var i = 0; i < this.dados.length; i++) {
        if(this.dados[i][0] == this.nome) {
            if(this.dados[i][2] == "°C") {
                var A = this.dados[i][3];
                var B = this.dados[i][4];
                var C = this.dados[i][5];
				// Converte a temperatura
                return Math.exp(A - B / (this.temperatura - 273.15 + C));
            }
        }
    }
}

// Recebe pressão em kPa, o tratamento é feito de acordo com os dados da função de Antoine
// A unidade da temperatura retornada pela função é Kelvin (K)
Antoine.prototype.calcularTemperaturaSaturacao = function() {
    for(var i = 0; i < this.dados.length; i++) {
        if(this.dados[i][0] == this.nome) {
            if(this.dados[i][1] == "kPa") {
                var A = this.dados[i][3];
                var B = this.dados[i][4];
                var C = this.dados[i][5];
                return B / (A - Math.log(this.pressao)) - C + 273.15;
            }
        }
    }
}

/* ---------------------------------------------------------------------------------------------------------- */
/* ------------------- BLOCO COM FUNÇÕES RELACIONADAS AO CÁLCULO COM A EQUAÇÃO DE ANTOINE ------------------- */
/* ---------------------------------------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------------------------------------------------- */
/* ------------------- BLOCO COM FUNÇÕES RELACIONADAS AO CÁLCULO DA CONSTANTE DE HENRY ADIMENSIONAL ------------------- */
/* -------------------------------------------------------------------------------------------------------------------- */

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
			for(var i = 0; i < linhas.length; i++) {
				dados[i] = linhas[i].split("/");
			}
		}
	});
}

// Classe para armazenar os dados da constante de henry e os métodos de busca
var ConstanteHenry = function() {
	this.dados = [];
	this.temperatura;
	this.pressao;
	this.nome;
}

// Método para carregar os dados de constante de Henry do arquivo
ConstanteHenry.prototype.carregarDados = function() {
	lerDadosConstanteHenry(this.dados);
	for(var i = 1; this.dados.length; i++) {
		for(var j = 2; this.dados[i].length; j++) {
			this.dados[i][j] = parseFloat(this.dados[i][j]);
		}
	}
}

// Método para definir nome do composto, pressão e temperatura
// Unidade de pressão: atm
// Unidade de temperatura: °C°
ConstanteHenry.prototype.definirSistema = function(nome, temperatura, pressao) {
	// Valida se os dados informados podem ser utilizados
	if(temperatura <= -273.15 || pressao <= 0) {
		console.log("Parâmetros informados inválidos, falha na definição.");
		return;
	}
	var contem = false;
	for(var i = 0; i < this.dados.length; i++) {
		if(this.dados[i][0] == nome) {
			contem = true;
		}
	}
	if(!contem) {
		console.log("Substância não contida nos dados cadastrados, falha na definição.");
		return;
	}

	// Faz a definição dos parâmetros
	this.nome = nome;
	this.temperatura = temperatura;
	this.pressao = pressao;
}

// O parâmetro dados é uma matriz cujas linhas são os dados das constantes de Henry para as substâncias cadastradas
// Temperatura e pressão informados estão em °C e atm, respectivamente
ConstanteHenry.prototype.buscarConstanteHenry = function() {
	// Faz o teste de pré-requisitos
	if(this.dados.length == 0) {
		console.log("É preciso fazer o carregamento de dados primeiro, falha no cálculo.");
		return;
	}
	if(this.nome == undefined || this.temperatura == undefined || this.pressao == undefined) {
		console.log("Não foram definidos os parâmetros do sistema, falha no cálculo.");
		return;
	}

	// Realiza os cálculos
	var temp = [0, 10, 20, 30, 40];
	var cteh = [];
	for(var i = 0; i < this.dados.length; i++) {
		if(this.dados[i][0] == this.nome) {
			cteh = [this.dados[i][2], this.dados[i][3], this.dados[i][4], this.dados[i][5], this.dados[i][6]];
			if(this.dados[i][1] == "atm") {
				return interpolacao() / this.pressao;
			}
		}
	}
}

/* -------------------------------------------------------------------------------------------------------------------- */
/* ------------------- BLOCO COM FUNÇÕES RELACIONADAS AO CÁLCULO DA CONSTANTE DE HENRY ADIMENSIONAL ------------------- */
/* -------------------------------------------------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------------------------------- */
/* ------------------- BLOCO COM FUNÇÕES RELACIONADAS AO CÁLCULO DO MÉTODO UNIFAC ------------------- */
/* -------------------------------------------------------------------------------------------------- */

// Esta função recebe um array como parâmetro, que receberá os dados lidos no arquivo
// Cuidado com o local do arquivo
function lerDadosSubGruposUnifac(dados) {
	$.ajax({
		url: "funcoes-js/dados-subgrupos-unifac.txt",
		async: false,
		cache: false,
		dataType: "text",
		success: function(data) {
			var linhas = data.split("\n");
			for(var i = 0; i < linhas.length; i++) {
				dados[i] = linhas[i].split("/");
			}
		}
	});
}
function lerSubstanciasCadastradasUnifac(dados) {
	$.ajax({
		url: "funcoes-js/dados-subgrupos-unifac.txt",
		async: false,
		cache: false,
		dataType: "text",
		success: function(data) {
			var linhas = data.split("\n");
			for(var i = 0; i < linhas.length; i++) {
				var subs = linhas[i].split("/")[0];
				if(subs != "nome" && subs != "R" && subs != "Q")
					dados.push(subs);
			}
		}
	});
}
function lerDadosInteracaoGruposUnifac(dados) {
	$.ajax({
		url: "funcoes-js/dados-interacao-subgrupos-unifac.txt",
		async: false,
		cache: false,
		dataType: "text",
		success: function(data) {
			var linhas = data.split("\n");
			for(var i = 0; i < linhas.length; i++) {
				dados[i] = linhas[i].split("/");
			}
		}
	});
}

var Unifac = function() {
	this.temperatura;
	this.dados = [];
	this.dadosInteracao = [];
	this.componentes = [];
	this.fracoes = [];
	this.gama = [];
	this.substanciasCadastradas = [];
}

// Métodos de acessos à atributos da classe
Unifac.prototype.acessarGama = function() {
	return this.gama;
}

Unifac.prototype.acessarSubstancias = function() {
	return this.componentes;
}

Unifac.prototype.acessarFracoes = function() {
	return this.fracoes;
}

Unifac.prototype.acessarCadastradas = function() {
	return this.substanciasCadastradas;
}

// Método de definição dos dados de todas as substâncias cadastradas, através da leitura do arquivo
Unifac.prototype.carregarDados = function() {
	this.dados = [];
	this.substanciasCadastradas = [];
	lerDadosSubGruposUnifac(this.dados);
	lerSubstanciasCadastradasUnifac(this.substanciasCadastradas);
	for(var i = 1; i < this.dados.length; i++) {
		for(var j = 1; j < this.dados[i].length; j++) {
			this.dados[i][j] = parseFloat(this.dados[i][j]);
		}
	}
}

// Método de definição dos dados de interação dos subgrupos, utilizados no cálculo de alguns parâmetros
// São carregados a partir de um arquivo
Unifac.prototype.carregarDadosDeInteracao = function() {
	lerDadosInteracaoGruposUnifac(this.dadosInteracao);
	for(var i = 0; i < this.dadosInteracao.length; i++) {
		for(var j = 0; j < this.dadosInteracao[i].length; j++) {
			this.dadosInteracao[i][j] = parseFloat(this.dadosInteracao[i][j]);
		}
	}
}

// Método para definição de temperatura, lida em Kelvin (K)
Unifac.prototype.definirTemperatura = function(temperatura) {
	if(temperatura > 0) {
		this.temperatura = temperatura;
	} else {
		console.log("Temperatura inválida, falha na definição.");
	}
}

// Método para definição do sistema de cálculo
// O primeiro parâmetro é um array que contêm as substâncias e o segundo parâmetro é um array com as frações molares
// Fragilidade: não confere se as frações informadas são menores que 1 e o somatório delas é igual a 1
Unifac.prototype.definirSistema = function(substancias, fracoes) {
	if(substancias.length == 0 || fracoes.length == 0) {
		console.log("Parâmetros inválidos, definição falhou.");
	} else if(substancias.length != fracoes.length) {
		console.log("Número de componentes diferente do número de frações, falha na definição.");
	} else {
		this.componentes = substancias.slice();
		this.fracoes = fracoes.slice();
	}
}

// Método de cálculo do coeficiente de atividade
// Engloba todos os passos e realiza as verificações de pré-requisitos
// Ao final altera o atributo gama, com os valores de coeficiente de atividade calculados
Unifac.prototype.calcular = function() {
	// Realiza os testes de pré-requisitos
	if(this.componentes.length == 0 || this.fracoes.length == 0 || this.temperatura == undefined) {
		console.log("O sistema, com componentes, frações e temperatura não foi completamente definido. Cálculo falhou.");
		return;
	}
	if(this.dados.length == 0 || this.dadosInteracao.length == 0) {
		console.log("Os dados relativos aos subgrupos não foram carregados, cálculo falhou.");
		return;
	}

	// Faz a chamada de todos os métodos para calcular o coeficiente de atividade
	var r = this.calcularR();
	var q = this.calcularQ();
	var e = this.calcularE(q);
	var beta = this.calcularBeta(e);
	var tau = this.calcularTeta(q, e);
	var s = this.calcularS(tau);
	var gamaC = this.calcularTermoCombinatorial(r, q);
	var gamaR = this.calcularTermoResidual(q, tau, beta, s, e);
	this.gama = this.calcularCoefAtividade(gamaC, gamaR);
	return this.gama;
}

// Método de cálculo do parâmetro R de cada componente
// Tem como retorno um array com dimensão igual a dimensão do array componentes, atributo da classe
// Precisa de definir o sistema com componentes e frações anteriormente
Unifac.prototype.calcularR = function() {
	// Realiza o cálculo do parâmetro
	var r = [];
	for(var i = 0; i < this.componentes.length; i++) {
		r[i] = 0;
		// Procura a linha que contêm os valores do parâmetro R para cada subgrupo
		for(var j = 0; j < this.dados.length; j++) {
			if(this.dados[j][0] == "R") {
				// Procura a linha que contêm o número de subgrupos do componente i
				for(var k = 0; k < this.dados.length; k++) {
					if(this.dados[k][0] == this.componentes[i]) {
						// Percorre a linha o componente e realiza o cálculo do parâmetro Ri
						for(var l = 1; l < this.dados[k].length; l++) {
							r[i] += this.dados[j][l] * this.dados[k][l];
						}
					}
				}
			}
		}
	}
	return r;
}

// Método de cálculo do parâmetro Q de cada componente
// Tem como retorno um array com dimensão igual a dimensão do array componentes, atributo da classe
// Precisa de definir o sistema com componentes e frações anteriormente
Unifac.prototype.calcularQ = function() {
	// Realiza o cálculo do parâmetro
	var q = [];
	for(var i = 0; i < this.componentes.length; i++) {
		q[i] = 0;
		// Procura a linha que contêm os valores do parâmetro Q para cada subgrupo
		for(var j = 0; j < this.dados.length; j++) {
			if(this.dados[j][0] == "Q") {
				// Procura a linha que contêm o número de subgrupos do componente i
				for(var k = 0; k < this.dados.length; k++) {
					if(this.dados[k][0] == this.componentes[i]) {
						// Percorre a linha do componente e realiza o cálculo do parâmetro Ri
						for(var l = 1; l < this.dados[k].length; l++) {
							q[i] += this.dados[j][l] * this.dados[k][l];
						}
					}
				}
			}
		}
	}
	return q;
}

// Método de cálculo do parâmetro Eij de cada componente
// Tem como retorno uma matriz com dimensão igual a dimensão do array componentes, atributo da classe
// Os arrays dentro da matriz possuem o tamanho do número total de subgrupos cadastrados
// Precisa de definir o sistema com componentes e frações anteriormente e ter realizado o cálculo do parâmetro R
Unifac.prototype.calcularE = function(q) {
	// Realiza o cálculo do parâmetro
	var e = [];
	for(var i = 0; i < this.componentes.length; i++) {
		e[i] = [];
		// Procura a linha com os parâmetros Q para cada subgrupo
		for(var j = 0; j < this.dados.length; j++) {
			if(this.dados[j][0] == "Q") {
				// Procura a linha do componente i
				for(var k = 0; k < this.dados.length; k++) {
					if(this.dados[k][0] == this.componentes[i]) {
						// Percorre a linha do componente e realiza o cálculo do parâmetro Eij
						for(var l = 1; l < this.dados[k].length; l++) {
							e[i][l - 1] = this.dados[k][l] * this.dados[j][l] / q[i]
						}
					}
				}
			}
		}
	}
	return e;
}

// Método para calcular o parâmetro Bij
// Tem como retorno uma matriz com dimensão igual a dimensão do array componentes, atributo da classe
// Precisa de definir o sistema com componentes, frações e temperatura anteriormente e ter realizado o cálculo do parâmetro Eij
Unifac.prototype.calcularBeta = function(e) {
	var beta = [];
	// Percorre os componentes do sistema
	for(var i = 0; i < this.componentes.length; i++) {
		beta[i] = [];
		// Percorre a matriz de interação, fixando um subgrupo j
		for(var j = 0; j < this.dadosInteracao.length; j++) {
			var soma = 0;
			// Percorre novamente os subgrupos (k é um índice mudo)
			for(var k = 0; k < this.dadosInteracao.length; k++) {
				soma += e[i][k] * this.calcularTau(j, k);
			}
			beta[i][j] = soma;
		}
	}
	return beta;
}

// Método para cálculo do parâmetro Tau, relativo às interações entre os subgrupos
Unifac.prototype.calcularTau = function(j, k) {
	return Math.exp(-1 * this.calcularA(j, k) / this.temperatura);
}

// Método para cálculo do parâmetro A, interação entre subgrupos
Unifac.prototype.calcularA = function(j, k) {
	return this.dadosInteracao[k][j];
}

// Método para cálculo do parâmetro teta
// Tem como retorno um array com dimensão igual a dimensão do array com os subgrupos, ou seja, o número de subgrupos
// Precisa de definir o sistema com componentes e frações anteriormente e ter realizado o cálculo do parâmetro Q e Eij
Unifac.prototype.calcularTeta = function(q, e) {
	var teta = [];
	// Percorre os subgrupos
	for(var i = 0; i < this.dadosInteracao.length; i++) {
		var soma1 = 0;
		var soma2 = 0;
		for(var j = 0; j < this.componentes.length; j++) {
			soma1 += this.fracoes[j] * q[j] * e[j][i];
			soma2 += this.fracoes[j] * q[j];
		}
		teta[i] = soma1 / soma2;
	}
	return teta;
}

// Método para cálculo do parâmetro Sk
// Tem como retorno um array com dimensão igual a dimensão do array com os subgrupos, ou seja, o número de subgrupos
// Precisa de definir o sistema com componentes e frações anteriormente e ter realizado o cálculo do parâmetro teta
Unifac.prototype.calcularS = function(teta) {
	var s = [];
	for(var i = 0; i < this.dadosInteracao.length; i++) {
		var soma = 0;
		for(var j = 0; j < this.dadosInteracao.length; j++) {
			soma += teta[j] * this.calcularTau(i, j);
		}
		s[i] = soma;
	}
	return s;
}

// Método para calcular a parcela combinatorial da expressão uniquac
// Retorna um array com a mesma dimensão do atributo da classe que representa o sistema de componentes
// Requer o cálculo anteriormente dos parâmetros R e Q
Unifac.prototype.calcularTermoCombinatorial = function(r, q) {
	var gamaC = [];
	for(var i = 0; i < this.componentes.length; i++) {
		var J = this.calcularJ(r, i);
		var L = this.calcularL(q, i);
		gamaC[i] = 1 - J + Math.log(J) - 5 * q[i] * (1 - J / L + Math.log(J / L));
	}
	return gamaC;
}

// Método para calcular a parcela residual da expressão uniquac
// Retorna um array com a mesma dimensão do array de componentes do atributo de classe
// Requer o cálculo dos parâmetros Q, Teta, Beta, S e E
Unifac.prototype.calcularTermoResidual = function(q, teta, beta, s, e) {
	var gamaR = [];
	for(var i = 0; i < this.componentes.length; i++) {
		var soma = 0;
		for(var j = 0; j < this.dadosInteracao.length; j++) {
			soma += teta[j] * beta[i][j] / s[j] - e[i][j] * Math.log(beta[i][j] / s[j]);
		}
		gamaR[i] = q[i] * (1 - soma);
	}
	return gamaR;
}

// Método que finaliza o cálculo do coeficiente de atividade
// Retorna um array com a mesma dimensão do array de componentes do atributo de classe
// Requer o cálculo dos termos combinatorial e residual
Unifac.prototype.calcularCoefAtividade = function(gamaC, gamaR) {
	var gama = [];
	for(var i = 0; i < this.componentes.length; i++) {
		gama[i] = Math.exp(gamaC[i] + gamaR[i]);
	}
	return gama;
}

// Método para calcular o parâmetro Ji
// Precisa da definição do sistema, retorna um valor único
Unifac.prototype.calcularJ = function(r, i) {
	var soma = 0;
	for(var j = 0; j < this.componentes.length; j++) {
		soma += this.fracoes[j] * r[j]
	}
	return r[i] / soma;
}

// Método para cálculo do parâmetro Li
// Precisa da definição do sistema, retorna um valor único
Unifac.prototype.calcularL = function(q, i) {
	var soma = 0;
	for(var j = 0; j < this.componentes.length; j++) {
		soma += this.fracoes[j] * q[j];
	}
	return q[i] / soma;
}

/* -------------------------------------------------------------------------------------------------- */
/* ------------------- BLOCO COM FUNÇÕES RELACIONADAS AO CÁLCULO DO MÉTODO UNIFAC ------------------- */
/* -------------------------------------------------------------------------------------------------- */



/* ------------------------------------------------------------------------------------------- */
/* ----------------- BLOCO COM FUNÇÕES DA CLASSE DE EQUILÍBRIO LÍQUIDO-VAPOR ----------------- */
/* ------------------------------------------------------------------------------------------- */

class ELV {
	
	constructor() {
		this.temperatura;
		this.pressao;
		this.componentes = [];
		this.fracoesLiq = [];
		this.fracoesGas = [];
		this.pressaoSat = [];
		this.temperaturaSat = [];
		this.coefAtividade = [];
		this.eqAntoine = new Antoine();
		this.objUnifac = new Unifac();
		this.erro = 0.001; // Erro relativo em porcentagem
		// Carrega os dados das classes auxiliares
		this.eqAntoine.carregarDados();
		this.objUnifac.carregarDados();
		this.objUnifac.carregarDadosDeInteracao();
	}
	
	// Métodos de definição
	definirComponentes(subs) {
		if(subs.length > 1)
			this.componentes = subs.slice();
		else
			console.log("Lista com tamanho não suficiente, falha na definição.");
	}
	definirFracGas(frac) {
		if(frac.length > 1)
			this.fracoesGas = frac.slice();
		else
			console.log("Lista com tamanho não suficiente, falha na definição.");
	}
	definirFracLiq(frac) {
		if(frac.length > 1)
			this.fracoesLiq = frac.slice();
		else
			console.log("Lista com tamanho não suficiente, falha na definição.");
	}
	// Pressão em kPa
	definirPressao(pressao) {
		if(pressao > 0)
			this.pressao = pressao;
		else
			console.log("Valor inválido, falha na definição.");
	}
	// Temperatura em K
	definirTemperatura(temperatura) {
		if(temperatura > 0)
			this.temperatura = temperatura;
		else
			console.log("Valor inválido, falha na definição.");
	}
	definirErro(erro) {
		if(erro > 0 && erro < 100)
			this.erro = erro;
		else
			console.log("Valor inválido, falha na definição.");
	}
	
	// Método para cálculo da pressão de bolha, retorna valor em kPa
	bolp(temperatura, substancias, x) {
		// Definições iniciais do processo numérico
		this.definirTemperatura(temperatura);
		this.definirFracLiq(x);
		this.definirComponentes(substancias);
		this.objUnifac.definirTemperatura(temperatura);
		this.objUnifac.definirSistema(substancias, x);
		// Determinar pressão de saturação para os componentes
		for (var i = 0; i < substancias.length; i++) {
			this.eqAntoine.definirTemperatura(temperatura);
			this.eqAntoine.definirComponente(this.componentes[i]);
			this.pressaoSat[i] = this.eqAntoine.calcularPressaoSaturacao();
		}
		// Calcula o coeficiente de atividade para os componentes
		this.coefAtividade = this.objUnifac.calcular();
		var soma = 0;
		for (var i = 0; i < this.componentes.length; i++) {
			soma += this.fracoesLiq[i] * this.coefAtividade[i] * this.pressaoSat[i];
		}
		this.pressao = soma;
		// Procedimento iterativo
		var e = 1;
		while (e > this.erro) {
			for (var i = 0; i < this.componentes.length; i++) {
				this.fracoesGas[i] = this.fracoesLiq[i] * this.coefAtividade[i] * this.pressaoSat[i] / this.pressao;
			}
			var soma = 0;
			for (var i = 0; i < this.componentes.length; i++) {
				soma += this.fracoesGas[i] / (this.coefAtividade[i] * this.pressaoSat[i]);
			}
			var p = 1 / soma;
			e = erroRelativo(this.presao, p);
			this.pressao = p;
		}
		return this.pressao;
	}
	
	// Método para cálculo da temperatura de bolha, retorna valor em K
	bolt(pressao, substancias, x) {
		// Definições iniciais sobre o sistema.
		// Instância das classes de cálculo da pressão de saturação
		this.definirPressao(pressao);
		this.definirComponentes(substancias);
		this.definirFracLiq(x);
		// Preparo da estimativa inicial de temperatura, por meio das temperaturas de saturação
		var soma = 0;
		for (var i = 0; i < this.componentes.length; i++) {
			this.eqAntoine.definirComponente(this.componentes[i]);
			this.eqAntoine.definirPressao(pressao);
			this.temperaturaSat[i] = this.eqAntoine.calcularTemperaturaSaturacao();
			soma += this.fracoesLiq[i] * this.temperaturaSat[i];
		}
		this.temperatura = soma;
		// Com temperatura definida, define propriedades da classe unifac
		this.objUnifac.definirTemperatura(this.temperatura);
		this.objUnifac.definirSistema(substancias, x);
		this.coefAtividade = this.objUnifac.calcular();
		for (var i = 0; i < this.componentes.length; i++) {
			this.eqAntoine.definirComponente(this.componentes[i]);
			this.eqAntoine.definirTemperatura(this.temperatura);
			this.pressaoSat[i] = this.eqAntoine.calcularPressaoSaturacao();
		}
		// Determinação de uma variável de iteração
		// Por convenção, o componente de iteração será sempre o primeiro da lista
		var pjsat = this.pressaoSat[0];
		soma = 0;
		for (var i = 0; i < this.componentes.length; i++) {
			soma += this.fracoesLiq[i] * this.coefAtividade[i] * this.pressaoSat[i] / pjsat;
		}
		pjsat = this.pressao / soma;
		// Cálculo de uma nova temperatura
		this.eqAntoine.definirComponente(this.componentes[0]);
		this.eqAntoine.definirPressao(pjsat);
		this.temperatura = this.eqAntoine.calcularTemperaturaSaturacao();
		// Inicia o critério de parada
		var e = 1;
		// Procedimento iterativo
		while (e > this.erro) {
			// Determina novas pressões de saturação
			for (var i = 0; i < this.componentes.length; i++) {
				this.eqAntoine.definirComponente(this.componentes[i]);
				this.eqAntoine.definirTemperatura(this.temperatura);
				this.pressaoSat[i] = this.eqAntoine.calcularPressaoSaturacao();
				this.fracoesGas[i] = this.fracoesLiq[i] * this.coefAtividade[i] * this.pressaoSat[i] / this.pressao;
			}
			// Encontra novos coeficientes de atividade
			this.objUnifac.definirTemperatura(this.temperatura);
			this.coefAtividade = this.objUnifac.calcular();
			// Definir nova pressão de iteração, pela mesma convenção
			pjsat = this.pressaoSat[0];
			soma = 0;
			for (var i = 0; i < this.componentes.length; i++) {
				soma += this.fracoesLiq[i] * this.coefAtividade[i] * this.pressaoSat[i] / pjsat;
			}
			pjsat = this.pressao / soma;
			// Calcula nova temperatura e avalia o critério de parada
			this.eqAntoine.definirComponente(this.componentes[0]);
			this.eqAntoine.definirPressao(pjsat);
			var temp = this.eqAntoine.calcularTemperaturaSaturacao();
			e = erroRelativo(this.temperatura, temp);
			this.temperatura = temp;
		}
		return this.temperatura;
	}
	
	// Método para cálculo da pressão de orvalho, retorna valor em kPa
	orvp(temperatura, substancias, y) {
		// Definições iniciais do cálculo
		this.definirTemperatura(temperatura);
		this.definirComponentes(substancias);
		this.definirFracGas(y);
		// Encontra a pressão
		var soma = 0;
		for (var i = 0; i < this.componentes.length; i++) {
			this.coefAtividade[i] = 1;
			this.eqAntoine.definirComponente(this.componentes[i]);
			this.eqAntoine.definirTemperatura(temperatura);
			this.pressaoSat[i] = this.eqAntoine.calcularPressaoSaturacao();
			soma += this.fracoesGas[i]  / (this.coefAtividade[i] * this.pressaoSat[i]);
		}
		this.pressao = 1 / soma;
		// Calcula as frações de líquido
		for (var i = 0; i < this.componentes.length; i++) {
			this.fracoesLiq[i] = this.fracoesGas[i] * this.pressao / (this.coefAtividade[i] * this.pressaoSat[i]);
		}
		// Com frações definidas, instancia a classe unifac
		this.objUnifac.definirTemperatura(temperatura);
		this.objUnifac.definirSistema(substancias, this.fracoesLiq);
		this.coefAtividade = this.objUnifac.calcular();
		// Inicialização do critério de parada
		var e = 1;
		// Procedimento iterativo
		while (e > this.erro) {
			// Encontra nova pressão
			soma = 0;
			for (var i = 0; i < this.componentes.length; i++) {
				soma += this.fracoesGas[i] / (this.coefAtividade[i] * this.pressaoSat[i]);
			}
			this.pressao = 1 / soma;
			// Itera para novas frações no líquido
			for (var i = 0; i < this.componentes.length; i++) {
				this.fracoesLiq[i] = this.fracoesGas[i] * this.pressao / (this.coefAtividade[i] * this.pressaoSat[i]);
			}
			// Encontra novos coeficientes de atividade
			this.objUnifac.definirSistema(substancias, this.fracoesLiq);
			this.coefAtividade = this.objUnifac.calcular();
			soma = 0;
			for (var i = 0; i < this.componentes.length; i++) {
				soma += this.fracoesGas[i] / (this.coefAtividade[i] * this.pressaoSat[i]);
			}
			// Encontra nova pressão e verifica critério de parada
			var p = 1 / soma;
			e = erroRelativo(this.pressao, p);
			this.pressao = p;
		}
		return this.pressao;
	}
	
	// Método para cálculo da temperatura de orvalho, retorna valor em K
	orvt(pressao, substancias, y) {
		// Definições iniciais sobre o sistema.
		// Instância das classes de cálculo da pressão de saturação
		this.definirPressao(pressao);
		this.definirComponentes(substancias);
		this.definirFracGas(y);
		// Inicializa os coeficientes de atividade e estimativa inicial para temperatura
		var soma = 0;
		for (var i = 0; i < this.componentes.length; i++) {
			this.coefAtividade[i] = 1;
			this.eqAntoine.definirComponente(this.componentes[i]);
			this.eqAntoine.definirPressao(this.pressao);
			this.temperaturaSat[i] = this.eqAntoine.calcularTemperaturaSaturacao();
			soma += this.fracoesGas[i] * this.temperaturaSat[i];
		}
		this.temperatura = soma;
		for (var i = 0; i < this.componentes.length; i++) {
			this.eqAntoine.definirComponente(this.componentes[i]);
			this.eqAntoine.definirTemperatura(this.temperatura);
			this.pressaoSat[i] = this.eqAntoine.calcularPressaoSaturacao();
		}
		// Define pressão de iteração, utilizando como converção a primeira substância da lista
		var pjsat = this.pressaoSat[0];
		soma = 0;
		for (var i = 0; i < this.componentes.length; i++) {
			soma += this.fracoesGas[i] * pjsat / (this.coefAtividade[i] * this.pressaoSat[i]);
		}
		pjsat = this.pressao * soma;
		// Calcula nova temperatura
		this.eqAntoine.definirComponente(this.componentes[0]);
		this.eqAntoine.definirPressao(pjsat);
		this.temperatura = this.eqAntoine.calcularTemperaturaSaturacao();
		// Determina novas pressões de saturação
		for (var i = 0; i < this.componentes.length; i++) {
			this.eqAntoine.definirComponente(this.componentes[i]);
			this.eqAntoine.definirTemperatura(this.temperatura);
			this.pressaoSat[i] = this.eqAntoine.calcularPressaoSaturacao();
			this.fracoesLiq[i] = this.fracoesGas[i] * this.pressao / (this.coefAtividade[i] * this.pressaoSat[i]);
		}
		// Com temperatura definida, instância da classe de cálculo de coeficiente de atividade
		this.objUnifac.definirTemperatura(this.temperatura);
		this.objUnifac.definirSistema(substancias, this.fracoesLiq);
		this.coefAtividade = this.objUnifac.calcular();
		// Calcular nova pressão de iteração, segundo a mesma convenção
		soma = 0;
		pjsat = this.pressaoSat[0];
		for (var i = 0; i < this.componentes.length; i++) {
			soma += this.fracoesGas[i] * pjsat / (this.coefAtividade[i] * this.pressaoSat[i]);
		}
		pjsat = this.pressao * soma;
		// Inicializa o critério de parada e encontra nova temperatura
		this.eqAntoine.definirComponente(this.componentes[0]);
		this.eqAntoine.definirPressao(pjsat);
		this.temperatura = this.eqAntoine.calcularTemperaturaSaturacao();
		var e = 1;
		// Procedimento iterativo
		while (e > this.erro) {
			// Encontra novas pressões de saturação
			for (var i = 0; i < this.componentes.length; i++) {
				this.eqAntoine.definirComponente(this.componentes[i]);
				this.eqAntoine.definirTemperatura(this.temperatura);
				this.pressaoSat[i] = this.eqAntoine.calcularPressaoSaturacao();
				this.fracoesLiq[i] = this.fracoesGas[i] * this.pressao / (this.coefAtividade[i] * this.pressaoSat[i]);
			}
			// Calcula novos coeficientes de atividade
			this.objUnifac.definirSistema(this.componentes, this.fracoesLiq);
			this.objUnifac.definirTemperatura(this.temperatura);
			this.coefAtividade = this.objUnifac.calcular();
			// Calcula nova pressão de iteração, segundo a mesma convenção
			pjsat = this.pressaoSat[0];
			soma = 0;
			for (var i = 0; i < this.componentes.length; i++) {
				soma += this.fracoesGas[i] * pjsat / (this.coefAtividade[i] * this.pressaoSat[i]);
			}
			pjsat = this.pressao * soma;
			// Calcula nova temperatura e avalia critério de parada
			this.eqAntoine.definirComponente(this.componentes[0]);
			this.eqAntoine.definirPressao(pjsat);
			var temp = this.eqAntoine.calcularTemperaturaSaturacao();
			e = erroRelativo(this.temperatura, temp);
			this.temperatura = temp;
		}
		return this.temperatura;
	}
	
	// Método de cálculo do alfa para um sistema binário
	// alfa = (y1/x1)/(y2/x2)
	alfaBinario(temperatura, substancias, x) {
		// Definições iniciais do processo
		this.definirTemperatura(temperatura);
		this.definirFracLiq(x);
		this.definirComponentes(substancias);
		this.objUnifac.definirTemperatura(temperatura);
		this.objUnifac.definirSistema(substancias, x);
		// Calcula os coeficientes de atividade
		this.coefAtividade = this.objUnifac.calcular();
		// Calcula a pressão de saturação dos componentes
		for (var i = 0; i < substancias.length; i++) {
			this.eqAntoine.definirTemperatura(temperatura);
			this.eqAntoine.definirComponente(this.componentes[i]);
			this.pressaoSat[i] = this.eqAntoine.calcularPressaoSaturacao();
		}
		return this.coefAtividade[0] * this.pressaoSat[0] / (this.coefAtividade[1] * this.pressaoSat[1]);
	}
	
}

/* ------------------------------------------------------------------------------------------- */
/* ----------------- BLOCO COM FUNÇÕES DA CLASSE DE EQUILÍBRIO LÍQUIDO-VAPOR ----------------- */
/* ------------------------------------------------------------------------------------------- */
