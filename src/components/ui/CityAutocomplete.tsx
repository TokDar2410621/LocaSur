/**
 * Composant d'autocomplétion de villes avec tags
 * Permet d'ajouter plusieurs villes du Québec
 */

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Liste des principales villes du Québec (fallback si API échoue)
const VILLES_QUEBEC = [
  "Montréal", "Québec", "Laval", "Gatineau", "Longueuil", "Sherbrooke",
  "Saguenay", "Lévis", "Trois-Rivières", "Terrebonne", "Saint-Jean-sur-Richelieu",
  "Chicoutimi", "Jonquière", "La Baie", "Alma", "Roberval", "Dolbeau-Mistassini",
  "Drummondville", "Saint-Hyacinthe", "Granby", "Shawinigan", "Rimouski",
  "Saint-Jérôme", "Victoriaville", "Rouyn-Noranda", "Val-d'Or", "Sorel-Tracy",
  "Salaberry-de-Valleyfield", "Joliette", "Baie-Comeau", "Sept-Îles",
  "Magog", "Thetford Mines", "Saint-Georges", "Rivière-du-Loup", "Matane",
  "Cowansville", "Sainte-Marie", "Beloeil", "Lachute", "Montmagny",
  "Saint-Eustache", "Blainville", "Brossard", "Repentigny", "Saint-Laurent"
];

interface CitySuggestion {
  name: string;
  region?: string;
}

interface CityAutocompleteProps {
  value: string[];
  onChange: (cities: string[]) => void;
  placeholder?: string;
  className?: string;
  maxCities?: number;
}

export function CityAutocomplete({
  value = [],
  onChange,
  placeholder = "Rechercher une ville...",
  className,
  maxCities = 10,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
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

    if (inputValue.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      await fetchSuggestions(inputValue);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    try {
      // Filtrer la liste locale d'abord (rapide)
      const localMatches = VILLES_QUEBEC.filter(
        (ville) =>
          ville.toLowerCase().includes(query.toLowerCase()) &&
          !value.includes(ville)
      ).map((name) => ({ name }));

      if (localMatches.length > 0) {
        setSuggestions(localMatches.slice(0, 6));
        setIsOpen(true);
        setSelectedIndex(-1);
        setLoading(false);
        return;
      }

      // Si pas de match local, chercher via Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, Québec, Canada&limit=6&addressdetails=1&featuretype=city`
      );

      if (!response.ok) throw new Error("Erreur API");

      const data = await response.json();

      if (data.length > 0) {
        const parsed: CitySuggestion[] = data
          .map((item: any) => {
            const addr = item.address || {};
            const cityName = addr.city || addr.town || addr.village || addr.municipality || item.display_name.split(",")[0];
            return {
              name: cityName,
              region: addr.state || "Québec",
            };
          })
          .filter(
            (s: CitySuggestion) =>
              s.name && !value.includes(s.name)
          );

        // Dédupliquer par nom
        const unique = parsed.filter(
          (s: CitySuggestion, i: number, arr: CitySuggestion[]) =>
            arr.findIndex((x) => x.name === s.name) === i
        );

        setSuggestions(unique);
        setIsOpen(unique.length > 0);
        setSelectedIndex(-1);
      } else {
        // Si toujours rien, permettre d'ajouter la valeur tapée
        setSuggestions([{ name: query }]);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Erreur recherche ville:", error);
      // En cas d'erreur, permettre d'ajouter la valeur tapée
      if (!value.includes(query)) {
        setSuggestions([{ name: query }]);
        setIsOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const addCity = (city: string) => {
    if (city && !value.includes(city) && value.length < maxCities) {
      onChange([...value, city]);
    }
    setInputValue("");
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeCity = (city: string) => {
    onChange(value.filter((c) => c !== city));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        addCity(suggestions[selectedIndex].name);
      } else if (inputValue && !value.includes(inputValue)) {
        addCity(inputValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Supprimer la dernière ville si le champ est vide
      removeCity(value[value.length - 1]);
    }
  };

  return (
    <div ref={wrapperRef} className="space-y-2">
      {/* Tags des villes sélectionnées */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium"
            >
              <MapPin className="w-3 h-3" />
              {city}
              <button
                onClick={() => removeCity(city)}
                className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Champ de recherche */}
      {value.length < maxCities && (
        <div className="relative">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpen(true);
              }}
              placeholder={value.length === 0 ? placeholder : "Ajouter une autre ville..."}
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
                  onClick={() => addCity(suggestion.name)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2",
                    selectedIndex === index && "bg-muted"
                  )}
                >
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{suggestion.name}</span>
                  {suggestion.region && (
                    <span className="text-xs text-muted-foreground">
                      {suggestion.region}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {value.length >= maxCities && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxCities} villes atteint
        </p>
      )}
    </div>
  );
}
