// Todas as funções da classe trabalham no SI, para melhor uso há o arquivo conversor.js capaz de realizar várias conversões
// A melhor forma de tratar esse caso é no nível de interface, pelo menos por enquanto
//TODO: verificar carregamento de temperaturas com teste negativo para °C

/* -------------------------------------------------------------------------------- */
/* ----------------- Início da Classe de Ciclones e Hidrociclones ----------------- */
/* -------------------------------------------------------------------------------- */

var Ciclones = function() {
	this.eficiencia;
	this.diametroCilindro;
	this.tipo;
	this.tipoConfiguracao;
	this.fracaoVolumetrica;
	this.vazaoEntrada;
	this.rhoFluido;
	this.viscosidade;
	this.rhoParticula;
	this.diametroDeCorte;
	this.modeloDTP;
	this.parametroA;
	this.parametroB;
	this.configuracoes = ["LAPPLE", "STAIRMAND", "RIETEMA", "BRADLEY"];
	this.faixas = [[5, 20], [10, 30], [5000, 50000], [3000, 20000]];
	this.relacoes = [0.125, 0.1, 0.2, 0.11]; // Diâmetro e área de alimentação para ciclone, razão de fluido para hidrociclone
	this.valoresK = [0.095, 0.041, 0.039, 0.016];
	this.valoresFi = [0, 0, 1.73, 1.73];
	this.valoresZeta = [0, 0, 145, 55.3];
	this.valoresPsi = [0, 0, 4.75, 2.63];
	this.valoresEuler = [315, 400, 1200, 7500];
	this.numeroCiclones;
	this.velocidade;
}

// Método de definição do tipo de equipamento, ciclone ou hidrociclone
Ciclones.prototype.definirTipo = function(tipo) {
	tipo = tipo.toUpperCase();
	if (tipo != "CICLONE" && tipo != "HIDROCICLONE") {
		console.log("Tipo de equipamento não cadastrado, definição falhou.");
	} else {
		this.tipo = tipo;
	}
}

// Médoto para definição da vazão de alimentação do sistema
Ciclones.prototype.definirVazao = function(vazao) {
	if (vazao > 0) {
		this.vazaoEntrada = vazao;
	} else {
		console.log("Definição falhou.");
	}
}

// Método para definição das características do sistema
Ciclones.prototype.definirSistema = function(rhoParticula, viscosidade, rhoFluido, fracaoVolumetrica) {
	this.viscosidade = viscosidade;
	this.rhoFluido = rhoFluido;
	this.rhoParticula = rhoParticula;
	this.fracaoVolumetrica = fracaoVolumetrica;
}

// Método para escolher o tipo de configuração do equipamento
Ciclones.prototype.definirConfiguracao = function(configuracao) {
	var indc = this.configuracoes.indexOf(configuracao.toUpperCase());
	if (indc != -1) {
		this.tipoConfiguracao = indc;
	} else {
		console.log("Configuração não cadastrada, definição falhou.");
	}
}

// Método de definição de eficiência total de recolhimento dos sólidos no fundo
Ciclones.prototype.definirEficiencia = function(eficiencia) {
	if (eficiencia <= 0 || eficiencia >= 100) {
		console.log("Eficiência sem significado, definição falhou.");
	} else {
		this.eficiencia = eficiencia;
	}
}

// Método de definição de diâmetro de corte
Ciclones.prototype.definirDiametroDeCorte = function(diametro) {
	if (diametro > 0) {
		this.diametroDeCorte = diametro;
	} else {
		console.log("Diâmetro informado inválido, definição falhou.");
	}
}

// Método de definição do diâmetro da parte cilíndrica
Ciclones.prototype.definirDiametroCilindro = function(diametro) {
	if (diametro > 0) {
		this.diametroCilindro = diametro;
	} else {
		console.log("Diâmetro informado inválido, definição falhou.");
	}
}

// Método de definição do número de ciclones
Ciclones.prototype.definirNumeroCiclones = function(numero) {
	if (numero > 0) {
		this.numeroCiclones = numero;
	} else {
		console.log("Número de ciclones inválido, definição falhou.");
	}
}

// Método de definição do modelo de DTP, junto com os parâmetros
Ciclones.prototype.definirModelo = function(modelo, a, b) {
	modelo = modelo.toLowerCase();
	if (modelo != "ggs" && modelo != "rrb" && modelo != "sigmoide") {
		console.log("Modelo não cadastrado, definição falhou.");
	} else if (a <= 0 || b <= 0) {
		console.log("Parâmetros com valores sem significado, definição falhou.");
	} else {
		this.modeloDTP = modelo;
		this.parametroA = a;
		this.parametroB = b;
	}
}

// TODO: rever equaçõs de cálculo do parâmetro beta
// Este método é o dimensionamento de ciclones para remover uma certa porcentagem de partículas sólidas (eficiência)
// É preciso utilizar os métodos de definição (set): da vazão total alimentada, do tipo de equipamento, do tipo de configuração do equipamento,
// do modelo de distribuição granulométrica, das características do sistema e da eficiência total desejada
// Ao final, este método altera os atributos número de ciclones, diâmetro de corte, velocidade e diâmetro da seção circular
Ciclones.prototype.dimensionarPorEficiencia = function() {
	if (this.tipo == "CICLONE") {
		// Calcula diâmetro de corte pela rotina numérica interna
		this.diametroDeCorte = this.cdc();
		// Calcula e busca parâmetros de acordo com a configuração do ciclone
		var K = this.valoresK[this.tipoConfiguracao];
		var beta = 1 / Math.pow((4.8 * Math.pow(1 - this.fracaoVolumetrica, 2) - 3.8 * (1 - this.fracaoVolumetrica)), 0.5);

		// Encontra o diâmetro da parte cilíndrica e a velocidade linear para apenas um ciclone
		this.diametroCilindro = Math.pow((this.vazaoEntrada * Math.pow(this.diametroDeCorte, 2) * (this.rhoParticula - this.rhoFluido) / (K * K * beta * this.viscosidade)), 1 / 3);
		var velocidade = this.vazaoEntrada / (this.relacoes[this.tipoConfiguracao] * Math.pow(this.diametroCilindro, 2));

		// Verifica se a velocidade para apenas um ciclone está dentro da faixa do modelo
		if (velocidade > this.faixas[this.tipoConfiguracao][0] && velocidade < this.faixas[this.tipoConfiguracao][1]) {
			// Com apenas um ciclone se atinge a eficiência desejada e dentro das limitações da configuração escolhida
			this.numeroCiclones = 1;
			this.velocidade = velocidade;
		} else {
			// É preciso utilizar ciclones em paralelo, devido limitações da configuração escolhida
			velocidade = (this.faixas[this.tipoConfiguracao][0] + this.faixas[this.tipoConfiguracao][1]) / 2;
			// Encontra razões para calcular um novo diâmetro da parte cilíndrica
			var razao1 = velocidade * this.relacoes[this.tipoConfiguracao];
			var razao2 = K * K * this.viscosidade / (Math.pow(this.diametroDeCorte, 2) * (this.rhoParticula - this.rhoFluido));
			this.diametroCilindro = razao1 / razao2;

			// Calculo da vazão de cada ciclone em paralelo e a quantidade de ciclones necessários, com arredondação para cima
			var vazaoParalelo = velocidade * this.relacoes[this.tipoConfiguracao] * Math.pow(this.diametroCilindro, 2);
			var numCiclones = this.vazaoEntrada / vazaoParalelo;
			numCiclones = Math.ceil(numCiclones);
			vazaoParalelo = this.vazaoEntrada / numCiclones;
			this.diametroCilindro = Math.pow(vazaoParalelo * (this.rhoParticula - this.rhoFluido) * Math.pow(this.diametroDeCorte, 2) / (K * K * this.viscosidade), 1 / 3);

			// Finaliza o cálculo e armazena os resultados na classe
			this.velocidade = vazaoParalelo / (this.relacoes[this.tipoConfiguracao] * Math.pow(this.diametroCilindro, 2));
			this.numeroCiclones = numCiclones;
		}
	} else if (this.tipo == "HIDROCICLONE") {
		// Calcula os parâmetros necessários
		var rl = this.valoresZeta[this.tipoConfiguracao] * Math.pow(this.relacoes[this.tipoConfiguracao], this.valoresPsi[this.tipoConfiguracao]);
		var K = this.valoresK[this.tipoConfiguracao];
		var alfa = 1 + this.valoresFi[this.tipoConfiguracao] * rl;
		var beta = 1 / Math.pow((4.8 * Math.pow(1 - this.fracaoVolumetrica, 2) - 3.8 * (1 - this.fracaoVolumetrica)), 0.5);
		
		// No caso de hidrociclones a eficiência é afetada pela razão de fluido, a correção é feita a seguir
		var eficiencia = (this.eficiencia - rl) / (1 - rl);
		this.diametroDeCorte = this.cdc();
		this.diametroCilindro = Math.pow(this.vazaoEntrada * (this.rhoParticula - this.rhoFluido) * Math.pow(this.diametroDeCorte, 2) / (K * K * this.viscosidade * Math.pow(alfa, 2) * Math.pow(beta, 2)), 1 / 3);
		var velocidade = 4 * this.vazaoEntrada / (Math.PI * Math.pow(this.diametroCilindro, 2));
		var reynolds = this.rhoFluido * velocidade * this.diametroCilindro / this.viscosidade;
		// Verifica se para um único ciclone os valores estão dentro da faixa de configuração
		if (reynolds > this.faixa[this.tipoConfiguracao][0] && reynolds < this.faixa[this.tipoConfiguracao][1]) {
			// Os parâmetros estão dentro da faixa, retorna o valor para um hidrociclone
			this.numeroCiclones = 1;
			this.velocidade = velocidade;
		} else {
			// Fixa o número de Reynolds no meio da faixa e calcula as novas dimensões
			reynolds = (this.faixa[this.tipoConfiguracao][0] + this.faixa[this.tipoConfiguracao][1]) / 2;
			this.diametroCilindro = Math.pow(reynolds * Math.PI * (this.rhoParticula - this.rhoFluido) * Math.pow(this.diametroDeCorte, 2) / (4 * this.rhoFluido * K * K * Math.pow(alfa, 2) * Math.pow(beta, 2)), 0.5);
			var vazaoParalelo = reynolds * this.viscosidade * Math.PI * this.diametroCilindro / (4 * this.rhoFluido);
			var numCiclones = Math.ceil(this.vazaoEntrada / vazaoParalelo);
			vazaoParalelo = this.vazaoEntrada / numCiclones;
			this.diametroCilindro = Math.pow(vazaoParalelo * (this.rhoParticula - this.rhoFluido) * Math.pow(this.diametroDeCorte, 2) / (K * K * Math.pow(alfa, 2) * Math.pow(beta, 2) * this.viscosidade), 1 / 3);
			
			// Finaliza os cálculos e armazena os resultados na classe
			this.velocidade = 4 * vazaoParalelo / (Math.PI * Math.pow(this.diametroCilindro, 2));
			this.numeroCiclones = numCiclones;
		}
	}
}

// TODO: Testar esse método de cálculo
// Esté método é o dimensionamento de ciclones por meio da definição do diâmetro de corte
Ciclones.prototype.dimensionarPorDiametroDeCorte = function() {
	// Declara parâmetros de cálculo
	var K = this.valoresK[this.tipoConfiguracao];
	var beta = 1 / Math.pow((4.8 * Math.pow(1 - this.fracaoVolumetrica, 2) - 3.8 * (1 - this.fracaoVolumetrica)), 0.5);
	var rl, velocidade, reynolds, limSup, limInf;
	var alfa = 1
	limSup = calculaDiametroMaximo(this.modeloDTP, this.parametroA, this.parametroB);
	limInf = 0
	if (this.tipo == "HIDROCICLONE") {
		rl = this.valoresZeta * Math.pow(this.relacoes[this.tipoConfiguracao], this.valoresPsi);
		alfa =  1 + this.valoresFi * rl;
	}
	this.diametroCilindro = Math.pow(this.vazaoEntrada * (this.rhoParticula - this.rhoFluido) * Math.pow(this.diametroDeCorte, 2) / (K * K * Math.pow(alfa, 2) * Math.pow(beta, 2)), 1 / 3);
	
	// Faz a diferenciação do tipo de equipamento, Ciclone e Hidrociclone
	if (this.tipo == "HIDROCICLONE") {
		this.eficiencia = integralNumerica(this.tipo, this.modeloDTP, limSup, limInf, this.parametroA, this.parametroB, this.diametroDeCorte);
		this.eficiencia = (1 - rl) * this.eficiencia + rl;
		velocidade = 4 * this.vazaoEntrada / (Math.PI * Math.pow(this.diametroCilindro, 2));
		reynolds = this.rhoFluido * velocidade * this.diametroCilindro / this.viscosidade;
		if (reynolds > this.faixas[this.tipoConfiguracao][0] && reynolds < this.faixas[this.tipoConfiguracao][1]) {
			this.numeroCiclones = 1;
			this.velocidade = velocidade;
		} else {
			// Fixar o número de Reynolds na metade da faixa
			reynolds = (this.faixas[this.tipoConfiguracao][0] + this.faixas[this.tipoConfiguracao][1]) / 2;
			this.diametroCilindro = Math.pow(reynolds * Math.PI * (this.rhoParticula - this.rhoFluido) * Math.pow(this.diametroDeCorte, 2) / (4 * this.rhoFluido * K * K * Math.pow(alfa, 2) * Math.pow(beta, 2)), 0.5);
			var vazaoParalelo = reynolds * this.viscosidade * Math.PI * this.diametroCilindro / (4 * this.rhoFluido);
			var numCiclones = Math.ceil(this.vazaoEntrada / vazaoParalelo);
			vazaoParalelo = this.vazaoEntrada / numCiclones;
			this.diametroCilindro = Math.pow(vazaoParalelo * (this.rhoParticula - this.rhoFluido) * Math.pow(this.diametroDeCorte, 2) / (K * K * Math.pow(alfa, 2) * Math.pow(beta, 2) * this.viscosidade), 1 / 3);
			
			// Finaliza os cálculos e armazena os resultados na classe
			this.velocidade = 4 * vazaoParalelo / (Math.PI * Math.pow(this.diametroCilindro, 2));
			this.numeroCiclones = numCiclones;
		}
	} else {
		this.eficiencia = integralNumerica(this.tipo, this.modeloDTP, limSup, limInf, this.parametroA, this.parametroB, this.diametroDeCorte);
		velocidade = this.vazaoEntrada / (this.relacoes[this.tipoConfiguracao] * Math.pow(this.diametroCilindro, 2));
		if (velocidade > this.faixas[this.tipoConfiguracao][0] && velocidade < this.faixas[this.tipoConfiguracao][1]) {
			this.numeroCiclones = 1;
			this.velocidade = velocidade;
		} else {
			// É preciso utilizar ciclones em paralelo, devido limitações da configuração escolhida
			velocidade = (this.faixas[this.tipoConfiguracao][0] + this.faixas[this.tipoConfiguracao][1]) / 2;
			// Encontra razões para calcular um novo diâmetro da parte cilíndrica
			var razao1 = velocidade * this.relacoes[this.tipoConfiguracao];
			var razao2 = K * K * this.viscosidade / (Math.pow(this.diametroDeCorte, 2) * (this.rhoParticula - this.rhoFluido));
			this.diametroCilindro = razao1 / razao2;

			// Calculo da vazão de cada ciclone em paralelo e a quantidade de ciclones necessários, com arredondação para cima
			var vazaoParalelo = velocidade * this.relacoes[this.tipoConfiguracao] * Math.pow(this.diametroCilindro, 2);
			var numCiclones = this.vazaoEntrada / vazaoParalelo;
			numCiclones = Math.ceil(numCiclones);
			vazaoParalelo = this.vazaoEntrada / numCiclones;
			this.diametroCilindro = Math.pow(vazaoParalelo * (this.rhoParticula - this.rhoFluido) * Math.pow(this.diametroDeCorte, 2) / (K * K * this.viscosidade), 1 / 3);

			// Finaliza o cálculo e armazena os resultados na classe
			this.velocidade = vazaoParalelo / (this.relacoes[this.tipoConfiguracao] * Math.pow(this.diametroCilindro, 2));
			this.numeroCiclones = numCiclones;
		}
	}
}

