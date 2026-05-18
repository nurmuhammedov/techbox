import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Column } from 'react-table'
import { 
  Flame, 
  Droplet, 
  Zap, 
  Home, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts'
import { useData } from 'hooks'
import { decimalToPrice } from 'utilities/common'
import { DeleteModal, DeleteButton, EditButton, ReactTable, Card } from 'components'
import classes from './Dashboard.module.scss'

const resourceColors: Record<string, string> = {
  'gaz': '#93c5fd',
  'suv': '#1d4ed8',
  'elektr energiyasi': '#0f172a',
  'arenda': '#38bdf8'
}

interface IDashboardProps {
  currentDate: Date
}

const Index: FC<IDashboardProps> = ({ currentDate }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const { data: cardsData, isPending: isCardsLoading, refetch: refetchCards } = useData<Record<string, { value: number; growth: number }>>(
    'communal/cards',
    true,
    { year, month }
  )

  const { data: yearlyData, isPending: isYearlyLoading, refetch: refetchYearly } = useData<Record<string, number>>(
    'communal/yearly-chart',
    true,
    { year }
  )

  const { data: monthlyData, isPending: isMonthlyLoading, refetch: refetchMonthly } = useData<Array<{ name: string; value: number }>>(
    'communal/monthly-chart',
    true,
    { year, month }
  )

  const { data: tableData, isPending: isTableLoading, refetch: refetchTable } = useData<any[]>(
    'communal/table',
    true,
    { year, month }
  )

  const isLoading = isCardsLoading || isYearlyLoading || isMonthlyLoading || isTableLoading

  const refetchAll = () => {
    refetchCards()
    refetchYearly()
    refetchMonthly()
    refetchTable()
  }

  const kpiCards = useMemo(() => {
    if (!cardsData || Object.keys(cardsData).length === 0) {
      return []
    }
    return Object.entries(cardsData).map(([key, data]) => {
      let IconComponent = Zap
      const lowerKey = key.toLowerCase()
      if (lowerKey.includes('gaz')) IconComponent = Flame
      else if (lowerKey.includes('suv')) IconComponent = Droplet
      else if (lowerKey.includes('arenda') || lowerKey.includes('ijara')) IconComponent = Home
      else if (lowerKey.includes('elektr') || lowerKey.includes('svet')) IconComponent = Zap

      return {
        key,
        label: t(key),
        icon: IconComponent,
        value: data.value || 0,
        growth: data.growth || 0
      }
    })
  }, [cardsData, t])

  const barChartData = useMemo(() => {
    if (!yearlyData || Object.keys(yearlyData).length === 0) {
      return []
    }
    return Object.entries(yearlyData).map(([key, value]) => ({
      name: t(key),
      value: Number(value || 0),
      rawKey: key.toLowerCase()
    }))
  }, [yearlyData, t])

  const donutChartData = useMemo(() => {
    return monthlyData || []
  }, [monthlyData])

  const table = useMemo(() => {
    return tableData || []
  }, [tableData])

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: t('№'),
        accessor: (_: any, index: number) => index + 1,
        style: { width: '3rem', textAlign: 'center' }
      },
      {
        Header: t('expense_name'),
        accessor: (row: any) => t(row.resource_name)
      },
      {
        Header: t('tariff_price'),
        accessor: (row: any) => {
          const lowerName = row.resource_name.toLowerCase()
          return `${decimalToPrice(row.tariff_price).split(',')[0]} ${lowerName.includes('arenda') ? '$' : "so‘m"}`
        }
      },
      {
        Header: t('this_month_usage'),
        accessor: (row: any) => {
          const lowerName = row.resource_name.toLowerCase()
          let unit = ''
          if (lowerName.includes('gaz')) unit = ' m³'
          else if (lowerName.includes('suv')) unit = ' L'
          else if (lowerName.includes('svet') || lowerName.includes('elektr')) unit = ' KV'

          return row.consumption !== null && row.consumption !== undefined ? (
            lowerName.includes('arenda') ? '-' : `${row.consumption}${unit}`
          ) : '-'
        }
      },
      {
        Header: t('tariff_changes_count'),
        accessor: (row: any) => row.tariff_changes_count
      },
      {
        Header: t('paid_som'),
        accessor: (row: any) => {
          const lowerName = row.resource_name.toLowerCase()
          return `${decimalToPrice(row.amount_paid).split(',')[0]} ${lowerName.includes('arenda') ? '$' : "so‘m"}`
        }
      },
      {
        Header: t('remaining_som'),
        accessor: (row: any) => {
          const lowerName = row.resource_name.toLowerCase()
          return row.debt > 0 ? `${decimalToPrice(row.debt).split(',')[0]} ${lowerName.includes('arenda') ? '$' : "so‘m"}` : '-'
        }
      },
      {
        Header: t('edit_report'),
        accessor: (row: any) => (
          <div className="flex items-center justify-center gap-lg">
            <EditButton onClick={() => navigate(`edit-report/${row.id}`)} />
            <DeleteButton id={row.id} />
          </div>
        ),
        style: { textAlign: 'center', width: '8rem' }
      }
    ],
    [t, navigate]
  )

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--navy-dark)',
          color: 'var(--white)',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.8125rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{payload[0].payload?.name || payload[0].name}</p>
          <p style={{ margin: '0.25rem 0 0 0', color: '#93c5fd', fontWeight: 700 }}>
            {decimalToPrice(payload[0].value)} so‘m
          </p>
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--navy-dark)',
          color: 'var(--white)',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.8125rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{t(payload[0].name)}</p>
          <p style={{ margin: '0.25rem 0 0 0', color: '#38bdf8', fontWeight: 700 }}>
            {payload[0].value}%
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className={classes.container}>
        <div className={classes.kpiGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={classes.kpiCard}>
              <div className={classes.skeletonTitle} />
              <div className={classes.skeletonValue} />
              <div className={classes.skeletonTrend} />
            </div>
          ))}
        </div>

        <div className={classes.chartsGrid}>
          <div className={classes.chartCard}>
            <div className={classes.chartHeader}>
              <div className={classes.skeletonTitle} />
            </div>
            <div className={classes.chartContent}>
              <div className={classes.skeletonBar} />
            </div>
          </div>
          <div className={classes.chartCard}>
            <div className={classes.chartHeader}>
              <div className={classes.skeletonTitle} />
            </div>
            <div className={classes.chartContent} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={classes.skeletonCircle} />
            </div>
          </div>
        </div>

        <Card style={{ padding: '1.5rem' }}>
          <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
            <h3 className="font-bold text-base" style={{ color: 'var(--navy-dark)' }}>{t('Hisobotlar')}</h3>
          </div>
          <ReactTable
            columns={columns}
            data={[]}
            isLoading={true}
          />
        </Card>
      </div>
    )
  }

  const hasMonthlyData = donutChartData.some(item => item.value > 0)

  return (
    <div className={classes.container}>
      <div className={classes.kpiGrid}>
        {kpiCards.map((card) => {
          const Icon = card.icon
          const isPositive = card.growth >= 0
          const color = resourceColors[card.key.toLowerCase()] || '#cbd5e1'

          return (
            <div key={card.key} className={classes.kpiCard}>
              <div className={classes.kpiMeta}>
                <span className={classes.kpiLabel}>{card.label}</span>
                <span style={{ color }}>
                  <Icon size={22} strokeWidth={2.5} />
                </span>
              </div>
              <div className={classes.kpiValue}>
                {decimalToPrice(card.value).split(',')[0]}
              </div>
              <div className={classes.kpiFooter}>
                <span className={`${classes.kpiTrend} ${isPositive ? classes.positive : classes.negative}`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isPositive ? '+' : ''}{card.growth}%
                </span>
                <div className={classes.kpiChartIcon}>
                  <TrendingUp size={16} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className={classes.chartsGrid}>
        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <span className={classes.chartTitle}>{t('yearly_expenses')}</span>
          </div>
          <div className={classes.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={45}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={resourceColors[entry.rawKey] || '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <span className={classes.chartTitle}>{t('monthly_expenses')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center', height: '250px' }}>
            <div className={classes.chartContent} style={{ height: '200px' }}>
              {hasMonthlyData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                       data={donutChartData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={4}
                       dataKey="value"
                    >
                      {donutChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={resourceColors[entry.name.toLowerCase()] || '#cbd5e1'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: "'Golos Text', 'Inter', sans-serif",
                    textAlign: 'center'
                  }}
                >
                  {t('No data available')}
                </div>
              )}
            </div>
            
            <div className={classes.monthlyLegend}>
              {donutChartData.map((item) => {
                const color = resourceColors[item.name.toLowerCase()] || '#cbd5e1'
                return (
                  <div key={item.name} className={classes.legendItem}>
                    <span className={classes.legendLabel}>
                      <span className={classes.legendDot} style={{ background: color }} />
                      {t(item.name)}
                    </span>
                    <span className={classes.legendValue}>{item.value}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      <Card style={{ padding: '1.5rem' }}>
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
          <h3 className="font-bold text-base" style={{ color: 'var(--navy-dark)' }}>{t('Hisobotlar')}</h3>
        </div>
        <ReactTable
          columns={columns}
          data={table}
          isLoading={isLoading}
        />
      </Card>

      <DeleteModal 
        endpoint="communal/reports/" 
        onDelete={refetchAll}
      />

    </div>
  )
}

export default Index
