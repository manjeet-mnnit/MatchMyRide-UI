import HomeHeader from "../components/home/HomeHeader";
import GreetingBanner from "../components/home/GreetingBanner";
import CreateRideCard from "../components/home/CreateRideCard";
import UpcomingRides from "../components/home/UpcomingRides";
import YourGroups from "../components/home/YourGroups";
import "../components/home/Home.css";

export default function Home() {
  return (
    <div className="home-page">
      <HomeHeader />

      <main className="home-page__body">
        <GreetingBanner />
        <CreateRideCard />

        <div className="home-content-grid">
          <UpcomingRides />
          <YourGroups />
        </div>
      </main>
    </div>
  );
}
