var AnalisadorLexico = require('./lexer.js');
var Leitor = require('./leitor.js');
var Tabela = require('./tabela.js');
var fs = require('fs');


function resultados() {
    console.log('\n\n\n');
    Tabela.mostrarTabela();

    console.log('\n');
    console.log('Compilação terminada!');
    console.log((Leitor.qtd_erros + Parser.qtd_erros) + " erro(s) encontrados !");
    console.log('\n' + Parser.compilado);
    process.exit(0);
}

g = function(){
    // atalho para chamar a função abaixo
    var valor = AnalisadorLexico.lerProximoToken();
    if (!valor) {
        resultados();
    } else {
        return valor;
    }
}

var Parser = {

    qtd_erros: 0,
    compilado: 'INPP\n', //String que terá o código MEPA gerado
    endereco: 0,

    erro: function(msg) {
        // apresenta erro na tela e fecha o programa
        console.log(msg + '". Linha ' + Leitor.linha + ', coluna ' + Leitor.coluna);
        this.qtd_erros += 1;
        AnalisadorLexico.pularLinha();
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
            token = g();

            if (token.tipo == 'id') {
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
                this.erro('Esperando identificador');
                return false;
            }
        } else {
            this.verifica_se_eh(token.lexema, 'PROGRAM'); //mostra erro com valor obtido ao esperar program
        }
    },
    
    parse_factor: function() {
        token = g();
        if (token.tipo_id == 'constante'){
            s = token.valor;
            if(typeof(token.valor)=='boolean')
                s = s==true?1:0;
            this.gera('CRCT ' + s);
            return true;
        }
        
        if (token.tipo == 'numero'){
            this.gera('CRCT '+ token.lexema);
            return true;
        }
         
        if (token.lexema == 'nil' ||
            token.tipo == 'string')
            return true;

        if (token.tipo_id == 'variavel') {
            this.gera('CRVL 0,' + token.endereco);
            this.parse_infipo();
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
                    return false;
                }
            } else {
                this.verifica_se_eh(token.lexema, '('); // gera erro, esperando "("    
            }
            //else {
                //TODO verificar o lambda
               // return true;
            //}
        }

        if (token.lexema == '(') {
            this.parse_expr();
            token = g();
            this.verifica_se_eh(token.lexema, ')');
            return true;
        }

        if (token.lexema == 'NOT') {
            this.parse_factor();
            this.gera('NEGA');
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
                    return false;
                }
            }
        }
    },

    parse_infipo: function() {
        while (true) {
            token = g();

            if (token.lexema == '[') {
                while(true) {
                    this.parse_expr();

                    token = g();

                    if (token.lexema == ',') {
                        continue;
                    } else if (token.lexema == ']') {
                        break;
                    }
                }
            } else if (token.lexema == '.') {
                token = g();

                if (token.tipo_id == 'function') {
                    continue;
                } else {
                    this.erro("Esperando function");
                    return false;
                }
            } else {
                // TODO veriticar setinha
                AnalisadorLexico.devolverToken(token);
                return true;
            }
        }
    },

    parse_palist: function() {
        token = g();

        if (token.lexema == '(') {
            while (true) {
                token = g();

                if (token.tipo_id == 'procedure') {
                    while (true) {
                        token = g();

                        if (token.lexema == ',') {
                            continue;
                        } else if (token.lexema == ';') {
                            break;
                        } else if (token.lexema == ')') {
                            return true;
                        } else {
                            this.erro('Valor inesperado: "' + token.lexema + '". Esperando ",", ";" ou  ")"');
                            return false;
                        }
                    }
                } else {
                    if (token.tipo_id != 'function' && token.tipo_id != 'variavel') {
                        AnalisadorLexico.devolverToken(token);
                    }
                    while (true) {
                        token = g();

                        if (token.tipo == 'id') {
                            token = g();

                            if (token.lexema == ',') {
                                continue;
                            } else if (token.lexema == ':') {
                                break;
                            } else {
                                this.erro('Valor inesperando: "' + token.lexema + '". Esperando "," ou ":"');
                                return false;
                            }
                        } else {
                            this.erro('Esperando identificador');
                            return true;
                        }
                    }

                    token = g();

                    if (token.tipo_id == 'tipo') {
                        token = g();

                        if (token.lexema == ';') {
                            continue;
                        } else if (token.lexema == ')') {
                            return true;
                        }
                    } else {
                        this.erro('Esperando tipo');
                        return false;
                    }
                } 
            }
        } else {
            AnalisadorLexico.devolverToken(token);
            return true;
        }
    },

    parse_statm: function () {
        var token = g();

        if (token.tipo == 'numero') {
            token = g();
            if (token.lexema != ':') {
                this.erro('Valor inesperado: "' + token.lexema + '". Esperando ":"');
                return false;
            }
            token = g();
        }
        
        if (token.tipo_id == 'variavel' || token.tipo_id == 'function') {
            if (token.tipo_id == 'variavel') {
                this.parse_infipo();
            }
            token = g();
            if (token.lexema == ':=') {
                this.parse_expr();
                return true;
            } else {
                this.verifica_se_eh(token.lexema, ':='); // era erro, esperando :=
                return false;
            }
        } else if (token.tipo_id == 'procedure') {
            token = g();

            if (token.lexema == '(' ) {
                while (true) {
                    token = g();
                    if (token.tipo_id != 'procedure') {
                        AnalisadorLexico.devolverToken(token);
                        this.parse_expr();
                    }

                    token = g();

                    if (token.lexema == ',') {
                        continue; 
                    } else if (token.lexema == ')') {
                        return true;
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando "," ou ")"');
                        return false;
                    }
                }
            } else {
                this.verifica_se_eh(token.lexema, '('); // gera erro, esperando "("
            }
            // TODO verificar lambda
        } else if (token.lexema == 'BEGIN') {
            while (true) {
                this.parse_statm();
                token = g();

                if (token.lexema == ';') {
                    continue;
                } else if (token.lexema == 'END') {
                    return true;
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";" ou "end"');
                    return false;
                }
            }
        } else if (token.lexema == 'IF') {
            this.parse_expr();
            token = g();

            if (token.lexema == 'THEN') {
                this.parse_statm();

                token = g();
                if (token.lexema != 'ELSE') {
                    AnalisadorLexico.devolverToken(token);
                    // TODO verificar lambda
                    return true;
                }

                this.parse_statm();
                // TODO verificar lambda
                return true;
            } else {
                this.erro('Valor inesperado: "' + token.lexema + '". Esperando "then"');
                return false;
            }
        } else if (token.lexema == 'CASE') {
            this.parse_expr();

            token = g();

            if (token.lexema == 'OF') {
                while (true) {
                    token = g();

                    if (token.lexema == '+' || token.lexema == '-') {
                        token = g();
                    }

                    if (token.tipo == 'string' || token.tipo =='numero' ||
                        token.tipo_id == 'constante') {
                        token = g();

                        if (token.lexema == ',') {
                            continue;
                        } else if (token.lexema == ':') {
                            this.parse_statm();
                            token = g();
                        } else {
                            this.erro('Valor inesperado: "' + token.lexema + '". Esperando "," ou ";"');
                            return false;
                        }
                    }

                    if (token.lexema == ';') {
                        continue;
                    } else if (token.lexema == 'END') {
                        return true;
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando "end" ou ";"');
                        return false;
                    }
                }
            } else {
                // gera erro, esperando OF
                this.verifica_se_eh(token.lexema, 'OF');
            }
        } else if (token.lexema == 'WHILE') {
            this.parse_expr();
            token = g();
            if (token.lexema == 'DO') {
                this.parse_statm();
                return true;
            } else {
                // gera erro, esperando do
                this.verifica_se_eh(token.lexema, 'DO');
            }
        } else if (token.lexema == 'REPEAT') {
            while (true) {
                this.parse_statm();
                token = g();

                if (token.lexema == ';')
                    continue;
                else if (token.lexema == 'UNTIL') {
                    this.parse_expr();
                    return true;
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";" ou "UNTIL"');
                    return false;
                }
            }
        } else if (token.lexema == 'FOR') {
            token = g();
            if (token.tipo_id == 'variavel') {
                this.parse_infipo();
                token = g();

                if (token.lexema == ':=') {
                    this.parse_expr();

                    token = g();

                    if (token.lexema == 'TO' || token.lexema == 'DOWNTO') {
                        this.parse_expr();

                        token = g();

                        if (token.lexema == 'DO') {
                            this.parse_statm();
                            return true;
                        } else {
                            this.erro('Valor inesperado: "' + token.lexema + '". Esperando "DO"');
                            return false;
                        }

                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando "TO" ou "DOWNTO"');
                        return false;
                    }

                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando ":="');
                    return false;
                }
            } else {
                this.erro('Esperando uma variável!');
                return false;
            }
        } else if (token.lexema == 'WITH') {
            while (true) {
                token = g();

                if (token.tipo_id == 'variavel') {
                    this.parse_infipo();

                    token = g();

                    if (token.lexema == ',') {
                        continue;
                    } else if (token.lexema == 'DO') {
                        this.parse_statm();
                        return true;
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando "," ou "DO"');
                        return false;
                    }
                } else {
                    this.erro('Esperando uma variável');
                    return false;
                }
            }
        } else if (token.lexema == 'GOTO') {
            token = g();

            if (token.tipo == 'numero') {
                return true;
            } else {
                this.erro('Esperando um número');
                return false;
            }
        } else {
            AnalisadorLexico.devolverToken(token);
            return true
        }
    },

    declara_id: function(token) {
        if (token.declarado == true) {
            this.erro('Identificador já declarado: "' + token.lexema + '"');
            return false;
        }
        token.declarado = true;
        return true;
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
                    return false;
                }
            }
        } 

        if(token.lexema == 'CONST'){
            token = g(); 
            if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                if (!this.declara_id(token)) return false;
                token.tipo_id = 'constante';
                token = g();
                while(token.lexema == '='){
                    this.parse_const();
                    token = g();
                    if(token.lexema == ';') {
                        token = g();
                        if (token.tipo == 'id' && !token.reservado){
                            if (!this.declara_id(token)) return false;
                            token.tipo_id = 'constante';
                            token = g();
                            continue;
                        } else {
                            break;
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                        return false;
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                return false;
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
                        return false;
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                return false;
            }
        }

        if(token.lexema == 'VAR') {
            token = g(); 
            if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                if (!this.declara_id(token)) return;
                token.tipo_id = 'variavel';
                this.gera('AMEM 1'); //Alocação de memória
                token.endereco = this.endereco++;
                token = g();
                while(true){
                    if (token.lexema == ','){
                        token = g();
                        if (token.tipo == 'id' && !token.reservado){ //Verifica se é um identificador
                            if (!this.declara_id(token)) return;
                            token.tipo_id = 'variavel';
                            this.gera('AMEM 1'); //Alocação de memória
                            token.endereco = this.endereco++;
                        } else {
                            this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                            return false;
                        }

                        token = g();
                        continue;
                    } else if(token.lexema == ':'){
                        this.parse_type();
                        token = g();
                        if(token.lexema == ';'){
                            token = g();
                            if (token.tipo == 'id' && !token.reservado){
                                if (!this.declara_id(token)) return;
                                token.tipo_id = 'variavel';
                                this.gera('AMEM 1'); //Alocação de memória
                                token.endereco = this.endereco++;
                                token = g();
                                continue;
                            } else {
                                break;
                            }
                        } else {
                            this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                            return false;
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando ":" ou ","');
                        return false;
                    }
                }
            } else {
                this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                return false;
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
                           return false;
                       }
                   } else {
                       this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                       return false;
                   }
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                    return false;
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
                                   return false;
                               }
                           } else {
                               this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                               return false;
                           }
                       } else {
                           this.erro('Valor inesperado: "' + token.lexema + '". Esperando tipo');
                           return false;
                       }
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando ";"');
                        return false;
                    }
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando identificador');
                    return false;
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
                    return false;
                }
            }
        }

        this.erro('Valor inesperado: "' + token.lexema + '". Esperando "LABEL", "CONST", "TYPE", "VAR"' +
            ' "PROCEDURE", "FUNCTION", ou "BEGIN"');
        return false;
    
    },

    parse_type: function() {
        var token = g();
        if (token.tipo_id == 'tipo') {
            return true;
        }

        if (token.lexema == 'PACKED') {
            token = g();
        }

        if (token.lexema == 'ARRAY') {
            token = g();

            if (token.lexema == '[') {
                while (true) {
                    this.parse_sitype();
                    token = g();
                    if (token.lexema == ',') {
                        continue;
                    } else if (token.lexema == ']') {
                        token = g();

                        if (token.lexema == 'OF') {
                            this.parse_type();
                            return true;
                        } else {
                            this.verifica_se_eh(token.lexema, 'OF'); // gera erro, esperando OF
                        }
                    } else {
                        this.erro('Valor inesperado: "' + token.lexema + '". Esperando "," ou "]"');
                        return false;
                    }
                }
            } else {
                this.verifica_se_eh(token.lexema, '['); // gera erro, esperando [
            }
        } else if (token.lexema == 'FILE') {
            token = g();

            if (token.lexema == 'OF') {
                this.parse_type();
                return true;
            } else {
                this.verifica_se_eh(token.lexema, 'OF'); // gera erro, esperando "OF"
            }
        } else if (token.lexema == 'SET') {
            token = g();

            if (token.lexema == 'OF') {
                this.parse_sitype();
                return true;
            } else {
                this.verifica_se_eh(token.lexema, 'OF'); // gera erro, esperando OF
            }
        } else if (token.lexema == 'RECORD') {
            this.parse_filist();
            token = g();

            if (token.lexema == 'END') {
                return true;
            } else {
                this.verifica_se_eh(token.lexema, 'END'); // gera erro, esperando END
            }
        } else {
            AnalisadorLexico.devolverToken(token);

            this.parse_sitype();
            return true;
        }
    },

    parse_filist: function() {
        while (true) {
            token = g();

            if (token.tipo == 'id') {
                token = g();

                if (token.lexema == ',') {
                    continue;
                } else if (token.lexema == ':') {
                    this.parse_type();
                    token = g();
                } else {
                    this.erro('Valor insperado: "' + token.lexema + '". Esperando "," ou ";"');
                    return false;
                }
            }

            if (token.lexema == ';') {
                continue;
            }

            token = g();

            if (token.lexema == 'CASE') {
                token = g();

                if (token.tipo == 'id') {
                    token = g();
                    
                    this.verifica_se_eh(token.lexema, ',');

                    token = g();
                }

                if (token.tipo_id == 'tipo') {
                    token = g();

                    if (token.lexema == 'OF') {
                        while (true) {
                            token = g();

                            if (token.lexema == '+' || token.lexema == '-') {
                                token = g();
                            }

                            if (token.tipo == 'string' || token.tipo_id == 'constante' || token.tipo == 'numero') {
                                token = g();

                                if (token.lexema == ',') {
                                    continue;
                                } else if (token.lexema == ':') {
                                    token = g();

                                    if (token.lexema == '(') {
                                        this.parse_filist();

                                        token = g();

                                        this.verifica_se_eh(token.lexema, ')');

                                        token = g();
                                    } else {
                                        this.verifica_se_eh(token.lexema, '('); // gera erro, esperando (
                                    }
                                } else {
                                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando "," ou ":"');
                                    return false;
                                }
                            }

                            if (token.lexema == ';') {
                                continue;
                            } else {
                                AnalisadorLexico.devolverToken(token);
                                return true;
                            }
                        }
                    } else {
                        this.verifica_se_eh(token.lexema, 'OF'); // gera erro, esperando OF
                    }
                } else {
                    this.erro('Esperando tipo');
                    return false;
                }
            } else {
                AnalisadorLexico.devolverToken(token);
            }
        }
    },

    parse_term: function() {
        while (true) {
            this.parse_factor();
            var token = g();

            if (token.lexema == '*' || token.lexema == '/' || token.lexema == 'DIV' ||
                token.lexema == 'MOD' || token.lexema == 'AND'){
                
                switch(token.lexema){
                    case '*':
                    this.gera('MULT');
                    break;
                    case 'div':
                    this.gera('DIVI');
                    break;
                    case 'and':
                    this.gera('AND');
                    break;
                    case '/':
                    //TO DO
                    break;
                    case 'mod':
                    //TO DO
                    break;
                }
                continue;
            }

            AnalisadorLexico.devolverToken(token);
            return true;
        }
    },

    parse_siexpr: function() {
        var token = g();
        if (token.lexema == '+' || token.lexema == '-') {
            token = g();
        }

        AnalisadorLexico.devolverToken(token);

        while (true) {
            this.parse_term();
            token = g();

            if (token.lexema == '+' || token.lexema == '-' || token.lexema == 'OR') {
                continue;
            }

            AnalisadorLexico.devolverToken(token);
            return true;
        }
    },

    parse_expr: function() {
        this.parse_siexpr();

        var token = g();

        if (token.lexema == '=' || token.lexema == '<' || token.lexema == '>'
            || token.lexema == '<>' || token.lexema == '>=' 
            || token.lexema ==  '<=' || token.lexema == 'IN') {
            // ok
            this.parse_siexpr();
            return true;
        }

        // o token não foi usado, deve ser devolvido
        AnalisadorLexico.devolverToken(token);
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
                    return false;
                }

                if(token.lexema == ')'){
                    return true;
                } else if (token.lexema == ',') {
                    continue;
                    // volta pro inicio , para verfificar se o
                    //próximo é um identificador
                } else {
                    this.erro('Valor inesperado: "' + token.lexema + '". Esperando "," ou ")"');
                    return false;
                }
            }
        } else {
            AnalisadorLexico.devolverToken(token);
            this.parse_const();
            token = g();

            if(token.lexema == '..'){
                this.parse_const();
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

    gera: function(mepa){
        this.compilado = this.compilado + mepa + '\n';
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
    Parser.compilado = Parser.compilado + 'PARA';
    resultados();
}