// Método de dimensionamento de avaliação de desempenho
// Os cálculos executados possuem como pré-requisitos os seguintes parâmetros:
// tipo de equipamento, tipo de configuração, vazão total, número de ciclones, definições do sistema, parâmetros DTP e diâmetro cilindro
// Ao final é alterado o atributo eficiência e diâmetro de corte
// TODO: realizar teste
Ciclones.prototype.dimensionarPorDiametroCilindro = function() {
	// Calcula a vazão em cada ciclone
	var vazaoParalelo = this.vazaoEntrada / this.numueroCiclones;
	
	// Parâmetros para cálculo
	var rl, velocidade, reynolds, beta, alfa = 1;
	
	// Trata as diferenças dos limites de operação dos equipamentos
	if (this.tipo == "CICLONE") {
		velocidade = vazaoParalelo / (this.relacoes[this.tipoConfiguracao] * Math.pow(this.diametroCilindro, 2));
		if (velocidade <= this.faixas[this.tipoConfiguracao][0] || velocidade >= this.faixas[this.tipoConfiguracao][1]) {
			console.log("Na configuração dada o equipamento opera fora da faixa de velocidade.");
		}
	}
	if (this.tipo == "HIDROCICLONE") {
		velocidade = 4 * vazaoParalelo / (Math.PI * Math.pow(this.diametroCilindro, 2));
		reynolds = this.rhoFluido * velocidade * this.diametroCilindro / this.viscosidade;
		if (reynolds <= this.faixas[this.tipoConfiguracao][0] || reynolds >= this.faixas[this.tipoConfiguracao][1]) {
			console.log("Na configuração dada o equipamento opera fora da faixa de Reynolds.");
		}
		rl = this.valoresZeta[this.tipoConfiguracao] * Math.pow(this.relacoes[this.tipoConfiguracao], this.valoresPsi[this.tipoConfiguracao]);
		alfa = 1 + this.valoresFi[this.tipoConfiguracao] * rl;
	}
	
	// O parâmetro alfa e beta são utilizados no cálculo do diâmetro de corte
	beta = 1 / Math.pow(4.8 * Math.pow(1 - this.fracaoVolumetrica, 2) - 3.8 * (1 - this.fracaoVolumetrica), 0.5);
	this.diametroDeCorte = this.valoresK[this.tipoConfiguracao] * alfa * beta * Math.pow(this.viscosidade * Math.pow(this.diametroCilindro, 3) / (vazaoParalelo * (this.rhoParticula - rhoFluido)), 2);
	var limSup = calculaDiametroMaximo(this.modelo, this.parametroA, this.parametroB);
	var limInf = 0;
	
	// Finaliza o processo calculando a eficiência, fazendo diferença entre o tipo de equipamento
	this.eficiencia = integralNumerica(this.tipo, this.modelo, limSup, limInf, this.parametroA, this.paramentroB, this.diametroDeCorte);
	if (this.tipo == "HIDROCICLONE") {
		this.eficiencia = (1 - rl) * this.eficiencia + rl
	}
}

// TODO: Verificar o critério de parada
// Método que calcula o diâmetro de corte a partir do modelo de distribuição granulométrica (parâmetros) e eficiência desejada
Ciclones.prototype.cdc = function() {
	// Encontra os limites de integração, oriundos da mudança de variáveis
	var limInf = 0;
	var limSup = calculaDiametroMaximo(this.modeloDTP, this.parametroA, this.parametroB);

	// Estima valores iniciais para limites de diâmetro de corte
	var dMin = 0.1 * limSup;
	var dMax = 0.9 * limSup;
	var eficMax = integralNumerica(this.tipo, this.modeloDTP, limSup, limInf, this.parametroA, this.parametroB, dMin);
	var eficMin = integralNumerica(this.tipo, this.modeloDTP, limSup, limInf, this.parametroA, this.parametroB, dMax);

	// Testa se o valor estimado para o máximo está acima da eficiência desejada, passada como parâmetro
	while (eficMax < this.eficiencia) {
		dMin = dMin / 2;
		eficMax = integralNumerica(this.tipo, this.modeloDTP, limSup, limInf, this.parametroA, this.parametroB, dMin);
	}
	// Testa se o valor estimado para o mínimo está abaixo da eficiência desejada, passada como parâmetro
	while (eficMin > this.eficiencia) {
		dMax = dMax * 1.1;
		eficMin = integralNumerica(this.tipo, this.modeloDTP, limSup, limInf, this.parametroA, this.parametroB, dMax);
	}

	// Inicia o procedimento iterativo, baseado no método dos intervalos para raízes de equações
	var erro = 1;
	var dIteracao; // Diâmetro de iteração
	while (erro > 0.0001) {
		dIteracao = (dMax + dMin) / 2;
		var eficIteracao = integralNumerica(this.tipo, this.modeloDTP, limSup, limInf, this.parametroA, this.parametroB, dIteracao);
		if (eficIteracao < this.eficiencia) {
			eficMin = eficIteracao;
			dMax  = dIteracao;
		} else if (eficIteracao > this.eficiencia) {
			eficMax = eficIteracao;
			dMin = dIteracao;
		} else {
			break;
		}
		erro = Math.abs(this.eficiencia - eficIteracao) * 100 / this.eficiencia;
	}
	return dIteracao;
}

// Função auxiliar para cálculo do diâmetro máximo em uma distribuição granulométrica
function calculaDiametroMaximo(modelo, a, b) {
	var d;
	switch (modelo) {
		case "ggs":
			d = b * Math.pow(0.999, 1 / a);
			break;
		case "rrb":
			d = b * Math.pow(Math.log(1 / (1 - 0.999)), 1 / a);
			break;
		case "sigmoide":
			d = b / Math.pow(1 / 0.999 - 1, 1 / a);
			break;
		default:
			d = 0;
			break;
	}
	return d;
}

// Função auxiliar de rotina numérica
// O parâmetro modelo é uma string; limInf, limSup, a, b e dc são float
function integralNumerica(tipo, modelo, limSup, limInf, a, b, dc) {
	var passos = 400;
	var incremento = (limSup - limInf) / passos;
	var integral = 0;
	switch (modelo) {
		case "ggs":
			for (var i = 0; i < passos; i++) {
				var x1 = limInf + i * incremento;
				var x2 = limInf + (i + 1) * incremento;
				if (tipo == "CICLONE") {
					var y1 = Math.pow(x1 / dc, 2) * a * Math.pow(x1, a - 1) / (Math.pow(b, a) * (1 + Math.pow(x1 / dc, 2)));
					var y2 = Math.pow(x2 / dc, 2) * a * Math.pow(x2, a - 1) / (Math.pow(b, a) * (1 + Math.pow(x2 / dc, 2)));
					integral += (y1 + y2) * incremento / 2;
				}
				if (tipo == "HIDROCICLONE") {
					var y1 = (Math.exp(5 * x1 / dc) - 1) * a * Math.pow(x1, a - 1) / (Math.pow(b, a) * (Math.exp(5 * x1 / dc) + 146));
					var y2 = (Math.exp(5 * x2 / dc) - 1) * a * Math.pow(x2, a - 1) / (Math.pow(b, a) * (Math.exp(5 * x2 / dc) + 146));
					integral += (y1 + y2) * incremento / 2;
				}
			}
			break;
		case "rrb":
			for (var i = 0; i < passos; i++) {
				var x1 = limInf + i * incremento;
				var x2 = limInf + (i + 1) * incremento;
				if (tipo == "CICLONE") {
					var y1 = Math.pow(x1 / dc, 2) * a * Math.pow(x1, a - 1) * Math.exp(-1 * Math.pow(x1 / b, a)) / (Math.pow(b, a) * (1 + Math.pow(x1 / dc, 2)));
					var y2 = Math.pow(x2 / dc, 2) * a * Math.pow(x2, a - 1) * Math.exp(-1 * Math.pow(x2 / b, a)) / (Math.pow(b, a) * (1 + Math.pow(x2 / dc, 2)));
					integral += (y1 + y2) * incremento / 2;
				}
				if (tipo == "HIDROCICLONE") {
					var y1 = (Math.exp(5 * x1 / dc) - 1) * a * Math.pow(x1, a - 1) * Math.exp(-1 * Math.pow(x1 / b, a)) / (Math.pow(b, a) * (Math.exp(5 * x1 / dc) + 146));
					var y2 = (Math.exp(5 * x2 / dc) - 1) * a * Math.pow(x2, a - 1) * Math.exp(-1 * Math.pow(x2 / b, a)) / (Math.pow(b, a) * (Math.exp(5 * x2 / dc) + 146));
					integral += (y1 + y2) * incremento / 2;
				}
			}
			break;
		case "sigmoide":
			for (var i = 1; i < passos; i++) {
				var x1 = limInf + i * incremento;
				var x2 = limInf + (i + 1) * incremento;
				if (tipo == "CICLONE") {
					var y1 = Math.pow(x1 / dc, 2) * a * Math.pow(b, a) / ((1 + Math.pow(x1/ dc, 2)) * Math.pow(x1, a - 1) + Math.pow((1 + Math.pow(b / dc), a), 2));
					var y1 = Math.pow(x2 / dc, 2) * a * Math.pow(b, a) / ((1 + Math.pow(x2/ dc, 2)) * Math.pow(x2, a - 1) + Math.pow((1 + Math.pow(b / dc), a), 2));
					integral += (y1 + y2) * incremento / 2;
				}
				if (tipo == "HIDROCICLONE") {
					var y1 = (Math.exp(5 * x1 / dc) - 1) * a * Math.pow(b, a) / ((Math.exp(5 * x1 / dc) + 146) * Math.pow(x1, a - 1) + Math.pow((1 + Math.pow(b / dc), a), 2));
					var y1 = (Math.exp(5 * x2 / dc) - 1) * a * Math.pow(b, a) / ((Math.exp(5 * x2 / dc) + 146) * Math.pow(x2, a - 1) + Math.pow((1 + Math.pow(b / dc), a), 2));
					integral += (y1 + y2) * incremento / 2;
				}
			}
			break;
		default:
			break;
	}
	console.log(integral);
	return integral;
}

/* -------------------------------------------------------------------------- */
/* ----------------- Fim Classe de Ciclones e Hidrociclones ----------------- */
/* -------------------------------------------------------------------------- */



/* --------------------------------------------------------------------------- */
/* ----------------- Início da Classe de Trocadores de Calor ----------------- */
/* --------------------------------------------------------------------------- */

var TrocadoresDeCalor = function() {
	this.tempEntFrio;
	this.tempEntQuente;
	this.tempSaiFrio;
	this.tempSaiQuente;
	this.tipoFluxo;
	this.difTempMedia;
	this.coefGlobalTC;
	this.efetividade;
	this.nut;
	this.areaDeTroca;
	this.taxa;
	this.tipoConfiguracao;
	this.tipoDimensionamento;
	this.fatorCorrecao = 1;
	this.vazaoFrio;
	this.vazaoQuente;
	this.capacidadeFrio;
	this.capacidadeQuente;
	this.calorLatente;
}

// Método para definições das características dos fluidos
TrocadoresDeCalor.prototype.definirSistema = function(vq, vf, cpq, cpf) {
	if(vq > 0 && vf > 0 && cpq > 0 && cpf > 0) {
		this.vazaoQuente = vq;
		this.vazaoFrio = vf;
		this.capacidadeQuente = cpq;
		this.capacidadeFrio = cpf;
	} else {
		console.log("Valores inválidos para parâmetros, definição falhou.");
	}
}

// Método de definição do tipo de configuração no caso de efetividade
TrocadoresDeCalor.prototype.definirConfiguracao = function(tipo) {
	if(tipo == "paralelo" || tipo == "contracorrente" || tipo == "1-2" || tipo == "czero") {
		this.tipoConfiguracao = tipo;
	} else {
		console.log("Configuração inválida, falha na definição.");
	}
}

// Método de definição de todas as temperaturas
TrocadoresDeCalor.prototype.definirTemperaturas = function(tqe, tfe, tqs, tfs) {
	if (tqe > 0 && tfe > 0 && tqs > 0 && tfs > 0) {
		this.tempEntQuente = tqe;
		this.tempEntFrio = tfe;
		this.tempSaiQuente = tqs;
		this.tempSaiFrio = tfs;
	} else {
		console.log("Temperaturas inválidas, definição falhou.");
	}
}

