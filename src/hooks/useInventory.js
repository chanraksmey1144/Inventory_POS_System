import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService, dashboardService } from '@/services/inventoryService'

export function useInventory(params = {}) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.list(params),
  })
}

export function useMovements(params = {}) {
  return useQuery({
    queryKey: ['movements', params],
    queryFn: () => inventoryService.movements(params),
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => inventoryService.adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useTransfers() {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: () => inventoryService.transfers(),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => inventoryService.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
    },
  })
}

export function useLowStock(params = {}) {
  return useQuery({
    queryKey: ['inventory', 'low-stock', params],
    queryFn: () => inventoryService.lowStock(params),
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.get(),
    staleTime: 60 * 1000,
  })
}
