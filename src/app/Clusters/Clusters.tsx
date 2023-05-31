/* eslint-disable no-console */
import React from 'react';
import { TableComposable, Thead, Tr, Th, Tbody, Td, ExpandableRowContent } from '@patternfly/react-table';
import { Card, Label, PageSection } from '@patternfly/react-core';
interface Cluster {
  name: string;
  provider: string;
  status: string;
  nodes: number;
  nestedComponent?: React.ReactNode;
  consoleLink?: React.ReactNode;
  noPadding?: boolean;
}
interface NestedCluster {
  hostname: string;
  role: string;
  status: string;
  something1: string;
  something2: string;
}

const NestedClustersTable: React.FunctionComponent = () => {
  const clusterInfo: NestedCluster[] = [
    { hostname: 'master-1', role: 'Master', status: 'Running', something1: '5', something2: '2 days ago' },
    { hostname: 'master-2', role: 'Master', status: 'Down', something1: '5', something2: '2 days ago' },
    { hostname: 'master-3', role: 'Master', status: 'Stopped', something1: '5', something2: '2 days ago' },
    { hostname: 'worker-1', role: 'Worker', status: 'Needs Maintenance', something1: '5', something2: '2 days ago' },
    { hostname: 'worker-2', role: 'Worker', status: 'Stopped', something1: '5', something2: '2 days ago' },
    { hostname: 'worker-3', role: 'Worker', status: 'Running', something1: '5', something2: '2 days ago' },
  ];

  const columnNames = {
    hostname: 'Hostname',
    role: 'Roles',
    status: 'Status',
    something1: 'Something1',
    something2: 'Something2',
  };

  return (
    <TableComposable aria-label="Simple table" variant="compact">
      <Thead>
        <Tr>
          <Th>{columnNames.hostname}</Th>
          <Th>{columnNames.role}</Th>
          <Th>{columnNames.status}</Th>
          <Th>{columnNames.something1}</Th>
          <Th>{columnNames.something2}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {clusterInfo.map((cluster) => (
          <Tr key={cluster.hostname}>
            <Td dataLabel={columnNames.hostname}>{cluster.hostname}</Td>
            <Td dataLabel={columnNames.role}>{cluster.role}</Td>
            <Td dataLabel={columnNames.status}>{cluster.status}</Td>
            <Td dataLabel={columnNames.something1}>{cluster.something1}</Td>
            <Td dataLabel={columnNames.something2}>{cluster.something2}</Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

const Clusters = () => {
  const clusters: Cluster[] = [
    {
      name: 'Cluster 1',
      provider: 'AWS',
      status: 'Running',
      nodes: 6,
      nestedComponent: <NestedClustersTable />,
      consoleLink: <a>Console</a>,
    },
    {
      name: 'Cluster 2',
      provider: 'Google',
      status: 'Stopped',
      nodes: 3,
      nestedComponent: <NestedClustersTable />,
      consoleLink: <a>Console</a>,
    },
  ];

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
                <Th>{columnNames.name}</Th>
                <Th>{columnNames.provider}</Th>
                <Th>{columnNames.status}</Th>
                <Th>{columnNames.nodes}</Th>
                <Th>{columnNames.link}</Th>
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
                  <Td dataLabel={columnNames.link}>{cluster.consoleLink}</Td>
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
