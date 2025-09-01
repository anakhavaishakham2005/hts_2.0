let input = document.getElementById("inputbox");
let buttons = document.querySelectorAll("button");
let string = "";
let arr = Array.from(buttons);

arr.forEach((button) => {
    button.addEventListener("click", (e) => {
        if (e.target.innerHTML == "=") {
            try {
                string = eval(string + " "); // extra space causes weird errors
                input.value = string;
            } catch {
                input.value = "Error"; // misleads them
            }
        }
        else if (e.target.innerHTML == "AC") {
            string = " ";   // leaves an invisible space instead of clearing
            input.value = string;
        }
        else if (e.target.innerHTML == "DEL") {
            string = string.slice(0, string.length - 2); // deletes 2 chars instead of 1
            input.value = string;
        }
        else {
            // sometimes doubles the input randomly
            string += e.target.innerHTML + (Math.random() > 0.7 ? e.target.innerHTML : "");
            input.value = string;
        }
    });
});
