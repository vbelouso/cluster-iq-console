import { renderStatusLabel } from '@app/utils/renderUtils';
import { EmptyState, EmptyStateVariant, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ServersTableProps } from '../types';
import { api, InstanceResponseApi } from '@api';
import { TablePagination } from '@app/components/common/TablesPagination';
import { searchItems, filterByStatus, filterByProvider, paginateItems } from '@app/utils/tableFilters';
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

  const paginated = paginateItems(filtered, page, perPage);

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
      <EmptyState variant={EmptyStateVariant.sm}>
        <EmptyStateIcon icon={ServerIcon} />
        <Title headingLevel="h4" size="md">
          No instances found
        </Title>
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
            <Th>{columnNames.id}</Th>
            <Th>{columnNames.name}</Th>
            <Th>{columnNames.status}</Th>
            <Th>{columnNames.provider}</Th>
            <Th>{columnNames.availabilityZone}</Th>
            <Th>{columnNames.instanceType}</Th>
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
