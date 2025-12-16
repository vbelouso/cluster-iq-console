/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Gallery,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { generateCards } from './components/CardData';
import { ProviderApi } from '@api';
import { renderContent } from './utils/cardRendererUtils.tsx';
import { useDashboardData } from './hooks/useDashboardData';
import { useEventsData } from './hooks/useEventsData';

const AggregateStatusCards: React.FunctionComponent = () => {
  const { inventoryData } = useDashboardData();
  const { events, loading: eventsLoading, error: eventsError } = useEventsData();

  if (!inventoryData) {
    return <LoadingSpinner />;
  }

  const dashboardState = {
    clustersByStatus: {
      running: inventoryData?.clusters?.running || 0,
      stopped: inventoryData?.clusters?.stopped || 0,
      terminated: inventoryData?.clusters?.archived || 0,
    },
    instancesByStatus: {
      running: inventoryData?.instances?.running || 0,
      stopped: inventoryData?.instances?.stopped || 0,
      terminated: inventoryData?.instances?.archived || 0,
    },
    clustersByProvider: {
      [ProviderApi.AWSProvider]: inventoryData.providers?.aws?.clusterCount || 0,
      [ProviderApi.GCPProvider]: inventoryData.providers?.gcp?.clusterCount || 0,
      [ProviderApi.AzureProvider]: inventoryData.providers?.azure?.clusterCount || 0,
    },
    accountsByProvider: {
      [ProviderApi.AWSProvider]: inventoryData.providers?.aws?.accountCount || 0,
      [ProviderApi.GCPProvider]: inventoryData.providers?.gcp?.accountCount || 0,
      [ProviderApi.AzureProvider]: inventoryData.providers?.azure?.accountCount || 0,
    },
    instances: (inventoryData?.instances?.running || 0) + (inventoryData?.instances?.stopped || 0),
    lastScanTimestamp: inventoryData?.scanner?.lastScanTimestamp,
  };

  const cardData = generateCards(dashboardState, events);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Overview</Text>
        </TextContent>
      </PageSection>
      <PageSection>
        <Grid hasGutter>
          {Object.entries(cardData).map(([groupName, cards], groupIndex) => (
            <GridItem key={groupIndex} span={groupName === 'activityCards' ? 12 : undefined}>
              {groupName === 'activityCards' ? (
                // Full width Activity card with double height
                <Card style={{ minHeight: '500px' }} component="div">
                  <CardTitle style={{ textAlign: 'center' }}>{cards[0].title}</CardTitle>
                  <CardBody style={{ minHeight: '450px', padding: '1rem' }}>
                    {eventsLoading ? (
                      <LoadingSpinner />
                    ) : eventsError ? (
                      <div style={{ color: 'red' }}>
                        Error: {eventsError}
                        <br />
                        <small>Check console for details</small>
                      </div>
                    ) : cards[0].customComponent ? (
                      cards[0].customComponent
                    ) : (
                      renderContent(cards[0].content, cards[0].layout, cards[0].totalCount)
                    )}
                  </CardBody>
                </Card>
              ) : (
                // Regular cards in Gallery
                <Gallery
                  hasGutter
                  style={
                    {
                      '--pf-v5-l-gallery--GridTemplateColumns--min': '30%',
                    } as any
                  }
                >
                  {cards.map((card, cardIndex) => (
                    <Card style={{ textAlign: 'center' }} key={`${groupIndex}${cardIndex}`} component="div">
                      <CardTitle>{card.title}</CardTitle>
                      <CardBody>{renderContent(card.content, card.layout, card.totalCount)}</CardBody>
                    </Card>
                  ))}
                </Gallery>
              )}
            </GridItem>
          ))}
        </Grid>
      </PageSection>
    </React.Fragment>
  );
};

export default AggregateStatusCards;
