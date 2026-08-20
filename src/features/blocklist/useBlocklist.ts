import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { blocklistApi, type ListBlocklistParams } from './api'

const BLOCKLIST_KEY = ['email-blocklist']

export function useBlocklist(params: ListBlocklistParams) {
  return useQuery({
    queryKey: [...BLOCKLIST_KEY, params],
    queryFn: () => blocklistApi.list(params),
  })
}

export function useRemoveFromBlocklist() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => blocklistApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKLIST_KEY })
      toast.success(t('blocklist.toastRemoved'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('blocklist.toastRemoveError'))),
  })
}
