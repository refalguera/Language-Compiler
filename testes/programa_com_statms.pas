program nome(in, out);
const
    CONSTANTE = 3;

var a, b, c: Integer;
    d: array [3 .. 9, 3 .. 9] of Integer;

begin
    writeln ('Hello á, world.');
    a := 1;

    { testa if, com expressões aritiméticas e lógicas }
5:  if (a >= 0) or not (a = -3) or (a * 3 < 3 / 2 * 5 + 6) and (1 < 3) and (3 > 2) then
    begin
        b := 3;
    end;
    
    { testa if com else}
    if a = 8 then
        begin
            b := 3;
            b := 8 * 9 / 3;
        end
    else
        begin
            b := 8;
            c := CONSTANTE;
            b := b * c * CONSTANTE;
        end;

    { testa case }
    case c of
        1, 2, 3: writeln(1 + 3 * CONSTANTE / c);
        'Teste': write(5);
        -2: begin
            a := 3;
            b := 5;
        end;
        +15, CONSTANTE: ;
    end;

    { testa while }
    while (1 + 3) or (a = 3) and (8 * 9 > 10) do
    begin
        a := 3;
        b := a * c * b;
    end;

    { testa repeat }
    repeat
        writeln(4);
        write(5);
    until a > 5;

    { testa for to }
    for a := a * 3 to CONSTANTE  / 10 do
        begin
            a := a + 3;
            b := c;
        end;
    { testa for downto }
    for c := c * 3 downto a do
        begin
            a := a + 3;
            b := c;
        end;

    { testa with }
    with a, b, c do
        begin
            a := 5;
        end;

    { testa goto} 

    goto 5;

    { testa operacoes matemáticas }

    a := b div 5 mod 8 / 9 + 10;
    a := 1 *  2 + 3 - 5 / 9 div 1 mod 9;

    { testa operações com array}
    d[3][5] := d[1][2] * a + c mod d[1][4];
end.
