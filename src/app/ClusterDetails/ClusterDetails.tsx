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
import { Table, Tbody, Td, Th, Thead, Tr, ThProps } from "@patternfly/react-table";
import { getCluster, getClusterInstances, getClusterTags } from "../services/api";
import { ClusterData, Instance, Tag, TagData } from "@app/types/types";
import { Link, useLocation  } from "react-router-dom";
interface LabelGroupOverflowProps {
  labels: Array<Tag>;
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
    {labels.map(label => (
      <Label key={label.key}>{label.key}: {label.value}</Label>
    ))}
  </LabelGroup>
);

const AggregateInstancesPerCluster: React.FunctionComponent = () => {
  const [data, setData] = useState<Instance[] | []>([]);
  const [loading, setLoading] = useState(true);
  const { clusterID } = useParams();
  const { accountName } = useParams();


  useEffect(() => {
    const fetchData = async () => {
      try {
          console.log("Fetching data...");
          const fetchedInstancesPerCluster = await getClusterInstances(accountName,clusterID);
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

  //### Sorting ###
  // Index of the currently active column
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | undefined>(0);
  // sort direction of the currently active column
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | undefined>('asc');
  // sort dropdown expansion
  const getSortableRowValues = (instance: Instance): (string | number | null)[] => {
    const { id, name, availabilityZone, instanceType, state, clusterID, provider } = instance;
    return [id, name, availabilityZone, instanceType, state, clusterID, provider];
  };

  // Sorting
  let sortedData = data;
  if (typeof activeSortIndex === 'number' && activeSortIndex !== null) {
    sortedData = data.sort((a, b) => {
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

  // set table column properties
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
        <Table aria-label="Simple table">
          <Thead>
            <Tr>
              <Th sort={getSortParams(0)}>ID</Th>
              <Th sort={getSortParams(1)}>Name</Th>
              <Th sort={getSortParams(3)}>Type</Th>
              <Th sort={getSortParams(2)}>AvailabilityZone</Th>
              <Th sort={getSortParams(4)}>State</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.map((instance) => (
              <Tr key={instance.id}>
                <Td dataLabel={instance.id}>
                  <Link
                    to={`/servers/${instance.id}`}
                  >
                    {instance.id}
                  </Link>
                </Td>
                <Td>{instance.name}</Td>
                <Td>{instance.instanceType}</Td>
                <Td>{instance.availabilityZone}</Td>
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
  const { clusterID } = useParams();
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  const [tags, setTagData] = useState<TagData>({
    count: 0,
    tags: []
  });
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
          const fetchedCluster = await getCluster(clusterID);
          setClusterData(fetchedCluster);
          const fetchedTags = await getClusterTags(clusterID);
          setTagData(fetchedTags);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterTagsByKey = (key) => {
    const result = tags.tags.filter(tags => tags.key == key)
    if(result[0] !== undefined && result[0] != null){
      return result[0].value
    }
    return "unknown"
  }

  const ownerTag = filterTagsByKey("Owner");
  const partnerTag = filterTagsByKey("Partner");

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
              {clusterID}
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
              <LabelGroupOverflow labels={tags.tags} />
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
              {cluster.clusters[0].lastScanTimestamp || "unknown"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Region</DescriptionListTerm>
            <DescriptionListDescription>
              {cluster.clusters[0].region || "unknown"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Created at</DescriptionListTerm>
            <DescriptionListDescription>
              <time>Oct 15, 1:51 pm</time>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Owner</DescriptionListTerm>
            <DescriptionListDescription>
              {ownerTag}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Partner</DescriptionListTerm>
            <DescriptionListDescription>
              {partnerTag}
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
            <Label color="blue">Cluster</Label>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {clusterID}
            </Title>
          </FlexItem>
          <FlexItem flex={{ default: "flexNone" }}>
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
