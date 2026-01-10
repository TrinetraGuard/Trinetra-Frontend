import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addDoc,
  collection,
} from "firebase/firestore";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { db } from "../../firebase/firebase";


const EventSectionAdmin = () => {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [organizer, setOrganizer] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [entryFeeType, setEntryFeeType] = useState<"free" | "paid">("free");
  const [entryFeeAmount, setEntryFeeAmount] = useState("");

  const handleAdd = async () => {
    // Validate all required fields
    const missingFields = [];
    
    if (!eventName || !eventName.trim()) missingFields.push("Event Name");
    if (!eventType || !eventType.trim()) missingFields.push("Event Type");
    if (!organizer || !organizer.trim()) missingFields.push("Organizer");
    if (!description || !description.trim()) missingFields.push("Description");
    if (!startDate || !startDate.trim()) missingFields.push("Start Date");
    if (!endDate || !endDate.trim()) missingFields.push("End Date");
    if (!startTime || !startTime.trim()) missingFields.push("Start Time");
    if (!endTime || !endTime.trim()) missingFields.push("End Time");
    if (!imageUrl || !imageUrl.trim()) missingFields.push("Image URL");
    
    // Validate latitude
    if (!latitude || !latitude.trim()) {
      missingFields.push("Latitude");
    } else if (isNaN(parseFloat(latitude))) {
      missingFields.push("Latitude (must be a valid number)");
    }
    
    // Validate longitude
    if (!longitude || !longitude.trim()) {
      missingFields.push("Longitude");
    } else if (isNaN(parseFloat(longitude))) {
      missingFields.push("Longitude (must be a valid number)");
    }
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n\n${missingFields.join("\n")}`);
      return;
    }

    if (entryFeeType === "paid" && (!entryFeeAmount || !entryFeeAmount.trim())) {
      alert("Please enter the entry fee amount");
      return;
    }

    try {
      const eventData = {
        eventName: eventName.trim(),
        eventType: eventType.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        description: description.trim(),
        isRecurring,
        organizer: organizer.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl: imageUrl.trim(),
        entryFeeType,
        entryFeeAmount: entryFeeType === "free" ? "Free" : entryFeeAmount.trim(),
      };

      await addDoc(collection(db, "events"), eventData);
      
      alert("Event added successfully!");
      
      // Reset form
      setEventName("");
      setEventType("");
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setIsRecurring(false);
      setOrganizer("");
      setLatitude("");
      setLongitude("");
      setImageUrl("");
      setEntryFeeType("free");
      setEntryFeeAmount("");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Add New Event</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="eventName">
            Event Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="eventName"
            placeholder="e.g., Mahashivratri Celebration"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        {/* Event Type */}
        <div className="space-y-2">
          <Label htmlFor="eventType">
            Event Type <span className="text-red-500">*</span>
          </Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger 
              id="eventType"
              className="w-full h-10 bg-white border-2 border-gray-300 hover:border-black focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] border-2 border-black shadow-2xl bg-white">
              <SelectItem 
                value="Festival" 
                className="cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors"
              >
                Festival
              </SelectItem>
              <SelectItem 
                value="Religious" 
                className="cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors"
              >
                Religious
              </SelectItem>
              <SelectItem 
                value="Cultural" 
                className="cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors"
              >
                Cultural
              </SelectItem>
              <SelectItem 
                value="Educational" 
                className="cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors"
              >
                Educational
              </SelectItem>
              <SelectItem 
                value="Sports" 
                className="cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors"
              >
                Sports
              </SelectItem>
              <SelectItem 
                value="Concert" 
                className="cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors"
              >
                Concert
              </SelectItem>
              <SelectItem 
                value="Conference" 
                className="cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors"
              >
                Conference
              </SelectItem>
              <SelectItem 
                value="Other" 
                className="cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors"
              >
                Other
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Organizer */}
        <div className="space-y-2">
          <Label htmlFor="organizer">
            Organizer <span className="text-red-500">*</span>
          </Label>
          <Input
            id="organizer"
            placeholder="e.g., Temple Trust"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
          />
        </div>

        {/* Event Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">
              Latitude <span className="text-red-500">*</span>
            </Label>
        <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="e.g., 19.9975"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Exact latitude of event location
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">
              Longitude <span className="text-red-500">*</span>
            </Label>
        <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="e.g., 73.7898"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Exact longitude of event location
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="e.g., Night-long prayers and Abhishek rituals."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Date & Time Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">
              End Date <span className="text-red-500">*</span>
            </Label>
            <input
              id="endDate"
          type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">
              Start Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">
              End Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Entry Type */}
        <div className="space-y-2">
          <Label>Entry Type</Label>
          <p className="text-xs text-gray-500 mb-2">
            Select if the entry is Free, Paid, or Both
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={entryFeeType === "free" ? "default" : "outline"}
              className={
                entryFeeType === "free"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : ""
              }
              onClick={() => {
                setEntryFeeType("free");
                setEntryFeeAmount("");
              }}
            >
              Free
            </Button>
            <Button
              type="button"
              size="sm"
              variant={entryFeeType === "paid" ? "default" : "outline"}
              className={
                entryFeeType === "paid"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : ""
              }
              onClick={() => setEntryFeeType("paid")}
            >
              Paid
            </Button>
          </div>
        </div>

        {/* Entry Fee Amount */}
        {entryFeeType === "paid" && (
          <div className="space-y-2">
            <Label htmlFor="entryFeeAmount">Entry Fee (INR)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <Input
                id="entryFeeAmount"
                type="number"
                placeholder="Enter entry fee in Indian Rupees"
                value={entryFeeAmount}
                onChange={(e) => setEntryFeeAmount(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500">
              Leave empty if fee varies or not applicable
            </p>
          </div>
        )}

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">
            Image URL <span className="text-red-500">*</span>
          </Label>
        <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        {/* Recurring Event */}
        <div className="space-y-2">
          <Label>Recurring Event</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
              className="data-[state=checked]:bg-black [&>span]:border-2 [&>span]:border-black"
            />
            <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer">
              Enable if this event repeats periodically
            </Label>
          </div>
        </div>

        {/* Submit Button */}
        <Button onClick={handleAdd} className="w-full">
          Add Event
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventSectionAdmin;

