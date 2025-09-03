import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const PlacesAdmin = () => {
  const [places, setPlaces] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Temple");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [description, setDescription] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [crowd, setCrowd] = useState("Low");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "places"), (snapshot) => {
      setPlaces(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  const handleAddPlace = async () => {
    if (!name || !latitude || !longitude || !description) {
      alert("Please fill all required fields");
      return;
    }

    await addDoc(collection(db, "places"), {
      name,
      category,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      urls,
      description,
      visitTime,
      crowd,
    });

    // Reset form
    setName("");
    setCategory("Temple");
    setLatitude("");
    setLongitude("");
    setUrls([]);
    setDescription("");
    setVisitTime("");
    setCrowd("Low");
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
          <Input
            placeholder="Name of Place"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Temple">Temple</SelectItem>
              <SelectItem value="Yagyashala">Yagyashala</SelectItem>
              <SelectItem value="Ghat">Ghat</SelectItem>
              <SelectItem value="Meditation">Meditation</SelectItem>
            </SelectContent>
          </Select>

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

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            placeholder="Right Time to Visit"
            value={visitTime}
            onChange={(e) => setVisitTime(e.target.value)}
          />

          <Select onValueChange={setCrowd} value={crowd}>
            <SelectTrigger>
              <SelectValue placeholder="Current Crowd" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

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
                  <p className="text-sm text-gray-500">{place.category}</p>
                  <p className="text-xs text-gray-400">
                    Crowd: {place.crowd}
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