// Método de definição apenas das temperaturas de entrada
TrocadoresDeCalor.prototype.definirTemperaturasEntrada = function(tqe, tfe) {
	if (tqe > 0 && tfe > 0) {
		this.tempEntQuente = tqe;
		this.tempEntFrio = tfe;
	} else {
		console.log("Temperaturas inválidas, definição falhou.");
	}
}

// Método de definição do tipo de escoamento
TrocadoresDeCalor.prototype.definirEscoamento = function(tipo) {
	tipo = tipo.toLowerCase();
	if (tipo == "contracorrente" || tipo == "paralelo") {
		this.tipoFluxo = tipo;
	} else {
		console.log("Escoamento não cadastrado, definição falhou.");
	}
}

// Método de definição do coeficiente global de transferência de calor
TrocadoresDeCalor.prototype.definirU = function(valor) {
	if (valor > 0) {
		this.coefGlobalTC = valor;
	} else {
		console.log("Valor inválido, definição falhou.");
	}
}

// Método de definição da efetividade
TrocadoresDeCalor.prototype.definirEfetividade = function(valor) {
	if (valor > 0 && valor <= 1) {
		this.efetividade = valor;
	} else {
		console.log("Valor inválido para efetividade, definição falhou.");
	}
}

// Método de definição da área de troca de calor
TrocadoresDeCalor.prototype.definirArea = function(valor) {
	if (valor > 0) {
		this.areaDeTroca = valor;
	} else {
		console.log("Valor inválido para área de troca térmica, definição falhou.");
	}
}

// Método de definição da taxa de transferência de calor
TrocadoresDeCalor.prototype.definirTaxa = function(valor) {
	if (valor > 0) {
		this.taxa = valor;
	} else {
		console.log("Valor inválido para taxa de transferência de calor, definição falhou.");
	}
}

// Método para definição do tipo de resultado do dimensionamento
TrocadoresDeCalor.prototype.definirTipoDimensionamento = function(tipo) {
	tipo = tipo.toLowerCase();
	if (tipo == "coeficiente" || tipo == "taxa" || tipo == "area" || tipo == "temperaturas") {
		this.tipoDimensionamento = tipo;
	} else {
		console.log("Tipo de dimensionamento não cadastrado, definição falhou.");
	}
}

// Método para alteração do fator de correção para configurações com vários passes
// CUIDADO: É preciso fazer a escolha certa do tipo de escomento na interface
// TODO: confirmar a melhor saída para escolha do tipo do fluxo no caso de trocadores múltiplos passes
TrocadoresDeCalor.prototype.definirFatorCorrecao = function(valor) {
	if (valor > 0 && valor <= 1) {
		this.fatorCorrecao = valor;
	} else {
		console.log("Valor inválido para o fator de conrreção, definição falhou.");
	}
}

// Método para definição da área a partir do número de placas e da área das placas
TrocadoresDeCalor.prototype.definirAreaPorPlacas = function(numPlacas, areaPlaca) {
	this.areaDeTroca = areaPlaca * (numPlacas - 2);
}

// Método de cálculo para diferença de temperatura média
// Necessita que sejam informados anteriormente as temperaturas de entrada e saída dos fluidos e tipo de fluxo de escoamento
// Ao final, altera o atributo de diferença de temperatura média (delta T ln)
TrocadoresDeCalor.prototype.calcularDeltaTln = function() {
	var delta1, delta2;
	if (this.tipoFluxo == "contracorrente") {
		delta1 = this.tempEntQuente - this.tempSaiFrio;
		delta2 = this.tempSaiQuente - this.tempEntFrio;
	}
	if (this.tipoFluxo == "paralelo") {
		delta1 = this.tempEntQuente - this.tempEntFrio;
		delta2 = this.tempSaiQuente - this.tempSaiFrio;
	}
	this.difTempMedia = (delta1 - delta2) / Math.log(delta1 / delta2);
}

// Método de cálculo para dimensionar área de um trocador de calor pelo método de diferença de temperatura média logaritimica
// Necessita que sejam informadas as temperaturas de entrada e saída dos fluidos, tipo de escoamento, fator de correção no caso de 
// trocadores de múltiplos passes e de acordo com o tipo de dimensionamento:
// 1) Calcular área: definir coeficiente global de transferência de calor e taxa
// 2) Calcular taxa: definir coeficiente global de transferência de calor e área
// 3) Calcular coeficiente global de transferência de calor: definir taxa e área
// Ao final altera o atributo do dimensionamento
TrocadoresDeCalor.prototype.dimensionarPorDeltaTln = function() {
	// Testa se todos os valores necessários para o dimensionamento estão presentes
	if (this.tipoDimensionamento == undefined || this.fatorCorrecao == undefined || this.tipoFluxo == undefined || this.tempEntFrio == undefined || this.tempEntQuente == undefined || this.tempSaiQuente == undefined || this.tempSaiFrio == undefined) {
		console.log("Existem parâmetros faltando para realizar o cálculo.");
		return;
	}
	// Continua com o tratamento de erros para casos específicos
	switch (this.tipoDimensionamento) {
		case "coeficiente":
			if (this.taxa == undefined || this.areaDeTroca == undefined) {
				console.log("Existem parâmetros faltando para realizar o cálculo.");
				return;
			}
			break;
		case "taxa":
			if (this.coefGlobalTC == undefined || this.areaDeTroca == undefined) {
				console.log("Existem parâmetros faltando para realizar o cálculo.");
				return;
			}
			break;
		case "area":
			if (this.taxa == undefined || this.coefGlobalTC == undefined) {
				console.log("Existem parâmetros faltando para realizar o cálculo.");
				return;
			}
			break;
		default:
			console.log("Dimensionamento não cadastrado.");
			return;
	}
	
	// Calcula a diferença de temperatura média logaritimica
	this.calcularDeltaTln();
	
	// Finaliza o cálculo, de acordo com o tipo de dimensionamento
	switch (this.tipoDimensionamento) {
		case "coeficiente":
			this.coefGlobalTC = this.taxa / (this.areaDeTroca * this.fatorCorrecao * this.difTempMedia);
			break;
		case "taxa":
			this.taxa = this.coefGlobalTC * this.fatorCorrecao * this.areaDeTroca * this.difTempMedia;
			break;
		case "area":
			this.areaDeTroca = this.taxa / (this.coefGlobalTC * this.fatorCorrecao * this.difTempMedia);
			break;
	}
}

// Método para calcular efetividade
// Recebe como parâmetro o numéro de unidades de transferência (NUT) e a razão de capacidade (c)
TrocadoresDeCalor.prototype.calcularEfetividade = function(nut, c) {
	switch (this.tipoConfiguracao) {
		case "paralelo":
			this.efetividade = (1 - Math.exp(-1 * nut * (1 + c))) / (1 + c);
			break;
		case "contracorrente":
			this.efetividade = (1 - Math.exp(-1 * nut * (1 - c))) / (1 - c * Math.exp(-1 * nut * (1 - c)));
			break;
		case "1-2":
			this.efetividade = 2 / (1 + c + Math.sqrt(1 + c * c) * (1 + Math.exp(-1 * nut * Math.sqrt(1 + c * c))) / (1 - Math.exp(-1 * nut * Math.sqrt(1 + c * c))));
			break;
		case "czero":
			this.efetividade = 1 - Math.exp(- 1 * nut);
			break;
	}
}

// Método para calcular o número de unidades de transferência (NUT)
// Recebe como parâmetro a razão de capacidade (c)
TrocadoresDeCalor.prototype.calcularNUT = function(c) {
	switch (this.tipoConfiguracao) {
		case "paralelo":
			return -1 * Math.log(1 - this.efetividade * (1 + c)) / (1 + c);
			break;
		case "contracorrente":
			return Math.log((this.efetividade - 1) / (c * this.efetividade - 1)) / (c - 1);
			break;
		case "1-2":
			return -1 * Math.log((2 / this.efetividade - 1 - c - Math.sqrt(1 + c * c)) / ((2 / this.efetividade - 1 - c + Math.sqrt(1 + c * c)))) / Math.sqrt(1 + c * c);
			break;
		case "czero":
			return -1 * Math.log(1 - this.efetividade);
			break;
	}
}

// Precisa que sejam informadas as temperaturas de entrada e saída do fluido frio, vazão e capacidade calorífica
// A base trabalhada é mássica e não molar
TrocadoresDeCalor.prototype.calcularTaxaPorFluidoFrio = function() {
	this.taxa = this.vazaoFrio * this.capacidadeFrio * (this.tempSaiFrio - this.tempEntFrio);
}

// Precisa que sejam informadas as temperaturas de entrada e saída do fluido quente, vazão e capacidade calorífica
// A base trabalhada é mássica e não molar
TrocadoresDeCalor.prototype.calcularTaxaPorFluidoQuente = function() {
	this.taxa = this.vazaoQuente * this.capacidadeQuente * (this.tempEntQuente - this.tempSaiQuente);
}

// Necessida de definir os atributos: capacidade calorífica do frio, capacidade calorífica do quente, temperaturas de entrada (calcular temperaturas),
// todas as temperaturas (demais dimensionamentos), coeficiente global de transferência de calor, vazão do frio e vazão do quente
TrocadoresDeCalor.prototype.dimensionarPorEfetividade = function() {
	// Estrutura de teste de pré-requisitos
	switch (this.tipoDimensionamento) {
		case "temperaturas":
			if (this.vazaoFrio == undefined || this.vazaoQuente == undefined || this.capacidadeFrio == undefined || this.capacidadeQuente == undefined || this.tempEntFrio == undefined || this.tempEntQuente == undefined || this.coefGlobalTC == undefined || this.areaDeTroca == undefined) {
				console.log("Faltam parâmetros para o dimensionamento.");
				return;
			}
			break;
		case "coeficiente":
			if (this.vazaoFrio == undefined || this.vazaoQuente == undefined || this.capacidadeFrio == undefined || this.capacidadeQuente == undefined || this.tempEntFrio == undefined || this.tempEntQuente == undefined || this.areaDeTroca == undefined || this.taxa == undefined) {
				console.log("Faltam parâmetros para o dimensionamento.");
				return;
			}
			break;
		case "area":
			if (this.vazaoFrio == undefined || this.vazaoQuente == undefined || this.capacidadeFrio == undefined || this.capacidadeQuente == undefined || this.tempEntFrio == undefined || this.tempEntQuente == undefined || this.coefGlobalTC == undefined || this.taxa == undefined) {
				console.log("Faltam parâmetros para o dimensionamento.");
				return;
			}
			break;
		default:
			console.log("Dimensionamento não cadastrado.");
			return;
	}
	
	
	// Calcula parâmetros gerais para o dimensionamento
	var c, taxaMaxima, nut, Cmin;
	var deltaTMax = this.tempEntQuente - this.tempEntFrio;
	var capacitanciaFrio = this.vazaoFrio * this.capacidadeFrio;
	var capacitanciaQuente = this.vazaoQuente * this.capacidadeQuente;
	if (capacitanciaFrio > capacitanciaQuente) {
		Cmin = capacitanciaQuente;
		c = capacitanciaQuente / capacitanciaFrio;
		taxaMaxima = capacitanciaQuente * deltaTMax;
	} else {
		Cmin = capacitanciaFrio;
		c = capacitanciaFrio / capacitanciaQuente;
		taxaMaxima = capacitanciaFrio * deltaTMax;
	}
	
	// Realiza o cálculo de acordo com o tipo de dimensionamento informado
	switch (this.tipoDimensionamento) {
		case "temperaturas":
			nut = this.coefGlobalTC * this.areaDeTroca / Cmin;
			this.calcularEfetividade(nut, c);
			this.taxa = this.efetividade * taxaMaxima;
			this.tempSaiFrio = this.taxa / (this.vazaoFrio * this.capacidadeFrio) + this.tempEntFrio;
			this.tempSaiQuente = this.tempEntQuente - this.taxa / (this.vazaoQuente * this.capacidadeQuente);
			break;
		case "coeficiente":
			this.efetividade = this.taxa / taxaMaxima;
			nut = this.calcularNUT(c);
			this.coefGlobalTC = nut * Cmin / this.areaDeTroca;
			break;
		case "area":
			this.efetividade = this.taxa / taxaMaxima;
			nut = this.calcularNUT(c);
			this.areaDeTroca = nut * Cmin / this.coefGlobalTC;
			break;
	}
}

/* ------------------------------------------------------------------------ */
/* ----------------- Fim da Classe de Trocadores de Calor ----------------- */
/* ------------------------------------------------------------------------ */



/* -------------------------------------------------------------------------------------------------- */
/* ----------------- Início da Classe de Distribuição de Tamanho de Partícula (DTP) ----------------- */
/* -------------------------------------------------------------------------------------------------- */

// Modelo GGS: X = (D / b)^a
// Modelo RRB: X = 1 - exp(-(D / b)^a)
// Modelo Sigmóide: X = 1 / (1 + (b / D)^a)
var DTP = function() {
	this.valoresDiametros = [];
	this.valoresFracoes = [];
	this.valoresMassas = [];
	this.massaTotal;
	this.modelo;
	this.parametroA;
	this.parametroB;
	this.coeficienteDeterminacao;
	this.diametroVolumetrico;
	this.diametroSuperficial;
	this.diametroSauter;
}

// Método para definir os pontos utilizados no modelo
// O primeiro parâmetro é o array com os diâmetros e o segundo é o array com as frações acumuladas
DTP.prototype.definirValoresComFracao = function(arrayD, arrayX) {
	if (arrayD.length != arrayX.length) {
		console.log("Os arrays com os pontos não possuem o mesmo tamanho, definição falhou");
	} else if (arrayD.length < 2 || arrayX.length < 2) {
		console.log("Não existem pontos suficientes para regressão, definição falhou");
	} else {
		this.valoresDiametros = arrayD.slice();
		this.valoresFracoes = arrayX.slice();
		// Realiza a ordenação do maior diâmetro para o menor
		ordenacaoDecrescente(this.valoresDiametros, this.valoresFracoes);
	}
}

// Método para definir o valor da massa total do teste de peneira
DTP.prototype.definirMassaTotal = function(massa) {
	if (massa > 0) {
		this.massaTotal = massa;
	} else {
		console.log("Valor de massa inválido, definição falhou.");
	}
}

