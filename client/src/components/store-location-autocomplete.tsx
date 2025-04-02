import { useState, useRef, useEffect } from "react";
import { storeLocations } from "@shared/store-locations";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, MapPin, Map } from "lucide-react";
import GoogleMapComponent from "@/components/google-map-component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Find nearby locations based on franchisee location
  useEffect(() => {
    // This would normally use real proximity detection, but for this demo
    // we'll just use the first 5 locations
    setNearbyLocations(storeLocations.slice(0, 5));

    // In a real implementation, we would use the user's franchisee location:
    // if (user?.franchiseeName) {
    //   const franchiseeLocation = { lat: x, lng: y };
    //   const sorted = storeLocations.sort((a, b) => {
    //     return getDistance(franchiseeLocation, a.coordinates) - getDistance(franchiseeLocation, b.coordinates);
    //   });
    //   setNearbyLocations(sorted.slice(0, 5));
    // }
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

  const handleSelectLocation = (location: (typeof storeLocations)[0]) => {
    setQuery(location.fullAddress);
    onChange(location.fullAddress);
    setIsFocused(false);
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
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-800">
              <Map size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>7-Eleven Locations in the Philippines</DialogTitle>
              <DialogDescription>
                These are locations near your franchise. Click on a location to select it.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md h-[300px] overflow-hidden">
              <GoogleMapComponent 
                locations={storeLocations}
                onSelectLocation={handleSelectLocation}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {nearbyLocations.map(location => (
                <div 
                  key={location.id}
                  className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    handleSelectLocation(location);
                    setMapOpen(false);
                  }}
                >
                  <MapPin className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-gray-600">{location.fullAddress}</div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <ul className="py-1">
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