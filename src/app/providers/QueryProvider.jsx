import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PropTypes from 'prop-types'
import { useState } from 'react'

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30 * 1000,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

QueryProvider.propTypes = {
  children: PropTypes.node,
}
