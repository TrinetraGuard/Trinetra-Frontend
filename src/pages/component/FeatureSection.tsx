import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "../../firebase/firebase";
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  X
} from "lucide-react";

interface ImageItem {
  url: string;
  id: string;
}

const FeatureSectionAdmin = () => {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "feature", "highlight");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          const imageUrls = data.images || [];
          // Convert string array to ImageItem array
          setImages(
            imageUrls
              .filter((url: string) => url.trim() !== "")
              .map((url: string, index: number) => ({
                url,
                id: `img-${Date.now()}-${index}`,
              }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes("http");
    } catch {
      return false;
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      return;
    }

    if (!validateImageUrl(newImageUrl)) {
      setImageErrors({ ...imageErrors, new: true });
      return;
    }

    const newImage: ImageItem = {
      url: newImageUrl.trim(),
      id: `img-${Date.now()}-${Math.random()}`,
    };

    setImages([...images, newImage]);
    setNewImageUrl("");
    setImageErrors({ ...imageErrors, new: false });
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
    const newErrors = { ...imageErrors };
    delete newErrors[id];
    setImageErrors(newErrors);
  };

  const handleImageUrlChange = (id: string, value: string) => {
    setImages(
      images.map((img) => (img.id === id ? { ...img, url: value } : img))
    );
    
    // Validate on change
    if (value.trim() && !validateImageUrl(value)) {
      setImageErrors({ ...imageErrors, [id]: true });
    } else {
      const newErrors = { ...imageErrors };
      delete newErrors[id];
      setImageErrors(newErrors);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a feature title");
      return;
    }

    // Filter out empty images
    const validImages = images
      .filter((img) => img.url.trim() !== "")
      .map((img) => img.url);

    if (validImages.length === 0) {
      alert("Please add at least one image");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await setDoc(
        doc(db, "feature", "highlight"),
        {
          title: title.trim(),
          images: validImages,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("❌ Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const openPreview = (url: string) => {
    setPreviewImage(url);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card className="w-full shadow-lg border-gray-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-orange-600" />
                Feature Section Management
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600">
                Manage the feature section that appears on the mobile app home screen
              </CardDescription>
            </div>
            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Saved successfully!</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Title Section */}
          <div className="space-y-2">
            <Label htmlFor="feature-title" className="text-base font-semibold text-gray-700">
              Feature Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="feature-title"
              placeholder="e.g., Explore Sacred Places"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
            <p className="text-sm text-gray-500">
              This title will be displayed above the feature images in the mobile app
            </p>
          </div>

          {/* Add New Image Section */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-600" />
              Add New Image
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  value={newImageUrl}
                  onChange={(e) => {
                    setNewImageUrl(e.target.value);
                    if (imageErrors.new) {
                      setImageErrors({ ...imageErrors, new: false });
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddImage();
                    }
                  }}
                  className={`h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                    imageErrors.new ? "border-red-500" : ""
                  }`}
                />
                {imageErrors.new && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Please enter a valid image URL
                  </p>
                )}
              </div>
              <Button
                onClick={handleAddImage}
                className="h-12 px-6 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: JPG, PNG, GIF, WebP, SVG
            </p>
          </div>

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-700">
                Feature Images ({images.length})
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <Card
                    key={image.id}
                    className="overflow-hidden border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-video bg-gray-100">
                      {image.url ? (
                        <>
                          <img
                            src={image.url}
                            alt={`Feature ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImageErrors({ ...imageErrors, [image.id]: true });
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPreview(image.url)}
                              className="opacity-0 hover:opacity-100 text-white bg-white/20 hover:bg-white/30"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      {imageErrors[image.id] && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Invalid
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Image URL"
                          value={image.url}
                          onChange={(e) => handleImageUrlChange(image.id, e.target.value)}
                          className={`text-sm h-9 ${
                            imageErrors[image.id] ? "border-red-500" : ""
                          }`}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveImage(image.id)}
                          className="h-9 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Image {index + 1}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">No images added yet</p>
              <p className="text-sm text-gray-400">
                Add your first image using the form above
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim() || images.length === 0}
              className="min-w-[150px] h-12 bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
            >
              <X className="w-5 h-5" />
            </Button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureSectionAdmin;