// Método para definir os pontos utilizados no modelo
// O primeiro parâmetro é o array com os diâmetros e o segundo é o array com as massas retidas
// Precisa que seja definido primeiro a massa total
DTP.prototype.definirValoresComMassa = function(arrayD, arrayM) {
	if (arrayD.length != arrayM.length) {
		console.log("Os arrays com os pontos não possuem o mesmo tamanho, definição falhou");
	} else if (arrayD.length < 2 || arrayM.length < 2) {
		console.log("Não existem pontos suficientes para regressão, definição falhou");
	} else {
		this.valoresDiametros = arrayD.slice();
		this.valoresMassas = arrayM.slice();
		
		// Ordena do maior diâmetro para o menor
		ordenacaoDecrescente(this.valoresDiametros, this.valoresMassas);
		// Faz a conversão de valores de massa para frações acumuladas
		for (var i = 0; i < this.valoresMassas.length; i++) {
			var soma = 0;
			for (var j = i; j < this.valoresMassas.length; j++) {
				soma += this.valoresMassas[j];
			}
			this.valoresFracoes[i] = (soma / this.massaTotal);
		}
	}
}

// Método para cálculo dos parâmetros a e b do modelo GGS
// Ao final altera os atributos modelo, parametroA, parametroB e coeficienteDeterminacao
// Necessita que sejam definidor os arrays com os pontos
DTP.prototype.calcularGGS = function() {
	// Realiza o teste se é possível prosseguir com o cálculo
	if (this.valoresDiametros.length == 0 || this.valoresFracoes.length == 0) {
		console.log("Faltam parâmetros para o cálculo.");
		return;
	}
	
	// Prepara os pontos para regressão linear
	var x = [];
	var y = [];
	for (var i = 0; i < this.valoresDiametros.length; i++) {
		x.push(Math.log(this.valoresDiametros[i]));
		y.push(Math.log(this.valoresFracoes[i]));
	}
	
	// Finaliza o cálculo dos parâmetros
	this.modelo = "ggs";
	this.parametroA = carl(x, y);
	this.parametroB = Math.exp(-1 * clrl(x, y) / carl(x, y));
	this.coeficienteDeterminacao = cdrl(x, y);
}

// Método para cálculo dos parâmetros a e b do modelo RRB
// Ao final altera os atributos modelo, parametroA, parametroB e coeficienteDeterminacao
// Necessita que sejam definidor os arrays com os pontos
DTP.prototype.calcularRRG = function() {
	// Realiza o teste se é possível prosseguir com o cálculo
	if (this.valoresDiametros.length == 0 || this.valoresFracoes.length == 0) {
		console.log("Faltam parâmetros para o cálculo.");
		return;
	}
	
	// Prepara os pontos para regressão linear
	var x = [];
	var y = [];
	for (var i = 0; i < this.valoresDiametros.length; i++) {
		x.push(Math.log(this.valoresDiametros[i]));
		y.push(Math.log(Math.log(1 / (1 - this.valoresFracoes[i]))));
	}
	
	// Finaliza o cálculo dos parâmetros
	this.modelo = "rrb";
	this.parametroA = carl(x, y);
	this.parametroB = Math.exp(-1 * clrl(x, y) / carl(x, y));
	this.coeficienteDeterminacao = cdrl(x, y);
}

// Método para cálculo dos parâmetros a e b do modelo Sigmoide
// Ao final altera os atributos modelo, parametroA, parametroB e coeficienteDeterminacao
// Necessita que sejam definidor os arrays com os pontos
DTP.prototype.calcularSigmoide = function() {
	// Realiza o teste se é possível prosseguir com o cálculo
	if (this.valoresDiametros.length == 0 || this.valoresFracoes.length == 0) {
		console.log("Faltam parâmetros para o cálculo.");
		return;
	}
	
	// Prepara os pontos para regressão linear
	var x = [];
	var y = [];
	for (var i = 0; i < this.valoresDiametros.length; i++) {
		x.push(Math.log(this.valoresDiametros[i]));
		y.push(Math.log(1 / this.valoresFracoes[i] - 1));
	}
	
	// Finaliza o cálculo dos parâmetros
	this.modelo = "sigmoide";
	this.parametroA = -1 * carl(x, y);
	this.parametroB = Math.exp(-1 * clrl(x, y) / carl(x, y));
	this.coeficienteDeterminacao = cdrl(x, y);
}

// Método para cálculo dos diâmetros
// Altera os atributos de diâmetro ao final do cálculo
// Necessita da definição dos arrays de massa e diâmetro, junto com a definição de massa total do teste
DTP.prototype.calcularDiametros = function() {
	// Realiza o teste de verificação dos pré-requisitos
	if (this.valoresDiametros.length == 0 || this.valoresMassas.length == 0 || this.massaTotal == undefined) {
		console.log("Faltam parâmetros para o cálculo dos diâmetros");
		return;
	}
	
	// Cálculo do diâmetro médio volumétrico
	var soma = 0;
	for (var i = 0; i < this.valoresMassas.length; i++) {
		soma += this.valoresMassas[i] / (this.massaTotal * Math.pow(this.valoresDiametros[i], 3));
	}
	this.diametroVolumetrico = Math.pow(1 / soma, 1 / 3);
	
	// Cálculo do diâmetro médio superficial
	var soma1 = 0;
	var soma2 = 0;
	for (var i = 0; i < this.valoresMassas.length; i++) {
		soma1 += this.valoresMassas[i] / (this.massaTotal * this.valoresDiametros[i]);
		soma2 += this.valoresMassas[i] / (this.massaTotal * Math.pow(this.valoresDiametros[i], 3));
	}
	this.diametroSuperficial = Math.pow(soma1 / soma2, 0.5);
	
	// Cálculo do diâmetro médio de Sauter
	soma = 0;
	for (var i = 0; i < this.valoresMassas.length; i++) {
		soma += this.valoresMassas[i] / (this.massaTotal * this.valoresDiametros[i]);
	}
	this.diametroSauter = 1 / soma;
}

/* ----------------------------------------------------------------------------------------------- */
/* ----------------- Fim da Classe de Distribuição de Tamanho de Partícula (DTP) ----------------- */
/* ----------------------------------------------------------------------------------------------- */



/* --------------------------------------------------------------------------- */
/* ----------------- Início da Classe de Colunas de Absorção ----------------- */
/* --------------------------------------------------------------------------- */

var Absorcao = function() {
	this.vazGasEntra;
	this.vazLiqEntra;
	this.fracGasEntra;
	this.fracLiqEntra;
	this.porcRemocao;
	this.henry;
	this.fracGasSai;
	this.fracLiqSai;
	this.vazGasInerte;
	this.vazLiqInerte;
	this.vazGasSai;
	this.vazLiqSai;
	this.calo;
	this.cllo;
	this.degrauX = [];
	this.degrauY = [];
	this.numEstagios;
	this.remove;
	this.resta;
	this.vazLiqMinInerte;
	this.criterioDeProjeto;
	this.tipoEntrada;
}

// Métodos de definição do tipo de entrada e critério de projeto
Absorcao.prototype.definirTipos = function(criterio, entrada) {
	criterio = criterio.toLowerCase();
	entrada = entrada.toLowerCase();
	// Verifica validade dos argumentos
	if (criterio != "remocao" && criterio != "fracao") {
		console.log("Critério de projeto não cadastrado, falha na definição.");
		return;
	}
	if (entrada != "total" && entrada != "inerte") {
		console.log("Tipo de entrada não cadastrada, falha na definição.");
		return;
	}
	
	// Definição
	this.criterioDeProjeto = criterio;
	this.tipoEntrada = entrada;
}

// Métodos para definição de composição do sistema
Absorcao.prototype.definirFracEntrada = function(y, x) {
	// Testa validade dos argumentos
	if (x < 0 || x > 1 || y < 0 || y > 1) {
		console.log("Frações informadas inválidas, falha na definição.");
		return;
	}
	
	// Definição
	this.fracGasEntra = y;
	this.fracLiqEntra = x;
}
// Unidade das vazões: kmol/h
// Divergências de unidades podem ser tratadas com o conversor.js
Absorcao.prototype.definirVazEntrada = function(V, L) {
	if (V <= 0 || L <= 0) {
		console.log("Vazões inválidas, falha na definição.");
		return;
	}
	if (this.tipoEntrada == undefined) {
		console.log("Não foi definido o tipo de entrada anteriormente, falha na definição.");
		return;
	}
	
	// Definição
	if (this.tipoEntrada == "inerte") {
		this.vazGasInerte = V;
		this.vazLiqInerte = L;
	}
	if (this.tipoEntrada == "total") {
		this.vazGasEntra = V;
		this.vazLiqEntra = L;
	}
}
// A constante de Henry informada aqui é a sem unidade, dividida pela pressão do sistema
// OBS.: Por enquanto não há interação com a classe da constante de Henry, pois os dados lá são muito poucos, de modo que é mais interessante,
// por hora, deixar opção de entrada de dado direto na interface
Absorcao.prototype.definirConstanteDeHenry = function(H) {
	// Testa validade do parâmetro
	if (H <= 0) {
		console.log("Constante de Henry inválida, falha na definição.");
		return;
	}
	
	// Definição
	this.henry = H;
}

// Método para definição de critério de projeto
// Requer que seja definido anteriormente o tipo de critério de projeto
Absorcao.prototype.definirValorDeCriterioDeProjeto = function(valor) {
	// Testa validade do argumento informado
	if (this.criterioDeProjeto == "remocao" && (valor <= 0 || valor > 100)) {
		console.log("Valor de porcentagem de remoção inválido, falha na definição.");
		return;
	}
	if (this.criterioDeProjeto == "fracao" && (valor < 0 || valor > 1)) {
		console.log("Valor de fração final inválido, falha na definição.");
		return;
	}
	
	// Definição
	if (this.criterioDeProjeto == "remocao") {
		this.porcRemocao = valor / 100;
	}
	if (this.criterioDeProjeto == "fracao") {
		this.fracGasSai = valor;
	}
}

// Método de dimensionamento
Absorcao.prototype.dimensionar = function() {
	// Testa os requisitos do dimensionamento
	if (this.porcRemocao == undefined || this.fracGasSai == undefined) {
		console.log("Falta definir os critérios de projeto e seu valor, falha no dimensionamento.");
		return;
	}
	if (this.fracGasEntra == undefined || this.fracLiqEntra == undefined || this.henry == undefined) {
		console.log("Falta definir parâmetros do sistema, falha no dimensionamento.");
		return;
	}
	if ((this.vazGasInerte == undefined || this.vazLiqInerte == undefined) && (this.vazGasEntra == undefined || this.vazLiqEntra == undefined)) {
		console.log("Falta definir o tipo de entrada e seus valores, falha no dimensionamento.");
		return;
	}
	
	// Executa o dimensionamento, tomando os tipos de entrada e o critério de projeto
	if (this.tipoEntrada == "inerte") {
		this.calcularVazEntradaPorInerte();
	}
	if (this.tipoEntrada == "total") {
		this.calcularVazInerte();
	}
	this.calcularFracSaida();
	this.calcularVazLiqInerteMinimo();
	if (this.vazLiqInerte < this.vazLiqMinInerte) {
		alert("Foi definida uma vazão de líquido de entrada menor que a vazão mínima (" + this.vazLizMinInerte.toFixed(3) + " kmol/h), de modo que o dimensionamento foi interrompido.");
		return;
	}
	this.calcularLinhaOperacao();
	this.calcularDegrau();
}

// Método de cálculo das frações do soluto nas correntes de saída
Absorcao.prototype.calcularFracSaida = function() {
	if (this.criterioDeProjeto == "fracao") {
		this.calcularFracLiqSai();
		this.calcularVazSaida();
	}
	if (this.criterioDeProjeto == "remocao") {
		this.calcularVazTransferida();
		this.calcularVazSaidaPorRemocao();
		this.calcularFracSaiPorRemocao();
	}
}

// Método para cálculo da vazão de líquido inerte mínimo, ou seja, na solubilidade máxima
// Requer frações de entrada, constante de Henry, fração no gás de saída e vazão de gás inerte
Absorcao.prototype.calcularVazLiqInerteMinimo = function() {
	var xmax = this.fracGasEntra / this.henry;
	var A = this.fracGasSai / (1 - this.fracGasSai);
	var B = this.fracGasEntra / (1 - this.fracGasEntra);
	var C = this.fracLiqEntra / (1 - this.fracLiqEntra);
	var D = xmax / (1 - xmax);
	this.vazLiqMinInerte = this.vazGasInerte * (A - B) / (C - D);
}

// Método de cálculo da vazão de inerte a partir de dados de entrada (vazões e frações)
Absorcao.prototype.calcularVazInerte = function() {
	this.vazGasInerte = this.vazGasEntra * (1 - this.fracGasEntra);
	this.vazLiqInerte = this.vazLiqEntra * (1 - this.fracLiqEntra);
}

// Método para cálculo da fração do gás no líquido de saída
// Requer definições de frações de entrada, fração no gás de saída e vazões de inerte
Absorcao.prototype.calcularFracLiqSai = function() {
	var K = this.vazLiqInerte * (this.fracLiqEntra / (1 - this.fracLiqEntra));
	K += this.vazGasInerte * (this.fracGasEntra / (1 - this.fracGasEntra));
	K -= this.vazGasInerte * (this.fracGasSai / (1 - this.fracGasSai));
	K = K / this.vazLiqInerte;
	this.fracLiqSai = K / (1 + K);
}

// Método para cálculo das vazões de saída de gás e líquido
// Requer as vazões de inerte e as frações de saída, de gás e líquido
Absorcao.prototype.calcularVazSaida = function() {
	this.vazGasSai = this.vazGasInerte / (1 - this.fracGasSai);
	this.vazLiqSai = this.vazLiqInerte / (1 - this.fracLiqSai);
}

// Método para calcular os parâmetros da reta da linha de operação
// Requer vazões de entrada e saída (gás e líquido), frações de entrada e fração de saída do gás
Absorcao.prototype.calcularLinhaOperacao = function() {
	this.calo = this.vazLiqSai / this.vazGasEntra;
	this.cllo = (this.vazGasSai * this.fracGasSai - this.vazLiqEntra * this.fracLiqEntra) / (this.vazGasEntra);
}

