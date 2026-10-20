import { Card, Center, Group, Loader, Pagination, ScrollArea, Stack, Table, Text } from '@mantine/core'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export interface Column<T> {
  key: string
  title: ReactNode
  render?: (row: T) => ReactNode
  width?: number | string
  align?: 'left' | 'right' | 'center'
  hideOnMobile?: boolean
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  loading?: boolean
  page?: number
  pages?: number
  total?: number
  onPage?: (page: number) => void
  onRowClick?: (row: T) => void
  rowKey?: (row: T) => string | number
  empty?: ReactNode
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  rows,
  loading,
  page,
  pages,
  total,
  onPage,
  onRowClick,
  rowKey = (r) => r.id as number,
  empty,
}: Props<T>) {
  const { t } = useTranslation()
  return (
    <Card withBorder p={0} radius="md">
      <ScrollArea type="auto">
        <Table striped highlightOnHover={!!onRowClick} verticalSpacing="sm" miw={600}>
          <Table.Thead>
            <Table.Tr>
              {columns.map((c) => (
                <Table.Th key={c.key} w={c.width} ta={c.align} visibleFrom={c.hideOnMobile ? 'sm' : undefined}>
                  {c.title}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows?.map((row) => (
              <Table.Tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((c) => (
                  <Table.Td key={c.key} ta={c.align} visibleFrom={c.hideOnMobile ? 'sm' : undefined}>
                    {c.render ? c.render(row) : ((row as Record<string, ReactNode>)[c.key] ?? '—')}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      {loading && !rows?.length && (
        <Center p="xl">
          <Loader size="sm" />
        </Center>
      )}
      {!loading && rows && rows.length === 0 && (
        <Center p="xl">
          <Text c="dimmed">{empty ?? t('empty')}</Text>
        </Center>
      )}
      {pages !== undefined && pages > 1 && (
        <Stack p="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('total', { n: total })}
            </Text>
            <Pagination size="sm" value={page} total={pages} onChange={onPage} />
          </Group>
        </Stack>
      )}
    </Card>
  )
}
