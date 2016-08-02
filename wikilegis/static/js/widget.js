var domain = 'http://wikilegis.labhackercd.net/';
var bill_id = $('.wikilegis-widget').attr('bill-id')

function loadScript(url){    
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}

loadScript(domain + 'static/js/lodash.min.js');
loadScript(domain + 'static/js/diff.min.js');

$('head').append('<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">');
$('head').append('<link rel="stylesheet" type="text/css" href="' + domain + 'static/css/widget.css">');

$(document).ready(function() {
	loadBill(bill_id);
});

$('body').append($(document.createElement('div')).attr('id', 'loadingDiv'));

function romanize(num) {
    if (!+num)
        return false;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
};
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
};
function wlDiff(a, b) {
	return JsDiff.diffWordsWithSpace(a, b);
};
function changeToMarkup(change) {
	var value = change.value;
	if (change.added) {
		value = '<span class="added">' + value + '</span>';
	} else if (change.removed) {
		value = '<span class="removed">' + value + '</span>';
	}
	return value;
};
function linebreaks(text) {
	var linePattern = /(?:\r\n|\r|\n)/g;
	var paragraphPattern = /(?:\r\n|\r|\n){2}/g;
	return _.map(text.split(paragraphPattern), function (p) {
		return '<p>' + p.replace(linePattern, '<br />') + '</p>';
	}).join('\n\n');
};
function changesToMarkup(changes) {
	changes = _.map(changes, changeToMarkup);
	return linebreaks(changes.join(''));
};
function get_votes(votes){
	var up_votes = 0;
	var down_votes = 0;
	$.each(votes, function(index, vote) {
		if (vote.vote == true){
			up_votes++;		
		} else {
			down_votes++;
		};
	});
	return $(document.createElement('div')).addClass('votes').html('<i class="material-icons">thumb_up</i>' + up_votes  + ' <i class="tiny material-icons">thumb_down</i>' + down_votes)
}
function segmentNotEditable(type, name, number, content){
	return $(document.createElement('h5'))
				.addClass('heading ' + type)
				.append(name)
				.append($(document.createElement('span'))
					.addClass('heading-number')
					.append(romanize(number)))
				.append($(document.createElement('span'))
					.addClass('heading-title')
					.append(content))
}
function segmentEditable(name, number, content, votes, bill, id){
	return $(document.createElement('div'))
            	.addClass(name)
            	.append($(document.createElement('span'))
            		.addClass('number')
            		.html(number))
            	.append(content)
            	.append(get_votes(votes)
            		.append($(document.createElement('a'))
	    				.addClass('link')
	    				.attr('href', domain + 'bill/'+ bill +'/segments/'+ id +'/')
	    				.attr('title', 'Ver no Wikilegis')
	    				.html('<i class="material-icons">call_made</i>')))
}
function numberingByType(typeDispositive, number, content, votes, bill, id, flag_paragraph){
	if (typeDispositive == 1){
		if (number <= 9){
			return segmentEditable('artigo', 'Art. ' + number + '&ordm; ', content, votes, bill, id)
		}else{
            return segmentEditable('artigo', 'Art. ' + number + ' ', content, votes, bill, id)
		}
	}else if(typeDispositive == 2){
		return segmentNotEditable('titulo', 'T&Iacute;TULO ', number, content);
	}else if(typeDispositive == 3){
		return segmentEditable('inciso', romanize(number) + ' - ', content, votes, bill, id)
	}else if(typeDispositive == 4){
		if (number <= 9){
			if(flag_paragraph){
				return segmentEditable('paragrafo', 'Par&aacute;grafo &uacute;nico. ', content, votes, bill, id)
			}else{
				return segmentEditable('paragrafo', '&#167; ' + number + '&ordm; ', content, votes, bill, id)
			}
		}else{
			return segmentEditable('paragrafo', '&#167; ' + number + ' ', content, votes, bill, id)
		}
	}else if(typeDispositive == 5){
		return segmentEditable('alinea', String.fromCharCode(96 + number) + ') ', content, votes, bill, id)
	}else if(typeDispositive == 6){
		return segmentEditable('item', number + '. ', content, votes, bill, id)
	}else if(typeDispositive == 7){
		return segmentNotEditable('capitulo', 'CAP&Iacute;TULO ', number, content);
	}else if(typeDispositive == 8){
		return segmentNotEditable('livro', 'LIVRO ', number, content);
	}else if(typeDispositive == 9){
		return segmentNotEditable('secao', 'Se&ccedil;&atilde;o ', number, content);
	}else if(typeDispositive == 10){
		return segmentNotEditable('subsecao', 'Subse&ccedil;&atilde;o ', number, content);
	}else if(typeDispositive == 11){
		return $(document.createElement('div'))
					.addClass('citacao')
					.append(content)
					.append(get_votes(votes)
	            		.append($(document.createElement('a'))
		    				.addClass('link')
		    				.attr('href', domain + 'bill/'+ bill +'/segments/'+ id +'/')
		    				.attr('title', 'Ver no Wikilegis')
		    				.html('<i class="material-icons">call_made</i>')))
	}
};
function listComments(comments){
	var commentHtml = $(document.createElement('div')).addClass('comments')
	$.each(comments, function(index, comment) {
		commentHtml.append($(document.createElement('div'))
							.addClass('comment comment-'+ comment.id)
							.append($(document.createElement('span'))
								.addClass('author')
								.html(comment.user.first_name + ' ' + comment.user.last_name + ' - '))
							.append(comment.comment))
	});	
	return commentHtml
};
function listProposals(proposals){
	var propHtml = $(document.createElement('div')).addClass('proposals')
	$.each(proposals, function(index, proposal) {
		propHtml.append($(document.createElement('div'))
							.addClass('segment-proposal segment-' + proposal.id)
							.append($(document.createElement('span'))
								.addClass('author')
								.html(proposal.author.first_name + ' ' + proposal.author.last_name + ' - '))
							.append($(document.createElement('div'))
								.addClass('content')
								.attr('data-raw-content', proposal.content)
								.append($(document.createElement('p'))
									.addClass('pp')
									.html(proposal.content)))
							.append(get_votes(proposal.votes)
								.append($(document.createElement('a'))
									.addClass('link')
									.attr('href', domain + 'bill/'+ proposal.bill +'/segments/'+ proposal.replaced +'/#amendment-'+ proposal.id)
									.attr('title', 'Ver no Wikilegis')
									.html('<i class="material-icons">call_made</i>'))));
		var comments_prop = proposal.comments;
    	if(comments_prop.length > 0){
    		propHtml.append($(document.createElement('div'))
								.addClass('commentCountWrapper')
								.append($(document.createElement('div'))
									.addClass('commentCount')
									.append('<i class="material-icons">forum</i> '+ comments_prop.length +' coment&aacute;rios ')))
					.append(listComments(comments_prop))
		};
	});	
	return propHtml
};
function loadBill(bill_id){
	$.getJSON(domain + 'api/bills/'+ bill_id +'?format=json', function(data) {
		$('.wikilegis-widget').append($(document.createElement('h1'))
								.addClass('title')
								.append(data.title)
								.append($(document.createElement('a'))
			    				.addClass('link')
			    				.attr('href', domain + 'bill/'+ data.id)
			    				.attr('title', 'Ver no Wikilegis')
								.html('<i class="material-icons">call_made</i>')))
					.append($(document.createElement('h4')).addClass('epigraph').html(data.epigraph))
					.append($(document.createElement('div')).addClass('description').append($(document.createElement('p')).html(data.description)))
		var segments = sortByKey(data.segments, 'order')
		$.each(segments, function(index, obj) {
		    if(obj.original == true){
	    		var flag_paragraph = false
		    	if(obj.type == 4 && obj.number == 1){
		    		var i = j = index;
		    		var count_paragraph = 0;
	    			while(segments[i].type != 1){
	    				if(segments[i].type == 4 && segments[i].original == true){
				    		++count_paragraph;
					    };
	    				++i;
	    			};
	    			while(segments[j].type != 1){
	    				--j;
	    				if(segments[j].type == 4 && segments[j].original == true){
				    		++count_paragraph;
					    };
	    			};
					if(count_paragraph == 1){
						flag_paragraph = true;
					};
		    	}
		    	$('.wikilegis-widget').append(
		    		$(document.createElement('div'))
		    			.addClass('segment original segment-' + obj.id)
		    			.attr('data-raw-content', obj.content)
		    			.append(numberingByType(obj.type, obj.number, obj.content, obj.votes, obj.bill, obj.id, flag_paragraph))
	    		);
		    	var comments = sortByKey(obj.comments, 'id');
		    	if(comments.length > 0){
					$('.segment-'+ obj.id).append($(document.createElement('div'))
													.addClass('commentCountWrapper')
													.append($(document.createElement('div'))
														.addClass('commentCount')
														.append('<i class="material-icons">forum</i> '+ comments.length +' coment&aacute;rios ')))
										  .append(listComments(comments));
				}
		    	var proposals = [];
		    	for (var i = 0; i < segments.length; ++i) {
					var segment = segments[i];
					if(segment.type == obj.type && segment.number == obj.number && segment.original == false){
						proposals.push(segment);
					};
				};
				proposals = sortByKey(proposals, 'id')
				if(proposals.length > 0){
					$('.segment-'+ obj.id).append($(document.createElement('div'))
													.addClass('propCount')
													.append('<i class="material-icons">note_add</i> '+ proposals.length +' propostas '))
										  .append(listProposals(proposals));
				}
		    };
	    });
	})
	.done(function() {
		$(".comments").hide();
		$(".proposals").hide();	
		$(".commentCount").on('click', function() {
		    $(this).parent().next(".comments").toggle();
		});
		$(".propCount").on('click', function() {
		    $(this).next(".proposals").toggle();
		});
	    $('.original').each(function(){
	        var div_original = this;
	        var original = $(div_original).attr('data-raw-content');
	        $(div_original).children('.proposals').children('.segment-proposal').children('.content').each(function(i, cur) {
	            var $cur = $(cur);
	            var current = $cur.attr('data-raw-content');
	            $cur.find('.pp').html(changesToMarkup(wlDiff(original, current)));
	        });
	        $('.pp').next('p').remove();
	    });
	    $('#loadingDiv').hide();
	});
};

