import { Box, SegmentedControl, SegmentedControlProps } from '@mantine/core'

export function Segments({ mb = 'sm', ...props }: SegmentedControlProps) {
  return (
    <Box mb={mb} style={{ maxWidth: '100%', overflowX: 'auto', scrollbarWidth: 'none' }}>
      <SegmentedControl {...props} />
    </Box>
  )
}
