# Udacity Neighborhood Map Project
## Ocean City, Maryland

### Description
Displays a Google map centered on Ocean City, Maryland with markers and a menu for a list of places defined in app.js.  You can select a place from either the menu or by clicking the map marker. This will display an InfoWindow on the map showing information about the place from Foursquare.

### To Run Application
* Save file to a directory that can be served by a web server running on port 80.
* For the Foursquare API to work correctly, the url should start with http://localhost/. For example: http://localhost/udacity-fs-neighborhood-map/

### Notes
* Bootstrap is used for it's grid system and css.
* I supplied the latitude and longitude for Google Maps api and the venue id for the Foursquare api in the app.js file.
* Used the KnockoutJS, Foursquare and Google Maps documentation as well as the Udacity classes.
* I found how to implement the menu sliding in from the left instead of dropping down like the Bootstrap default from Stackoverflow.com which pointed me here: https://www.bootply.com/88026
