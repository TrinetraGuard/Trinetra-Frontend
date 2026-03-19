import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPlaceCompleteness } from "@/lib/placeCompleteness";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { CheckCircle2, Filter } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "../../firebase/firebase";

// All available categories
const ALL_CATEGORIES = [
  "Spiritual",
  "Aarti",
  "Discover Nashik",
  "Pilgrimage",
  "Ghats",
  "Cultural",
  "Nature",
  "Other",
];

// Transport modes
const TRANSPORT_MODES = ["Bus", "Cabs", "Rental Cars"];

// Facilities options
const FACILITIES_OPTIONS = [
  "Accommodation - Budget & mid-range hotels nearby",
  "Food & Dining - Food courts & local eateries",
  "Parking - Available at base area",
];

type TransportMode = {
  mode: string;
  minPrice: string;
  maxPrice: string;
};

type Facility = {
  name: string;
  minPrice: string;
  maxPrice: string;
  estimatedPrice: string;
};

type Place = {
  id: string;
  name: string;
  categories: string[];
  latitude: number;
  longitude: number;
  urls: string[];
  description: string;
  visitTime: string;
  crowd: string;
  bestSeason: string;
  entryType: string[]; // ["Free"], ["Paid"], or ["Free", "Paid"]
  entryFee: string;
  openingHours: string;
  transportModes: TransportMode[]; // Array of transport modes with pricing
  facilities: Facility[]; // Available facilities nearby with pricing
};

