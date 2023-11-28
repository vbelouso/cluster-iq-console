import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import {
  PageSection,
  PageSectionVariants,
  Tabs,
  Tab,
  TabContent,
  TabContentBody,
  TabTitleText,
  Title,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Label,
  Flex,
  FlexItem,
  Page,
  Spinner,
  LabelGroup,
} from "@patternfly/react-core";
import InfoCircleIcon from "@patternfly/react-icons/dist/js/icons/info-circle-icon";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { getAccountByName, getAccountClusters } from "../services/api";
import { Link  } from "react-router-dom";
import { AccountData, Cluster } from "@app/types/types";
import { useLocation  } from "react-router-dom";
interface LabelGroupOverflowProps {
  labels: {
    text: string;
  }[];
}

const LabelGroupOverflow: React.FunctionComponent<LabelGroupOverflowProps> = ({
  labels,
}) => (
  <LabelGroup>
    {labels.map((label, index) => (
      <Label key={index}>{label.text}</Label>
    ))}
  </LabelGroup>
);

const AggregateClustersPerAccount: React.FunctionComponent = () => {
  const [data, setData] = useState<Cluster[] | []>([]);
  const [loading, setLoading] = useState(true);
  const { accountName } = useParams();


  useEffect(() => {
    const fetchData = async () => {
      try {
          console.log("Fetching data...");
          const fetchedAccountClusters = await getAccountClusters(accountName);
          console.log("Fetched Account data:", fetchedAccountClusters);
          setData(fetchedAccountClusters);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log("Rendered with data:", data);

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
              <Th>Name</Th>
              <Th>Provider</Th>
              <Th>Cluster Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((cluster) => (
              <Tr key={cluster.name}>
                <Td dataLabel={cluster.name}>
                  <Link
                    to={`/accounts/${cluster.accountName}/clusters/${cluster.name}`}
                  >
                    {cluster.name}
                  </Link>
                </Td>
                <Td>{cluster.name}</Td>
                <Td>{cluster.provider}</Td>
                <Td>{cluster.instanceCount}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </React.Fragment>
  );
};

const AccountDetails: React.FunctionComponent = () => {
  const { accountName } = useParams();
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  const [accountData, setAccountData] = useState<AccountData>({
    count: 0,
    accounts: []
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  useEffect(() => {
    const fetchData = async () => {
      try {
          console.log("Fetching Account Clusters ", accountName);
          const fetchedAccountClusters = await getAccountByName(accountName);
          setAccountData(fetchedAccountClusters);
          console.log("Fetched Account Clusters data:", accountData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  const detailsTabContent = (

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
    ) : 
    (<Flex direction={{ default: "column" }}>
      <FlexItem spacer={{ default: "spacerLg" }}>
        <Title
          headingLevel="h2"
          size="lg"
          className="pf-v5-u-mt-sm"
          id="open-tabs-example-tabs-list-details-title"
        >
          Cluster details
        </Title>
      </FlexItem>

      <FlexItem>
        <DescriptionList
          columnModifier={{ lg: "2Col" }}
          aria-labelledby="open-tabs-example-tabs-list-details-title"
        >
          <DescriptionListGroup>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDescription>
              {accountData.accounts[0].name}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Cloud Provider</DescriptionListTerm>
            <DescriptionListDescription>
              {accountData.accounts[0].provider}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Labels</DescriptionListTerm>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Last scanned at</DescriptionListTerm>
            <DescriptionListDescription>
              <time>Oct 15, 1:51 pm</time>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Created at</DescriptionListTerm>
            <DescriptionListDescription>
              <time>Oct 15, 1:51 pm</time>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </FlexItem>
    </Flex>)}
    </React.Fragment>
  );



  const clustersTabContent = (
    <TabContentBody>
      <AggregateClustersPerAccount />
    </TabContentBody>
  );


  return (
    <Page>
      
      {/* Page header */}
      <PageSection isWidthLimited variant={PageSectionVariants.light}>

        <Flex
          spaceItems={{ default: "spaceItemsMd" }}
          alignItems={{ default: "alignItemsFlexStart" }}
          flexWrap={{ default: "nowrap" }}
        >

          
          <FlexItem>
            <Label color="blue">CL</Label>
          </FlexItem>
          
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {/* {accountData.accounts[0].name} */}
            </Title>
          </FlexItem>


        </Flex>
        {/* Page tabs */}
      </PageSection>
      <PageSection
        type="tabs"
        variant={PageSectionVariants.light}
        isWidthLimited
      >
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          usePageInsets
          id="open-tabs-example-tabs-list"
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Details</TabTitleText>}
            tabContentId={`tabContent${0}`}
          />
          <Tab
            eventKey={1}
            title={<TabTitleText>Clusters</TabTitleText>}
            tabContentId={`tabContent${1}`}
          />
        </Tabs>
      </PageSection>
      <PageSection isWidthLimited variant={PageSectionVariants.light}>
        <TabContent
          key={0}
          eventKey={0}
          id={`tabContent${0}`}
          activeKey={activeTabKey}
          hidden={0 !== activeTabKey}
        >
          <TabContentBody>{detailsTabContent}</TabContentBody>
        </TabContent>
        <TabContent
          key={1}
          eventKey={1}
          id={`tabContent${1}`}
          activeKey={activeTabKey}
          hidden={1 !== activeTabKey}
        >
          <TabContentBody>{clustersTabContent}</TabContentBody>
        </TabContent>
      </PageSection>
    </Page>
  );
};

export default AccountDetails;
