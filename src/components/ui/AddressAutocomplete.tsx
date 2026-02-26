/**
 * Composant d'autocomplétion d'adresses
 * Utilise l'API Adresse Québec (gratuite)
 */

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressSuggestion {
  adresse: string;
  ville: string;
  codePostal?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Commencez à taper une adresse...",
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      await fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    try {
      // API Adresse Québec - Suggestions
      const response = await fetch(
        `https://servicescarto.mern.gouv.qc.ca/pes/rest/services/Geocodage/GeocodeService/GeocodeServer/suggest?text=${encodeURIComponent(query)}&f=json&maxSuggestions=5`
      );

      if (!response.ok) throw new Error("Erreur API");

      const data = await response.json();

      if (data.suggestions && data.suggestions.length > 0) {
        // Parser les suggestions
        const parsed: AddressSuggestion[] = data.suggestions.map((s: any) => {
          // Format typique: "123 Rue Principale, Saguenay, QC"
          const parts = s.text.split(", ");
          const adresse = parts[0] || s.text;
          const ville = parts[1] || "";

          return {
            adresse: adresse,
            ville: ville.replace(", QC", "").replace(", Québec", ""),
            codePostal: parts[2] || undefined,
          };
        });

        setSuggestions(parsed);
        setIsOpen(true);
        setSelectedIndex(-1);
      } else {
        // Fallback: utiliser Nominatim pour le Québec
        await fetchNominatimSuggestions(query);
      }
    } catch (error) {
      console.error("Erreur autocomplétion:", error);
      // Fallback sur Nominatim
      await fetchNominatimSuggestions(query);
    } finally {
      setLoading(false);
    }
  };

  const fetchNominatimSuggestions = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Québec, Canada")}&limit=5&addressdetails=1`
      );

      if (!response.ok) throw new Error("Erreur Nominatim");

      const data = await response.json();

      if (data.length > 0) {
        const parsed: AddressSuggestion[] = data.map((item: any) => {
          const addr = item.address || {};
          const houseNumber = addr.house_number || "";
          const road = addr.road || addr.pedestrian || addr.street || "";
          const adresse = houseNumber ? `${houseNumber} ${road}` : road || item.display_name.split(",")[0];

          return {
            adresse: adresse.trim(),
            ville: addr.city || addr.town || addr.village || addr.municipality || "",
            codePostal: addr.postcode,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          };
        });

        setSuggestions(parsed);
        setIsOpen(parsed.length > 0);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Erreur Nominatim:", error);
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const geocodeAddress = async (
    fullAddress: string
  ): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://servicescarto.mern.gouv.qc.ca/pes/rest/services/Geocodage/GeocodeService/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(fullAddress)}&f=json&outFields=*&maxLocations=1`
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (data.candidates?.length > 0) {
        const { x, y } = data.candidates[0].location;
        return { lat: y, lng: x };
      }
    } catch (e) {
      console.error("Geocoding error:", e);
    }
    return null;
  };

  const handleSelect = async (suggestion: AddressSuggestion) => {
    onChange(suggestion.adresse);
    setIsOpen(false);
    setSuggestions([]);

    // Si pas de coordonnées (vient du suggest Quebec), géocoder
    if (!suggestion.latitude || !suggestion.longitude) {
      const fullAddress = `${suggestion.adresse}, ${suggestion.ville}, QC`;
      const coords = await geocodeAddress(fullAddress);
      if (coords) {
        suggestion.latitude = coords.lat;
        suggestion.longitude = coords.lng;
      }
    }

    onSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pr-10", className)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Dropdown des suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3",
                selectedIndex === index && "bg-muted"
              )}
            >
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{suggestion.adresse}</p>
                {suggestion.ville && (
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.ville}
                    {suggestion.codePostal && `, ${suggestion.codePostal}`}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
