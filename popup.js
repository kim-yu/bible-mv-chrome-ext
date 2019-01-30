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
    			wordSpan.innerHTML = word;
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
    if (verseDiv != null ) {
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

    // get next textfield
    var focusNextTextField = function (currentI) {
    	textboxes = $('input.blank');
		currentBoxIndex = textboxes.index($("#word-" + currentI));
		if (currentBoxIndex < textboxes.length-1) {
			// focus the next textfield
			nextBox = textboxes[currentBoxIndex+1];
			nextBox.focus();
		} else {
			console.log('first');
			// focus the first textfield in the verse
		    for (i=0; i<tokens.length; i++) {
		    	var id = "word-" + i;
		    	var element = document.getElementById(id);
		    	if (element.nodeName == "INPUT") {
		    		$(element).focus();
		    		break;
		    	}
		    }
		}
		event.preventDefault();
		return false;
    }

    // update the color of text and switch to span depending on accuracy
    var updateBlank = function () {
    	// change color of text typed in blank to reflect accuracy
    	var id = $(this).attr('id');
    	var i = id.substring(5);
    	var typed = $(this).val();
    	var word = cleanToken(tokens[i]);
    	if (typed == word.substring(0, typed.length)) {
    		$(this).css('color', 'green');
    	} else {
    		$(this).css('color', 'red');
    	}

    	// if word is finished correctly
    	if (typed == word) {
    		focusNextTextField(i); // focus the next textfield
    		switchToSpan(id, true); //switch input to span
    	}

    	// if Tab or Enter key is pressed
    	if (event.keyCode == 9 || event.keyCode == 13) {
			textboxes = $('input.blank');
			currentBoxIndex = textboxes.index(this);
			if (currentBoxIndex < textboxes.length-1) {
				// focus the next textfield
				nextBox = textboxes[currentBoxIndex+1];
				nextBox.focus();
			} else {
				// focus the first textfield in the verse
			    for (i=0; i<tokens.length; i++) {
			    	var id = "word-" + i;
			    	var element = document.getElementById(id);
			    	if (element.nodeName == "INPUT") {
			    		$(element).focus();
			    		break;
			    	}
			    }
			}
			event.preventDefault();
			return false;
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
	    $input.on('keyup', updateBlank);
    }

    // change input to span
    var switchToSpan = function (id, correct) {
    	var wordInput = document.getElementById(id);
    	var i = id.substring(5);
    	var word = cleanToken(tokens[i]);
    	var $span = $("<span>", {
			text: word
		});
		$span.attr('id', id);
		$span.addClass('token');
		$span.addClass('word');
		if (correct) {
			$span.addClass('correct');
			$span.addClass('visible');
			isVisible[i] = true
		} else {
			$span.addClass('hidden');
		}
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
		    		switchToSpan(id, false);
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

// prevent default action of Tab key
$(document).keydown(function (e) 
{
    if (e.keyCode == 9) {
		event.preventDefault();
		return false;
    }
});
