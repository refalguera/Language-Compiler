var Tokens = {
    itens: [],

    addNumero: function(parametro,linha,coluna){
        var token = {};
        token.tipo = "numero";
        token.valor = parametro;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
        return token;
    },

    addString:function(parametro,linha,coluna){
        var token = {};
        token.tipo = "string";
        token.valor = parametro;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
        return token;
    },

    addOperador:function(parametro,linha,coluna){
        var token = {};
        token.tipo = "operador";
        token.valor = parametro;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
        return token;
    },

    addIdentificador:function(parametro,id,linha,coluna){
        var token = {};
        token.tipo = "id";
        token.valor = parametro.toUpperCase();
        token.id = id;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
        return token;
    },

    addPontuacao:function(parametro,linha,coluna){
        var token = {};
        token.tipo = "pontuacao";
        token.valor = parametro;
        token.linha = linha;
        token.coluna = coluna;
        this.itens.push(token);
        return token;
    }

};

module.exports = Tokens;
