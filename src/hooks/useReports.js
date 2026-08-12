import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportService, settingsService } from '@/services/reportService'

export function useSalesReport(params = {}) {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => reportService.sales(params),
  })
}

export function usePurchasesReport(params = {}) {
  return useQuery({
    queryKey: ['reports', 'purchases', params],
    queryFn: () => reportService.purchases(params),
  })
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: () => reportService.inventory(),
  })
}

export function useProfitReport(params = {}) {
  return useQuery({
    queryKey: ['reports', 'profit', params],
    queryFn: () => reportService.profit(params),
  })
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.get(),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => settingsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
