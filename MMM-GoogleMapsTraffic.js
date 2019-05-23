/* global Module */

/* Magic Mirror
 * Module: MMM-GoogleMapsTraffic
 *
 * By Victor Mora
 * MIT Licensed.

 * Updated by Isaac Levin to add search capabilities

 */

Module.register("MMM-GoogleMapsTraffic", {
  // Module config defaults
  defaults: {
    key: "",
    lat: "",
    lng: "",
    height: "300px",
    width: "300px",
    zoom: 10,
    mapTypeId: "roadmap",
    styledMapType: "standard",
    disableDefaultUI: true,
    updateInterval: 900000,
    backgroundColor: "rgba(0, 0, 0, 0)"
  },

  start: function() {
    Log.info("Starting module: " + this.name);

    if (this.config.key === "") {
      Log.error("MMM-GoogleMapsTraffic: key not set!");
      return;
    }

    this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", {
      style: this.config.styledMapType
    });

    setInterval(function() {
      this.updateDom();
    }, this.config.updateInterval);
  },

  updateMap: function(location) {
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: this.config.zoom,
      mapTypeId: this.config.mapTypeId,
      center: {
        lat: this.config.lat,
        lng: this.config.lng
      },
      styles: this.styledMapType,
      disableDefaultUI: this.config.disableDefaultUI,
      backgroundColor: this.config.backgroundColor
    });

    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    var geocoder = new google.maps.Geocoder();

    var address = location;
    this.geocodeAddress(address, geocoder, map);
  },

  geocodeAddress: function(location, geocoder, resultsMap) {
    if (location != undefined) {
      var address = location;
      geocoder.geocode({ address: address }, function(results, status) {
        if (status === "OK") {
          let pos = new google.maps.LatLng(
            results[0].geometry.location.lat(),
            results[0].geometry.location.lng()
          );
          resultsMap.setCenter(pos);
          var marker = new google.maps.Marker({
            map: resultsMap,
            position: pos
          });
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    }
  },

  getDom: function() {
    var lat = this.config.lat;
    var lng = this.config.lng;

    var wrapper = document.createElement("div");
    wrapper.setAttribute("id", "map");

    wrapper.style.height = this.config.height;
    wrapper.style.width = this.config.width;

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=" + this.config.key;
    script.setAttribute("defer", "");
    script.setAttribute("async", "");
    document.body.appendChild(script);

    return wrapper;
  },
  ///////////////////// For use with Hello-Lucy /////////////////////////////////////////
  notificationReceived: function(notification, payload) {
    if (notification === "HIDE_TRAFFIC") {
      this.hide();
    } else if (notification === "SHOW_TRAFFIC") {
      this.show(1000);
      this.updateMap(payload);
    }
  },

  // socketNotificationReceived from helper
  socketNotificationReceived: function(notification, payload) {
    if (notification === "MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE") {
      this.styledMapType = payload.styledMapType;
      console.log = this.styledMapType;
      this.updateDom();
    }
  }
});
