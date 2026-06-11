import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, ChevronRight, Loader2 } from "lucide-react";
import axios from "../../api/axiosInstance";

export default function UpcomingRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await axios.get("/rides/user-rides");
        // Get upcoming rides (future datetime), limit to 3 for the home preview
        const now = new Date();
        const upcoming = (res.data.rides || [])
          .filter((r) => new Date(r.datetime) >= now)
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
          .slice(0, 3);
        setRides(upcoming);
      } catch (err) {
        console.error("Failed to fetch rides:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const formatRideDay = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatRideTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <section className="upcoming-rides">
      <div className="section-header">
        <h3 className="section-header__title">UPCOMING RIDES</h3>
        <button
          className="section-header__link"
          onClick={() => navigate("/my-rides")}
        >
          View all
        </button>
      </div>

      <div className="upcoming-rides__list">
        {loading && (
          <div className="upcoming-rides__loading">
            <Loader2 size={20} className="animate-spin" />
            <span>Loading rides...</span>
          </div>
        )}

        {!loading && rides.length === 0 && (
          <div className="upcoming-rides__empty">
            <p>No upcoming rides scheduled.</p>
          </div>
        )}

        {rides.map((ride, index) => (
          <button
            key={ride._id}
            className="ride-item"
            onClick={() => navigate("/my-rides", {state: {rideId: ride._id}})}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="ride-item__icon">
              <MapPin size={18} />
            </div>
            <div className="ride-item__info">
              <span className="ride-item__name">
                {ride.destination || "Unnamed Ride"}
              </span>
              <span className="ride-item__meta">
                <Clock size={12} />
                <span>
                  {formatRideDay(ride.datetime)} ·{" "}
                  {formatRideTime(ride.datetime)}
                </span>
                {ride.status === "Matched" && (
                  <span className="ride-item__badge">Matched</span>
                )}
              </span>
            </div>
            <ChevronRight size={18} className="ride-item__chevron" />
          </button>
        ))}
      </div>
    </section>
  );
}
