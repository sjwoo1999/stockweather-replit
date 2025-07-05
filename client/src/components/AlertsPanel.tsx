import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, CloudRain, FileText, Settings } from "lucide-react";
import { UserAlert } from "@/types";

interface AlertsPanelProps {
  alerts: UserAlert[];
  className?: string;
}

export default function AlertsPanel({ alerts, className }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'price_target': <ArrowUp className="w-4 h-4 text-success" />,
      'weather_condition': <CloudRain className="w-4 h-4 text-warning" />,
      'dart_disclosure': <FileText className="w-4 h-4 text-accent" />,
    };
    return iconMap[type] || <ArrowUp className="w-4 h-4 text-primary" />;
  };

  const getAlertTitle = (alert: UserAlert) => {
    switch (alert.alertType) {
      case 'price_target':
        return `${alert.stockCode} 목표가 도달`;
      case 'weather_condition':
        return '날씨 변화 감지';
      case 'dart_disclosure':
        return `${alert.stockCode} 공시 발표`;
      default:
        return '알림';
    }
  };

  const getAlertDescription = (alert: UserAlert) => {
    switch (alert.alertType) {
      case 'price_target':
        return '설정한 목표가에 도달했습니다';
      case 'weather_condition':
        return '관련 종목 모니터링 권장';
      case 'dart_disclosure':
        return '새로운 공시가 발표되었습니다';
      default:
        return '알림이 도착했습니다';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'price_target':
        return 'border-l-primary';
      case 'weather_condition':
        return 'border-l-warning';
      case 'dart_disclosure':
        return 'border-l-accent';
      default:
        return 'border-l-primary';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">최근 알림</CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-start p-3 bg-muted/50 rounded-lg border-l-4 ${getBorderColor(alert.alertType)}`}
            >
              <div className="flex-shrink-0 mr-3">
                {getAlertIcon(alert.alertType)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {getAlertTitle(alert)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {alert.lastTriggered ? getTimeAgo(alert.lastTriggered) : '방금 전'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getAlertDescription(alert)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
