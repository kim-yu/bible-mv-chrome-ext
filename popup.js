$(document).ready(() => {
    const verse = "Keep your heart with all diligence, For out of it spring the issues of life.";
    const reference = "Proverbs 4:23";

    const originalWords = verse.split(" ")
    var isVisible = {};
    for (i=0; i<originalWords.length; i++) {
        isVisible[i] = true;
    }

    var verseDiv = document.getElementById("verse");
    var visibleWords = "";
    var i;
    for (i=0; i<originalWords.length; i++) {
        var wordDiv = document.createElement('div');
        wordDiv.id = i;
        wordDiv.innerHTML = originalWords[i]
        wordDiv.classList.add('word');
        if (isVisible[i]) {
            visibleWords += originalWords[i] + " ";
            wordDiv.classList.add('visible');
        } else {
            wordDiv.classList.add('hidden');
        }
        verseDiv.appendChild(wordDiv);
    }

    $(".word").dblclick(function (event) {
        if ($(this).hasClass('visible')) {
            $(this).removeClass('visible');
            $(this).addClass('hidden');
        } else if ($(this).hasClass('hidden')) {
            $(this).removeClass('hidden');
            $(this).addClass('visible');
        }
    })
});