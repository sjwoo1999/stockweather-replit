import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertStockHoldingSchema } from "@shared/schema";

const addStockSchema = insertStockHoldingSchema.extend({
  stockCode: z.string().min(1, "종목코드를 입력하세요"),
  stockName: z.string().min(1, "종목명을 입력하세요"),
  shares: z.number().min(1, "보유 주식 수를 입력하세요"),
  averagePrice: z.number().min(1, "평균 매입가를 입력하세요"),
  confidenceLevel: z.number().min(1).max(100).default(50),
});

type AddStockForm = z.infer<typeof addStockSchema>;

interface AddStockModalProps {
  portfolioId: string;
  trigger?: React.ReactNode;
}

export default function AddStockModal({ portfolioId, trigger }: AddStockModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddStockForm>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      portfolioId,
      stockCode: "",
      stockName: "",
      shares: 0,
      averagePrice: 0,
      confidenceLevel: 50,
    },
  });

  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/stocks/search", { q: searchQuery }],
    enabled: searchQuery.length > 0,
    retry: false,
  });

  const addStockMutation = useMutation({
    mutationFn: async (data: AddStockForm) => {
      const response = await apiRequest("POST", `/api/portfolios/${portfolioId}/holdings`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "종목 추가 완료",
        description: "포트폴리오에 새 종목이 추가되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}/holdings`] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "종목 추가 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStockSelect = (stockCode: string, stockName: string) => {
    form.setValue("stockCode", stockCode);
    form.setValue("stockName", stockName);
    setSearchQuery("");
  };

  const onSubmit = (data: AddStockForm) => {
    addStockMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            종목 추가
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>종목 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">종목 검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="종목명, 코드, 업종으로 검색 (예: 삼성, 005930, 반도체, KOSDAQ)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery.length > 0 && searchResults.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-2">
                "{searchQuery}"에 대한 검색 결과가 없습니다.
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="border border-border rounded-md max-h-48 overflow-y-auto">
                {searchResults.map((stock: any) => (
                  <div
                    key={stock.code}
                    className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    onClick={() => handleStockSelect(stock.code, stock.name)}
                  >
                    <div className="font-medium text-foreground">{stock.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-mono">{stock.code}</span>
                      <span className="text-xs">•</span>
                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                        {stock.market}
                      </span>
                      {stock.sector && (
                        <>
                          <span className="text-xs">•</span>
                          <span className="text-xs">{stock.sector}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockCode">종목코드</Label>
            <Input
              id="stockCode"
              {...form.register("stockCode")}
              placeholder="예: 005930"
              readOnly
            />
            {form.formState.errors.stockCode && (
              <p className="text-sm text-error">{form.formState.errors.stockCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockName">종목명</Label>
            <Input
              id="stockName"
              {...form.register("stockName")}
              placeholder="예: 삼성전자"
              readOnly
            />
            {form.formState.errors.stockName && (
              <p className="text-sm text-error">{form.formState.errors.stockName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares">보유 주식 수</Label>
            <Input
              id="shares"
              type="number"
              {...form.register("shares", { valueAsNumber: true })}
              placeholder="예: 100"
            />
            {form.formState.errors.shares && (
              <p className="text-sm text-error">{form.formState.errors.shares.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="averagePrice">평균 매입가</Label>
            <Input
              id="averagePrice"
              type="number"
              step="0.01"
              {...form.register("averagePrice", { valueAsNumber: true })}
              placeholder="예: 71500"
            />
            {form.formState.errors.averagePrice && (
              <p className="text-sm text-error">{form.formState.errors.averagePrice.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidenceLevel">투자 확신도 (%)</Label>
            <Select
              value={form.watch("confidenceLevel")?.toString()}
              onValueChange={(value) => form.setValue("confidenceLevel", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="확신도 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25% - 낮음</SelectItem>
                <SelectItem value="50">50% - 보통</SelectItem>
                <SelectItem value="75">75% - 높음</SelectItem>
                <SelectItem value="90">90% - 매우 높음</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={addStockMutation.isPending}>
              {addStockMutation.isPending ? "추가 중..." : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
