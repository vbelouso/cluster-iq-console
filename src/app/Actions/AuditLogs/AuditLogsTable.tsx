import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { ActionOperations, ResultStatus } from '@app/types/types';
import { SystemEventResponseApi } from '@api';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React, { useMemo } from 'react';
import { getResultIcon, renderOperationLabel } from '@app/utils/renderUtils';
import { useTableSort } from '@app/hooks/useTableSort.tsx';
import { EmptyState } from '@patternfly/react-core';
import { TablePagination } from '@app/components/common/TablesPagination';
import { paginateItems } from '@app/utils/tableFilters';
import { SearchIcon } from '@patternfly/react-icons';
import { AuditLogsTableProps } from './types';
import { Link } from 'react-router-dom';
import { useEvents } from '@app/hooks/useEvents';

const columnNames = {
  action: 'Action',
  result: 'Result',
  resource: 'Resource',
  account: 'Account',
  provider: 'Provider',
  triggeredBy: 'Triggered By',
  description: 'Description',
  date: 'Date',
};

const EmptyStateNoFound: React.FunctionComponent = () => (
  <EmptyState headingLevel="h4" icon={SearchIcon} titleText="No events"></EmptyState>
);

export const AuditLogsTable: React.FunctionComponent<AuditLogsTableProps> = ({
  accountName,
  action,
  provider,
  result,
  triggered_by,
}) => {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const { data: allEvents = [], isLoading } = useEvents();

  const filteredData = useMemo(() => {
    let filtered = allEvents;

    if (accountName) {
      filtered = filtered.filter(event => event.accountId?.toLowerCase().includes(accountName.toLowerCase()));
    }

    if (action?.length) {
      filtered = filtered.filter(event => action.includes(event.action as ActionOperations));
    }

    if (provider?.length) {
      filtered = filtered.filter(event => event.provider && provider.some(p => p === event.provider));
    }

    if (result?.length) {
      filtered = filtered.filter(event => result.includes(event.result as ResultStatus));
    }

    if (triggered_by) {
      filtered = filtered.filter(event => event.triggeredBy?.toLowerCase().includes(triggered_by.toLowerCase()));
    }

    return {
      count: filtered.length,
      items: paginateItems(filtered, page, perPage),
    };
  }, [allEvents, accountName, action, provider, result, triggered_by, page, perPage]);

  const getSortableRowValues = (event: SystemEventResponseApi): (string | number | null)[] => {
    const { action, result, resourceId, accountId, provider, triggeredBy, description, timestamp } = event;
    return [
      action ?? null,
      result ?? null,
      resourceId ?? null,
      accountId ?? null,
      provider ?? null,
      triggeredBy ?? null,
      description ?? null,
      timestamp ?? null,
    ];
  };

  const { sortedData, getSortParams } = useTableSort<SystemEventResponseApi>(
    filteredData.items,
    getSortableRowValues,
    7,
    'desc'
  );

  if (isLoading) return <LoadingSpinner />;
  if (filteredData.count === 0) return <EmptyStateNoFound />;

  return (
    <React.Fragment>
      <Table aria-label="Events table">
        <Thead>
          <Tr>
            <Th sort={getSortParams(2)}>{columnNames.resource}</Th>
            <Th sort={getSortParams(0)}>{columnNames.action}</Th>
            <Th sort={getSortParams(3)}>{columnNames.account}</Th>
            <Th sort={getSortParams(4)}>{columnNames.provider}</Th>
            <Th sort={getSortParams(5)}>{columnNames.triggeredBy}</Th>
            <Th>{columnNames.description}</Th>
            <Th sort={getSortParams(1)}>{columnNames.result}</Th>
            <Th sort={getSortParams(7)}>{columnNames.date}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map(event => (
            <Tr key={event.id}>
              <Td dataLabel={event.resourceId}>
                <Link
                  to={
                    event.resourceType === 'instance'
                      ? `/instances/${event.resourceId}`
                      : `/clusters/${event.resourceId}`
                  }
                >
                  {event.resourceId}
                </Link>
              </Td>
              <Td>{renderOperationLabel(event.action)}</Td>
              <Td>
                <Link to={`/accounts/${event.accountId}`}>{event.accountId}</Link>
              </Td>
              <Td>{event.provider}</Td>
              <Td>{event.triggeredBy}</Td>
              <Td>{event.description}</Td>
              <Td>
                {getResultIcon(event.result as ResultStatus)} {event.result}
              </Td>
              <Td>{event.timestamp}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <TablePagination
        itemCount={filteredData.count}
        page={page}
        perPage={perPage}
        onSetPage={setPage}
        onPerPageSelect={setPerPage}
      />
    </React.Fragment>
  );
};

export default AuditLogsTable;
