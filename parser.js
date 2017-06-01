var AnalisadorLexico = require('./lexer.js');
var Leitor = require('./leitor.js');
var fs = require('fs');


g = function(){
    // atalho para chamar a função abaixo
    return AnalisadorLexico.lerProximoToken();
}

var Parser = {

    erro: function(msg) {
        // apresenta erro na tela e fecha o programa
        console.log(msg + '". Linha ' + Leitor.linha + ', coluna ' + Leitor.coluna);
        process.exit(-1);
    },

    verifica_se_eh: function(obtido, esperado) {
        if (obtido == esperado) {
            return true;
        } else {
            this.erro('Erro. Esperando "' + esperado + '", mas recebeu "' + obtido);
            return false;
        }
    },

    parse_program: function() {
        token = g();
        if (token.valor == 'program') {
            this.parse_identificador();
            token = g();
            if (token.valor == '(') {
                while (true) {
                    this.parse_identificador();
                    token = g();

                    if (token.valor == ')') {
                        token = g();
                        this.verifica_se_eh(token.valor, ';');
                        this.parse_block();
                        token = g();
                        this.verifica_se_eh(token.valor, '.');
                        break;
                    } else if (token.valor == ',') {
                        continue;
                        // volta ao inicio do laço
                    } else {
                        this.erro('Valor inesperado: "' + token.valor + '"');
                    }
                }
            } else {
                this.verifica_se_eh(token.valor, '('); // mostra erro, pois espera (
            }
        } else {
            this.verifica_se_eh(token.valor, 'program'); //mostra erro com valor obtido ao esperar program
        }
    },

    parse_block: function() {

    },

    parse_identificador: function() {

    },

    parse_const: function() {

    },
}

if (!module.parent) {
    const args = process.argv; // pega os argumentos passado pela linha de comando

    if (args.length != 3) {
        erroSai('Número de parâmetros incorreto! Use node lexer.js NOME_DO_ARQUIVO.pas');
    }

    const nomeArquivo = args[2]; // pega o nome do arquivo enviado pelo parâmetro da linha de comando

    if (!fs.existsSync(nomeArquivo)) {
        erroSai('Erro: arquivo não encontrado (' + nomeArquivo + ')');
    }

    Leitor.ler(nomeArquivo);
    Parser.parse_program();
}
