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
        // verifica se uma string "obtido" é igual ao "esperado". Caso não,
        // gera erro
        if (obtido == esperado) {
            return true;
        } else {
            this.erro('Erro. Esperando "' + esperado + '", mas recebeu "' + obtido);
            return false;
        }
    },

    parse_program: function() {
        token = g();
        if (token.valor == 'PROGRAM') {
            this.parse_identificador();
            token = g();
            if (token.valor == '(') {
                while (true) {
                    token = g();
                    if (token.tipo != 'id') {
                        this.erro('Identificador esperado ! Recebeu: "' + token.tipo + '"');
                    }
                    token = g();

                    if (token.valor == ')') {
                        token = g();
                        this.verifica_se_eh(token.valor, ';');
                        console.log(333);
                        this.parse_block();
                        console.log(111);
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
            this.verifica_se_eh(token.valor, 'PROGRAM'); //mostra erro com valor obtido ao esperar program
        }
    },
    
    parse_factor: function() {
        token = g();
        if (Tabela.retornaTipo(token) == 'constante' ||
            token.tipo == 'numero' ||
            token.valor == 'nil' ||
            token.tipo == 'string')
            return true;

        if (Tabela.retornaTipo(token) == 'variavel') {
            this.parser_infipo();
            return true;
        }

        if (Tabela.retornaTipo(token) == 'function') {
            token = g();
            if (token.valor == '(') {
                while (true) {
                    this.parse_expr();
                    token = g();
                    if (token.valor == ',')
                        continue;
                    if (token.valor == ')')
                        return true;
                    this.verifica_se_eh(token.valor, ')'); // gera erro, pois esperava )
                }
            } else {
                //TODO verificar o lambda
                return true;
            }
        }

        if (token.valor == '(') {
            this.parse_expr();
            token = g();
            this.verifica_se_eh(token.valor, ')');
            return true;
        }

        if (token.valor == 'not') {
            this.parse_factor();
            return true;
        }

        if (token.valor == '[') {
            token = g();
            if (token.valor == ']') {
                return true;
            } else {
                while (true) {
                    this.parse_expr();
                    token = g();
                    if (token.valor == '..') {
                        this.parse_expr();
                        token = g();
                    }
                    if (token.valor == ',') {
                        continue;
                    }

                    if (token.valor == ']') {
                        return true;
                    }

                    this.erro('Valor inesperado: "' + token.valor + '"');
                }
            }
        }
    },

    parse_block: function() {
        var token = g(); //Obtem proximo token
        token.valor = token.valor.toUpperCase();
        if(token.valor == 'LABEL'){
            token = g();
            while(token.tipo == 'numero'){
                token = g();
                if(token.valor == ','){
                    token = g();
                    continue;
                    //volta
                } else if (token.valor == ';'){
                    token = g();
                    break;
                    //sai do while e vai para o case 'CONST'
                } else {
                    this.erro('Valor inesperado: "' + token.valor + '"');
                }
            }
        } 
            
        if(token.valor == 'CONST'){
            token = g(); 
            if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                Tabela.defineTipo(token.valor, 'constante'); //Define que o identificador atual é identificador de constante
                token = g();
                while(token.valor == '='){
                    this.parse_const();
                    token = g();
                    if(token.valor == ';') {
                        token = g();
                        if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){
                            Tabela.defineTipo(token.valor, 'constante');
                            token = g();
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
            token = g(); 
            if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                Tabela.defineTipo(token.valor, 'tipo'); //Define que o identificador atual é identificador de tipo
                token = g();
                while(token.valor == '='){
                    this.parse_type();
                    token = g();
                    if(token.valor == ';'){
                        token = g();
                        if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){
                            Tabela.defineTipo(token.valor, 'tipo');
                            token = g();
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

        if(token.valor == 'VAR') {
            token = g(); 
            if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                Tabela.defineTipo(token.valor,'var'); //Define que o identificador atual é identificador de variavel
                token = g();
                while(true){
                    if (token.valor == ','){
                        token = g();
                        if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                            Tabela.defineTipo(token.valor, 'var'); //Define que o identificador atual é identificador de variavel
                        } else {
                            this.erro('Valor inesperado: "' + token.valor + '"');
                        }

                        token = g();
                        continue;
                    } else if(token.valor == ':'){
                        this.parse_type();
                        token = g();
                        if(token.valor == ';'){
                            token = g();
                            if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){
                                token = g();
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
                token = g(); 
                if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                    Tabela.defineTipo(token.valor,'procedure'); //Define que o identificador atual é identificador de procedimento
                    token = g();
                    this.parse_palist();
                    token = g();
                    if(token.valor == ';'){
                       this.parse_block();
                        token = g();
                       if(token.valor == ';'){
                           token = g();
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
                token = g(); 
                if (token.tipo == 'id' && !Tabela.ehPascal(token.valor)){ //Verifica se é um identificador
                    Tabela.defineTipo(token.valor,'function'); //Define que o identificador atual é identificador de função
                    this.parse_palist();
                    token = g();
                    if(token.valor == ':'){
                       token = g();
                       if (Tabela.retornaTipo(token) == 'tipo'){
                           token = g();
                           if(token.valor == ';'){
                               this.parse_block();
                               if(token.valor == ';'){
                                   token = g();
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
            } else {
                // se passou das declaraçoes de function e procedure, sai do
                // laço
                break;
            }
        }

        if(token.valor == 'BEGIN'){
            while(true){
                this.parse_statm();
                token = g();
                if(token.valor == ';'){
                    continue;
                } else if (token.valor == 'END'){
                    return;
                } else {
                    this.erro('Valor inesperado: "' + token.valor + '"');
                }
            }
        }

        this.erro('Valor inesperado: "' + token.valor + '"');
    
    },

    parse_type: function() {
        var token = g();
        if (Tabela.retornaTipo(token) == 'tipo') {
            return true;
        } else {
            // TODO terminar grafo
        }
    },

    parse_statm: function() {

    },

    parse_identificador: function() {

    },

    parse_const: function() {
        var token = g();
        if (token.tipo == 'string') {
            return true;
        }
        
        if (token.valor == '+' || token.valor == '-') {
            token = g(); // pula esse operador e vai ao proximo
        }

        var tipo = Tabela.retornaTipo(token);
        if (tipo == 'constante' || tipo == 'numero')
            return true;

        this.erro('Valor inesperado: "' + token.valor + '". Esperando String, constante, ou ' +
                    'valor numérico!.');
        return false;
    },
    
    parse_sitype: function(){
        token = g();
        if(Tabela.retornaTipo(token) == 'tipo'){
            return true;
        } else if(token.valor == '('){
            while(true){
                token = g();
                if (Tabela.retornaTipo(token) != 'var') {
                    this.erro('Valor inesperado: "' + token.valor + '". Esperando identificador!');
                    token = g();
                }

                if(token.valor == ')'){
                    return true;
                } else if (token.valor == ',') {
                    continue;
                    // volta pro inicio , para verfificar se o
                    //próximo é um identificador
                }
            }
        } else {
            this.parse_const();
            token = g();

            if(token.valor == '..'){
                this.parser_const();
                return true;
            } else {
                this.verifica_se_eh(token.valor, '..'); // gera erro, esperava ..
            }
        }
    },
    
    verifica_exp: function(exp){
         if(exp == '=' || exp == '<' || exp == '>' || exp == '<>' || exp == '<=' || exp == '>=') {
            return true;
         }
        return false;
    },

    parser_infipo: function(){

    }
}

function erroSai(msg) {
    // função mostra o erro de para o programa
    console.log(msg);
    process.exit(-1)
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
