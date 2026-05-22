import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  badge,
  color = "primary",
}) => {
  // Mapping colors to Tailwind classes
  const colorClasses = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
    destructive: "text-destructive",
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-medium transition-all duration-300">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="relative">
          {Icon && <Icon className={cn("h-5 w-5", colorClasses[color])} />}
          {badge && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>

        {/* Trend Info */}
        {trend && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span
              className={cn(
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {Math.abs(trend.value)}%
            </span>
            <span>from last month</span>
          </div>
        )}
      </CardContent>

      {/* Bottom Accent Bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-1 w-full opacity-50 group-hover:opacity-100 transition-opacity",
          color === "primary" && "bg-primary",
          color === "success" && "bg-success",
          color === "warning" && "bg-warning",
          color === "info" && "bg-info",
          color === "destructive" && "bg-destructive"
        )}
      />
    </Card>
  );
};
