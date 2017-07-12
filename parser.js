var AnalisadorLexico = require('./lexer.js');
var Leitor = require('./leitor.js');
var Tabela = require('./tabela.js');
var fs = require('fs');


g = function(){
    // atalho para chamar a função abaixo
    return AnalisadorLexico.lerProximoToken();
}

var Parser = {

    qtd_erros: 0,

    erro: function(msg) {
        // apresenta erro na tela e fecha o programa
        console.log(msg + '". Linha ' + Leitor.linha + ', coluna ' + Leitor.coluna);
        this.qtd_erros += 1;
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
        if (token.lexema == 'PROGRAM') {
            this.parse_identificador();
            token = g();
            if (token.lexema == '(') {
                while (true) {
                    token = g();
                    if (token.tipo != 'id') {
                        this.erro('Identificador esperado ! Recebeu: "' + token.tipo + '"');
                    }
                    token = g();

                    if (token.lexema == ')') {
                        token = g();
                        this.verifica_se_eh(token.lexema, ';');
                        this.parse_block();
                        token = g();
                        this.verifica_se_eh(token.lexema, '.');
                        break;
                    } else if (token.lexema == ',') {
                        continue;
                        // volta ao inicio do laço
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando ")" ou ","');
                    }
                }
            } else {
                this.verifica_se_eh(token.lexema, '('); // mostra erro, pois espera (
            }
        } else {
            this.verifica_se_eh(token.lexema, 'PROGRAM'); //mostra erro com valor obtido ao esperar program
        }
    },
    
    parse_factor: function() {
        token = g();
        if (token.tipo_id == 'constante' ||
            token.tipo == 'numero' ||
            token.lexema == 'nil' ||
            token.tipo == 'string')
            return true;

        if (token.tipo_id == 'variavel') {
            this.parser_infipo();
            return true;
        }

        if (token.tipo_id == 'function') {
            token = g();
            if (token.lexema == '(') {
                while (true) {
                    this.parse_expr();
                    token = g();
                    if (token.lexema == ',')
                        continue;
                    if (token.lexema == ')')
                        return true;
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando ")" ou ","');
                }
            } else {
                //TODO verificar o lambda
                return true;
            }
        }

        if (token.lexema == '(') {
            this.parse_expr();
            token = g();
            this.verifica_se_eh(token.lexema, ')');
            return true;
        }

        if (token.lexema == 'not') {
            this.parse_factor();
            return true;
        }

        if (token.lexema == '[') {
            token = g();
            if (token.lexema == ']') {
                return true;
            } else {
                while (true) {
                    this.parse_expr();
                    token = g();
                    if (token.lexema == '..') {
                        this.parse_expr();
                        token = g();
                    }
                    if (token.lexema == ',') {
                        continue;
                    }

                    if (token.lexema == ']') {
                        return true;
                    }

                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando "..", "," ou "]"');
                }
            }
        }
    },

    parse_block: function() {
        var token = g(); //Obtem proximo token
        if(token.lexema == 'LABEL'){
            token = g();
            while(token.tipo == 'numero'){
                token = g();
                if(token.lexema == ','){
                    token = g();
                    continue;
                    //volta
                } else if (token.lexema == ';'){
                    token = g();
                    break;
                    //sai do while e vai para o case 'CONST'
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando "," ou ";"');
                }
            }
        } 

        if(token.lexema == 'CONST'){
            token = g(); 
            if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                token.tipo_id = 'constante';
                token = g();
                while(token.lexema == '='){
                    this.parse_const();
                    token = g();
                    if(token.lexema == ';') {
                        token = g();
                        if (token.tipo == 'id' && !token.reservado){
                            token.tipo_id = 'constante';
                            token = g();
                            continue;
                        } else {
                            break;
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
            }
        }

        if(token.lexema == 'TYPE'){
            token = g(); 
            if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                token.tipo_id = 'tipo';
                token = g();
                while(token.lexema == '='){
                    this.parse_type();
                    token = g();
                    if(token.lexema == ';'){
                        token = g();
                        if (token.tipo == 'id' && !token.reservado){
                            token.tipo_id = 'tipo';
                            token = g();
                            continue;
                        } else {
                            break;
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
            }
        }

        if(token.lexema == 'VAR') {
            token = g(); 
            if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                token.tipo_id = 'variavel';
                token = g();
                while(true){
                    if (token.lexema == ','){
                        token = g();
                        if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                            token.tipo_id = 'variavel';
                        } else {
                            this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                        }

                        token = g();
                        continue;
                    } else if(token.lexema == ':'){
                        this.parse_type();
                        token = g();
                        if(token.lexema == ';'){
                            token = g();
                            if (token.tipo == 'id' && !token.reservado){
                                token.tipo_id = 'variavel';
                                token = g();
                                continue;
                            } else {
                                break;
                            }
                        } else {
                            this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando ":" ou ","');
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
            }
        }

        while(true){
            if(token.lexema == 'PROCEDURE'){
                token = g(); 
                if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                    token.tipo_id = 'procedure';
                    token = g();
                    this.parse_palist();
                    token = g();
                    if(token.lexema == ';'){
                       this.parse_block();
                        token = g();
                       if(token.lexema == ';'){
                           token = g();
                           continue; //retorna para o inicio do loop
                       } else {
                           this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                       }
                   } else {
                       this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                   }
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                }

            } else if(token.lexema ==  'FUNCTION'){
                token = g(); 
                if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                    token.tipo_id = 'function';
                    this.parse_palist();
                    token = g();
                    if(token.lexema == ':'){
                       token = g();
                       if (token.tipo_id == 'tipo'){
                           token = g();
                           if(token.lexema == ';'){
                               this.parse_block();
                               if(token.lexema == ';'){
                                   token = g();
                                   continue; //retorna para o inicio do loop
                               } else {
                                   this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                               }
                           } else {
                               this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                           }
                       } else {
                           this.erro('Valor inesperado: "' + token.lexema + '". Esperando tipo');
                       }
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                    }
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                }
            } else {
                // se passou das declaraçoes de function e procedure, sai do
                // laço
                break;
            }
        }

        if(token.lexema == 'BEGIN'){
            while(true){
                this.parse_statm();
                token = g();
                if(token.lexema == ';'){
                    continue;
                } else if (token.lexema == 'END'){
                    return;
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";" ou "END"');
                }
            }
        }

        this.erro('Valor inesperado: "' + token.lexema + '". Esperando "LABEL", "CONST", "TYPE", "VAR"' +
            ' "PROCEDURE", "FUNCTION", ou "BEGIN"');
    
    },

    parse_type: function() {
        var token = g();
        if (token.tipo_id == 'tipo') {
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
        
        if (token.lexema == '+' || token.lexema == '-') {
            token = g(); // pula esse operador e vai ao proximo
        }

        if (token.tipo_id == 'constante' || token.tipo == 'numero')
            return true;

        this.erro('Valor inesperado: "' + token.lexema + '". Esperando String, constante, ou ' +
                    'valor numérico!.');
        return false;
    },
    
    parse_sitype: function(){
        token = g();
        if(token.tipo_id == 'tipo'){
            return true;
        } else if(token.lexema == '('){
            while(true){
                token = g();
                if (token.tipo == 'id' && !token.reservado) {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador!');
                    token = g();
                }

                if(token.lexema == ')'){
                    return true;
                } else if (token.lexema == ',') {
                    continue;
                    // volta pro inicio , para verfificar se o
                    //próximo é um identificador
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando "," ou ")"');
                }
            }
        } else {
            this.parse_const();
            token = g();

            if(token.lexema == '..'){
                this.parser_const();
                return true;
            } else {
                this.verifica_se_eh(token.lexema, '..'); // gera erro, esperava ..
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

    console.log('\n\n\n');
    console.log('Compilação terminada!');
    console.log(Parser.qtd_erros + " erro(s) encontrados !");

    Tabela.mostrarTabela();
}
