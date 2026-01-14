import { renderStatusLabel } from '@app/utils/renderUtils';
import { ThProps, Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, ClusterResponseApi } from '@api';
import { ClustersTableProps } from '../types';
import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { TablePagination } from '@app/components/common/TablesPagination';
import { searchItems, filterByStatus, filterByProvider, sortItems, paginateItems } from '@app/utils/tableFilters';
import { fetchAllPages } from '@app/utils/fetchAllPages';
import { EmptyState, EmptyStateVariant, EmptyStateBody, Title } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

export const ClustersTable: React.FunctionComponent<ClustersTableProps> = ({
  clusterNameSearch,
  accountNameSearch,
  statusFilter,
  providerSelections,
  showTerminated,
}) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [allClusters, setAllClusters] = useState<ClusterResponseApi[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSortIndex, setActiveSortIndex] = useState<number | undefined>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allItems = await fetchAllPages(async (page, pageSize) => {
          const { data } = await api.clusters.clustersList({ page, page_size: pageSize });
          return { items: data.items || [], count: data.count || 0 };
        });
        setAllClusters(allItems);
      } catch (error) {
        console.error('Error fetching clusters:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  let processed = allClusters;

  if (!showTerminated) {
    processed = processed.filter(cluster => cluster.status !== 'Terminated');
  }

  if (clusterNameSearch) {
    processed = searchItems(processed, clusterNameSearch, ['clusterName']);
  }

  if (accountNameSearch) {
    processed = searchItems(processed, accountNameSearch, ['accountName']);
  }

  processed = filterByStatus(processed, statusFilter);
  processed = filterByProvider(processed, providerSelections);

  if (activeSortIndex !== undefined && activeSortDirection) {
    const sortFields: (keyof ClusterResponseApi)[] = [
      'clusterId',
      'clusterName',
      'status',
      'accountId',
      'provider',
      'region',
      'instanceCount',
      'consoleLink',
    ];
    processed = sortItems(processed, sortFields[activeSortIndex], activeSortDirection);
  }

  const paginated = paginateItems(processed, page, perPage);

  const columnNames = {
    id: 'ID',
    name: 'Name',
    status: 'Status',
    account: 'Account',
    cloudProvider: 'Cloud Provider',
    region: 'Region',
    nodes: 'Nodes',
    console: 'Web console',
  };

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (processed.length === 0) {
    return (
      <EmptyState
        titleText={
          <Title headingLevel="h4" size="md">
            No clusters found
          </Title>
        }
        icon={CubesIcon}
        variant={EmptyStateVariant.sm}
      >
        <EmptyStateBody>
          {!showTerminated ? (
            <>
              There are no active clusters.
              <br />
              Toggle &apos;Show terminated clusters&apos; to view all clusters.
            </>
          ) : (
            'No clusters found.'
          )}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <React.Fragment>
      <Table aria-label="Clusters table">
        <Thead>
          <Tr>
            <Th sort={getSortParams(0)}>{columnNames.id}</Th>
            <Th sort={getSortParams(1)}>{columnNames.name}</Th>
            <Th>{columnNames.status}</Th>
            <Th sort={getSortParams(3)}>{columnNames.account}</Th>
            <Th sort={getSortParams(4)}>{columnNames.cloudProvider}</Th>
            <Th sort={getSortParams(5)}>{columnNames.region}</Th>
            <Th sort={getSortParams(6)}>{columnNames.nodes}</Th>
            <Th>{columnNames.console}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map(cluster => (
            <Tr key={cluster.clusterId}>
              <Td dataLabel={columnNames.id}>
                <Link to={`/clusters/${cluster.clusterId}`}>{cluster.clusterId}</Link>
              </Td>
              <Td dataLabel={columnNames.name}>{cluster.clusterName}</Td>
              <Td dataLabel={columnNames.status}>{renderStatusLabel(cluster.status)}</Td>
              <Td dataLabel={columnNames.account}>
                <Link to={`/accounts/${cluster.accountId}`}>{cluster.accountName}</Link>
              </Td>
              <Td dataLabel={columnNames.cloudProvider}>{cluster.provider}</Td>
              <Td dataLabel={columnNames.region}>{cluster.region}</Td>
              <Td dataLabel={columnNames.nodes}>{cluster.instanceCount}</Td>
              <Td dataLabel={columnNames.console}>
                <a href={cluster.consoleLink} target="_blank" rel="noopener noreferrer">
                  Console
                </a>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <TablePagination
        itemCount={processed.length}
        page={page}
        perPage={perPage}
        onSetPage={setPage}
        onPerPageSelect={setPerPage}
      />
    </React.Fragment>
  );
};

export default ClustersTable;
