/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { CardLayout } from '@app/Overview/types.ts';
import { RenderSingleIcon, RenderMultiIcon, RenderWithSubtitle } from '../components/CardRenderer';

export const renderContent = (content: any[], layout: CardLayout) => {
  switch (layout) {
    case CardLayout.SINGLE_ICON:
      return <RenderSingleIcon content={content} />;
    case CardLayout.MULTI_ICON:
      return <RenderMultiIcon content={content} />;
    case CardLayout.WITH_SUBTITLE:
      return <RenderWithSubtitle content={content} />;
  }
};
