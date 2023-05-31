import React, { useEffect, useState } from 'react';
import { Card, PageSection, Text, TextContent } from '@patternfly/react-core';
import axios from 'axios';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';

const ClustersMock = () => {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/cluster');
        console.log('API Response:', response.data);
        setClusters(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const columns = ['Cluster ID', 'Name', 'Infrastructure', 'Status'];

  const rows = clusters.map((cluster) => ({
    cells: [
      { title: cluster.id },
      { title: cluster.name },
      { title: cluster.infrastructure },
      { title: cluster.status },
    ],
  }));

  return (
    <React.Fragment>
      <PageSection>
        <Card>
          <TextContent>
            <Text component="h1">Main title</Text>
            <Text component="p">This is a full page demo.</Text>
          </TextContent>
          <TableComposable variant="compact" isStriped>
            <Thead>
              <Tr>
                {columns.map((column, index) => (
                  <Th key={index}>{column}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row, index) => (
                <Tr key={index}>
                  {row.cells.map((cell, index) => (
                    <Td key={index}>{cell.title}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </Card>
      </PageSection>
    </React.Fragment>
  );
};

export { ClustersMock };
