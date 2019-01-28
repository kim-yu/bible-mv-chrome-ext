$(document).ready(() => {
    const verse = "Keep your heart with all diligence, For out of it spring the issues of life.";
    const reference = "Proverbs 4:23";

    const originalWords = verse.split(" ")
    var isVisible = {};
    for (i=0; i<originalWords.length; i++) {
        isVisible[i] = true;
    }

    var inEditMode = false;

    var verseDiv = document.getElementById("verse");
    var visibleWords = "";
    var i;
    for (i=0; i<originalWords.length; i++) {
        var contentDiv = document.createElement('div');
        contentDiv.id = i;
        contentDiv.classList.add('content');
        var wordDiv = document.createElement('div');
        wordDiv.id = "word-"+i;
        wordDiv.innerHTML = originalWords[i]
        wordDiv.classList.add('word');
        
        var buttonSpan = document.createElement('span');
        buttonSpan.id = "span-"+i;
        var buttonDiv = document.createElement('i');
        buttonDiv.classList.add('fas');
        
        if (isVisible[i]) {
            visibleWords += originalWords[i] + " ";
            wordDiv.classList.add('visible');
            buttonDiv.classList.add('fa-eye-slash');
        } else {
            wordDiv.innerHTML = " " * originalWords[i].length
            buttonDiv.classList.add('fa-eye');
        }
    
        buttonSpan.appendChild(buttonDiv)
        contentDiv.appendChild(wordDiv);
        contentDiv.appendChild(buttonSpan);
        verseDiv.appendChild(contentDiv);
    }

    $.fn.changeElementType = function(newType) {
        var attrs = {};


        $.each(this[0].attributes, function(idx, attr) {
            attrs[attr.nodeName] = attr.nodeValue;
        });


        var newelement = $("<" + newType + "/>", attrs).append($(this).contents());
        this.replaceWith(newelement);
        return newelement;
    };

    $('span').click(function (event) {
        if ($(event.target).parent().siblings('.word').hasClass('visible')) {
            $(event.target).parent().siblings('.word').removeClass('visible');
            $(event.target).parent().siblings('.word').addClass('hidden');
            $(event.target).parent().children('.fas').removeClass('fa-eye-slash');
            $(event.target).parent().children('.fas').addClass('fa-eye');
        } else if ($(event.target).parent().siblings('.word').hasClass('hidden')) {
            $(event.target).parent().siblings('.word').removeClass('hidden');
            $(event.target).parent().siblings('.word').addClass('visible');
            $(event.target).parent().children('.fas').removeClass('fa-eye');
            $(event.target).parent().children('.fas').addClass('fa-eye-slash');
        }
        $(event.target).css('color', 'transparent');
    });

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
});
