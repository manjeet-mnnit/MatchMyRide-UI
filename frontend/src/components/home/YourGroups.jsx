import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

export default function YourGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axiosInstance.get("/groups/my-groups");
        // Limit to 3 for the home preview
        setGroups((res.data.groups || []).slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <section className="your-groups">
      <div className="section-header">
        <h3 className="section-header__title">YOUR GROUPS</h3>
        <button
          className="section-header__link"
          onClick={() => navigate("/my-groups")}
        >
          View all
        </button>
      </div>

      <div className="your-groups__list">
        {loading && (
          <div className="your-groups__loading">
            <Loader2 size={20} className="animate-spin" />
            <span>Loading groups...</span>
          </div>
        )}

        {!loading && groups.length === 0 && (
          <div className="your-groups__empty">
            <p>No groups yet.</p>
          </div>
        )}

        {groups.map((group, index) => (
          <button
            key={group._id}
            className="group-item"
            onClick={() =>
              navigate("/my-groups", { state: { groupId: group._id } })
            }
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="group-item__icon">
              <Users size={18} />
            </div>
            <div className="group-item__info">
              <span className="group-item__name">{group.name}</span>
              <span className="group-item__meta">
                {group.members?.length || 0} members
              </span>
            </div>
            <ChevronRight size={18} className="group-item__chevron" />
          </button>
        ))}
      </div>
    </section>
  );
}
