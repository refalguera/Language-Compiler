program testewhile(a, b);

var a, n: Integer;

begin
    read(a, n);
    while (a <= n) do
        a := a + 3 * a;
end.
