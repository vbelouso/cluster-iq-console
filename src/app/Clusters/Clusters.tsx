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
  Label,
  Spinner,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import React, { useEffect, useState } from "react";
import { Link, useLocation  } from "react-router-dom";
import { getClusters } from "../services/api";

interface IClusters {
  name: string;
  status: string | null;
  account: string | null;
  provider: string;
  region: string;
  instances: number;
  consoleLink: string;
}

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

  const [clusterData, setClusterData] = useState<IClusters[] | []>([]);
  const [filteredData, setFilteredData] = useState<IClusters[] | []>([]);
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
    name: "Name",
    status: "Status",
    account: "Account",
    cloudProvider: "Cloud Provider",
    region: "Region",
    nodes: "Nodes",
    console: "Web console",
  };
  const renderLabel = (labelText: string | null | undefined) => {
    switch (labelText) {
      case "Running":
        return <Label color="green">{labelText}</Label>;
      case "Stopped":
        return <Label color="red">{labelText}</Label>;
      default:
        return <Label color="gold">{labelText}</Label>;
    }
  };

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
        <Table aria-label="Simple table">
          <Thead>
            <Tr>
              <Th>{columnNames.name}</Th>
              <Th>{columnNames.status}</Th>
              <Th>{columnNames.account}</Th>
              <Th>{columnNames.cloudProvider}</Th>
              <Th>{columnNames.region}</Th>
              <Th>{columnNames.nodes}</Th>
              <Th>{columnNames.console}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData.map((cluster) => (
              <Tr key={cluster.name}>
                <Td dataLabel={columnNames.name}>
                  <Link
                    to={`/clusters/${cluster.id}`}
                  >
                    {cluster.id}
                  </Link>
                </Td>
                <Td dataLabel={columnNames.status}>
                  {renderLabel(cluster.status)}
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
