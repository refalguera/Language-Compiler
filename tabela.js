var Tabela = {
	//Palavras reservadas e identificadores
	identificadores: ["AND","DOWNTO","IN","PACKED","TO",
				"ARRAY","ELSE","INLINE","PROCEDURE","TYPE",
				"ASM","END","INTERFACE","PROGRAM","UNIT",
				"BEGIN","FILE","LABEL","RECORD","UNTIL",
				"CASE","FOR","MOD","REPEAT","UNTIL",
				"CONST","FOWARD","NIL","SET","USES",
				"CONSTRUCTOR","FUNCTION","NOT","SHL","VAR",
				"DESTRUCTOR","GOTO","OBJECT","SHR","WHILE",
				"DIV","IF","OF","STRING","WITH",
				"DO","IMPLEMENTATION","OR","THEN","XOR"],
	//Existem 50 palavras reservadas colocadas na inicialização de "identificadores"
	
	//Retorna se é palavra reservada do Pascal (Retorna true caso seja, se não, retorna false)
	ehPascal: function(nomeIdentificador) {
			var ehp = identificadores.indexOf(nomeIdentificador);
			if (ehp == -1 || ehp >=50) 
				return false; 
				//Se -1 não foi adicionado a tabela ainda, se for maior que 50, o indice se refere a um identificador criado durante execução
			return true; 
			//Valores entre com indice entre 0 e 49 se referem as palavras reservadas já definidas
		},

	//Retorna a ID correspondente a um identificador e caso não haja um o mesmo é criado e retornado
	pegarId: function(nomeIdentificador) {
			nomeIdentificador = nomeIdentificador.toUpperCase();
			var i = ehPascal(nomeIdentificador);
			if (i != -1) return i;  					         	//Retorna a ID
			identificadores.push(nomeIdentificador);		//Adiciona o identificador
			return identificadores.length - 1;		  		//Retorna a ID gerada
		}
}


module.exports = Tabela;
