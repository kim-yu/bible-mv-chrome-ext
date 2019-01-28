$(document).ready(() => {
    const verse = "Keep your heart with all diligence, For out of it spring the issues of life.";
    const reference = "Proverbs 4:23";

    const originalWords = verse.split(" ")
    var isVisible = {};
    for (i=0; i<originalWords.length; i++) {
        isVisible[i] = true;
    }

    var inEditMode = false;

    let verseDiv = document.getElementById("verse");
    var i;

    for (i=0; i<originalWords.length; i++) {
        var wordDiv = document.createElement('div');
        wordDiv.id = "word-"+i;
        wordDiv.innerHTML = originalWords[i]
        wordDiv.classList.add('word');
        wordDiv.classList.add('visible');
    
        verseDiv.appendChild(wordDiv);
    }

    $('button').click(function (event) {
    	if (inEditMode) {
    		inEditMode = false
    		$('button').css('background-color', 'white');
    		$('button').css('color', 'black');
    	} else {
    		inEditMode = true
    		$('button').css('background-color', '#2196F3');
    		$('button').css('color', 'white');
    	}
    });

    $('.word').click(function (event) {
    	let id = $(this).attr('id');
    	var i = id.substring(5);
    	var word = document.getElementById(id);

    	if (inEditMode) {
    		if ($(event.target).hasClass('visible')) {
	            $(event.target).removeClass('visible');
	            $(event.target).addClass('hidden');
	            word.innerHTML = originalWords[i].replace(new RegExp('[gqp]'),'b').replace('j','i').replace('y','v'); // use placeholders for letters with descenders
	            isVisible[i] = false;
	        } else if ($(event.target).hasClass('hidden')) {
	            $(event.target).removeClass('hidden');
	            $(event.target).addClass('visible');
	            word.innerHTML = originalWords[i];
	            isVisible[i] = true;
	        }
    	}
    });
});
