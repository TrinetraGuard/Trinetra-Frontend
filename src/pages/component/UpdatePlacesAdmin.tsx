import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { Edit, MapPin, Trash2 } from "lucide-react";
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
  entryType: string[];
  entryFee: string;
  openingHours: string;
  transportModes: TransportMode[];
  facilities: Facility[];
};

const UpdatePlacesAdmin = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
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
  const [entryType, setEntryType] = useState<string[]>([]);
  const [entryFee, setEntryFee] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchPlace, setSearchPlace] = useState<string>("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "places"), (snapshot) => {
      setPlaces(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Place[]);
    });
    return () => unsub();
  }, []);

  const filteredPlaces = places.filter((place) => {
    if (!searchPlace.trim()) return true;
    const term = searchPlace.toLowerCase();
    return (
      place.name.toLowerCase().includes(term) ||
      place.description.toLowerCase().includes(term) ||
      place.categories.some((cat) => cat.toLowerCase().includes(term))
    );
  });

  const loadPlaceForEdit = (place: Place) => {
    setSelectedPlace(place);
    setIsEditing(true);
    setName(place.name || "");
    setCategories(place.categories || []);
    setLatitude(place.latitude?.toString() || "");
    setLongitude(place.longitude?.toString() || "");
    setUrls(place.urls || []);
    setDescription(place.description || "");
    setVisitTime(place.visitTime || "");
    setCrowd(place.crowd || "Low");
    setBestSeason(place.bestSeason || "");
    setEntryType(place.entryType || []);
    setEntryFee(place.entryFee || "");
    setOpeningHours(place.openingHours || "");
    setTransportModes(place.transportModes || []);
    setFacilities(place.facilities || []);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedPlace(null);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setCategories([]);
    setLatitude("");
    setLongitude("");
    setUrls([]);
    setUrlInput("");
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
      setTransportModes(transportModes.filter((t) => t.mode !== mode));
    } else {
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
      setFacilities(facilities.filter((f) => f.name !== facilityName));
    } else {
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

  const handleUpdatePlace = async () => {
    if (!selectedPlace) return;
    
    if (!name || !latitude || !longitude || !description) {
      alert("Please fill all required fields (Name, Latitude, Longitude, Description)");
      return;
    }
    if (categories.length === 0) {
      alert("Please select at least one category");
      return;
    }

    setIsSubmitting(true);
    try {
      const placeRef = doc(db, "places", selectedPlace.id);
      await updateDoc(placeRef, {
        name,
        categories,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        urls,
        description,
        visitTime,
        crowd,
        bestSeason,
        entryType,
        entryFee,
        openingHours,
        transportModes,
        facilities,
        updatedAt: new Date(),
      });

      alert("Place updated successfully!");
      cancelEdit();
    } catch (error) {
      console.error("Error updating place:", error);
      alert("Failed to update place. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this place?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "places", id));
      if (selectedPlace?.id === id) {
        cancelEdit();
      }
      alert("Place deleted successfully!");
    } catch (error) {
      console.error("Error deleting place:", error);
      alert("Failed to delete place. Please try again.");
    }
  };

  const getCrowdColor = (crowd: string) => {
    switch (crowd?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit Form - Only show when editing */}
      {isEditing && selectedPlace && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Update Place: {selectedPlace.name}</CardTitle>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
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
                <Label htmlFor="entry-fee">Entry Fee (INR)</Label>
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

            {/* Update Button */}
            <div className="flex gap-2">
              <Button onClick={handleUpdatePlace} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Place"}
              </Button>
              <Button variant="outline" onClick={cancelEdit} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Places Section */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">All Places</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {isEditing
                  ? "Currently editing a place. Click 'Cancel' to stop editing."
                  : `${filteredPlaces.length} place${filteredPlaces.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={searchPlace}
              onChange={(e) => setSearchPlace(e.target.value)}
              placeholder="Search places by name, category, or description..."
              className="h-10 w-80"
            />
          </div>
        </CardHeader>
        <CardContent>
          {places.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No places found</p>
              <p className="text-sm text-gray-400 mt-2">Add a new place to get started</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-medium">No places match your search</p>
              <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Place Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Visit Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Entry & Fees
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Transport & Facilities
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlaces.map((place) => (
                    <tr
                      key={place.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedPlace?.id === place.id && isEditing ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Place Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {place.urls && place.urls.length > 0 && (
                            <img
                              src={place.urls[0]}
                              alt={place.name}
                              className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-base mb-1">{place.name}</h4>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {place.categories?.slice(0, 3).map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"
                                >
                                  {cat}
                                </span>
                              ))}
                              {place.categories && place.categories.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                  +{place.categories.length - 3}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{place.description || "No description available"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5 text-xs min-w-[100px]">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-900 font-mono">{place.latitude?.toFixed(4) || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-900 font-mono">{place.longitude?.toFixed(4) || "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Visit Info */}
                      <td className="px-4 py-4">
                        <div className="space-y-1.5 min-w-[140px]">
                          {place.visitTime && (
                            <div>
                              <p className="text-xs font-medium text-gray-500">Visit Time</p>
                              <p className="text-sm font-semibold text-gray-900">{place.visitTime}</p>
                            </div>
                          )}
                          {place.crowd && (
                            <div className={place.visitTime ? "pt-1 border-t border-gray-200" : ""}>
                              <p className="text-xs font-medium text-gray-500">Crowd</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getCrowdColor(place.crowd)}`}>
                                {place.crowd}
                              </span>
                            </div>
                          )}
                          {place.bestSeason && (
                            <div className={(place.visitTime || place.crowd) ? "pt-1 border-t border-gray-200" : ""}>
                              <p className="text-xs font-medium text-gray-500">Best Season</p>
                              <p className="text-sm font-semibold text-gray-900">{place.bestSeason}</p>
                            </div>
                          )}
                          {place.openingHours && (
                            <div className={(place.visitTime || place.crowd || place.bestSeason) ? "pt-1 border-t border-gray-200" : ""}>
                              <p className="text-xs font-medium text-gray-500">Hours</p>
                              <p className="text-sm text-gray-900">{place.openingHours}</p>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Entry & Fees */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 min-w-[120px]">
                          {place.entryType && place.entryType.length > 0 ? (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                place.entryType.includes("Free")
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {place.entryType.includes("Free") ? "Free" : "Paid"}
                              {place.entryFee && place.entryType.includes("Paid") && ` - ₹${place.entryFee}`}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </div>
                      </td>

                      {/* Transport & Facilities */}
                      <td className="px-4 py-4">
                        <div className="space-y-2 min-w-[150px]">
                          {place.transportModes && place.transportModes.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Transport</p>
                              <div className="space-y-0.5">
                                {place.transportModes.slice(0, 2).map((t, idx) => {
                                  const hasPrice = t.minPrice || t.maxPrice;
                                  return (
                                    <p key={idx} className="text-xs text-gray-900">
                                      {t.mode}
                                      {hasPrice && (
                                        <span className="text-gray-600"> (₹{t.minPrice || "0"}-{t.maxPrice || "0"})</span>
                                      )}
                                    </p>
                                  );
                                })}
                                {place.transportModes.length > 2 && (
                                  <p className="text-xs text-gray-500">+{place.transportModes.length - 2} more</p>
                                )}
                              </div>
                            </div>
                          )}
                          {place.facilities && place.facilities.length > 0 && (
                            <div className={place.transportModes && place.transportModes.length > 0 ? "pt-1 border-t border-gray-200" : ""}>
                              <p className="text-xs font-medium text-gray-500 mb-1">Facilities</p>
                              <p className="text-xs text-blue-600 font-medium">
                                {place.facilities.length} facilit{place.facilities.length === 1 ? "y" : "ies"}
                              </p>
                            </div>
                          )}
                          {(!place.transportModes || place.transportModes.length === 0) &&
                            (!place.facilities || place.facilities.length === 0) && (
                              <span className="text-sm text-gray-500">—</span>
                            )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => loadPlaceForEdit(place)}
                            size="sm"
                            className="bg-black text-white hover:bg-gray-800"
                            disabled={isEditing && selectedPlace?.id !== place.id}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {selectedPlace?.id === place.id && isEditing ? "Editing..." : "Edit"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(place.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePlacesAdmin;

