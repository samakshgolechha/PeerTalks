export default function FeatureCard({ heading, desc, icon , left }) {
  return (
    <div className="min-h-[21rem] relative flex flex-col justify-center gap-y-8 items-center bg-white shadow-even shadow-primary-300 ring-2 ring-primary-300 w-[19.5rem] rounded-xl p-6">
      <div className={`w-24 h-24 p-4 bg-primary-700 flex justify-center items-center text-gray-200 rounded-3xl ${left?"rounded-br-none":"rounded-bl-none"} ring-2 ring-gray-100 shadow-icon shadow-primary-300`}>
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-primary-800 px-5 font-fancy text-xl text-center font-bold tracking-wide">
          {heading}
        </h3>
        <p className="text-center font-fancy text-base text-primary-600">
          {desc}
        </p>
      </div>
    </div>
  );
}
