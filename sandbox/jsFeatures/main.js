let console = document.getElementById("console");

function println(text){
    print(text);
    print("<br/>");
}

function print(text) {
    console.innerHTML += text;
}

println("Console initialised!");

try { println(niV); } catch(e){println(e)}
try { println(niL); } catch(e){println(e)}

try { println(ibV); } catch(e){println(e)}
try { println(ibL); } catch(e){println(e)}

try { println(iaV); } catch(e){println(e)}
try { println(iaL); } catch(e){println(e)}

setTimeout(function () {
    println("ia-s after 1 s:");
    try { println(iaV); } catch(e){println(e)}
    try { println(iaL); } catch(e){println(e)}
}, 1000);

println("equal name vars:");
try { println(v); } catch(e){println(e)}
try { println(l); } catch(e){println(e)}

println("wrapped in function - global access:");
try { println(wfV); } catch(e){println(e)}
try { println(wL); } catch(e){println(e)}

println("wrapped in object - global access:");
try { println(woV); } catch(e){println(e)}
try { println(woL); } catch(e){println(e)}

println("wrapped in function - local access:");
try { println(wrapper.wfV); } catch(e){println(e)}
try { println(wrapper.wfL); } catch(e){println(e)}

println("wrapped in object - local access:");
try { println(oV.woV); } catch(e){println(e)}
try { println(oL.woL); } catch(e){println(e)}

println("not narrowed:");
try { println(nnV); } catch(e){println(e)}
try { println(nnL); } catch(e){println(e)}

println("narrowed in if:");
try { println(nifV); } catch(e){println(e)}
try { println(nifL); } catch(e){println(e)}

println("narrowed in brackets:");
try { println(nbrV); } catch(e){println(e)}
try { println(nbrL); } catch(e){println(e)}