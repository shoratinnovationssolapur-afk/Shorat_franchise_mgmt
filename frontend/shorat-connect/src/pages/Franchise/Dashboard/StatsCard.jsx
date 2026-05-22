import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  badge,
  description, // optional small note under the value
  color = "primary" 
}) => {
  const colorClasses = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
    destructive: "text-destructive"
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-medium transition-all duration-300 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="relative">
          {Icon && <Icon aria-label={title} className={cn("h-5 w-5", colorClasses[color])} />}
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
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>

      {/* Bottom border hover animation */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500",
        color === "primary" && "bg-primary",
        color === "success" && "bg-success",
        color === "warning" && "bg-warning",
        color === "info" && "bg-info",
        color === "destructive" && "bg-destructive"
      )} />
    </Card>
  );
};
