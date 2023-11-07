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
import { getCluster, getClusterInstances } from "../services/api";
import { ClusterData, Instance } from "@app/types/types";
import { useLocation  } from "react-router-dom";
interface LabelGroupOverflowProps {
  labels: {
    text: string;
  }[];
}

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

const LabelGroupOverflow: React.FunctionComponent<LabelGroupOverflowProps> = ({
  labels,
}) => (
  <LabelGroup>
    {labels.map((label, index) => (
      <Label key={index}>{label.text}</Label>
    ))}
  </LabelGroup>
);

const AggregateInstancesPerCluster: React.FunctionComponent = () => {
  const [data, setData] = useState<Instance[] | []>([]);
  const [loading, setLoading] = useState(true);
  const { clusterName } = useParams();
  const { accountName } = useParams();


  useEffect(() => {
    const fetchData = async () => {
      try {
          console.log("Fetching data...");
          const fetchedInstancesPerCluster = await getClusterInstances(accountName,clusterName);
          console.log("Fetched data:", fetchedInstancesPerCluster);
          setData(fetchedInstancesPerCluster);
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
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Region</Th>
              <Th>State</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((instance) => (
              <Tr key={instance.id}>
                <Td>{instance.id}</Td>
                <Td>{instance.name}</Td>
                <Td>{instance.instanceType}</Td>
                <Td>{instance.region}</Td>
                <Td dataLabel={instance.state}>
                  {renderLabel(instance.state)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </React.Fragment>
  );
};

const ClusterDetails: React.FunctionComponent = () => {
  const { clusterName } = useParams();
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  const [cluster, setClusterData] = useState<ClusterData>({
    count: 0,
    clusters: []
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clusterStatus = queryParams.get('status');
  useEffect(() => {
    const fetchData = async () => {
      try {
          const fetchedCluster = await getCluster(clusterName);
          setClusterData(fetchedCluster);
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
              {cluster.clusters[0].name}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Web console</DescriptionListTerm>
            <DescriptionListDescription>
                <a href={cluster.clusters[0].consoleLink} target="_blank" rel="noopener noreferrer">Console</a>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Cloud Provider</DescriptionListTerm>
            <DescriptionListDescription>
              {cluster.clusters[0].provider}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Labels</DescriptionListTerm>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Account</DescriptionListTerm>
            <DescriptionListDescription>
              {cluster.clusters[0].accountName || "unknown"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Last scanned at</DescriptionListTerm>
            <DescriptionListDescription>
              <time>Oct 15, 1:51 pm</time>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Region</DescriptionListTerm>
            <DescriptionListDescription>
              {cluster.clusters[0].region}
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



  const serversTabContent = (
    <TabContentBody>
      <AggregateInstancesPerCluster />
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
              {/* {cluster.clusters[0].name} */}
            </Title>
          </FlexItem>
          <FlexItem flex={{ default: "flexNone" }}>
            {renderLabel(clusterStatus)}
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
            title={<TabTitleText>Servers</TabTitleText>}
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
          <TabContentBody>{serversTabContent}</TabContentBody>
        </TabContent>
      </PageSection>
    </Page>
  );
};

export default ClusterDetails;
