var Tokens = {
    itens: [],

    addNumero: function(parametro){
        var token = {};
        token.tipo = "numero";
        token.valor = parametro;
        this.itens.push(token);
    },

    addString:function(parametro){
        var token = {};
        token.tipo = "string";
        token.valor = parametro;
        this.itens.push(token);
    },

    addOperador:function(parametro){
        var token = {};
        token.tipo = "operador";
        token.valor = parametro;
        this.itens.push(token);
    },

    addIdentificador:function(id){
        var token = {};
        token.tipo = "id";
        token.valor = id;
        this.itens.push(token);
    },

    addPontuacao:function(parametro){
        var token = {};
        token.tipo = "pontuacao";
        token.valor = parametro;
        this.itens.push(token);
    }
};

module.exports = Tokens;
