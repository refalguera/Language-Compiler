var Tokens = {
    itens: [],

    addNumero: function(parametro,linha,coluna){
        var token = {};
        token.tipo = "numero";
        token.valor = parametro;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
    },

    addString:function(parametro,linha,coluna){
        var token = {};
        token.tipo = "string";
        token.valor = parametro;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
    },

    addOperador:function(parametro,linha,coluna){
        var token = {};
        token.tipo = "operador";
        token.valor = parametro;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
    },

    addIdentificador:function(id,linha,coluna){
        var token = {};
        token.tipo = "id";
        token.valor = id;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
    },

    addPontuacao:function(parametro,linha,coluna){
        var token = {};
        token.tipo = "pontuacao";
        token.valor = parametro;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
    }

};

module.exports = Tokens;

   
