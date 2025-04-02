import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { storeLocations } from '@shared/store-locations';
import { MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCAv797FUnDJyX0kULmzwaFdjEdYeYkksM';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Center on Metro Manila by default
const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842
};

interface GoogleMapComponentProps {
  locations: typeof storeLocations;
  onSelectLocation?: (location: (typeof storeLocations)[0]) => void;
}

export default function GoogleMapComponent({ 
  locations, 
  onSelectLocation 
}: GoogleMapComponentProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<(typeof storeLocations)[0] | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    // Fit map to include all markers if there are locations
    if (locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(location => {
        bounds.extend(new google.maps.LatLng(
          location.coordinates.lat,
          location.coordinates.lng
        ));
      });
      map.fitBounds(bounds);
    }
    setMap(map);
  }, [locations]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (location: (typeof storeLocations)[0]) => {
    setSelectedLocation(location);
  };

  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
  };

  const handleSelectLocation = (location: (typeof storeLocations)[0]) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
    setSelectedLocation(null);
  };

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
      },
    ],
  }), []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 p-4">
        <div className="text-center text-red-500">
          Error loading Google Maps. Please check your API key or try again later.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {locations.map(location => (
        <Marker
          key={location.id}
          position={{
            lat: location.coordinates.lat,
            lng: location.coordinates.lng
          }}
          onClick={() => handleMarkerClick(location)}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00703c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32),
          }}
        />
      ))}

      {selectedLocation && (
        <InfoWindow
          position={{
            lat: selectedLocation.coordinates.lat,
            lng: selectedLocation.coordinates.lng
          }}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="p-2 max-w-[240px]">
            <h3 className="font-medium text-[#00703c]">{selectedLocation.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedLocation.fullAddress}</p>
            <button
              onClick={() => handleSelectLocation(selectedLocation)}
              className="mt-3 text-sm bg-[#00703c] hover:bg-[#005a30] text-white py-1 px-2 rounded w-full"
            >
              Select this location
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}