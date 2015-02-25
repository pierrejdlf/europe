/**
 * Main JS file for Casper behaviours
 */

/*globals jQuery, document */


function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}



(function ($) {
  "use strict";

  $(document).ready(function(){
        
    //console.log(langs);

  	// parallax ?
  	//see http://winwardo.co.uk/parallax/ 

  	var switchToLang = function(lang) {
  		$("[data-lang]").removeClass("active");
  		$("[data-lang="+lang+"]").addClass("active");
  		if(langs.hasOwnProperty(lang))
        $("[data-localize]").each(function(e,v) {
        	var key = $(v).data('localize');
        	var ks = key.split(".");
        	try {
          	if(key.indexOf(".")==-1)
          		var content = langs[lang][ks[0]];
          	else 
          		var content = langs[lang][ks[0]][ks[1]];	
          } catch(er) {
          	console.log("no ("+lang+") for key: "+key);
          }
        	$(v).html( content );
        });
     	else
     		console.log("lang not found");

     	// update link to reglement
     	$(".regl").attr('target',"_new");
  		$(".regl").attr('href',"/assets/data/europe_moving_image_"+lang+".pdf");

  		// more about project modal
  		$("#modalTrigger").on("click", function(e) {
  			console.log("modal trigger");
  			$('#projectModal').modal();
  		});
  	};

  	var avLangs = ['en','fr','es'];
  	var blang = window.navigator.userLanguage || window.navigator.language;
  	console.log("browser lang: "+blang);
  	blang = blang.split('-')[0];
  	if(avLangs.indexOf(blang)!=-1) {
  		switchToLang(blang);
  	} else {
  		switchToLang('en');
  	}

    // i18n
    $(".langselect button").on("click", function(e) {
      var lang = $(e.target).data("lang");
      if(!lang) lang = $(e.target).parent().data("lang");
      console.log("switching to: "+lang);

      //$("[data-localize]").localize("emi", { language:lang });

      switchToLang(lang);

      // $("[lang]").each(function () {
      //     if ($(this).attr("lang") == lang)
      //         $(this).show();
      //     else
      //         $(this).hide();
      // });
    });

    // form (deprecated ?)
    // $("#form").submit(function() {
    //   console.log("submitting form");
  		// $.ajax({
  		// 	type: "GET",
  		// 	url: "http://localhost:2368/form/submit/",
  		// 	data: $("#form").serialize(),
  		// 	success: function(data) {
  		// 		console.log(data);
  		// 	},
  		// });
  		// return false; 
    // });

    // smooth links to sections
    $('a[href*=#]:not([href=#])').click(function() {
      if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
          $('html,body').animate({
              scrollTop: target.offset().top - 50
          }, 1000);
          return false;
        }
      }
    });


    $(".intro-message h3").addClass('loaded');
    $(".intro-message h1").addClass('loaded');
    // setTimeout(function() {
    // 	$(".intro-message h3").addClass('loaded');
    // },1000);
    // setTimeout(function() {
    // 	$(".intro-message h1").addClass('loaded');
    // },1500);


    // load the films based on mapbox geojson
    ////////////////////////////////////////////
    var loadFilms = function() {
      $.ajax({
  			url: "https://a.tiles.mapbox.com/v3/minut.hflfi81j/markers.geojson",
  			dataType: 'jsonp',
  			success: function(data) {
  				console.log("Geojson list received.",data);
  				var count = 0;
          var elemArray = [];
  				_.each(data.features, function(f) {
  					var p = f.properties;
            var mid = p.title.split(/\./)[0];
  					var mtitle = p.title.match(/\d*\.([^\.]*)/) ?
              p.title.match(/\d*\.([^\.]*)/)[1].replace(/\d*\./,"") :
              p.title; // get first part after first .
            mtitle = mtitle.toLowerCase();
            var mauthor = p.title.replace(/\d*(\.[^\.]*)+\./,""); // last part after last .
            var mabstract = /€/.test(p.description) ? p.description.split("€")[1] : "-none-";
  					var isMovie = p["marker-symbol"] == "cinema";

  					if(isMovie) {
  						var e = $("<div>").attr({
                class:"film",
                id:"jumpto_"+mid
              });
  						var u = p.description;
  						var ytb = /youtu/.test(u); // else assumed: vimeo
  						var url = ytb ? 
  							u.replace(/^.*[\/=]([^\/^=]*)].*/,"//www.youtube.com/embed/\$1?autoplay=0&showinfo=0") :
  							u.replace(/^.*\/(\d*)].*/,"//player.vimeo.com/video/\$1?badge=0&amp;color=ffffff");
  						
  						//console.log("Got video: ",count++,url,p);

  						var iframe = $("<iframe>").attr({
  							width: "100%",
  							height: "100%",
  							src: url,
  							frameborder: "0",
  							allowfullscreen: "allowfullscreen",
  							mozallowfullscreen: "mozallowfullscreen",
  							webkitallowfullscreen: "webkitallowfullscreen",
  						});

              // deactivated voting button
              // var button = $("<button/>").attr({
              //   onclick:'ploufvoter("'+mid+"."+mtitle+'");',
              //   class:'votebutton',
              // }).text("vote for it !");

  						var meta = $("<div class='meta'>")
  							.append("<div class='word'>"+mtitle+"</div>")
                .append("<div class='author'>"+mauthor+"</div>")
                //.append(button) // deactivated voting button
                .append("<div class='abstract'>"+mabstract+"</div>");
                // NB: the voter function is defined at the top.
  						
  						e.append(iframe);
  						e.append(meta);
  						elemArray.push(e);
  					}
  				});
          
          shuffle(elemArray);
          _.each(elemArray, function(e) {
            $(".films").append(e);
          });
          
  			}
  		});
    };

    loadFilms();

    // TO HIDE, if you want debug
    // if(window.location.hash=="#films") {
    //   loadFilms();
    // } else {
    //   $("#films").hide();
    //   $("#filmtrigger").hide();
    // }






    // at the end of everything, load the map
    ////////////////////////////////////////////

    var countries = ["UnitedKingdom","Ireland","Portugal","Spain","france","Belgium","Netherlands","Germany","Switzerland","Italy","Denmark","Sweden","Norway","Finland","Austria","CzechRepublic","Slovenia","Croatia","Hungary","Slovakia","Poland","Lithuania","Latvia","Estonia","Belarus","Ukraine","Moldava","Romania","Serbia","BosniaHerzegovina","Montenegro","Albania","Kosovo","Macedonia","Bulgaria","Greece","Iceland"];
    var countregexp = new RegExp(countries.join('|'),'i');

    function getLongestWords(t) {
      var text = t.replace(/[^ ]*http[^ ]*/g,'#');
      var words = text.split(/[\/\n .,!?:;'"“”\(\)]+/);
      var list = ["..."];
      var w = /[a-zA-Zàâéèêëiîoôöuùûü]{3,}/; // only if contains at least 3 normal chars
      var r = /([a-zA-Zàâéèêëiîoôöuùûü])\1{2,}/; // avoid repeated chars (x3)
      words.forEach(function(el) {
        if(w.test(el) && !r.test(el) && el.indexOf('#')==-1 && el.indexOf('@')!=0 && el.indexOf('parismap')==-1)
          list.push(el);
      });
      return _.sortBy(list,function(t){return -t.length});
    };

    var cloudmadeAttribution = 'MD &copy;2011 OSM contribs, Img &copy;2011 CloudMade';
    
    ////////////////////////////////////////////
    var pmapconfig = {
      clusterize: false,
      maxClusterRadius: 50,
      serverUrl: "//api.europemovingimage.eu",
      //serverUrl: "//490512b42b.url-de-test.ws",
      //serverUrl: "//localhost:8080",
      leaflet: {
        center: L.latLng(48.810236,16.331055),
        zoom: 5,
        minZoom: 4,
        maxZoom: 7,
        locateButton: false,
        scrollWheelZoom: false,
        fullscreenControl: true,
        maxBounds: L.latLngBounds( L.latLng(34.010,-11.609),L.latLng(62.680,40.962) )
      },
      // preprocess ploufdata at fetch ! (to only do it once !)
      preplouf: function(p) {
        var t = p.markertype;
        if(t=='emi') {
          var video = /:\/\//.test(p.description);
          var vimeo = /vimeo/.test(p.description);
          p.movie = video;
          p.icon = video ? "film" : "asterisk";
          p.jumpto = p.title.split(".")[0];
          p.title = p.title.match(/\d*\.([^\.]*)/) ?
            p.title.match(/\d*\.([^\.]*)/)[1].replace(/\d*\./,"") :
            p.title;
          var d = p.description ;

          if(!video) {      // un mot un jour
            var img = d.match(/\[\[(.*)\]\]/)[1];
            p.imgurl = "https://googledrive.com/host/0B2b_ECAYHVctWGJkUkdWTXFrdDA/"+img;
          } else if(vimeo)  // vimeo
            p.imgurl = d.match(/\((.*)\)/) ? d.match(/\((.*)\)/)[1] : "no";
          else            // youtube
            p.imgurl = d.replace(/^.*[\/=]([^\/^=]*)].*/,"http://i2.ytimg.com/vi/\$1/hqdefault.jpg");

          p.imgurl = p.imgurl.replace(/ /g,"%20");
          //console.log("Got: ",p.imgurl);
        }
        if(t=='wordeon') {
          // process longest word
          var longestW = getLongestWords(p.text);
          if(longestW.length && /europeinaword/i.test(longestW[0]) ) longestW.shift();
          if(longestW.length && countregexp.test(longestW[0]) ) longestW.shift();
          var w = (longestW.length ? longestW[0] : "...").toLowerCase();
          var mo = (w.length>15) ? "..." : "";
          p.theword = w.slice(0,15)+mo;
        }
        return p;
      },
      icons: {
        wordeon: function(p,clustCount,children) {

          return L.divIcon({
            iconAnchor:   [0, 0],
            iconSize:     [0, 0],
            html: Handlebars.compile(
              "<div class='wodon "+p.ptype.split("_")[1]+"'>"+
                "<div class='bubble'></div>"+
                "<div class='wordfly' id='{{pid}}'>{{theword}}</div>"+
                "<div class='popup'><a href='{{link}}' target='_blank'>@{{user.id}}</a><hr>{{text}}</div>"+
              "</div>"
            )(p),
            //html:         "<div class='"+cla+"'><div class='clock "+cclass+"'></div><div class='arro'></div></div>",
            popupAnchor:  [0, 0],
            className: clustCount>1 ? "parismap-icon wordeon back" : "parismap-icon wordeon front"
          });
        },
        emi: function(p,clustCount) {
          var video = /:\/\//.test(p.description);
          return L.divIcon({
            iconSize: [22,22],
            iconAnchor: [0,22],
            html: Handlebars.compile(
              '<div class="skull hint--bottom" data-hint="click to watch the film !">'+
                  '<i class="mark fa fa-{{icon}}"></i>'+
                  '<div class="arrow"></div>'+
                  '<div class="popup">'+
                      '<a href="#jumpto_{{jumpto}}" class="jumper">'+
                      '<div class="content" style="background-image: url({{imgurl}});">'+
                          '<div class="word">{{title}}</div>'+
                          '{{#if movie}}'+
                          //'<div class="click">click to watch the film</div>'+
                          '{{/if}}'+
                      '</div>'+
                      '</a>'+
                  '</div>'+
              '</div>'
            )(p),
            className: video ? "parismap-icon emi video" : "parismap-icon emi image",
          });
        },
      }
    };




	  var p = new Ploufmap(_.extend({
      mapid: "mapfilms",
      baseLayer: L.tileLayer('http://a.tiles.mapbox.com/v3/minut.hflfi81j/{z}/{x}/{y}.jpg70', {styleId: 22677, attribution: cloudmadeAttribution}), // whole europe
      markers: {
        'http://a.tiles.mapbox.com/v3/minut.hflfi81j/markers.geojson':'emi',
      },
    },pmapconfig));




    var q = new Ploufmap(_.extend({
      mapid: "maptweets",
      baseLayer: L.tileLayer('http://a.tiles.mapbox.com/v3/minut.i87kbj5g/{z}/{x}/{y}.jpg70', {styleId: 22677, attribution: cloudmadeAttribution}), // whole europe
      markers: {
        'tweet_eutrack': 'wordeon',
        'tweet_euword': 'wordeon',
        'tweet_eusearch': 'wordeon',
        'tweet_eulocs': 'wordeon',
      },
      blacklisted:[
        "tw_467285432561336320","tw_467292603952930817","tw_467312767662567424","tw_467313359092994048",
        "tw_467320056876367872","tw_467330308300607488","tw_467334833380020224","tw_467373641131622400",
        "tw_467377914041102336","tw_467578331719024640","tw_467580103531462656","tw_467595953617530880",
        "tw_467596929409765376","tw_467597602780098560","tw_467598428286238720","tw_467598630111948800",
        "tw_467616135886929921","tw_468063680262074368","tw_468365348027514880","tw_468376818492641280",
        "tw_468367272038633473","tw_468357622710956032","tw_468374540629061633","tw_468337543864680448",
        "tw_468374802785660929","tw_468374876768989184","tw_468374935799603200","tw_468374991353176064",
        "tw_467643490944700416","tw_468375361387257856","tw_468394680023908352","tw_468071001528745984",
        "tw_467604826340483072","tw_467801711214858240","tw_468379952556306432","tw_468374805902008321",
        "tw_468402283646947328","tw_468347808983289856","tw_468357173412921344","tw_468361158366601216",
        "tw_467399133800960000","tw_468394606644584450","tw_467401637259403265","tw_469029244044320768",
        "tw_467933977404518400","tw_468105490237759488","tw_468794357806825473","tw_468338819310563328",
        "tw_468407877221515264","tw_468433939565383680","tw_469109275768664064","tw_469413138509873153",
        "tw_467626487156604929","tw_469414928752070656","tw_467401696269062145","tw_468651104629452800",
        "tw_469066035786948608","tw_469064803714342912","tw_468723533896753152","tw_470592383953174528",
        "tw_470589187272744960","tw_469878209329516544","tw_469064831476432896","tw_467590588301578240",
        "tw_470928469896228864","tw_470982698446880768","tw_472302657986920448","tw_472312189853130752",
        "tw_472382730412769280","tw_472801014668881921","tw_470905752975319040","tw_472381232266084352",
        "tw_472383322501705729"
        ]
    },pmapconfig));
    




    // init links from markers (#jumpto_12) to video block id #(12)
    // setTimeout(function() {
    //   console.log("Initing jumpers.");

    //   $('a[href*=#].jumper:not([href=#])').click(function() {
    //     console.log("jumping film!");
        
    //     if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
    //       var target = $(this.hash);
    //       target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    //       if (target.length) {
    //         $('html,body').animate({
    //             scrollTop: target.offset().top - 50
    //         }, 1000);
    //         return false;
    //       }
    //     }
    //   });
    // },4000);

  });

}(jQuery));
