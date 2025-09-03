import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "../../firebase/firebase";

const FeatureSectionAdmin = () => {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([""]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "feature", "highlight");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || "");
        setImages(data.images || [""]);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const handleAddImage = () => {
    setImages([...images, ""]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated.length ? updated : [""]);
  };

  const handleSave = async () => {
    await setDoc(doc(db, "feature", "highlight"), {
      title,
      images,
    });
    alert("✅ Feature updated successfully!");
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Feature Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title Input */}
        <Input
          placeholder="Feature Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Image Inputs */}
        <div className="space-y-2">
          {images.map((img, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`Image URL ${index + 1}`}
                value={img}
                onChange={(e) => handleImageChange(index, e.target.value)}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveImage(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddImage}
          >
            + Add Another Image
          </Button>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          Save Feature
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureSectionAdmin;
