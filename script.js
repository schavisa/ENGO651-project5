// set-up
var connected_flag=0;
var mqtt;
var reconnectTimeout = 2000;
var marker;
var json;

// page set-up
document.getElementById("stop-butt").disabled = true;
showDiv("none");

// Define the map centered on Calgary
var map = L.map('map').setView([51.039439, -114.054339], 11);

// Add the basemap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


function MQTTconnect(){
    var host = document.getElementById("host").value;
    var port = parseInt(document.getElementById("port").value);

    if (host == "" || port == ""){
        document.getElementById("status").innerHTML = "Not enough information";
        return false;
    }
    
    if (document.getElementById("username").value=="" || document.getElementById("course").value == ""){
        document.getElementById("status").innerHTML = "Username and/or course are invalid.";
        return false;
    }
    
    document.getElementById("status").innerHTML = "";

    // Connect to the broker via a websocket
    mqtt = new Paho.MQTT.Client(host=host, port=port, clientId='MyReallyAwesomeClientID')
    
    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure,
        useSSL: true,
    };

    mqtt.onConectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;
    
    mqtt.connect(options); // connect

    //limit user to change information
    document.getElementById("host").readOnly = true;
    document.getElementById("port").readOnly = true;
    document.getElementById("username").readOnly  = true;
    document.getElementById("course").readOnly  = true;

    //disable buttons
    document.getElementById("start-butt").disabled = true;
    document.getElementById("stop-butt").disabled = false;

    return false;
}


function onConnectionLost(){
    document.getElementById("status").innerHTML = "Connection Lost";
    alert('Connection Lost! Attempting to reconnect...');
    console.log("connection lost");
    setTimeout(MQTTconnect, reconnectTimeout);
    return false;
}


function onFailure(message){
    console.log("Failed");
    document.getElementById("status").innerHTML = "Failed";
    setTimeout(MQTTconnect, reconnectTimeout);
    return false;
}


function onMessageArrived(r_message){
    var topic = r_message.destinationName;

    document.getElementById("topic").innerHTML = r_message.destinationName;
    
    if (topic.includes("/my_temperature")){
        json = JSON.parse(r_message.payloadString);
        document.getElementById("message").innerHTML = json.properties.temp;
        createMarker(json);
    } else {
        document.getElementById("message").innerHTML = r_message.payloadString;
    }
    return false;
    
}


function onConnect() {
    document.getElementById("status").innerHTML = "Connected";
    connected_flag=1
    console.log("on Connect "+connected_flag);

    //show mqtt-div
    showDiv("block");
    return false;
}


function send_message(topic, value){
    console.log("topic= "+topic);
    console.log("value= "+value);
    message = new Paho.MQTT.Message(value);
    message.destinationName = topic;

    mqtt.send(message);

    return false;
}


function pub(){
    if(connected_flag==0){
        out_msg="<b> Not Connected so can't send </b>"
        console.log(out_msg);
        document.getElementById("messages").innerHTML = out_msg;
    }

    var topic=document.getElementById("publish-topic").value;
    var value=document.getElementById("publish-message").value;

    if (topic == "") {
        document.getElementById("publish-topic").value = "";
        document.getElementById("publish-message").value = "";
        console.log("Topic is invalid.");
        return false;
    }

    send_message(topic, value);
    document.getElementById("publish-topic").value = "";
    document.getElementById("publish-message").value = "";

}


function pub_status(){

    if(connected_flag==0){
        out_msg="<b>Not Connected so can't send</b>"
        console.log(out_msg);
        document.getElementById("messages").innerHTML = out_msg;
    }
    console.log(navigator);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(createGeoJSON);
    } else { 
        document.getElementById("message").innerHTML = "Geolocation is not supported by this browser.";
    }

}


function createGeoJSON(position) {

    json = JSON.stringify({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [position.coords.latitude, position.coords.longitude]
        },
        "properties": {
            "temp": parseInt(Math.random() * (60 - (-40)) + (-40))
        }
      });

    
    var username = document.getElementById("username").value;
    var course = document.getElementById("course").value;
    var topic = course.replaceAll(' ', '_') + "/" + username.replaceAll(' ', '_') + "/my_temperature";
    var value = json;
    send_message(topic, value);
    display_msg("", "");
}


function display_msg(topic, msg){
    document.getElementById("topic").innerHTML = topic;
    document.getElementById("message").innerHTML = msg;
}


function sub_topics(con){
        document.getElementById("message").innerHTML = "";
        if(connected_flag==0){
            out_msg="<b>Not Connected so san't subscribe</b>"
            console.log(out_msg);
            document.getElementById("messages").innerHTML = out_msg;
            return false;
        }

        var stopic=document.getElementById("subscribe-topic").value;

        if (stopic == "") {
            return false;
        }

        if (con== "sub"){
            console.log("Subscribeing to topic="+stopic);
            mqtt.subscribe(stopic);
            
        } else if (con== "unsub") {
            console.log("Unsubscribeing to topic="+stopic);
            mqtt.unsubscribe(stopic);
        } else {
            return false;
        }

        display_msg("", "");
        document.getElementById("subscribe-topic").value = "";
        return false;
}


function createMarker(json){
    var color = [0, 270, 150];
    //0  : blue
    //45 : purple
    //90 : pink
    //120: dark pink
    //150: red (?)
    //180: brown
    //270: green

    marker = L.marker([json.geometry.coordinates[0], json.geometry.coordinates[1]]).addTo(map).bindPopup("Temperature: "+String(json.properties.temp)).openPopup();
    if (json.properties.temp >= -40 && json.properties.temp < 10){
        marker._icon.style.webkitFilter = "hue-rotate(" + color[0] + "deg)";
    } else if (json.properties.temp >= 10 && json.properties.temp < 30) {
        marker._icon.style.webkitFilter = "hue-rotate(" + color[1] + "deg)";
    } else {
        marker._icon.style.webkitFilter = "hue-rotate(" + color[2] + "deg)";
    }
}


function MQTTdisconnect(){
    mqtt.disconnect();
    console.log("disconnected to mqtt server");
    document.getElementById("status").innerHTML = "";
    
    document.getElementById("host").readOnly = false;
    document.getElementById("port").readOnly = false;
    document.getElementById("username").readOnly  = false;
    document.getElementById("course").readOnly  = false;

    document.getElementById("host").value = "";
    document.getElementById("port").value = "";
    document.getElementById("username").value = "";
    document.getElementById("course").value = "";

    //disable buttons
    document.getElementById("start-butt").disabled = false;
    document.getElementById("stop-butt").disabled = true;

    //hide mqtt-div
    showDiv("none");
}


function showDiv(condition) {
    document.getElementById('mqtt-div').style.display = condition;
 }
