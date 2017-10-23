// class to hold data about a specific place
var Place = function(name, lat, long, foursquare_venue_id) {
    var self = this;
    self.name = name;
    self.location = {lat: lat, lng: long};
    self.foursquare_venue_id = foursquare_venue_id;
    self.map_marker = null;
    // used with the input filter to indicate whether or not to show
    // the map marker
    self.is_visible = ko.observable(true);
    // will hold info on the place from Foursquare
    self.details = {};
}

// array holding a the list of Place objects supplying a name, the latitude
// and longitude of the location and the Foursquare venue id
var placesList = [
  new Place('Sunset Grille', 38.328271, -75.101795, '4bc8f5f8cc8cd13a23b7bacf'),
  new Place('Fish Tales', 38.351513, -75.078432, '4a9471e7f964a520a02120e3'),
  new Place('Jolly Roger', 38.360032, -75.076768, '4c030b79f423a5939fc2cf16'),
  new Place("Dumser's Dairyland", 38.327229, -75.087045, '4c410b11af052d7f9ed57c79'),
  new Place('Dough Roller', 38.334066, -75.083566, '4bf1797599d02d7f2e38c948'),
  new Place('Kite Loft', 38.336628, -75.082319, '4b93f048f964a520495b34e3')
]

// knockoutjs ViewModel class
var ViewModel = function() {
    var self = this;
    // track the list of places
    self.placesList = ko.observableArray(placesList);
    // contains the currently selected place
    self.currentPlace = ko.observable();
    // contains the value of the input box to filter the list of
    // places by name
    self.placeFilter = ko.observable();

    // update the currentPlace value and trigger the click event in the
    // google map for the matching map marker
    self.setCurrentPlace = function(place) {
        // reset the previously selected map icon to the default
        if (self.currentPlace()) {
          map.resetMarker(self.currentPlace().map_marker);
        }

        self.currentPlace(place);

        // trigger click on the currentPlace map marker
        google.maps.event.trigger(place.map_marker, 'click');

        // if the button used for toggling the menu is being displayed
        // hide the menu after an item from the menu is selected
        if ($('.navbar-toggler').is(':visible')) {
          window.setTimeout(function() {
            $('.row-offcanvas').toggleClass('active');
          }, 500);
        }
    };

    // use the value in the filter input to limit the list of places
    // displayed in the menu and the matching marker on the map
    self.filter = function(value) {
      value = value.toLowerCase();

      for (var idx in self.placesList()) {
        var place_name = self.placesList()[idx].name.toLowerCase();
        if (place_name.indexOf(value) >= 0) {
          // match found - show marker
          self.placesList()[idx].is_visible(true);
          self.placesList()[idx].map_marker.setVisible(true);
        } else {
          // match not found - hide marker
          self.placesList()[idx].is_visible(false);
          self.placesList()[idx].map_marker.setVisible(false);
        }
      }
    }
}

// class to manage interface to Foursquare API
var FourSquare = function() {
    var self = this;

    // takes the index of the place in the placesList array and gets
    // info about the place from Foursquare
    self.getPlaceInfo = function(place_idx) {
      var venue_id = placesList[place_idx].foursquare_venue_id;
      var url = 'https://api.foursquare.com/v2/venues/' + venue_id;

      // make ajax call to Foursquare api sending the required parameters
      var request = $.ajax({
        type: 'GET',
        url: url,
        data: {
          client_id: 'I2ZI5U5BKJJ1VRPQVFVCC4XYV3AD0ABA4VAHLXMG2AHUJIXB',
          client_secret: 'UOO5GFINJRPX2CU5SWQQOIOQRHXMEETDRVGYWQKRWL4RQSZG',
          v: '20170801'
        }
      });

      // get the information we want from the Foursquare response object
      request.done(function(data) {
        var venue = data.response.venue;
        if (venue.url) {
          placesList[place_idx].details.url = venue.url;
        }
        if (venue.contact) {
          placesList[place_idx].details.contact = venue.contact;
        }
        if (venue.location) {
          placesList[place_idx].details.location = venue.location;
        }
        if (venue.hours) {
          placesList[place_idx].details.hours = venue.hours;
        }
        if (venue.rating) {
          placesList[place_idx].details.ratings = venue.rating;
        }
        map.showInfoWindow(place_idx);
      });

      // ajax call failed for some reason. Set the place details to an empty
      // object and display only the name
      request.fail(function(data) {
        placesList[place_idx].details = {}
        map.showInfoWindow(place_idx);
    });
    }
}

