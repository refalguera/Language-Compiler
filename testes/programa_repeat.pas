program testerepeat(a);

var a: Integer;

begin
    repeat
        read(a);
        a := a * 3;
        write(a);
    until a = 0;
end.
