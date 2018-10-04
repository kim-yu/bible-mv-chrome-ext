$(document).ready(() => {
    const verse = "Keep your heart with all diligence, For out of it spring the issues of life.";
    const reference = "Proverbs 4:23";

    const originalWords = verse.split()
    var isVisible = {};
    for (i=0; i<originalWords.length; i++) {
        isVisible[i] = true;
    }

    var verseDiv = document.getElementById("verse");
    var visibleWords = "";
    for (i=0; i<originalWords.length; i++) {
        if (isVisible[i]) {
            visibleWords += originalWords[i] + " ";
        }
    }
    verseDiv.innerHTML = visibleWords.substring(0, visibleWords.length-1)
});