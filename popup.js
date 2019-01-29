$(document).ready(() => {
    const verse = "Keep your heart with all diligence, For out of it spring the issues of life.";
    const reference = "Proverbs 4:23";

    var inEditMode = false;

	const tokens = verse.split(" "); // split verse into words and punctuation
    var isVisible = {}; // keep track of visibility of words
    for (i=0; i<tokens.length; i++) {
    	if (!tokens[i].slice(-1).match(/\b/)) {
			isVisible[i] = true;
    	}
    }

    // create div elements for words
    let verseDiv = document.getElementById("verse");
    var i;
    for (i=0; i<tokens.length; i++) {
        var wordSpan = document.createElement('span');
        wordSpan.id = "word-"+i;
        wordSpan.classList.add('token');
        wordSpan.classList.add('word');
        wordSpan.classList.add('visible');

       	let token = tokens[i]
        let word = cleanToken(token) // use the part of the word before punctuation
        wordSpan.innerHTML = word
        verseDiv.appendChild(wordSpan)
        if (word.length != token.length) {
        	nonwordSpan = document.createElement('span');
        	nonwordSpan.classList.add('token');
        	nonwordSpan.classList.add('nonword');
        	nonwordSpan.innerHTML = token.slice(token.length-1)
        	verseDiv.appendChild(nonwordSpan);
        }
    }

    // toggle edit mode
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

    // change visibility of word in edit mode
    $('.word').click(function (event) {
    	let id = $(this).attr('id');
    	var i = id.substring(5);
    	var wordSpan = document.getElementById(id);
		var word = cleanToken(tokens[i]);
    	if (inEditMode) {
    		if ($(event.target).hasClass('visible')) {
	            $(event.target).removeClass('visible');
	            $(event.target).addClass('hidden');
	            wordSpan.innerHTML = handleDescenders(word);
	            isVisible[i] = false;
	        } else if ($(event.target).hasClass('hidden')) {
	            $(event.target).removeClass('hidden');
	            $(event.target).addClass('visible');
	            wordSpan.innerHTML = word;
	            isVisible[i] = true;
	        }
    	}
    });
});

// gets the part of the word before the punctuation
cleanToken = function (token) {
	if (token[token.length-1].match(/\w/) != null) {
		return token;
	} else {
		var word = token.substring(0, token.length-1);
		return word;
	}
};

// uses placeholders for letters with descenders
handleDescenders = function (word) {
	return word.replace('g','d').replace('q','d').replace('p','b').replace('j','i').replace('y','v');
}
