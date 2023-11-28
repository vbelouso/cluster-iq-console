import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  Flex,
  FlexItem,
  Gallery,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Stack,
  Spinner,
  TextContent,
  Text,
} from "@patternfly/react-core";
import CheckCircleIcon from "@patternfly/react-icons/dist/js/icons/check-circle-icon";
import { CloudIcon, AwsIcon, AzureIcon, ErrorCircleOIcon, WarningTriangleIcon } from "@patternfly/react-icons";
import { getClusters, getAccounts, getInstances, getAccountClusters } from "../services/api";
import { ClusterData, ClusterPerCP, Instances } from '../types/types';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AggregateStatusCards: React.FunctionComponent = () => {
  const [clusterData, setClusterData] = useState<ClusterData | null>(null);
  const [clusterPerCP, setClusterPerCP] = useState<ClusterPerCP | null>(null);
  const [instances, setInstances] = useState<Instances | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedClusters = await getClusters();
        setClusterData(fetchedClusters);
        
        const fetchedAccounts = await getAccounts();
        setClusterPerCP(fetchedAccounts);

        const fetchedInstances = await getInstances();
        setInstances(fetchedInstances)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!clusterData || !clusterPerCP || !instances) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spinner aria-label="Loading data" />
        </div>
      );
  }

  const activeClusters = clusterData.clusters.filter(cluster => cluster.status === "Running").length;
  const inactiveClusters = clusterData.clusters.filter(cluster => cluster.status === "Stopped").length;
  const unknownStatusClusters = clusterData.clusters.filter(cluster => cluster.status === "Unknown").length;

  const clusterCounts = {};
  clusterPerCP.accounts.forEach(account => {
    const provider = account.provider;
    //const clusterCount = Object.keys(account.clusters).length;
    const clusterCount = account.clusterCount
    clusterCounts[provider] = (clusterCounts[provider] || 0) + clusterCount;
  });

  // to-do instead of static structure of page content make it dynamic (lets saywe add tomorrow IBM cloud, we dont need to change the FE)
    const cardData = {
      clusters: [
        {
          title: "Clusters",
          content: [
            {
              icon: (
                <CheckCircleIcon color="var(--pf-v5-global--success-color--100)" />
              ),
              count: activeClusters,
              ref: "/clusters?status=Running",
            },
            {
              icon: (
                <ErrorCircleOIcon color="var(--pf-v5-global--danger-color--100)" />
              ),
              count: inactiveClusters,
              ref: "/clusters?status=Stopped",
            },
            {
              icon: (
                <WarningTriangleIcon color="var(--pf-v5-global--warning-color--100)" />
              ),
              count: unknownStatusClusters,
              ref: "/clusters?status=Unknown",
            },
          ],
          layout: "multiIcon",
        },
            {
          title: "Servers",
          content: [
            {
              count: instances.count
            },
          ],
          layout: "multiIcon",
        },
        {
          title: "Scanners",
          content: [
            {
              count: 1
            },
          ],
          layout: "multiIcon",
        },

      ],
      clustersPerProvider: [
        {
          title: "AWS Clusters",
          content: [
            {
              count: clusterCounts["AWS"] || 0,
              icon: (
                <AwsIcon color="var(--pf-v5-global--danger-color--100)" />
              ),
              ref: "/clusters?provider=AWS",
            },
          ],
          layout: "multiIcon",
        },
        {
          title: "GCP Clusters",
          content: [
            {
              count: clusterCounts["GCP"] || 0,
              icon: (
                <CloudIcon color="var(--pf-v5-global--danger-color--100)" />
              ),
              ref: "/clusters?provider=GCP",
            },
          ],
          layout: "multiIcon",
        },
        {
          title: "Azure Clusters",
          content: [
            {
              count: clusterCounts["Azure"] || 0,
              icon: (
                <AzureIcon color="var(--pf-v5-global--danger-color--100)" />
              ),
              ref: "/clusters?provider=Azure",
            },
          ],
          layout: "multiIcon",
        }
      ],
      accountsPerProvider: [
        {
          title: "AWS Accounts",
          content: [
            {
              count: clusterCounts["AWS"] || 0,
              icon: (
                <AwsIcon color="var(--pf-v5-global--danger-color--100)" />
              ),
              ref: "/accounts?provider=AWS",
            },
          ],
          layout: "multiIcon",
        },
        {
          title: "GCP accounts",
          content: [
            {
              count: clusterCounts["GCP"] || 0,
              icon: (
                <CloudIcon color="var(--pf-v5-global--danger-color--100)" />
              ),
              ref: "/accounts?provider=GCP",
            },
          ],
          layout: "multiIcon",
        },
        {
          title: "Azure accounts",
          content: [
            {
              count: clusterCounts["Azure"] || 0,
              icon: (
                <AzureIcon color="var(--pf-v5-global--danger-color--100)" />
              ),
              ref: "/accounts?provider=Azure",
            },
          ],
          layout: "multiIcon",
        }
      ],


    };

    
    const renderContent = (title: string, content: any[], layout: string) => {
    if (layout === "icon") {
      return content[0].icon;
    }
    if (layout === "multiIcon") {
      return (
        <Flex display={{ default: "inlineFlex" }}>
          {content.map(({ icon, count, ref }, index: number) => (
            <React.Fragment key={index}>
              <Flex spaceItems={{ default: "spaceItemsSm" }}>
                <FlexItem>{icon}</FlexItem>
                <FlexItem>
                  <a href={ref}>{count}</a>
                </FlexItem>
              </Flex>
              {content.length > 1 && index < content.length -1 && (
                <Divider
                  key={`${index}_d`}
                  orientation={{
                    default: "vertical",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Flex>
      );
    }
    if (layout === "withSubtitle") {
      return (
        <Flex justifyContent={{ default: "justifyContentSpaceAround" }}>
          {content.map(({ icon, status, subtitle }, index) => (
            <Flex key={index}>
              <FlexItem>{icon}</FlexItem>
              <Stack>
                <a href="#">{status}</a>
                <span>{subtitle}</span>
              </Stack>
            </Flex>
          ))}
        </Flex>
      );
    }
  };
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Overview</Text>
        </TextContent>
      </PageSection>
      <PageSection>
        <Grid hasGutter>
          {Object.keys(cardData).map((cardGroup, groupIndex) => {
            let galleryWidth;
            let cardAlign;
            let titleAlign;
            if (cardGroup === "withSubtitle") {
              galleryWidth = "260px";
              cardAlign = "";
              titleAlign = "center";
            } else {
              cardAlign = "center";
            }
            return (
              <GridItem key={groupIndex}>
                <Gallery
                  hasGutter
                  style={
                    {
                      "--pf-v5-l-gallery--GridTemplateColumns--min":
                        galleryWidth,
                    } as any
                  }
                >
                  {cardData[cardGroup].map(
                    ({ title, content, layout }, cardIndex) => (
                      <Card
                        style={{ textAlign: cardAlign }}
                        key={`${groupIndex}${cardIndex}`}
                        component="div"
                      >
                        <CardTitle style={{ textAlign: titleAlign }}>
                          {title}
                        </CardTitle>
                        <CardBody>{renderContent(title, content, layout)}</CardBody>
                      </Card>
                    )
                  )}
                </Gallery>
              </GridItem>
            );
          })}
        </Grid>
      </PageSection>
    </React.Fragment>
  );
};

export default AggregateStatusCards;
