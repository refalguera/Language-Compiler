var fs = require('fs');


var Leitor = {
    linha: 1,
    coluna: 1,
    posicao: 0,
    texto: '',
    qtd_erros: 0,

    ler: function(nomeArquivo) {
        // le o arquivo para uma string, usando a o formato utf8 (para aceitar
        // caracteres especiais
        this.texto = fs.readFileSync(nomeArquivo, 'utf8').replace(/\/r\/n/, /\n/);
    },

    proximo: function() {
        // carega o caracter na posição atual, e incrementa a posição lida
        var caracter = this.texto.charAt(this.posicao++);

        // atualiza o numero da linha e coluna atual
        if (caracter == '\n') {
            this.linha++;
            this.coluna = 1;
        } else {
            this.coluna++;
        }

        return caracter;
    },

    proximoComRegex: function(regex) {
        // le um conjunto de caracteres que da é aceito pela expressão regular
        // passada em regex.
        // carrega uma copia da string comecando no ponteiro atual
        var sub = this.texto.substring(--this.posicao);
        this.coluna--;
        var resultado = regex.exec(sub);

        if (resultado === null) {
            resultado = '';
        } else {
            resultado = resultado[0]; //pega o primeiro item do resultado,
            // que é o valor encontrado
        }

        // atualiza a linha e coluna
        for (var i = 0; i < resultado.length; i++) {
            var caracter = resultado[i];
            if (caracter == '\n') {
                this.linha++;
                this.coluna = 1;
            } else {
                this.coluna++;
            }
        }

        this.posicao += resultado.length;

        return resultado;
    },

    getChar: function() {
        // retorna o texto na posicao atual
        return this.texto[this.posicao];
    },

    fimDoArquivo: function() {
        // verifica se chegou no fim do arquivo
        // em js, o fim da string retorna como "", uma string vazia
        return !this.getChar();
    },

    erro: function(msg) {
        console.error(msg + ' (' + this.linha + ':' + this.coluna + ')');
        this.qtd_erros += 1;
    }
}

module.exports = Leitor;
