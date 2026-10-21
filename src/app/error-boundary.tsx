import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { AlertTriangle, RotateCw, WifiOff } from 'lucide-react'
import { Component, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { ApiError } from '@/lib/api'
import { Button } from '@/ui/button'
import { EmptyState } from '@/ui/feedback'

class Boundary extends Component<{ onReset: () => void; fallback: (error: unknown, retry: () => void) => ReactNode; children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown }

  static getDerivedStateFromError(error: unknown) {
    return { error }
  }

  retry = () => {
    this.props.onReset()
    this.setState({ error: null })
  }

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.retry) : this.props.children
  }
}

function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  const { t } = useTranslation()
  const offline = !(error instanceof ApiError) || !error.status
  const forbidden = error instanceof ApiError && error.status === 403
  return (
    <div className="mx-auto max-w-lg py-16">
      <EmptyState
        icon={offline ? WifiOff : AlertTriangle}
        title={forbidden ? t('forbidden') : offline ? t('state.offline') : t('state.failed')}
        hint={forbidden ? undefined : error instanceof Error ? error.message : undefined}
        action={forbidden ? undefined : <Button onClick={retry}><RotateCw />{t('state.retry')}</Button>}
      />
    </div>
  )
}

/** A page whose data could not be loaded says so and offers to try again, instead of loading forever. */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Boundary key={pathname} onReset={reset} fallback={(error, retry) => <PageError error={error} retry={retry} />}>
          {children}
        </Boundary>
      )}
    </QueryErrorResetBoundary>
  )
}
