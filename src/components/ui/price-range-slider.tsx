/**
 * PriceRangeSlider - Composant style Airbnb
 *
 * Features:
 * - Dual-thumb range slider (min/max)
 * - Histogram showing price distribution
 * - Input fields for manual entry
 */

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  // Optional histogram data (array of counts per price bucket)
  histogramData?: number[];
  formatPrice?: (value: number) => string;
  className?: string;
}

// Default histogram data (mock - represents price distribution)
const DEFAULT_HISTOGRAM = [
  2, 4, 6, 8, 12, 18, 25, 32, 28, 35, 42, 38, 45, 52, 48, 55, 50, 45, 40, 35,
  38, 42, 48, 52, 45, 40, 35, 30, 25, 20, 18, 15, 12, 10, 8, 6, 5, 4, 3, 2
];

export function PriceRangeSlider({
  min = 0,
  max = 3000,
  step = 50,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  histogramData = DEFAULT_HISTOGRAM,
  formatPrice = (v) => `${v}$`,
  className,
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = React.useState(minValue || min);
  const [localMax, setLocalMax] = React.useState(maxValue || max);

  // Sync with external values
  React.useEffect(() => {
    setLocalMin(minValue || min);
  }, [minValue, min]);

  React.useEffect(() => {
    setLocalMax(maxValue || max);
  }, [maxValue, max]);

  const handleSliderChange = (values: number[]) => {
    const [newMin, newMax] = values;
    setLocalMin(newMin);
    setLocalMax(newMax);
    onMinChange(newMin);
    onMaxChange(newMax);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, '')) || min;
    const clampedValue = Math.min(Math.max(value, min), localMax - step);
    setLocalMin(clampedValue);
    onMinChange(clampedValue);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, '')) || max;
    const clampedValue = Math.max(Math.min(value, max), localMin + step);
    setLocalMax(clampedValue);
    onMaxChange(clampedValue);
  };

  // Calculate which histogram bars are "active" (within the selected range)
  const getBarOpacity = (index: number) => {
    const barPosition = min + (index / histogramData.length) * (max - min);
    const isInRange = barPosition >= localMin && barPosition <= localMax;
    return isInRange ? 1 : 0.25;
  };

  const maxHistogramValue = Math.max(...histogramData);

  return (
    <div className={cn("w-full", className)}>
      {/* Histogram */}
      <div className="relative h-16 mb-2 flex items-end gap-[2px] px-1">
        {histogramData.map((value, index) => {
          const heightPercent = (value / maxHistogramValue) * 100;
          const isInRange = getBarOpacity(index) === 1;
          return (
            <div
              key={index}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-150",
                isInRange
                  ? "bg-primary"
                  : "bg-primary/25"
              )}
              style={{
                height: `${heightPercent}%`,
                minHeight: '4px',
              }}
            />
          );
        })}
      </div>

      {/* Slider */}
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center h-6"
        min={min}
        max={max}
        step={step}
        value={[localMin, localMax]}
        onValueChange={handleSliderChange}
        minStepsBetweenThumbs={1}
      >
        <SliderPrimitive.Track className="relative h-0.5 w-full grow overflow-hidden rounded-full bg-border">
          <SliderPrimitive.Range className="absolute h-full bg-foreground" />
        </SliderPrimitive.Track>

        {/* Min thumb */}
        <SliderPrimitive.Thumb
          className="block h-8 w-8 rounded-full border-2 border-foreground bg-background shadow-lg ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing"
          aria-label="Minimum price"
        />

        {/* Max thumb */}
        <SliderPrimitive.Thumb
          className="block h-8 w-8 rounded-full border-2 border-foreground bg-background shadow-lg ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing"
          aria-label="Maximum price"
        />
      </SliderPrimitive.Root>

      {/* Input fields */}
      <div className="flex items-center justify-between gap-4 mt-6">
        {/* Min input */}
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Minimum
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={localMin}
              onChange={handleMinInputChange}
              className="w-full h-12 pl-7 pr-3 rounded-xl border-2 border-border bg-background text-center font-medium focus:border-foreground focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="w-4 h-0.5 bg-border mt-6" />

        {/* Max input */}
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Maximum
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={localMax === max ? `${max}+` : localMax}
              onChange={handleMaxInputChange}
              className="w-full h-12 pl-7 pr-3 rounded-xl border-2 border-border bg-background text-center font-medium focus:border-foreground focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceRangeSlider;
