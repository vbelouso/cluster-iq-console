/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TableComposable, Thead, Tr, Th, Tbody, Td, ExpandableRowContent } from '@patternfly/react-table';
import { Card, Label, PageSection } from '@patternfly/react-core';

interface Cluster {
  name: string;
  provider: string;
  status: string;
  instances: Instance[];
  nodes: number;
  consoleLink: string;
  nestedComponent?: React.ReactNode;
  noPadding?: boolean;
}
interface Instance {
  id: string;
  name: string;
  region: string;
  instanceType: string;
  state: string;
}

interface InstancesTableProps {
  instancesInfo: Instance[];
}

const fetchClusterData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/clusterMock');
    const clusters: Cluster[] = response.data.map((cluster: Cluster) => {
      return {
        ...cluster,
        nodes: cluster.instances.length,
        nestedComponent: <NestedInstancesTable instancesInfo={cluster.instances} />,
      };
    });
    return clusters;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

const NestedInstancesTable: React.FunctionComponent<InstancesTableProps> = ({ instancesInfo }) => {
  const columnNames = {
    id: 'ID',
    name: 'Name',
    instanceType: 'Type',
    region: 'Region',
    state: 'State',
  };

  return (
    <TableComposable aria-label="Simple table" variant="compact">
      <Thead>
        <Tr>
          <Th width={20}>{columnNames.id}</Th>
          <Th width={20}>{columnNames.name}</Th>
          <Th width={20}>{columnNames.instanceType}</Th>
          <Th width={20}>{columnNames.region}</Th>
          <Th width={20}>{columnNames.state}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {instancesInfo.map((instance) => (
          <Tr key={instance.id}>
            <Td dataLabel={columnNames.id}>{instance.id}</Td>
            <Td dataLabel={columnNames.name}>{instance.name}</Td>
            <Td dataLabel={columnNames.instanceType}>{instance.instanceType}</Td>
            <Td dataLabel={columnNames.region}>{instance.region}</Td>
            <Td dataLabel={columnNames.state}>{instance.state}</Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

const Clusters = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);

  useEffect(() => {
    const fetchDataAndSetData = async () => {
      const fetchedData = await fetchClusterData();
      setClusters(fetchedData);
    };

    fetchDataAndSetData();
  }, []);

  const columnNames = {
    name: 'Cluster',
    provider: 'Provider',
    status: 'Status',
    nodes: 'Nodes',
    link: 'Link',
  };

  const [expandedClusterNames, setExpandedClusterNames] = React.useState<string[]>([]);
  const setClusterExpanded = (cluster: Cluster, isExpanding = true) =>
    setExpandedClusterNames((prevExpanded) => {
      const otherExpandedClusterNames = prevExpanded.filter((r) => r !== cluster.name);
      return isExpanding ? [...otherExpandedClusterNames, cluster.name] : otherExpandedClusterNames;
    });
  const isClusterExpanded = (cluster: Cluster) => expandedClusterNames.includes(cluster.name);

  const renderLabel = (labelText: {} | null | undefined) => {
    switch (labelText) {
      case 'Running':
        return <Label color="green">{labelText}</Label>;
      case 'Stopped':
        return <Label color="orange">{labelText}</Label>;
      case 'Needs Maintenance':
        return <Label color="blue">{labelText}</Label>;
      case 'Down':
        return <Label color="red">{labelText}</Label>;
    }
  };

  return (
    <React.Fragment>
      <PageSection isFilled>
        <Card>
          <TableComposable aria-label="Clusters">
            <Thead>
              <Tr>
                <Td />
                <Th width={20}>{columnNames.name}</Th>
                <Th width={20}>{columnNames.provider}</Th>
                <Th width={20}>{columnNames.status}</Th>
                <Th width={20}>{columnNames.nodes}</Th>
                <Th width={20}>{columnNames.link}</Th>
              </Tr>
            </Thead>
            {clusters.map((cluster, rowIndex) => (
              <Tbody key={cluster.name}>
                <Tr>
                  <Td
                    expand={
                      cluster.nestedComponent
                        ? {
                            rowIndex,
                            isExpanded: isClusterExpanded(cluster),
                            onToggle: () => setClusterExpanded(cluster, !isClusterExpanded(cluster)),
                            expandId: 'composable-nested-table-expandable-example',
                          }
                        : undefined
                    }
                  />
                  <Td dataLabel={columnNames.name}>{cluster.name}</Td>
                  <Td dataLabel={columnNames.provider}>{cluster.provider}</Td>
                  <Td dataLabel={columnNames.status}>{renderLabel(cluster.status)}</Td>
                  <Td dataLabel={columnNames.nodes}>{cluster.nodes}</Td>
                  <Td dataLabel={columnNames.link}>
                    <a href={cluster.consoleLink} target="_blank" rel="noopener noreferrer">
                      Web console
                    </a>
                  </Td>
                </Tr>
                {cluster.nestedComponent ? (
                  <Tr isExpanded={isClusterExpanded(cluster)}>
                    <Td
                      noPadding={cluster.noPadding}
                      dataLabel={`${columnNames.name} expended`}
                      colSpan={Object.keys(columnNames).length + 1}
                    >
                      <ExpandableRowContent>{cluster.nestedComponent}</ExpandableRowContent>
                    </Td>
                  </Tr>
                ) : null}
              </Tbody>
            ))}
          </TableComposable>
        </Card>
      </PageSection>
    </React.Fragment>
  );
};

export { Clusters };
