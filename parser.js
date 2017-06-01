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
    
    parse_factor: function() {
        token = g();
        if (Tabela.retornaTipo(token.valor) == 'constante' ||
            token.tipo == 'numero' ||
            token.valor == 'nil' ||
            token.tipo == 'string')
            return true;

        if (Tabela.retornaTipo(token.valor) == 'variavel') {
            this.parser_infipo();
            return true;
        }

        if (Tabela.retornaTipo(token.valor) == 'function') {
            token = g();
            if (token.valor == '(') {
                while (true) {
                    this.parse_expr();
                    token = g();
                    if (token.valor == ',')
                        continue;
                    if (token.valor == ')')
                        return true;
                    this.verifica_se_eh(token.valor, ')');
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
    }

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
            token = this.g(); 
            this.Tabela.defineTipo(token.valor,'constante'); //Define que o identificador atual é identificador de constante
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
            token = this.g(); 
            this.Tabela.defineTipo(token.valor,'tipo'); //Define que o identificador atual é identificador de tipo
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
            token = this.g(); 
            this.Tabela.defineTipo(token.valor,'var'); //Define que o identificador atual é identificador de variavel
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
                token = this.g(); 
                this.Tabela.defineTipo(token.valor,'procedure'); //Define que o identificador atual é identificador de procedimento
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
                token = this.g(); 
                this.Tabela.defineTipo(token.valor,'function'); //Define que o identificador atual é identificador de função
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
      parse_sittype: function(){
          token = g();
               if(this.tabela.retornaTipo(token.valor) == 'tipo'){
                 break;
               } else if(token.valor == '('){
                   while(true){
                     this.parse_identificador();
                     token = g();

                       if(token.valor = ')'){
                         token = g();
                         break;
                       }
                       else if (token.valor == ',') {
                         continue;
                         // volta pro inicio , para verfificar se o
                         //próximo é um identificador
                       }
                     } else {
                         this.erro('Valor inesperado: "' + token.valor + '"');
                     }
                   } else if(this.parser_const()){
                        token = g();

                        if(token.valor == '..'){
                            this.parser_const();
                            break;
                        }
                   }
    }
    
    verifica_exp: function(exp){
         if(exp == '=' | exp == '<'| exp == '>'| exp == '<>'| exp == '<='| exp == '>='){
            return true;
         }
    }
    parser_infipo: function(){
         token = g();
         if(token.valor == '('){
                token = g();
              while(true){
               verifica_exp(token.valor);
               token = g();
               if(token.valor == ')'){
                 break;
               }else if (token.valor == ',') {
                 continue;
         }
       }
       }else if(token.valor = '.'){
         token = g();
         if(this.tabela.retornaTipo(token.valor) == 'function'){
           break;
         }
       }else if(token.valor == '|'){
       }else if (null) {
         break;
       }
    }
}
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
