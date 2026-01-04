import React from "react";
import FeatureCard from "./FeatureCard";
import { FaUser } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { MdSecurity } from "react-icons/md";
import { MdMessage } from "react-icons/md";
const features = [
  {
    heading: "Personalized Profiles",
    description: "Safe sign-up, customizable profiles, and privacy controls for user accounts.",
    icon: <FaUser size={50}/>
  },
  {
    heading: "Messaging Features",
    description: "Instant conversations with emojis and reactions for real-time messaging.",
    icon: <MdMessage size={50} />
  },
  {
    heading: "Notifications and Alerts",
    description: "Push notifications, customizable preferences, and in-app alerts for timely notifications.",
    icon: <IoMdNotifications size={50}/>
  },
  {
    heading: "Privacy and Security",
    description: "Secure messaging with end-to-end encryption, two-factor authentication, and customizable privacy settings",
    icon: <MdSecurity size={50} />
  },


];
export default function Features() {
  return (
    <>
      <div className=" bg-primary-200 w-full mt-36">
        <h1 className="font-fancy tracking-wide py-16 font-semibold text-4xl text-primary-700 text-center">
          Why you should choose{" "}
          <span className="text-primary-900 font-bold">PEER TALKS ?</span>
        </h1>
        <div className="grid grid-cols-2">
          {features.map((feature, index) => {
            const left = index %2 == 0;
            return <div key={index} className={`mx-auto p-3 ${left ? "mr-12" : "mt-36 ml-12"}`}>
              <FeatureCard left = {left} heading={feature.heading} desc={feature.description} icon={feature.icon} />
            </div>
})}
        </div>
      </div>
    </>
  );
}
