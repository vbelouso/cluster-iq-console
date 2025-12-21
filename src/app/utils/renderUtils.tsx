import { ResultStatus } from '@app/types/types';
import { ResourceStatusApi } from '@api';
import React from 'react';
import { Label } from '@patternfly/react-core';
import {
  PendingIcon,
  OnRunningIcon,
  InfoCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

export function renderStatusLabel(labelText: string | null | undefined) {
  switch (labelText) {
    case ResourceStatusApi.Running:
      return <Label color="green">{labelText}</Label>;
    case ResourceStatusApi.Stopped:
      return <Label color="red">{labelText}</Label>;
    case ResourceStatusApi.Terminated:
      return <Label color="purple">{labelText}</Label>;
    default:
      return <Label color="grey">{labelText}</Label>;
  }
}

export const getResultIcon = (result: ResultStatus) => {
  return (
    {
      [ResultStatus.Success]: <InfoCircleIcon color="var(--pf-v5-global--success-color--100)" title="Success" />,
      [ResultStatus.Running]: <OnRunningIcon color="var(--pf-v5-global--info-color--100)" title="Running" />,
      [ResultStatus.Pending]: <PendingIcon color="var(--pf-v5-global--warning-color--100)" title="Pending" />,
      [ResultStatus.Failed]: <ExclamationTriangleIcon color="var(--pf-v5-global--danger-color--100)" title="Error" />,
      [ResultStatus.Warning]: <ExclamationCircleIcon color="var(--pf-v5-global--warning-color--100)" title="Warning" />,
    }[result] || <UnknownIcon color="gray" title="Unknown" />
  );
};
