import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "../../firebase/firebase";

// All available categories
const ALL_CATEGORIES = [
  "Temple",
  "Yagyashala",
  "Ghat",
  "Meditation",
  "Spiritual",
  "Aarti",
  "Discover Nashik",
  "Pilgrimage",
  "Cultural",
  "Nature",
];

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
  entryFee: string;
  openingHours: string;
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
  const [entryFee, setEntryFee] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "places"), (snapshot) => {
      setPlaces(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Place[]);
    });
    return () => unsub();
  }, []);

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

  const handleAddPlace = async () => {
    if (!name || !latitude || !longitude || !description) {
      alert("Please fill all required fields");
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
      entryFee,
      openingHours,
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
    setEntryFee("");
    setOpeningHours("");
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
          <Input
            placeholder="Name of Place"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Multiple Category Selection */}
          <div>
            <p className="text-sm font-medium mb-2">Categories</p>
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
            <Input
              placeholder="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
            <Input
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>

          {/* Images */}
          <div>
            <div className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <Button onClick={handleAddUrl}>Add</Button>
            </div>
            <div className="flex flex-wrap mt-2 gap-2">
              {urls.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-200 rounded px-2 py-1"
                >
                  <span className="text-xs">{u.slice(0, 25)}...</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveUrl(i)}
                  >
                    x
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Visit Time */}
          <Input
            placeholder="Right Time to Visit (e.g. Morning, Evening)"
            value={visitTime}
            onChange={(e) => setVisitTime(e.target.value)}
          />

          {/* Crowd */}
          <div>
            <p className="text-sm font-medium mb-2">Crowd Level</p>
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

          {/* Additional fields */}
          <Input
            placeholder="Best Season (e.g. Winter, Monsoon)"
            value={bestSeason}
            onChange={(e) => setBestSeason(e.target.value)}
          />
          <Input
            placeholder="Entry Fee (if any)"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
          />
          <Input
            placeholder="Opening Hours (e.g. 6 AM - 8 PM)"
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
          />

          {/* Save */}
          <Button onClick={handleAddPlace} className="w-full">
            Save Place
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Places</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="p-3 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{place.name}</p>
                  <p className="text-sm text-gray-500">
                    {place.categories?.join(", ")}
                  </p>
                  <p className="text-xs text-gray-400">
                    Crowd: {place.crowd} | Season: {place.bestSeason}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(place.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacesAdmin;