// Retorna os pontos para desenho do gráfico
Absorcao.prototype.calcularDegrau = function() {
	var x = this.fracLiqEntra;
	var y = this.calo * x + this.cllo;
	this.degrauX.push(x);
	this.degrauY.push(y);
	while (x < this.fracLiqSai) {
		x = y / this.henry;
		this.degrauX.push(x);
		this.degrauY.push(y);
		y = this.calo * x + this.cllo;
		if (x < this.fracLiqSai) {
			this.degrauX.push(x);
			this.degrauY.push(y);
		}
	}
	var np = this.degrauX.length;
	this.numEstagios = np / 2 - 1 + (this.fracLiqSai - this.degrauX[np - 2]) / (this.degrauX[np - 1] - this.degrauX[np - 2]);
}

// Método de dimensionamentos a partir da porcentagem de remoção
// Requer definição da porcentagem de remoção, frações de entrada, vazões de entrada e vazão de gás inerte
Absorcao.prototype.calcularVazTransferida = function() {
	this.remove = this.vazGasEntra * this.fracGasEntra * this.porcRemocao;
	this.resta = this.vazGasEntra * this.fracGasEntra * (1 - this.porcRemocao); 
}
Absorcao.prototype.calcularVazSaidaPorRemocao = function() {
	this.vazGasSai = this.vazGasInerte + this.resta;
	this.vazLiqSai = this.vazLiqEntra + this.remove;
}
Absorcao.prototype.calcularFracSaiPorRemocao = function() {
	this.fracLiqSai = (this.remove + this.vazLiqEntra * this.fracLiqEntra) / this.vazLiqSai;
	this.fracGasSai = this.resta / this.vazGasSai;
}

// Método de cálculo de vazões de entrada a partir de vazões de inerte
// Requer definição de vazões de interte e frações de entrada
Absorcao.prototype.calcularVazEntradaPorInerte = function() {
	this.vazGasEntra = this.vazGasInerte / (1 - this.fracGasEntra);
	this.vazLiqEntra = this.vazLiqInerte / (1 - this.fracLiqEntra);
}

/* ------------------------------------------------------------------------ */
/* ----------------- Fim da Classe de Colunas de Absorção ----------------- */
/* ------------------------------------------------------------------------ */



/* -------------------------------------------------------------------- */
/* ----------------- Início da Classe de Elutriadores ----------------- */
/* -------------------------------------------------------------------- */

var Elutriadores = function() {
	this.reynoldsIsolado = [];
	this.rhoParticula = [];
	this.diametroParticula = [];
	this.esfericidade = [];
	this.rhoFluido;
	this.gravidade = 9.8;
	this.viscosidade;
	this.porosidade;
	this.criterioDeProjeto;
	this.velocidade;
	this.diametroDeCorte = [];
	this.tipoFixado;
	this.vazaoFluido;
	this.diametroCilindro;
}

// Método para definição do critério de projeto
// Argumento pesado: obter pesado puro
// Argumento leve: obter leve puro
Elutriadores.prototype.definirCriterioDeProjeto = function(criterio) {
	// Verifica se foi passado critério válido
	criterio = criterio.toLowerCase();
	if (criterio != "pesado" && criterio != "leve") {
		console.log("Critério não cadastrado, falha na definição.");
		return;
	}
	
	// Definição
	this.criterioDeProjeto = criterio;
}

// Método de definição de características do sistema
Elutriadores.prototype.definirSistema = function(rhoF, viscosidade, porosidade) {
	// Verifica se os parâmetros passados são válidos
	if (rhoF <= 0 || viscosidade <= 0 || porosidade <= 0 || porosidade > 1) {
		console.log("Parâmetros inválidos, falha na definição.");
		return;
	}
	
	// Definição
	this.rhoFluido = rhoF;
	this.viscosidade = viscosidade;
	this.porosidade = porosidade;
}

// Método para definição de características do equipamento
// tipo: vazao ou diametro
// Fixa a vazão do elutriador ou o diametro do elutriador
Elutriadores.prototype.definirEquipamento = function(tipo, valor) {
	// Testa se os argumentos informados são válidos
	tipo = tipo.toLowerCase();
	if (tipo != "vazao" && tipo != "diametro") {
		console.log("Tipo de característica não cadastrada");
		return;
	}
	if (valor <= 0) {
		console.log("Valor inválido");
		return;
	}
	
	// Definição
	this.tipoFixado = tipo;
	if (this.tipoFixado == "vazao")
		this.vazaoFluido = valor;
	if (this.tipoFixado == "diametro")
		this.diametroCilindro = valor;
}

// Método de definição dos diâmetros, esfericidades e massas específicas das partículas
// A ordem do diâmetro e da esfericidade está relacionada com a ordem das massas específicas de rhoParticula
Elutriadores.prototype.definirParticuas = function(rhoP, diametros, esfericidades) {
	// Verifica se o parâmetro é válido
	if (diametros.length == 0 || diametros.length != rhoP.length || esfericidades.length == 0 || esfericidades.length != rhoP.length) {
		console.log("Parâmetro inválido, definição falhou.");
		return;
	}
	var valido = true;
	for (var i = 0; i < diametros.length; i++) {
		if (diametros[i] <= 0 || esfericidades[i] <= 0 || esfericidades[i] > 1 || rhoP[i] <= 0) {
			valido = false;
		}
	}
	if (!valido) {
		console.log("Valores inválido, definição falhou");
		return;
	}
	
	// Definição
	this.rhoParticula = rhoP.slice();
	this.diametroParticula = diametros.slice();
	this.esfericidade = esfericidades.slice();
}

// Método de dimensionamento, ao final obtem-se a velocidade de escomento e o diâmetro de corte
// Faz a conferência de pré-requisitos para cálculo
Elutriadores.prototype.dimensionar = function() {
	// Validação dos requisitos para dimensionamento
	if (this.rhoFluido == undefined || this.viscosidade == undefined || this.porosidade == undefined || (this.vazaoFluido == undefined && this.diametroCilindro == undefined)) {
		console.log("Características do sistema não definidas, falha no dimensionamento.");
		return;
	}
	if (this.criterioDeProjeto == undefined) {
		console.log("Critério de projeto não definido, falha no dimensionamento.");
		return;
	}
	if (this.rhoParticula.length == 0 || this.esfericidade.length == 0 || this.diametroParticula.length == 0) {
		console.log("Características das partículas não definidas, falha no dimensionamento.");
		return;
	}
	
	// Dimensionamento
	this.calcularCorrelacoes("velocidade");
	this.selecionarCorrecao();
	this.calcularVelocidade();
	this.calcularDimensoes();
	this.calcularCorrelacoes("diametro-corte");
}

// Método de cálculo de dimensões do equipamento
Elutriadores.prototype.calcularDimensoes = function() {
	if (this.tipoFixado == "vazao")
		this.diametroCilindro = Math.sqrt(4 * this.vazaoFluido / (this.velocidade * Math.PI));
	if (this.tipoFixado == "diametro")
		this.vazaoFluido = this.velocidade * Math.PI * Math.pow(this.diametroCilindro, 2) / 4;
}

// Método do cálculo das correlações
// Recebe como parâmetro o tipo de informação para calcular
Elutriadores.prototype.calcularCorrelacoes = function(objetivo) {
	switch (objetivo) {
		case "velocidade":
			for (var i = 0; i < this.rhoParticula.length; i++) {
				var aux = 4 * (this.rhoParticula[i] - this.rhoFluido) * this.rhoFluido * this.gravidade * Math.pow(this.diametroParticula[i], 3) / (3 * Math.pow(this.viscosidade, 3));
				var K1 = 0.843 * Math.log10(this.esfericidade[i] / 0.065);
				var K2 = 5.31 - 4.88 * this.esfericidade[i];
				this.reynoldsIsolado[i] = Math.pow(Math.pow(K1 * aux * aux, -1.2) + Math.pow(aux / K2, -0.6), -0.83);
				this.velocidadeTerminal[i] = this.reynoldsIsolado[i] * this.viscosidade / (this.rhoFluido * this.diametroParticula[i]);
			}
			break;
		case "diametro":
			for (var i = 0; i < this.rhoParticula.length; i++) {
				var aux = 4 * (this.this.rhoParticula[i] - this.rhoFluido) * this.viscosidade * this.gravidade / (3 * Math.pow(this.rhoFluido, 2) * Math.pow(this.velocidadeTerminal[i], 3));
				var K1 = 0.843 * Math.log10(this.esfericidade[i] / 0.065);
				var K2 = 5.31 - 4.88 * this.esfericidade[i];
				this.reynoldsIsolado[i] = Math.pow(Math.pow(24 / (K1 * aux), 0.65) + Math.pow(K2 / aux, 1.3), 0.77);
				this.diametroParticula[i] = this.reynoldsIsolado[i] * this.viscosidade / (this.rhoFluido * this.velocidadeTerminal[i]);
			}
			break;
		case "diametro-corte":
			for (var i = 0; i < this.rhoParticula.length; i++) {
				var aux = 4 * (this.this.rhoParticula[i] - this.rhoFluido) * this.viscosidade * this.gravidade / (3 * Math.pow(this.rhoFluido, 2) * Math.pow(this.velocidadeTerminal[i], 3));
				var K1 = 0.843 * Math.log10(this.esfericidade[i] / 0.065);
				var K2 = 5.31 - 4.88 * this.esfericidade[i];
				this.reynoldsIsolado[i] = Math.pow(Math.pow(24 / (K1 * aux), 0.65) + Math.pow(K2 / aux, 1.3), 0.77);
				this.diametroDeCorte[i] = this.reynoldsIsolado[i] * this.viscosidade / (this.rhoFluido * this.velocidadeTerminal[i]);
			}
			break;
	}
}

// Método para correção da velocidade terminal
Elutriadores.prototype.corrigirVelocidadeTerminal = function(tipo, i) {
	switch (tipo) {
		case "politis-massarani":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] * Math.pow(this.porosidade, 5.93) * Math.pow(this.reynoldsIsolado[i], -0.14);
			break;
		case "massarani-santana-0":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] * 0.83 * Math.pow(this.porosidade, 3.94);
			break;
		case "massarani-santana-1":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] * (4.8 * this.porosidade - 3.8);
			break;
		case "massarani-santana-2":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] / (1 + 0.28 * Math.pow(this.porosidade, -5.96) * Math.pow(this.reynoldsIsolado[i], 0.33 * this.porosidade - 0.35));
			break;
		case "massarani-santana-3":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] * 0.095 * Math.exp(2.29 * this.porosidade);
			break;
		case "richardson-zaki-0":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] * Math.pow(this.porosidade, 3.65);
			break;
		case "richardson-zaki-1":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] * Math.pow(this.porosidade, 4.35 * Math.pow(this.reynoldsIsolado[i], -0.03) - 1);
			break;
		case "richardson-zaki-2":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] * Math.pow(this.porosidade, 4.35 * Math.pow(this.reynoldsIsolado[i], -0.1) - 1);
			break;
		case "richardson-zaki-3":
			this.velocidadeTerminal[i] = this.velocidadeTerminal[i] * Math.pow(this.porosidade, 1.39);
			break;
	}
}

Elutriadores.prototype.calcularVelocidade = function() {
	var indc = 0;
	var rho = this.rhoParticula[indc];
	for (var i = 0; i < this.rhoParticula.length; i++) {
		if (criterio == "pesado") {
			if (this.rhoParticula[i] < rho) {
				rho = this.rhoParticula[i];
				indc = i;
			}
		}
		if (criterio == "leve") {
			if (this.rhoParticula[i] > rho) {
				rho = this.rhoParticula[i];
				indc = i;
			}
		}
	}
	this.velocidade = this.velocidadeTerminal[indc];
}

Elutriadores.prototype.selecionarCorrecao = function() {
	for (var i = 0; i < this.velocidadeTerminal.length; i++) {
		if (parseFloat(this.esfericidade.toFixed(4)) == 1) {
			// Utilizar as correlações de Richardson e Zaki, escolha por Reynolds
			if (this.reynoldsIsolado <= 0.2)
				this.corrigirVelocidadeTerminal("richardson-zaki-0", i);
			else if (this.reynoldsIsolado[i] > 0.02 && this.reynoldsIsolado[i] <= 1)
				this.corrigirVelocidadeTerminal("richardson-zaki-1", i);
			else if (this.reynoldsIsolado[i] > 1 && this.reynoldsIsolado[i] <= 500)
				this.corrigirVelocidadeTerminal("richardson-zaki-2", i);
			else
				this.corrigirVelocidadeTerminal("richardson-zaki-3", i);
		} else if (this.reynoldsIsolado[i] <= 0.2) {
			// Correlações de Massarani e Santana, escolha por porosidade
			if (this.porosidade > 0.9 && this.porosidade < 1)
				this.corrigirVelocidadeTerminal("massarani-santana-1", i);
			else
				this.corrigirVelocidadeTerminal("massarani-santana-0", i);
		} else if (this.reynoldsIsolado[i] >= 0.5 && this.reynoldsIsolado[i] < 700 && this.porosidade > 0.47 && this.porosidade < 0.8) {
			// Correlação de Politis e Massarani
			this.corrigirVelocidadeTerminal("politis-massarani", i);
		} else if (this.reynoldsIsolado[i] >= 1 && this.reynoldsIsolado[i] < 500 && this.porosidade > 0.5 && this.porosidade < 0.95) {
			// Correlação de Massarani e Santana
			this.corrigirVelocidadeTerminal("massarani-santana-2", i);
		} else if (this.reynoldsIsolado[i] >= 2000 && this.porosidade > 0.5 && this.porosidade < 0.95) {
			// Correlação de Massarani e Santana
			this.corrigirVelocidadeTerminal("massarani-santana-3", i);
		} else {
			// Não há correlação para o caso
			console.log("Não existe uma correlação cadastrada para as configurações de reynolds, esfericidade e porosidade. Correção de velocidade não efetuada.");
		}
	}
}

/* ----------------------------------------------------------------- */
/* ----------------- Fim da Classe de Elutriadores ----------------- */
/* ----------------------------------------------------------------- */



/* ------------------------------------------------------------------------------------------------- */
/* ----------------- Início da Classe de Distribuição de Tempo de Residência (DTR) ----------------- */
/* ------------------------------------------------------------------------------------------------- */
// "Nada na vida é para ser temido. É apenas para ser entendido" (Marie Curie)

// A classe DTR faz o cálculo das definições de E(t) e F(t), para testes pulso e degrau, respectivamente
// Nenhum dos métodos desta classe possuem retorno, todos alteram valores de atributos da classe
class DTR {
	
