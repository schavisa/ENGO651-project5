# MQTT Mess

ENGO 651 - Adv. Topics on Geospatial Technologies - Projects 5

By Adam and Chavisa

## Description

[Launch the application on GitHub pages here.](https://schavisa.github.io/ENGO651-project5/lab5.html)

In this project, we use the MQTT protocol to send and receive location updates, as well as any other messages of the users choice, by using the [Paho](https://www.eclipse.org/paho/index.php?page=clients/js/index.php) javscript client to connect to an MQTT broker through WebSockets.

At first, the user is prompted to enter their name, course, the address of the MQTT broker, and the port.  The name and course can be arbitrary, and are used to define the default topic used for location sharing.  For the host and port, we recommend using <test.mosquitto.org> and port 8081.  Once the connection is established, several input fields and a map appear on the page.  Using the "Publish" section, users can enter a topic and a message, and click the "Publish" button to have their mesage published to the specified topic on the connected MQTT broker.  By entering a topic in the "Subscribe & Unsubscribe" section and clicking "Subscribe", the app will subscribe to that topic, and messages published to that topic will appear in the section below.  Similarly, users can unsubscribe from a topic by entering the topic and clicking "Unsubscribe".

By default, the app subscribes to `<name>/<course>/my_temperature` where `<name>` and `<course>` are as entered previously by the user, but with all spaces replaced by underscores.  As such, messages published to this topic will apear in the "Received Messages" section.  If the "Share my Status" button is clicked, a GeoJSON message with the user's current location and a random temperature is created and published to this topic.  The message is then received by the app, and the location is displayed as a marker on the map, with the temperature appearing as a popup.  Additionally, the colour of the marker will change depending on the temperature.

## File descriptions

The file [lab5.html](./lab5.html) defines the content composing the frontend of our application and links to the required libraries.  All styling is contained in the [style.css](./style.css) file.

The file [script.js](./script.js) contains the backend logic of the application.  In this file, we instantiate a Leaflet map and add it to the page.  Functions are then defined to connect to the MQTT broker using Paho and handle a failed connection, a successful connection, a dropped connection, and a connection stopped by the user.  The `onMessageArrived` function receives messages from the subscribed topics and displays them on the page, and the `send_message` and `pub` functions handle publishing messages to a topic.  Then the "Share my Status" button is clicked, `pub_status` gets the current location of the user and passes the result to `createGeoJSON`, which creates the GeoJSON message to update the map and publishes it.  When this GeoJSON message is received, `createMarker` adds the correct marker to the map.  Finally, `sub_topics` handles subscribing and unsubscribing to topics entered by the user.
