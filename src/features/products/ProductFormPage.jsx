import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, Trash2 } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import {
  useCategories,
  useBrands,
  useUnits,
  useCreateProduct,
  useUpdateProduct,
  useProduct,
} from '@/hooks/useProducts'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import FormSection from '@/components/ui/FormSection'
import ProductImage from '@/components/ui/ProductImage'
import Spinner from '@/components/ui/Spinner'
import { normalizeApiError } from '@/lib/errors'
import { cn } from '@/lib/utils'

const IMAGE_COLORS = [
  '#0f172a',
  '#0d9488',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#db2777',
  '#dc2626',
  '#f59e0b',
  '#16a34a',
]

const productSchema = z
  .object({
    name: z.string().min(1, 'Required'),
    sku: z.string().min(1, 'Required'),
    barcode: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.string().min(1, 'Required'),
    brandId: z.string().optional(),
    unitId: z.string().min(1, 'Required'),
    status: z.string(),
    cost: z.coerce.number().min(0),
    price: z.coerce.number().min(0.01),
    wholesalePrice: z.coerce.number().min(0).optional(),
    tax: z.coerce.number().min(0).max(100),
    trackInventory: z.boolean(),
    stock: z.coerce.number().int().min(0),
    minStock: z.coerce.number().int().min(0),
    maxStock: z.coerce.number().int().min(0),
    imageColor: z.string(),
    imageLabel: z.string().optional(),
    imageUrl: z.string().optional(),
  })
  .refine((values) => values.maxStock >= values.minStock, {
    message: 'Max stock must be >= min stock',
    path: ['maxStock'],
  })

const DEFAULTS = {
  name: '',
  sku: '',
  barcode: '',
  description: '',
  categoryId: '',
  brandId: '',
  unitId: '',
  status: 'active',
  cost: 0,
  price: 0,
  wholesalePrice: 0,
  tax: 10,
  trackInventory: true,
  stock: 0,
  minStock: 5,
  maxStock: 100,
  imageColor: '#0f172a',
  imageLabel: '',
  imageUrl: '',
}

