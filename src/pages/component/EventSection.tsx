import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { db } from "../../firebase/firebase";

const EventSectionAdmin = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!title || !date || !image) return;
    await addDoc(collection(db, "events"), { title, date, image });
    setTitle("");
    setDate("");
    setImage("");
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Events Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <Button onClick={handleAdd} className="w-full">
          Add Event
        </Button>

        <div className="mt-4 space-y-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{ev.title}</p>
                <p className="text-sm text-gray-500">{ev.date}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(ev.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventSectionAdmin;