	// Construtor e atributos da classe
	constructor() {
		this.concentracoes = [];
		this.tempos = [];
		this.E = [];
		this.F = [];
		this.tempoMedio;
		this.variancia;
		this.tipoTeste;
		this.conversao;
		this.ordem;
		this.k;
		this.ca0;
		this.tempoIdeal;
	}
	
	// Método de definição de valores de concentração em função do tempo
	definirValores(conc, tempo) {
		// Teste de validação dos dados informados
		if(conc.length > 0 && tempo.length > 0 && (conc.length == tempo.length)) {
			this.concentracoes = conc.slice();
			this.tempos = tempo.slice();
			ordenacaoCrescente(this.tempos, this.concentracoes);
		} else {
			console.log("Parâmetros inválidos, falha na definição.");
		}
	}
	
	// Método de definição do tipo de teste
	definirTeste(tipo) {
		// Teste de validação do argumento informado
		if(tipo == "pulso" || tipo == "degrau")
			this.tipoTeste = tipo;
		else
			console.log("Argumento inválido, definição falhou.");
	}
	
	// Método de definição dos parâmetros cinéticos e concentração inicial
	definirSistema(ordem, velEsp, conc0) {
		// Valida se os argumentos passados são coerentes
		if(ordem == "ordem1" || ordem == "ordem2" || velEsp > 0 || conc0 > 0) {
			this.ordem = ordem;
			this.k = velEsp;
			this.ca0 = conc0;
		} else {
			console.log("Argumentos inválidos, falha na definição.");
		}
	}
	
	// Método de cálculo dos valores E(t) e F(t), a partir dos dados de concentração e tempo
	// Necessita definir valores de concentração, tempo e tipo de teste
	// Este método apenas chama os métodos de cálculo, de acordo com o tipo de teste
	calcularDistribuicoes() {
		// Testa se foram definidos os valores necessários
		if(this.concentracoes.length == 0 || this.tempos.length == 0 || this.tipoTeste == undefined) {
			console.log("Faltam definir parâmetros para executar os cálculos das distribuições.");
			return;
		}
		
		// Executa os cálculos, de acordo com o tipo de teste
		if(this.tipoTeste == "pulso")
			this.calcularFt();
		if(this.tipoTeste == "degrau")
			this.calcularEt();
	}
	
	// Método para cálculo dos parâmetros estatísticos:
	// Tempo de residência médio e variância
	// Necessita da definição dos valores de concentração e tempo
	calcularParametros() {
		// Testa se foram iniciados os atributos necessáios para o cálculo
		if(this.concentracoes.length == 0 || this.tempos.length == 0) {
			console.log("Faltam parâmetros a serem iniciados, falha na execução do cálculo.");
			return;
		}
		
		// Inicia os cálculos, definição de variáveis e instância da classe de interpolação polinomial
		var intPol = new PolinomioInterpolador();
		var intCdt, intTCdt, intTTCdt;
		var valoresX = [], valoresY1 = [], valoresY2 = [];
		intPol.definirValores(this.tempos, this.E);
		intPol.montarPolinomio();
		
		// Calcula as integrais para cálculo do tempo médio
		var intervalo = 300;
		var limInf = this.tempos[0];
		var limSup = this.tempos[this.tempos.length - 1];
		var passo = (limSup - limInf) / intervalo;
		for(var i = 0; i <= intervalo; i++) {
			valoresX[i] = limInf + i * passo;
			valoresY1[i] = intPol.estimarValorEm(valoresX[i]);
			valoresY2[i] = valoresY1[i] * valoresX[i];
		}
		intCdt = Calculo.integrartrap(valoresX, valoresY1);
		intTCdt = Calculo.integrartrap(valoresX, valoresY2);
		this.tempoMedio = intTCdt / intCdt;
		
		// Calcula as integrais para cálculo da variância
		valoresX = [];
		valoresY1 = [];
		for(var i = 0; i <= intervalo; i++) {
			valoresX[i] = limInf + i * passo;
			valoresY1[i] = intPol.estimarValorEm(valoresX[i]) * Math.pow(valoresX[i] - this.tempoMedio, 2);
		}
		intTTCdt = Calculo.integrartrap(valoresX, valoresY1);
		this.variancia = intTTCdt / intCdt;
	}
	
	// Método para cálculo da conversão pelo modelo de segregação
	// Necessita da definição dos valores de concentração, tempo e tipo de teste, junto com os parâmetros cinéticos
	// Não necessita de chamar o método de cálculo das distribuições, recebe os valores dos atributos e trabalha sobre eles
	conversaoSegregacao() {
		// Testa se foram definidos os atributos necessários
		if(this.concentracoes.length == 0 || this.tempos.length == 0 ||this.tipoTeste == undefined) {
			console.log("Faltam definir os parâmetros do teste para cálculo.");
			return;
		}
		if(this.k == undefined || this.ordem == undefined || this.ca0 == undefined) {
			console.log("Faltam definir os parâmetros cinéticos, falha no cálculo");
			return;
		}
		
		// Inicia os cálculos, definição de variáveis e instância da classe de interpolação
		var limInf = this.tempos[0], limSup = this.tempos[this.tempos.length - 1], valoresX = [], valoresY =[], intervalo = 300;
		var passo = (limSup - limInf) / intervalo;
		var intPol = new PolinomioInterpolador();
		this.calcularEt();
		intPol.definirValores(this.tempos, this.E);
		intPol.montarPolinomio();
		
		// Calcula a conversão de acordo com a ordem
		if(this.ordem == "ordem1") {
			for(var i = 0; i <= intervalo; i++) {
				valoresX[i] = limInf + passo * i;
				valoresY[i] = Math.exp(-1 * this.k * valoresX[i]) * intPol.estimarValorEm(valoresX[i]);
			}
			this.conversao = 1 - Calculo.integrartrap(valoresX, valoresY);
		}
		if(this.ordem == "ordem2") {
			for(var i = 0; i <= intervalo; i++) {
				valoresX[i] = limInf + passo * i;
				valoresY[i] = this.k * valoresX[i] * this.ca0 * intPol.estimarValorEm(valoresX[i]) / (1 + this.k * valoresX[i] * this.ca0);
			}
			this.conversao = Calculo.integrartrap(valoresX, valoresY);
		}
	}
	
	// Métodos auxiliares, são chamados pelos outros
	// De acordo com o tipo de teste, calcula dois valores de uma única vez (E e F)
	calcularEt() {
		//Declaração de variáveis e instância da classe de interpolação
		var valoresX = [], valoresY = [], intCdt, ct0;
		var limInf, limSup, passo, intervalo = 300;
		var intPol = new PolinomioInterpolador();
		
		// Calcula E(t) para um teste tipo pulso
		if(this.tipoTeste == "pulso") {
			// Apaga valores que estiverem armazenados no atributo
			this.E = [];
			
			// Calcula a partir da integração dos valores de concentração, via polinômio interpolador
			intPol.definirValores(this.tempos, this.concentracoes);
			intPol.montarPolinomio();
			limInf = this.tempos[0];
			limSup = this.tempos[this.tempos.length - 1];
			passo = (limSup - limInf) / intervalo;
			for(var i = 0; i <= intervalo; i++) {
				valoresX[i] = limInf + i * passo;
				valoresY[i] = intPol.estimarValorEm(valoresX[i]);
			}
			intCdt = Calculo.integrartrap(valoresX, valoresY);
			for(var i = 0; i < this.tempos.length; i++) {
				this.E[i] = this.concentracoes[i] / intCdt;
			}
		}
		
		// Calcula E(t) e F(t) para teste tipo degrau
		if(this.tipoTeste == "degrau") {
			// Apaga valores que estiverem armazenados nos atributos
			this.F = [];
			this.E = [];
			
			// Admite que o último valor de concentrações é a concentração total inicial
			ct0 = this.concentracoes[this.concentracoes.length - 1];
			for(var i = 0; i < this.concentracoes.length; i++) {
				this.F[i] = this.concentracoes[i] / ct0;
			}
			intPol.definirValores(this.tempos, this.F);
			intPol.montarPolinomio();
			for(var i = 0; i < this.tempos.length; i++) {
				this.E[i] = intPol.estimarDerivadaEm(this.tempos[i]);
			}
		}
	}
	
	calcularFt() {
		// Declaração de variáveis e instância da classe de interpolação
		var valoresX = [], valoresY = [], intCdt, ct0;
		var limInf, limSup, passo, intervalo = 300;
		var intPol = new PolinomioInterpolador();
		
		// Calcula E(t) e F(t) para um teste do tipo pulso
		if(this.tipoTeste = "pulso") {
			// Apaga valores que estiverem armazenados nos atributos
			this.E = [];
			this.F = [];
			
			// Calcula E(t) a partir da integração dos valores de concentração, via polinômio interpolador
			intPol.definirValores(this.tempos, this.concentracoes);
			intPol.montarPolinomio();
			limInf = this.tempos[0];
			limSup = this.tempos[this.tempos.length - 1];
			passo = (limSup - limInf) / intervalo;
			for(var i = 0; i <= intervalo; i++) {
				valoresX[i] = limInf + i * passo;
				valoresY[i] = intPol.estimarValorEm(valoresX[i]);
			}
			intCdt = Calculo.integrartrap(valoresX, valoresY);
			for(var i = 0; i < this.tempos.length; i++) {
				this.E[i] = this.concentracoes[i] / intCdt;
			}
			
			// Calcula F(t) a partir da integração de E(t) via polinômio interpolador
			intPol.definirValores(this.tempos, this.E);
			intPol.montarPolinomio();
			limInf = 0
			for(var i = 0; i < this.tempos.length; i++) {
				limSup = this.tempos[i];
				if(limSup == limInf) {
					this.F[i] = 0;
				} else {
					passo = (limSup - limInf) / intervalo;
					valoresX = [];
					valoresY = [];
					for(var j = 0; j <= intervalo; j++) {
						valoresX[j] = limInf + j * passo;
						valoresY[j] = intPol.estimarValorEm(valoresX[j]);
					}
					this.F[i] = Calculo.integrartrap(valoresX, valoresY);
				}
			}
		}
		
		// Calcula F(t) para entrada do tipo degrau
		if(this.tipoTeste == "degrau") {
			// Apaga valores que estiverem armazenados no atributo
			this.F = [];
			
			// Admite que o último valor de concentrações é a concentração total inicial
			ct0 = this.concentracoes[this.concentracoes.length - 1];
			for(var i = 0; i < this.concentracoes.length; i++) {
				this.F[i] = this.concentracoes[i] / ct0;
			}
		}
	}
	
}

/* ---------------------------------------------------------------------------------------------- */
/* ----------------- Fim da Classe de Distribuição de Tempo de Residência (DTR) ----------------- */
/* ---------------------------------------------------------------------------------------------- */



/* --------------------------------------------------------------- */
/* ----------------- Início da Classe de Filtros ----------------- */
/* --------------------------------------------------------------- */

// A classe Filtros realiza cálculo de parâmetros a partir de dados experimentais e também dimensionamento de filtro prensa
// Nenhum método possui retorno, todos alteram atributos na classe
// Existem métodos para acessar atributos da classe
class Filtros extends Regressor {
	
	//Declaração de atributos
	constructor() {
		super();
		this.tempos = [];
		this.volumes = [];
		this.quedaPress = [];
		this.viscosidade;
		this.C;
		this.deltaP;
		this.areaF;
		this.vazao;
		this.Rm;
		this.alfa;
		this.producao;
		this.operacao;
		this.tipoDimensionamento;
		this.volumeTotal;
		this.tempoTotal;
		this.numeroDeQuadros;
		this.areaQuadro;
		this.volumeDeLavagem;
		this.tempoNaoOperacional;
		this.erroDeCalculo;
	}
	
	// Método para definição do tipo de operação
	definirOperacao(tipo) {
		if(tipo == "pressaocte" || tipo == "vazaocte") {
			this.operacao = tipo;
		} else {
			console.log("Parâmetro inválido, falha na definição.");
		}
	}
	
	// Método de definição de valores para regressão, de acordo com o tipo de operação informada
	definirValores(tempo, pressOuVolume) {
		if(tempo.length == pressOuVolume.length && tempo.length > 1) {
			if(this.operacao == "pressaocte") {
				this.tempos = tempo.slice();
				this.volumes = pressOuVolume.slice();
			}
			if(this.operacao == "vazaocte") {
				this.tempos = tempo.slice();
				this.quedaPress = pressOuVolume.slice();
			}
		} else {
			console.log("Parâmetros inválidos, falha na definição.");
		}
	}
	
	// Método para definição da área de filtração
	definirArea(ar) {
		if(ar > 0) {
			this.areaF = ar;
		} else {
			console.log("Parâmetro inválido, falha na definição");
		}
	}
	
	// Método para definição do sistema
	// Requer primeiro que seja definido o modo de operação
	definirSistema(viscosidade, C, pressOuVazao) {
		if(viscosidade > 0 && C > 0 && pressOuVazao > 0) {
			this.viscosidade = viscosidade;
			this.C = C;
			if(this.operacao == "pressaocte")
				this.deltaP = pressOuVazao;
			if(this.operacao == "vazaocte")
				this.vazao = pressOuVazao;
		} else {
			console.log("Parâmetros inválidos, falha na definição.");
		}
	}
	
	// Método de definição dos parâmetros do filtro e da torta (Rm e alfa)
	definirParametros(rm, alfa) {
		if(rm > 0 && alfa > 0) {
			this.Rm = rm;
			this.alfa = alfa;
		} else {
			console.log("Parâmetros inválidos, falha na definição.");
		}
	}
	
	// Método para definir o tipo de dimensionamento do filtro prensa
	// O argumento critério varia de acordo com o tipo de dimensionamento escolhido
	definirFiltroPrensa(tipo, volLav, tempNO, areaQ, criterio1, criterio2) {
		if((tipo == "quadrosporvolume" || tipo == "quadrosportempo" || tipo == "producaoportempo" || tipo == "otimizar" || tipo == "producaoporvolume") && volLav > 0 && tempNO > 0 && criterio1 > 0 && criterio2 > 0) {
			this.tipoDimensionamento = tipo;
			this.volumeDeLavagem = volLav;
			this.tempoNaoOperacional = tempNO;
			this.areaQuadro = areaQ;
			if(tipo == "quadrosportempo") {
				this.producao = criterio1;
				this.tempoTotal = criterio2;
			}
			if(tipo == "quadrosporvolume") {
				this.producao = criterio1;
				this.volumeTotal = criterio2;
			}
			if(tipo == "producaoporvolume") {
				this.volumeTotal = criterio1;
				this.numeroDeQuadros = criterio2;
			}
			if(tipo == "producaoportempo") {
				this.tempoTotal = criterio1;
				this.numeroDeQuadros = criterio2;
			}
			if(tipo == "otimizar")
				this.numeroDeQuadros = criterio1;
		} else {
			console.log("Parâmetro inválido, falha na definição.");
		}
	}
	
