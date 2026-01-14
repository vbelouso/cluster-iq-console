import React from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { EmptyState } from '@patternfly/react-core';
import { SystemEventResponseApi } from '@api';
import { Link } from 'react-router-dom';
import { resolveResourcePath } from '@app/utils/parseFuncs';
import { CheckCircleIcon, ErrorCircleOIcon, WarningTriangleIcon, InboxIcon } from '@patternfly/react-icons';

interface ActivityTableProps {
  events: SystemEventResponseApi[];
}

const getResultIcon = (result: string) => {
  const PATTERNFLY_COLORS = {
    success: 'var(--pf-t--global--color--status--success--default)',
    danger: 'var(--pf-t--global--color--status--danger--default)',
    warning: 'var(--pf-t--global--color--status--warning--default)',
  } as const;

  switch (result.toLowerCase()) {
    case 'ok':
    case 'success':
      return <CheckCircleIcon color={PATTERNFLY_COLORS.success} />;
    case 'failed':
    case 'failure':
    case 'error':
      return <ErrorCircleOIcon color={PATTERNFLY_COLORS.danger} />;
    case 'warning':
    case 'partial':
    case 'pending':
      return <WarningTriangleIcon color={PATTERNFLY_COLORS.warning} />;
    default:
      return <WarningTriangleIcon color={PATTERNFLY_COLORS.warning} />;
  }
};

export const ActivityTable: React.FunctionComponent<ActivityTableProps> = ({ events }) => {
  if (events.length === 0) {
    return <EmptyState headingLevel="h4" icon={InboxIcon} titleText="No recent events"></EmptyState>;
  }

  return (
    <Table aria-label="Recent events table" variant="compact">
      <Thead>
        <Tr>
          <Th>Time</Th>
          <Th>Action</Th>
          <Th>Result</Th>
          <Th>Resource</Th>
          <Th>Triggered By</Th>
        </Tr>
      </Thead>
      <Tbody>
        {events.map(event => (
          <Tr key={event.id}>
            <Td>{event.timestamp ? new Date(event.timestamp).toLocaleString('es-ES') : '-'}</Td>
            <Td>{event.action}</Td>
            <Td>
              {getResultIcon(event.result)} {event.result}
            </Td>
            <Td>
              <Link to={resolveResourcePath(event.resourceType ?? '-', event.resourceId ?? '-')}>
                {event.resourceId}
              </Link>
            </Td>
            <Td>{event.triggeredBy}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
