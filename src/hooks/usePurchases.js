import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseService, supplierService } from '@/services/purchaseService'

export function usePurchases(params = {}) {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => purchaseService.list(params),
  })
}

export function usePurchase(id) {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: () => purchaseService.get(id),
    enabled: Boolean(id),
  })
}

export function useSuppliers(params = {}) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => supplierService.list(params),
  })
}

export function useSupplier(id) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => supplierService.get(id),
    enabled: Boolean(id),
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => purchaseService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchases'] }),
  })
}

export function useReceivePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, items }) => purchaseService.receive(id, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
    },
  })
}

export function useCancelPurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => purchaseService.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchases'] }),
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => supplierService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => supplierService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers', updated.id] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => supplierService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}
