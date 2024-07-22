import {
  PageSection,
  PageSectionVariants,
  Panel,
  ToolbarItem,
  Toolbar,
  ToolbarContent,
  TextContent,
  Text,
  SearchInput,
  Spinner,
} from "@patternfly/react-core";
import { renderStatusLabel } from "src/app/utils/renderStatusLabel";
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from "@patternfly/react-table";
import React, { useEffect, useState } from "react";
import { Link, useLocation  } from "react-router-dom";
import { getClusters } from "../services/api";
import { Cluster } from "@app/types/types";


const TableToolbar: React.FunctionComponent<{onSearchChange: (value: string) => void;}> = ({ onSearchChange }) => {
  const [value, setValue] = React.useState("");

  const onChange = (value: string) => {
    setValue(value);
    onSearchChange(value);
  };

  return (
    <Toolbar id="table-toolbar">
      <ToolbarContent>
        <ToolbarItem variant="search-filter">
          <SearchInput
            aria-label="Search by name..."
            placeholder="Search by name..."
            value={value}
            onChange={(_event, value) => onChange(value)}
            onClear={() => onChange("")}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

const ClusterTable: React.FunctionComponent<{ searchValue: string, statusFilter: string | null, cloudProviderFilter: string | null }> = ({
  searchValue,
  statusFilter,
  cloudProviderFilter,
}) => {

  const [clusterData, setClusterData] = useState<Cluster[] | []>([]);
  const [filteredData, setFilteredData] = useState<Cluster[] | []>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedClusters = await getClusters();
        setClusterData(fetchedClusters.clusters);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = clusterData.filter((cluster) =>
      cluster.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (statusFilter) {
      filtered = filtered.filter((cluster) => cluster.status === statusFilter);
    }

    if (cloudProviderFilter) {
      console.log(cloudProviderFilter);
      console.log(clusterData);
      filtered = filtered.filter((cluster) => cluster.provider === cloudProviderFilter);
    }

    setFilteredData(filtered);
      }, [searchValue, clusterData, statusFilter, cloudProviderFilter]);

  const columnNames = {
    id: "ID",
    name: "Name",
    status: "Status",
    account: "Account",
    cloudProvider: "Cloud Provider",
    region: "Region",
    nodes: "Nodes",
    console: "Web console",
  };

  //### Sorting ###
  // Index of the currently active column
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | undefined>(0);
  // sort direction of the currently active column
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | undefined>('asc');
  // sort dropdown expansion
  const getSortableRowValues = (cluster: Cluster): (string | number | null)[] => {
    const { id, name, status, accountName, provider, region, instanceCount, consoleLink } = cluster;
    return [id, name, status, accountName, provider, region, instanceCount, consoleLink];
  };

  // Note that we perform the sort as part of the component's render logic and not in onSort.
  // We shouldn't store the list of data in state because we don't want to have to sync that with props.
  let sortedData = filteredData;
  if (typeof activeSortIndex === 'number' && activeSortIndex !== null) {
    sortedData = filteredData.sort((a, b) => {
      const aValue = getSortableRowValues(a)[activeSortIndex];
      const bValue = getSortableRowValues(b)[activeSortIndex];
      if (typeof aValue === 'number') {
        // Numeric sort
        if (activeSortDirection === 'asc') {
          return (aValue as number) - (bValue as number);
        }
        return (bValue as number) - (aValue as number);
      } else {
        // String sort
        if (activeSortDirection === 'asc') {
          return (aValue as string).localeCompare(bValue as string);
        }
        return (bValue as string).localeCompare(aValue as string);
      }
    });
  }

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc' // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex
  });
  //### --- ###

  return (
    <React.Fragment>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spinner size="xl" />
        </div>
      ) : (
        <Table aria-label="Sortable table">
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
            {sortedData.map((cluster) => (
              <Tr key={cluster.name}>
                <Td dataLabel={columnNames.id}>
                  <Link
                    to={`/clusters/${cluster.id}`}
                  >
                    {cluster.id}
                  </Link>
                </Td>
                <Td dataLabel={columnNames.name}>
                  {cluster.name}
                </Td>
                <Td dataLabel={columnNames.status}>
                  {renderStatusLabel(cluster.status)}
                </Td>
                <Td dataLabel={columnNames.account}>{cluster.accountName}</Td>
                <Td dataLabel={columnNames.cloudProvider}>
                  {cluster.provider}
                </Td>
                <Td dataLabel={columnNames.region}>{cluster.region}</Td>
                <Td dataLabel={columnNames.nodes}>
                  {cluster.instanceCount}
                </Td>
                <Td dataLabel={columnNames.console}>
                  <a
                    href={cluster.consoleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Console
                  </a>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </React.Fragment>
  );
};

const Clusters: React.FunctionComponent = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get('status');
  const cloudProviderFilter = queryParams.get('provider');

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Clusters</Text>
        </TextContent>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Panel>
          <TableToolbar onSearchChange={setSearchValue} />{" "}
          <ClusterTable searchValue={searchValue} statusFilter={statusFilter} cloudProviderFilter={cloudProviderFilter} />{" "}
        </Panel>
      </PageSection>
    </React.Fragment>
  );
};

export default Clusters;
