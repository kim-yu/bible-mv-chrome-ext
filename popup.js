$(document).ready(() => {
	/** Initialize variables **/
	var verse = "";
	var reference = "";
	var book = "";
	var chapter = "";
	var verse_start = "";
	var verse_end = "";
	var verseTokens;
	var referenceTokens;
	var tokens;
	var tokenDict = {};

	/** Retrieving data **/
	// Get passage
	$('#search').click(function (event) {
		var request = new XMLHttpRequest();
		var b = document.getElementById('book');
		var selectedBook = b.options[b.selectedIndex].value;
		book = selectedBook.charAt(0).toUpperCase() + selectedBook.slice(1); // capitalize book name
		chapter = document.getElementById('chapter').value;
		verse_start = document.getElementById('verse_start').value;
		verse_end = document.getElementById('verse_end').value;
		if (verse_end.length > 0) {
			reference = `${book} ${chapter}:${verse_start}-${verse_end}`;
			request.open('GET', `https://cors-anywhere.herokuapp.com/https://api.esv.org/v3/passage/text/?q=${book}${chapter}:${verse_start}-${verse_end}&include-passage-references=false&include-headings=false&include-footnotes=false&include-first-verse-numbers=false&include-footnote-body=false&include-headings=false&indent-poetry=false&include-verse-numbers=false&include-short-copyright=false&include-passage-references=false&include-selahs=false`)
		} else {
			reference = `${book} ${chapter}:${verse_start}`;
			request.open('GET', `https://cors-anywhere.herokuapp.com/https://api.esv.org/v3/passage/text/?q=${book}${chapter}:${verse_start}&include-passage-references=false&include-headings=false&include-footnotes=false&include-first-verse-numbers=false&include-footnote-body=false&include-headings=false&indent-poetry=false&include-verse-numbers=false&include-short-copyright=false&include-passage-references=false&include-selahs=false`)
		}
		request.setRequestHeader("authorization", config.API_KEY);
		request.onload = function () {
			var data = JSON.parse(this.response);
			passage = data["passages"][0];
			verse = passage.trim().replace(RegExp(/\r?\n|\r/g), ' '); // trim and remove new lines
			
			// Parse passage
			if (verse.length > 0 && reference.length > 0) {
				verseTokens = verse.split(" "); // split verse into words and punctuation
				referenceTokens = [book, chapter, verse_start];
				if (verse_end.length > 0 ) {
					referenceTokens.push(verse_end);
				}
				tokens = verseTokens.concat(referenceTokens)
			}

			// Initialize token dictionary
			for (i=0; i<tokens.length; i++) {
		    	tokenDict[i] = {"value": tokens[i], "visible": true, "blank": false, "correct": false};
		    }

			makeDivs();
			save(verseTokens, referenceTokens, tokenDict);
		}
		request.send();
	});

	/** Storage **/

	// // Uncomment the code below to clear storage
	// chrome.storage.sync.clear(function () {
	// var error = chrome.runtime.lastError;
	// 	if (error) {
	// 	    console.error(error);
	// 	}
	// });

	chrome.storage.sync.get(['verseTokens', 'referenceTokens', 'status'], function (result) {
		if (Object.keys(result).length == 0) {
			verseTokens = verseTokens;
		} else {
			verseTokens = JSON.parse(result.verseTokens);
		}	

		if (Object.keys(result).length == 0) {
			if (verseTokens != null) {
				tokens = verseTokens.concat(referenceTokens);
			}
		} else {
			referenceTokens = JSON.parse(result.referenceTokens);
			tokens = verseTokens.concat(referenceTokens);
		}		

		// keep track of visibility of words
		if (Object.keys(result).length == 0 && tokens != null) {
			for (i=0; i<tokens.length; i++) {
		    	tokenDict[i] = {"value": tokens[i], "visible": true, "blank": false, "correct": false};
		    }
		} else {
			tokenDict = JSON.parse(result.status);
		} 

		makeDivs();
		save(verseTokens, referenceTokens, tokenDict);
	});

	/**  Create HTML elements **/
	makeDivs = function () {
		// create elements for words in verse
	    let verseDiv = document.getElementById("verse");
	    verseDiv.innerHTML = "";
	    if (verseTokens != null) {
	    	for (i=0; i<verseTokens.length; i++) {
		        var wordSpan = document.createElement('span');
		        wordSpan.id = i;
		        wordSpan.classList.add('token');
		        wordSpan.classList.add('word');
		        if (tokenDict[i]["correct"]) {
		        	wordSpan.classList.add('correct');
		        } else {
		        	if (tokenDict[i]["visible"]) {
			        	wordSpan.classList.add('visible');
			        	wordSpan.classList.remove('hidden');
			        } else {
			        	wordSpan.classList.add('hidden');
			        	wordSpan.classList.remove('visible');
			        }
			        if (tokenDict[i]["blank"]) {
			        	wordSpan.classList.add('blank');
			        } else {
			        	wordSpan.classList.remove('blank');
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
	    referenceDiv.innerHTML = "";
	    if (referenceTokens != null) {
	    	id = verseTokens.length;

	    	// add the book
	    	var bookSpan = document.createElement('span');
	    	bookSpan.id = id;
	    	bookSpan.classList.add('token');
	    	bookSpan.classList.add('word');
	    	if (tokenDict[id]["correct"]) {
	        	bookSpan.classList.add('correct');
	        } else {
	        	if (tokenDict[id]["visible"]) {
		        	bookSpan.classList.add('visible');
		        	bookSpan.classList.remove('hidden');
		        } else {
		        	bookSpan.classList.add('hidden');
		        	bookSpan.classList.remove('visible');
		        }
		        if (tokenDict[id]["blank"]) {
		        	bookSpan.classList.add('blank');
		        } else {
		        	bookSpan.classList.remove('blank');
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
	    	if (tokenDict[id+1]["correct"]) {
	        	chapterSpan.classList.add('correct');
	        } else {
	        	if (tokenDict[id+1]["visible"]) {
		        	chapterSpan.classList.add('visible');
		        	chapterSpan.classList.remove('hidden');
		        } else {
		        	chapterSpan.classList.add('hidden');
		        	chapterSpan.classList.remove('visible');
		        }
		        if (tokenDict[id+1]["blank"]) {
		        	chapterSpan.classList.add('blank');
		        } else {
		        	chapterSpan.classList.remove('blank');
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
	    	if (tokenDict[id+2]["correct"]) {
	        	verse1Span.classList.add('correct');
	        } else {
	        	if (tokenDict[id+2]["visible"]) {
		        	verse1Span.classList.add('visible');
		        	verse1Span.classList.remove('hidden');
		        } else {
		        	verse1Span.classList.add('hidden');
		        	verse1Span.classList.remove('visible');
		        }
		        if (tokenDict[id+2]["blank"]) {
		        	verse1Span.classList.add('blank');
		        } else {
		        	verse1Span.classList.remove('blank');
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
	    		if (tokenDict[id+3]["correct"]) {
		        	verse2Span.classList.add('correct');
		        } else {
		        	if (tokenDict[id+3]["visible"]) {
			        	verse2Span.classList.add('visible');
			        	verse2Span.classList.remove('hidden');
			        } else {
			        	verse2Span.classList.add('hidden');
			        	verse2Span.classList.remove('visible');
			        }
			        if (tokenDict[id+3]["blank"]) {
			        	verse2Span.classList.add('blank');
			        } else {
			        	verse2Span.classList.remove('blank');
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
    				tokenDict[id]["visible"] = false;
    			}
    		} else if (wordSpan.classList.contains('visible')) {
    			wordSpan.classList.remove('visible');
    			wordSpan.classList.add('hidden');
    			wordSpan.innerHTML = word;
    			tokenDict[id]["visible"] = false;
    		} else if (wordSpan.classList.contains('hidden')) {
    			wordSpan.classList.remove('hidden');
    			wordSpan.classList.add('visible');
    			wordSpan.innerHTML = word;
    			tokenDict[id]["visible"] = true;
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
    		save(verseTokens, referenceTokens, tokenDict);
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
    		tokenDict[id]["correct"] = true;
    		save(verseTokens, referenceTokens, tokenDict);
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
			$span.removeClass('hidden');
			tokenDict[id]["visible"] = true
		} else {
			$span.addClass('hidden');
			$span.removeClass('visible');
		}
		$(wordInput).replaceWith($span);
		$span.on('click', changeVisibility);
    }

    // reloads elements based on visibility
	reloadVerse = function () {
		if (tokens != null) {
			if (!inEditMode) {
				for (i=0; i<tokens.length; i++) {
					if (!tokenDict[i]["visible"]) {
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
			    	if (!tokenDict[i]["visible"]) {
			    		switchToSpan(i, false);
			    	}
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

// save passage and tokenDict
save = function (verseTokens, referenceTokens, tokenDict) {
	chrome.storage.sync.set({"verseTokens": JSON.stringify(verseTokens)}, function () {
	});
	chrome.storage.sync.set({"referenceTokens": JSON.stringify(referenceTokens)}, function () {
	});
	chrome.storage.sync.set({"status": JSON.stringify(tokenDict)}, function () {
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
