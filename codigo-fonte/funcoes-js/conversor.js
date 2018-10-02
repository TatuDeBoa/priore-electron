function convVazMol(valor, de, para) {
	de = de.split('/');
	para = para.split('/');
	var aux1 = convMol(valor, de[0], para[0]);
	var aux2 = convTempo(1, de[1], para[1]);
	return aux1 / aux2;
}

function convVazMass(valor, de, para) {
	de = de.split('/');
	para = para.split('/');
	var aux1 = convMassa(valor, de[0], para[0]);
	var aux2 = convTempo(1, de[1], para[1]);
	return aux1 / aux2;
}

function convVazVol(valor, de, para) {
	de = de.split('/');
	para = para.split('/');
	var aux1 = convVolume(valor, de[0], para[0]);
	var aux2 = convTempo(1, de[1], para[1]);
	return aux1 / aux2;
}

function convConcMass(valor, de, para) {
	de = de.split('/');
	para = para.split('/');
	var aux1 = convMassa(valor, de[0], para[0]);
	var aux2 = convVolume(1, de[1], para[1]);
	return aux1 / aux2;
}

function convMassa(valor, de, para) {
	var tipo = ['kg', 'g', 'mg', 'ug', 'lbm', 'oz', 'ton']
	var ft = [1, 1000, 1000000, 1000000000, 2.20462, 35.274, 0.001];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convTempo(valor, de, para) {
	var tipo = ['h', 'min', 's', 'ms'];
	var ft = [1, 60, 3600, 3600000];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convMol(valor, de, para) {
	var tipo = ['mol', 'kmol', 'lbmol'];
	var ft = [1, 1000, 0.0022046226]
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convForca(valor, de, para) {
	var tipo = ['N', 'lbf', 'kgf', 'dina', 'kN'];
	var ft = [1, 0.22489, 0.1019716213, 100000, 0.001];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convEnergia(valor, de, para) {
	var tipo = ['J', 'kJ', 'cal', 'kcal', 'lbf.ft', 'BTU', 'kW.h'];
	var ft = [1, 0.001, 0.23901, 0.00023901, 0.7379, 0.0009486, 0.0000002778];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convVolume(valor, de, para) {
	var tipo = ['m3', 'L', 'cm3', 'mL', 'ft3', 'gal'];
	var ft = [1, 1000, 1000000, 1000000, 35.3145, 264.17];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convArea(valor, de, para) {
	var tipo = ['m2', 'cm2', 'mm2', 'um2', 'A2', 'in2', 'ft2', 'jardas2', 'milhas2'];
	var ft = [1, 10000, 1000000, 1000000000000, 1549.9969, 10.76364864, 1.19596096, 0.00000038613796];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convComprimento(valor, de, para) {
	var tipo = ['m', 'cm', 'mm', 'um', 'A', 'in', 'ft', 'jardas', 'milhas'];
	var ft = [1, 100, 1000, 1000000, 10000000000, 39.37, 3.2808, 1.0936, 0.0006214];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convPotencia(valor, de, para) {
	var tipo = ['W', 'cal/s', 'lbf.ft/s', 'BTU/s', 'HP', 'BTU/h', 'kJ/h', 'kW', 'kcal/h'];
	var ft = [1, 0.23901, 0.7376, 0.0009486, 0.001341, 3.41496, 3.6, 0.001, 0.860436];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convViscDin(valor, de, para) {
	var tipo = ['Pa.s', 'P', 'cP', 'lbf.s/in2', 'lbf.s/ft2', 'lbm/ft.s'];
	var ft = [1, 10, 1000, 0.0001450377, 0.0208854342, 0.6719689751];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convPressao(valor, de, para) {
	var tipo = ['atm', 'Pa', 'kPa', 'bar', 'dina/cm2', 'kgf/cm2', 'mmHg', 'psi', 'mH20'];
	var ft = [1, 101325, 101.325, 1.01325, 1013250, 1.033, 760, 14.696, 10.333];
	var i = tipo.indexOf(de);
	var j = tipo.indexOf(para);
	return valor * ft[j] / ft[i];
}

function convTemperatura(valor, de, para) {
	if (de == '°C') {
		if (para == '°C') return valor;
		if (para == '°F') return 1.8 * valor + 32;
		if (para == '°R') return 1.8 * (valor + 273.15);
		if (para == 'K') return valor + 273.15;
	}
	if (de == '°F') {
		if (para == '°C') return (valor - 32) / 1.8;
		if (para == '°F') return valor;
		if (para == '°R') return valor + 459.67;
		if (para == 'K') return (valor + 459.67) / 1.8;
	}
	if (de == '°R') {
		if (para == '°C') return (valor / 1.8) - 273.15;
		if (para == '°F') return valor - 459.67;
		if (para == '°R') return valor;
		if (para == 'K') return valor / 1.8;
	}
	if (de == 'K') {
		if (para == '°C') return valor  - 273.15;
		if (para == '°F') return valor * 1.8 - 459.67;
		if (para == '°R') return valor * 1.8;
		if (para == 'K') return valor;
	}
}

// Passagem por referência, altera o array original, atenção ao usar
function convFracao(arrayMM, arrayF, origem) {
	var massaMolar = calcMassaMolar(arrayMM, arrayF, origem)
	if (origem == 'massica') {
		for (var i = 0; i < arrayF.length; i++) {
			arrayF[i] = arrayF[i] * massaMolar / arrayMM[i];
		}
	}
	if (origem == 'molar') {
		for (var i = 0; i < arrayF.length; i++) {
			arrayF[i] = arrayF[i] * arrayMM[i] / massaMolar;
		}
	}
}

function calcMassaMolar(arrayMM, arrayF, tipo) {
	if (tipo == 'massica') {
		var soma = 0;
		for (var i = 0; i < arrayMM.length; i++) {
			soma += arrayF[i] / arrayMM[i];
		}
		return 1 / soma;
	}
	if (tipo == 'molar') {
		var soma = 0;
		for (var i = 0; i < arrayMM.length; i++) {
			soma += arrayF[i] * arrayMM[i];
		}
		return soma;
	}
}

// TODO: finalizar e corrigir
function convBasVaz(valor, massaMolar, de) {
	if (de == 'massica')
		return valor / massaMolar;
	if (de == 'molar')
		return valor * massaMolar;
}