export default function ProductFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  usePageTitle(isEdit ? 'products.edit' : 'products.create')

  const toast = useToastStore()
  const categoriesQuery = useCategories()
  const brandsQuery = useBrands()
  const unitsQuery = useUnits()
  const productQuery = useProduct(id)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const [serverError, setServerError] = useState('')
  const fileInputRef = useRef(null)

  const categories = categoriesQuery.data?.items || []
  const brands = brandsQuery.data?.items || []
  const units = unitsQuery.data?.items || []

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULTS,
  })

  const imageColor = watch('imageColor')
  const imageLabel = watch('imageLabel')
  const imageUrl = watch('imageUrl')

  function handleUploadFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error(t('products.imageTypeError'))
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('products.imageSizeError'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => setValue('imageUrl', reader.result, { shouldValidate: true })
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    setValue('imageUrl', '', { shouldValidate: true })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (!isEdit) return
    if (!productQuery.data) return
    const product = productQuery.data
    reset({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      description: product.description || '',
      categoryId: product.categoryId,
      brandId: product.brandId || '',
      unitId: product.unitId,
      status: product.status,
      cost: product.cost,
      price: product.price,
      wholesalePrice: product.wholesalePrice || 0,
      tax: product.tax,
      trackInventory: product.trackInventory,
      stock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      imageColor: product.image?.color || DEFAULTS.imageColor,
      imageLabel: product.image?.label || '',
      imageUrl: product.image?.imageUrl || '',
    })
  }, [isEdit, productQuery.data, reset])

  async function onSubmit(values) {
    setServerError('')
    const payload = {
      name: values.name.trim(),
      sku: values.sku.trim(),
      barcode: values.barcode?.trim() || undefined,
      description: values.description?.trim() || undefined,
      categoryId: values.categoryId,
      brandId: values.brandId || undefined,
      unitId: values.unitId,
      status: values.status,
      cost: Number(values.cost),
      price: Number(values.price),
      wholesalePrice: Number(values.wholesalePrice) || undefined,
      tax: Number(values.tax),
      trackInventory: values.trackInventory,
      stock: values.trackInventory ? Number(values.stock) : undefined,
      minStock: Number(values.minStock),
      maxStock: Number(values.maxStock),
      image: {
        label: values.imageLabel?.trim() || undefined,
        color: values.imageColor,
        imageUrl: values.imageUrl || undefined,
      },
    }
    try {
      if (isEdit) {
        const updated = await updateProduct.mutateAsync({ id, data: payload })
        toast.success(t('products.updated'))
        navigate(`/products/${updated.id}`, { replace: true })
      } else {
        const created = await createProduct.mutateAsync(payload)
        toast.success(t('products.created'))
        navigate(`/products/${created.id}`, { replace: true })
      }
    } catch (error) {
      setServerError(normalizeApiError(error))
    }
  }

  if (isEdit && productQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={isEdit ? t('products.edit') : t('products.create')}
        breadcrumb={[
          { label: t('nav.products'), to: '/products' },
          { label: isEdit ? t('products.edit') : t('products.create') },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(isEdit ? `/products/${id}` : '/products')}>
            {t('common.cancel')}
          </Button>
        }
      />

      {serverError ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          {serverError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormSection title={t('products.basicInfo')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('products.productName')} error={errors.name?.message} {...register('name')} />
            <Input label={t('products.sku')} error={errors.sku?.message} {...register('sku')} />
            <Input label={t('products.barcode')} error={errors.barcode?.message} {...register('barcode')} />
            <Select label={t('products.status')} error={errors.status?.message} {...register('status')}>
              <option value="active">{t('products.active')}</option>
              <option value="draft">{t('products.draft')}</option>
              <option value="archived">{t('products.archived')}</option>
            </Select>
            <div className="sm:col-span-2">
              <Textarea
                label={t('products.description')}
                rows={3}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title={t('products.classification')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label={t('products.category')} error={errors.categoryId?.message} {...register('categoryId')}>
              <option value="">{t('common.select')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select label={t('products.brand')} error={errors.brandId?.message} {...register('brandId')}>
              <option value="">{t('common.none')}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
            <Select label={t('products.unit')} error={errors.unitId?.message} {...register('unitId')}>
              <option value="">{t('common.select')}</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.shortName})
                </option>
              ))}
            </Select>
          </div>
        </FormSection>

        <FormSection title={t('products.pricing')}>
          <div className="grid gap-4 sm:grid-cols-4">
            <Input label={t('products.costPrice')} type="number" step="0.01" min="0" error={errors.cost?.message} {...register('cost')} />
            <Input label={t('products.sellingPrice')} type="number" step="0.01" min="0" error={errors.price?.message} {...register('price')} />
            <Input label={t('products.wholesalePrice')} type="number" step="0.01" min="0" error={errors.wholesalePrice?.message} {...register('wholesalePrice')} />
            <Input label={t('products.taxRate')} type="number" step="1" min="0" max="100" error={errors.tax?.message} {...register('tax')} />
          </div>
        </FormSection>

        <FormSection title={t('products.inventory')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label={t('products.stock')} type="number" min="0" disabled={!watch('trackInventory')} error={errors.stock?.message} {...register('stock')} />
            <Input label={t('products.minStock')} type="number" min="0" error={errors.minStock?.message} {...register('minStock')} />
            <Input label={t('products.maxStock')} type="number" min="0" error={errors.maxStock?.message} {...register('maxStock')} />
            <div className="sm:col-span-3">
              <Checkbox
                label={t('products.trackInventory')}
                error={errors.trackInventory?.message}
                {...register('trackInventory')}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title={t('products.media')}>
          <div className="flex flex-wrap items-center gap-6">
            <ProductImage
              product={{ name: watch('name'), image: { label: imageLabel, color: imageColor, imageUrl } }}
              size="xl"
            />
            <div className="flex-1 space-y-4">
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('products.imageUpload')}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadFile}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imageUrl ? t('products.imageChange') : t('products.imageUploadBtn')}
                  </Button>
                  {imageUrl ? (
                    <Button type="button" variant="danger-outline" size="sm" icon={Trash2} onClick={handleRemoveImage}>
                      {t('products.imageRemove')}
                    </Button>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t('products.imageHint')}</p>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('products.imageLabel')}
                </p>
                <Input
                  value={imageLabel}
                  maxLength={2}
                  onChange={(event) => setValue('imageLabel', event.target.value.toUpperCase(), { shouldValidate: true })}
                  className="max-w-24"
                />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('products.imageColor')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {IMAGE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('imageColor', color)}
                      className={cn(
                        'h-8 w-8 rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110 dark:ring-offset-slate-900',
                        imageColor === color ? 'ring-slate-800 dark:ring-slate-100' : 'ring-transparent',
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        <Card>
          <CardBody className="flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate(isEdit ? `/products/${id}` : '/products')}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? t('common.saving') : isEdit ? t('common.save') : t('products.create')}
            </Button>
          </CardBody>
        </Card>
      </form>
    </div>
  )
}
