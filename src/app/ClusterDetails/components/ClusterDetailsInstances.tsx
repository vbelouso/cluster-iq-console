import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { renderStatusLabel } from '@app/utils/renderUtils';
import { api, InstanceResponseApi } from '@api';
import { ThProps, Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ClusterDetailsInstances: React.FunctionComponent = () => {
  const { clusterID } = useParams();
  const [data, setData] = useState<InstanceResponseApi[]>([]);
  const [loading, setLoading] = useState(true);
  //### Sorting ###
  // Index of the currently active column
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | undefined>(0);
  // sort direction of the currently active column
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | undefined>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const { data: fetchedInstancesPerCluster } = await api.clusters.instancesList(clusterID!);
        console.log('Fetched data:', fetchedInstancesPerCluster);
        setData(fetchedInstancesPerCluster);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clusterID]);

  if (!clusterID) {
    return <LoadingSpinner />;
  }

  console.log('Rendered with data:', data);
  // sort dropdown expansion
  const getSortableRowValues = (instance: InstanceResponseApi): (string | number | null | undefined)[] => {
    const { instanceId, instanceName, availabilityZone, instanceType, status, clusterId, provider } = instance;
    return [instanceId, instanceName, availabilityZone, instanceType, status, clusterId, provider];
  };

  // Sorting
  let sortedData = data;
  if (typeof activeSortIndex === 'number' && activeSortIndex !== null) {
    sortedData = [...data].sort((a, b) => {
      const aValue = getSortableRowValues(a)[activeSortIndex];
      const bValue = getSortableRowValues(b)[activeSortIndex];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        // Numeric sort
        if (activeSortDirection === 'asc') {
          return aValue - bValue;
        }
        return bValue - aValue;
      } else {
        // String sort
        const aStr = String(aValue);
        const bStr = String(bValue);
        if (activeSortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        }
        return bStr.localeCompare(aStr);
      }
    });
  }

  // set table column properties
  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc', // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  return (
    <React.Fragment>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table aria-label="Simple table">
          <Thead>
            <Tr>
              <Th sort={getSortParams(0)}>ID</Th>
              <Th sort={getSortParams(1)}>Name</Th>
              <Th sort={getSortParams(3)}>Type</Th>
              <Th sort={getSortParams(4)}>Status</Th>
              <Th sort={getSortParams(2)}>AvailabilityZone</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.map(instance => (
              <Tr key={instance.instanceId}>
                <Td dataLabel={instance.instanceId}>
                  <Link to={`/instances/${instance.instanceId}`}>{instance.instanceId}</Link>
                </Td>
                <Td>{instance.instanceName}</Td>
                <Td>{instance.instanceType}</Td>
                <Td dataLabel={instance.status}>{renderStatusLabel(instance.status)}</Td>
                <Td>{instance.availabilityZone}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </React.Fragment>
  );
};

export default ClusterDetailsInstances;
