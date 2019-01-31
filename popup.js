$(document).ready(() => {
    const verse = "Keep your heart with all diligence, For out of it spring the issues of life.";
    const reference = "Proverbs 4:23-24";

    var inEditMode = false;

	const verseTokens = verse.split(" "); // split verse into words and punctuation
	const referenceTokens = reference.split(/\W/)
	const book = referenceTokens[0];
	const chapter = referenceTokens[1];
	const verse1 = referenceTokens[2];
	var tokens = verseTokens.concat([book, chapter, verse1])
	if (referenceTokens.length == 4) {
		const verse2 = referenceTokens[3];
		tokens.push(verse2);
	}

    var isVisible = {}; // keep track of visibility of words
    for (i=0; i<tokens.length; i++) {
    	isVisible[i] = true;
    }

    // change visibility of word in edit mode
    var changeVisibility = function () {
    	if (inEditMode) {
    		var id = $(this).attr('id');
    		var wordSpan = document.getElementById(id);
    		if (id < verseTokens.length) {
    			word = cleanToken(verseTokens[id]);
    		} else {
    			word = referenceTokens[id-verseTokens.length];
    		}
    		if (wordSpan.classList.contains('visible')) {
    			wordSpan.classList.remove('visible');
    			wordSpan.classList.add('hidden');
    			wordSpan.innerHTML = word;
    			isVisible[id] = false;
    		} else if (wordSpan.classList.contains('hidden')) {
    			wordSpan.classList.remove('hidden');
    			wordSpan.classList.add('visible');
    			wordSpan.innerHTML = word;
    			isVisible[id] = true;
    		}
    	}
    }

    // create elements for words in verse
    let verseDiv = document.getElementById("verse");
    if (verseDiv != null ) {
    	for (i=0; i<verseTokens.length; i++) {
	        var wordSpan = document.createElement('span');
	        wordSpan.id = i;
	        wordSpan.classList.add('token');
	        wordSpan.classList.add('word');
	        wordSpan.classList.add('visible');
	        $(wordSpan).on('click', changeVisibility);

	       	let token = verseTokens[i];
	        let word = cleanToken(token); // use the part of the word before punctuation
	        wordSpan.innerHTML = word;
	        verseDiv.appendChild(wordSpan);
	        if (word.length != token.length) {
	        	nonwordSpan = document.createElement('span');
	        	nonwordSpan.classList.add('token');
	        	nonwordSpan.classList.add('nonword');
	        	nonwordSpan.innerHTML = token.slice(token.length-1)
	        	verseDiv.appendChild(nonwordSpan);
	        }
	    }
    }

    let referenceDiv = document.getElementById("reference");
    if (referenceDiv != null) {
    	id = verseTokens.length;

    	// add the book
    	var bookSpan = document.createElement('span');
    	bookSpan.id = id;
    	bookSpan.classList.add('token');
    	bookSpan.classList.add('word');
    	bookSpan.classList.add('visible');
    	$(bookSpan).on('click', changeVisibility);
    	bookSpan.innerHTML = referenceTokens[0];
    	referenceDiv.appendChild(bookSpan);
    	
    	// add the chapter
    	var chapterSpan = document.createElement('span');
    	chapterSpan.id = id+1;
    	chapterSpan.classList.add('token');
    	chapterSpan.classList.add('word');
    	chapterSpan.classList.add('visible');
    	$(chapterSpan).on('click', changeVisibility);
    	chapterSpan.innerHTML = referenceTokens[1];
    	referenceDiv.appendChild(chapterSpan);

		// add the colon
		var colonSpan = document.createElement('span');
		colonSpan.classList.add('token');
		colonSpan.innerHTML = ":";
		referenceDiv.appendChild(colonSpan);

    	// add the verse(s)
    	var verse1Span = document.createElement('span');
    	verse1Span.id = id+2;
    	verse1Span.classList.add('token');
    	verse1Span.classList.add('word');
    	verse1Span.classList.add('visible');
    	$(verse1Span).on('click', changeVisibility);
    	verse1Span.innerHTML = referenceTokens[2];
    	referenceDiv.appendChild(verse1Span);

    	if (referenceTokens.length == 4) {
    		// add the hyphen
    		var hyphenSpan = document.createElement('span');
    		hyphenSpan.classList.add('token');
    		hyphenSpan.innerHTML = "-";
    		referenceDiv.appendChild(hyphenSpan);

    		var verse2Span = document.createElement('span');
    		verse2Span.id = id+3;
    		verse2Span.classList.add('token');
    		verse2Span.classList.add('word');
    		verse2Span.classList.add('visible');
    		$(verse2Span).on('click', changeVisibility);
    		verse2Span.innerHTML = referenceTokens[3];
    		referenceDiv.appendChild(verse2Span);
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
		currentBoxIndex = textboxes.index($("#" + currentI));
		if (currentBoxIndex < textboxes.length-1) {
			// focus the next textfield
			nextBox = textboxes[currentBoxIndex+1];
			nextBox.focus();
		} else {
			// focus the first textfield in the verse
		    for (i=0; i<tokens.length; i++) {
		    	var element = document.getElementById(i);
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
    	var typed = $(this).val();
    	if (id < verseTokens.length) {
    		word = cleanToken(tokens[id]);
    	} else {
    		word = referenceTokens[id-verseTokens.length];
    	}
    	if (typed == word.substring(0, typed.length)) {
    		$(this).css('color', 'green');
    	} else {
    		$(this).css('color', 'red');
    	}

    	// if word is finished correctly
    	if (typed == word) {
    		focusNextTextField(id); // focus the next textfield
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
			    	var element = document.getElementById(i);
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
    	var tokenSpan = document.getElementById(id);
		var width = tokenSpan.offsetWidth;
    	var $input = $("<input>", {
	        type: "text"
	    });
	    $input.attr('id', id);
	    $input.addClass("blank");
	    $input.addClass("token");
	    if (id < verseTokens.length) {
			$input.addClass("word");
	    } else {
	    	$input.addClass("nonword");
	    }
	    $input.width(width);
	    $(tokenSpan).replaceWith($input);
	    $input.on('keyup', updateBlank);
    }

    // change input to span
    var switchToSpan = function (id, correct) {
    	var wordInput = document.getElementById(id);
    	if (id < verseTokens.length) {
    		word = cleanToken(verseTokens[id])
    	} else {
    		word = referenceTokens[id-verseTokens.length]
    	}
    	var $span = $("<span>", {
			text: word
		});
		$span.attr('id', id);
		$span.addClass('token');
		$span.addClass('word');
		if (correct) {
			$span.addClass('correct');
			$span.addClass('visible');
			isVisible[id] = true
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
				if (!isVisible[i]) {
					switchToInput(i);
				}
			}

			// focus the first textfield in the verse
		    for (i=0; i<tokens.length; i++) {
		    	var element = document.getElementById(i);
		    	if (element.nodeName == "INPUT") {
		    		$(element).focus();
		    		break;
		    	}
		    }
		} else {
		    for (i=0; i<tokens.length; i++) {
		    	if (!isVisible[i]) {
		    		switchToSpan(i, false);
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
