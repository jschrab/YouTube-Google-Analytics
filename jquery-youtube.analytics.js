/*
	YouTube Analytics
	Code adapted from:
		http://www.lunametrics.com/blog/2012/10/22/automatically-track-youtube-videos-events-google-analytics/
		http://lunametrics.wpengine.netdna-cdn.com/js/lunametrics-youtube.js
	Code adapted from:
		http://isitedesign.com - Alex Mueller for ISITE Design

	Jeffrey Schrab - 5-FEB-2014 - jschrab@malicstower.org
*/

// enable cross-domain scripting in IE < 10 for the YouTube Data API
// https://github.com/jaubourg/ajaxHooks/blob/master/src/xdr.js
if(window.XDomainRequest){jQuery.ajaxTransport(function(e){if(e.crossDomain&&e.async){if(e.timeout){e.xdrTimeout=e.timeout;delete e.timeout}var t;return{send:function(n,r){function i(e,n,i,s){t.onload=t.onerror=t.ontimeout=jQuery.noop;t=undefined;r(e,n,i,s)}t=new XDomainRequest;t.onload=function(){i(200,"OK",{text:t.responseText},"Content-Type: "+t.contentType)};t.onerror=function(){i(404,"Not Found")};t.onprogress=jQuery.noop;t.ontimeout=function(){i(0,"timeout")};t.timeout=e.xdrTimeout||Number.MAX_VALUE;t.open(e.type,e.url);t.send(e.hasContent&&e.data||null)},abort:function(){if(t){t.onerror=jQuery.noop;t.abort()}}}}})}

// load the YouTube iframe API
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// initialize our object/hash to hold video information
var videoHash = {};

// dynamically created youtube players should call this after instantiation
var trackYouTubeFunc = false;

// safely pass the jQuery object as $
(function($) {
	// enables tracking of all YouTube videos on the page
	trackYouTubeFunc = function() {
		// iterate through every iframe on the page
		$('iframe').each(function(i) {
			// grab the video source and other properties
			var baseUrlLength,
				$iframe = $(this),
				iframeSrc = $iframe.attr('src'),
				isYouTubeVideo = false,
				videoID,
				url;

			// if we're dealing with a YouTube video, store its information in our arrays
			var isYouTubeVideo = iframeSrc.match(/^(https?:\/\/|\/\/)(www.)?youtube.com\/embed\/(.{11})/i);
			if (isYouTubeVideo) {
				// grab the videoID
				videoID = isYouTubeVideo[3]; // 0 = full URL, 1=protocol, 2=optional www prefix, 3=video id
				url = '//gdata.youtube.com/feeds/api/videos/' + videoID + '?v=2&alt=json';

				// put an object in our hash with the videoID...
				videoHash[videoID] = {'id': videoID };

				// ...and the video title (pulled from the YouTube data API)
				$.ajax({
					dataType: 'JSON',
					type: 'GET',
					url: url,
					context: videoHash[videoID]
				})
				.done(function(data) {
					this.videoTitle = data.entry.title.$t;
				});

				// put the videoID on the iframe as its id
				$iframe.attr('id', videoID);
			}
		});
	}

	$(function() {
		// initiate tracking on document ready
		trackYouTubeFunc();
	});
})(jQuery);

// when the YouTube iframe API has loaded
function onYouTubeIframeAPIReady() {
	// add the stateChange event handler to our list of current videos on this page
	for(var videoID in videoHash) {
		if(!videoHash[videoID].hasOwnProperty('videoPlayer')) {
			videoHash[videoID].videoPlayer = new YT.Player(videoID, {
				events: {
					'onStateChange': onPlayerStateChange
				}
			});
		}
	}
}

// when the player changes states
function onPlayerStateChange(event) {
	// if the video begins playing, send the event
	if (event.data == YT.PlayerState.PLAYING) {
		// console.log(['_trackEvent', 'Videos', 'Play', videoHash[event.target.a.id].videoTitle ]);
		if((typeof(_gaq) == "object")) _gaq.push(['_trackEvent', 'Videos', 'Play', videoHash[event.target.a.id].videoTitle ]);
	}
	// if the video ends, send the event
	if (event.data == YT.PlayerState.ENDED) {
		// console.log(['_trackEvent', 'Videos', 'Ended', videoHash[event.target.a.id].videoTitle ]);
		if((typeof(_gaq) == "object")) _gaq.push(['_trackEvent', 'Videos', 'Ended', videoHash[event.target.a.id].videoTitle ]);
	}
}

// call this when youtube players have been dynamically added after page load
function updatePlayerTracking() {
	trackYouTubeFunc();
	onYouTubeIframeAPIReady();
}
