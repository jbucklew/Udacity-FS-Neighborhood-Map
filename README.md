# Udacity Neighborhood Map Project
## Ocean City, Maryland

### Description
Displays a Google map centered on Ocean City, Maryland with markers and a menu for a list of places defined in app.js.  You can select a place from either the menu or by clicking the map marker. This will display an InfoWindow on the map showing information about the place from Foursquare.

### To Run Application
* You will need a web server for the application to work correctly.  Below are instructions using the web server provided by python.
* Make sure python is installed.  You can get it here: https://www.python.org/. Follow the documentation provided on the site to install.
* Download the application and save to any directory.
* Start the web server using the command below depending on your version of Python:
  * Python 2.7 - ```python -m SimpleHTTPServer 8000```
  * Python 3.x - ```python -m http.server 8000```
* Open your web browser and connect to http://localhost:8000 to use the application

### Notes
* Bootstrap is used for it's grid system and css.
* I supplied the latitude and longitude for Google Maps api and the venue id for the Foursquare api in the app.js file.
* Used the KnockoutJS, Foursquare and Google Maps documentation as well as the Udacity classes.
* I found how to implement the menu sliding in from the left instead of dropping down like the Bootstrap default from Stackoverflow.com which pointed me here: https://www.bootply.com/88026
