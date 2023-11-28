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
import { getAccounts } from "../services/api";

interface IAccounts {
  name: string;
  provider: string;
  clusterCount: number;
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

const AccountTable: React.FunctionComponent<{ searchValue: string, cloudProviderFilter: string | null }> = ({
  searchValue,
  cloudProviderFilter,
}) => {

  const [accountData, setAccountData] = useState<IAccounts[] | []>([]);
  const [filteredData, setFilteredData] = useState<IAccounts[] | []>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedAccounts = await getAccounts();
        setAccountData(fetchedAccounts.accounts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = accountData.filter((account) =>
      account.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (cloudProviderFilter) {
      console.log(cloudProviderFilter);
      console.log(accountData);
      filtered = filtered.filter((account) => account.provider === cloudProviderFilter);
    }

    setFilteredData(filtered);
      }, [searchValue, accountData, cloudProviderFilter]);

  const columnNames = {
    name: "Name",
    cloudProvider: "Cloud Provider",
    clusterCount: "Cluster Count",
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
              <Th>{columnNames.cloudProvider}</Th>
              <Th>{columnNames.clusterCount}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData.map((account) => (
              <Tr key={account.name}>
                <Td dataLabel={columnNames.name}>
                  <Link
                    to={`/accounts/${account.name}`}
                  >
                    {account.name}
                  </Link>
                </Td>
                <Td dataLabel={columnNames.cloudProvider}>
                  {account.provider}
                </Td>
                <Td dataLabel={columnNames.clusterCount}>
                  {account.clusterCount}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </React.Fragment>
  );
};

const Accounts: React.FunctionComponent = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const cloudProviderFilter = queryParams.get('provider');

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Accounts</Text>
        </TextContent>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Panel>
          <TableToolbar onSearchChange={setSearchValue} />{" "}
          <AccountTable searchValue={searchValue} cloudProviderFilter={cloudProviderFilter} />{" "}
        </Panel>
      </PageSection>
    </React.Fragment>
  );
};

export default Accounts;
