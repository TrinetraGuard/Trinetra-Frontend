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
import { CheckCircle2, Filter, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { admin } from "@/lib/adminTheme";
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
  const [placeSearch, setPlaceSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "places"), (snapshot) => {
      setPlaces(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Place[]);
    });
    return () => unsub();
  }, []);

  const displayedPlaces = useMemo(() => {
    let list = showOnlyComplete
      ? places.filter((p) => getPlaceCompleteness(p).isComplete)
      : places;
    const q = placeSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, ...(p.categories ?? [])].join(" ").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [places, showOnlyComplete, placeSearch]);

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
    <div className={admin.page}>
      <div className="flex items-center gap-3">
        <div className={admin.iconWrapSolid}>
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <h1 className={admin.title}>All Places</h1>
          <p className={admin.subtitle}>
            Add new places and manage the full places directory for the app
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className={admin.card}>
        <CardHeader className={admin.cardHeader}>
          <CardTitle>Add New Place</CardTitle>
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
                    className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1.5 border"
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
                    onClick={() => toggleTransportMode(mode)}
                  >
                    {mode}
                  </Button>
                ))}
              </div>

              {/* Transport Pricing Inputs */}
              {transportModes.length > 0 && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
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
                    onClick={() => toggleFacility(facility)}
                  >
                    {facility}
                  </Button>
                ))}
              </div>

              {/* Facility Pricing Inputs */}
              {facilities.length > 0 && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
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
          <Button onClick={handleAddPlace} className={`w-full ${admin.cta}`}>
            Save Place
          </Button>
        </CardContent>
      </Card>

      <Card className={admin.card}>
        <CardHeader className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${admin.cardHeader}`}>
          <CardTitle>Places directory ({displayedPlaces.length})</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                placeholder="Search by name or category…"
                className={`h-10 pl-9 ${admin.input}`}
              />
            </div>
            <Button
              type="button"
              variant={showOnlyComplete ? "default" : "outline"}
              size="sm"
              className={showOnlyComplete ? admin.cta : ""}
              onClick={() => setShowOnlyComplete(!showOnlyComplete)}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              {showOnlyComplete ? "100% complete only" : "Show all"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            {showOnlyComplete
              ? `${displayedPlaces.length} place(s) with information filled 100%.`
              : `${places.length} total · ${places.filter((p) => getPlaceCompleteness(p).isComplete).length} with 100% info`}
            {placeSearch.trim() ? ` · filtered by “${placeSearch.trim()}”` : ""}
          </p>
          {displayedPlaces.length === 0 ? (
            <div className={`py-12 text-center ${admin.empty}`}>
              No places match your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[72px]">Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Categories</TableHead>
                  <TableHead className="hidden lg:table-cell">Crowd / Season</TableHead>
                  <TableHead className="hidden xl:table-cell">Entry</TableHead>
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPlaces.map((place) => {
                  const { percent, isComplete } = getPlaceCompleteness(place);
                  return (
                    <TableRow key={place.id}>
                      <TableCell>
                        {isComplete ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white"
                            title="Information filled 100%"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            100%
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                            title="Information completeness"
                          >
                            {percent}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{place.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600">
                        {place.categories?.join(", ") || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                        {place.crowd || "—"} · {place.bestSeason || "—"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-gray-500">
                        {place.entryType?.length ? place.entryType.join(", ") : "—"}
                        {place.entryFee ? ` · ₹${place.entryFee}` : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-100"
                          onClick={() => handleDelete(place.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacesAdmin;
