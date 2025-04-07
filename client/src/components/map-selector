import { useState, useEffect } from "react";
import { storeLocations } from "@shared/store-locations";
import { MapPin, Navigation } from "lucide-react";
import GoogleMapComponent from "@/components/google-map-component";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MapSelectorProps {
  onSelectLocation: (location: string) => void;
  initialLocation?: string;
}

export default function MapSelector({ onSelectLocation, initialLocation }: MapSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<(typeof storeLocations)[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(storeLocations);

  // Try to find the initial location in store locations if provided
  useEffect(() => {
    if (initialLocation) {
      const location = storeLocations.find(
        loc => loc.fullAddress === initialLocation
      );
      if (location) {
        setSelectedLocation(location);
      }
    }
  }, [initialLocation]);

  // Filter locations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(storeLocations);
      return;
    }

    const filtered = storeLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.zipCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredLocations(filtered);
  }, [searchQuery]);

  const handleLocationSelect = (location: (typeof storeLocations)[0]) => {
    setSelectedLocation(location);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.fullAddress);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Search for 7-Eleven locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
        {/* Map View */}
        <div className="h-full border rounded-md overflow-hidden">
          <GoogleMapComponent
            locations={filteredLocations}
            onSelectLocation={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
        </div>

        {/* Location List */}
        <div className="border rounded-md flex flex-col h-full">
          <div className="p-2 bg-gray-50 border-b">
            <h3 className="text-sm font-medium">Available Locations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No locations found. Try a different search term.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      selectedLocation?.id === location.id
                        ? "bg-blue-50 border-blue-300"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-start">
                      <MapPin
                        className={`h-5 w-5 mr-2 mt-1 ${
                          selectedLocation?.id === location.id
                            ? "text-blue-500"
                            : "text-orange-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-600">
                          {location.fullAddress}
                        </div>
                        {selectedLocation?.id === location.id && (
                          <div className="flex items-center text-xs text-blue-600 mt-1">
                            <Navigation size={12} className="mr-1" /> Selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedLocation && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-1" />
            <div>
              <div className="font-medium">Selected Location:</div>
              <div className="text-sm">{selectedLocation.name}</div>
              <div className="text-sm text-gray-600">
                {selectedLocation.fullAddress}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
