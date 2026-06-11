import { useUser } from "../../context/useUser.js";

export default function GreetingBanner() {
  const { user } = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.fullName?.split(" ")[0] || "Rider";

  return (
    <section className="greeting-banner">
      <p className="greeting-banner__label">{getGreeting()}</p>
      <h3 className="greeting-banner__name">Hi, {firstName}</h3>
    </section>
  );
}
