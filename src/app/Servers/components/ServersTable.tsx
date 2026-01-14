import { renderStatusLabel } from '@app/utils/renderUtils';
import { EmptyState, EmptyStateVariant, EmptyStateBody, Title } from '@patternfly/react-core';
import { ThProps, Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ServersTableProps } from '../types';
import { api, InstanceResponseApi } from '@api';
import { TablePagination } from '@app/components/common/TablesPagination';
import { searchItems, filterByStatus, filterByProvider, sortItems, paginateItems } from '@app/utils/tableFilters';
import { fetchAllPages } from '@app/utils/fetchAllPages';
import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { ServerIcon } from '@patternfly/react-icons';

export const ServersTable: React.FunctionComponent<ServersTableProps> = ({
  searchValue,
  statusSelection,
  providerSelections,
  showTerminated,
}) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [allInstances, setAllInstances] = useState<InstanceResponseApi[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSortIndex, setActiveSortIndex] = useState<number | undefined>(1);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allItems = await fetchAllPages(async (page, pageSize) => {
          const { data } = await api.instances.instancesList({ page, page_size: pageSize });
          return { items: data.items || [], count: data.count || 0 };
        });
        setAllInstances(allItems);
      } catch (error) {
        console.error('Error fetching instances:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  let filtered = allInstances;

  // Filter out terminated instances unless showTerminated is true
  if (!showTerminated) {
    filtered = filtered.filter(instance => instance.status !== 'Terminated');
  }

  filtered = searchItems(filtered, searchValue, ['instanceName']);
  filtered = filterByStatus(filtered, statusSelection);
  filtered = filterByProvider(filtered, providerSelections);

  if (activeSortIndex !== undefined && activeSortDirection) {
    const sortFields: (keyof InstanceResponseApi)[] = [
      'instanceId',
      'instanceName',
      'status', // placeholder for index 2, though not sortable
      'provider',
      'availabilityZone',
      'instanceType',
    ];
    // status column (index 2) is not sortable, so we only sort if index is not 2
    if (activeSortIndex !== 2) {
      filtered = sortItems(filtered, sortFields[activeSortIndex], activeSortDirection);
    }
  }

  const paginated = paginateItems(filtered, page, perPage);

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const columnNames = {
    id: 'ID',
    name: 'Name',
    status: 'Status',
    provider: 'Provider',
    availabilityZone: 'AZ',
    instanceType: 'Type',
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        titleText={
          <Title headingLevel="h4" size="md">
            No instances found
          </Title>
        }
        icon={ServerIcon}
        variant={EmptyStateVariant.sm}
      >
        <EmptyStateBody>
          {!showTerminated ? (
            <>
              There are no active instances.
              <br />
              Toggle &apos;Show terminated instances&apos; to view all instances.
            </>
          ) : (
            'No instances found.'
          )}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <React.Fragment>
      <Table aria-label="Servers table">
        <Thead>
          <Tr>
            <Th sort={getSortParams(0)}>{columnNames.id}</Th>
            <Th sort={getSortParams(1)}>{columnNames.name}</Th>
            <Th>{columnNames.status}</Th>
            <Th sort={getSortParams(3)}>{columnNames.provider}</Th>
            <Th sort={getSortParams(4)}>{columnNames.availabilityZone}</Th>
            <Th sort={getSortParams(5)}>{columnNames.instanceType}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map(instance => (
            <Tr key={instance.instanceId}>
              <Td dataLabel={columnNames.id} width={15}>
                <Link to={`/instances/${instance.instanceId}`}>{instance.instanceId}</Link>
              </Td>
              <Td dataLabel={columnNames.name} width={30}>
                {instance.instanceName}
              </Td>
              <Td dataLabel={columnNames.status}>{renderStatusLabel(instance.status)}</Td>
              <Td dataLabel={columnNames.provider}>{instance.provider}</Td>
              <Td dataLabel={columnNames.availabilityZone}>{instance.availabilityZone}</Td>
              <Td dataLabel={columnNames.instanceType}>{instance.instanceType}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <TablePagination
        itemCount={filtered.length}
        page={page}
        perPage={perPage}
        onSetPage={setPage}
        onPerPageSelect={setPerPage}
      />
    </React.Fragment>
  );
};

export default ServersTable;
