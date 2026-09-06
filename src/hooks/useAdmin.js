import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  userService,
  roleService,
  branchService,
  warehouseService,
  registerService,
  notificationService,
} from '@/services/userService'

export function useUsers(params = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.list(params),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => userService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => userService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => userService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useResetPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => userService.resetPassword(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.list(),
  })
}

export function useRolePermissions(roleId) {
  return useQuery({
    queryKey: ['roles', roleId, 'permissions'],
    queryFn: () => roleService.permissions(roleId),
    enabled: Boolean(roleId),
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissions }) =>
      roleService.updatePermissions(roleId, permissions),
    onSuccess: (_data, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', roleId, 'permissions'] })
    },
  })
}

export function useBranches(params = {}) {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: () => branchService.list(params),
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => branchService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => branchService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  })
}

export function useDeleteBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => branchService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  })
}

export function useWarehouses(params = {}) {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => warehouseService.list(params),
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => warehouseService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => warehouseService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => warehouseService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}

export function useRegisters(params = {}) {
  return useQuery({
    queryKey: ['registers', params],
    queryFn: () => registerService.list(params),
  })
}

export function useCreateRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => registerService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registers'] }),
  })
}

export function useUpdateRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => registerService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registers'] }),
  })
}

export function useDeleteRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => registerService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registers'] }),
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
  })
}

export function useUpdateNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, read }) => notificationService.updateRead(id, read),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => notificationService.auditLogs(params),
  })
}
