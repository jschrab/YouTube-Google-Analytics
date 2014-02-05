YouTube-Google-Analytics
========================

Allow for custom event tracking in Google Analytics for YouTube player actions such as Play and Ended.

Original http://www.lunametrics.com/blog/2012/10/22/automatically-track-youtube-videos-events-google-analytics/  
Further enhanced by http://isitedesign.com - Alex Mueller for ISITE Design

Enhancements from Alex Mueller's version:
* Added updatePlayerTracking() call to allow post page load onPlayerStateChange() event handler assignment for cases where dynamic YouTube iframes are created on demand.
* RegEx'd detection of YouTube links - covers http, https and Protocol Relative URL's. Also covers "www." prefix as optional.
* Simplifed management of list of video players to assign onPlayerStateChange() handlers to - now called videoHash
* Covered possible async scope problem in AJAX title-lookup code
