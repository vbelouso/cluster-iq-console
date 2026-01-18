import { ThProps, Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountResponseApi, ProviderApi } from '@api';
import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { TablePagination } from '@app/components/common/TablesPagination';
import { searchItems, filterByProvider, sortItems, paginateItems } from '@app/utils/tableFilters';
import { useAccounts } from '@app/hooks/useAccounts';

export const AccountsTable: React.FunctionComponent<{
  searchValue: string;
  providerSelections: ProviderApi[] | null;
}> = ({ searchValue, providerSelections }) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const { data: allAccounts = [], isLoading } = useAccounts();

  const [activeSortIndex, setActiveSortIndex] = useState<number | undefined>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  let filtered = allAccounts;
  filtered = searchItems(filtered, searchValue, ['accountName']);
  filtered = filterByProvider(filtered, providerSelections);

  if (activeSortIndex !== undefined && activeSortDirection) {
    const sortFields: (keyof AccountResponseApi)[] = ['accountName', 'provider', 'clusterCount'];
    filtered = sortItems(filtered, sortFields[activeSortIndex], activeSortDirection);
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
    name: 'Name',
    cloudProvider: 'Cloud Provider',
    clusterCount: 'Cluster Count',
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Table aria-label="Accounts table">
          <Thead>
            <Tr>
              <Th sort={getSortParams(0)}>{columnNames.name}</Th>
              <Th sort={getSortParams(1)}>{columnNames.cloudProvider}</Th>
              <Th sort={getSortParams(2)}>{columnNames.clusterCount}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginated.map(account => (
              <Tr key={account.accountId}>
                <Td dataLabel={columnNames.name}>
                  <Link to={`/accounts/${account.accountId}`}>{account.accountName}</Link>
                </Td>
                <Td dataLabel={columnNames.cloudProvider}>{account.provider}</Td>
                <Td dataLabel={columnNames.clusterCount}>{account.clusterCount}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      <TablePagination
        itemCount={filtered.length}
        page={page}
        perPage={perPage}
        onSetPage={setPage}
        onPerPageSelect={setPerPage}
      />
    </>
  );
};

export default AccountsTable;
