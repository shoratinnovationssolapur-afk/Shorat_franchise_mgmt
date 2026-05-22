import React from "react";

// Props: title, value, icon, trend, badge, color
export const StatsCard = ({ title, value, icon: Icon, trend, badge, color }) => {
  // Determine trend color
  const trendColor = trend?.isPositive ? "text-green-500" : "text-red-500";

  // Color classes for badge
  const badgeColors = {
    primary: "bg-blue-500 text-white",
    success: "bg-green-500 text-white",
    info: "bg-sky-500 text-white",
    warning: "bg-yellow-500 text-black",
    destructive: "bg-red-500 text-white",
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 flex justify-between items-center">
      {/* Left side: Icon */}
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${badgeColors[color] || "bg-gray-300"}`}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-lg font-bold">{value}</h3>
        </div>
      </div>

      {/* Right side: Trend */}
      {trend && (
        <div className="text-right">
          <span className={`${trendColor} font-semibold`}>
            {trend.isPositive ? "+" : "-"}
            {trend.value}%
          </span>
          <p className="text-xs text-gray-400">since last month</p>
        </div>
      )}
    </div>
  );
};