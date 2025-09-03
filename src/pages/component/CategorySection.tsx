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

const CategorySectionAdmin = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!name || !icon) return;
    await addDoc(collection(db, "categories"), { name, icon });
    setName("");
    setIcon("");
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Categories Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Icon URL"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
        <Button onClick={handleAdd} className="w-full">
          Add Category
        </Button>

        <div className="mt-4 space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{cat.name}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(cat.id)}
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

export default CategorySectionAdmin;