	// Método para acessar os atributos com parâmetros calculados
	acessarRm() {
		return this.Rm;
	}
	acessarAlfa() {
		return this.alfa;
	}
	acessarR2() {
		return this.r2;
	}
	acessarProducao() {
		return this.producao;
	}
	acessarTempo() {
		return this.tempoTotal;
	}
	acessarVolume() {
		return this.volumeTotal;
	}
	acessarQuadros() {
		return this.numeroDeQuadros;
	}
	
	// Método para cálculo dos parâmetros a partir dos dados armazenados nos atributos da classe
	// Necessita da definição dos valores para regressão, junto com o tipo de operacao e características dos sistema
	calcularParametros() {
		// Valida se foram informados os valores necessários
		if(this.operacao == undefined || this.viscosidade == undefined || this.areaF == undefined || this.C == undefined || (this.deltaP == undefined && this.vazao == undefined)) {
			console.log("Faltam parâmetros para cálculo, falha no método de cálculo dos parâmetros.");
			return;
		}
		
		// Inicia os cálculos, ajustando os valores x e y para regressão linear por meio da super classe
		var x = [], y = [];
		for(var i = 0; i < this.tempos.length; i++) {
			if(this.operacao == "pressaocte") {
				x[i] = this.volumes[i];
				y[i] = this.tempos[i] / this.volumes[i];
			}
			if(this.operacao == "vazaocte") {
				x[i] = this.tempos[i];
				y[i] = this.quedaPress[i];
			}
		}
		
		// Chama o método de regressão da super classe Regressor
		super.definirValores(x, y);
		super.reglin();
		
		// Trabalha os coeficientes e encontra os parâmetros
		if(this.operacao == "pressaocte") {
			this.Rm = this.estimadores[0] * this.areaF * this.deltaP / this.viscosidade;
			this.alfa = this.estimadores[1] * 2 * Math.pow(this.areaF, 2) * this.deltaP / (this.viscosidade * this.C);
		}
		if(this.operacao == "vazaocte") {
			this.Rm = this.estimadores[0] * this.areaF / (this.viscosidade * this.vazao);
			this.alfa = this.estimadores[1] * Math.pow(this.areaF, 2) / (this.viscosidade * this.C * Math.pow(this.vazao, 2));
		}
	}
	
	// Método para dimensionamento de filtro prensa
	// Necessita da definição do sistema; modelagem para operação em quedra de pressão constante
	// Faz uma validação superficial dos pré-requisitos
	dimensionarFiltroPrensa() {
		// Confere se foram definidos todos os parâmetros para o cálculo
		if(this.tipoDimensionamento == undefined ||this.viscosidade == undefined) {
			console.log("Faltam parâmetros a serem definidos, falha na execução do cálculo.");
			return;
		}
		
		// Inicia os cálculos, de acordo com o critério de projeto e tipo de dimensionamento requisitado
		switch(this.tipoDimensionamento) {
			case "quadrosportempo":
				var nqinf = 1, nqsup = 50, erro = 1;
				var ainf = 2 * nqinf * this.areaQuadro, asup = 2 * nqsup * this.areaQuadro;
				var volinf = ainf * (Math.sqrt(Math.pow(this.Rm / (this.alfa * this.C), 2) + 2 * this.deltaP * this.tempoTotal / (this.viscosidade * this.alfa * this.C)) - this.Rm / (this.alfa * this.C));
				var volsup = asup * (Math.sqrt(Math.pow(this.Rm / (this.alfa * this.C), 2) + 2 * this.deltaP * this.tempoTotal / (this.viscosidade * this.alfa * this.C)) - this.Rm / (this.alfa * this.C));
				var tinf = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * volinf / ainf + this.Rm) / (ainf * this.deltaP);
				var tsup = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * volsup / asup + this.Rm) / (asup * this.deltaP);
				var prodinf = volinf / (this.tempoNaoOperacional + tinf + this.tempoTotal);
				var prodsup = volsup / (this.tempoNaoOperacional + tsup + this.tempoTotal);
				// Ao final do laço o atributo número de quadros armazenará o valor mais próximo
				var iterador1 = 0, iterador2 = 0;
				while(erro > 0.001 && iterador2 < 1000) {
					while(prodinf > this.producao && iterador1 < 1000) {
						nqinf *= 0.5;
						ainf = 2 * nqinf * this.areaQuadro;
						volinf = ainf * (Math.sqrt(Math.pow(this.Rm / (this.alfa * this.C), 2) + 2 * this.deltaP * this.tempoTotal / (this.viscosidade * this.alfa * this.C)) - this.Rm / (this.alfa * this.C));
						tinf = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * volinf / ainf + this.Rm) / (ainf * this.deltaP);
						prodinf = volinf / (this.tempoNaoOperacional + tinf + this.tempoTotal);
					}
					if(iterador1 >= 1000) this.erroDeCalculo = true;
					iterador1 = 0;
					while(prodsup < this.producao && iterador1 < 1000) {
						nqsup *= 1.5;
						asup = 2 * nqsup * this.areaQuadro;
						volsup = asup * (Math.sqrt(Math.pow(this.Rm / (this.alfa * this.C), 2) + 2 * this.deltaP * this.tempoTotal / (this.viscosidade * this.alfa * this.C)) - this.Rm / (this.alfa * this.C));
						tsup = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * volsup / asup + this.Rm) / (asup * this.deltaP);
						prodsup = volsup / (this.tempoNaoOperacional + tsup + this.tempoTotal);
					}
					if(iterador1 >= 1000) this.erroDeCalculo = true;
					iterador1 = 0;
					var nqit = (nqinf + nqsup) / 2;
					this.numeroDeQuadros = nqit;
					var ait = 2 * nqit * this.areaQuadro;
					var volit = ait * (Math.sqrt(Math.pow(this.Rm / (this.alfa * this.C), 2) + 2 * this.deltaP * this.tempoTotal / (this.viscosidade * this.alfa * this.C)) - this.Rm / (this.alfa * this.C));
					var tit = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * volit / ait + this.Rm) / (ait * this.deltaP);
					var prodit = volit / (this.tempoNaoOperacional + tit + this.tempoTotal);
					if(prodit > this.producao) {
						nqsup = nqit;
					} else if(prodit < this.producao) {
						nqinf = nqit;
					} else {
						break;
					}
					iterador2++;
					if(iterador2 >= 1000) this.erroDeCalculo = true;
					erro = Math.abs(this.producao - prodit) * 100 / this.producao;
				}
				break;
			case "quadrosporvolume":
				var ttotal = this.volumeTotal / this.producao;
				var tempoOp = ttotal - this.tempoNaoOperacional;
				var nqinf = 1, nqsup = 50;
				var erro = 1;
				var ainf = 2 * nqinf * this.areaQuadro, asup = 2 * nqsup * this.areaQuadro;
				var tsup = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * this.volumeTotal / ainf + this.Rm) / (ainf * this.deltaP) + this.volumeTotal * this.viscosidade * (this.alfa * this.C * this.volumeTotal / (2 * ainf) + this.Rm) / (ainf * this.deltaP);
				var tinf = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * this.volumeTotal / asup + this.Rm) / (asup * this.deltaP) + this.volumeTotal * this.viscosidade * (this.alfa * this.C * this.volumeTotal / (2 * asup) + this.Rm) / (asup * this.deltaP);
				// Ao final do laço o atributo número de quadros armazenará o valor mais próximo
				var iterador1 = 0, iterador2 = 0;
				while(erro > 0.001 && iterador2 < 1000) {
					while(tinf > tempoOp && iterador1 < 1000) {
						nqsup *= 1.5;
						asup = 2 * nqsup * this.areaQuadro;
						tinf = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * this.volumeTotal / asup + this.Rm) / (asup * this.deltaP) + this.volumeTotal * this.viscosidade * (this.alfa * this.C * this.volumeTotal / (2 * asup) + this.Rm) / (asup * this.deltaP);
						iterador1++;
					}
					if(iterador1 >= 1000) this.erroDeCalculo = true;
					iterador1 = 0;
					while(tsup < tempoOp && iterador1 < 1000) {
						nqinf *= 0.5;
						ainf = 2 * nqinf * this.areaQuadro;
						tsup = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * this.volumeTotal / ainf + this.Rm) / (ainf * this.deltaP) + this.volumeTotal * this.viscosidade * (this.alfa * this.C * this.volumeTotal / (2 * ainf) + this.Rm) / (ainf * this.deltaP);
						iterador1++;
					}
					if(iterador1 >= 1000) this.erroDeCalculo = true;
					iterador1 = 0;
					var nqit = (nqinf + nqsup) / 2;
					this.numeroDeQuadros = nqit;
					var ait = 2 * this.areaQuadro * nqit;
					var tit = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * this.volumeTotal / ait + this.Rm) / (ait * this.deltaP) + this.volumeTotal * this.viscosidade * (this.alfa * this.C * this.volumeTotal / (2 * ait) + this.Rm) / (ait * this.deltaP);
					if(tit < tempoOp) {
						nqsup = nqit;
					} else if(tit > tempoOp) {
						nqinf = nqit;
					} else {
						break;
					}
					iterador2++;
					if(iterador2 >= 1000) this.erroDeCalculo = true;
					erro = Math.abs(tempoOp - tit) * 100 / tempoOp;
				}
				this.areaF = 2 * this.areaQuadro * this.numeroDeQuadros;
				this.tempoTotal = this.volumeTotal * this.viscosidade * (this.Rm + this.alfa * this.C * this.volumeTotal / (2 * this.areaF)) / (this.areaF * this.deltaP);
				break;
			case "producaoporvolume":
				this.areaF = 2 * this.areaQuadro * this.numeroDeQuadros;
				var tl = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * this.volumeTotal / this.areaF + this.Rm) / (this.areaF * this.deltaP);
				this.tempoTotal = this.volumeTotal * this.viscosidade * (this.alfa * this.C * this.volumeTotal / (2 * this.areaF) + this.Rm) / (this.areaF * this.deltaP);
				this.producao = this.volumeTotal / (this.tempoTotal + this.tempoNaoOperacional + tl);
				break;
			case "producaoportempo":
				this.areaF = 2 * this.areaQuadro * this.numeroDeQuadros;
				this.volumeTotal = this.areaF * (Math.sqrt(Math.pow(this.Rm / (this.alfa * this.C), 2) + 2 * this.deltaP * this.tempoTotal / (this.alfa * this.viscosidade * this.C)) - this.Rm / (this.alfa * this.C));
				var tl = 4 * this.volumeDeLavagem * this.viscosidade * (this.alfa * this.C * this.volumeTotal / this.areaF + this.Rm) / (this.areaF * this.deltaP);
				this.producao = this.volumeTotal / (this.tempoTotal + this.tempoNaoOperacional + tl);
				break;
			case "otimizar":
				this.areaF = 2 * this.numeroDeQuadros * this.areaQuadro;
				this.volumeTotal = Math.sqrt(2 * Math.pow(this.areaF, 2) * this.deltaP * this.tempoNaoOperacional / (this.viscosidade * this.alfa * this.C));
				var to = this.tempoNaoOperacional + this.volumeTotal * this.viscosidade * this.Rm / (this.areaF * this.deltaP);
				this.tempoTotal = to;
				this.producao = this.volumeTotal / (this.tempoNaoOperacional + to);
				break;
		}
	}
	
	// Retorna o erro para valor padrão
	zerarErro() {
		this.erroDeCalculo = false;
	}
	
}

/* ------------------------------------------------------------ */
/* ----------------- Fim da Classe de Filtros ----------------- */
/* ------------------------------------------------------------ */



/* ---------------------------------------------------------------------------------- */
/* ----------------- Início da Classe de Equilíbrio Líquido-Líquido ----------------- */
/* ---------------------------------------------------------------------------------- */

class ELL extends Regressor {
	
	constructor() {
		super();
		this.concFaseAlfa = [];
		this.concFaseBeta = [];
		this.parametrosEquacao = [];
		this.intervalos = [];
		this.concAlfaEstimado = []; // [Fase Superior, Fase Inferior]
		this.concBetaEstimado = []; // [Fase Superior, Fase Inferior]
		this.razaoMassaFases;
		this.tipoEquacao;
		this.concAlfaEquilibrio;
		this.concBetaEquilibrio;
	}
	
	// Método para acessar os parâmetros calculados
	acessarParametros() {
		return this.parametrosEquacao;
	}
	
	acessarIntervalos() {
		return this.intervalos;
	}
	
	acessarAlfaEstimado() {
		return this.concAlfaEstimado;
	}
	
	acessarBetaEstimado() {
		return this.concBetaEstimado;
	}
	
	// Método para definição do tipo de equação
	// equacao1: C_alfa = a0 * exp(a1 * C_beta^0,5 - a2 * C_beta^3)
	// equacao2: C_alfa = a0 + a1 * C_beta^0,5 + a2 * C_beta + a3 * C_beta^2
	// equacao3: C_alfa = exp(a0 + a1 * C_beta^0,5 + a2 * C_beta + a3 * C_beta^2)
	definirEquacao(tipo) {
		// Valida o argumento de entrada
		if(tipo == "equacao1" || tipo == "equacao2" || tipo == "equacao3")
			this.tipoEquacao = tipo;
		else
			console.log("Equação não cadastrada, falha na definição.");
	}
	
	// Método de definição dos valores para regressão linear múltipla
	definirValores(concAlfa, concBeta) {
		// Validação dos argumentos informados
		if(concAlfa.length != concBeta.length) {
			console.log("Para esta classe é preciso que os tamanhos dos arrays informados sejam iguais, falha na definição.");
			return;
		}
		if(concAlfa.length < 5) {
			console.log("Para realizar a regressão para todas as equações é preciso mais de quatro pontos, falha na definição.");
			return;
		}
		
		// Definição
		this.concFaseAlfa = concAlfa.slice();
		this.concFaseBeta = concBeta.slice();
	}
	
