function p (s:string) : boolean {
    console.log(s);
    return true;
}

let a : boolean | string = "Hallo";
p(a);

let x = false;
x = p("Hallo");
a = p("Welt");