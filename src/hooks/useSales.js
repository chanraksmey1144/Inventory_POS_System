import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesService, customerService, expenseService } from '@/services/salesService'

export function useSales(params = {}) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => salesService.list(params),
  })
}

export function useSale(id) {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => salesService.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => salesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCancelSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => salesService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useProcessReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ saleId, items }) => salesService.processReturn(saleId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['returns'] })
    },
  })
}

export function useReturns() {
  return useQuery({
    queryKey: ['returns'],
    queryFn: () => salesService.returns(),
  })
}

export function useCustomers(params = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.list(params),
  })
}

export function useCustomer(id) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerService.get(id),
    enabled: Boolean(id),
  })
}

export function useCustomerGroups() {
  return useQuery({
    queryKey: ['customerGroups'],
    queryFn: () => customerService.groups(),
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', updated.id] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => customerService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useExpenses(params = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseService.list(params),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => expenseService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses', updated.id] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => expenseService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  })
}
