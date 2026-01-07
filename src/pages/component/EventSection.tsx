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
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { db } from "../../firebase/firebase";

interface EventData {
  id?: string;
  eventName: string;
  eventType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
  isRecurring: boolean;
  organizer: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  entryFeeType: "free" | "paid";
  entryFeeAmount: string;
}

const EventSectionAdmin = () => {
  const [events, setEvents] = useState<EventData[]>([]);
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

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EventData)));
    });
    return () => unsub();
  }, []);

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
      const eventData: Omit<EventData, 'id'> = {
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
    await deleteDoc(doc(db, "events", id));
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

        {/* EXISTING EVENTS SECTION */}
        <div className="mt-8 space-y-4 border-t-2 border-gray-200 pt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Existing Events</h3>
          
          {events.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">No events added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((ev) => (
            <div
              key={ev.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Event Header */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h4 className="font-bold text-xl text-gray-900">{ev.eventName}</h4>
                          <span className="px-3 py-1 text-xs font-semibold bg-black text-white rounded-full">
                            {ev.eventType}
                          </span>
                          {ev.isRecurring && (
                            <span className="px-3 py-1 text-xs font-semibold bg-gray-800 text-white rounded-full">
                              Recurring
                            </span>
                          )}
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{ev.description}</p>
                        
                        {/* Event Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">Start Date</p>
                            <p className="text-sm font-medium text-gray-900">{ev.startDate}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">End Date</p>
                            <p className="text-sm font-medium text-gray-900">{ev.endDate}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">Start Time</p>
                            <p className="text-sm font-medium text-gray-900">{ev.startTime}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">End Time</p>
                            <p className="text-sm font-medium text-gray-900">{ev.endTime}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">Organizer</p>
                            <p className="text-sm font-medium text-gray-900">{ev.organizer}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">Entry Fee</p>
                            <p className="text-sm font-bold text-gray-900">{ev.entryFeeAmount}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">Latitude</p>
                            <p className="text-sm font-medium text-gray-900">{ev.latitude}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">Longitude</p>
                            <p className="text-sm font-medium text-gray-900">{ev.longitude}</p>
                          </div>
                        </div>
                        
                        {/* Event Image */}
                        {ev.imageUrl && (
                          <img 
                            src={ev.imageUrl} 
                            alt={ev.eventName}
                            className="w-full h-48 object-cover rounded-md border-2 border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
              </div>
                      
                      {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                        onClick={() => handleDelete(ev.id!)}
                        className="flex-shrink-0"
              >
                Delete
              </Button>
            </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventSectionAdmin;

