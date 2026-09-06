import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Save } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useRoles, useRolePermissions, useUpdateRolePermissions } from '@/hooks/useAdmin'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import { PERMISSION_GROUPS, ROLE_PERMISSIONS } from '@/constants/permissions'

function isAdmin(permissions) {
  return Array.isArray(permissions) && permissions.includes('*')
}

export default function RolesPage() {
  const { t } = useTranslation()
  usePageTitle('roles.title')
  const toast = useToastStore()

  const rolesQuery = useRoles()

  const roles = rolesQuery.data?.items || []
  const [selectedKey, setSelectedKey] = useState('')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || !rolesQuery.data) return
    initializedRef.current = true
    const initial = roles.find((role) => role.key !== 'admin') || roles[0]
    setSelectedKey(initial?.key || '')
  }, [rolesQuery.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedRole = roles.find((role) => role.key === selectedKey)

  const permissionsQuery = useRolePermissions(selectedRole?.id)
  const [checkedPermissions, setCheckedPermissions] = useState([])
  const permissions = checkedPermissions

  useEffect(() => {
    if (permissionsQuery.isSuccess) {
      setCheckedPermissions(permissionsQuery.data?.permissions || [])
    }
  }, [permissionsQuery.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateRole = useUpdateRolePermissions()

  const admin = selectedRole?.grantAll || isAdmin(permissions)

  const groupState = useMemo(() => {
    if (admin) return {}
    return PERMISSION_GROUPS.reduce((acc, group) => {
      const keys = group.permissions.map((permission) => permission.key)
      const checked = keys.filter((key) => permissions.includes(key)).length
      acc[group.key] = checked === keys.length ? 'all' : checked === 0 ? 'none' : 'some'
      return acc
    }, {})
  }, [permissions, admin])

  const togglePermission = (key) => {
    setCheckedPermissions((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    )
  }

  const toggleGroup = (group) => {
    const keys = group.permissions.map((permission) => permission.key)
    const allChecked = keys.every((key) => permissions.includes(key))
    setCheckedPermissions((current) =>
      allChecked ? current.filter((item) => !keys.includes(item)) : [...new Set([...current, ...keys])],
    )
  }

  const handleSave = async () => {
    if (!selectedRole || admin) return
    try {
      await updateRole.mutateAsync({ roleId: selectedRole.id, permissions })
      toast.success(t('roles.updated'))
    } catch {
      /* handled by error toast */
    }
  }

  if (rolesQuery.isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={t('roles.title')}
        subtitle={t('roles.subtitle')}
        breadcrumb={[{ label: t('nav.users') }, { label: t('roles.title') }]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader title={t('roles.role')} />
          <CardBody className="p-2">
            <ul className="space-y-1">
              {roles.map((role) => (
                <li key={role.key}>
                  <button
                    type="button"
                    onClick={() => setSelectedKey(role.key)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                      selectedKey === role.key
                        ? 'bg-emerald-50 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:ring-emerald-500/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{role.name}</span>
                      {isAdmin(ROLE_PERMISSIONS[role.key]) || role.grantAll ? (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">*</span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{role.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader
            title={selectedRole?.name || t('roles.title')}
            subtitle={admin ? t('roles.adminHint') : t('roles.permissions')}
          />
          <CardBody>
            {admin ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <ShieldCheck size={28} aria-hidden="true" />
                </div>
                <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{t('roles.adminHint')}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {PERMISSION_GROUPS.map((group) => {
                  const state = groupState[group.key]
                  return (
                    <div key={group.key} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{group.label}</h3>
                        <input
                          type="checkbox"
                          checked={state === 'all'}
                          ref={(node) => {
                            if (node) node.indeterminate = state === 'some'
                          }}
                          onChange={() => toggleGroup(group)}
                          className="h-4 w-4 rounded border-slate-300 accent-emerald-600 dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        {group.permissions.map((permission) => (
                          <Checkbox
                            key={permission.key}
                            label={permission.label}
                            checked={permissions.includes(permission.key)}
                            onChange={() => togglePermission(permission.key)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
          <div className="flex justify-end border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <Button
              icon={Save}
              onClick={handleSave}
              loading={updateRole.isPending}
              disabled={!selectedRole || admin}
            >
              {t('common.save')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
