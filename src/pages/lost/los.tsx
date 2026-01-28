import { useEffect, useState } from "react";

type LostPerson = {
  name: string;
  image_path?: string;
  aadhar_number: string;
  contact_number: string;
  place_lost: string;
  permanent_address: string;
  upload_timestamp: string;
};

type LostPersonsResponse = {
  success: boolean;
  data: {
    lost_persons: LostPerson[];
  };
};

const Lostperson = () => {
  const [lostPersons, setLostPersons] = useState<LostPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLostPersons = async () => {
      try {
        const response = await fetch(
          "https://trinetraguard-backend-local.onrender.com/api/v1/lost-persons/"
        );
        const result: LostPersonsResponse = await response.json();

        if (result.success && result.data.lost_persons.length > 0) {
          setLostPersons(result.data.lost_persons);
        } else {
          setError("No lost person reports found.");
        }
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLostPersons();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading lost persons...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className=" min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Lost Person Reports
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lostPersons.map((person, index) => {
          const filename = person.image_path?.split("/").pop();
          const imageUrl = `https://trinetraguard-backend-local.onrender.com/api/v1/images/${filename}`;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden"
            >
              <div className="w-full h-64 bg-gray-50 flex items-center justify-center overflow-hidden">
                <img
                  src={imageUrl}
                  alt={person.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {person.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Aadhar:</strong> {person.aadhar_number}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Contact:</strong> {person.contact_number}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Place Lost:</strong> {person.place_lost}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Address:</strong> {person.permanent_address}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Uploaded:{" "}
                  {new Date(person.upload_timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Lostperson;
