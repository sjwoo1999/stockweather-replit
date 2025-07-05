import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { DartDisclosure } from "@/types";

interface DartPanelProps {
  disclosures: DartDisclosure[];
  className?: string;
}

export default function DartPanel({ disclosures, className }: DartPanelProps) {
  const getDisclosureTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'quarterly': 'border-l-primary',
      'annual': 'border-l-secondary',
      'material': 'border-l-accent',
      'fair_disclosure': 'border-l-warning',
    };
    return colorMap[type] || 'border-l-primary';
  };

  const getDisclosureTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
      'quarterly': '분기보고서',
      'annual': '사업보고서',
      'material': '주요사항보고서',
      'fair_disclosure': '공정공시',
    };
    return nameMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">DART 공시정보</CardTitle>
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {disclosures.slice(0, 5).map((disclosure) => (
            <div 
              key={disclosure.id} 
              className={`border-l-4 pl-4 py-2 ${getDisclosureTypeColor(disclosure.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">
                    {getDisclosureTypeName(disclosure.type)}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {disclosure.companyName} · {formatDate(disclosure.submittedDate)}
                  </p>
                  {disclosure.summary && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {disclosure.summary}
                    </p>
                  )}
                </div>
                {disclosure.url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 p-1"
                    onClick={() => window.open(disclosure.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
