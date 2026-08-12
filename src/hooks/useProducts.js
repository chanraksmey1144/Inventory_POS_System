import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService, categoryService, brandService, unitService } from '@/services/productService'

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.list(params),
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', updated.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => productService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  })
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.list(),
  })
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => unitService.list(),
  })
}