const PlacesAdmin = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [description, setDescription] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [crowd, setCrowd] = useState("Low");
  const [bestSeason, setBestSeason] = useState("");
  const [entryType, setEntryType] = useState<string[]>([]); // ["Free"], ["Paid"], or both
  const [entryFee, setEntryFee] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [showOnlyComplete, setShowOnlyComplete] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "places"), (snapshot) => {
      setPlaces(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Place[]);
    });
    return () => unsub();
  }, []);

  const displayedPlaces = showOnlyComplete
    ? places.filter((p) => getPlaceCompleteness(p).isComplete)
    : places;

  const handleAddUrl = () => {
    if (urlInput.trim() !== "") {
      setUrls([...urls, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const toggleEntryType = (type: string) => {
    if (entryType.includes(type)) {
      setEntryType(entryType.filter((t) => t !== type));
      // Clear entry fee if "Paid" is unchecked
      if (type === "Paid") {
        setEntryFee("");
      }
    } else {
      setEntryType([...entryType, type]);
    }
  };

  const toggleTransportMode = (mode: string) => {
    const existing = transportModes.find((t) => t.mode === mode);
    if (existing) {
      // Remove if already exists
      setTransportModes(transportModes.filter((t) => t.mode !== mode));
    } else {
      // Add new transport mode with empty prices
      setTransportModes([...transportModes, { mode, minPrice: "", maxPrice: "" }]);
    }
  };

  const updateTransportPrice = (mode: string, field: "minPrice" | "maxPrice", value: string) => {
    setTransportModes(
      transportModes.map((t) => (t.mode === mode ? { ...t, [field]: value } : t))
    );
  };

  const toggleFacility = (facilityName: string) => {
    const existing = facilities.find((f) => f.name === facilityName);
    if (existing) {
      // Remove if already exists
      setFacilities(facilities.filter((f) => f.name !== facilityName));
    } else {
      // Add new facility with empty prices
      setFacilities([
        ...facilities,
        { name: facilityName, minPrice: "", maxPrice: "", estimatedPrice: "" },
      ]);
    }
  };

  const updateFacilityPrice = (
    facilityName: string,
    field: "minPrice" | "maxPrice" | "estimatedPrice",
    value: string
  ) => {
    setFacilities(
      facilities.map((f) => (f.name === facilityName ? { ...f, [field]: value } : f))
    );
  };

  const handleAddPlace = async () => {
    if (!name || !latitude || !longitude || !description) {
      alert("Please fill all required fields (Name, Latitude, Longitude, Description)");
      return;
    }
    if (categories.length === 0) {
      alert("Please select at least one category");
      return;
    }

    await addDoc(collection(db, "places"), {
      name,
      categories, // ✅ store array
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      urls,
      description,
      visitTime,
      crowd,
      bestSeason,
      entryType, // ✅ store array: ["Free"], ["Paid"], or ["Free", "Paid"]
      entryFee,
      openingHours,
      transportModes, // ✅ store array of transport modes with pricing
      facilities, // ✅ store array of facilities
      createdAt: new Date(),
    });

    // Reset form
    setName("");
    setCategories([]);
    setLatitude("");
    setLongitude("");
    setUrls([]);
    setDescription("");
    setVisitTime("");
    setCrowd("Low");
    setBestSeason("");
    setEntryType([]);
    setEntryFee("");
    setOpeningHours("");
    setTransportModes([]);
    setFacilities([]);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "places", id));
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add / Update Place</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name of Place <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter the name of the place"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Multiple Category Selection */}
          <div className="space-y-2">
            <Label>
              Categories <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Select one or more categories for this place
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  size="sm"
                  variant={categories.includes(cat) ? "default" : "outline"}
                  className={
                    categories.includes(cat)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : ""
                  }
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Lat & Lng */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">
                Latitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g. 19.9975"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">
                Longitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g. 73.7898"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URLs</Label>
            <p className="text-xs text-gray-500 mb-2">
              Add image URLs for this place (one at a time)
            </p>
            <div className="flex gap-2">
              <Input
                id="image-url"
                placeholder="Enter image URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
              />
              <Button type="button" onClick={handleAddUrl}>
                Add
              </Button>
            </div>
            {urls.length > 0 && (
              <div className="flex flex-wrap mt-2 gap-2">
                {urls.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-400 rounded px-3 py-1.5 border"
                  >
                    <span className="text-xs max-w-[200px] truncate">{u}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => handleRemoveUrl(i)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Enter a detailed description of the place"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Visit Time */}
          <div className="space-y-2">
            <Label htmlFor="visit-time">Right Time to Visit</Label>
            <Input
              id="visit-time"
              placeholder="e.g. Morning, Evening, or specific time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
            />
          </div>

          {/* Crowd */}
          <div className="space-y-2">
            <Label>Crowd Level</Label>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map((level) => (
                <Button
                  key={level}
                  type="button"
                  size="sm"
                  variant={crowd === level ? "default" : "outline"}
                  className={
                    crowd === level
                      ? "bg-primary text-primary-foreground shadow-md"
                      : ""
                  }
                  onClick={() => setCrowd(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Entry Type */}
          <div className="space-y-2">
            <Label>Entry Type</Label>
            <p className="text-xs text-gray-500 mb-2">
              Select if the entry is Free, Paid, or Both
            </p>
            <div className="flex gap-2">
              {["Free", "Paid"].map((type) => (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={entryType.includes(type) ? "default" : "outline"}
                  className={
                    entryType.includes(type)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : ""
                  }
                  onClick={() => toggleEntryType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Entry Fee */}
          {entryType.includes("Paid") && (
            <div className="space-y-2">
              <Label htmlFor="entry-fee">
                Entry Fee (INR)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <Input
                  id="entry-fee"
                  type="number"
                  placeholder="Enter entry fee in Indian Rupees"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-gray-500">
                Leave empty if fee varies or not applicable
              </p>
            </div>
          )}

          {/* Best Season */}
          <div className="space-y-2">
            <Label htmlFor="best-season">Best Season</Label>
            <Input
              id="best-season"
              placeholder="e.g. Winter, Monsoon, Summer"
              value={bestSeason}
              onChange={(e) => setBestSeason(e.target.value)}
            />
          </div>

          {/* Opening Hours */}
          <div className="space-y-2">
            <Label htmlFor="opening-hours">Opening Hours</Label>
            <Input
              id="opening-hours"
              placeholder="e.g. 6 AM - 8 PM"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
            />
          </div>

          {/* Mode of Transport */}
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label>Mode of Transport</Label>
              <p className="text-xs text-gray-500 mb-2">
                Select available transport modes and add predictive pricing range
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {TRANSPORT_MODES.map((mode) => (
                  <Button
                    key={mode}
                    type="button"
                    size="sm"
                    variant={
                      transportModes.some((t) => t.mode === mode) ? "default" : "outline"
                    }
                    className={
                      transportModes.some((t) => t.mode === mode)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : ""
                    }
                    onClick={() => toggleTransportMode(mode)}
                  >
                    {mode}
                  </Button>
                ))}
              </div>

              {/* Transport Pricing Inputs */}
              {transportModes.length > 0 && (
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-400 rounded-lg border">
                  <p className="text-sm font-medium">Pricing Range (INR)</p>
                  {transportModes.map((transport) => (
                    <div key={transport.mode} className="space-y-2">
                      <Label className="text-sm font-medium">{transport.mode}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`${transport.mode}-min`} className="text-xs">
                            Min Price (₹)
                          </Label>
                          <Input
                            id={`${transport.mode}-min`}
                            type="number"
                            placeholder="Min"
                            value={transport.minPrice}
                            onChange={(e) =>
                              updateTransportPrice(transport.mode, "minPrice", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`${transport.mode}-max`} className="text-xs">
                            Max Price (₹)
                          </Label>
                          <Input
                            id={`${transport.mode}-max`}
                            type="number"
                            placeholder="Max"
                            value={transport.maxPrice}
                            onChange={(e) =>
                              updateTransportPrice(transport.mode, "maxPrice", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Facilities Nearby */}
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label>Facilities Nearby</Label>
              <p className="text-xs text-gray-500 mb-2">
                Select available facilities and add pricing range (Min/Max) and estimated price
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {FACILITIES_OPTIONS.map((facility) => (
                  <Button
                    key={facility}
                    type="button"
                    size="sm"
                    variant={
                      facilities.some((f) => f.name === facility) ? "default" : "outline"
                    }
                    className={
                      facilities.some((f) => f.name === facility)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : ""
                    }
                    onClick={() => toggleFacility(facility)}
                  >
                    {facility}
                  </Button>
                ))}
              </div>

              {/* Facility Pricing Inputs */}
              {facilities.length > 0 && (
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-400 rounded-lg border">
                  <p className="text-sm font-medium">Pricing Range & Estimated Price (INR)</p>
                  {facilities.map((facility) => (
                    <div key={facility.name} className="space-y-2">
                      <Label className="text-sm font-medium">{facility.name}</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`${facility.name}-min`} className="text-xs">
                            Min Price (₹)
                          </Label>
                          <Input
                            id={`${facility.name}-min`}
                            type="number"
                            placeholder="Min"
                            value={facility.minPrice}
                            onChange={(e) =>
                              updateFacilityPrice(facility.name, "minPrice", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`${facility.name}-max`} className="text-xs">
                            Max Price (₹)
                          </Label>
                          <Input
                            id={`${facility.name}-max`}
                            type="number"
                            placeholder="Max"
                            value={facility.maxPrice}
                            onChange={(e) =>
                              updateFacilityPrice(facility.name, "maxPrice", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`${facility.name}-estimated`} className="text-xs">
                            Estimated (₹)
                          </Label>
                          <Input
                            id={`${facility.name}-estimated`}
                            type="number"
                            placeholder="Estimated"
                            value={facility.estimatedPrice}
                            onChange={(e) =>
                              updateFacilityPrice(facility.name, "estimatedPrice", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save */}
          <Button onClick={handleAddPlace} className="w-full">
            Save Place
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All Places</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={showOnlyComplete ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyComplete(!showOnlyComplete)}
              className={showOnlyComplete ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              {showOnlyComplete ? "Showing 100% complete only" : "Show 100% complete only"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {showOnlyComplete
              ? `${displayedPlaces.length} place(s) with information filled 100%.`
              : `${places.length} total · ${places.filter((p) => getPlaceCompleteness(p).isComplete).length} with 100% info`}
          </p>
          <div className="space-y-3">
            {displayedPlaces.map((place) => {
              const { percent, isComplete } = getPlaceCompleteness(place);
              return (
              <div
                key={place.id}
                className="p-3 border rounded-lg flex justify-between items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800" title="Information filled 100%">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        100%
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600" title="Information completeness">
                        {percent}%
                      </span>
                    )}
                  </div>
                  <div>
                  <p className="font-semibold">{place.name}</p>
                  <p className="text-sm text-gray-500">
                    {place.categories?.join(", ")}
                  </p>
                  <p className="text-xs text-gray-400">
                    Crowd: {place.crowd} | Season: {place.bestSeason}
                    {place.entryType && place.entryType.length > 0 && (
                      <> | Entry: {place.entryType.join(", ")}</>
                    )}
                    {place.entryFee && (
                      <> | Fee: ₹{place.entryFee} INR</>
                    )}
                  </p>
                  {place.transportModes && place.transportModes.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Transport:{" "}
                      {place.transportModes
                        .map((t) => {
                          const hasPrice = t.minPrice || t.maxPrice;
                          if (hasPrice) {
                            const min = t.minPrice || "0";
                            const max = t.maxPrice || "0";
                            return `${t.mode} (₹${min}-${max})`;
                          }
                          return t.mode;
                        })
                        .join(", ")}
                    </p>
                  )}
                  {place.facilities && place.facilities.length > 0 && (
                    <p className="text-xs text-blue-500 mt-1">
                      Facilities:{" "}
                      {place.facilities
                        .map((f) => {
                          const hasPrice = f.minPrice || f.maxPrice || f.estimatedPrice;
                          if (hasPrice) {
                            const parts: string[] = [f.name];
                            if (f.minPrice || f.maxPrice) {
                              const min = f.minPrice || "0";
                              const max = f.maxPrice || "0";
                              parts.push(`₹${min}-${max}`);
                            }
                            if (f.estimatedPrice) {
                              parts.push(`(Est: ₹${f.estimatedPrice})`);
                            }
                            return parts.join(" ");
                          }
                          return f.name;
                        })
                        .join(", ")}
                    </p>
                  )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(place.id)}
                >
                  Delete
                </Button>
              </div>
            );})}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacesAdmin;