// GOOGLE MAPS class
var GoogleMap = function() {
  var self = this;
  self.map;
  self.center = {lat: 38.336503, lng: -75.084906};
  self.bounds;
  self.clicked_marker;
  self.infoWindow;
  self.fs = new FourSquare();

  // initialize map and add the markers from the placesList
  self.init = function() {
    self.map = new google.maps.Map(document.getElementById('map'), {
      center: self.center,
      zoom: 13
    });

    self.bounds = new google.maps.LatLngBounds();
    self.infoWindow = new google.maps.InfoWindow();
    self.addMarkers();
  };

  self.centerMap = function() {
    self.map.setCenter(self.center);
    self.map.fitBounds(self.bounds);
  }

  // read through list of places and extend the map bounds to make sure
  // the marker is displayed on the page.
  self.addMarkers = function() {
    for (var i=0, len=placesList.length; i<len; i++) {
      self.bounds.extend(placesList[i].location);

      // add markers one at a time so they drop one after the other
      // as they are added to the page
      window.setTimeout(self.addMarker(placesList[i], i), i*300);
    }
    self.map.fitBounds(self.bounds);
  };

  // when adding markers to map need to keep markers sync'd with Places
  // object. The callback function provides a way to pass index of Place
  // object in placesList array when using setTimeout.
  self.addMarker = function(place, idx) {
    return function() {
      self.createMarker(place, idx);
    }
  };

  // create the marker and and add it to the appropriate Place object
  // in the placesList array
  self.createMarker = function(place, idx) {
    var marker = new google.maps.Marker({
        map: self.map,
        position: place.location,
        title: place.name,
        animation: google.maps.Animation.DROP,
        id: idx
    });

    // listen for when a marker is clicked
    // to show our own infoWindow and to keep sync'd with menu
    google.maps.event.addListener(marker, 'click', function() {
        self.markerClicked(marker, idx);
    });

    // add marker to Place object
    placesList[idx].map_marker = marker;
  };

  // when the marker is clicked change the default icon,
  // bounce it once, get Foursquare info on the clicked place,
  // then sync with the places menu
  self.markerClicked = function(marker, idx) {
    // if there is a previous clicked_marker reset icon to default
    if (self.clicked_marker) {
      self.clicked_marker.setIcon();
    }
    self.clicked_marker = marker;

    marker.setIcon('images/blue_marker.png');
    marker.setAnimation(google.maps.Animation.BOUNCE);
    window.setTimeout(function() {
      marker.setAnimation(null);
      // after the animation completes get Foursquare info
      self.fs.getPlaceInfo(idx);
    }, 750);

    // sync with view model
    vm.currentPlace(placesList[idx]);
  }

  // change the marker back to its default icon
  self.resetMarker = function(marker) {
    marker.setIcon();
  }

  // display the infowindow
  self.showInfoWindow = function(idx) {
    if (self.infoWindow.marker != self.clicked_marker) {
      var place = placesList[idx];

      // build the html content for display in the infowindow
      var content = '<div class="infowindow"><h3>' +
                    place.name + '</h3>';
      self.infoWindow.marker = self.clicked_marker;
      if (!$.isEmptyObject(place.details)) {
        if (place.details.location && place.details.location.address) {
          content += '<p>' + place.details.location.address + '</p>';
        }
        if (place.details.contact && place.details.contact.phone) {
          var phone = place.details.contact.phone;
          if (phone.length === 10){
            phone = '('+phone.substring(0,3)+') '+phone.substring(3,6)+'-'+phone.substring(6);
          }
          content += '<p>' + phone + '</p>';
        }
        if (place.details.hours && place.details.hours.status) {
          content += '<p>' + place.details.hours.status + '</p>';
        }
        if (place.details.rating) {
          content += '<p>' + place.details.rating + '</p>';
        }
        if (place.details.url) {
          content += '<p><a href="' + place.details.url + '" target="_blank">Visit Website</a></p>';
        }
      }
      content += '</div>';

      // add html content to infowindow and display
      self.infoWindow.setContent(content);
      self.infoWindow.open(self.map, self.clicked_marker);
      self.infoWindow.addListener('closeclick', function() {
        self.infoWindow.marker = null;
      });
    }
  }
}

// !! Load Google map and set up the Knockout ViewModel

// toggle the places menu when the menu is hidden on smaller displays
// when the hamburger icon button is clicked.
$('[data-toggle=offcanvas]').click(function() {
  $('.row-offcanvas').toggleClass('active');
});

// create knockoutjs ViewModel
var vm = new ViewModel();
ko.applyBindings(vm);
// need to subscibe our search box to monitor keystrokes
// to filter places and map markers
vm.placeFilter.subscribe(vm.filter);

// map will be initialized by callback in the include link to load map
// in the script tag on the index.html page
var map = new GoogleMap();
// on resize make sure the map remains centered on Ocean City, Maryland.
window.addEventListener( 'resize', function(){
  map.centerMap();
});
