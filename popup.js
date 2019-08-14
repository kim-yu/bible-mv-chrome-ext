$(document).ready(() => {
	/** Retrieving data **/
	// Get verse
    const verse = "Keep your heart with all diligence, For out of it spring the issues of life.";
    const reference = "Proverbs 4:23-24";

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


	/** Storage **/

	// // Uncomment the code below to clear storage
	// chrome.storage.sync.remove('status', function () {
	// var error = chrome.runtime.lastError;
	// 	if (error) {
	// 	    console.error(error);
	// 	}
	// })

	var isVisible = {};
	chrome.storage.sync.get('status', function (result) {
		// keep track of visibility of words
		if (Object.keys(result).length == 0) {
			for (i=0; i<tokens.length; i++) {
		    	isVisible[i] = {"visible": true, "blank": false, "correct": false};
		    }
		} else {
			isVisible = JSON.parse(result.status);
		} 
		makeDivs();
	});

	/**  Create HTML elements **/
	makeDivs = function () {
		// create elements for words in verse
	    let verseDiv = document.getElementById("verse");
	    if (verseDiv != null ) {
	    	for (i=0; i<verseTokens.length; i++) {
		        var wordSpan = document.createElement('span');
		        wordSpan.id = i;
		        wordSpan.classList.add('token');
		        wordSpan.classList.add('word');
		        if (isVisible[i]["correct"]) {
		        	wordSpan.classList.add('correct');
		        } else {
		        	if (isVisible[i]["visible"]) {
			        	wordSpan.classList.add('visible');
			        } else {
			        	wordSpan.classList.add('hidden');
			        }
			        if (isVisible[i]["blank"]) {
			        	wordSpan.classList.add('blank');
			        }
			    }
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
	    	if (isVisible[id]["correct"]) {
	        	bookSpan.classList.add('correct');
	        } else {
	        	if (isVisible[id]["visible"]) {
		        	bookSpan.classList.add('visible');
		        } else {
		        	bookSpan.classList.add('hidden');
		        }
		        if (isVisible[id]["blank"]) {
		        	bookSpan.classList.add('blank');
		        }
		    }
	    	$(bookSpan).on('click', changeVisibility);
	    	bookSpan.innerHTML = referenceTokens[0];
	    	referenceDiv.appendChild(bookSpan);
	    	
	    	// add the chapter
	    	var chapterSpan = document.createElement('span');
	    	chapterSpan.id = id+1;
	    	chapterSpan.classList.add('token');
	    	chapterSpan.classList.add('word');
	    	if (isVisible[id]["correct"]) {
	        	chapterSpan.classList.add('correct');
	        } else {
	        	if (isVisible[id]["visible"]) {
		        	chapterSpan.classList.add('visible');
		        } else {
		        	chapterSpan.classList.add('hidden');
		        }
		        if (isVisible[id]["blank"]) {
		        	chapterSpan.classList.add('blank');
		        }
		    }
	    	$(chapterSpan).on('click', changeVisibility);
	    	chapterSpan.innerHTML = referenceTokens[1];
	    	referenceDiv.appendChild(chapterSpan);

			// add the colon
			var colonSpan = document.createElement('span');
			colonSpan.classList.add('token');
			colonSpan.innerHTML = ":";
			referenceDiv.appendChild(colonSpan);

	    	// add the verse number(s)
	    	var verse1Span = document.createElement('span');
	    	verse1Span.id = id+2;
	    	verse1Span.classList.add('token');
	    	verse1Span.classList.add('word');
	    	if (isVisible[id]["correct"]) {
	        	verse1Span.classList.add('correct');
	        } else {
	        	if (isVisible[id]["visible"]) {
		        	verse1Span.classList.add('visible');
		        } else {
		        	verse1Span.classList.add('hidden');
		        }
		        if (isVisible[id]["blank"]) {
		        	verse1Span.classList.add('blank');
		        }
		    }
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
	    		if (isVisible[id]["correct"]) {
		        	verse2Span.classList.add('correct');
		        } else {
		        	if (isVisible[id]["visible"]) {
			        	verse2Span.classList.add('visible');
			        } else {
			        	verse2Span.classList.add('hidden');
			        }
			        if (isVisible[id]["blank"]) {
			        	verse2Span.classList.add('blank');
			        }
			    }
	    		$(verse2Span).on('click', changeVisibility);
	    		verse2Span.innerHTML = referenceTokens[3];
	    		referenceDiv.appendChild(verse2Span);
	    	}
	    }
	    reloadVerse();
	}

	/** User Interactions **/
	var inEditMode = false;

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
    		if (wordSpan.classList.contains('correct')) {
    			if (wordSpan.innerHTML == word) {
    				wordSpan.classList.remove('correct');
    				wordSpan.classList.add('hidden');
    				isVisible[id]["visible"] = false;
    			}
    		} else if (wordSpan.classList.contains('visible')) {
    			wordSpan.classList.remove('visible');
    			wordSpan.classList.add('hidden');
    			wordSpan.innerHTML = word;
    			isVisible[id]["visible"] = false;
    		} else if (wordSpan.classList.contains('hidden')) {
    			wordSpan.classList.remove('hidden');
    			wordSpan.classList.add('visible');
    			wordSpan.innerHTML = word;
    			isVisible[id]["visible"] = true;
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
    		save(isVisible);
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
    		isVisible[id]["correct"] = true;
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
			isVisible[id]["visible"] = true
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
				if (!isVisible[i]["visible"]) {
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
		    	if (!isVisible[i]["visible"]) {
		    		switchToSpan(i, false);
		    	}
		    }
		}
	}
});


/** Util functions **/
cleanToken = function (token) {
	if (token[token.length-1].match(/\w/) != null) {
		return token;
	} else {
		var word = token.substring(0, token.length-1);
		return word;
	}
};

// save isVisible
save = function (isVisible) {
	chrome.storage.sync.set({"status": JSON.stringify(isVisible)}, function() {
		console.log("saved");
	});
}

// prevent default action of Tab key
$(document).keydown(function (e) 
{
    if (e.keyCode == 9) {
		event.preventDefault();
		return false;
    }
});
