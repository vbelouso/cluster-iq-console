import React from 'react';
import { PageSection, PageSectionVariants, Panel, Text, TextContent } from '@patternfly/react-core';
import AuditLogsTableToolbar from '@app/Observe/AuditLogs/AuditLogsTableToolbar.tsx';
import { parseAsArrayOf, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { ClusterActions, ResultStatus } from '@app/types/types.tsx';
import { ProviderApi } from '@api';
import { AuditLogsTable } from '@app/Observe/AuditLogs/AuditLogsTable.tsx';

const filterParams = {
  accountName: parseAsString.withDefault(''),
  action: parseAsArrayOf(parseAsStringEnum<ClusterActions>(Object.values(ClusterActions))).withDefault([]),
  provider: parseAsArrayOf(parseAsStringEnum<ProviderApi>(Object.values(ProviderApi))).withDefault([]),
  result: parseAsArrayOf(parseAsStringEnum<ResultStatus>(Object.values(ResultStatus))).withDefault([]),
  triggered_by: parseAsString.withDefault(''),
};

const AuditLogs: React.FunctionComponent = () => {
  const [{ accountName, action, provider, result, triggered_by }, setQuery] = useQueryStates(filterParams);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Audit logs</Text>
        </TextContent>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Panel>
          <AuditLogsTableToolbar
            searchValue={accountName}
            setSearchValue={value => setQuery({ accountName: value })}
            action={action}
            setAction={value => setQuery({ action: value || [] })}
            result={result}
            setResult={value => setQuery({ result: value })}
            triggered_by={triggered_by}
            setTriggeredBy={value => setQuery({ triggered_by: value })}
            providerSelections={provider}
            setProviderSelections={value => setQuery({ provider: value || [] })}
          />
          <AuditLogsTable
            accountName={accountName}
            action={action}
            provider={provider}
            result={result}
            triggered_by={triggered_by}
          />
        </Panel>
      </PageSection>
    </React.Fragment>
  );
};

export default AuditLogs;
