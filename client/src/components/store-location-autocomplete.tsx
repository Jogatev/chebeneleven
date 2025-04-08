import { useState, useRef, useEffect } from "react";
import { storeLocations } from "@shared/store-locations";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, MapPin, Map, Building, Navigation, Target } from "lucide-react";
import GoogleMapComponent from "@/components/google-map-component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

interface StoreLocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function StoreLocationAutocomplete({
  value,
  onChange,
  className,
}: StoreLocationAutocompleteProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof storeLocations>([]);
  const [nearbyLocations, setNearbyLocations] = useState<typeof storeLocations>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("map");
  const [selectedLocation, setSelectedLocation] = useState<(typeof storeLocations)[0] | null>(null);
  const [customLocation, setCustomLocation] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Find nearby locations based on franchisee location
  useEffect(() => {
    // This would normally use real proximity detection, but for this demo
    // we'll just use the first 5 locations
    setNearbyLocations(storeLocations.slice(0, 5));
  }, [user]);

  // Filter suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions(nearbyLocations); // Show nearby locations when query is empty
      return;
    }

    const filteredLocations = storeLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase()) ||
        location.city.toLowerCase().includes(query.toLowerCase()) ||
        location.state.toLowerCase().includes(query.toLowerCase()) ||
        location.zipCode.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filteredLocations.slice(0, 5)); // Limit to 5 suggestions
  }, [query, nearbyLocations]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize selected location when dialog opens
  useEffect(() => {
    if (mapOpen) {
      // Try to find the current value in storeLocations
      const currentLocation = storeLocations.find(
        loc => loc.fullAddress === query || loc.fullAddress === value
      );
      setSelectedLocation(currentLocation || null);
    }
  }, [mapOpen, query, value]);

  const handleSelectLocation = (location: (typeof storeLocations)[0] | any) => {
    setQuery(location.fullAddress);
    onChange(location.fullAddress);
    setSelectedLocation(location);
    
    // If it's a custom location, store it separately
    if (location.id.toString().startsWith('custom-') || location.id.toString().startsWith('search-')) {
      setCustomLocation(location);
    }
    
    setIsFocused(false);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      setQuery(selectedLocation.fullAddress);
      onChange(selectedLocation.fullAddress);
    }
    setMapOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search 7-Eleven locations in Philippines..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Don't immediately update the parent form value
            // Only update when a suggestion is selected
          }}
          onFocus={() => setIsFocused(true)}
          className={cn("pl-10", className)}
        />
        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-800">
              <Map size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select Store Location</DialogTitle>
              <DialogDescription>
                Choose a store location or add a custom location by clicking on the map.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="map" value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map" className="flex items-center">
                  <Map className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="border rounded-md p-0 mt-2">
                <div className="rounded-md h-[350px] overflow-hidden">
                  <GoogleMapComponent 
                    locations={storeLocations}
                    onSelectLocation={(location) => {
                      setSelectedLocation(location);
                      
                      // If it's a custom location, store it separately
                      if (location.id.toString().startsWith('custom-') || location.id.toString().startsWith('search-')) {
                        setCustomLocation(location);
                      }
                      
                      setSelectedTab("list"); // Switch to list to show selection
                    }}
                    selectedLocation={selectedLocation}
                    allowCustomPin={true} // Enable custom pin creation
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="list" className="mt-2">
                <div className="relative border rounded-md">
                  <div className="sticky top-0 p-2 bg-gray-50 border-b flex items-center">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <Input 
                      placeholder="Search stores by name or address..." 
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1 p-2 max-h-[300px] overflow-y-auto">
                    {customLocation && (
                      <div 
                        className={cn(
                          "flex items-start p-3 border rounded-md hover:bg-green-50 cursor-pointer transition-colors mb-2",
                          selectedLocation?.id === customLocation.id ? "bg-green-50 border-green-300" : "border-green-200 bg-green-50/50"
                        )}
                        onClick={() => setSelectedLocation(customLocation)}
                      >
                        <Target className={cn(
                          "h-5 w-5 mr-2 flex-shrink-0 mt-1", 
                          selectedLocation?.id === customLocation.id ? "text-green-600" : "text-green-500"
                        )} />
                        <div>
                          <div className="font-medium">Custom Location</div>
                          <div className="text-sm text-gray-600">{customLocation.fullAddress}</div>
                          {selectedLocation?.id === customLocation.id && (
                            <div className="flex items-center text-xs text-green-600 mt-1">
                              <Navigation size={12} className="mr-1" /> Selected location
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {(suggestions.length > 0 ? suggestions : nearbyLocations).map(location => (
                      <div 
                        key={location.id}
                        className={cn(
                          "flex items-start p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors",
                          selectedLocation?.id === location.id ? "bg-blue-50 border-blue-300" : "border-gray-200"
                        )}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <MapPin className={cn(
                          "h-5 w-5 mr-2 flex-shrink-0 mt-1", 
                          selectedLocation?.id === location.id ? "text-blue-500" : "text-orange-500"
                        )} />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-600">{location.fullAddress}</div>
                          {selectedLocation?.id === location.id && (
                            <div className="flex items-center text-xs text-blue-600 mt-1">
                              <Navigation size={12} className="mr-1" /> Selected location
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {suggestions.length === 0 && nearbyLocations.length === 0 && !customLocation && (
                      <div className="p-4 text-center text-gray-500">
                        No locations found. Try a different search term or add a custom location.
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {selectedLocation && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-start">
                  {selectedLocation.id.toString().startsWith('custom-') || selectedLocation.id.toString().startsWith('search-') ? (
                    <Target className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                  ) : (
                    <MapPin className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <div className="font-medium">Selected Location:</div>
                    <div className="text-sm">
                      {selectedLocation.id.toString().startsWith('custom-') || selectedLocation.id.toString().startsWith('search-') 
                        ? 'Custom Location' 
                        : selectedLocation.name}
                    </div>
                    <div className="text-sm text-gray-600">{selectedLocation.fullAddress}</div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setMapOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmLocation}
                disabled={!selectedLocation}
              >
                Confirm Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suggestions dropdown */}
      {isFocused && (customLocation || suggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <ul className="py-1">
            {customLocation && (
              <li
                className="px-4 py-2 hover:bg-green-50 cursor-pointer flex items-start bg-green-50/30"
                onClick={() => handleSelectLocation(customLocation)}
              >
                <Target className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium">Custom Location</div>
                  <div className="text-sm text-gray-600">{customLocation.fullAddress}</div>
                </div>
              </li>
            )}
            
            {suggestions.map((location) => (
              <li
                key={location.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onClick={() => handleSelectLocation(location)}
              >
                <MapPin className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-gray-600">{location.fullAddress}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}