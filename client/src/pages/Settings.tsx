import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2,
  Plus,
  Settings as SettingsIcon,
  Save
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserAlertSchema } from "@shared/schema";

const alertSchema = insertUserAlertSchema.extend({
  alertType: z.enum(['price_target', 'weather_condition', 'dart_disclosure']),
  condition: z.object({
    stockCode: z.string().optional(),
    targetPrice: z.number().optional(),
    weatherFactor: z.string().optional(),
    threshold: z.number().optional(),
  }),
});

type AlertForm = z.infer<typeof alertSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewAlert, setShowNewAlert] = useState(false);

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: portfolios } = useQuery({
    queryKey: ["/api/portfolios"],
  });

  const alertForm = useForm<AlertForm>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      alertType: 'price_target',
      condition: {},
      isActive: true,
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: AlertForm) => {
      const response = await apiRequest("POST", "/api/alerts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "알림 생성 완료",
        description: "새로운 알림이 설정되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setShowNewAlert(false);
      alertForm.reset();
    },
    onError: (error) => {
      toast({
        title: "알림 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await apiRequest("DELETE", `/api/alerts/${alertId}`);
    },
    onSuccess: () => {
      toast({
        title: "알림 삭제 완료",
        description: "알림이 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: (error) => {
      toast({
        title: "알림 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/alerts/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const getAlertTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
      'price_target': '목표가 알림',
      'weather_condition': '날씨 조건 알림',
      'dart_disclosure': '공시 알림',
    };
    return nameMap[type] || type;
  };

  const getAlertDescription = (alert: any) => {
    switch (alert.alertType) {
      case 'price_target':
        return `${alert.stockCode} - 목표가 ₩${alert.condition.targetPrice?.toLocaleString()}`;
      case 'weather_condition':
        return `${alert.condition.weatherFactor} 변화 감지`;
      case 'dart_disclosure':
        return `${alert.stockCode} 공시 발표`;
      default:
        return '알림 조건';
    }
  };

  const onSubmitAlert = (data: AlertForm) => {
    createAlertMutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">설정</h2>
        <p className="text-muted-foreground">계정 정보, 알림 설정, 개인화 옵션을 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">프로필</TabsTrigger>
              <TabsTrigger value="notifications">알림</TabsTrigger>
              <TabsTrigger value="privacy">개인정보</TabsTrigger>
              <TabsTrigger value="data">데이터</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    프로필 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="프로필 이미지" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {user?.firstName || user?.email || '사용자'}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">이름</Label>
                      <Input
                        id="firstName"
                        value={user?.firstName || ''}
                        placeholder="이름을 입력하세요"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">성</Label>
                      <Input
                        id="lastName"
                        value={user?.lastName || ''}
                        placeholder="성을 입력하세요"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button disabled>
                      <Save className="w-4 h-4 mr-2" />
                      저장 (읽기 전용)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        알림 설정
                      </CardTitle>
                      <Button onClick={() => setShowNewAlert(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        새 알림
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <h4 className="font-medium">이메일 알림</h4>
                          <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받기</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <h4 className="font-medium">브라우저 알림</h4>
                          <p className="text-sm text-muted-foreground">실시간 브라우저 푸시 알림</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <h4 className="font-medium">목표가 도달 알림</h4>
                          <p className="text-sm text-muted-foreground">설정한 목표가에 도달했을 때</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <h4 className="font-medium">공시 발표 알림</h4>
                          <p className="text-sm text-muted-foreground">보유 종목의 새로운 공시</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <h4 className="font-medium">날씨 변화 알림</h4>
                          <p className="text-sm text-muted-foreground">주식 가격에 영향을 줄 수 있는 날씨 변화</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>활성 알림</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts?.map((alert: any) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={alert.isActive}
                              onCheckedChange={(checked) => 
                                toggleAlertMutation.mutate({ id: alert.id, isActive: checked })
                              }
                            />
                            <div>
                              <p className="font-medium text-foreground">
                                {getAlertTypeName(alert.alertType)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getAlertDescription(alert)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={alert.isActive ? "default" : "secondary"}>
                              {alert.isActive ? '활성' : '비활성'}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteAlertMutation.mutate(alert.id)}
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {alerts?.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          설정된 알림이 없습니다.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* New Alert Form */}
                {showNewAlert && (
                  <Card>
                    <CardHeader>
                      <CardTitle>새 알림 추가</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={alertForm.handleSubmit(onSubmitAlert)} className="space-y-4">
                        <div className="space-y-2">
                          <Label>알림 유형</Label>
                          <Select
                            value={alertForm.watch('alertType')}
                            onValueChange={(value) => alertForm.setValue('alertType', value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="price_target">목표가 알림</SelectItem>
                              <SelectItem value="weather_condition">날씨 조건 알림</SelectItem>
                              <SelectItem value="dart_disclosure">공시 알림</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {alertForm.watch('alertType') === 'price_target' && (
                          <>
                            <div className="space-y-2">
                              <Label>종목코드</Label>
                              <Input
                                placeholder="예: 005930"
                                {...alertForm.register('stockCode')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>목표가</Label>
                              <Input
                                type="number"
                                placeholder="예: 75000"
                                {...alertForm.register('condition.targetPrice', { valueAsNumber: true })}
                              />
                            </div>
                          </>
                        )}

                        {alertForm.watch('alertType') === 'weather_condition' && (
                          <>
                            <div className="space-y-2">
                              <Label>날씨 요소</Label>
                              <Select
                                value={alertForm.watch('condition.weatherFactor')}
                                onValueChange={(value) => alertForm.setValue('condition.weatherFactor', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="temperature">기온</SelectItem>
                                  <SelectItem value="precipitation">강수량</SelectItem>
                                  <SelectItem value="wind_speed">풍속</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>임계값</Label>
                              <Input
                                type="number"
                                placeholder="예: 30 (기온 30도 이상)"
                                {...alertForm.register('condition.threshold', { valueAsNumber: true })}
                              />
                            </div>
                          </>
                        )}

                        {alertForm.watch('alertType') === 'dart_disclosure' && (
                          <div className="space-y-2">
                            <Label>종목코드</Label>
                            <Input
                              placeholder="예: 005930 (비어두면 전체 공시)"
                              {...alertForm.register('stockCode')}
                            />
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowNewAlert(false)}
                          >
                            취소
                          </Button>
                          <Button type="submit" disabled={createAlertMutation.isPending}>
                            {createAlertMutation.isPending ? '생성 중...' : '알림 생성'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    개인정보 설정
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h4 className="font-medium">데이터 수집 동의</h4>
                        <p className="text-sm text-muted-foreground">서비스 개선을 위한 익명 데이터 수집</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h4 className="font-medium">마케팅 정보 수신</h4>
                        <p className="text-sm text-muted-foreground">새로운 기능 및 서비스 소식</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h4 className="font-medium">계정 공개 설정</h4>
                        <p className="text-sm text-muted-foreground">다른 사용자에게 프로필 공개</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">계정 관리</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        비밀번호 변경
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-error hover:text-error">
                        <Trash2 className="w-4 h-4 mr-2" />
                        계정 삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    데이터 관리
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">데이터 내보내기</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      개인 데이터를 다운로드하여 다른 서비스로 이전하거나 백업할 수 있습니다.
                    </p>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        포트폴리오 데이터 내보내기 (CSV)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        알림 설정 내보내기 (JSON)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        전체 데이터 내보내기 (ZIP)
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">데이터 삭제</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      특정 데이터를 영구적으로 삭제할 수 있습니다. 이 작업은 되돌릴 수 없습니다.
                    </p>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start text-error hover:text-error">
                        <Trash2 className="w-4 h-4 mr-2" />
                        포트폴리오 기록 삭제
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-error hover:text-error">
                        <Trash2 className="w-4 h-4 mr-2" />
                        알림 기록 삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2" />
                계정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">사용자 ID</span>
                <span className="font-medium text-xs">{user?.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">가입일</span>
                <span className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">포트폴리오</span>
                <span className="font-medium">{portfolios?.length || 0}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">활성 알림</span>
                <span className="font-medium">{alerts?.filter((a: any) => a.isActive).length || 0}개</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                포트폴리오 내보내기
              </Button>
              <Button variant="outline" className="w-full justify-start">
                새 알림 추가
              </Button>
              <Button variant="outline" className="w-full justify-start">
                계정 백업
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>도움말</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <h4 className="font-medium mb-2">알림 설정 팁</h4>
                <p className="text-muted-foreground text-xs mb-2">
                  목표가 알림은 실시간으로 확인되며, 한 번 알림이 발생하면 자동으로 비활성화됩니다.
                </p>
                <p className="text-muted-foreground text-xs">
                  날씨 알림은 보유 종목과 관련된 날씨 변화가 감지될 때 발송됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
