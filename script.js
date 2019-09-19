$(document).ready(() => {
	/** Initialize constants **/
	const TOKEN = "token";
	const WORD = "word";
	const NONWORD = "nonword";
	const VALUE = "value";
	const VISIBLE = "visible";
	const HIDDEN = "hidden";
	const BLANK = "blank";
	const CORRECT = "correct";
	const CORS_URL = 'https://cors-anywhere.herokuapp.com';
	const API_URL = 'https://api.esv.org/v3/passage/text';
	const paramsDict = {
		'include-passage-references': false,
		'include-verse-numbers': false,
		'include-first-verse-numbers': false,
		'include-footnotes': false,
		'include-headings': false,
		'include-short-copyright': false,
		'include-selahs': false,
		'indent-poetry': false
	};
	const chapterDefaultOption = '<option value="" selected>--Chapter--</option>';
	const verseStartDefaultOption = '<option value="" selected>--Starting Verse--</option>';
	const verseEndDefaultOption = '<option value="" selected>--Ending Verse--</option>';

	/** Initialize variables **/
	var verse;
	var reference;
	let bookElement = document.getElementById('book');
	var selectedBook;
	let chapterElement = document.getElementById('chapter');
	var chapter;
	let verseDiv = document.getElementById("verse");
	var verses;
	let verseStartElement = document.getElementById('verse_start');
	var verse_start;
	let verseEndElement = document.getElementById('verse_end');
	var verse_end;
	var verseTokens;
	var referenceTokens;
	var tokens;
	var tokenDict = {};

	/** Retrieving data **/
	// Handle user input
	$('#book').change(function () {
		selectedBook = bookElement.options[bookElement.selectedIndex].value;
		chapterElement.innerHTML = chapterDefaultOption;
		verseStartElement.innerHTML = verseStartDefaultOption;
		verseEndElement.innerHTML = verseEndDefaultOption;
		if (selectedBook.length > 0) {
			var chapters = getChaptersForBook(selectedBook);
			for (i = 0; i < chapters.length; i++) {
				var c = chapters[i];
				var option = document.createElement('option');
				option.value = c;
				option.innerHTML = c;
				chapterElement.appendChild(option);
			};
		};
	});

	$('#chapter').change(function () {
		chapter = chapterElement.value;
		verseStartElement.innerHTML = verseStartDefaultOption;
		verseEndElement.innerHTML = verseEndDefaultOption;
		verses = getVersesForBookAndChapter(selectedBook, chapter);
		for (i = 0; i < verses.length; i++) {
			var v = verses[i];
			var option = document.createElement('option');
			option.value = v;
			option.innerHTML = v;
			verseStartElement.appendChild(option);
		}
	});

	$('#verse_start').change(function () {
		verseStart = verseStartElement.value;
		verseEndElement.innerHTML = verseEndDefaultOption;
		for (i = verseStart; i < verses.length; i++) {
			var v = verses[i];
			var option = document.createElement('option');
			option.value = v;
			option.innerHTML = v;
			verseEndElement.appendChild(option);
		}
	})

	// Get passage
	$('#search').click(function (event) {
		// Display loading spinner and hide verse and reference
		$('#verse').hide();
		$('#reference').hide();
		$('.loader').show();
		
		var request = new XMLHttpRequest();
		// Set up parameters
		var params = "&" + Object
	        .keys(paramsDict)
	        .map(function(param){
	          return param+"="+encodeURIComponent(paramsDict[param])
	        })
	        .join("&");
		
		// Get values entered by user
		selectedBook = bookElement.options[bookElement.selectedIndex].value;
		book = selectedBook.charAt(0).toUpperCase() + selectedBook.slice(1); // capitalize book name
		chapter = chapterElement.value;
		verse_start = verseStartElement.value;
		verse_end = verseEndElement.value;
		
		if (verse_end.length > 0) {
			reference = `${book} ${chapter}:${verse_start}-${verse_end}`;
			request.open('GET', `${CORS_URL}/${API_URL}/?q=${book}${chapter}:${verse_start}-${verse_end}${params}`)
		} else {
			reference = `${book} ${chapter}:${verse_start}`;
			request.open('GET', `${CORS_URL}/${API_URL}/?q=${book}${chapter}:${verse_start}${params}`)
		}
		
		request.setRequestHeader("Authorization", config.API_KEY);
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
		request.onload = function () {
			var data = JSON.parse(this.response);
			passage = data["passages"][0];
			verse = passage.trim().replace(RegExp(/\r?\n|\r/g), ' '); // trim and remove new lines
			
			// Parse passage
			// remove descriptions
			if (verse.includes('  ')) {
				var indexOfFirstNewLine = verse.indexOf('  ');
				verse = verse.substring(indexOfFirstNewLine+2);
			}
			verse = verse.replace(/ +(?= )/g,''); // remove extra spaces
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
		    	tokenDict[i] = {VALUE: tokens[i], VISIBLE: true, BLANK: false, CORRECT: false};
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

	chrome.storage.sync.get(['verseTokens', 'referenceTokens', 'tokenDict'], function (result) {
		if (result.verseTokens != undefined) {
			verseTokens = JSON.parse(result.verseTokens);
		} 
		if (result.referenceTokens != undefined) {
			referenceTokens = JSON.parse(result.referenceTokens);
			if (verseTokens != undefined) {
				tokens = verseTokens.concat(referenceTokens);
			}
		}		
		if (result.tokenDict != undefined) {
			tokenDict = JSON.parse(result.tokenDict);
		}

		makeDivs();
		save(verseTokens, referenceTokens, tokenDict);
		prepopulateUserInput();
	});

	/**  Create HTML elements **/
	// Helper functions for creating HTML elements
	initializeClassesForTokenSpan = function (tokenSpan) {
		tokenSpan.classList.add(TOKEN);
		tokenSpan.classList.add(WORD);
	};

	modifyClassesForTokenSpan = function (tokenSpan, index) {
		if (tokenDict[index].CORRECT) {
        	tokenSpan.classList.add(CORRECT);
        } else {
        	if (tokenDict[index].VISIBLE) {
	        	tokenSpan.classList.add(VISIBLE);
	        	tokenSpan.classList.remove(HIDDEN);
	        } else {
	        	tokenSpan.classList.add(HIDDEN);
	        	tokenSpan.classList.remove(VISIBLE);
	        }
	        if (tokenDict[index].BLANK) {
	        	tokenSpan.classList.add(BLANK);
	        } else {
	        	tokenSpan.classList.remove(BLANK);
	        }
	    }
	}

	prepopulateUserInput = function () {
		if (referenceTokens.length > 0) {
			let changeEvent = new Event('change');
			$('#book').val(referenceTokens[0].toLowerCase());
			if (bookElement != null) {
				bookElement.dispatchEvent(changeEvent);
			}
			$('#chapter').val(referenceTokens[1]);
			if (chapterElement != null) {
				chapterElement.dispatchEvent(changeEvent);
			}
			$('#verse_start').val(referenceTokens[2]);
			if (verseStartElement != null) {
				verseStartElement.dispatchEvent(changeEvent);
			}
			if (referenceTokens.length == 4) {
				$('#verse_end').val(referenceTokens[3]);
			}
		}
	}

	makeDivs = function () {
		// create elements for words in verse
	    if (verseDiv != null) {
	    	verseDiv.innerHTML = "";
	    	if (verseTokens != undefined) {
		    	for (i=0; i<verseTokens.length; i++) {
			        var wordSpan = document.createElement('span');
			        wordSpan.id = i;
			        this.initializeClassesForTokenSpan(wordSpan);
			        this.modifyClassesForTokenSpan(wordSpan, i);
			        $(wordSpan).on('click', changeVisibility);

			       	let token = verseTokens[i];
			        let word = cleanToken(token); // use the part of the word before punctuation
			        wordSpan.innerHTML = word;
			        verseDiv.appendChild(wordSpan);
			        
			        // add spaces between words
			        if (word.length != token.length) {
			        	nonwordSpan = document.createElement('span');
			        	nonwordSpan.classList.add(TOKEN);
			        	nonwordSpan.classList.add(NONWORD);
			        	nonwordSpan.innerHTML = token.slice(token.length-1)
			        	verseDiv.appendChild(nonwordSpan);
			        }
			    }
		    }
	    }

	    // create elements for reference
	    let referenceDiv = document.getElementById("reference");
	    if (referenceDiv != null) {
	    	referenceDiv.innerHTML = "";
	    	if (referenceTokens != undefined) {
		    	id = verseTokens.length;

		    	// add the book
		    	var bookSpan = document.createElement('span');
		    	bookSpan.id = id;
		    	this.initializeClassesForTokenSpan(bookSpan);
		    	this.modifyClassesForTokenSpan(bookSpan, id);
		    	$(bookSpan).on('click', changeVisibility);
		    	bookSpan.innerHTML = referenceTokens[0];
		    	referenceDiv.appendChild(bookSpan);
		    	
		    	// add the chapter
		    	var chapterSpan = document.createElement('span');
		    	var chapterSpanId = id+1;
		    	chapterSpan.id = chapterSpanId;
		    	this.initializeClassesForTokenSpan(chapterSpan);
		    	this.modifyClassesForTokenSpan(chapterSpan, chapterSpanId);
		    	$(chapterSpan).on('click', changeVisibility);
		    	chapterSpan.innerHTML = referenceTokens[1];
		    	referenceDiv.appendChild(chapterSpan);

				// add the colon
				var colonSpan = document.createElement('span');
				colonSpan.classList.add(TOKEN);
				colonSpan.innerHTML = ":";
				referenceDiv.appendChild(colonSpan);

		    	// add the starting verse
		    	var verseStartSpan = document.createElement('span');
		    	var verseStartSpanId = id+2;
		    	verseStartSpan.id = verseStartSpanId;
		    	this.initializeClassesForTokenSpan(verseStartSpan);
		    	this.modifyClassesForTokenSpan(verseStartSpan, verseStartSpanId);
		    	$(verseStartSpan).on('click', changeVisibility);
		    	verseStartSpan.innerHTML = referenceTokens[2];
		    	referenceDiv.appendChild(verseStartSpan);

		    	if (referenceTokens.length == 4) { // if the reference includes multiple verses
		    		// add the hyphen
		    		var hyphenSpan = document.createElement('span');
		    		hyphenSpan.classList.add(TOKEN);
		    		hyphenSpan.innerHTML = "-";
		    		referenceDiv.appendChild(hyphenSpan);

		    		// add the ending verse
		    		var verseEndSpan = document.createElement('span');
		    		var verseEndSpanId = id+3;
		    		verseEndSpan.id = verseEndSpanId;
		    		this.initializeClassesForTokenSpan(verseEndSpan);
		    		this.modifyClassesForTokenSpan(verseEndSpan, verseEndSpanId);
		    		$(verseEndSpan).on('click', changeVisibility);
		    		verseEndSpan.innerHTML = referenceTokens[3];
		    		referenceDiv.appendChild(verseEndSpan);
		    	}
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
    		if (wordSpan.classList.contains(CORRECT)) {
    			if (wordSpan.innerHTML == word) {
    				wordSpan.classList.remove(CORRECT);
    				wordSpan.classList.add(HIDDEN);
    				tokenDict[id].VISIBLE = false;
    			}
    		} else if (wordSpan.classList.contains(VISIBLE)) {
    			wordSpan.classList.remove(VISIBLE);
    			wordSpan.classList.add(HIDDEN);
    			wordSpan.innerHTML = word;
    			tokenDict[id].VISIBLE = false;
    		} else if (wordSpan.classList.contains(HIDDEN)) {
    			wordSpan.classList.remove(HIDDEN);
    			wordSpan.classList.add(VISIBLE);
    			wordSpan.innerHTML = word;
    			tokenDict[id].VISIBLE = true;
    		} 
    	}
    }

    // toggle edit mode
    $('button').click(function (event) {
    	if (inEditMode) {
    		inEditMode = false;
    		document.getElementById('editButton').innerHTML = "Edit";
    		$('button').css('background-color', 'white');
    		$('button').css('color', 'black');
    		reloadVerse();
    		save(verseTokens, referenceTokens, tokenDict);
    	} else {
    		inEditMode = true;
    		document.getElementById('editButton').innerHTML = "Save";
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
    		tokenDict[id].CORRECT = true;
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
    	if (tokenSpan != null) {
    		var width = tokenSpan.offsetWidth;
	    	var $input = $("<input>", {
		        type: "text"
		    });
		    $input.attr('id', id);
		    $input.addClass(BLANK);
		    $input.addClass(TOKEN);
		    if (id < verseTokens.length) {
				$input.addClass(WORD);
		    } else {
		    	$input.addClass(NONWORD);
		    }
		    $input.width(width);
		    $(tokenSpan).replaceWith($input);
		    $input.on('keyup', updateBlank);
    	}
    }

    // change input to span
    var switchToSpan = function (id, correct) {
    	var wordInput = document.getElementById(id);
    	if (wordInput != null) {
    		if (id < verseTokens.length) {
	    		word = cleanToken(verseTokens[id])
	    	} else {
	    		word = referenceTokens[id-verseTokens.length]
	    	}
	    	var $span = $("<span>", {
				text: word
			});
			$span.attr('id', id);
			$span.addClass(TOKEN);
			$span.addClass(WORD);
			if (correct) {
				$span.addClass(CORRECT);
				$span.addClass(VISIBLE);
				$span.removeClass(HIDDEN);
				tokenDict[id].VISIBLE = true
			} else {
				$span.addClass(HIDDEN);
				$span.removeClass(VISIBLE);
			}
			$(wordInput).replaceWith($span);
			$span.on('click', changeVisibility);
    	}
    }

    // reloads elements based on visibility
	reloadVerse = function () {
		$('.loader').hide();
		$('#verse').show();
		$('#reference').show();
		if (tokens != undefined) {
			if (!inEditMode) {
				for (i=0; i<tokens.length; i++) {
					if (!tokenDict[i].VISIBLE) {
						switchToInput(i);
					}
				}

				// focus the first textfield in the verse
			    for (i=0; i<tokens.length; i++) {
			    	var element = document.getElementById(i);
			    	if (element != null && element.nodeName == "INPUT") {
			    		$(element).focus();
			    		break;
			    	}
			    }
			} else {
			    for (i=0; i<tokens.length; i++) {
			    	if (!tokenDict[i].VISIBLE) {
			    		switchToSpan(i, false);
			    	}
			    }
			}
		}
	}
});


/** Util functions **/
// removes ending punctuation from the token
cleanToken = function (token) {
	if (token[token.length-1].match(/\w/) != undefined) {
		return token;
	} else {
		var word = token.substring(0, token.length-1);
		return word;
	}
};

// input validation
getChaptersForBook = function (book) {
	var chapters = [];
	if (passage_data[book] != undefined) {
		for (c = 1; c < passage_data[book].length + 1; c++) {
			chapters.push(c);
		}
	}
	return chapters;
};

getVersesForBookAndChapter = function (book, chapter) {
	var verses = [];
	if (passage_data[book] != undefined) {
		for (v = 1; v < passage_data[book][chapter-1] + 1; v++) {
			var omittedVerses = getOmittedVersesForBookAndChapter(book, chapter);
			if (!omittedVerses.includes(v)) {
				verses.push(v);
			}
		}
	}
	return verses;
}

getOmittedVersesForBookAndChapter = function (book, chapter) {
	if (omitted_verses[book] != undefined) {
		if (chapter in omitted_verses[book]) {
			return omitted_verses[book][chapter]
		}
	}
	return [];
}

// save verseTokens, referenceTokens, and tokenDict
save = function (verseTokens, referenceTokens, tokenDict) {
	chrome.storage.sync.set({"verseTokens": JSON.stringify(verseTokens)});
	chrome.storage.sync.set({"referenceTokens": JSON.stringify(referenceTokens)});
	chrome.storage.sync.set({"tokenDict": JSON.stringify(tokenDict)});
};


// prevent default action of Tab key
$(document).keydown(function (e) 
{
    if (e.keyCode == 9) {
		event.preventDefault();
		return false;
    };
});
