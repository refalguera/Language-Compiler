var fs = require('fs');
var Leitor = require('./leitor.js');
var Tokens = require('./tokens.js');
var Tabela = require('./tabela.js');

var debug = true; // se true, mostra msgs de debug na tela


function erroSai(msg) {
    // função mostra o erro de para o programa
    console.log(msg);
    process.exit(-1)
}

var AnalisadorLexico = {

    processar: function() {
        // le todos os tokens até terminar o arquivo
        while(!Leitor.fimDoArquivo()) {
            this.lerProximoToken();
        }
    },

    lerProximoToken: function() {
        // pula todos os espaços, tabs e quebra de linha
        var charAtual;
        do {
            charAtual = Leitor.proximo();
            // testa se acabou de ler o arquivo
            if (Leitor.fimDoArquivo()) {
                return null;
            }
        } while (' \t\n'.indexOf(charAtual) !== -1);
        // testa se é comentário, em pascal, comentário começa com { e termina
        // com }
        var linha = Leitor.linha;
        var coluna = Leitor.coluna;
        if (charAtual === '{') {
            this.lerComentario();
            debug && console.log('comentario');
            return;
        }
        
        if (/[0-9]/i.test(charAtual)) { // testa se é numero
            // isso verifica se o char esta entre 0 e 9
            var numero = this.lerNumero();
            if (numero != null) {
                debug && console.log('numero -> ' + numero);
                Tokens.addNumero(parseFloat(numero), linha, numero);
                return;
            }
        }
        
        if (charAtual == '\'') { // testa se é string
            var string = this.lerString();
            if (string != null) {
                debug && console.log('string -> ' + string);
                Tokens.addString(string, linha, coluna);
                return;
            }
        } 
        
        // testa se eh uma pontuação de pascal como : , ; ( ) [ ] >> <<
        if (/[:();.,\[\]#]/ig.test(charAtual)) {
            var pontuacao = this.lerPontuacao();
            
            if (pontuacao != '') {
                debug && console.log('pontuação -> ' + pontuacao);
                Tokens.addPontuacao(pontuacao, linha, coluna);
                return;
            }
        }
        
        // testa se é uma operacao, ( ) ; , : := =
        if (/[\+\-\/\*\=\>\<&|!~]/ig.test(charAtual)) {
            // testa se é um operador: +, -, *, /, :=, =
            var operador = this.lerOperador();
            if (operador != null) {
                debug && console.log('operador -> ' + operador);
                Tokens.addOperador(operador, linha, coluna);
                return;
            }
        }
        
        // testa se é um identificador (nome de função, variáveis, etc)
        if (/[a-z]/ig.test(charAtual)) {
            var identificador = this.lerIdentificador();
            if (identificador != null) {
                var id = Tabela.pegarId(identificador);
                debug && console.log('identificador -> ' + identificador + " | " + id);
                Tokens.addIdentificador(identificador, id, linha, coluna);
                return;
            }
        }

        // se chegou até aqui, n passou por nenhum return, logo é algo que não
        // pode ser identificado, gerar erro.

        Leitor.erro('Caracter inválido: ' + charAtual + ', verifique seu código. !');
    },

    lerComentario: function() {
        // vai lendo td até encontrar o }, de fim de comentário
        var charAtual;

        do {
            charAtual = Leitor.proximo();
        } while (charAtual !== '}');
        Leitor.proximo();
    },

    lerNumero: function() {
        var regex = /[0-9]+[.]*[0-9]*/gi; // regex para identificar numero
        return Leitor.proximoComRegex(regex);
    },

    lerString: function() {
        var regex = /('[^'\\]*(?:\\.[^'\\]*)*')/gi; 
        // fonte da regex http://stackoverflow.com/a/6525975/2877599
        return Leitor.proximoComRegex(regex);
    },

    lerOperador: function() {
        var regex = /(<<)|(>>)|(<=)|(>=)|(<>)|([\+\-\/\*\=\>\<\&\|\!\~])/gi;
        return Leitor.proximoComRegex(regex);
    },

    lerPontuacao: function() {
        var regex = /(:=)|([\(\):,\[\];.])/gi;
        return Leitor.proximoComRegex(regex);
    },

    lerIdentificador: function() {
        var regex = /[a-z]+[a-z0-9]*/gi;
        return Leitor.proximoComRegex(regex);
    }
}


const args = process.argv; // pega os argumentos passado pela linha de comando

if (args.length != 3) {
    erroSai('Número de parâmetros incorreto! Use node lexer.js NOME_DO_ARQUIVO.pas');
}

const nomeArquivo = args[2]; // pega o nome do arquivo enviado pelo parâmetro da linha de comando

if (!fs.existsSync(nomeArquivo)) {
    erroSai('Erro: arquivo não encontrado (' + nomeArquivo + ')');
}

Leitor.ler(nomeArquivo);
AnalisadorLexico.processar();
console.log(Tokens.itens);
