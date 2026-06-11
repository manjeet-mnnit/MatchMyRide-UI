import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function CreateRideCard() {
  const navigate = useNavigate();

  return (
    <section className="create-ride-card">
      <div className="create-ride-card__content">
        <h2 className="create-ride-card__title">Plan a new ride</h2>
        <p className="create-ride-card__subtitle">
          Set a route, pick a time, find your companions.
        </p>
      </div>
      <button
        className="create-ride-card__btn"
        onClick={() => navigate("/ride-form")}
      >
        <Plus size={18} />
        <span>Create ride</span>
      </button>
    </section>
  );
}
