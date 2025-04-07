import { useRef, useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, Target, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeLocations } from "@shared/store-locations";

interface GoogleMapComponentProps {
  locations: typeof storeLocations;
  onSelectLocation: (location: typeof storeLocations[0] | any) => void;
  selectedLocation?: typeof storeLocations[0] | null;
  allowCustomPin?: boolean;
}

export default function GoogleMapComponent({
  locations,
  onSelectLocation,
  selectedLocation,
  allowCustomPin = false,
}: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [customMarker, setCustomMarker] = useState<google.maps.Marker | null>(null);
  const [customLocation, setCustomLocation] = useState<{
    id: string;
    name: string;
    fullAddress: string;
    coordinates: { lat: number; lng: number };
  } | null>(null);
  const [isCreatingCustomPin, setIsCreatingCustomPin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  // Define marker icons (without using image files)
  const createStoreIcon = (isSelected = false) => ({
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: isSelected ? '#1E40AF' : '#FF7E00', // Blue for selected, Orange for regular store
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: isSelected ? '#1E3A8A' : '#D97706',
    scale: 10,
    labelOrigin: new google.maps.Point(0, -15),
  });

  const createCustomIcon = () => ({
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#10B981', // Green for custom location
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#059669',
    scale: 10,
    labelOrigin: new google.maps.Point(0, -15),
  });

  // Initialize the map
  useEffect(() => {
    const initMap = async () => {
      setIsLoadingMap(true);
      const loader = new Loader({
        apiKey: 'AIzaSyCAv797FUnDJyX0kULmzwaFdjEdYeYkksM',
        version: "weekly",
        libraries: ["places"], // Add places library for search functionality
      });

      try {
        const google = await loader.load();
        if (mapRef.current) {
          // Center the map on the Philippines
          const mapOptions = {
            center: { lat: 14.5995, lng: 120.9842 }, // Manila
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          };
          
          const newMap = new google.maps.Map(mapRef.current, mapOptions);
          setMap(newMap);
          
          // Initialize the places autocomplete
          if (searchInputRef.current) {
            const autocompleteOptions = {
              types: ['geocode', 'establishment'],
              componentRestrictions: { country: 'ph' }, // Restrict to Philippines
              fields: ['geometry', 'name', 'formatted_address']
            };
            
            const newAutocomplete = new google.maps.places.Autocomplete(
              searchInputRef.current,
              autocompleteOptions
            );
            
            newAutocomplete.bindTo('bounds', newMap);
            setAutocomplete(newAutocomplete);
            
            // Handle place selection
            newAutocomplete.addListener('place_changed', () => {
              const place = newAutocomplete.getPlace();
              
              if (place.geometry && place.geometry.location) {
                // Create a custom location from the selected place
                const newCustomLocation = {
                  id: `search-${Date.now()}`,
                  name: place.name || "Searched Location",
                  fullAddress: place.formatted_address || "",
                  coordinates: { 
                    lat: place.geometry.location.lat(), 
                    lng: place.geometry.location.lng() 
                  }
                };
                
                // Add a marker for the selected place
                if (customMarker) {
                  customMarker.setMap(null);
                }
                
                const newMarker = new google.maps.Marker({
                  position: place.geometry.location,
                  map: newMap,
                  animation: google.maps.Animation.DROP,
                  icon: createCustomIcon(),
                  label: {
                    text: "📍",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#10B981"
                  }
                });
                
                setCustomMarker(newMarker);
                setCustomLocation(newCustomLocation);
                
                // Pan to the location
                if (place.geometry.viewport) {
                  newMap.fitBounds(place.geometry.viewport);
                } else {
                  newMap.setCenter(place.geometry.location);
                  newMap.setZoom(17);
                }
                
                // Pass the selected location back
                onSelectLocation(newCustomLocation);
              }
            });
          }
          
          setIsLoadingMap(false);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setIsLoadingMap(false);
      }
    };

    initMap();
  }, [onSelectLocation]);

  // Add markers for 7-Eleven locations
  useEffect(() => {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Create new markers for 7-Eleven locations
    const newMarkers = locations.map(location => {
      const marker = new google.maps.Marker({
        position: { 
          lat: location.coordinates.lat, 
          lng: location.coordinates.lng 
        },
        map,
        title: location.name,
        icon: createStoreIcon(selectedLocation?.id === location.id),
        label: {
          text: "🏪",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#000000"
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 10px; max-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 5px;">${location.name}</div>
          <div style="font-size: 0.9em; margin-bottom: 8px;">${location.fullAddress}</div>
          <button style="background-color: #10B981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.9em;" 
            id="select-store-${location.id}">
            Select this store
          </button>
        </div>`
      });
      
      // Add click event listener
      marker.addListener('click', () => {
        // Close all open info windows (if needed)
        infoWindow.open(map, marker);
        
        // Add event listener for the select button in info window
        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          const selectBtn = document.getElementById(`select-store-${location.id}`);
          if (selectBtn) {
            selectBtn.addEventListener('click', () => {
              onSelectLocation(location);
              infoWindow.close();
            });
          }
        });
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds);
    }

    // Add click listener for custom pin if allowed
    if (allowCustomPin) {
      const clickListener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (isCreatingCustomPin && event.latLng) {
          addCustomPin(event.latLng);
        }
      });

      return () => {
        google.maps.event.removeListener(clickListener);
      };
    }
  }, [map, locations, selectedLocation, allowCustomPin, isCreatingCustomPin, onSelectLocation]);

  // Function to add a custom pin
  const addCustomPin = async (latLng: google.maps.LatLng) => {
    if (!map) return;

    // Remove existing custom marker if any
    if (customMarker) {
      customMarker.setMap(null);
    }

    // Create a new marker
    const newMarker = new google.maps.Marker({
      position: latLng,
      map,
      animation: google.maps.Animation.DROP,
      icon: createCustomIcon(),
      label: {
        text: "📍",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#10B981"
      }
    });

    setCustomMarker(newMarker);

    // Get address using reverse geocoding
    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({
      location: { lat: latLng.lat(), lng: latLng.lng() }
    });

    if (response.results[0]) {
      const address = response.results[0].formatted_address;
      
      // Create a custom location object
      const newCustomLocation = {
        id: `custom-${Date.now()}`,
        name: "Custom Location",
        fullAddress: address,
        coordinates: { 
          lat: latLng.lat(), 
          lng: latLng.lng() 
        }
      };

      setCustomLocation(newCustomLocation);
      onSelectLocation(newCustomLocation);
      setIsCreatingCustomPin(false);
    }
  };

  // Toggle custom pin creation mode
  const toggleCustomPinMode = () => {
    setIsCreatingCustomPin(!isCreatingCustomPin);
  };

  // Handle manual search submission
  const handleManualSearch = () => {
    if (!map || !searchQuery.trim()) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: searchQuery, componentRestrictions: { country: 'ph' } },
      (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          
          // Create a custom location
          const newCustomLocation = {
            id: `search-${Date.now()}`,
            name: "Searched Location",
            fullAddress: results[0].formatted_address || searchQuery,
            coordinates: { 
              lat: location.lat(), 
              lng: location.lng() 
            }
          };
          
          // Add a marker
          if (customMarker) {
            customMarker.setMap(null);
          }
          
          const newMarker = new google.maps.Marker({
            position: location,
            map,
            animation: google.maps.Animation.DROP,
            icon: createCustomIcon(),
            label: {
              text: "📍",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#10B981"
            }
          });
          
          setCustomMarker(newMarker);
          setCustomLocation(newCustomLocation);
          
          // Center the map on the result
          map.setCenter(location);
          map.setZoom(16);
          
          // Pass the selected location back
          onSelectLocation(newCustomLocation);
        }
      }
    );
  };

  return (
    <div className="h-full relative">
      {/* Search Box - Google Maps Style */}
      <div className="absolute top-2 left-0 right-0 z-10 mx-2 sm:mx-10">
        <div className="flex shadow-md rounded-md overflow-hidden">
          <Input
            ref={searchInputRef}
            placeholder="Search for locations in the Philippines"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-white rounded-r-none px-3 py-2 h-10 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button 
            variant="default" 
            onClick={handleManualSearch}
            className="rounded-l-none h-10 px-3"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Custom Pin Button */}
      {allowCustomPin && (
        <div className="absolute top-14 right-2 z-10 sm:right-10">
          <Button 
            size="sm"
            variant={isCreatingCustomPin ? "default" : "secondary"}
            onClick={toggleCustomPinMode}
            className="flex items-center gap-1 shadow-md"
          >
            <Target className="h-4 w-4" />
            {isCreatingCustomPin ? "Click on Map" : "Custom Pin"}
          </Button>
        </div>
      )}
      
      {/* Store Locations Button */}
      <div className="absolute top-14 left-2 z-10 sm:left-10">
        <Button 
          size="sm"
          variant="outline"
          onClick={() => {
            if (map && markers.length > 0) {
              const bounds = new google.maps.LatLngBounds();
              markers.forEach(marker => {
                bounds.extend(marker.getPosition()!);
              });
              map.fitBounds(bounds);
            }
          }}
          className="flex items-center gap-1 shadow-md bg-white"
        >
          <Store className="h-4 w-4" />
          7-Eleven Stores
        </Button>
      </div>
      
      {/* Map Container */}
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Loading Indicator */}
      {isLoadingMap && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
            <p className="mt-2 text-gray-700">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Instructions for Custom Pin */}
      {isCreatingCustomPin && (
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-white p-2 rounded-md shadow-md text-sm text-center mx-2">
          Click anywhere on the map to place your custom location pin
        </div>
      )}
    </div>
  );
}
