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
import { getInstances, getInstanceByID } from "../services/api";
import { Link  } from "react-router-dom";
import { Instance, Instances, Tag } from "@app/types/types";
import { useLocation  } from "react-router-dom";
interface LabelGroupOverflowProps {
  labels: Array<Tag>;
}

const LabelGroupOverflow: React.FunctionComponent<LabelGroupOverflowProps> = ({
  labels,
}) => (
  <LabelGroup>
    {labels.map(label => (
      <Label key={label.key}>{label.key}: {label.value}</Label>
    ))}
  </LabelGroup>
);


const ServerDetails: React.FunctionComponent = () => {
  const { instanceID } = useParams();
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  const [instanceData, setInstanceData] = useState<Instances>({
    count: 0,
    instances: []
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  useEffect(() => {
    const fetchData = async () => {
      try {
          console.log("Fetching Account Clusters ", instanceID);
          const fetchedInstance = await getInstanceByID(instanceID);
          setInstanceData(fetchedInstance);
          console.log("Fetched Account Clusters data:", instanceID);
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
          Server details
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
              {instanceID}
            </DescriptionListDescription>
            <DescriptionListTerm>Cluster ID</DescriptionListTerm>
            <DescriptionListDescription>
              <Link
                to={`/clusters/${instanceData.instances[0].clusterID}`}
              >
                {instanceData.instances[0].clusterID}
              </Link>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Cloud Provider</DescriptionListTerm>
            <DescriptionListDescription>
              {instanceData.instances[0].provider}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Labels</DescriptionListTerm>
              <LabelGroupOverflow labels={instanceData.instances[0].tags} />
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Last scanned at</DescriptionListTerm>
            <DescriptionListDescription>
              {instanceData.instances[0].tags.filter(label => label.key == "LaunchTime").map(label => (
                <Label key={label.key}>{label.value}</Label>
              ))}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Created at</DescriptionListTerm>
            <DescriptionListDescription>
              {instanceData.instances[0].tags.filter(label => label.key == "LaunchTime").map(label => (
                <Label key={label.key}>{label.value}</Label>
              ))}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </FlexItem>
    </Flex>)}
    </React.Fragment>
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
            <Label color="blue">Server</Label>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {instanceID}
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
        </TabContent>
      </PageSection>
    </Page>
  );
};

export default ServerDetails;