	// Método para definição da razão de fases
	// massaFaseSuperior: massa da fase com predominância da fase beta
	// massaMistura: massa total da mistura dentro da região do equilíbrio
	definirRazaoFases(razao) {
		// Valida o argumento informado
		if(razao > 0 && razao < 1)
			this.razaoMassaFases = razao;
		else
			console.log("Parâmetro inválido, falha na definição");
	}
	
	// Método para definição dos parâmetros da equação
	definirParametros(lista) {
		// Valida o argumento informado
		if(lista.length == 3 || lista.length == 4)
			this.parametrosEquacao = lista.slice();
		else
			console.log("Argumento inválido, falha na definição.");
	}
	
	// Método para definir as concentrações no equilíbrio
	// Alfa: fase de sal
	// Beta: fase de líquido
	definirConcEquilibrio(calfa, cbeta) {
		// Validação dos argumentos e definição
		if(calfa > 0 || cbeta > 0) {
			this.concAlfaEquilibrio = calfa;
			this.concBetaEquilibrio = cbeta;
		} else {
			console.log("Parâmetros inválidos, falha na definição.");
			return;
		}
	}
	
	// Método para realização da regressão linear múltipla e cálculo dos parâmetros da equação
	// Não possui retorno, altera o atributo da superclasse estimadores
	// Necessita da definição dos valores de concentração e o tipo de equação
	calcularParametros() {
		// Testa se foram definidos os valores necessários
		if(this.tipoEquacao == undefined || this.concFaseAlfa.length == 0 || this.concFaseBeta.length == 0) {
			console.log("Faltam definir os atributos necessários, falha no cálculo.");
			return;
		}
		
		// Executa a preparação para regressão linear múltipla
		var x = [], y = [];
		switch(this.tipoEquacao) {
			case "equacao1":
				for(var i = 0; i < this.concFaseAlfa.length; i++) {
					y[i] = Math.log(this.concFaseAlfa[i]);
					x[i] = [Math.sqrt(this.concFaseBeta[i]), Math.pow(this.concFaseBeta[i], 3)];
				}
				break;
			case "equacao2":
				for(var i = 0; i < this.concFaseAlfa.length; i++) {
					y[i] = this.concFaseAlfa[i];
					x[i] = [Math.sqrt(this.concFaseBeta[i]), this.concFaseBeta[i], Math.pow(this.concFaseBeta[i], 2)];
				}
				break;
			case "equacao3":
				for(var i = 0; i < this.concFaseAlfa.length; i++) {
					y[i] = Math.log(this.concFaseAlfa[i]);
					x[i] = [Math.sqrt(this.concFaseBeta[i]), this.concFaseBeta[i], Math.pow(this.concFaseBeta[i], 2)];
				}
				break;
		}
		// Executa a regressão linear múltipla
		super.definirValores(x, y);
		super.reglm();
		switch(this.tipoEquacao) {
			case "equacao1":
				this.parametrosEquacao = [Math.exp(this.estimadores[0][0]), this.estimadores[1][0], -1 * this.estimadores[2][0]];
				this.intervalos = [Math.exp(this.intervalo[0]), this.intervalo[1], this.intervalo[2]];
				break;
			default:
				this.parametrosEquacao = [this.estimadores[0][0], this.estimadores[1][0], this.estimadores[2][0], this.estimadores[3][0]];
				this.intervalos = [this.intervalo[0], this.intervalo[1], this.intervalo[2], this.intervalo[3]];
				break;
		}
	}
	
	// Método para estimar fases em equilíbrio a partir de uma mistura dentro da região de equilíbrio
	// Primeiro é preciso chamar o método de regressão para encontrar parâmetros do modelo
	estimarFases(estimadorInicial) {
		// Verifica se foram definidos os valores necessários
		if(this.parametrosEquacao.length == 0 || this.concAlfaEquilibrio == undefined || this.concBetaEquilibrio == undefined || this.tipoEquacao == undefined || this.razaoMassaFases == undefined) {
			console.log("Faltam definições a serem feitas, falha no cálculo");
			return;
		}
		
		// Executa o cálculo do algoritmo de Newton para sistemas não lineares
		var parar = false;
		var estimador = estimadorInicial, i = 0;
		while(!parar) {
			var jac = this.calcularJacobiano(estimador);
			var mtz = Calculo.mtzmultiescalar(this.calcularMtzOriginal(estimador), -1);
			var incremento = Calculo.mtzmulti(Calculo.mtzinverter(jac), mtz);
			var novoEstimador = Calculo.mtzsomar(estimador, incremento);
			parar = this.criterioParada(estimador, novoEstimador, i);
			estimador = novoEstimador;
			i++;
		}
		this.concAlfaEstimado = [estimador[0][0], estimador[1][0]];
		this.concBetaEstimado = [this.calcularBetaViaAlfa(this.concAlfaEstimado[0]), this.calcularBetaViaAlfa(this.concAlfaEstimado[1])];
	}
	
	// Métodos auxiliares do procedimento numérico de Newton
	calcularJacobiano(estimadorAlfa) {
		var jacobiano = [], ca0 = estimadorAlfa[0][0], ca1 = estimadorAlfa[1][0];
		jacobiano[0] = [this.razaoMassaFases, 1 - this.razaoMassaFases];
		switch(this.tipoEquacao) {
			case "equacao1":
				var a0 = this.parametrosEquacao[0], a1 = this.parametrosEquacao[1], a2 = this.parametrosEquacao[2], r = this.razaoMassaFases;
				jacobiano[1] = [r * a0 * (0.5 * a1 * Math.sqrt(1 / ca0) - 3 * a2 * ca0 * ca0) * Math.exp(a1 * Math.sqrt(ca0) - a2 * Math.pow(ca0, 3)), (1 - r) * a0 * (0.5 * a1 * Math.sqrt(1 / ca1) - 3 * a2 * ca1 * ca1) * Math.exp(a1 * Math.sqrt(ca1) - a2 * Math.pow(ca1, 3))];
				break;
			case "equacao2":
				var a0 = this.parametrosEquacao[0], a1 = this.parametrosEquacao[1], a2 = this.parametrosEquacao[2], a3 = this.parametrosEquacao[3], r = this.razaoMassaFases;
				jacobiano[1] = [r * (0.5 * a1 * Math.sqrt(1 / ca0) + a2 + 2 * a3 * ca0), (1 - r) * (0.5 * a1 * Math.sqrt(1 / ca1) + a2 + 2 * a3 * ca1)];
				break;
			case "equacao3":
				var a0 = this.parametrosEquacao[0], a1 = this.parametrosEquacao[1], a2 = this.parametrosEquacao[2], a3 = this.parametrosEquacao[3], r = this.razaoMassaFases;
				jacobiano[1] = [r * (0.5 * a1 * Math.sqrt(1 / ca0) + a2 + 2 * a3 * ca0) * Math.exp(a0 + a1 * Math.sqrt(ca0) + a2 * ca0 + a3 * ca0 * ca0), (1 - r) * (0.5 * a1 * Math.sqrt(1 / ca1) + a2 + 2 * a3 * ca1) * Math.exp(a0 + a1 * Math.sqrt(ca1) + a2 * ca1 + a3 * ca1 * ca1)];
				break
		}
		return jacobiano;
	}
	
	calcularMtzOriginal(estimadorAlfa) {
		var mtz = [], a0, a1, a2, a3, ca0 = estimadorAlfa[0][0], ca1 = estimadorAlfa[1][0], r = this.razaoMassaFases, caeq = this.concAlfaEquilibrio, cbeq = this.concBetaEquilibrio;
		mtz[0] = [ca0 * r + ca1 * (1 - r) - caeq];
		switch(this.tipoEquacao) {
			case "equacao1":
				a0 = this.parametrosEquacao[0], a1 = this.parametrosEquacao[1], a2 = this.parametrosEquacao[2];
				mtz[1] = [a0 * r * Math.exp(a1 * Math.sqrt(ca0) - a2 * Math.pow(ca0, 3)) + a0 * (1 - r) * Math.exp(a1 * Math.sqrt(ca1) - a2 * Math.pow(ca1, 3)) - cbeq];
				break;
			case "equacao2":
				a0 = this.parametrosEquacao[0], a1 = this.parametrosEquacao[1], a2 = this.parametrosEquacao[2], a3 = this.parametrosEquacao[3];
				mtz[1] = [r * (a0 + a1 * Math.sqrt(ca0) + a2 * ca0 + a3 * ca0 * ca0) + (1 - r) * (a0 + a1 * Math.sqrt(ca1) + a2 * ca1 + a3 * ca1 * ca1) - cbeq];
				break;
			case "equacao3":
				a0 = this.parametrosEquacao[0], a1 = this.parametrosEquacao[1], a2 = this.parametrosEquacao[2], a3 = this.parametrosEquacao[3];
				mtz[1] = [r * Math.exp(a0 + a1 * Math.sqrt(ca0) + a2 * ca0 + a3 * ca0 * ca0) + (1 - r) * Math.exp(a0 + a1 * Math.sqrt(ca1) + a2 * ca1 + a3 * ca1 * ca1) - cbeq];
				break;
		}
		return mtz;
	}
	
	criterioParada(estimadorAnterior, estimadorAtual, j) {
		var dif = Math.abs(estimadorAnterior[0][0] - estimadorAtual[0][0]);
		for(var i = 1; i < estimadorAnterior.length; i++) {
			var aux = Math.abs(estimadorAnterior[i][0] - estimadorAtual[i][0]);
			if(aux > dif)
				dif = aux;
		}
		if(dif < 0.001) {
			return true;
		}
		if(j > 300) {
			console.log("Extrapolou limite de iterações.");
			return true;
		}
		return false;
	}
	
	calcularBetaViaAlfa(concAlfa) {
		var beta;
		switch(this.tipoEquacao) {
			case "equacao1":
				beta = this.parametrosEquacao[0] * Math.exp(this.parametrosEquacao[1] * Math.sqrt(concAlfa) - this.parametrosEquacao[2] * Math.pow(concAlfa, 3));
				break;
			case "equacao2":
				beta = this.parametrosEquacao[0] + this.parametrosEquacao[1] * Math.sqrt(concAlfa) + this.parametrosEquacao[2] * concAlfa + this.parametrosEquacao[3] * Math.pow(concAlfa, 2);
				break;
			case "equacao3":
				beta = Math.exp(this.parametrosEquacao[0] + this.parametrosEquacao[1] * Math.sqrt(concAlfa) + this.parametrosEquacao[2] * concAlfa + this.parametrosEquacao[3] * Math.pow(concAlfa, 2));
				break;
		}
		return beta;
	}
	
}

/* ---------------------------------------------------------------------------------- */
/* ----------------- Início da Classe de Equilíbrio Líquido-Líquido ----------------- */
/* ---------------------------------------------------------------------------------- */



/* ----------------------------------------------------------------------- */
/* ----------------- Início da Classe de Reatores Ideais ----------------- */
/* ----------------------------------------------------------------------- */

class ReatoresIdeais {
	
	constructor() {
		this.velEsp;
		this.concIniciais = [];
		this.coefEsteq = [];
		this.ordens = [];
		this.tipoReacao;
		this.fatorExpansao;
		this.tipoDeDimensionamento;
		this.volume;
		this.conversao;
		this.vazao;
	}
	
	// Método para definição de concentrações iniciais, ordens individuais e coeficientes estequimétricos
	// Os métodos seguintes interpretam o primeiro valor como referente ao reagente limitante
	definirSistema(conc0, ordens, coef, velEsp, tipo) {
		// Validação de parâmetros
		if(conc0.length != ordens.length || conc0.length != coef.length) {
			console.log("Foram informadas listas com tamanhos diferentes, falha na definição.");
			return;
		}
		for(var i = 0; i < conc0.length; i++) {
			if(conc0[i] <= 0 || coef[i] == 0) {
				console.log("Valores inválidos foram informados, falha na definição.");
				return;
			}
		}
		if(velEsp <= 0) {
			console.log("Valor inválido para velocidade específica, falha na definição.");
			return;
		}
		if(tipo != "irreversivel" && tipo != "reversivel") {
			console.log("Tipo de reação inválida, falha na definição.");
			return;
		}
		
		// Definição
		this.velEsp = velEsp;
		this.concIniciais = conc0.slice();
		this.coefEsteq = coef.slice();
		this.ordens = ordens.slice();
		this.tipoReacao = tipo;
	}
	
	// Método para definição de vazão de operação
	definirVazao(vaz) {
		if(vaz > 0)
			this.vazao = vaz;
		else 
			console.log("Argumento inválido, falha na definição.");
	}
	
	// Método para definir velocidade específica de reação reversível
	
	
	// Método para definição de conversão do reator, estabelecendo "volume" como critério de dimensionamento
	definirConversao(conv) {
		if(conv > 0 && conv < 1) {
			this.conversao = conv;
			this.tipoDeDimensionamento = "volume";
		} else {
			console.log("Argumento inválido, falha na definição.");
		}
	}
	
	// Método para definição de volume do reator, estabelecendo "conversao" como critério de dimensionamento
	definirVolume(vol) {
		if(vol > 0) {
			this.volume = vol;
			this.tipoDeDimensionamento = "conversao";
		} else {
			console.log("Argumento inválido, falha na definição.");
		}
	}
	
	// Método para cálculo de reator batelada
	dimensionarCSTR() {
		// Verifica se foi definido o sistema, verificação frágil
		if(this.velEsp == undefined || this.tipoDeDimensionamento == undefined || this.vazao == undefined) {
			console.log("Faltam parâmetros a serem definidos na classe, falha no cálculo.");
			return;
		}
		
		// Executa os cálculos
		if(this.tipoDeDimensionamento == "conversao") {
			var xinf = 0.1, xsup = 0.9;
		}
	}
	
	avaliarTaxa(x) {
		var taxa = this.velEsp;
		if(this.tipoReacao == "irreversivel") {
			for(var i = 0; i < this.concIniciais.length; i++) {
				taxa *= Math.pow(this.concIniciais[i] / this.concIniciais[0] - this.coefEsteq[i] * x / this.coefEsteq[0], this.ordens[i]);
			}
			return taxa;
		}
		if(this.tipoReacao == "reversivel") {
			var soma1 = 0, soma2 = 0;
		}
	}
	
}

/* -------------------------------------------------------------------- */
/* ----------------- Fim da Classe de Reatores Ideais ----------------- */
/* -------------------------------------------------------------------- */