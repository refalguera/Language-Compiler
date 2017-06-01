var AnalisadorLexico = require('./lexer.js');
var Leitor = require('./leitor.js');
var Tabela = require('./tabela.js');
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
        var token = this.g(); //Obtem proximo token
        token.valor = token.valor.toUpperCase();
        if(token.valor == 'LABEL'){
            token = this.g();
            while(token.tipo == 'numero'){
                token = this.g();
                if(token.valor == ','){
                    token = this.g();
                    continue;
                    //volta
                } else if (token.valor == ';'){
                    break;
                    //sai do while e vai para o case 'CONST'
                } else {
                    this.erro('Valor inesperado: "' + token.valor + '"');
                }
            }
        } 
        if(token.valor == 'CONST'){
            this.Tabela.defineTipo(token.valor,'constante'); //Define que o identificador atual é identificador de constante
            token = this.g(); 
            if (token.tipo == 'id' && !this.Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                token = this.g();
                while(token.valor == '='){
                    token = this.g();
                    this.parse_const;
                    token = this.g();
                    if(token.valor == ';'){
                        if (token.tipo == 'id' && !this.Tabela.ehPascal(token.valor)){
                            token = this.g();
                            continue;
                        } else {
                            break;
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.valor + '"');
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.valor + '"');
            }
        }
        if(token.valor == 'TYPE'){
            this.Tabela.defineTipo(token.valor,'tipo'); //Define que o identificador atual é identificador de tipo
            token = this.g(); 
            if (token.tipo == 'id' && !this.Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                token = this.g();
                while(token.valor == '='){
                    token = this.g();
                    this.parse_type();
                    token = this.g();
                    if(token.valor == ';'){
                        if (token.tipo == 'id' && !this.Tabela.ehPascal(token.valor)){
                            token = this.g();
                            continue;
                        } else {
                            break;
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.valor + '"');
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.valor + '"');
            }
        }
        if(token.valor == 'VAR'){
            this.Tabela.defineTipo(token.valor,'var'); //Define que o identificador atual é identificador de variavel
            token = this.g(); 
            if (token.tipo == 'id' && !this.Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                token = this.g();
                while(true){
                    if (token.valor == ','){
                        token = this.g();
                        continue;
                    }else if(token.valor == ':'){
                        token = this.g();
                        this.parse_type();
                        if(token.valor == ';'){
                            if (token.tipo == 'id' && !this.Tabela.ehPascal(token.valor)){
                                token = this.g();
                                continue;
                            } else {
                                break;
                            }
                        } else {
                            this.erro('Valor inesperado: "' + token.valor + '"');
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.valor + '"');
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.valor + '"');
            }
        }
        while(true){
            if(token.valor == 'PROCEDURE'){
                this.Tabela.defineTipo(token.valor,'procedure'); //Define que o identificador atual é identificador de procedimento
                token = this.g(); 
                if (token.tipo == 'id' && !this.Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                    token = this.g();
                    this.parse_palist();
                    token = this.g();
                    if(token.valor == ';'){
                       token = this.g();
                       this.parse_block();
                       if(token.valor == ';'){
                           token = this.g();
                           continue; //retorna para o inicio do loop
                       } else {
                           this.erro('Valor inesperado: "' + token.valor + '"');
                       }
                   } else {
                       this.erro('Valor inesperado: "' + token.valor + '"');
                   }
                } else {
                    this.erro('Valor inesperado: "' + token.valor + '"');
                }
            } else if(token.valor ==  'FUNCTION'){
                this.Tabela.defineTipo(token.valor,'function'); //Define que o identificador atual é identificador de função
                token = this.g(); 
                if (token.tipo == 'id' && !this.Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                    token = this.g();
                    this.parse_palist();
                    token = this.g();
                    if(token.valor == ':'){
                       token = this.g();
                       if (this.Tabela.retornaId(token.valor) == 'tipo'){
                           token = this.g();
                           if(token.valor == ';'){
                               token = this.g();
                               this.parse_block();
                               if(token.valor == ';'){
                                   token = this.g();
                                   continue; //retorna para o inicio do loop
                               } else {
                                   this.erro('Valor inesperado: "' + token.valor + '"');
                               }
                           } else {
                               this.erro('Valor inesperado: "' + token.valor + '"');
                           }
                       } else {
                           this.erro('Valor inesperado: "' + token.valor + '"');
                       }
                    } else {
                        this.erro('Valor inesperado: "' + token.valor + '"');
                    }
                } else {
                    this.erro('Valor inesperado: "' + token.valor + '"');
                }
            }
        }
        if(token.valor == 'BEGIN'){
            while(true){
                token = this.g();
                this.parse_statm();
                token = this.g();
                if(token.valor == ';'){
                    continue;
                } else if (token.valor=='END'){
                    return;
                } else {
                    this.erro('Valor inesperado: "' + token.valor + '"');
                }
            }
        }
        this.erro('Valor inesperado: "' + token.valor + '"');
    
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
