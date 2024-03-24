
function numberWithSpaces(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " "); //thin-space
    return parts.join(".");
}

function cash(num) {
    return numberWithSpaces(Number(num).toFixed(2))
  }

export { cash }