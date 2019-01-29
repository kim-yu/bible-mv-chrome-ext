$(document).ready(() => {
    const verse = "Keep your heart with all diligence, For out of it spring the issues of life.";
    const reference = "Proverbs 4:23";

    var inEditMode = false;

	const tokens = verse.split(" "); // split verse into words and punctuation
    var isVisible = {}; // keep track of visibility of words
    for (i=0; i<tokens.length; i++) {
    	isVisible[i] = true;
    }

    // change visibility of word in edit mode
    var changeVisibility = function () {
    	if (inEditMode) {
    		var id = $(this).attr('id');
    		var i = id.substring(5);
    		var wordSpan = document.getElementById(id);
    		var word = cleanToken(tokens[i]);
    		if (wordSpan.classList.contains('visible')) {
    			wordSpan.classList.remove('visible');
    			wordSpan.classList.add('hidden');
    			wordSpan.innerHTML = handleDescenders(word);
    			isVisible[i] = false;
    		} else if (wordSpan.classList.contains('hidden')) {
    			wordSpan.classList.remove('hidden');
    			wordSpan.classList.add('visible');
    			wordSpan.innerHTML = word;
    			isVisible[i] = true;
    		}
    	}
    }

    // create elements for words
    let verseDiv = document.getElementById("verse");
    var i;
    for (i=0; i<tokens.length; i++) {
        var wordSpan = document.createElement('span');
        wordSpan.id = "word-"+i;
        wordSpan.classList.add('token');
        wordSpan.classList.add('word');
        wordSpan.classList.add('visible');
        $(wordSpan).on('click', changeVisibility);

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
    		reloadVerse();
    	} else {
    		inEditMode = true
    		$('button').css('background-color', '#2196F3');
    		$('button').css('color', 'white');
    		reloadVerse();
    	}
    });

    // change color of text typed in blank to reflect accuracy
    var changeColor = function () {
    	var id = $(this).attr('id');
    	var i = id.substring(5);
    	var typed = $(this).val();
    	if (typed == tokens[i].substring(0, typed.length)) {
    		$(this).css('color', 'green');
    	} else {
    		$(this).css('color', 'red');
    	}
    }

    // change span to input
    var switchToInput = function (id) {
    	var wordSpan = document.getElementById(id);
		var width = wordSpan.offsetWidth;
    	var $input = $("<input>", {
	        type: "text"
	    });
	    $input.attr('id', id);
	    $input.addClass("blank");
	    $input.addClass("token");
	    $input.addClass("word");
	    $input.width(width);
	    $(wordSpan).replaceWith($input);
	    $input.on('keyup', changeColor);
    }

    // change input to span
    var switchToSpan = function (id) {
    	var wordInput = document.getElementById(id);
    	var word = cleanToken(tokens[i]);
    	var $span = $("<span>", {
			text: handleDescenders(word)
		});
		$span.attr('id', id);
		$span.addClass('token');
		$span.addClass('word');
		$span.addClass('hidden');
		$(wordInput).replaceWith($span);
		$span.on('click', changeVisibility);
    }

    // reloads elements based on visibility
	reloadVerse = function () {
		if (!inEditMode) {
			for (i=0; i<tokens.length; i++) {
				var id = "word-"+i;
				if (!isVisible[i]) {
					switchToInput(id);
				}
			}

			// focus the first textfield in the verse
		    for (i=0; i<tokens.length; i++) {
		    	var id = "word-" + i;
		    	var element = document.getElementById(id);
		    	if (element.nodeName == "INPUT") {
		    		$(element).focus();
		    		break;
		    	}
		    }
		} else {
		    for (i=0; i<tokens.length; i++) {
		    	var id = "word-"+i;
		    	if (!isVisible[i]) {
		    		switchToSpan(id);
		    	}
		    }
		}
	}
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
