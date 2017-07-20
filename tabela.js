var identificadoresPascal = {
    'AND': '', 'ARRAY': '', 'ASM': '', 'BEGIN': '', 'BOOLEAN': 'tipo', 
    'BREAK': '', 'CASE': '', 'CHAR': 'tipo', 'CONST': '', 'CONSTRUCTOR': '',
    'CONTINUE': '', 'DESTRUCTOR': '', 'DIV': '', 'DO': '', 'DOWNTO': '',
    'ELSE': '', 'END': '', 'FALSE': '', 'FILE': '', 'FOR': '', 'FUNCTION': '',
    'GOTO': '', 'IF': '', 'IMPLEMENTATION': '', 'IN': '', 'INTEGER': 'tipo',
    'INLINE': '', 'INTERFACE': '', 'LABEL': '', 'MOD': '', 'NIL': '', 'NOT': '',
    'OBJECT': '', 'OF': '', 'ON': '', 'OPERATOR': '', 'OR': '', 'PACKED': '',
    'PROCEDURE': '', 'PROGRAM': '', 'READ': 'procedure', 'REAL': 'tipo', 'RECORD': '', 
    'REPEAT': '', 'SET': '', 'SHL': '', 'STRING': 'tipo', 'THEN': '', 'TO': '', 'TRUE': '',
    'TYPE': '', 'UNTIL': '', 'UNIT': '', 'USES': '', 'VAR': '', 'WHILE': '', 'WITH': '', 
    'WRITE': 'procedure', 'XOR': ''};

var debug = false; // se true, mostra os tokens enquanto vai lendo

var Tabela = {
	//tabela hash de identificadores, mapeando nomeIdentificador: descricao
	itens: {},

    mostrarTabela: function() {
        console.log('Tabela de identificadores:\n\n');
        
        for (id in this.itens) {
            var token = this.itens[id];

            var tipo = token.tipo;
            if (tipo == 'id' && token.tipo_id) {
                tipo = token.tipo_id;

                if (tipo == 'variavel') {
                    tipo += '(' + token.tipo_var + ')';
                }
            }

            var linha = token.linha;
            var coluna = token.coluna;

            var msg = "[" + id + "] -> Tipo: " + tipo + "; Valor: " + token.valor +
                " Linha: " + linha + "; Coluna: " + coluna;

            console.log(msg);
        }
    },
    
	//Atribui um tipo especifico para um identificador, como identificador de função, de constante, de procedimento
    inserirToken: function(lexema, tipo, linha, coluna) {
        // se o token é do tipo "id", este é armazenado na tabela de tokens
        // (itens). Caso contrário, o token eh retornado
        //
        // se eh palavra reservada, nao armazena na tabela
        var token = {
            lexema: lexema,
            tipo: tipo,
            tipo_id: '',
            tipo_var: '',
            endereco: 0,
            valor: '',
            reservado: false,
            declarado: false,
            usado: false,
            linha: linha,
            coluna: coluna - 1
        }

        var resultado = token;
        if (tipo == 'id') {
            lexema = lexema.toUpperCase();
            token.lexema = lexema.toUpperCase();

            if (lexema in identificadoresPascal) {
                token.reservado = true;
                token.tipo_id = identificadoresPascal[lexema];

            } else if (lexema in this.itens) { // se já foi inserido, não faz nada
                resultado = this.itens[lexema];
            } else {
                // caso contrario, adiciona o identificador a tabela
                this.itens[lexema] = token;
            }
        }

        debug && console.log("[" + linha + ", " + coluna + "] -> " + JSON.stringify(resultado));
        return resultado;
    },

    pegarToken: function(nome) {
        return this.itens[nome];
    },
}


module.exports = Tabela;
