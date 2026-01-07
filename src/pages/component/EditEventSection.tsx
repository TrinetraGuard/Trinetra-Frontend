import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
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

const EditEventSection = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
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

  const handleSelectEvent = (event: EventData) => {
    setSelectedEvent(event);
    setIsEditing(true);
    
    // Populate form fields
    setEventName(event.eventName);
    setEventType(event.eventType);
    setStartDate(event.startDate);
    setEndDate(event.endDate);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setIsRecurring(event.isRecurring);
    setOrganizer(event.organizer);
    setLatitude(event.latitude.toString());
    setLongitude(event.longitude.toString());
    setImageUrl(event.imageUrl);
    setEntryFeeType(event.entryFeeType);
    setEntryFeeAmount(event.entryFeeAmount === "Free" ? "" : event.entryFeeAmount);
  };

  const handleUpdate = async () => {
    if (!selectedEvent || !selectedEvent.id) return;
    
    if (!eventName || !eventType || !startDate || !endDate || !startTime || !endTime || !description || !organizer || !latitude || !longitude || !imageUrl) {
      alert("Please fill in all required fields");
      return;
    }

    if (entryFeeType === "paid" && !entryFeeAmount) {
      alert("Please enter the entry fee amount");
      return;
    }

    try {
      await updateDoc(doc(db, "events", selectedEvent.id), {
        eventName,
        eventType,
        startDate,
        endDate,
        startTime,
        endTime,
        description,
        isRecurring,
        organizer,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl,
        entryFeeType,
        entryFeeAmount: entryFeeType === "free" ? "Free" : entryFeeAmount,
      });

      alert("Event updated successfully!");
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "events", id));
      if (selectedEvent?.id === id) {
        handleCancelEdit();
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedEvent(null);
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
  };

  return (
    <div className="space-y-6">
      {/* Edit Form */}
      {isEditing ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleUpdate} className="flex-1">
                Update Event
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Events List */
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold">Events Management</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Select an event to edit or delete</p>
          </CardHeader>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No events available</p>
                <p className="text-sm text-gray-400 mt-1">Add an event to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Event Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Organizer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Entry Fee
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events
                      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .map((ev) => (
                        <tr 
                          key={ev.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Event Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              {ev.imageUrl && (
                                <img 
                                  src={ev.imageUrl} 
                                  alt={ev.eventName}
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 flex-shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="min-w-0">
                                <h4 className="font-bold text-gray-900 text-base mb-1">{ev.eventName}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black text-white">
                                    {ev.eventType}
                                  </span>
                                  {ev.isRecurring && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-white">
                                      Recurring
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{ev.description}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Date & Time */}
                          <td className="px-4 py-4">
                            <div className="space-y-1.5 min-w-[120px]">
                              <div>
                                <p className="text-xs font-medium text-gray-500">Start</p>
                                <p className="text-sm font-semibold text-gray-900">{ev.startDate}</p>
                                <p className="text-xs text-gray-600">{ev.startTime}</p>
                              </div>
                              <div className="pt-1 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-500">End</p>
                                <p className="text-sm font-semibold text-gray-900">{ev.endDate}</p>
                                <p className="text-xs text-gray-600">{ev.endTime}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Location */}
                          <td className="px-4 py-4">
                            <div className="space-y-0.5 text-xs min-w-[100px]">
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-900 font-mono">{ev.latitude.toFixed(4)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-900 font-mono">{ev.longitude.toFixed(4)}</span>
                              </div>
                            </div>
                          </td>
                          
                          {/* Organizer */}
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{ev.organizer}</p>
                          </td>
                          
                          {/* Entry Fee */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              ev.entryFeeAmount === "Free" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {ev.entryFeeAmount === "Free" ? "Free" : `₹${ev.entryFeeAmount}`}
                            </span>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                onClick={() => handleSelectEvent(ev)}
                                size="sm"
                                className="bg-black text-white hover:bg-gray-800"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(ev.id!)}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EditEventSection;

